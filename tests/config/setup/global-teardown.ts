import { FullConfig } from '@playwright/test'

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown...')
  
  // Cleanup any global resources here
  // For example: close database connections, cleanup test data, etc.
  
  console.log('✅ Global teardown completed')
}

export default globalTeardown 