import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 30000,
    include: [
      'test/integration/campaigns.test.js',
      'test/integration/admin.test.js',
      'test/integration/payments.test.js',
    ],
  },
})