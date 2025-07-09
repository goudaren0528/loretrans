import { NextRequest, NextResponse } from 'next/server'
import { withApiAuth, type NextRequestWithUser } from '@/lib/api-utils'
import { createServerCreditService } from '@/lib/services/credits'

interface TranslationRequest {
  fileId: string
  sourceLanguage: string
  targetLanguage: string
  options?: {
    priority?: 'normal' | 'high'
    preserveFormatting?: boolean
  }
}

async function translateHandler(req: NextRequestWithUser) {
  try {
    const { user, role } = req.userContext

    if (!user) {
      return NextResponse.json({
        error: '需要登录账户',
        code: 'AUTH_REQUIRED'
      }, { status: 401 })
    }

    const body: TranslationRequest = await req.json()
    const { fileId, sourceLanguage, targetLanguage, options = {} } = body

    if (!fileId || !sourceLanguage || !targetLanguage) {
      return NextResponse.json({
        error: '缺少必要参数',
        code: 'MISSING_PARAMETERS'
      }, { status: 400 })
    }

    // 从缓存中获取文档内容
    ;(global as any).documentCache = (global as any).documentCache || new Map()
    const documentData = (global as any).documentCache.get(fileId)

    if (!documentData) {
      return NextResponse.json({
        error: '文档不存在或已过期，请重新上传',
        code: 'DOCUMENT_NOT_FOUND'
      }, { status: 404 })
    }

    // 验证用户权限
    if (documentData.userId !== user.id) {
      return NextResponse.json({
        error: '无权访问此文档',
        code: 'ACCESS_DENIED'
      }, { status: 403 })
    }

    const { text, characterCount, metadata } = documentData

    // 计算积分消耗
    const creditService = createServerCreditService()
    const calculation = creditService.calculateCreditsRequired(characterCount)

    // 直接查询用户积分表，避免服务器端认证问题
    let userCredits = 0
    try {
      const { createSupabaseServerClient } = await import('@/lib/supabase')
      const supabase = createSupabaseServerClient()
      
      console.log('[Document Translation Credit Check]', {
        userId: user.id,
        characterCount,
        creditsRequired: calculation.credits_required
      })
      
      // 查询users表的credits字段
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('credits')
        .eq('id', user.id)
        .single()
      
      if (userError) {
        console.error('查询用户积分失败:', userError)
        // 如果查询失败，尝试创建用户记录
        const { data: insertData, error: insertError } = await supabase
          .from('users')
          .insert({ 
            id: user.id, 
            email: user.email || '',
            credits: 500 
          })
          .select('credits')
          .single()
        
        if (!insertError && insertData) {
          userCredits = insertData.credits
          console.log('创建新用户积分记录:', userCredits)
        }
      } else if (userData) {
        userCredits = userData.credits
        console.log('查询到用户积分:', userCredits)
      }
    } catch (error) {
      console.error('积分查询异常:', error)
    }

    // 检查积分是否充足
    if (userCredits < calculation.credits_required) {
      console.log('[Insufficient Credits]', {
        required: calculation.credits_required,
        available: userCredits,
        userId: user.id
      })
      
      return NextResponse.json({
        error: '积分不足，请充值后重试',
        code: 'INSUFFICIENT_CREDITS',
        required: calculation.credits_required,
        available: userCredits
      }, { status: 402 })
    }

    // 生成翻译任务ID
    const translationId = `trans_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // 调用翻译服务
    const translationResult = await performTranslation(text, sourceLanguage, targetLanguage)

    if (!translationResult.success) {
      return NextResponse.json({
        error: translationResult.error || '翻译失败',
        code: 'TRANSLATION_ERROR'
      }, { status: 500 })
    }

    // 扣除积分 - 使用直接的数据库操作
    if (calculation.credits_required > 0) {
      try {
        const { createSupabaseServerClient } = await import('@/lib/supabase')
        const supabase = createSupabaseServerClient()
        
        console.log('[Document Translation Credit Deduction]', {
          userId: user.id,
          creditsToDeduct: calculation.credits_required,
          currentCredits: userCredits
        })
        
        // 原子性扣除积分
        const { data: deductResult, error: deductError } = await supabase
          .rpc('consume_credits_atomic', {
            p_user_id: user.id,
            p_credits_required: calculation.credits_required,
            p_character_count: characterCount,
            p_source_lang: sourceLanguage,
            p_target_lang: targetLanguage,
            p_translation_type: 'document'
          })
        
        if (deductError) {
          console.error('积分扣除失败:', deductError)
          // 积分扣除失败，但翻译已完成，记录错误但不影响结果返回
        } else {
          console.log('积分扣除成功:', deductResult)
        }
      } catch (error) {
        console.error('积分扣除异常:', error)
      }
    }

    // 存储翻译结果
    ;(global as any).translationCache = (global as any).translationCache || new Map()
    ;(global as any).translationCache.set(translationId, {
      originalText: text,
      translatedText: translationResult.translatedText,
      sourceLanguage,
      targetLanguage,
      characterCount,
      metadata,
      userId: user.id,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7天后过期
    })

    return NextResponse.json({
      success: true,
      translationId,
      status: 'completed',
      result: {
        originalText: text.substring(0, 500) + (text.length > 500 ? '...' : ''),
        translatedText: translationResult.translatedText, // 返回完整翻译文本
        characterCount,
        sourceLanguage,
        targetLanguage,
        processingTime: translationResult.processingTime
      },
      creditsUsed: calculation.credits_required,
      remainingCredits: userCredits - calculation.credits_required
    })

  } catch (error) {
    console.error('Document translation error:', error)
    return NextResponse.json({
      error: '翻译处理失败',
      code: 'PROCESSING_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// 执行翻译
async function performTranslation(text: string, sourceLanguage: string, targetLanguage: string) {
  const startTime = Date.now()
  
  try {
    // 分段翻译长文本
    const maxChunkSize = 1000 // 每段最大字符数
    const chunks = splitTextIntoChunks(text, maxChunkSize)
    const translatedChunks: string[] = []

    for (const chunk of chunks) {
      const chunkResult = await translateChunk(chunk, sourceLanguage, targetLanguage)
      if (!chunkResult.success) {
        throw new Error(chunkResult.error || '翻译失败')
      }
      translatedChunks.push(chunkResult.translatedText!)
    }

    const translatedText = translatedChunks.join('\n\n')
    const processingTime = Date.now() - startTime

    return {
      success: true,
      translatedText,
      processingTime
    }

  } catch (error) {
    console.error('Translation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '翻译失败'
    }
  }
}

// 语言代码映射到NLLB格式
function mapToNLLBLanguageCode(languageCode: string): string {
  const languageMap: Record<string, string> = {
    'zh': 'zho_Hans',
    'en': 'eng_Latn',
    'ja': 'jpn_Jpan',
    'ko': 'kor_Hang',
    'fr': 'fra_Latn',
    'de': 'deu_Latn',
    'es': 'spa_Latn',
    'it': 'ita_Latn',
    'pt': 'por_Latn',
    'ru': 'rus_Cyrl',
    'ar': 'arb_Arab',
    'hi': 'hin_Deva',
    'th': 'tha_Thai',
    'vi': 'vie_Latn',
    'id': 'ind_Latn',
    'ms': 'zsm_Latn',
    'tl': 'tgl_Latn',
    'sw': 'swh_Latn',
    'am': 'amh_Ethi',
    'my': 'mya_Mymr',
    'km': 'khm_Khmr',
    'lo': 'lao_Laoo',
    'si': 'sin_Sinh',
    'ne': 'nep_Deva',
    'bn': 'ben_Beng',
    'ur': 'urd_Arab'
  };
  
  return languageMap[languageCode] || languageCode;
}

// 翻译单个文本块
async function translateChunk(text: string, sourceLanguage: string, targetLanguage: string) {
  try {
    const nllbServiceUrl = process.env.NLLB_SERVICE_URL || 'https://wane0528-my-nllb-api.hf.space/api/v4/translator'
    
    // 处理自动检测语言
    let actualSourceLanguage = sourceLanguage
    if (sourceLanguage === 'auto') {
      // 简单的语言检测：检查是否包含中文字符
      const hasChinese = /[\u4e00-\u9fff]/.test(text)
      const hasJapanese = /[\u3040-\u309f\u30a0-\u30ff]/.test(text)
      const hasKorean = /[\uac00-\ud7af]/.test(text)
      
      if (hasChinese) {
        actualSourceLanguage = 'zh'
      } else if (hasJapanese) {
        actualSourceLanguage = 'ja'
      } else if (hasKorean) {
        actualSourceLanguage = 'ko'
      } else {
        // 默认假设是英文
        actualSourceLanguage = 'en'
      }
      
      console.log(`[Language Detection] Auto detected: ${actualSourceLanguage} for text: ${text.substring(0, 50)}...`)
    }
    
    // 映射到NLLB语言代码
    const nllbSourceLang = mapToNLLBLanguageCode(actualSourceLanguage)
    const nllbTargetLang = mapToNLLBLanguageCode(targetLanguage)
    
    console.log(`[Language Mapping] ${actualSourceLanguage} -> ${nllbSourceLang}, ${targetLanguage} -> ${nllbTargetLang}`)
    
    const response = await fetch(nllbServiceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        source: nllbSourceLang,
        target: nllbTargetLang,
        max_length: 1000
      }),
      signal: AbortSignal.timeout(30000) // 30秒超时
    })

    if (!response.ok) {
      throw new Error(`翻译服务错误: ${response.status}`)
    }

    const result = await response.json()
    
    if (result.error) {
      throw new Error(result.error)
    }

    return {
      success: true,
      translatedText: result.result || result.translated_text || result.translation || text
    }

  } catch (error) {
    console.error('Chunk translation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '翻译失败'
    }
  }
}

// 将文本分割成块
function splitTextIntoChunks(text: string, maxChunkSize: number): string[] {
  if (text.length <= maxChunkSize) {
    return [text]
  }

  const chunks: string[] = []
  const sentences = text.split(/[.!?。！？]\s+/)
  let currentChunk = ''

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length + 1 <= maxChunkSize) {
      currentChunk += (currentChunk ? ' ' : '') + sentence
    } else {
      if (currentChunk) {
        chunks.push(currentChunk.trim())
      }
      currentChunk = sentence
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim())
  }

  return chunks.filter(chunk => chunk.length > 0)
}

export const POST = withApiAuth(translateHandler, ['free_user', 'pro_user', 'admin'])

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
}
