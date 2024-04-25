import { defineConfig } from 'vitest/config'

const exclude = [
  '**/node_modules/**',
  '**/dist/**',
  '**/cypress/**',
  '**/.{idea,git,cache,output,temp}/**',
  '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
  '**/*.test.*',
]
export default defineConfig({
  test: {
    sequence: {
      concurrent: false,
    },
    exclude,
    coverage: {
      exclude,
    },
  },
})
