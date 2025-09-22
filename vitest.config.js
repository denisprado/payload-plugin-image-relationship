import path from 'path'
import { loadEnv } from 'payload/node'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vitest/config'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default defineConfig(() => {
  loadEnv(path.resolve(dirname, './dev'))
  process.env.PAYLOAD_SECRET = process.env.PAYLOAD_SECRET || 'bb4a6482db6994d6c91b3e6d6427080e408f9d687b5c22cfcbc2addadc8d6fcd';

  return {
    plugins: [
    ],
    resolve: {
      alias: {
        '@payload-config': path.resolve(dirname, './dev/payload.config.ts'),
      },
    },
    test: {
      environment: 'node',
      hookTimeout: 60_000,
      testTimeout: 30_000,
      include: ['./dev/int.spec.ts'],
    },
  }
})
