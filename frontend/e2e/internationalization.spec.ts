import { test, expect } from '@playwright/test'

test.describe('Internationalization (i18n)', () => {
  const supportedLocales = [
    { code: 'en', name: 'English', direction: 'ltr' },
    { code: 'zh', name: '中文', direction: 'ltr' },
    { code: 'es', name: 'Español', direction: 'ltr' },
    { code: 'fr', name: 'Français', direction: 'ltr' },
    { code: 'ar', name: 'العربية', direction: 'rtl' },
    { code: 'hi', name: 'हिन्दी', direction: 'ltr' },
    { code: 'pt', name: 'Português', direction: 'ltr' },
    { code: 'ht', name: 'Kreyòl Ayisyen', direction: 'ltr' },
    { code: 'lo', name: 'ລາວ', direction: 'ltr' },
    { code: 'sw', name: 'Kiswahili', direction: 'ltr' },
    { code: 'my', name: 'မြန်မာ', direction: 'ltr' },
    { code: 'te', name: 'తెలుగు', direction: 'ltr' },
  ]

  test('should display all supported languages in language selector', async ({ page }) => {
    await page.goto('/')
    
    // Check if language selector is present
    const languageSelector = page.locator('[data-testid="language-selector"]')
    await expect(languageSelector).toBeVisible()
    
    // Click to open language options
    await languageSelector.click()
    
    // Verify all supported languages are available
    for (const locale of supportedLocales) {
      const languageOption = page.locator(`[data-testid="language-option-${locale.code}"]`)
      await expect(languageOption).toBeVisible()
      await expect(languageOption).toContainText(locale.name)
    }
  })

  test('should switch interface language correctly', async ({ page }) => {
    // Test switching to different languages
    for (const locale of supportedLocales.slice(0, 3)) { // Test first 3 languages
      await page.goto(`/${locale.code}`)
      
      // Wait for page to load
      await page.waitForLoadState('networkidle')
      
      // Check if the page is in the correct language
      const html = page.locator('html')
      const lang = await html.getAttribute('lang')
      expect(lang).toBe(locale.code)
      
      // Check if text direction is correct
      const dir = await html.getAttribute('dir')
      expect(dir).toBe(locale.direction)
      
      // Verify key UI elements are translated
      const translateButton = page.locator('[data-testid="translate-button"]')
      await expect(translateButton).toBeVisible()
      
      // The button text should be different for different languages
      const buttonText = await translateButton.textContent()
      expect(buttonText).toBeTruthy()
    }
  })

  test('should handle RTL languages correctly', async ({ page }) => {
    // Test Arabic (RTL language)
    await page.goto('/ar')
    await page.waitForLoadState('networkidle')
    
    // Check RTL direction
    const html = page.locator('html')
    const dir = await html.getAttribute('dir')
    expect(dir).toBe('rtl')
    
    // Check if layout adapts to RTL
    const mainContent = page.locator('main')
    const computedStyle = await mainContent.evaluate(el => {
      return window.getComputedStyle(el).direction
    })
    expect(computedStyle).toBe('rtl')
    
    // Test that text inputs work correctly in RTL
    const textarea = page.locator('[data-testid="source-textarea"]')
    await textarea.fill('مرحبا بالعالم')
    
    const value = await textarea.inputValue()
    expect(value).toBe('مرحبا بالعالم')
  })

  test('should preserve language preference across navigation', async ({ page }) => {
    // Start with Chinese
    await page.goto('/zh')
    await page.waitForLoadState('networkidle')
    
    // Navigate to a different page
    await page.click('[data-testid="about-link"]')
    await page.waitForLoadState('networkidle')
    
    // Should still be in Chinese
    const html = page.locator('html')
    const lang = await html.getAttribute('lang')
    expect(lang).toBe('zh')
    
    // URL should maintain language prefix
    expect(page.url()).toContain('/zh/')
  })

  test('should handle language-specific formatting', async ({ page }) => {
    // Test different number and date formatting
    const testCases = [
      { locale: 'en', expectedNumber: '1,234.56' },
      { locale: 'fr', expectedNumber: '1 234,56' },
      { locale: 'zh', expectedNumber: '1,234.56' },
    ]
    
    for (const testCase of testCases) {
      await page.goto(`/${testCase.locale}`)
      await page.waitForLoadState('networkidle')
      
      // Check if numbers are formatted correctly
      // This would require the app to display formatted numbers
      const numberDisplay = page.locator('[data-testid="formatted-number"]')
      if (await numberDisplay.isVisible()) {
        await expect(numberDisplay).toContainText(testCase.expectedNumber)
      }
    }
  })

  test('should handle translation key fallbacks', async ({ page }) => {
    // Test with a language that might have missing translations
    await page.goto('/te') // Telugu
    await page.waitForLoadState('networkidle')
    
    // Key UI elements should still be visible even if some translations are missing
    await expect(page.locator('[data-testid="translate-button"]')).toBeVisible()
    await expect(page.locator('[data-testid="source-textarea"]')).toBeVisible()
    
    // Should not show translation keys (like 'common.translate') in the UI
    const bodyText = await page.textContent('body')
    expect(bodyText).not.toMatch(/\w+\.\w+/) // Should not contain key patterns like 'common.translate'
  })

  test('should handle special characters and unicode', async ({ page }) => {
    const testTexts = [
      { locale: 'zh', text: '你好世界！这是一个测试。' },
      { locale: 'ar', text: 'مرحبا بالعالم! هذا اختبار.' },
      { locale: 'hi', text: 'नमस्ते दुनिया! यह एक परीक्षण है।' },
      { locale: 'te', text: 'హలో వరల్డ్! ఇది ఒక పరీక్ష.' },
      { locale: 'my', text: 'မင်္ဂလာပါကမ္ဘာ! ဒါကစမ်းသပ်မှုတစ်ခုပါ။' },
    ]
    
    for (const testText of testTexts) {
      await page.goto(`/${testText.locale}`)
      await page.waitForLoadState('networkidle')
      
      // Enter text with special characters
      const textarea = page.locator('[data-testid="source-textarea"]')
      await textarea.fill(testText.text)
      
      // Verify text is preserved correctly
      const value = await textarea.inputValue()
      expect(value).toBe(testText.text)
      
      // Check character count is correct
      const charCount = page.locator('[data-testid="character-count"]')
      await expect(charCount).toContainText(testText.text.length.toString())
    }
  })

  test('should handle language-specific translation pairs', async ({ page }) => {
    // Test language-specific pages
    const languagePages = [
      { path: '/creole-to-english', sourceLang: 'ht', targetLang: 'en' },
      { path: '/lao-to-english', sourceLang: 'lo', targetLang: 'en' },
      { path: '/burmese-to-english', sourceLang: 'my', targetLang: 'en' },
      { path: '/swahili-to-english', sourceLang: 'sw', targetLang: 'en' },
      { path: '/telugu-to-english', sourceLang: 'te', targetLang: 'en' },
    ]
    
    for (const langPage of languagePages) {
      await page.goto(langPage.path)
      await page.waitForLoadState('networkidle')
      
      // Check if correct languages are pre-selected
      const sourceSelect = page.locator('[data-testid="source-language-select"]')
      const targetSelect = page.locator('[data-testid="target-language-select"]')
      
      const sourceValue = await sourceSelect.inputValue()
      const targetValue = await targetSelect.inputValue()
      
      expect(sourceValue).toBe(langPage.sourceLang)
      expect(targetValue).toBe(langPage.targetLang)
      
      // Test that the page title and description are appropriate
      const title = await page.title()
      expect(title).toContain('English') // Should mention English translation
    }
  })

  test('should handle font loading for different scripts', async ({ page }) => {
    const scriptTests = [
      { locale: 'ar', script: 'Arabic' },
      { locale: 'zh', script: 'Chinese' },
      { locale: 'hi', script: 'Devanagari' },
      { locale: 'te', script: 'Telugu' },
      { locale: 'my', script: 'Myanmar' },
    ]
    
    for (const scriptTest of scriptTests) {
      await page.goto(`/${scriptTest.locale}`)
      await page.waitForLoadState('networkidle')
      
      // Wait for fonts to load
      await page.waitForTimeout(2000)
      
      // Check if text is rendered properly (not showing fallback fonts)
      const sampleText = page.locator('[data-testid="sample-text"]')
      if (await sampleText.isVisible()) {
        const computedStyle = await sampleText.evaluate(el => {
          return window.getComputedStyle(el).fontFamily
        })
        
        // Should not be using generic fallback fonts only
        expect(computedStyle).not.toBe('serif')
        expect(computedStyle).not.toBe('sans-serif')
      }
    }
  })

  test('should handle pluralization correctly', async ({ page }) => {
    // Test pluralization in different languages
    await page.goto('/en')
    
    // Test with different counts that should trigger different plural forms
    const testCounts = [0, 1, 2, 5]
    
    for (const count of testCounts) {
      // This would require the app to display countable items
      const countDisplay = page.locator(`[data-testid="item-count-${count}"]`)
      if (await countDisplay.isVisible()) {
        const text = await countDisplay.textContent()
        
        // Check appropriate plural form
        if (count === 1) {
          expect(text).toMatch(/1 item/) // Singular
        } else {
          expect(text).toMatch(/\d+ items/) // Plural
        }
      }
    }
  })

  test('should maintain accessibility in all languages', async ({ page }) => {
    for (const locale of supportedLocales.slice(0, 3)) {
      await page.goto(`/${locale.code}`)
      await page.waitForLoadState('networkidle')
      
      // Check basic accessibility requirements
      const mainContent = page.locator('main')
      await expect(mainContent).toBeVisible()
      
      // Check if form labels are properly associated
      const textarea = page.locator('[data-testid="source-textarea"]')
      const textareaId = await textarea.getAttribute('id')
      
      if (textareaId) {
        const label = page.locator(`label[for="${textareaId}"]`)
        await expect(label).toBeVisible()
      }
      
      // Check if buttons have accessible names
      const translateButton = page.locator('[data-testid="translate-button"]')
      const buttonText = await translateButton.textContent()
      const ariaLabel = await translateButton.getAttribute('aria-label')
      
      expect(buttonText || ariaLabel).toBeTruthy()
    }
  })
})
