import { NextRequest, NextResponse } from 'next/server'

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
        
        const response = await fetch(nllbUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: testCase.text,
            source_language: testCase.source_language,
            target_language: testCase.target_language,
          }),
        })

        const endTime = Date.now()
        const responseTime = endTime - startTime

        if (response.ok) {
          const data = await response.json()
          
          // Handle different response formats
          let translatedText = ''
          if (data.translated_text) {
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
            status: response.status
          })
          
          console.log(`✅ ${testCase.description}: "${testCase.text}" -> "${translatedText}" (${responseTime}ms)`)
        } else {
          const errorText = await response.text()
          results.push({
            ...testCase,
            success: false,
            error: `HTTP ${response.status}: ${errorText}`,
            responseTime,
            status: response.status
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
      success_rate: '0/0'
    }, { status: 503 })
  }
}
