import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
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

    // 获取用户基本统计信息
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('stats, created_at')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Failed to get user profile:', profileError)
      return NextResponse.json(
        { error: '获取用户信息失败' },
        { status: 500 }
      )
    }

    // 获取翻译统计
    const { data: translationStats, error: translationError } = await supabase
      .from('translations')
      .select('character_count, source_language, target_language, created_at')
      .eq('user_id', user.id)

    if (translationError) {
      console.error('Failed to get translation stats:', translationError)
    }

    // 获取积分交易统计
    const { data: creditStats, error: creditError } = await supabase
      .from('credit_transactions')
      .select('type, amount, created_at')
      .eq('user_id', user.id)

    if (creditError) {
      console.error('Failed to get credit stats:', creditError)
    }

    // 获取反馈统计
    const { data: feedbackStats, error: feedbackError } = await supabase
      .from('user_feedback')
      .select('type, rating, created_at')
      .eq('user_id', user.id)

    if (feedbackError) {
      console.error('Failed to get feedback stats:', feedbackError)
    }

    // 计算统计数据
    const translations = translationStats || []
    const credits = creditStats || []
    const feedback = feedbackStats || []

    // 基础统计
    const totalTranslations = translations.length
    const totalCharacters = translations.reduce((sum, t) => sum + (t.character_count || 0), 0)
    const totalSpent = credits
      .filter(c => c.type === 'consume')
      .reduce((sum, c) => sum + Math.abs(c.amount), 0)
    const totalEarned = credits
      .filter(c => c.type === 'purchase' || c.type === 'reward')
      .reduce((sum, c) => sum + c.amount, 0)

    // 语言使用统计
    const languageUsage = translations.reduce((acc, t) => {
      const pair = `${t.source_language}-${t.target_language}`
      acc[pair] = (acc[pair] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const uniqueLanguages = new Set([
      ...translations.map(t => t.source_language),
      ...translations.map(t => t.target_language)
    ]).size

    // 使用频率统计（按天）
    const dailyUsage = translations.reduce((acc, t) => {
      const date = new Date(t.created_at).toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // 计算连续使用天数
    const sortedDates = Object.keys(dailyUsage).sort()
    let currentStreak = 0
    let maxStreak = 0
    let tempStreak = 1

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1])
      const currDate = new Date(sortedDates[i])
      const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        tempStreak++
      } else {
        maxStreak = Math.max(maxStreak, tempStreak)
        tempStreak = 1
      }
    }
    maxStreak = Math.max(maxStreak, tempStreak)

    // 检查当前连续天数
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    if (dailyUsage[today] || dailyUsage[yesterday]) {
      let checkDate = today
      currentStreak = 0
      
      while (dailyUsage[checkDate]) {
        currentStreak++
        const date = new Date(checkDate)
        date.setDate(date.getDate() - 1)
        checkDate = date.toISOString().split('T')[0]
      }
    }

    // 反馈统计
    const feedbackCount = feedback.length
    const averageRating = feedback.length > 0 
      ? feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / feedback.filter(f => f.rating).length
      : 0

    // 月度统计
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
    const monthlyTranslations = translations.filter(t => 
      t.created_at.startsWith(currentMonth)
    ).length
    const monthlyCharacters = translations
      .filter(t => t.created_at.startsWith(currentMonth))
      .reduce((sum, t) => sum + (t.character_count || 0), 0)

    // 用户等级计算
    let userLevel = 'Beginner'
    let nextLevelTarget = 10
    
    if (totalTranslations >= 1000) {
      userLevel = 'Master'
      nextLevelTarget = null
    } else if (totalTranslations >= 100) {
      userLevel = 'Expert'
      nextLevelTarget = 1000
    } else if (totalTranslations >= 10) {
      userLevel = 'Intermediate'
      nextLevelTarget = 100
    }

    const stats = {
      // 基础统计
      translations: totalTranslations,
      characters: totalCharacters,
      languages: uniqueLanguages,
      feedback: feedbackCount,
      
      // 积分统计
      total_spent: totalSpent,
      total_earned: totalEarned,
      
      // 使用模式
      daily_streak: currentStreak,
      max_streak: maxStreak,
      average_rating: Math.round(averageRating * 10) / 10,
      
      // 月度统计
      monthly_translations: monthlyTranslations,
      monthly_characters: monthlyCharacters,
      
      // 用户等级
      user_level: userLevel,
      next_level_target: nextLevelTarget,
      
      // 详细数据
      language_usage: languageUsage,
      daily_usage: dailyUsage,
      
      // 注册时间
      member_since: userProfile.created_at,
      
      // 从用户表获取的统计（如果有）
      ...(userProfile.stats || {})
    }

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error('User stats API error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
