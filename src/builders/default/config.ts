import { join } from 'node:path'
import { createTempDir } from './temp_dir'

export interface DefaultBuilderOptions {
  buildDir?: string
  binaryPath?: string
  commandExtraArgs?: string[]
}

export async function resolveOptions(
  options?: DefaultBuilderOptions
): Promise<Required<DefaultBuilderOptions>> {
  let buildDir, binaryPath: string
  if (options?.binaryPath == null)
    if (process.env.GOROOT == null)
      throw new Error(
        'Cannot determine builder binary. Either set binaryPath or environment variable GOROOT'
      )
    else binaryPath = join(process.env.GOROOT, 'bin', 'go')
  else binaryPath = options.binaryPath

  if (options?.buildDir == null) buildDir = await createTempDir()
  else buildDir = options.buildDir

  return {
    buildDir,
    binaryPath,
    commandExtraArgs: options?.commandExtraArgs ?? [],
  }
}
