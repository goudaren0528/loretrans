import { chromium, FullConfig } from '@playwright/test'

async function globalTeardown(config: FullConfig) {
  const { baseURL } = config.projects[0].use
  
  // Launch browser for cleanup
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  try {
    console.log('Cleaning up test data...')
    
    // Clean up test user
    await cleanupTestUser(page)
    
    // Clean up test data
    await cleanupTestData(page)
    
    console.log('Global teardown completed')
    
  } catch (error) {
    console.error('Global teardown failed:', error)
    // Don't throw error to avoid failing the test suite
  } finally {
    await browser.close()
  }
}

async function cleanupTestUser(page: any) {
  try {
    await page.request.delete('/api/test/cleanup-user', {
      data: {
        email: 'test@example.com',
      },
    })
    console.log('Test user cleaned up')
  } catch (error) {
    console.log('Test user cleanup skipped')
  }
}

async function cleanupTestData(page: any) {
  try {
    await page.request.delete('/api/test/cleanup-data')
    console.log('Test data cleaned up')
  } catch (error) {
    console.log('Test data cleanup skipped')
  }
}

export default globalTeardown
