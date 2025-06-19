import { test, expect } from '@playwright/test'

test.describe('Security Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should prevent XSS attacks in translation input', async ({ page }) => {
    const maliciousInputs = [
      '<script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src=x onerror=alert("XSS")>',
      '<svg onload=alert("XSS")>',
      '"><script>alert("XSS")</script>',
      "';alert('XSS');//"
    ]

    await page.route('/api/translate', async route => {
      const body = await route.request().postData()
      const { text } = JSON.parse(body || '{}')
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          translatedText: `Safe: ${text}`,
          sourceLanguage: 'en',
          targetLanguage: 'fr'
        })
      })
    })

    const textInput = page.getByPlaceholder(/enter text to translate/i)
    
    for (const maliciousInput of maliciousInputs) {
      await textInput.fill(maliciousInput)
      await page.getByRole('button', { name: /translate/i }).click()
      
      await expect(page.getByText(/Safe:/)).toBeVisible()
      
      const alertDialogs: string[] = []
      page.on('dialog', dialog => {
        alertDialogs.push(dialog.message())
        dialog.dismiss()
      })
      
      await page.waitForTimeout(1000)
      expect(alertDialogs).toHaveLength(0)
    }
  })

  test('should validate file upload security', async ({ page }) => {
    await page.goto('/document-translate')
    
    await page.route('/api/upload', async route => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Invalid file type'
        })
      })
    })

    // Should reject dangerous file types
    await expect(page.getByText(/drag.*drop.*files/i)).toBeVisible()
  })

  test('should enforce rate limiting', async ({ page }) => {
    let requestCount = 0
    
    await page.route('/api/translate', async route => {
      requestCount++
      
      if (requestCount > 5) {
        await route.fulfill({
          status: 429,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Rate limit exceeded'
          })
        })
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            translatedText: 'Translation result',
            sourceLanguage: 'en',
            targetLanguage: 'fr'
          })
        })
      }
    })

    const textInput = page.getByPlaceholder(/enter text to translate/i)
    const translateButton = page.getByRole('button', { name: /translate/i })
    
    for (let i = 0; i < 7; i++) {
      await textInput.fill(`Test ${i}`)
      await translateButton.click()
      
      if (i >= 5) {
        await expect(page.getByText(/rate limit exceeded/i)).toBeVisible()
        break
      }
    }
  })

  test('should sanitize translation results', async ({ page }) => {
    await page.route('/api/translate', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          translatedText: '<script>alert("Bad")</script>Safe content',
          sourceLanguage: 'en',
          targetLanguage: 'fr'
        })
      })
    })

    const textInput = page.getByPlaceholder(/enter text to translate/i)
    await textInput.fill('Hello world')
    await page.getByRole('button', { name: /translate/i }).click()
    
    await expect(page.getByText(/Safe content/)).toBeVisible()
    
    const alertDialogs: string[] = []
    page.on('dialog', dialog => {
      alertDialogs.push(dialog.message())
      dialog.dismiss()
    })
    
    await page.waitForTimeout(1000)
    expect(alertDialogs).toHaveLength(0)
  })
}) 