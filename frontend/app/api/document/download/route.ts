import { NextRequest, NextResponse } from 'next/server'
import { withApiAuth, type NextRequestWithUser } from '@/lib/api-utils'

interface DownloadRequest {
  translationId: string
  format?: 'txt' | 'pdf' | 'docx'
}

async function downloadHandler(req: NextRequestWithUser) {
  try {
    const { user } = req.userContext

    if (!user) {
      return NextResponse.json({
        error: '需要登录账户',
        code: 'AUTH_REQUIRED'
      }, { status: 401 })
    }

    const url = new URL(req.url)
    const translationId = url.searchParams.get('translationId')
    const format = url.searchParams.get('format') || 'txt'

    if (!translationId) {
      return NextResponse.json({
        error: '缺少翻译ID',
        code: 'MISSING_TRANSLATION_ID'
      }, { status: 400 })
    }

    // 从缓存中获取翻译结果
    ;(global as any).translationCache = (global as any).translationCache || new Map()
    const translationData = (global as any).translationCache.get(translationId)

    if (!translationData) {
      return NextResponse.json({
        error: '翻译结果不存在或已过期',
        code: 'TRANSLATION_NOT_FOUND'
      }, { status: 404 })
    }

    // 验证用户权限
    if (translationData.userId !== user.id) {
      return NextResponse.json({
        error: '无权访问此翻译结果',
        code: 'ACCESS_DENIED'
      }, { status: 403 })
    }

    const { translatedText, sourceLanguage, targetLanguage, metadata } = translationData

    // 生成文件内容
    let fileContent: string
    let contentType: string
    let fileName: string

    switch (format) {
      case 'txt':
        fileContent = generateTextFile(translatedText, sourceLanguage, targetLanguage, metadata)
        contentType = 'text/plain; charset=utf-8'
        fileName = `translation_${translationId}.txt`
        break
      
      case 'pdf':
        // 简化的PDF生成 - 在生产环境中建议使用专门的PDF库
        fileContent = generateTextFile(translatedText, sourceLanguage, targetLanguage, metadata)
        contentType = 'text/plain; charset=utf-8'
        fileName = `translation_${translationId}.txt`
        break
      
      default:
        fileContent = generateTextFile(translatedText, sourceLanguage, targetLanguage, metadata)
        contentType = 'text/plain; charset=utf-8'
        fileName = `translation_${translationId}.txt`
    }

    // 返回文件
    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': Buffer.byteLength(fileContent, 'utf8').toString(),
      },
    })

  } catch (error) {
    console.error('Document download error:', error)
    return NextResponse.json({
      error: '下载失败',
      code: 'DOWNLOAD_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// 生成文本文件内容
function generateTextFile(
  translatedText: string, 
  sourceLanguage: string, 
  targetLanguage: string, 
  metadata: any
): string {
  const header = `翻译结果
=====================================
原始文件: ${metadata.fileName}
源语言: ${sourceLanguage}
目标语言: ${targetLanguage}
翻译时间: ${new Date().toLocaleString()}
字符数: ${translatedText.length}
=====================================

`

  return header + translatedText
}

export const GET = withApiAuth(downloadHandler, ['free_user', 'pro_user', 'admin'])

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
}
