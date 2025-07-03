import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UnifiedTranslator } from '../unified-translator'

// Mock the hooks and services
jest.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
    isLoading: false,
  }),
  useCredits: () => ({
    credits: 1000,
    estimateCredits: jest.fn(() => ({ credits_required: 10 })),
  }),
}))

jest.mock('@/components/guest-limit-guard', () => ({
  useGuestLimit: () => ({
    checkLimit: jest.fn(() => true),
    remainingUses: 5,
  }),
}))

jest.mock('@/lib/hooks/use-toast', () => ({
  toast: jest.fn(),
}))

// Mock fetch for translation API
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('UnifiedTranslator', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockClear()
  })

  it('renders the translator interface correctly', () => {
    render(<UnifiedTranslator />)
    
    expect(screen.getByPlaceholderText(/enter text to translate/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /translate/i })).toBeInTheDocument()
    expect(screen.getByText(/source language/i)).toBeInTheDocument()
    expect(screen.getByText(/target language/i)).toBeInTheDocument()
  })

  it('handles text input correctly', async () => {
    const user = userEvent.setup()
    render(<UnifiedTranslator />)
    
    const textArea = screen.getByPlaceholderText(/enter text to translate/i)
    await user.type(textArea, 'Hello world')
    
    expect(textArea).toHaveValue('Hello world')
  })

  it('shows character count and credit estimation', async () => {
    const user = userEvent.setup()
    render(<UnifiedTranslator />)
    
    const textArea = screen.getByPlaceholderText(/enter text to translate/i)
    await user.type(textArea, 'Hello world')
    
    // Should show character count
    expect(screen.getByText(/11/)).toBeInTheDocument()
    
    // Should show credit estimation
    await waitFor(() => {
      expect(screen.getByText(/estimated credits/i)).toBeInTheDocument()
    })
  })

  it('handles language selection', async () => {
    const user = userEvent.setup()
    render(<UnifiedTranslator />)
    
    // Test source language selection
    const sourceSelect = screen.getByLabelText(/source language/i)
    await user.click(sourceSelect)
    
    // Should show language options
    await waitFor(() => {
      expect(screen.getByText(/english/i)).toBeInTheDocument()
      expect(screen.getByText(/chinese/i)).toBeInTheDocument()
    })
  })

  it('performs translation successfully', async () => {
    const user = userEvent.setup()
    
    // Mock successful translation response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        translatedText: '你好世界',
        calculation: { credits_required: 10 },
        method: 'hf-nllb-1.3b',
      }),
    })
    
    render(<UnifiedTranslator />)
    
    // Enter text
    const textArea = screen.getByPlaceholderText(/enter text to translate/i)
    await user.type(textArea, 'Hello world')
    
    // Click translate button
    const translateButton = screen.getByRole('button', { name: /translate/i })
    await user.click(translateButton)
    
    // Should show loading state
    expect(screen.getByText(/translating/i)).toBeInTheDocument()
    
    // Should show translation result
    await waitFor(() => {
      expect(screen.getByText('你好世界')).toBeInTheDocument()
    })
  })

  it('handles translation errors gracefully', async () => {
    const user = userEvent.setup()
    
    // Mock failed translation response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({
        error: 'Translation service unavailable',
      }),
    })
    
    render(<UnifiedTranslator />)
    
    // Enter text and translate
    const textArea = screen.getByPlaceholderText(/enter text to translate/i)
    await user.type(textArea, 'Hello world')
    
    const translateButton = screen.getByRole('button', { name: /translate/i })
    await user.click(translateButton)
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/translation failed/i)).toBeInTheDocument()
    })
  })

  it('handles insufficient credits', async () => {
    const user = userEvent.setup()
    
    // Mock insufficient credits response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 402,
      json: async () => ({
        error: 'Insufficient credits',
        calculation: { credits_required: 100 },
      }),
    })
    
    render(<UnifiedTranslator />)
    
    // Enter long text that requires credits
    const textArea = screen.getByPlaceholderText(/enter text to translate/i)
    await user.type(textArea, 'A'.repeat(1000)) // Long text
    
    const translateButton = screen.getByRole('button', { name: /translate/i })
    await user.click(translateButton)
    
    // Should show insufficient credits message
    await waitFor(() => {
      expect(screen.getByText(/insufficient credits/i)).toBeInTheDocument()
    })
  })

  it('supports copy to clipboard functionality', async () => {
    const user = userEvent.setup()
    
    // Mock successful translation
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        translatedText: '你好世界',
        calculation: { credits_required: 0 },
      }),
    })
    
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(),
      },
    })
    
    render(<UnifiedTranslator />)
    
    // Perform translation
    const textArea = screen.getByPlaceholderText(/enter text to translate/i)
    await user.type(textArea, 'Hello world')
    
    const translateButton = screen.getByRole('button', { name: /translate/i })
    await user.click(translateButton)
    
    // Wait for translation result
    await waitFor(() => {
      expect(screen.getByText('你好世界')).toBeInTheDocument()
    })
    
    // Click copy button
    const copyButton = screen.getByRole('button', { name: /copy/i })
    await user.click(copyButton)
    
    // Should call clipboard API
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('你好世界')
  })

  it('handles language swap functionality', async () => {
    const user = userEvent.setup()
    render(<UnifiedTranslator />)
    
    // Find and click swap button
    const swapButton = screen.getByRole('button', { name: /swap languages/i })
    await user.click(swapButton)
    
    // Languages should be swapped
    // This would require checking the actual language selection state
    // Implementation depends on how the component manages language state
  })

  it('shows smart time estimation', async () => {
    const user = userEvent.setup()
    render(<UnifiedTranslator />)
    
    // Enter long text that would trigger queue processing
    const textArea = screen.getByPlaceholderText(/enter text to translate/i)
    await user.type(textArea, 'A'.repeat(2000)) // Very long text
    
    // Should show time estimation
    await waitFor(() => {
      expect(screen.getByText(/estimated time/i)).toBeInTheDocument()
    })
  })

  it('handles mobile responsive behavior', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })
    
    render(<UnifiedTranslator />)
    
    // Should render mobile-friendly interface
    // This would require checking for mobile-specific classes or components
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('supports keyboard shortcuts', async () => {
    const user = userEvent.setup()
    render(<UnifiedTranslator />)
    
    const textArea = screen.getByPlaceholderText(/enter text to translate/i)
    await user.type(textArea, 'Hello world')
    
    // Test Ctrl+Enter shortcut for translation
    await user.keyboard('{Control>}{Enter}{/Control}')
    
    // Should trigger translation
    await waitFor(() => {
      expect(screen.getByText(/translating/i)).toBeInTheDocument()
    })
  })
})
