import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      exclude: [
        'src/server.js',
        'src/app.js',
        'src/config/**',
        'src/db.js',
        'tests/**',
        'scripts/**',
        'node_modules/**'
      ]
    },
    setupFiles: ['./tests/setup.js'],
    testTimeout: 10000
  }
})
