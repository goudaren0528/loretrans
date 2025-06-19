import { FullConfig } from '@playwright/test'

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting Playwright global teardown...')
  
  // Cleanup any global resources here
  // For example: close database connections, cleanup test data, etc.
  
  console.log('✅ Playwright global teardown completed')
}

export default globalTeardown 