import { mkdir, rm, stat } from 'node:fs/promises'
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
  onTestFinished,
  vi,
} from 'vitest'
import { createTempDir, removeTempDirSync } from './temp_dir'
import { ChildProcess, exec } from 'node:child_process'
import { sleep } from '../../../test/util'
import {
  cleanupTempDir,
  ignoreExist,
  snapshotTempDir,
  stubTempDir,
  tmpDirPattern,
} from './util.test'

describe('Temporary directory creation', () => {
  const tempDir = './test/tmp/default-builders-temp-dir-test'
  beforeAll(async () => {
    await stubTempDir(tempDir)

    return () => {
      vi.unstubAllEnvs()
    }
  })
  beforeAll(cleanupTempDir)

  afterEach(cleanupTempDir)

  it('creates temporary directory correctly', async () => {
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
    expect(stats.ctimeMs).to.be.greaterThanOrEqual(now)
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
  const tempDir = './test/tmp/default-builders-temp-dir-test'

  beforeAll(async () => {
    await stubTempDir(tempDir)

    return () => {
      vi.unstubAllEnvs()
    }
  })

  let startMs: number
  let viteNode: ChildProcess

  beforeEach(async () => {
    await cleanupTempDir()

    startMs = Math.round(Date.now())
    if (viteNode?.exitCode == null) viteNode?.kill('SIGKILL')
    viteNode = exec('npx vite-node ./test/runner/create_temporary_dir.ts')
    assert.exists(viteNode.stdin)
    assert.exists(viteNode.stdout)
  })

  it('destroys temporary directory on normal process exit', async () => {
    await waitForSignal(viteNode, 'temp_dir_created')

    let snapshot = await snapshotTempDir()
    expect(snapshot)
      .to.be.lengthOf(1)
      .and.have.property('0')
      .that.exist.and.have.property('name')
      .that.match(tmpDirPattern)

    const stats = await stat(join(tmpdir(), snapshot[0].name))
    expect(stats.ctimeMs).to.be.greaterThanOrEqual(startMs)

    viteNode.stdin!.write('test_done')
    await sleep(200)
    expect(viteNode.exitCode).to.equal(0)

    snapshot = await snapshotTempDir()
    expect(snapshot).to.be.lengthOf(0)
  })

  it('destroys temporary directory on interrupt', async () => {
    await waitForSignal(viteNode, 'temp_dir_created')

    let snapshot = await snapshotTempDir()
    expect(snapshot)
      .to.be.lengthOf(1)
      .and.have.property('0')
      .that.exist.and.have.property('name')
      .that.match(tmpDirPattern)

    const stats = await stat(join(tmpdir(), snapshot[0].name))
    expect(stats.ctimeMs).to.be.greaterThanOrEqual(startMs)

    viteNode.kill('SIGINT')
    await sleep(200)
    expect(viteNode.exitCode).to.not.equal(0)

    snapshot = await snapshotTempDir()
    expect(snapshot).to.be.lengthOf(0)
  })

  it('destroys temporary directory on process crashing', async () => {
    await waitForSignal(viteNode, 'temp_dir_created')

    let snapshot = await snapshotTempDir()
    expect(snapshot)
      .to.be.lengthOf(1)
      .and.have.property('0')
      .that.exist.and.have.property('name')
      .that.match(tmpDirPattern)

    const stats = await stat(join(tmpdir(), snapshot[0].name))
    expect(stats.ctimeMs).to.be.greaterThanOrEqual(startMs)

    viteNode.stdin!.write('throw_error')
    await sleep(200)
    expect(viteNode.exitCode).to.not.equal(0)

    snapshot = await snapshotTempDir()
    expect(snapshot).to.be.lengthOf(0)
  })
})

describe('Temporary directory removal implementation', () => {
  it('deletes directory that match temp dir pattern correctly', async () => {
    const dir = './test/tmp/go-wasm-abcdef'

    onTestFinished(async () => {
      await rm(dir, { recursive: true, force: true })
    })

    await mkdir(dir).catch(ignoreExist)
    expect(() => removeTempDirSync(dir)).to.not.throw()
    try {
      await stat(dir)
      assert.fail('Reading the directory should throw error')
    } catch (e) {
      expect(e).to.be.instanceOf(Error).and.include({
        errno: -4058,
        code: 'ENOENT',
      })
    }
  })

  it("silently returns without doing anything when basename don't match with temp dir pattern", async () => {
    const dir = './test/tmp/go-wasm-abcd'

    onTestFinished(async () => {
      await rm(dir, { recursive: true, force: true })
    })

    await mkdir(dir).catch(ignoreExist)
    expect(() => removeTempDirSync(dir)).to.not.throw()

    try {
      await stat(dir)
    } catch (e) {
      assert.fail('Reading the directory should not throw error')
    }
  })
})
