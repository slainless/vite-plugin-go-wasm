import exitHook from 'exit-hook'
import { mkdir, mkdtemp } from 'node:fs/promises'
import { rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, join } from 'node:path'

/**
 * @internal
 */
export function removeTempDirSync(dir: string) {
  if (basename(dir).match(/^go-wasm-.{6}$/)) {
    rmSync(dir, {
      recursive: true,
      force: true,
    })
  }
}

export async function createTempDir() {
  await mkdir(tmpdir(), { recursive: true })
  const p = await mkdtemp(join(tmpdir(), 'go-wasm-'))
  exitHook(() => {
    removeTempDirSync(p)
  })
  return p
}
