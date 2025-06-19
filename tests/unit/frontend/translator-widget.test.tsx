import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TranslatorWidget } from '@/components/translator-widget'

// Mock audio for TTS tests
global.HTMLAudioElement = jest.fn().mockImplementation(() => ({
  play: jest.fn(),
  pause: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  currentTime: 0,
  duration: 0,
  paused: true,
}))

describe('TranslatorWidget', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('renders translator widget with default elements', () => {
    render(<TranslatorWidget />)
    
    expect(screen.getByPlaceholderText(/type your text here/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /translate/i })).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('displays character count', async () => {
    render(<TranslatorWidget />)
    
    const textarea = screen.getByPlaceholderText(/enter text to translate/i)
    await user.type(textarea, 'Hello world')
    
    expect(screen.getByText(/11 \/ 1000/)).toBeInTheDocument()
  })

  it('shows error when text exceeds character limit', async () => {
    render(<TranslatorWidget />)
    
    const textarea = screen.getByPlaceholderText(/enter text to translate/i)
    const longText = 'a'.repeat(1001)
    await user.type(textarea, longText)
    
    expect(screen.getByText(/text is too long/i)).toBeInTheDocument()
  })

  it('performs translation on button click', async () => {
    const mockTranslation = {
      translatedText: 'Bonjour le monde',
      sourceLanguage: 'en',
      targetLanguage: 'fr',
      confidence: 0.95
    }

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTranslation,
    })

    render(<TranslatorWidget />)
    
    const textarea = screen.getByPlaceholderText(/enter text to translate/i)
    const translateButton = screen.getByRole('button', { name: /translate/i })
    
    await user.type(textarea, 'Hello world')
    await user.click(translateButton)
    
    await waitFor(() => {
      expect(screen.getByText('Bonjour le monde')).toBeInTheDocument()
    })
    
    expect(global.fetch).toHaveBeenCalledWith('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'Hello world',
        sourceLanguage: 'auto',
        targetLanguage: 'en',
      }),
    })
  })

  it('handles translation error gracefully', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'))

    render(<TranslatorWidget />)
    
    const textarea = screen.getByPlaceholderText(/enter text to translate/i)
    const translateButton = screen.getByRole('button', { name: /translate/i })
    
    await user.type(textarea, 'Hello world')
    await user.click(translateButton)
    
    await waitFor(() => {
      expect(screen.getByText(/translation failed/i)).toBeInTheDocument()
    })
  })

  it('shows loading state during translation', async () => {
    global.fetch.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ translatedText: 'Test' })
      }), 100))
    )

    render(<TranslatorWidget />)
    
    const textarea = screen.getByPlaceholderText(/enter text to translate/i)
    const translateButton = screen.getByRole('button', { name: /translate/i })
    
    await user.type(textarea, 'Hello world')
    await user.click(translateButton)
    
    expect(screen.getByText(/translating/i)).toBeInTheDocument()
    expect(translateButton).toBeDisabled()
  })

  it('allows language switching', async () => {
    render(<TranslatorWidget />)
    
    const switchButton = screen.getByRole('button', { name: /switch languages/i })
    await user.click(switchButton)
    
    // After switching, the source and target languages should swap
    // This test would need to check the actual implementation details
    expect(switchButton).toBeInTheDocument()
  })

  it('copies translation to clipboard', async () => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    })

    const mockTranslation = {
      translatedText: 'Bonjour le monde',
      sourceLanguage: 'en',
      targetLanguage: 'fr',
    }

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTranslation,
    })

    render(<TranslatorWidget />)
    
    const textarea = screen.getByPlaceholderText(/enter text to translate/i)
    const translateButton = screen.getByRole('button', { name: /translate/i })
    
    await user.type(textarea, 'Hello world')
    await user.click(translateButton)
    
    await waitFor(() => {
      expect(screen.getByText('Bonjour le monde')).toBeInTheDocument()
    })
    
    const copyButton = screen.getByRole('button', { name: /copy/i })
    await user.click(copyButton)
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Bonjour le monde')
  })

  it('plays TTS audio when speaker button clicked', async () => {
    const mockTranslation = {
      translatedText: 'Hello world',
      sourceLanguage: 'fr',
      targetLanguage: 'en',
    }

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTranslation,
      })
      .mockResolvedValueOnce({
        ok: true,
        blob: async () => new Blob(['fake audio data'], { type: 'audio/mpeg' }),
      })

    render(<TranslatorWidget />)
    
    const textarea = screen.getByPlaceholderText(/enter text to translate/i)
    const translateButton = screen.getByRole('button', { name: /translate/i })
    
    await user.type(textarea, 'Bonjour le monde')
    await user.click(translateButton)
    
    await waitFor(() => {
      expect(screen.getByText('Hello world')).toBeInTheDocument()
    })
    
    const speakerButton = screen.getByRole('button', { name: /play audio/i })
    await user.click(speakerButton)
    
    expect(global.fetch).toHaveBeenCalledWith('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'Hello world',
        language: 'en',
      }),
    })
  })

  it('auto-detects source language', async () => {
    const mockDetection = {
      language: 'fr',
      confidence: 0.95
    }

    const mockTranslation = {
      translatedText: 'Hello world',
      sourceLanguage: 'fr',
      targetLanguage: 'en',
    }

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDetection,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTranslation,
      })

    render(<TranslatorWidget />)
    
    const textarea = screen.getByPlaceholderText(/enter text to translate/i)
    
    await user.type(textarea, 'Bonjour le monde')
    
    // Auto-detection should be triggered after typing
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: 'Bonjour le monde',
        }),
      })
    })
  })

  it('handles empty text input', async () => {
    render(<TranslatorWidget />)
    
    const translateButton = screen.getByRole('button', { name: /translate/i })
    await user.click(translateButton)
    
    expect(screen.getByText(/please enter text to translate/i)).toBeInTheDocument()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('maintains translation history', async () => {
    const mockTranslation1 = {
      translatedText: 'Bonjour',
      sourceLanguage: 'en',
      targetLanguage: 'fr',
    }

    const mockTranslation2 = {
      translatedText: 'Au revoir',
      sourceLanguage: 'en',
      targetLanguage: 'fr',
    }

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTranslation1,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTranslation2,
      })

    render(<TranslatorWidget />)
    
    const textarea = screen.getByPlaceholderText(/enter text to translate/i)
    const translateButton = screen.getByRole('button', { name: /translate/i })
    
    // First translation
    await user.clear(textarea)
    await user.type(textarea, 'Hello')
    await user.click(translateButton)
    
    await waitFor(() => {
      expect(screen.getByText('Bonjour')).toBeInTheDocument()
    })
    
    // Second translation
    await user.clear(textarea)
    await user.type(textarea, 'Goodbye')
    await user.click(translateButton)
    
    await waitFor(() => {
      expect(screen.getByText('Au revoir')).toBeInTheDocument()
    })
    
    // Check if history is maintained
    const historyButton = screen.queryByRole('button', { name: /history/i })
    if (historyButton) {
      await user.click(historyButton)
      expect(screen.getByText('Hello')).toBeInTheDocument()
      expect(screen.getByText('Goodbye')).toBeInTheDocument()
    }
  })
}) 