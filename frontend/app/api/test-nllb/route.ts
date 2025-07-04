import { NextRequest, NextResponse } from 'next/server'

// NLLB语言代码映射
const NLLB_LANGUAGE_MAP: Record<string, string> = {
  'ht': 'hat_Latn', // Haitian Creole
  'lo': 'lao_Laoo', // Lao
  'sw': 'swh_Latn', // Swahili
  'my': 'mya_Mymr', // Burmese
  'te': 'tel_Telu', // Telugu
  'si': 'sin_Sinh', // Sinhala
  'am': 'amh_Ethi', // Amharic
  'km': 'khm_Khmr', // Khmer
  'ne': 'npi_Deva', // Nepali
  'mg': 'plt_Latn', // Malagasy
  'en': 'eng_Latn', // English
  'zh': 'zho_Hans', // Chinese (Simplified)
  'fr': 'fra_Latn', // French
  'es': 'spa_Latn', // Spanish
  'pt': 'por_Latn', // Portuguese
  'ar': 'arb_Arab', // Arabic
  'hi': 'hin_Deva', // Hindi
};

// 获取NLLB格式的语言代码
function getNLLBLanguageCode(language: string): string {
  const nllbCode = NLLB_LANGUAGE_MAP[language];
  if (!nllbCode) {
    throw new Error(`Unsupported language: ${language}`);
  }
  return nllbCode;
}

export async function GET() {
  try {
    console.log('Testing Hugging Face Space NLLB 1.3B service...')
    
    const nllbUrl = process.env.NLLB_SERVICE_URL || 'https://wane0528-my-nllb-api.hf.space/api/v4/translator'
    
    // 测试服务可用性
    console.log(`Checking service availability at: ${nllbUrl}`)
    
    const testCases = [
      {
        text: 'Hello, how are you?',
        source_language: 'en',
        target_language: 'zh',
        description: 'English to Chinese'
      },
      {
        text: 'Bonjour, comment allez-vous?',
        source_language: 'fr', 
        target_language: 'en',
        description: 'French to English'
      },
      {
        text: 'Hola, ¿cómo estás?',
        source_language: 'es',
        target_language: 'en', 
        description: 'Spanish to English'
      }
    ]

    const results = []
    
    for (const testCase of testCases) {
      try {
        console.log(`Testing: ${testCase.description}`)
        const startTime = Date.now()
        
        // Convert to NLLB language codes
        const sourceNLLB = getNLLBLanguageCode(testCase.source_language);
        const targetNLLB = getNLLBLanguageCode(testCase.target_language);
        
        console.log(`Language codes: ${testCase.source_language} -> ${sourceNLLB}, ${testCase.target_language} -> ${targetNLLB}`);
        
        const response = await fetch(nllbUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: testCase.text,
            source: sourceNLLB,
            target: targetNLLB,
          }),
        })

        const endTime = Date.now()
        const responseTime = endTime - startTime

        if (response.ok) {
          const data = await response.json()
          
          // Handle API response format
          let translatedText = ''
          if (data.result) {
            translatedText = data.result
          } else if (data.translated_text) {
            translatedText = data.translated_text
          } else if (data.translation) {
            translatedText = data.translation
          } else if (typeof data === 'string') {
            translatedText = data
          }

          results.push({
            ...testCase,
            success: true,
            translatedText,
            responseTime,
            status: response.status,
            sourceNLLB,
            targetNLLB
          })
          
          console.log(`✅ ${testCase.description}: "${testCase.text}" -> "${translatedText}" (${responseTime}ms)`)
        } else {
          const errorText = await response.text()
          results.push({
            ...testCase,
            success: false,
            error: `HTTP ${response.status}: ${errorText}`,
            responseTime,
            status: response.status,
            sourceNLLB,
            targetNLLB
          })
          
          console.log(`❌ ${testCase.description}: HTTP ${response.status} - ${errorText}`)
        }
      } catch (error: any) {
        results.push({
          ...testCase,
          success: false,
          error: error.message,
          responseTime: 0
        })
        
        console.log(`❌ ${testCase.description}: ${error.message}`)
      }
    }

    const successCount = results.filter(r => r.success).length
    const totalTests = results.length
    const avgResponseTime = results
      .filter(r => r.success)
      .reduce((sum, r) => sum + r.responseTime, 0) / successCount || 0

    const summary = {
      service: 'Hugging Face Space NLLB 1.3B',
      url: nllbUrl,
      timestamp: new Date().toISOString(),
      overall_status: successCount === totalTests ? 'healthy' : successCount > 0 ? 'degraded' : 'unhealthy',
      success_rate: `${successCount}/${totalTests}`,
      average_response_time: `${Math.round(avgResponseTime)}ms`,
      api_format: 'Updated to use correct field names (source/target) and NLLB language codes',
      results
    }

    console.log(`Test completed: ${successCount}/${totalTests} successful, avg response time: ${Math.round(avgResponseTime)}ms`)

    return NextResponse.json(summary, { 
      status: successCount > 0 ? 200 : 503 
    })

  } catch (error: any) {
    console.error('NLLB service test failed:', error)
    
    return NextResponse.json({
      service: 'Hugging Face Space NLLB 1.3B',
      url: process.env.NLLB_SERVICE_URL || 'https://wane0528-my-nllb-api.hf.space/api/v4/translator',
      timestamp: new Date().toISOString(),
      overall_status: 'unhealthy',
      error: error.message,
      success_rate: '0/0',
      api_format: 'Updated to use correct field names (source/target) and NLLB language codes'
    }, { status: 503 })
  }
}
