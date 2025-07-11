import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

interface FeedbackData {
  type: 'rating' | 'suggestion' | 'bug' | 'compliment'
  rating?: number
  message: string
  category?: string
  email?: string
  metadata?: Record<string, any>
}

export async function POST(request: NextRequest) {
  try {
    const feedbackData: FeedbackData = await request.json()
    
    // 验证必需字段
    if (!feedbackData.type) {
      return NextResponse.json(
        { error: '反馈类型不能为空' },
        { status: 400 }
      )
    }

    if (feedbackData.type === 'rating' && !feedbackData.rating) {
      return NextResponse.json(
        { error: '评分不能为空' },
        { status: 400 }
      )
    }

    if (feedbackData.type !== 'rating' && !feedbackData.message?.trim()) {
      return NextResponse.json(
        { error: '反馈内容不能为空' },
        { status: 400 }
      )
    }

    // 创建Supabase客户端
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 获取用户信息（如果已登录）
    const authHeader = request.headers.get('authorization')
    let userId = null
    
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7)
        const { data: { user } } = await supabase.auth.getUser(token)
        userId = user?.id
      } catch (error) {
        // 忽略认证错误，允许匿名反馈
        console.log('Auth error in feedback:', error)
      }
    }

    // 插入反馈记录
    const { data, error } = await supabase
      .from('user_feedback')
      .insert({
        user_id: userId,
        type: feedbackData.type,
        rating: feedbackData.rating,
        message: feedbackData.message?.trim(),
        category: feedbackData.category,
        email: feedbackData.email?.trim(),
        metadata: feedbackData.metadata || {},
        ip_address: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: '保存反馈失败，请稍后重试' },
        { status: 500 }
      )
    }

    // 发送通知邮件（高优先级反馈）
    if (feedbackData.type === 'bug' || (feedbackData.type === 'rating' && feedbackData.rating !== undefined && feedbackData.rating <= 2)) {
      try {
        await sendFeedbackNotification(data)
      } catch (error) {
        console.error('Failed to send notification:', error)
        // 不影响主流程
      }
    }

    return NextResponse.json({
      success: true,
      message: '反馈提交成功',
      feedbackId: data.id
    })

  } catch (error) {
    console.error('Feedback API error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 发送反馈通知邮件
async function sendFeedbackNotification(feedback: any) {
  // 这里可以集成邮件服务，如Resend
  const emailData = {
    to: 'support@loretrans.com',
    subject: `新的${feedback.type === 'bug' ? '问题报告' : '负面反馈'} - ${feedback.type}`,
    html: `
      <h2>新的用户反馈</h2>
      <p><strong>类型:</strong> ${feedback.type}</p>
      ${feedback.rating ? `<p><strong>评分:</strong> ${feedback.rating}/5</p>` : ''}
      ${feedback.category ? `<p><strong>分类:</strong> ${feedback.category}</p>` : ''}
      <p><strong>内容:</strong></p>
      <p>${feedback.message}</p>
      ${feedback.email ? `<p><strong>联系邮箱:</strong> ${feedback.email}</p>` : ''}
      <p><strong>提交时间:</strong> ${feedback.created_at}</p>
      <p><strong>用户ID:</strong> ${feedback.user_id || '匿名用户'}</p>
      <hr>
      <p><strong>元数据:</strong></p>
      <pre>${JSON.stringify(feedback.metadata, null, 2)}</pre>
    `
  }

  // 实际发送邮件的代码
  // await sendEmail(emailData)
  console.log('Feedback notification:', emailData.subject)
}
