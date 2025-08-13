import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()] as any, // eslint-disable-line @typescript-eslint/no-explicit-any
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
    environmentMatchGlobs: [
      // Keep Node env for pure server tests if we add any with .server.test
      ['**/*.server.test.{ts,tsx}', 'node'],
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
    },
  },
  // Avoid loading Tailwind/PostCSS during tests to prevent plugin issues
  css: {
    postcss: {
      plugins: [],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
      '@payload-config': path.resolve(process.cwd(), 'src/payload.config.ts'),
    },
    conditions: ['browser', 'module', 'default'],
  },
})
