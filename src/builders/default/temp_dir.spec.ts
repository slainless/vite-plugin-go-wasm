import { mkdir, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, join } from 'node:path'
import {
  afterEach,
  assert,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { createTempDir } from './temp_dir'
import { ChildProcess, exec } from 'node:child_process'
import { sleep } from '../../../test/util'
import {
  cleanupTempDir,
  ignoreExist,
  snapshotTempDir,
  stubTempDir,
  tmpDirPattern,
} from './util.test'

const tempDirStub = './test/tmp/default-builders-temp-dir-test'

describe('Temporary directory creation', () => {
  beforeAll(async () => {
    await stubTempDir(tempDirStub)

    return () => {
      vi.unstubAllEnvs()
    }
  })
  beforeAll(cleanupTempDir)

  afterEach(cleanupTempDir)

  it('create temporary directory correctly', async () => {
    await cleanupTempDir()

    const now = Date.now()
    let p: string
    try {
      p = await createTempDir()
    } catch (e) {
      assert.fail(`Should have successfully create temp dir, instead got: ${e}`)
    }

    const snapshot = await snapshotTempDir()
    expect(snapshot)
      .to.be.lengthOf(1)
      .and.have.property('0')
      .that.exist.and.have.property('name')
      .that.match(tmpDirPattern)
      .and.equal(basename(p))

    const stats = await stat(join(tmpdir(), snapshot[0].name))
    expect(stats.ctimeMs).to.be.greaterThan(now)
  })
})

function waitForSignal(process: ChildProcess, signal: string) {
  return new Promise<void>((res, rej) => {
    process.stdout!.on('data', (data) => {
      if (String(data) == signal) res()
    })
  })
}

describe('Temporary directory cleanup', () => {
  beforeAll(async () => {
    await stubTempDir(tempDirStub)

    return () => {
      vi.unstubAllEnvs()
    }
  })

  let startMs: number
  let viteNode: ChildProcess

  beforeEach(async () => {
    await cleanupTempDir()

    startMs = Date.now()
    if (viteNode?.exitCode == null) viteNode?.kill('SIGKILL')
    viteNode = exec('npx vite-node ./test/runner/create_temporary_dir.ts')
    assert.exists(viteNode.stdin)
    assert.exists(viteNode.stdout)
  })

  it('destroy temporary directory on normal process exit', async () => {
    await waitForSignal(viteNode, 'temp_dir_created')

    let snapshot = await snapshotTempDir()
    expect(snapshot)
      .to.be.lengthOf(1)
      .and.have.property('0')
      .that.exist.and.have.property('name')
      .that.match(tmpDirPattern)

    const stats = await stat(join(tmpdir(), snapshot[0].name))
    expect(stats.ctimeMs).to.be.greaterThan(startMs)

    viteNode.stdin!.write('test_done')
    await sleep(200)
    expect(viteNode.exitCode).to.equal(0)

    snapshot = await snapshotTempDir()
    expect(snapshot).to.be.lengthOf(0)
  })

  it('destroy temporary directory on interrupt', async () => {
    await waitForSignal(viteNode, 'temp_dir_created')

    let snapshot = await snapshotTempDir()
    expect(snapshot)
      .to.be.lengthOf(1)
      .and.have.property('0')
      .that.exist.and.have.property('name')
      .that.match(tmpDirPattern)

    const stats = await stat(join(tmpdir(), snapshot[0].name))
    expect(stats.ctimeMs).to.be.greaterThan(startMs)

    viteNode.kill('SIGINT')
    await sleep(200)
    expect(viteNode.exitCode).to.not.equal(0)

    snapshot = await snapshotTempDir()
    expect(snapshot).to.be.lengthOf(0)
  })
  it('destroy temporary directory on process crashing', async () => {
    await waitForSignal(viteNode, 'temp_dir_created')

    let snapshot = await snapshotTempDir()
    expect(snapshot)
      .to.be.lengthOf(1)
      .and.have.property('0')
      .that.exist.and.have.property('name')
      .that.match(tmpDirPattern)

    const stats = await stat(join(tmpdir(), snapshot[0].name))
    expect(stats.ctimeMs).to.be.greaterThan(startMs)

    viteNode.stdin!.write('throw_error')
    await sleep(200)
    expect(viteNode.exitCode).to.not.equal(0)

    snapshot = await snapshotTempDir()
    expect(snapshot).to.be.lengthOf(0)
  })
})

describe('Temporary directory removal implementation', () => {
  it("silently return without doing anything when basename don't match with temp dir pattern", async () => {
    await mkdir('./test/tmp/to_be_removed').catch(ignoreExist)
    // await remove
  })
})
