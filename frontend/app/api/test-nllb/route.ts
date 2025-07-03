import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Testing NLLB service connectivity...')
    
    // 测试NLLB服务连接
    const response = await fetch('http://localhost:8081/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000
    })

    if (!response.ok) {
      throw new Error(`NLLB health check failed: ${response.status}`)
    }

    const healthData = await response.json()
    console.log('NLLB health check success:', healthData)

    // 测试翻译请求
    const translateResponse = await fetch('http://localhost:8081/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'Hello',
        sourceLanguage: 'en',
        targetLanguage: 'ht'
      }),
      timeout: 10000
    })

    if (!translateResponse.ok) {
      throw new Error(`NLLB translate failed: ${translateResponse.status}`)
    }

    const translateData = await translateResponse.json()
    console.log('NLLB translate success:', translateData)

    return NextResponse.json({
      success: true,
      health: healthData,
      translate: translateData,
      message: 'NLLB service is accessible from frontend'
    })

  } catch (error) {
    console.error('NLLB connectivity test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'NLLB service is not accessible from frontend'
    }, { status: 500 })
  }
}
