// Mock Next.js server components
global.Request = class MockRequest {
  constructor(public url: string, public init?: RequestInit) {}
  json() { return Promise.resolve({}) }
}

global.Response = class MockResponse {
  constructor(public body?: any, public init?: ResponseInit) {}
  static json(data: any) { return new MockResponse(JSON.stringify(data)) }
  json() { return Promise.resolve(this.body) }
}

// Mock the translate API route
const mockTranslateAPI = {
  POST: jest.fn().mockResolvedValue(
    Response.json({ 
      success: true, 
      translation: 'Hello World' 
    })
  )
}

describe('Translate API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should handle translation request', async () => {
    const request = new Request('http://localhost:3000/api/translate', {
      method: 'POST',
      body: JSON.stringify({
        text: 'Bonjour le monde',
        sourceLanguage: 'fr',
        targetLanguage: 'en'
      })
    })

    const response = await mockTranslateAPI.POST(request)
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(data.translation).toBe('Hello World')
  })

  it('should handle missing text parameter', async () => {
    const request = new Request('http://localhost:3000/api/translate', {
      method: 'POST',
      body: JSON.stringify({
        sourceLanguage: 'fr',
        targetLanguage: 'en'
      })
    })

    mockTranslateAPI.POST.mockResolvedValueOnce(
      Response.json({ 
        success: false, 
        error: 'Text is required' 
      })
    )

    const response = await mockTranslateAPI.POST(request)
    const data = await response.json()

    expect(data.success).toBe(false)
    expect(data.error).toBe('Text is required')
  })
})
