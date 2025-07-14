import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'

/**
 * 管理员积分修复API
 * 用于解决用户积分不足问题
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔧 开始修复用户积分...')
    
    const supabase = createSupabaseServerClient()
    
    // 1. 获取所有用户
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, credits')
      .order('created_at', { ascending: false })

    if (usersError) {
      console.error('获取用户失败:', usersError)
      return NextResponse.json(
        { error: '获取用户失败', details: usersError.message },
        { status: 500 }
      )
    }

    console.log(`找到 ${users.length} 个用户`)

    if (users.length === 0) {
      return NextResponse.json({
        message: '没有找到用户',
        users_processed: 0
      })
    }

    // 2. 找出积分为0或null的用户
    const zeroUsers = users.filter(u => (u.credits || 0) === 0)
    console.log(`找到 ${zeroUsers.length} 个零积分用户`)

    const results = []
    let successCount = 0
    let failCount = 0

    // 3. 为零积分用户添加积分
    for (const user of zeroUsers) {
      try {
        console.log(`为用户 ${user.email} 添加积分...`)
        
        // 更新用户积分为10000
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            credits: 10000,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)

        if (updateError) {
          console.error(`更新用户 ${user.email} 失败:`, updateError)
          results.push({
            user_id: user.id,
            email: user.email,
            status: 'failed',
            error: updateError.message
          })
          failCount++
          continue
        }

        // 尝试记录交易（如果表存在）
        try {
          await supabase
            .from('credit_transactions')
            .insert({
              user_id: user.id,
              type: 'bonus',
              amount: 10000,
              description: '积分修复 - 管理员操作',
              status: 'completed',
              created_at: new Date().toISOString()
            })
        } catch (transError) {
          console.warn(`记录交易失败 (用户 ${user.email}):`, transError)
          // 不影响主要功能，继续执行
        }

        results.push({
          user_id: user.id,
          email: user.email,
          status: 'success',
          credits_added: 10000,
          new_balance: 10000
        })
        
        successCount++
        console.log(`✅ 用户 ${user.email} 积分已更新`)
        
      } catch (error: any) {
        console.error(`处理用户 ${user.email} 失败:`, error)
        results.push({
          user_id: user.id,
          email: user.email,
          status: 'failed',
          error: error.message
        })
        failCount++
      }
    }

    // 4. 验证结果
    const { data: updatedUsers, error: verifyError } = await supabase
      .from('users')
      .select('id, email, credits')
      .in('id', zeroUsers.map(u => u.id))

    let verificationResults = []
    if (!verifyError && updatedUsers) {
      verificationResults = updatedUsers.map(user => ({
        user_id: user.id,
        email: user.email,
        current_credits: user.credits || 0
      }))
    }

    console.log(`🎉 积分修复完成: 成功 ${successCount}, 失败 ${failCount}`)

    return NextResponse.json({
      message: '积分修复完成',
      summary: {
        total_users: users.length,
        zero_credit_users: zeroUsers.length,
        success_count: successCount,
        fail_count: failCount
      },
      results: results,
      verification: verificationResults
    })

  } catch (error: any) {
    console.error('积分修复API错误:', error)
    return NextResponse.json(
      { error: '积分修复失败', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * 获取用户积分状态
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, credits, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: '获取用户失败', details: error.message },
        { status: 500 }
      )
    }

    const stats = {
      total_users: users.length,
      zero_credit_users: users.filter(u => (u.credits || 0) === 0).length,
      total_credits: users.reduce((sum, u) => sum + (u.credits || 0), 0),
      average_credits: users.length > 0 ? Math.round(users.reduce((sum, u) => sum + (u.credits || 0), 0) / users.length) : 0
    }

    return NextResponse.json({
      stats,
      users: users.map(u => ({
        id: u.id,
        email: u.email,
        credits: u.credits || 0,
        created_at: u.created_at
      }))
    })

  } catch (error: any) {
    console.error('获取用户积分状态失败:', error)
    return NextResponse.json(
      { error: '获取状态失败', details: error.message },
      { status: 500 }
    )
  }
}
