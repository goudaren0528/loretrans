import { NextRequest, NextResponse } from 'next/server'
const { addTaskToQueue, getQueueStatus } = require('@/lib/queue/fifo-queue.js')

// 动态导入积分服务
const createServerCreditService = () => {
  const { createServerCreditService: createService } = require('@/lib/services/credits')
  return createService()
}

// 动态导入 Supabase 客户端
const createSupabaseAdminClient = () => {
  const { createClient } = require('@supabase/supabase-js')
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// 获取用户信息（可选）
async function getOptionalUser(request: NextRequest) {
  try {
    console.log('[FIFO Document Queue Auth] 开始用户认证检查')
    
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[FIFO Document Queue Auth] Authorization header: Missing')
      console.log('[FIFO Document Queue Auth] 无效的认证头格式')
      return null
    }

    const token = authHeader.substring(7)
    console.log('[FIFO Document Queue Auth] Token length:', token.length)
    console.log('[FIFO Document Queue Auth] Token preview:', token.substring(0, 50) + '...')
    
    // 验证token格式
    if (token.length < 100) {
      console.log('[FIFO Document Queue Auth] Token太短，可能格式不正确')
      return null
    }

    const supabase = createSupabaseAdminClient()
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error) {
      console.log('[FIFO Document Queue Auth] Supabase auth error:', error.message)
      return null
    }

    console.log('[FIFO Document Queue Auth] 用户认证成功:', user?.id)
    return user
  } catch (error: any) {
    console.error('[FIFO Document Queue Auth] 认证检查失败:', error.message)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[FIFO Document Queue API] 收到POST请求')
    
    const body = await request.json()
    const { originalContent, sourceLang, targetLang, fileName } = body

    if (!originalContent || !sourceLang || !targetLang) {
      return NextResponse.json({
        error: '缺少必要参数',
        code: 'MISSING_PARAMETERS'
      }, { status: 400 })
    }

    console.log(`[FIFO Document Queue API] 收到文档翻译请求: ${originalContent.length}字符 (${sourceLang} -> ${targetLang})`)

    // 获取用户信息（可选）
    const user = await getOptionalUser(request)
    console.log(`[FIFO Document Queue API] 用户状态: ${user ? '已登录' : '未登录'}`)

    // 计算积分需求
    const creditService = createServerCreditService()
    const calculation = creditService.calculateCreditsRequired(originalContent.length)
    console.log(`[FIFO Document Queue API] 积分计算: 需要 ${calculation.credits_required} 积分`)

    // 🎯 检查Guest用户是否需要积分
    if (!user && calculation.credits_required > 0) {
      console.log(`[FIFO Document Queue API] Guest用户需要积分，要求登录: ${calculation.credits_required} 积分`)
      return NextResponse.json({
        error: '需要登录才能翻译超过5000字符的内容',
        code: 'LOGIN_REQUIRED',
        details: {
          characterCount: originalContent.length,
          freeLimit: 5000,
          creditsRequired: calculation.credits_required
        }
      }, { status: 401 })
    }

    // 🎯 检查已登录用户的积分余额 - 使用与长文本翻译相同的逻辑
    if (user && calculation.credits_required > 0) {
      console.log('[FIFO Document Queue API] 开始积分检查')
      const supabase = createSupabaseAdminClient()
      
      const { data: userData, error: queryError } = await supabase
        .from('users')
        .select('credits')
        .eq('id', user.id)
        .single()

      if (queryError || !userData) {
        console.error('[FIFO Document Queue API] 用户积分查询失败:', queryError)
        
        // 如果用户不存在，尝试创建用户记录
        if (queryError?.code === 'PGRST116') {
          console.log('[FIFO Document Queue API] 用户不存在，尝试创建用户记录:', user.id)
          const { data: insertData, error: insertError } = await supabase
            .from('users')
            .insert([{ 
              id: user.id, 
              email: user.email,
              credits: 3000 // 默认注册积分
            }])
            .select('credits')
            .single()
          
          if (!insertError && insertData) {
            console.log('[FIFO Document Queue API] 创建用户记录成功，初始积分:', insertData.credits)
            const userCredits = insertData.credits
            console.log(`[FIFO Document Queue API] 用户积分检查: 需要 ${calculation.credits_required}, 拥有 ${userCredits}`)
            
            if (userCredits < calculation.credits_required) {
              console.log(`[FIFO Document Queue API] 用户积分不足`)
              return NextResponse.json({
                error: '积分不足',
                code: 'INSUFFICIENT_CREDITS',
                details: {
                  required: calculation.credits_required,
                  available: userCredits,
                  shortfall: calculation.credits_required - userCredits
                }
              }, { status: 402 })
            }
          } else {
            console.error('[FIFO Document Queue API] 创建用户记录失败:', insertError)
            return NextResponse.json({
              error: '无法获取用户积分信息',
              code: 'USER_CREDITS_QUERY_FAILED'
            }, { status: 500 })
          }
        } else {
          return NextResponse.json({
            error: '无法获取用户积分信息',
            code: 'USER_CREDITS_QUERY_FAILED'
          }, { status: 500 })
        }
      } else {
        const userCredits = userData.credits || 0
        console.log(`[FIFO Document Queue API] 用户积分检查: 需要 ${calculation.credits_required}, 拥有 ${userCredits}`)
        
        if (userCredits < calculation.credits_required) {
          console.log(`[FIFO Document Queue API] 用户积分不足`)
          return NextResponse.json({
            error: '积分不足',
            code: 'INSUFFICIENT_CREDITS',
            details: {
              required: calculation.credits_required,
              available: userCredits,
              shortfall: calculation.credits_required - userCredits
            }
          }, { status: 402 })
        }
      }
    }

    // 生成标准UUID格式的任务ID
    const { randomUUID } = require('crypto')
    const jobId = randomUUID()
    console.log(`[FIFO Document Queue API] 生成任务ID: ${jobId}`)

    // 创建数据库记录
    const supabase = createSupabaseAdminClient()
    
    // 为未登录用户使用fallback用户ID（仅在不需要积分时）
    let userId = user?.id
    if (!userId) {
      // 只有在不需要积分时才使用fallback（Guest用户免费翻译）
      if (calculation.credits_required === 0) {
        userId = 'b7bee007-2a9f-4fb8-8020-10b707e2f4f4' // 已知存在的用户ID作为fallback
        console.log(`[FIFO Document Queue API] 使用fallback用户ID for guest免费翻译: ${userId}`)
      } else {
        // 需要积分但未登录，这种情况应该在上面的检查中被拦截
        throw new Error('未登录用户不能进行付费翻译')
      }
    }
    
    const { data: dbJob, error: dbError } = await supabase
      .from('translation_jobs')
      .insert({
        id: jobId,
        user_id: userId,
        job_type: 'document',
        status: 'pending',
        source_language: sourceLang,
        target_language: targetLang,
        original_content: originalContent,
        file_info: { fileName }, // 存储文件信息到file_info字段
        consumed_credits: calculation.credits_required,
        progress_percentage: 0,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (dbError) {
      console.error('[FIFO Document Queue API] 数据库记录创建失败:', dbError)
      return NextResponse.json({
        error: '任务创建失败',
        code: 'DATABASE_ERROR'
      }, { status: 500 })
    }

    console.log(`[FIFO Document Queue API] 数据库记录创建成功: ${jobId}`)

    // 添加任务到FIFO队列
    const taskData = {
      id: jobId,
      type: 'document',
      data: {
        jobId,
        originalContent,
        sourceLang,
        targetLang,
        fileName,
        filePath: fileName // 兼容性字段
      }
    }

    console.log(`[FIFO Document Queue API] 添加任务到FIFO队列: ${jobId}`)
    addTaskToQueue(taskData)
    console.log(`[FIFO Document Queue API] 任务已添加到FIFO队列: ${jobId}`)

    // 获取队列状态
    const queueStatus = getQueueStatus()
    console.log(`[FIFO Document Queue API] 当前队列状态:`, queueStatus)

    return NextResponse.json({
      success: true,
      jobId,
      isAsync: true, // 🎯 标识这是异步任务，前端需要轮询
      message: '文档翻译任务已添加到队列',
      queueStatus,
      estimatedCredits: calculation.credits_required
    })

  } catch (error: any) {
    console.error('[FIFO Document Queue API] 处理失败:', error)
    return NextResponse.json({
      error: '服务器内部错误',
      code: 'INTERNAL_ERROR',
      details: error.message
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('[FIFO Document Queue API] 收到GET请求 - 查询队列状态')
    
    const queueStatus = getQueueStatus()
    console.log('[FIFO Document Queue API] 队列状态:', queueStatus)

    return NextResponse.json({
      success: true,
      queueStatus
    })

  } catch (error: any) {
    console.error('[FIFO Document Queue API] 状态查询失败:', error)
    return NextResponse.json({
      error: '状态查询失败',
      code: 'STATUS_ERROR',
      details: error.message
    }, { status: 500 })
  }
}
