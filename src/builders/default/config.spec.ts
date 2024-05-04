import {
  afterAll,
  assert,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  onTestFinished,
  vi,
} from 'vitest'
import { resolveOptions } from './config'
import { afterEach } from 'node:test'
import {
  cleanupTempDir,
  snapshotTempDir,
  stubTempDir,
  tmpDirPattern,
} from './util.test'
import { rm, stat } from 'node:fs/promises'
import { join, normalize } from 'node:path'
import { tmpdir } from 'node:os'
import { Code, GoWasmError } from '../../error'

const baseTempDir = join(process.env.PATH_TEMP_DIR!, 'default_builders_config')

const goBinaryPathStub =
  `${process.env.PATH_GOROOT!}/bin/go` +
  (process.platform == 'win32' ? '.exe' : '')

beforeAll(() => cleanupTempDir(baseTempDir))
afterAll(() => rm(baseTempDir, { force: true, recursive: true }))
afterAll(() => {
  vi.unstubAllEnvs()
})

beforeEach(async () => {
  vi.stubEnv('GOROOT', process.env.PATH_GOROOT!)
  await stubTempDir(baseTempDir)
  await cleanupTempDir(baseTempDir)
})

describe('Option resolving', () => {
  it('resolves options.binaryPath correctly', async () => {
    expect(await resolveOptions({ binaryPath: goBinaryPathStub }))
      .to.have.property('binaryPath')
      .that.is.equal(goBinaryPathStub)
  })

  it(`throws error when file the binaryPath points to doesn't exist`, async () => {
    expect.assertions(1)
    try {
      await resolveOptions({ binaryPath: 'go to hell' })
    } catch (e) {
      expect(e)
        // @ts-expect-error
        .to.be.instanceOf(AggregateError)
        .and.has.property('errors')
        .that.has.property('0')
        .which.is.an.instanceOf(GoWasmError)
        .and.has.property('code')
        .that.is.equal(Code.BINARY_READ_FAILED)
    }
  })

  it('resolves options.binaryPath to GOROOT fallback path if its empty', async () => {
    expect(process.env.GOROOT).to.be.equal(process.env.PATH_GOROOT)
    expect(await resolveOptions())
      .to.have.property('binaryPath')
      .that.is.equal(goBinaryPathStub)
  })

  it('throws error when both process.env.GOROOT and options.binaryPath are empty', async () => {
    vi.unstubAllEnvs()
    expect.assertions(1)
    try {
      await resolveOptions()
    } catch (e) {
      expect(e)
        .to.be.instanceOf(GoWasmError)
        .and.has.property('code')
        .that.is.equal(Code.UNSET_BINARY_PATH)
    }
  })

  it('normalize binary extension correctly when depends on GOROOT (specifically for Windows user)', async () => {
    onTestFinished(() => {
      vi.unstubAllGlobals()
    })
    const base = goBinaryPathStub.split('.').slice(0, -1).join('.')
    const platform = process.platform
    assert.include(
      ['win32', 'linux', 'darwin'],
      platform,
      'Test should be ran on supported OS: Windows, Linux, Darwin'
    )

    // should success
    vi.stubGlobal('process', {
      ...process,
      platform,
    })
    expect(await resolveOptions())
      .to.have.property('binaryPath')
      .that.is.equal(base + (platform == 'win32' ? '.exe' : ''))

    // should throw error since cross-platform and using wrong extension...
    vi.stubGlobal('process', {
      ...process,
      platform: platform == 'win32' ? 'linux' : 'win32',
    })
    try {
      await resolveOptions()
    } catch (e) {
      expect(e)
        // @ts-expect-error
        .to.be.an.instanceOf(AggregateError)
        .and.has.property('errors')

      expect(e.errors)
        .to.has.property('0')
        .which.is.an.instanceOf(GoWasmError)
        .and.has.property('code')
        .that.is.equal(Code.BINARY_READ_FAILED)

      expect(e.errors)
        .to.has.property('1')
        .which.is.an.instanceOf(Error)
        .and.has.property('path')
        .that.is.equal(normalize(join(process.cwd(), base)))
    }
  })

  it('resolves options.buildDir correctly', async () => {
    expect(await resolveOptions({ buildDir: 'a path' }))
      .to.have.property('buildDir')
      .that.is.equal('a path')
  })

  it('creates temporary directory if options.buildDir is empty', async () => {
    const now = Date.now()
    try {
      await resolveOptions()
    } catch (e) {
      assert.fail(`Should resolve options, instead got: ${e}`)
    }

    const snapshot = await snapshotTempDir(baseTempDir)
    expect(snapshot)
      .to.be.lengthOf(1)
      .and.have.property('0')
      .that.exist.and.have.property('name')
      .that.match(tmpDirPattern)

    const stats = await stat(join(tmpdir(), snapshot[0].name))
    expect(stats.ctimeMs).to.be.greaterThan(now)
  })
})
