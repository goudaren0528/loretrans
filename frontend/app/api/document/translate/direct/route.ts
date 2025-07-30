import { NextRequest, NextResponse } from 'next/server'

// 直接文档翻译处理（供队列调用）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jobId, filePath, sourceLang, targetLang } = body

    console.log(`[Direct Document Translation] 开始处理: ${jobId}`)

    // 调用文件处理器服务
    const fileProcessorUrl = process.env.FILE_PROCESSOR_URL || 'http://localhost:3010'
    
    const response = await fetch(`${fileProcessorUrl}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobId,
        filePath,
        sourceLang,
        targetLang
      })
    })

    if (!response.ok) {
      throw new Error(`文件处理器响应错误: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || '文档翻译失败')
    }

    // 更新数据库状态
    await updateDocumentTranslationResult(jobId, result.translatedFilePath, 'completed')

    console.log(`[Direct Document Translation] 完成: ${jobId}`)

    return NextResponse.json({
      success: true,
      result: result.translatedFilePath
    })

  } catch (error: any) {
    console.error('[Direct Document Translation] 处理失败:', error)
    
    // 更新数据库为失败状态
    const { jobId } = await request.json()
    if (jobId) {
      await updateDocumentTranslationResult(jobId, '', 'failed', error.message)
    }

    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

// 更新文档翻译结果到数据库
async function updateDocumentTranslationResult(jobId: string, filePath: string, status: string, error?: string) {
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
      updateData.translated_file_path = filePath
      updateData.processing_completed_at = new Date().toISOString()
      updateData.progress_percentage = 100
    } else if (status === 'failed') {
      updateData.error_message = error
    }

    await supabase
      .from('translation_jobs')
      .update(updateData)
      .eq('id', jobId)

    console.log(`[Direct Document Translation] 数据库已更新: ${jobId} -> ${status}`)
  } catch (error) {
    console.error('[Direct Document Translation] 数据库更新失败:', error)
  }
}
