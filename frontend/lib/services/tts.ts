/**
 * Text-to-Speech (TTS) 服务
 * 支持多个TTS提供商：Edge Speech API、Google TTS等
 */

interface TTSRequest {
  text: string
  language: string
  voice?: string
  rate?: number
  pitch?: number
}

interface TTSResponse {
  audioUrl: string
  format: string
  duration?: number
  language: string
  voice: string
  processingTime: number
}

interface VoiceOptions {
  code: string
  name: string
  gender: 'male' | 'female'
  language: string
}

/**
 * 支持的语音选项
 */
const VOICE_OPTIONS: Record<string, VoiceOptions[]> = {
  'en': [
    { code: 'en-US-AriaNeural', name: 'Aria (US Female)', gender: 'female', language: 'en-US' },
    { code: 'en-US-DavisNeural', name: 'Davis (US Male)', gender: 'male', language: 'en-US' },
    { code: 'en-GB-SoniaNeural', name: 'Sonia (UK Female)', gender: 'female', language: 'en-GB' },
    { code: 'en-GB-RyanNeural', name: 'Ryan (UK Male)', gender: 'male', language: 'en-GB' },
  ],
  'sw': [
    { code: 'sw-KE-ZuriNeural', name: 'Zuri (Female)', gender: 'female', language: 'sw-KE' },
    { code: 'sw-TZ-DaudiNeural', name: 'Daudi (Male)', gender: 'male', language: 'sw-TZ' },
  ],
  'am': [
    { code: 'am-ET-MekdesNeural', name: 'Mekdes (Female)', gender: 'female', language: 'am-ET' },
    { code: 'am-ET-AmehaNeural', name: 'Ameha (Male)', gender: 'male', language: 'am-ET' },
  ],
  'ne': [
    { code: 'ne-NP-SagarNeural', name: 'Sagar (Male)', gender: 'male', language: 'ne-NP' },
    { code: 'ne-NP-HemkalaNeural', name: 'Hemkala (Female)', gender: 'female', language: 'ne-NP' },
  ],
}

/**
 * 获取语言的默认语音
 */
function getDefaultVoice(language: string): string {
  const voices = VOICE_OPTIONS[language]
  if (!voices || voices.length === 0) {
    // 如果没有该语言的专用语音，使用英语作为后备
    return VOICE_OPTIONS['en'][0].code
  }
  return voices[0].code
}

/**
 * 验证语言是否支持TTS
 */
export function isTTSSupported(language: string): boolean {
  return language in VOICE_OPTIONS || language === 'en'
}

/**
 * 获取支持TTS的语言列表
 */
export function getSupportedTTSLanguages(): string[] {
  return Object.keys(VOICE_OPTIONS)
}

/**
 * 获取指定语言的语音选项
 */
export function getVoiceOptions(language: string): VoiceOptions[] {
  return VOICE_OPTIONS[language] || VOICE_OPTIONS['en']
}

/**
 * 使用Edge Speech API进行TTS
 */
async function generateSpeechWithEdge(request: TTSRequest): Promise<ArrayBuffer> {
  const voice = request.voice || getDefaultVoice(request.language)
  const rate = request.rate || 1.0
  const pitch = request.pitch || 1.0
  
  // 构造SSML
  const ssml = `
    <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${request.language}">
      <voice name="${voice}">
        <prosody rate="${rate}" pitch="${pitch > 1 ? '+' + ((pitch - 1) * 100) + '%' : pitch < 1 ? '-' + ((1 - pitch) * 100) + '%' : '0%'}">
          ${escapeXml(request.text)}
        </prosody>
      </voice>
    </speak>
  `.trim()

  // 使用edge-tts库的替代方案 - 这里使用模拟实现
  // 在生产环境中，你需要集成真实的Edge Speech API
  
  // 模拟API调用
  return new Promise((resolve, reject) => {
    // 这里应该是真实的Edge Speech API调用
    // 为了演示，我们返回一个空的ArrayBuffer
    setTimeout(() => {
      resolve(new ArrayBuffer(0))
    }, 1000)
  })
}

/**
 * 使用Google TTS API作为备选
 */
async function generateSpeechWithGoogle(request: TTSRequest): Promise<ArrayBuffer> {
  const apiKey = process.env.GOOGLE_TTS_API_KEY
  if (!apiKey) {
    throw new Error('Google TTS API key not configured')
  }

  const voice = request.voice || getDefaultVoice(request.language)
  
  const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: { text: request.text },
      voice: {
        languageCode: request.language,
        name: voice,
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: request.rate || 1.0,
        pitch: (request.pitch || 1.0) * 4 - 4, // Google使用-20到20的范围
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Google TTS API error: ${response.status}`)
  }

  const data = await response.json()
  if (!data.audioContent) {
    throw new Error('No audio content in Google TTS response')
  }

  // 将base64转换为ArrayBuffer
  const binaryString = atob(data.audioContent)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  
  return bytes.buffer
}

/**
 * Web Speech API (浏览器内置，仅限前端使用)
 */
export function generateSpeechWithWebAPI(text: string, language: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // 检查是否在浏览器环境中
    if (typeof window === 'undefined') {
      reject(new Error('Web Speech API not available in server environment'))
      return
    }

    if (!('speechSynthesis' in window)) {
      reject(new Error('Web Speech API not supported'))
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = language
    utterance.onend = () => resolve()
    utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`))

    window.speechSynthesis.speak(utterance)
  })
}

/**
 * 检查是否使用mock模式
 */
function shouldUseMockTTS(): boolean {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const useMock = process.env.USE_MOCK_TTS === 'true'
  const hasGoogleKey = !!process.env.GOOGLE_TTS_API_KEY
  
  return useMock || (isDevelopment && !hasGoogleKey)
}

/**
 * 生成mock音频数据
 */
function generateMockAudio(): ArrayBuffer {
  // 生成简单的波形数据作为mock
  const sampleRate = 44100
  const duration = 1.0 // 1秒
  const samples = sampleRate * duration
  const buffer = new ArrayBuffer(samples * 2)
  const view = new DataView(buffer)
  
  for (let i = 0; i < samples; i++) {
    const amplitude = 0.1
    const frequency = 440 // A4音符
    const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate) * amplitude
    const intSample = Math.max(-32768, Math.min(32767, sample * 32768))
    view.setInt16(i * 2, intSample, true)
  }
  
  return buffer
}

/**
 * 主要TTS函数
 */
export async function generateSpeech(request: TTSRequest): Promise<TTSResponse> {
  const startTime = Date.now()

  try {
    // 验证输入
    if (!request.text || request.text.trim().length === 0) {
      throw new Error('Text is required for TTS')
    }

    // 验证文本长度
    if (request.text.length > 500) {
      throw new Error('Text is too long for TTS. Maximum 500 characters allowed.')
    }

    // 验证语言支持
    if (!isTTSSupported(request.language)) {
      // 如果不支持该语言，使用英语作为后备
      request.language = 'en'
    }

    let audioBuffer: ArrayBuffer
    let format = 'mp3'

    try {
      // 优先使用Edge Speech API
      audioBuffer = await generateSpeechWithEdge(request)
    } catch (edgeError) {
      console.warn('Edge TTS failed, trying Google TTS:', edgeError)
      
      try {
        // 备选Google TTS
        audioBuffer = await generateSpeechWithGoogle(request)
      } catch (googleError) {
        console.warn('Google TTS also failed:', googleError)
        throw new Error('All TTS services are currently unavailable')
      }
    }

    // 在实际实现中，这里应该将音频文件上传到云存储
    // 并返回公共URL。为了演示，我们返回一个模拟URL
    const audioUrl = `data:audio/mp3;base64,${btoa(String.fromCharCode(...new Uint8Array(audioBuffer)))}`

    const voice = request.voice || getDefaultVoice(request.language)

    return {
      audioUrl,
      format,
      language: request.language,
      voice,
      processingTime: Date.now() - startTime,
    }

  } catch (error) {
    throw new Error(`TTS generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * 批量TTS生成
 */
export async function generateSpeechBatch(
  requests: TTSRequest[]
): Promise<TTSResponse[]> {
  const results: TTSResponse[] = []
  
  for (const request of requests) {
    try {
      const result = await generateSpeech(request)
      results.push(result)
    } catch (error) {
      // 为失败的TTS添加错误信息
      results.push({
        audioUrl: '',
        format: 'mp3',
        language: request.language,
        voice: request.voice || getDefaultVoice(request.language),
        processingTime: 0,
      })
    }
  }
  
  return results
}

/**
 * 清理文本用于TTS
 */
export function sanitizeTextForTTS(text: string): string {
  return text
    .replace(/[<>&"']/g, '') // 移除XML/HTML特殊字符
    .replace(/\s+/g, ' ')    // 标准化空白字符
    .trim()
}

/**
 * XML转义工具函数
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
} 