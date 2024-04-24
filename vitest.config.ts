import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    unstubEnvs: true,
    sequence: {
      concurrent: false,
    },
  },
})
