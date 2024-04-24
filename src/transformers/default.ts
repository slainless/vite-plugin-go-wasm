import { basename } from 'node:path'
import type { Transformer } from '../interface'
import { readFile } from 'node:fs/promises'
import {
  type DefaultTransformerOptions,
  resolveOptions,
} from './default/config'

export const DEFAULT_WASM_EXEC_VIRTUAL_PATH = 'go_wasm:wasm_exec'

export function defaultTransformer(
  options?: DefaultTransformerOptions
): Transformer {
  let opts: Required<DefaultTransformerOptions>
  let wasmExecRefId: string, goInstanceRefId: string

  return {
    wasmExecVirtualPath: DEFAULT_WASM_EXEC_VIRTUAL_PATH,
    async buildStart(viteConfig) {
      opts = await resolveOptions(options)
    },
    async loadWasmExec(viteConfig) {
      return {
        code: `${await readFile(opts.wasmExecPath, { encoding: 'utf8' })}
          const go = new Go()
          export default go
        `,
        moduleSideEffects: 'no-treeshake',
      }
    },
    async transform(source, id) {
      if (options?.outputMode == 'asset') {
        const refId = this.emitFile({
          type: 'asset',
          name: basename(id, '.go') + '.wasm',
          source: await readFile(source),
        })

        return `
          import Go from '${DEFAULT_WASM_EXEC_VIRTUAL_PATH}'

          const result = await WebAssembly.instantiateStreaming(fetch(import.meta.ROLLUP_FILE_URL_${refId}), Go.importObject)
          export default result
        `
      }

      if (options?.outputMode == 'inline') {
        return `
          import Go from '${DEFAULT_WASM_EXEC_VIRTUAL_PATH}'

          const result = await WebAssembly.instantiateStreaming(fetch('data:application/wasm;base64,${await readFile(
            source,
            { encoding: 'base64' }
          )}'), Go.importObject)
          export default result
        `
      }

      throw new TypeError(`Invalid output mode: ${options?.outputMode}`)
    },
  }
}
