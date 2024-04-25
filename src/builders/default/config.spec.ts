import { assert, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { resolveOptions } from './config'
import { afterEach } from 'node:test'
import {
  cleanupTempDir,
  snapshotTempDir,
  stubTempDir,
  tmpDirPattern,
} from './util.test'
import { mkdir, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { getSystemErrorName } from 'node:util'

const goRootStub = '/test/path/to/go'
const tempDirStub = './test/tmp/default-builders-config-test'

describe('Option resolving', () => {
  beforeAll(async () => {
    await stubTempDir(tempDirStub)
  })
  beforeAll(cleanupTempDir)

  beforeEach(() => {
    vi.stubEnv('GOROOT', goRootStub)
  })
  beforeEach(cleanupTempDir)

  afterEach(vi.unstubAllEnvs)

  it('resolves options.binaryPath correctly', async () => {
    expect(await resolveOptions({ binaryPath: 'a path' }))
      .to.have.property('binaryPath')
      .that.is.equal('a path')
  })

  it('resolves options.binaryPath to GOROOT fallback path if its empty', async () => {
    expect(process.env.GOROOT).to.be.equal(goRootStub)
    expect(await resolveOptions())
      .to.have.property('binaryPath')
      .that.is.equal(`${goRootStub}/bin/go`)
  })

  it('throws error when both process.env.GOROOT and options.binaryPath are empty', async () => {
    vi.unstubAllEnvs()
    expect.assertions(2)
    try {
      await resolveOptions()
      assert.fail(`Should have thrown error`)
    } catch (e) {
      expect(e).to.be.instanceOf(Error)
      expect(e?.toString()).toContain('Cannot determine builder binary')
    }
  })

  it('resolves options.buildDir correctly', async () => {
    expect(await resolveOptions({ buildDir: 'a path' }))
      .to.have.property('buildDir')
      .that.is.equal('a path')
  })

  it('creates temporary directory if options.buildDir is empty', async () => {
    await cleanupTempDir()

    const now = Date.now()
    try {
      await resolveOptions()
    } catch (e) {
      assert.fail(`Should resolve options, instead got: ${e}`)
    }

    const snapshot = await snapshotTempDir()
    expect(snapshot)
      .to.be.lengthOf(1)
      .and.have.property('0')
      .that.exist.and.have.property('name')
      .that.match(tmpDirPattern)

    const stats = await stat(join(tmpdir(), snapshot[0].name))
    expect(stats.ctimeMs).to.be.greaterThan(now)
  })
})
