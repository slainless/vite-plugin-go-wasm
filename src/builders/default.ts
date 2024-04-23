import { Builder } from '../interface'
import { extname, join, relative } from 'node:path'
import { config } from 'node:process'
import { execFile } from 'node:child_process'
import { DefaultBuilderOptions, resolveOptions } from './default/config'
import { readFile } from 'node:fs/promises'

export { DefaultBuilderOptions } from './default/config'

export function defaultBuilder(options?: DefaultBuilderOptions): Builder {
  let opts: Required<DefaultBuilderOptions>

  return {
    async buildStart(viteConfig) {
      opts = await resolveOptions(options)
    },
    async build(id, viteConfig) {
      // where to put the build output
      const outputPath = join(
        opts.buildDir,
        relative(process.cwd(), id.replace(extname(id), '') + '.wasm')
      )
      const result = execFile(
        opts.binaryPath,
        ['build', ...opts.commandExtraArgs, '-o', outputPath, id],
        {
          cwd: process.cwd(),
          env: {
            GOPATH: process.env.GOPATH,
            GOROOT: process.env.GOROOT,
            GOCACHE: join(opts.buildDir, '.gocache'),
            GOOS: 'js',
            GOARCH: 'wasm',
          },
        },
        (err, stdout, stderr) => {
          if (err != null) {
            throw err
          }

          if (stdout != '') {
            viteConfig.logger.info(stdout)
          }

          if (stderr != '') {
            viteConfig.logger.error(stderr)
          }
        }
      )

      return new Promise((resolve, reject) => {
        result.once('exit', (code, _) => {
          if (code !== 0) {
            return reject(new Error(`builder exit with code: ${code}`))
          }
          resolve(outputPath)
        })

        result.once('error', (err) => {
          reject(err)
        })
      })
    },
  }
}
