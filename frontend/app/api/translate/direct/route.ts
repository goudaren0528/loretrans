import { NextRequest, NextResponse } from 'next/server'

// 翻译配置
const CONFIG = {
  CHUNK_DELAY: 1000,
  REQUEST_TIMEOUT: 30000
}

// 直接翻译处理（供队列调用）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, sourceLang, targetLang, jobId } = body

    console.log(`[Direct Translation] 开始处理: ${jobId}, 长度: ${text.length}`)

    // 智能分块
    const chunks = smartTextChunking(text, 800) // 使用较小的块大小
    const translatedChunks: string[] = []

    // 串行处理每个块
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      console.log(`[Direct Translation] 处理块 ${i + 1}/${chunks.length}: ${chunk.substring(0, 50)}...`)

      try {
        const result = await translateChunk(chunk, sourceLang, targetLang)
        translatedChunks.push(result)
        
        // 块间延迟
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      } catch (error) {
        console.error(`[Direct Translation] 块 ${i + 1} 失败:`, error)
        translatedChunks.push(chunk) // 使用原文作为后备
      }
    }

    const finalResult = translatedChunks.join(' ')
    
    // 更新数据库
    await updateTranslationResult(jobId, finalResult, 'completed')

    console.log(`[Direct Translation] 完成: ${jobId}`)

    return NextResponse.json({
      success: true,
      result: finalResult
    })

  } catch (error: any) {
    console.error('[Direct Translation] 处理失败:', error)
    
    // 更新数据库为失败状态
    const { jobId } = await request.json()
    if (jobId) {
      await updateTranslationResult(jobId, '', 'failed', error.message)
    }

    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

// 智能分块函数
function smartTextChunking(text: string, maxChunkSize: number): string[] {
  if (text.length <= maxChunkSize) {
    return [text]
  }

  const chunks: string[] = []
  let currentPos = 0

  while (currentPos < text.length) {
    let chunkEnd = Math.min(currentPos + maxChunkSize, text.length)
    
    // 如果不是最后一块，尝试在句子边界分割
    if (chunkEnd < text.length) {
      const sentenceEnd = text.lastIndexOf('.', chunkEnd)
      const questionEnd = text.lastIndexOf('?', chunkEnd)
      const exclamationEnd = text.lastIndexOf('!', chunkEnd)
      
      const bestEnd = Math.max(sentenceEnd, questionEnd, exclamationEnd)
      if (bestEnd > currentPos + maxChunkSize * 0.7) {
        chunkEnd = bestEnd + 1
      }
    }

    chunks.push(text.substring(currentPos, chunkEnd).trim())
    currentPos = chunkEnd
  }

  return chunks.filter(chunk => chunk.length > 0)
}

// 翻译单个块
async function translateChunk(text: string, sourceLang: string, targetLang: string): Promise<string> {
  const nllbServiceUrl = process.env.NLLB_SERVICE_URL || 'https://wane0528-my-nllb-api.hf.space/api/v4/translator'
  
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000) // 30秒超时

  try {
    const response = await fetch(nllbServiceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        source: mapToNLLBLanguageCode(sourceLang),
        target: mapToNLLBLanguageCode(targetLang),
        max_length: 1000
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    return result.result || result.translated_text || result.translation || text

  } catch (error: any) {
    clearTimeout(timeoutId)
    console.error('[Direct Translation] 翻译块失败:', error)
    throw error
  }
}

// 语言代码映射
function mapToNLLBLanguageCode(langCode: string): string {
  const mapping: { [key: string]: string } = {
    'en': 'eng_Latn',
    'zh': 'zho_Hans',
    'lo': 'lao_Laoo',
    'my': 'mya_Mymr',
    'th': 'tha_Thai',
    'vi': 'vie_Latn',
    'km': 'khm_Khmr',
    'ar': 'arb_Arab',
    'hi': 'hin_Deva',
    'fr': 'fra_Latn',
    'es': 'spa_Latn',
    'pt': 'por_Latn'
  }
  return mapping[langCode] || langCode
}

// 更新翻译结果到数据库
async function updateTranslationResult(jobId: string, result: string, status: string, error?: string) {
  try {
    const { createClient } = require('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    }

    if (status === 'completed') {
      updateData.translated_content = result
      updateData.processing_completed_at = new Date().toISOString()
      updateData.progress_percentage = 100
    } else if (status === 'failed') {
      updateData.error_message = error
    }

    await supabase
      .from('translation_jobs')
      .update(updateData)
      .eq('id', jobId)

    console.log(`[Direct Translation] 数据库已更新: ${jobId} -> ${status}`)
  } catch (error) {
    console.error('[Direct Translation] 数据库更新失败:', error)
  }
}
