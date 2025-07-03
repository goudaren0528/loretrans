import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use
  
  // Launch browser for setup
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  try {
    // Wait for the application to be ready
    console.log('Waiting for application to be ready...')
    await page.goto(baseURL!)
    await page.waitForLoadState('networkidle')
    
    // Check if the application is responding
    const title = await page.title()
    console.log(`Application ready. Title: ${title}`)
    
    // Setup test user if needed
    await setupTestUser(page)
    
    // Setup test data if needed
    await setupTestData(page)
    
  } catch (error) {
    console.error('Global setup failed:', error)
    throw error
  } finally {
    await browser.close()
  }
}

async function setupTestUser(page: any) {
  // Create a test user for E2E tests
  // This would typically involve API calls to create test data
  console.log('Setting up test user...')
  
  // Example: Create test user via API
  try {
    const response = await page.request.post('/api/test/setup-user', {
      data: {
        email: 'test@example.com',
        password: 'testpassword123',
        credits: 1000,
      },
    })
    
    if (response.ok()) {
      console.log('Test user created successfully')
    }
  } catch (error) {
    console.log('Test user setup skipped (API not available)')
  }
}

async function setupTestData(page: any) {
  // Setup any required test data
  console.log('Setting up test data...')
  
  // Example: Seed database with test translations
  try {
    await page.request.post('/api/test/setup-data', {
      data: {
        translations: [
          {
            source: 'Hello world',
            target: '你好世界',
            sourceLang: 'en',
            targetLang: 'zh',
          },
        ],
      },
    })
  } catch (error) {
    console.log('Test data setup skipped')
  }
}

export default globalSetup
