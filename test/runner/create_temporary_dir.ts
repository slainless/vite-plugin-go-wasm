import { stdin, stdout } from 'process'
import { createTempDir } from '../../src/builders/default/temp_dir'
import { sleep } from '../util'

await sleep(200)
await createTempDir()
stdout.write('temp_dir_created')
await new Promise<void>((res, rej) => {
  stdin.on('data', (data) => {
    const signal = data.toString('utf-8')
    switch (signal) {
      case 'test_done':
        process.exit()
      case 'throw_error':
        throw new Error('Be uncaught!')
    }
  })
})
