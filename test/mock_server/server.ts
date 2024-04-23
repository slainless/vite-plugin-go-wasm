import { fileURLToPath } from 'node:url'
import { createServer as _createServer, type UserConfig } from 'vite'

export const createServer = async (config?: UserConfig) =>
  _createServer({
    ...config,
    root: fileURLToPath(new URL('.', import.meta.url)),
    configFile: false,
  })
