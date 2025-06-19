import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting Playwright global setup...')
  
  // Check if the server is running
  const baseURL = config.projects[0]?.use?.baseURL || 'http://localhost:3000'
  
  try {
    // Launch a browser to check if the app is accessible
    const browser = await chromium.launch()
    const page = await browser.newPage()
    
    // Wait for the app to be ready
    await page.goto(baseURL, { waitUntil: 'networkidle' })
    
    // Check if the main elements are present
    await page.waitForSelector('nav')
    await page.waitForSelector('main')
    
    console.log('✅ Application is ready for testing')
    
    await browser.close()
  } catch (error) {
    console.error('❌ Failed to connect to application:', error)
    throw new Error(`Application not ready at ${baseURL}`)
  }
  
  console.log('✅ Playwright global setup completed')
}

export default globalSetup 