import { NextRequest } from 'next/server'
import { POST } from '@/app/api/translate/route'

// Mock external dependencies
jest.mock('@/lib/services/translation', () => ({
  translateText: jest.fn(),
}))

jest.mock('@/lib/services/language-detection', () => ({
  detectLanguage: jest.fn(),
}))

jest.mock('@/lib/services/cache', () => ({
  getCachedTranslation: jest.fn(),
  setCachedTranslation: jest.fn(),
}))

describe('/api/translate', () => {
  const mockTranslateText = require('@/lib/services/translation').translateText
  const mockDetectLanguage = require('@/lib/services/language-detection').detectLanguage
  const mockGetCachedTranslation = require('@/lib/services/cache').getCachedTranslation
  const mockSetCachedTranslation = require('@/lib/services/cache').setCachedTranslation

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const createMockRequest = (body: any) => {
    return new NextRequest('http://localhost:3000/api/translate', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  it('successfully translates text', async () => {
    const mockTranslation = {
      translatedText: 'Bonjour le monde',
      sourceLanguage: 'en',
      targetLanguage: 'fr',
      confidence: 0.95,
    }

    mockGetCachedTranslation.mockResolvedValue(null)
    mockTranslateText.mockResolvedValue(mockTranslation)

    const request = createMockRequest({
      text: 'Hello world',
      sourceLanguage: 'en',
      targetLanguage: 'fr',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(mockTranslation)
    expect(mockTranslateText).toHaveBeenCalledWith('Hello world', 'en', 'fr')
    expect(mockSetCachedTranslation).toHaveBeenCalled()
  })

  it('handles auto language detection', async () => {
    const mockDetection = { language: 'fr', confidence: 0.9 }
    const mockTranslation = {
      translatedText: 'Hello world',
      sourceLanguage: 'fr',
      targetLanguage: 'en',
      confidence: 0.95,
    }

    mockDetectLanguage.mockResolvedValue(mockDetection)
    mockGetCachedTranslation.mockResolvedValue(null)
    mockTranslateText.mockResolvedValue(mockTranslation)

    const request = createMockRequest({
      text: 'Bonjour le monde',
      sourceLanguage: 'auto',
      targetLanguage: 'en',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(mockTranslation)
    expect(mockDetectLanguage).toHaveBeenCalledWith('Bonjour le monde')
    expect(mockTranslateText).toHaveBeenCalledWith('Bonjour le monde', 'fr', 'en')
  })

  it('returns cached translation when available', async () => {
    const cachedTranslation = {
      translatedText: 'Bonjour le monde',
      sourceLanguage: 'en',
      targetLanguage: 'fr',
      confidence: 0.95,
      cached: true,
    }

    mockGetCachedTranslation.mockResolvedValue(cachedTranslation)

    const request = createMockRequest({
      text: 'Hello world',
      sourceLanguage: 'en',
      targetLanguage: 'fr',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(cachedTranslation)
    expect(mockTranslateText).not.toHaveBeenCalled()
  })

  it('validates required fields', async () => {
    const request = createMockRequest({
      text: '',
      sourceLanguage: 'en',
      targetLanguage: 'fr',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Text is required')
  })

  it('validates text length limit', async () => {
    const longText = 'a'.repeat(10001)
    const request = createMockRequest({
      text: longText,
      sourceLanguage: 'en',
      targetLanguage: 'fr',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Text is too long (max 10000 characters)')
  })

  it('validates supported languages', async () => {
    const request = createMockRequest({
      text: 'Hello world',
      sourceLanguage: 'invalid',
      targetLanguage: 'fr',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Unsupported source language')
  })

  it('handles translation service errors', async () => {
    mockGetCachedTranslation.mockResolvedValue(null)
    mockTranslateText.mockRejectedValue(new Error('Translation service unavailable'))

    const request = createMockRequest({
      text: 'Hello world',
      sourceLanguage: 'en',
      targetLanguage: 'fr',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Translation failed')
  })

  it('handles language detection errors', async () => {
    mockDetectLanguage.mockRejectedValue(new Error('Detection failed'))

    const request = createMockRequest({
      text: 'Hello world',
      sourceLanguage: 'auto',
      targetLanguage: 'fr',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Language detection failed')
  })

  it('handles malformed JSON requests', async () => {
    const request = new NextRequest('http://localhost:3000/api/translate', {
      method: 'POST',
      body: 'invalid json',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid request body')
  })

  it('rejects non-POST methods', async () => {
    const request = new NextRequest('http://localhost:3000/api/translate', {
      method: 'GET',
    })

    const response = await POST(request)
    expect(response.status).toBe(405)
  })

  it('handles rate limiting', async () => {
    // Simulate rate limit exceeded
    mockGetCachedTranslation.mockRejectedValue(new Error('Rate limit exceeded'))

    const request = createMockRequest({
      text: 'Hello world',
      sourceLanguage: 'en',
      targetLanguage: 'fr',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(429)
    expect(data.error).toBe('Rate limit exceeded')
  })

  it('preserves special characters in translation', async () => {
    const textWithSpecialChars = 'Hello "world" & <test> 中文'
    const mockTranslation = {
      translatedText: 'Bonjour "monde" & <test> 中文',
      sourceLanguage: 'en',
      targetLanguage: 'fr',
      confidence: 0.95,
    }

    mockGetCachedTranslation.mockResolvedValue(null)
    mockTranslateText.mockResolvedValue(mockTranslation)

    const request = createMockRequest({
      text: textWithSpecialChars,
      sourceLanguage: 'en',
      targetLanguage: 'fr',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.translatedText).toBe('Bonjour "monde" & <test> 中文')
  })

  it('handles same source and target language', async () => {
    const request = createMockRequest({
      text: 'Hello world',
      sourceLanguage: 'en',
      targetLanguage: 'en',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.translatedText).toBe('Hello world')
    expect(data.sourceLanguage).toBe('en')
    expect(data.targetLanguage).toBe('en')
    expect(mockTranslateText).not.toHaveBeenCalled()
  })

  it('includes confidence score in response', async () => {
    const mockTranslation = {
      translatedText: 'Bonjour le monde',
      sourceLanguage: 'en',
      targetLanguage: 'fr',
      confidence: 0.87,
    }

    mockGetCachedTranslation.mockResolvedValue(null)
    mockTranslateText.mockResolvedValue(mockTranslation)

    const request = createMockRequest({
      text: 'Hello world',
      sourceLanguage: 'en',
      targetLanguage: 'fr',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.confidence).toBe(0.87)
  })
}) 