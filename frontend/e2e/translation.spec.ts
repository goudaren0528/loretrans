import { test, expect } from '@playwright/test'

test.describe('Translation Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the translation page
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should display the translation interface', async ({ page }) => {
    // Check if main translation elements are present
    await expect(page.locator('[data-testid="source-textarea"]')).toBeVisible()
    await expect(page.locator('[data-testid="translate-button"]')).toBeVisible()
    await expect(page.locator('[data-testid="source-language-select"]')).toBeVisible()
    await expect(page.locator('[data-testid="target-language-select"]')).toBeVisible()
  })

  test('should perform basic text translation', async ({ page }) => {
    // Enter text to translate
    await page.fill('[data-testid="source-textarea"]', 'Hello world')
    
    // Select languages
    await page.selectOption('[data-testid="source-language-select"]', 'en')
    await page.selectOption('[data-testid="target-language-select"]', 'zh')
    
    // Click translate button
    await page.click('[data-testid="translate-button"]')
    
    // Wait for translation to complete
    await expect(page.locator('[data-testid="translation-result"]')).toBeVisible({ timeout: 30000 })
    
    // Check if translation result is displayed
    const result = await page.textContent('[data-testid="translation-result"]')
    expect(result).toBeTruthy()
    expect(result?.length).toBeGreaterThan(0)
  })

  test('should show character count and credit estimation', async ({ page }) => {
    // Enter text
    await page.fill('[data-testid="source-textarea"]', 'Hello world')
    
    // Check character count
    await expect(page.locator('[data-testid="character-count"]')).toContainText('11')
    
    // Check credit estimation
    await expect(page.locator('[data-testid="credit-estimation"]')).toBeVisible()
  })

  test('should handle language swap', async ({ page }) => {
    // Select initial languages
    await page.selectOption('[data-testid="source-language-select"]', 'en')
    await page.selectOption('[data-testid="target-language-select"]', 'zh')
    
    // Click swap button
    await page.click('[data-testid="swap-languages-button"]')
    
    // Check if languages are swapped
    const sourceValue = await page.inputValue('[data-testid="source-language-select"]')
    const targetValue = await page.inputValue('[data-testid="target-language-select"]')
    
    expect(sourceValue).toBe('zh')
    expect(targetValue).toBe('en')
  })

  test('should copy translation result to clipboard', async ({ page }) => {
    // Perform translation first
    await page.fill('[data-testid="source-textarea"]', 'Hello')
    await page.click('[data-testid="translate-button"]')
    
    // Wait for result
    await expect(page.locator('[data-testid="translation-result"]')).toBeVisible({ timeout: 30000 })
    
    // Click copy button
    await page.click('[data-testid="copy-button"]')
    
    // Check if copy success message is shown
    await expect(page.locator('[data-testid="copy-success"]')).toBeVisible()
  })

  test('should handle translation errors gracefully', async ({ page }) => {
    // Mock network error by intercepting the API call
    await page.route('/api/translate', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Translation service unavailable' })
      })
    })
    
    // Attempt translation
    await page.fill('[data-testid="source-textarea"]', 'Hello world')
    await page.click('[data-testid="translate-button"]')
    
    // Check if error message is displayed
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Translation failed')
  })

  test('should show loading state during translation', async ({ page }) => {
    // Delay the API response to test loading state
    await page.route('/api/translate', route => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            translatedText: '你好世界',
            calculation: { credits_required: 0 }
          })
        })
      }, 2000)
    })
    
    // Start translation
    await page.fill('[data-testid="source-textarea"]', 'Hello world')
    await page.click('[data-testid="translate-button"]')
    
    // Check loading state
    await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible()
    await expect(page.locator('[data-testid="translate-button"]')).toBeDisabled()
    
    // Wait for completion
    await expect(page.locator('[data-testid="translation-result"]')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('[data-testid="loading-indicator"]')).not.toBeVisible()
  })

  test('should handle long text with queue processing', async ({ page }) => {
    // Enter long text that triggers queue processing
    const longText = 'A'.repeat(2000)
    await page.fill('[data-testid="source-textarea"]', longText)
    
    // Should show time estimation
    await expect(page.locator('[data-testid="time-estimation"]')).toBeVisible()
    
    // Start translation
    await page.click('[data-testid="translate-button"]')
    
    // Should show queue processing message
    await expect(page.locator('[data-testid="queue-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="queue-message"]')).toContainText('can leave this page')
  })

  test('should support keyboard shortcuts', async ({ page }) => {
    // Enter text
    await page.fill('[data-testid="source-textarea"]', 'Hello world')
    
    // Use Ctrl+Enter to translate
    await page.keyboard.press('Control+Enter')
    
    // Should start translation
    await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible()
  })

  test('should validate input length limits', async ({ page }) => {
    // Test maximum character limit
    const veryLongText = 'A'.repeat(10000)
    await page.fill('[data-testid="source-textarea"]', veryLongText)
    
    // Should show character limit warning
    await expect(page.locator('[data-testid="character-limit-warning"]')).toBeVisible()
    
    // Translate button should be disabled or show warning
    const translateButton = page.locator('[data-testid="translate-button"]')
    const isDisabled = await translateButton.isDisabled()
    const hasWarning = await page.locator('[data-testid="length-warning"]').isVisible()
    
    expect(isDisabled || hasWarning).toBeTruthy()
  })
})

test.describe('Multi-language Support', () => {
  test('should support all available language pairs', async ({ page }) => {
    await page.goto('/')
    
    const languages = [
      { code: 'en', name: 'English' },
      { code: 'zh', name: 'Chinese' },
      { code: 'ht', name: 'Haitian Creole' },
      { code: 'lo', name: 'Lao' },
      { code: 'my', name: 'Burmese' },
      { code: 'sw', name: 'Swahili' },
      { code: 'te', name: 'Telugu' },
    ]
    
    // Test each language as source
    for (const lang of languages) {
      await page.selectOption('[data-testid="source-language-select"]', lang.code)
      const selectedValue = await page.inputValue('[data-testid="source-language-select"]')
      expect(selectedValue).toBe(lang.code)
    }
  })

  test('should translate between small languages', async ({ page }) => {
    await page.goto('/')
    
    // Test Haitian Creole to English
    await page.selectOption('[data-testid="source-language-select"]', 'ht')
    await page.selectOption('[data-testid="target-language-select"]', 'en')
    await page.fill('[data-testid="source-textarea"]', 'Bonjou')
    
    await page.click('[data-testid="translate-button"]')
    
    // Should get translation result
    await expect(page.locator('[data-testid="translation-result"]')).toBeVisible({ timeout: 30000 })
    
    const result = await page.textContent('[data-testid="translation-result"]')
    expect(result).toBeTruthy()
  })
})

test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } }) // iPhone SE size
  
  test('should display mobile-friendly interface', async ({ page }) => {
    await page.goto('/')
    
    // Check if mobile translator is displayed
    await expect(page.locator('[data-testid="mobile-translator"]')).toBeVisible()
    
    // Check if collapsible sections work
    const inputSection = page.locator('[data-testid="input-section"]')
    const resultSection = page.locator('[data-testid="result-section"]')
    
    await expect(inputSection).toBeVisible()
    
    // Perform translation to show result section
    await page.fill('[data-testid="source-textarea"]', 'Hello')
    await page.click('[data-testid="translate-button"]')
    
    await expect(resultSection).toBeVisible({ timeout: 30000 })
  })

  test('should handle touch interactions', async ({ page }) => {
    await page.goto('/')
    
    // Test touch-friendly buttons
    const translateButton = page.locator('[data-testid="translate-button"]')
    await expect(translateButton).toBeVisible()
    
    // Button should be large enough for touch
    const buttonBox = await translateButton.boundingBox()
    expect(buttonBox?.height).toBeGreaterThan(44) // iOS minimum touch target
  })
})
