import { join } from 'node:path'

export interface DefaultTransformerOptions {
  outputMode?: 'asset' | 'inline'
  wasmExecPath?: string
}

export async function resolveOptions(
  options?: DefaultTransformerOptions
): Promise<Required<DefaultTransformerOptions>> {
  let wasmExecPath: string
  if (options?.wasmExecPath == null)
    if (process.env.GOROOT == null)
      throw new Error(
        'Cannot determine wasm_exec path. Either set wasmExecPath or environment variable GOROOT'
      )
    else wasmExecPath = join(process.env.GOROOT, 'misc', 'wasm', 'wasm_exec.js')
  else wasmExecPath = options.wasmExecPath

  return {
    wasmExecPath,
    outputMode: options?.outputMode ?? 'asset',
  }
}
