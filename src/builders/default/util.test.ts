import { type Dirent } from 'node:fs'
import { mkdir, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { getSystemErrorName } from 'node:util'
import { vi } from 'vitest'

export const tmpDirPattern = /^go-wasm-.{6}$/
export function isTempDir(file: Dirent) {
  return file.isDirectory() && file.name.match(tmpDirPattern)
}

export async function cleanupTempDir(dir: string) {
  let files: Dirent[]
  try {
    files = await readdir(dir, { withFileTypes: true })
  } catch (e) {
    if (getSystemErrorName(e.errno) == 'ENOENT') return
    throw e
  }

  await Promise.all(
    files.map((file) =>
      isTempDir(file)
        ? rm(join(dir, file.name), {
            recursive: true,
            force: true,
          })
        : null
    )
  ).catch(console.error)
}

export async function snapshotTempDir(dir: string) {
  const files = await readdir(dir, { withFileTypes: true })
  return files.filter(isTempDir)
}

export async function stubTempDir(dir: string) {
  vi.stubEnv('TEMP', dir)
  vi.stubEnv('TMP', dir)
  vi.stubEnv('TMPDIR', dir)

  await mkdir(dir, { recursive: true }).catch(ignoreExist)
}

export function ignoreExist(e: any) {
  if (getSystemErrorName(e.errno) == 'EEXIST') return
  throw e
}
