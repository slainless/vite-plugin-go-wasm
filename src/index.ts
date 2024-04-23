import type { PluginOption, ResolvedConfig } from 'vite'
import { extname } from 'node:path'

import type { Builder, Transformer } from './interface'
import { defaultBuilder } from './builders'
import { defaultTransformer } from './transformers'

export * from './interface'
export { defaultBuilder } from './builders'
export { defaultTransformer } from './transformers'

export interface Config {
  builder?: Builder
  transformer?: Transformer
}

export default (config?: Config) => {
  let cfg: ResolvedConfig

  const builder = config?.builder ?? defaultBuilder()
  const transformer = config?.transformer ?? defaultTransformer()

  return {
    name: 'go-wasm' as const,
    configResolved(c: any) {
      cfg = c
    },
    async buildStart() {
      try {
        await Promise.all([
          builder.buildStart.call(this, cfg),
          transformer.buildStart.call(this, cfg),
        ])
      } catch (e) {
        this.error(`Failed to initiate builder/transformer: ${e}`)
      }
    },
    async resolveId(source) {
      if (source == transformer.wasmExecVirtualPath) {
        return `\0${transformer.wasmExecVirtualPath}`
      }
    },
    async load(id) {
      if (id === `\0${transformer.wasmExecVirtualPath}`)
        return transformer.loadWasmExec.call(this, cfg)

      if (extname(id) !== '.go') return

      return {
        code: '',
      }
    },
    async transform(_, id) {
      if (extname(id) !== '.go') return

      const source = await builder.build.call(this, id, cfg)
      return transformer.transform.call(this, source, id, cfg)
    },
  } satisfies PluginOption
}
