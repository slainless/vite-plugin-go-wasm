import { defineConfig } from 'vite'
import goWasm from '../src/index'

export default defineConfig({
  plugins: [goWasm()],
})
