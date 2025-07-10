import { createMocks } from 'node-mocks-http'
import { POST } from '@/app/api/translate/route'

// Mock Supabase
jest.mock('@/lib/supabase-server', () => ({
  createServerSupabaseClient: () => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      }),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: { credits: 1000 },
            error: null,
          }),
        })),
      })),
    })),
  }),
}))

// Mock credit service
jest.mock('@/lib/services/credits', () => ({
  createServerCreditService: () => ({
    calculateCreditsRequired: jest.fn((characterCount) => ({
      total_characters: characterCount,
      free_characters: Math.min(characterCount, 1000),
      billable_characters: Math.max(0, characterCount - 1000),
      credits_required: Math.max(0, (characterCount - 1000) * 0.1),
    })),
    consumeTranslationCredits: jest.fn().mockResolvedValue({
      success: true,
      calculation: { credits_required: 10 },
      transaction_id: 'test-transaction-id',
      credits_remaining: 990,
    }),
    rewardCredits: jest.fn().mockResolvedValue(true),
  }),
}))

// Mock next-intl
jest.mock('next-intl/server', () => ({
  getLocale: jest.fn().mockResolvedValue('en'),
  getTranslations: jest.fn().mockResolvedValue((key: string) => key),
}))

// Mock fetch for NLLB service
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('/api/translate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockClear()
  })

  it('successfully translates text with free credits', async () => {
    // Mock successful NLLB response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        translated_text: '你好世界',
        processing_time: 1250,
      }),
    })

    const { req } = createMocks({
      method: 'POST',
      body: {
        text: 'Hello world',
        sourceLang: 'en',
        targetLang: 'zh',
      },
    })

    // Add user context (normally added by withApiAuth middleware)
    req.userContext = {
      user: { id: 'test-user-id' },
      role: 'free_user',
    }

    const response = await POST(req as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.translatedText).toBe('你好世界')
    expect(data.method).toBe('hf-nllb-1.3b')
    expect(data.model).toBe('NLLB-1.3B')
    expect(data.provider).toBe('Hugging Face Space')
  })

  it('handles long text requiring credits', async () => {
    const longText = 'A'.repeat(1000) // 1000 characters, requires credits

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        translated_text: 'A'.repeat(1000),
        processing_time: 5000,
      }),
    })

    const { req } = createMocks({
      method: 'POST',
      body: {
        text: longText,
        sourceLang: 'en',
        targetLang: 'zh',
      },
    })

    req.userContext = {
      user: { id: 'test-user-id' },
      role: 'free_user',
    }

    const response = await POST(req as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.calculation.credits_required).toBe(50) // (1000-500) * 0.1
  })

  it('handles insufficient credits', async () => {
    // Mock credit service to return insufficient credits
    const mockCreditService = require('@/lib/services/credits').createServerCreditService()
    mockCreditService.consumeTranslationCredits.mockResolvedValueOnce({
      success: false,
      calculation: { credits_required: 100 },
      error: 'Insufficient credits',
    })

    const { req } = createMocks({
      method: 'POST',
      body: {
        text: 'A'.repeat(1500), // Long text requiring many credits
        sourceLang: 'en',
        targetLang: 'zh',
      },
    })

    req.userContext = {
      user: { id: 'test-user-id' },
      role: 'free_user',
    }

    const response = await POST(req as any)
    const data = await response.json()

    expect(response.status).toBe(402)
    expect(data.error).toBe('insufficient_credits')
  })

  it('handles NLLB service errors and refunds credits', async () => {
    // Mock NLLB service error
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      text: async () => 'Service unavailable',
    })

    const { req } = createMocks({
      method: 'POST',
      body: {
        text: 'A'.repeat(1000), // Text that requires credits
        sourceLang: 'en',
        targetLang: 'zh',
      },
    })

    req.userContext = {
      user: { id: 'test-user-id' },
      role: 'free_user',
    }

    const response = await POST(req as any)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('translation_failed')

    // Should have attempted to refund credits
    const mockCreditService = require('@/lib/services/credits').createServerCreditService()
    expect(mockCreditService.rewardCredits).toHaveBeenCalled()
  })

  it('handles NLLB service timeout', async () => {
    // Mock timeout error
    mockFetch.mockRejectedValueOnce(new Error('AbortError'))

    const { req } = createMocks({
      method: 'POST',
      body: {
        text: 'Hello world',
        sourceLang: 'en',
        targetLang: 'zh',
      },
    })

    req.userContext = {
      user: { id: 'test-user-id' },
      role: 'free_user',
    }

    const response = await POST(req as any)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('translation_failed')
  })

  it('validates required parameters', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: {
        text: 'Hello world',
        // Missing sourceLang and targetLang
      },
    })

    req.userContext = {
      user: { id: 'test-user-id' },
      role: 'free_user',
    }

    const response = await POST(req as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('missing_parameters')
  })

  it('handles unauthenticated requests', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: {
        text: 'Hello world',
        sourceLang: 'en',
        targetLang: 'zh',
      },
    })

    // No user context (unauthenticated)
    req.userContext = {
      user: null,
      role: null,
    }

    const response = await POST(req as any)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('user_not_authenticated')
  })

  it('handles different NLLB response formats', async () => {
    // Test different response formats from HF Space
    const testCases = [
      { translated_text: '你好世界' }, // Primary format
      { translation: '你好世界' }, // Alternative format
      '你好世界', // Direct string response
    ]

    for (const responseFormat of testCases) {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => responseFormat,
      })

      const { req } = createMocks({
        method: 'POST',
        body: {
          text: 'Hello world',
          sourceLang: 'en',
          targetLang: 'zh',
        },
      })

      req.userContext = {
        user: { id: 'test-user-id' },
        role: 'free_user',
      }

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.translatedText).toBe('你好世界')
    }
  })

  it('handles empty translation response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}), // Empty response
    })

    const { req } = createMocks({
      method: 'POST',
      body: {
        text: 'Hello world',
        sourceLang: 'en',
        targetLang: 'zh',
      },
    })

    req.userContext = {
      user: { id: 'test-user-id' },
      role: 'free_user',
    }

    const response = await POST(req as any)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('translation_failed')
  })

  it('tracks translation metrics', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        translated_text: '你好世界',
        processing_time: 2500,
      }),
    })

    const { req } = createMocks({
      method: 'POST',
      body: {
        text: 'Hello world',
        sourceLang: 'en',
        targetLang: 'zh',
      },
    })

    req.userContext = {
      user: { id: 'test-user-id' },
      role: 'free_user',
    }

    const response = await POST(req as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.processingTime).toBe(2500)
    expect(data.method).toBe('hf-nllb-1.3b')
    expect(data.provider).toBe('Hugging Face Space')
  })
})
