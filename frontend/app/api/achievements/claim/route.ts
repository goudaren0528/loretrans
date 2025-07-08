import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 成就定义（与前端保持一致）
const ACHIEVEMENTS = {
  'first_translation': { credits: 50 },
  'translation_novice': { credits: 100 },
  'translation_expert': { credits: 500 },
  'translation_master': { credits: 2000 },
  'character_milestone_10k': { credits: 200 },
  'character_milestone_100k': { credits: 1000 },
  'polyglot_beginner': { credits: 150 },
  'polyglot_expert': { credits: 800 },
  'daily_streak_3': { credits: 100 },
  'daily_streak_7': { credits: 300 },
  'daily_streak_30': { credits: 1500 },
  'first_feedback': { credits: 50 },
  'referral_success': { credits: 500 },
  'early_adopter': { credits: 1000 },
  'perfect_rating': { credits: 100 }
}

export async function POST(request: NextRequest) {
  try {
    const { achievementId } = await request.json()
    
    if (!achievementId || !ACHIEVEMENTS[achievementId as keyof typeof ACHIEVEMENTS]) {
      return NextResponse.json(
        { error: '无效的成就ID' },
        { status: 400 }
      )
    }

    // 创建Supabase客户端
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 获取用户信息
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '需要登录' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '无效的认证信息' },
        { status: 401 }
      )
    }

    // 检查成就是否已完成且未领取
    const { data: userAchievement, error: achievementError } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', user.id)
      .eq('achievement_id', achievementId)
      .single()

    if (achievementError || !userAchievement) {
      return NextResponse.json(
        { error: '成就不存在或未完成' },
        { status: 400 }
      )
    }

    if (!userAchievement.completed) {
      return NextResponse.json(
        { error: '成就尚未完成' },
        { status: 400 }
      )
    }

    if (userAchievement.claimed) {
      return NextResponse.json(
        { error: '奖励已经领取过了' },
        { status: 400 }
      )
    }

    // 开始事务处理
    const achievement = ACHIEVEMENTS[achievementId as keyof typeof ACHIEVEMENTS]
    
    // 更新成就状态为已领取
    const { error: updateError } = await supabase
      .from('user_achievements')
      .update({
        claimed: true,
        claimed_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('achievement_id', achievementId)

    if (updateError) {
      console.error('Failed to update achievement:', updateError)
      return NextResponse.json(
        { error: '更新成就状态失败' },
        { status: 500 }
      )
    }

    // 给用户添加积分奖励
    const { data: creditResult, error: creditError } = await supabase.rpc(
      'add_user_credits',
      {
        p_user_id: user.id,
        p_credit_amount: achievement.credits,
        p_transaction_reason: `成就奖励: ${achievementId}`,
        p_metadata: JSON.stringify({ 
          achievement_id: achievementId,
          reward_type: 'achievement'
        })
      }
    )

    if (creditError) {
      console.error('Failed to add credits:', creditError)
      // 回滚成就状态
      await supabase
        .from('user_achievements')
        .update({
          claimed: false,
          claimed_at: null
        })
        .eq('user_id', user.id)
        .eq('achievement_id', achievementId)

      return NextResponse.json(
        { error: '添加积分奖励失败' },
        { status: 500 }
      )
    }

    // 记录成就领取日志
    await supabase
      .from('achievement_claims')
      .insert({
        user_id: user.id,
        achievement_id: achievementId,
        credits_awarded: achievement.credits,
        claimed_at: new Date().toISOString()
      })

    return NextResponse.json({
      success: true,
      message: '奖励领取成功',
      reward: {
        credits: achievement.credits
      },
      newBalance: creditResult?.new_balance || 0
    })

  } catch (error) {
    console.error('Achievement claim API error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
