import { defineConfig } from 'vitest/config'

export default defineConfig(() => {
  return {
    test: {
      environment: 'node',
      hookTimeout: 60_000,
      testTimeout: 30_000,
      exclude: ['./dev/e2e.spec.ts'],
    },
  }
})
