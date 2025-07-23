import { NextRequest, NextResponse } from 'next/server'

// 添加动态路由配置
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')
    
    // 🔥 严格验证jobId
    if (!jobId || jobId === 'undefined' || jobId === 'null' || jobId.trim() === '') {
      console.error('[Translation Status] 收到无效的jobId:', {
        jobId,
        type: typeof jobId,
        url: request.url
      })
      return NextResponse.json({
        error: '无效的任务ID，请重新提交翻译请求',
        code: 'INVALID_JOB_ID',
        received: jobId,
        suggestion: 'restart_translation'
      }, { status: 400 })
    }
    
    if (false) { // 原有检查已被上面的严格验证替代
      return NextResponse.json({
        error: '缺少任务ID',
        code: 'MISSING_JOB_ID'
      }, { status: 400 })
    }
    
    console.log(`[Translation Status] 查询任务状态: ${jobId}`)
    console.log(`[Translation Status] 请求URL: ${request.url}`)
    
    if (!jobId || jobId === 'undefined' || jobId === 'null') {
      console.error('[Translation Status] 无效的任务ID:', jobId)
      return NextResponse.json({
        error: '无效的任务ID',
        code: 'INVALID_JOB_ID',
        received: jobId
      }, { status: 400 })
    }
    
    // 🔥 修复：检查是否为串流任务
    if (jobId.startsWith('stream_')) {
      console.log(`[Translation Status] 检测到串流任务，重定向到串流API`)
      
      // 重定向到串流状态查询
      try {
        const streamResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/translate/stream?taskId=${jobId}`)
        const streamResult = await streamResponse.json()
        
        if (streamResponse.ok && streamResult.success) {
          // 转换响应格式以保持兼容性
          return NextResponse.json({
            jobId: streamResult.task.id,
            status: streamResult.task.status,
            progress: streamResult.task.progress,
            result: streamResult.task.result,
            error: streamResult.task.error,
            totalChunks: streamResult.task.totalChunks,
            currentChunk: streamResult.task.currentChunk,
            createdAt: streamResult.task.createdAt,
            updatedAt: streamResult.task.updatedAt,
            processingMode: 'stream'
          })
        } else {
          return NextResponse.json({
            error: streamResult.error || '查询串流任务失败',
            code: 'STREAM_QUERY_ERROR'
          }, { status: streamResponse.status })
        }
      } catch (error) {
        console.error('[Translation Status] 串流任务查询失败:', error)
        return NextResponse.json({
          error: '串流任务查询失败',
          code: 'STREAM_QUERY_ERROR'
        }, { status: 500 })
      }
    }
    
    // 🔥 原有逻辑：处理传统文本翻译任务
    // 获取文本翻译队列
    if (!(global as any).textTranslationQueue) {
      (global as any).textTranslationQueue = new Map()
    }
    
    const textTranslationQueue = (global as any).textTranslationQueue
    const job = textTranslationQueue.get(jobId)
    
    if (!job) {
      console.log(`[Translation Status] 任务不存在: ${jobId}`)
      return NextResponse.json({
        error: '任务不存在',
        code: 'JOB_NOT_FOUND'
      }, { status: 404 })
    }
    
    // 返回任务状态
    const response = {
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      result: job.result,
      error: job.error,
      totalChunks: job.chunks.length,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      processingMode: 'traditional'
    }
    
    console.log(`[Translation Status] 任务状态: ${job.status}, 进度: ${job.progress}%`)
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('[Translation Status] 查询状态异常:', error)
    return NextResponse.json({
      error: '查询状态失败',
      code: 'STATUS_QUERY_ERROR'
    }, { status: 500 })
  }
}


// POST方法支持 - 与GET方法功能相同
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId } = body;
    
    // 🔥 严格验证jobId
    if (!jobId || jobId === 'undefined' || jobId === 'null' || jobId.trim() === '') {
      console.error('[Translation Status] 收到无效的jobId:', {
        jobId,
        type: typeof jobId,
        body
      });
      return NextResponse.json({
        error: '无效的任务ID，请重新提交翻译请求',
        code: 'INVALID_JOB_ID',
        details: 'jobId不能为空或无效'
      }, { status: 400 });
    }

    console.log(`[Translation Status] 查询任务状态: ${jobId}`);

    // 获取全局队列
    const textTranslationQueue = (global as any).textTranslationQueue;
    if (!textTranslationQueue) {
      console.error('[Translation Status] 翻译队列未初始化');
      return NextResponse.json({
        error: '翻译服务未初始化',
        code: 'SERVICE_NOT_INITIALIZED'
      }, { status: 503 });
    }

    const job = textTranslationQueue.get(jobId);
    if (!job) {
      console.error(`[Translation Status] 任务不存在: ${jobId}`);
      return NextResponse.json({
        error: '任务不存在或已过期',
        code: 'JOB_NOT_FOUND'
      }, { status: 404 });
    }

    console.log(`[Translation Status] 任务状态: ${job.status}, 进度: ${job.progress}%`);

    return NextResponse.json({
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      result: job.result,
      error: job.error,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      characterCount: job.characterCount
    });

  } catch (error: any) {
    console.error('[Translation Status] POST方法错误:', error);
    return NextResponse.json({
      error: '查询状态失败',
      code: 'STATUS_QUERY_ERROR',
      details: error.message
    }, { status: 500 });
  }
}
