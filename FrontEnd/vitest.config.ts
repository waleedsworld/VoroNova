import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

// Vitest configuration for VoroNova unit tests.
// Resolves the same "@/*" path alias used by the Next.js app so tests can
// import application modules exactly the way the app does.
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/unit/**/*.test.ts'],
  },
})
