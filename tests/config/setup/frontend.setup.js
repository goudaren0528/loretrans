// jest.setup.js
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return ''
  },
}))

// Mock Next.js image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage(props) {
    const mockReact = require('react')
    // eslint-disable-next-line @next/next/no-img-element
    return mockReact.createElement('img', props)
  },
}))

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000'
process.env.NEXT_PUBLIC_FILE_PROCESSOR_URL = 'http://localhost:3001'

// Mock fetch globally
global.fetch = jest.fn()

// Global test utilities
global.mockFetch = (response, ok = true) => {
  global.fetch.mockResolvedValueOnce({
    ok,
    json: async () => response,
    text: async () => JSON.stringify(response),
    status: ok ? 200 : 400,
  })
}

global.mockFetchError = (error) => {
  global.fetch.mockRejectedValueOnce(error)
}

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks()
})

// Console error handler for tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
}) 