import { type Dirent } from 'node:fs'
import { readdir, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, join } from 'node:path'
import {
  afterEach,
  assert,
  beforeEach,
  describe,
  expect,
  it,
  onTestFailed,
  onTestFinished,
} from 'vitest'
import { createTempDir } from './temp_dir'
import { promisify } from 'node:util'
import { ChildProcess, exec } from 'node:child_process'
import { sleep } from '../../../test/util'

export const tmpDirPattern = /^go-wasm-.{6}$/

const promisifiedExec = promisify(exec)

export function isTempDir(file: Dirent) {
  return file.isDirectory() && file.name.match(tmpDirPattern)
}

export async function cleanupTempDir() {
  const baseDir = tmpdir()
  const files = await readdir(baseDir, { withFileTypes: true })

  await Promise.all(
    files.map((file) =>
      isTempDir(file)
        ? rm(join(baseDir, file.name), {
            recursive: true,
            force: true,
          })
        : null
    )
  ).catch(console.error)
}

export async function snapshotTempDir() {
  const files = await readdir(tmpdir(), { withFileTypes: true })
  return files.filter(isTempDir)
}

describe('Temporary directory creation', () => {
  beforeEach(cleanupTempDir)

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
