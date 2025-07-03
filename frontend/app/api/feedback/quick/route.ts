import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

interface QuickFeedbackData {
  translationId?: string
  rating: 'good' | 'bad'
  timestamp: string
}

export async function POST(request: NextRequest) {
  try {
    const { translationId, rating, timestamp }: QuickFeedbackData = await request.json()
    
    // 验证必需字段
    if (!rating || !['good', 'bad'].includes(rating)) {
      return NextResponse.json(
        { error: '无效的评分' },
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
        // 允许匿名快速反馈
        console.log('Auth error in quick feedback:', error)
      }
    }

    // 插入快速反馈记录
    const { data, error } = await supabase
      .from('translation_feedback')
      .insert({
        user_id: userId,
        translation_id: translationId,
        rating: rating === 'good' ? 5 : 1, // 转换为数字评分
        feedback_type: 'quick',
        ip_address: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        created_at: timestamp
      })
      .select()
      .single()

    if (error) {
      console.error('Quick feedback database error:', error)
      return NextResponse.json(
        { error: '保存反馈失败' },
        { status: 500 }
      )
    }

    // 更新翻译质量统计
    if (translationId) {
      try {
        await updateTranslationQualityStats(supabase, translationId, rating)
      } catch (error) {
        console.error('Failed to update quality stats:', error)
        // 不影响主流程
      }
    }

    return NextResponse.json({
      success: true,
      message: '反馈已记录',
      feedbackId: data.id
    })

  } catch (error) {
    console.error('Quick feedback API error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 更新翻译质量统计
async function updateTranslationQualityStats(
  supabase: any, 
  translationId: string, 
  rating: 'good' | 'bad'
) {
  // 获取当前翻译记录
  const { data: translation } = await supabase
    .from('translations')
    .select('quality_stats')
    .eq('id', translationId)
    .single()

  if (translation) {
    const currentStats = translation.quality_stats || { good: 0, bad: 0, total: 0 }
    const newStats = {
      good: currentStats.good + (rating === 'good' ? 1 : 0),
      bad: currentStats.bad + (rating === 'bad' ? 1 : 0),
      total: currentStats.total + 1
    }

    // 更新翻译记录的质量统计
    await supabase
      .from('translations')
      .update({ 
        quality_stats: newStats,
        quality_score: newStats.total > 0 ? (newStats.good / newStats.total) * 5 : null
      })
      .eq('id', translationId)
  }
}
