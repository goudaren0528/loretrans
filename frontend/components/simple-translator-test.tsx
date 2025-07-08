'use client'

import React, { useState } from 'react'

export function SimpleTranslatorTest() {
  const [sourceText, setSourceText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTranslate = async () => {
    if (!sourceText.trim()) return

    setIsLoading(true)
    setError('')
    setTranslatedText('')

    try {
      console.log('🚀 Starting translation...', { sourceText })
      
      const response = await fetch('/api/translate/public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: sourceText,
          sourceLang: 'en',
          targetLang: 'ht'
        })
      })

      const data = await response.json()
      
      console.log('📡 API Response:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Translation failed')
      }

      if (data.translatedText) {
        setTranslatedText(data.translatedText)
        console.log('✅ Translation set:', data.translatedText)
      } else {
        throw new Error('No translation text in response')
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('❌ Translation error:', errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Simple Translation Test</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            English Text:
          </label>
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="Enter English text to translate to Haitian Creole..."
            className="w-full p-3 border border-gray-300 rounded-md resize-none h-24"
            disabled={isLoading}
          />
        </div>

        <button
          onClick={handleTranslate}
          disabled={!sourceText.trim() || isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Translating...' : 'Translate to Haitian Creole'}
        </button>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">
            Haitian Creole Translation:
          </label>
          <textarea
            value={translatedText}
            readOnly
            placeholder={isLoading ? 'Translating...' : 'Translation will appear here...'}
            className="w-full p-3 border border-gray-300 rounded-md resize-none h-24 bg-gray-50"
          />
        </div>

        {translatedText && (
          <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
            <strong>✅ Translation successful!</strong>
          </div>
        )}
      </div>
    </div>
  )
}
