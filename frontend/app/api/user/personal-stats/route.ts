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

    // 获取用户基本信息
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('created_at')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Failed to get user profile:', profileError)
      return NextResponse.json(
        { error: '获取用户信息失败' },
        { status: 500 }
      )
    }

    // 获取用户的翻译统计（只查询该用户的数据）
    const { data: translationStats, error: translationError } = await supabase
      .from('translations')
      .select('character_count, source_language, target_language, created_at')
      .eq('user_id', user.id)

    if (translationError) {
      console.error('Failed to get translation stats:', translationError)
    }

    // 计算个人统计数据
    const translations = translationStats || []

    // 基础统计
    const totalTranslations = translations.length
    const totalCharacters = translations.reduce((sum, t) => sum + (t.character_count || 0), 0)

    // 语言使用统计
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

    if (sortedDates.length > 0) {
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
    }

    // 月度统计
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
    const monthlyTranslations = translations.filter(t => 
      t.created_at.startsWith(currentMonth)
    ).length
    const monthlyCharacters = translations
      .filter(t => t.created_at.startsWith(currentMonth))
      .reduce((sum, t) => sum + (t.character_count || 0), 0)

    // 只返回用户个人相关的统计数据
    const personalStats = {
      // 基础个人统计
      translations: totalTranslations,
      characters: totalCharacters,
      languages: uniqueLanguages,
      
      // 使用模式
      daily_streak: currentStreak,
      
      // 月度统计
      monthly_translations: monthlyTranslations,
      monthly_characters: monthlyCharacters,
      
      // 注册时间
      member_since: userProfile.created_at
    }

    return NextResponse.json({
      success: true,
      stats: personalStats
    })

  } catch (error) {
    console.error('Personal stats API error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
