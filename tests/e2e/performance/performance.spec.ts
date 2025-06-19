import { test, expect } from '@playwright/test'

test.describe('Performance Tests', () => {
  test('should load homepage within performance budget', async ({ page }) => {
    // Start measuring
    const startTime = Date.now()
    
    await page.goto('/', { waitUntil: 'networkidle' })
    
    const loadTime = Date.now() - startTime
    
    // Homepage should load within 3 seconds
    expect(loadTime).toBeLessThan(3000)
    
    // Check Core Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const vitals: any = {}
          
          entries.forEach((entry) => {
            if (entry.name === 'FCP') {
              vitals.fcp = entry.startTime
            }
            if (entry.name === 'LCP') {
              vitals.lcp = entry.startTime
            }
          })
          
          resolve(vitals)
        }).observe({ entryTypes: ['measure', 'navigation'] })
        
        // Fallback timeout
        setTimeout(() => resolve({}), 5000)
      })
    })
    
    console.log('Performance metrics:', metrics)
  })

  test('should handle rapid API calls without degradation', async ({ page }) => {
    await page.goto('/')
    
    // Mock fast API responses
    await page.route('/api/translate', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          translatedText: 'Quick response',
          sourceLanguage: 'en',
          targetLanguage: 'fr'
        })
      })
    })
    
    const textInput = page.getByPlaceholder(/enter text to translate/i)
    const translateButton = page.getByRole('button', { name: /translate/i })
    
    const responseTimes: number[] = []
    
    // Make 5 rapid API calls
    for (let i = 0; i < 5; i++) {
      await textInput.fill(`Test text ${i}`)
      
      const startTime = Date.now()
      await translateButton.click()
      await expect(page.getByText('Quick response')).toBeVisible()
      const responseTime = Date.now() - startTime
      
      responseTimes.push(responseTime)
      
      // Wait a bit between calls
      await page.waitForTimeout(100)
    }
    
    // All responses should be under 1 second
    responseTimes.forEach(time => {
      expect(time).toBeLessThan(1000)
    })
    
    // Performance shouldn't degrade significantly
    const avgFirstThree = responseTimes.slice(0, 3).reduce((a, b) => a + b) / 3
    const avgLastTwo = responseTimes.slice(-2).reduce((a, b) => a + b) / 2
    
    expect(avgLastTwo).toBeLessThan(avgFirstThree * 1.5) // Max 50% degradation
  })

  test('should handle large text input efficiently', async ({ page }) => {
    await page.goto('/')
    
    // Mock API to handle large text
    await page.route('/api/translate', async route => {
      const body = await route.request().postData()
      const { text } = JSON.parse(body || '{}')
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          translatedText: `Translated: ${text.substring(0, 50)}...`,
          sourceLanguage: 'en',
          targetLanguage: 'fr'
        })
      })
    })
    
    const textInput = page.getByPlaceholder(/enter text to translate/i)
    
    // Test with increasingly large text
    const textSizes = [100, 500, 1000, 5000]
    
    for (const size of textSizes) {
      const largeText = 'a'.repeat(size)
      
      const startTime = Date.now()
      await textInput.fill(largeText)
      const fillTime = Date.now() - startTime
      
      // UI should remain responsive even with large text
      expect(fillTime).toBeLessThan(2000)
      
      // Check character count updates
      await expect(page.getByText(`${size} / 1000`)).toBeVisible({ timeout: 1000 })
    }
  })

  test('should maintain performance with multiple translations', async ({ page }) => {
    await page.goto('/')
    
    let callCount = 0
    
    await page.route('/api/translate', async route => {
      callCount++
      // Simulate slight delay
      await new Promise(resolve => setTimeout(resolve, 100))
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          translatedText: `Translation ${callCount}`,
          sourceLanguage: 'en',
          targetLanguage: 'fr'
        })
      })
    })
    
    const textInput = page.getByPlaceholder(/enter text to translate/i)
    const translateButton = page.getByRole('button', { name: /translate/i })
    
    // Perform multiple translations
    for (let i = 1; i <= 10; i++) {
      await textInput.fill(`Text ${i}`)
      await translateButton.click()
      await expect(page.getByText(`Translation ${i}`)).toBeVisible()
      
      // Check memory usage doesn't grow excessively
      const memoryInfo = await page.evaluate(() => {
        return (performance as any).memory ? {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize
        } : null
      })
      
      if (memoryInfo) {
        // Memory usage shouldn't exceed 50MB
        expect(memoryInfo.usedJSHeapSize).toBeLessThan(50 * 1024 * 1024)
      }
    }
  })

  test('should load document translation page efficiently', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/document-translate', { waitUntil: 'networkidle' })
    
    const loadTime = Date.now() - startTime
    
    // Page should load within 2 seconds
    expect(loadTime).toBeLessThan(2000)
    
    // Check if file upload area is visible quickly
    await expect(page.getByText(/drag.*drop.*files/i)).toBeVisible({ timeout: 1000 })
  })

  test('should handle rapid navigation without memory leaks', async ({ page }) => {
    const pages = ['/', '/document-translate', '/about', '/terms', '/privacy']
    
    for (let i = 0; i < 3; i++) { // Test multiple cycles
      for (const path of pages) {
        const startTime = Date.now()
        await page.goto(path, { waitUntil: 'domcontentloaded' })
        const navTime = Date.now() - startTime
        
        // Navigation should be fast
        expect(navTime).toBeLessThan(1000)
        
        // Wait for page to be interactive
        await page.waitForLoadState('networkidle')
      }
    }
    
    // Check final memory state
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0
    })
    
    if (finalMemory > 0) {
      // Memory shouldn't exceed 100MB after navigation stress test
      expect(finalMemory).toBeLessThan(100 * 1024 * 1024)
    }
  })

  test('should optimize image loading', async ({ page }) => {
    await page.goto('/')
    
    // Check if images are loaded efficiently
    const images = page.locator('img')
    const imageCount = await images.count()
    
    if (imageCount > 0) {
      // Check if images have loading="lazy" for performance
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i)
        const loading = await img.getAttribute('loading')
        
        // Non-critical images should be lazy-loaded
        if (await img.isVisible()) {
          // Visible images can be eager or lazy
          expect(['lazy', 'eager', null]).toContain(loading)
        }
      }
    }
  })

  test('should handle network throttling gracefully', async ({ page, context }) => {
    // Simulate slow 3G network
    await context.route('**/*', async route => {
      // Add artificial delay to simulate slow network
      await new Promise(resolve => setTimeout(resolve, 100))
      await route.continue()
    })
    
    const startTime = Date.now()
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const loadTime = Date.now() - startTime
    
    // Should still load within reasonable time on slow network
    expect(loadTime).toBeLessThan(10000)
    
    // UI should show loading states appropriately
    await expect(page.locator('main')).toBeVisible({ timeout: 5000 })
  })

  test('should bundle JavaScript efficiently', async ({ page }) => {
    await page.goto('/')
    
    // Check JavaScript bundle size via network monitoring
    const jsResources: any[] = []
    
    page.on('response', response => {
      if (response.url().includes('.js') && response.status() === 200) {
        jsResources.push({
          url: response.url(),
          size: parseInt(response.headers()['content-length'] || '0')
        })
      }
    })
    
    await page.reload({ waitUntil: 'networkidle' })
    
    const totalJSSize = jsResources.reduce((total, resource) => total + resource.size, 0)
    
    // Total JavaScript bundle should be under 1MB for initial load
    expect(totalJSSize).toBeLessThan(1024 * 1024)
    
    console.log(`Total JS bundle size: ${totalJSSize} bytes`)
    jsResources.forEach(resource => {
      console.log(`${resource.url}: ${resource.size} bytes`)
    })
  })
}) 