import exitHook from 'exit-hook'
import { mkdtemp } from 'node:fs/promises'
import { rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, join } from 'node:path'
import type { ResolvedConfig } from 'vite'

function removeTempDirSync(dir: string) {
  if (basename(dir).match(/^go-wasm-.{6}$/)) {
    rmSync(dir, {
      recursive: true,
      force: true,
    })
  }
}

export async function createTempDir() {
  const p = await mkdtemp(join(tmpdir(), 'go-wasm-'))
  exitHook(() => {
    removeTempDirSync(p)
  })
  return p
}
