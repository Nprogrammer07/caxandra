import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],   // solo tests unitarios dentro de src
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
  },
})