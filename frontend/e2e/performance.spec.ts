import { test, expect } from '@playwright/test'

test.describe('Performance Tests', () => {
  test('should meet Core Web Vitals thresholds', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')
    
    // Measure performance metrics
    const performanceMetrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const metrics = {
            fcp: 0, // First Contentful Paint
            lcp: 0, // Largest Contentful Paint
            fid: 0, // First Input Delay
            cls: 0, // Cumulative Layout Shift
          }
          
          entries.forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              metrics.fcp = entry.startTime
            }
            if (entry.entryType === 'largest-contentful-paint') {
              metrics.lcp = entry.startTime
            }
            if (entry.entryType === 'first-input') {
              metrics.fid = entry.processingStart - entry.startTime
            }
            if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
              metrics.cls += entry.value
            }
          })
          
          resolve(metrics)
        }).observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] })
        
        // Fallback timeout
        setTimeout(() => resolve({
          fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
          lcp: 0,
          fid: 0,
          cls: 0,
        }), 5000)
      })
    })
    
    // Assert Core Web Vitals thresholds
    expect(performanceMetrics.fcp).toBeLessThan(1800) // FCP < 1.8s (good)
    expect(performanceMetrics.lcp).toBeLessThan(2500) // LCP < 2.5s (good)
    expect(performanceMetrics.fid).toBeLessThan(100)  // FID < 100ms (good)
    expect(performanceMetrics.cls).toBeLessThan(0.1)  // CLS < 0.1 (good)
  })

  test('should load page within acceptable time', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    
    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000)
  })

  test('should handle translation API performance', async ({ page }) => {
    await page.goto('/')
    
    // Measure translation API response time
    const startTime = Date.now()
    
    await page.fill('[data-testid="source-textarea"]', 'Hello world')
    await page.click('[data-testid="translate-button"]')
    
    // Wait for translation result
    await expect(page.locator('[data-testid="translation-result"]')).toBeVisible({ timeout: 30000 })
    
    const translationTime = Date.now() - startTime
    
    // Translation should complete within 30 seconds (including NLLB cold start)
    expect(translationTime).toBeLessThan(30000)
    
    // Log performance for monitoring
    console.log(`Translation completed in ${translationTime}ms`)
  })

  test('should handle concurrent translations efficiently', async ({ page, context }) => {
    // Create multiple pages for concurrent testing
    const pages = await Promise.all([
      context.newPage(),
      context.newPage(),
      context.newPage(),
    ])
    
    // Navigate all pages to translation interface
    await Promise.all(pages.map(p => p.goto('/')))
    
    // Start concurrent translations
    const startTime = Date.now()
    
    const translationPromises = pages.map(async (p, index) => {
      await p.fill('[data-testid="source-textarea"]', `Test text ${index + 1}`)
      await p.click('[data-testid="translate-button"]')
      return p.waitForSelector('[data-testid="translation-result"]', { timeout: 45000 })
    })
    
    // Wait for all translations to complete
    await Promise.all(translationPromises)
    
    const totalTime = Date.now() - startTime
    
    // Concurrent translations should not take significantly longer than single translation
    expect(totalTime).toBeLessThan(60000) // 60 seconds for 3 concurrent translations
    
    // Clean up
    await Promise.all(pages.map(p => p.close()))
  })

  test('should maintain performance with large text input', async ({ page }) => {
    await page.goto('/')
    
    // Test with large text input
    const largeText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(100) // ~5500 characters
    
    const startTime = Date.now()
    
    // Fill large text
    await page.fill('[data-testid="source-textarea"]', largeText)
    
    const inputTime = Date.now() - startTime
    
    // Text input should be responsive
    expect(inputTime).toBeLessThan(1000)
    
    // Check if character count updates quickly
    await expect(page.locator('[data-testid="character-count"]')).toContainText('5500', { timeout: 2000 })
  })

  test('should optimize bundle size and loading', async ({ page }) => {
    // Navigate and measure resource loading
    const resourceSizes = []
    
    page.on('response', response => {
      if (response.url().includes('.js') || response.url().includes('.css')) {
        response.body().then(body => {
          resourceSizes.push({
            url: response.url(),
            size: body.length,
            type: response.url().includes('.js') ? 'js' : 'css'
          })
        }).catch(() => {
          // Ignore errors for resource size measurement
        })
      }
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Wait a bit for all resources to be captured
    await page.waitForTimeout(2000)
    
    // Calculate total bundle sizes
    const totalJSSize = resourceSizes
      .filter(r => r.type === 'js')
      .reduce((sum, r) => sum + r.size, 0)
    
    const totalCSSSize = resourceSizes
      .filter(r => r.type === 'css')
      .reduce((sum, r) => sum + r.size, 0)
    
    // Assert reasonable bundle sizes
    expect(totalJSSize).toBeLessThan(1024 * 1024) // JS bundle < 1MB
    expect(totalCSSSize).toBeLessThan(100 * 1024)  // CSS bundle < 100KB
    
    console.log(`Total JS size: ${(totalJSSize / 1024).toFixed(2)}KB`)
    console.log(`Total CSS size: ${(totalCSSSize / 1024).toFixed(2)}KB`)
  })

  test('should handle memory usage efficiently', async ({ page }) => {
    await page.goto('/')
    
    // Measure initial memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
      } : null
    })
    
    if (!initialMemory) {
      test.skip('Memory measurement not available in this browser')
    }
    
    // Perform multiple translations to test memory usage
    for (let i = 0; i < 5; i++) {
      await page.fill('[data-testid="source-textarea"]', `Test translation ${i + 1}`)
      await page.click('[data-testid="translate-button"]')
      await expect(page.locator('[data-testid="translation-result"]')).toBeVisible({ timeout: 30000 })
      
      // Clear result to prepare for next iteration
      await page.fill('[data-testid="source-textarea"]', '')
    }
    
    // Measure memory after operations
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
      } : null
    })
    
    if (finalMemory && initialMemory) {
      const memoryIncrease = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize
      
      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024)
      
      console.log(`Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`)
    }
  })

  test('should optimize image loading and rendering', async ({ page }) => {
    await page.goto('/')
    
    // Check if images are optimized
    const images = await page.locator('img').all()
    
    for (const img of images) {
      // Check if images have proper loading attributes
      const loading = await img.getAttribute('loading')
      const src = await img.getAttribute('src')
      
      // Images should use lazy loading or be critical
      if (src && !src.includes('data:')) {
        expect(loading === 'lazy' || loading === 'eager').toBeTruthy()
      }
      
      // Check if images have proper dimensions to prevent layout shift
      const width = await img.getAttribute('width')
      const height = await img.getAttribute('height')
      
      if (src && !src.includes('data:')) {
        expect(width || height).toBeTruthy()
      }
    }
  })
})
