import { NextRequest, NextResponse } from 'next/server'
import { withApiAuth, type NextRequestWithUser } from '@/lib/api-utils'
import { createServerCreditService } from '@/lib/services/credits'
import { processFile, validateFile, getFileInfo } from '@/lib/enhanced-file-processor'

async function uploadHandler(req: NextRequestWithUser) {
  try {
    const { user, role } = req.userContext

    // 检查用户权限
    if (!user) {
      return NextResponse.json({
        error: '文档翻译需要登录账户',
        code: 'AUTH_REQUIRED',
        message: '请先登录您的账户以使用文档翻译功能'
      }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({
        error: '请选择要上传的文件',
        code: 'FILE_REQUIRED'
      }, { status: 400 })
    }

    // 验证文件
    const validation = validateFile(file, role)
    if (!validation.valid) {
      return NextResponse.json({
        error: validation.error,
        code: 'FILE_VALIDATION_ERROR'
      }, { status: 400 })
    }

    // 获取文件信息
    const fileInfo = getFileInfo(file)
    console.log(`Processing file: ${fileInfo.name} (${fileInfo.sizeFormatted}) for user: ${user.id}`)

    // 处理文件并提取文本
    const processingResult = await processFile(file)

    if (!processingResult.success) {
      return NextResponse.json({
        error: processingResult.error || '文件处理失败',
        code: 'FILE_PROCESSING_ERROR',
        suggestions: [
          '请确保文档包含可读取的文本内容',
          '尝试将文档另存为PDF格式',
          '检查文档是否损坏或加密'
        ]
      }, { status: 400 })
    }

    const { text, characterCount, metadata } = processingResult

    // 验证提取的文本长度
    if (characterCount! < 10) {
      return NextResponse.json({
        error: '提取的文本内容过少，请检查文档是否包含足够的文本',
        code: 'INSUFFICIENT_TEXT_CONTENT'
      }, { status: 400 })
    }

    // 计算积分消耗
    const creditService = createServerCreditService()
    const calculation = creditService.calculateCreditsRequired(characterCount!)

    // 直接查询用户积分表，避免服务器端认证问题
    let userCredits = 0
    try {
      const { createSupabaseServerClient } = await import('@/lib/supabase')
      const supabase = createSupabaseServerClient()
      
      console.log('[Document Upload Credit Check]', {
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

    const hasEnoughCredits = userCredits >= calculation.credits_required

    // 生成文件ID (用于后续翻译请求)
    const fileId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // 存储文档数据到内存缓存 (在生产环境中应该使用数据库或Redis)
    ;(global as any).documentCache = (global as any).documentCache || new Map()
    ;(global as any).documentCache.set(fileId, {
      text: text!,
      characterCount: characterCount!,
      metadata: {
        ...metadata!,
        originalFileName: file.name,
        uploadTime: new Date().toISOString()
      },
      userId: user.id,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24小时后过期
    })

    // 清理过期的缓存项
    cleanupExpiredCache()

    // 记录处理日志
    console.log(`File processed successfully: ${fileId}, characters: ${characterCount}, credits required: ${calculation.credits_required}`)

    return NextResponse.json({
      success: true,
      fileId,
      fileName: file.name,
      fileSize: file.size,
      extractedText: text!.substring(0, 500) + (text!.length > 500 ? '...' : ''), // 只返回前500字符预览
      characterCount: characterCount!,
      creditCalculation: calculation,
      userCredits,
      hasEnoughCredits,
      canProceed: calculation.credits_required === 0 || hasEnoughCredits,
      processingTime: metadata!.processingTime,
      fileType: metadata!.fileType,
      message: hasEnoughCredits ? 
        '文件处理成功，可以开始翻译' : 
        `需要 ${calculation.credits_required} 积分，当前余额 ${userCredits} 积分`
    })

  } catch (error) {
    console.error('Document upload error:', error)
    
    // 根据错误类型返回不同的错误信息
    let errorMessage = '文档处理失败，请重试'
    let errorCode = 'PROCESSING_ERROR'
    
    if (error instanceof Error) {
      if (error.message.includes('PDF')) {
        errorMessage = 'PDF文档处理失败，请确保PDF包含可选择的文本内容'
        errorCode = 'PDF_PROCESSING_ERROR'
      } else if (error.message.includes('Word')) {
        errorMessage = 'Word文档处理失败，请尝试将文档另存为PDF格式'
        errorCode = 'WORD_PROCESSING_ERROR'
      } else if (error.message.includes('PowerPoint')) {
        errorMessage = 'PowerPoint文档处理失败，请尝试将文档另存为PDF格式'
        errorCode = 'PPT_PROCESSING_ERROR'
      }
    }
    
    return NextResponse.json({
      error: errorMessage,
      code: errorCode,
      details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : undefined,
      suggestions: [
        '检查文档是否损坏',
        '尝试将文档转换为PDF格式',
        '确保文档包含可读取的文本内容',
        '如果问题持续，请联系技术支持'
      ]
    }, { status: 500 })
  }
}

// 清理过期的缓存项
function cleanupExpiredCache() {
  if (!(global as any).documentCache) return
  
  const now = new Date()
  let cleanedCount = 0
  
  for (const [key, value] of (global as any).documentCache.entries()) {
    if (value.expiresAt < now) {
      ;(global as any).documentCache.delete(key)
      cleanedCount++
    }
  }
  
  if (cleanedCount > 0) {
    console.log(`Cleaned up ${cleanedCount} expired cache entries`)
  }
  
  // 如果缓存过大，清理最旧的项目
  if ((global as any).documentCache.size > 1000) {
    const entries = Array.from((global as any).documentCache.entries()) as [string, any][]
    entries.sort((a: any, b: any) => a[1].createdAt.getTime() - b[1].createdAt.getTime())
    
    // 删除最旧的100个项目
    for (let i = 0; i < 100 && i < entries.length; i++) {
      ;(global as any).documentCache.delete(entries[i][0])
    }
    
    console.log('Cleaned up oldest cache entries due to size limit')
  }
}

// 要求至少是注册用户
export const POST = withApiAuth(uploadHandler, ['free_user', 'pro_user', 'admin'])

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
