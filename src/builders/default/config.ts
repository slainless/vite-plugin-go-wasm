import { join } from 'node:path/posix'
import { createTempDir } from './temp_dir'
import { stat } from 'node:fs/promises'
import { Code, GoWasmError } from '../../error'

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
      throw new GoWasmError(
        `Cannot determine builder binary. Either set binaryPath or environment variable GOROOT`,
        Code.UNSET_BINARY_PATH
      )
    else {
      binaryPath = join(process.env.GOROOT, 'bin', 'go')
      if (process.platform == 'win32') binaryPath += '.exe'
    }
  else binaryPath = options.binaryPath

  try {
    await stat(binaryPath)
  } catch (e: any) {
    throw new AggregateError([
      new GoWasmError(`Failed to read Go binary`, Code.BINARY_READ_FAILED),
      e,
    ])
  }

  if (options?.buildDir == null) buildDir = await createTempDir()
  else buildDir = options.buildDir

  return {
    buildDir,
    binaryPath,
    commandExtraArgs: options?.commandExtraArgs ?? [],
  }
}
