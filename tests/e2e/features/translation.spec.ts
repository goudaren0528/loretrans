import { test, expect } from '@playwright/test'

test.describe('Translation Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should display main translation interface', async ({ page }) => {
    // Check if main elements are present
    await expect(page.locator('nav')).toBeVisible()
    await expect(page.locator('main')).toBeVisible()
    
    // Check for translation form elements
    await expect(page.getByPlaceholder(/enter text to translate/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /translate/i })).toBeVisible()
    
    // Check for language selectors
    await expect(page.locator('[data-testid="source-language-select"]')).toBeVisible()
    await expect(page.locator('[data-testid="target-language-select"]')).toBeVisible()
  })

  test('should perform text translation', async ({ page }) => {
    // Mock the translation API
    await page.route('/api/translate', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          translatedText: 'Bonjour le monde',
          sourceLanguage: 'en',
          targetLanguage: 'fr',
          confidence: 0.95
        })
      })
    })

    // Enter text to translate
    const textInput = page.getByPlaceholder(/enter text to translate/i)
    await textInput.fill('Hello world')

    // Click translate button
    await page.getByRole('button', { name: /translate/i }).click()

    // Wait for translation result
    await expect(page.getByText('Bonjour le monde')).toBeVisible({ timeout: 10000 })
    
    // Check if confidence score is displayed
    await expect(page.getByText(/confidence/i)).toBeVisible()
  })

  test('should handle translation errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('/api/translate', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Translation service unavailable'
        })
      })
    })

    const textInput = page.getByPlaceholder(/enter text to translate/i)
    await textInput.fill('Hello world')
    
    await page.getByRole('button', { name: /translate/i }).click()
    
    // Should show error message
    await expect(page.getByText(/translation failed/i)).toBeVisible()
  })

  test('should show loading state during translation', async ({ page }) => {
    // Delay the API response to test loading state
    await page.route('/api/translate', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          translatedText: 'Bonjour le monde',
          sourceLanguage: 'en',
          targetLanguage: 'fr'
        })
      })
    })

    const textInput = page.getByPlaceholder(/enter text to translate/i)
    await textInput.fill('Hello world')
    
    const translateButton = page.getByRole('button', { name: /translate/i })
    await translateButton.click()
    
    // Should show loading state
    await expect(page.getByText(/translating/i)).toBeVisible()
    await expect(translateButton).toBeDisabled()
    
    // Wait for completion
    await expect(page.getByText('Bonjour le monde')).toBeVisible({ timeout: 5000 })
  })

  test('should validate text length', async ({ page }) => {
    const textInput = page.getByPlaceholder(/enter text to translate/i)
    
    // Test character count display
    await textInput.fill('Hello')
    await expect(page.getByText(/5 \/ 1000/)).toBeVisible()
    
    // Test maximum length validation
    const longText = 'a'.repeat(1001)
    await textInput.fill(longText)
    await expect(page.getByText(/text is too long/i)).toBeVisible()
  })

  test('should copy translation to clipboard', async ({ page }) => {
    // Mock clipboard API
    await page.addInitScript(() => {
      Object.assign(navigator, {
        clipboard: {
          writeText: async (text: string) => {
            ;(window as any).clipboardText = text
          }
        }
      })
    })

    // Mock translation API
    await page.route('/api/translate', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          translatedText: 'Bonjour le monde',
          sourceLanguage: 'en',
          targetLanguage: 'fr'
        })
      })
    })

    const textInput = page.getByPlaceholder(/enter text to translate/i)
    await textInput.fill('Hello world')
    await page.getByRole('button', { name: /translate/i }).click()
    
    await expect(page.getByText('Bonjour le monde')).toBeVisible()
    
    // Click copy button
    await page.getByRole('button', { name: /copy/i }).click()
    
    // Check if text was copied
    const clipboardText = await page.evaluate(() => (window as any).clipboardText)
    expect(clipboardText).toBe('Bonjour le monde')
    
    // Should show copy success message
    await expect(page.getByText(/copied/i)).toBeVisible()
  })

  test('should switch languages', async ({ page }) => {
    const sourceSelect = page.locator('[data-testid="source-language-select"]')
    const targetSelect = page.locator('[data-testid="target-language-select"]')
    
    // Set initial languages
    await sourceSelect.click()
    await page.getByText('English').click()
    
    await targetSelect.click()
    await page.getByText('French').click()
    
    // Click switch button
    await page.getByRole('button', { name: /switch languages/i }).click()
    
    // Languages should be swapped
    await expect(sourceSelect).toContainText('French')
    await expect(targetSelect).toContainText('English')
  })

  test('should detect language automatically', async ({ page }) => {
    // Mock language detection API
    await page.route('/api/detect', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          language: 'fr',
          confidence: 0.95
        })
      })
    })

    const textInput = page.getByPlaceholder(/enter text to translate/i)
    await textInput.fill('Bonjour le monde')
    
    // Auto-detection should trigger
    await expect(page.getByText(/detected: french/i)).toBeVisible({ timeout: 3000 })
  })

  test('should play text-to-speech audio', async ({ page }) => {
    // Mock TTS API
    await page.route('/api/tts', async route => {
      // Create a mock audio blob
      const audioBuffer = Buffer.from(new ArrayBuffer(1024))
      await route.fulfill({
        status: 200,
        contentType: 'audio/mpeg',
        body: audioBuffer
      })
    })

    // Mock translation first
    await page.route('/api/translate', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          translatedText: 'Hello world',
          sourceLanguage: 'fr',
          targetLanguage: 'en'
        })
      })
    })

    // Mock Audio API
    await page.addInitScript(() => {
      ;(window as any).HTMLAudioElement = class {
        play() {
          ;(window as any).audioPlayed = true
          return Promise.resolve()
        }
        pause() {}
        addEventListener() {}
        removeEventListener() {}
      }
    })

    const textInput = page.getByPlaceholder(/enter text to translate/i)
    await textInput.fill('Bonjour le monde')
    await page.getByRole('button', { name: /translate/i }).click()
    
    await expect(page.getByText('Hello world')).toBeVisible()
    
    // Click TTS button
    await page.getByRole('button', { name: /play audio/i }).click()
    
    // Check if audio was played
    const audioPlayed = await page.evaluate(() => (window as any).audioPlayed)
    expect(audioPlayed).toBe(true)
  })

  test('should work on mobile devices', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'This test is only for mobile devices')

    // Check mobile layout
    await expect(page.locator('nav')).toBeVisible()
    
    // Check if mobile menu works
    const mobileMenuButton = page.getByRole('button', { name: /menu/i })
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click()
      await expect(page.getByText(/text translation/i)).toBeVisible()
    }
    
    // Test translation on mobile
    const textInput = page.getByPlaceholder(/enter text to translate/i)
    await textInput.fill('Hello')
    
    // Should be responsive
    const inputBox = await textInput.boundingBox()
    expect(inputBox?.width).toBeLessThan(400)
  })

  test('should handle network failures', async ({ page }) => {
    // Simulate network failure
    await page.route('/api/translate', route => route.abort())

    const textInput = page.getByPlaceholder(/enter text to translate/i)
    await textInput.fill('Hello world')
    await page.getByRole('button', { name: /translate/i }).click()
    
    // Should show network error
    await expect(page.getByText(/network error|connection failed/i)).toBeVisible()
  })
}) 