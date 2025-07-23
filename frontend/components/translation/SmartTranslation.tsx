'use client'

import React, { useState } from 'react'
import { shouldUseStreaming } from '@/lib/config/streaming'
import StreamingTranslation from '@/components/StreamingTranslation'
import RegularTranslation from '@/components/RegularTranslation'

interface SmartTranslationProps {
  text: string
  sourceLang: string
  targetLang: string
  onComplete?: (result: string) => void
  onError?: (error: string) => void
}

export default function SmartTranslation(props: SmartTranslationProps) {
  const { text } = props
  const useStreaming = shouldUseStreaming(text.length)
  
  if (useStreaming) {
    return <StreamingTranslation {...props} />
  } else {
    return <RegularTranslation {...props} />
  }
}
