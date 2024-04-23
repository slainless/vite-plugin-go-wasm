import type {
  EmittedAsset,
  LoadResult,
  MinimalPluginContext,
  TransformResult,
  PluginContext,
} from 'rollup'
import type { ResolvedConfig } from 'vite'

export interface Builder {
  buildStart(this: PluginContext, viteConfig: ResolvedConfig): Promise<void>
  build(
    this: PluginContext,
    id: string,
    viteConfig: ResolvedConfig
  ): Promise<string>
}

export interface Transformer {
  wasmExecVirtualPath: string
  buildStart(this: PluginContext, viteConfig: ResolvedConfig): Promise<void>
  loadWasmExec(
    this: PluginContext,
    viteConfig: ResolvedConfig
  ): Promise<LoadResult>
  transform(
    this: PluginContext,
    source: string,
    id: string,
    viteConfig: ResolvedConfig
  ): Promise<TransformResult>
}
