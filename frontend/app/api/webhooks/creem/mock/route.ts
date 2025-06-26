import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase'

/**
 * 模拟Creem Webhook处理器（开发测试用）
 * 在实际生产环境中，这个端点会处理真实的Creem webhook事件
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event_type, data } = body

    console.log('Mock webhook received:', { event_type, data })

    // 只处理支付成功事件
    if (event_type !== 'payment.succeeded') {
      return NextResponse.json({ received: true })
    }

    const { metadata } = data
    const { user_id, package_id, credits } = metadata

    if (!user_id || !credits) {
      console.error('Missing required metadata:', metadata)
      return NextResponse.json(
        { error: 'Missing required metadata' },
        { status: 400 }
      )
    }

    // 使用服务角色客户端处理积分充值
    const supabase = createSupabaseServiceClient()

    // 1. 验证用户存在
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, credits')
      .eq('id', user_id)
      .single()

    if (userError || !user) {
      console.error('User not found:', user_id, userError)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // 2. 计算积分（包含新用户奖励）
    const baseCredits = parseInt(credits)
    const isFirstPurchase = user.credits === 500 // 假设新用户有500初始积分
    const bonusCredits = isFirstPurchase ? Math.round(baseCredits * 0.2) : 0 // 首充20%奖励
    const totalCredits = baseCredits + bonusCredits

    // 3. 创建支付记录
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user_id,
        creem_payment_id: data.id,
        amount: data.amount_total / 100, // 转换为美元
        credits: totalCredits,
        status: 'completed',
        metadata: {
          package_id,
          base_credits: baseCredits,
          bonus_credits: bonusCredits,
          is_first_purchase: isFirstPurchase,
        },
        completed_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Failed to create payment record:', paymentError)
      return NextResponse.json(
        { error: 'Failed to create payment record' },
        { status: 500 }
      )
    }

    // 4. 使用数据库函数充值积分
    const { data: result, error: creditError } = await supabase
      .rpc('purchase_credits', {
        p_user_id: user_id,
        p_amount: totalCredits,
        p_payment_id: payment.id,
        p_description: `购买${package_id}积分包${bonusCredits > 0 ? ` (含${bonusCredits}奖励积分)` : ''}`,
      })

    if (creditError) {
      console.error('Failed to add credits:', creditError)
      return NextResponse.json(
        { error: 'Failed to add credits' },
        { status: 500 }
      )
    }

    console.log('Mock payment processed successfully:', {
      user_id,
      package_id,
      base_credits: baseCredits,
      bonus_credits: bonusCredits,
      total_credits: totalCredits,
      payment_id: payment.id,
    })

    return NextResponse.json({
      success: true,
      payment_id: payment.id,
      credits_added: totalCredits,
      bonus_credits: bonusCredits,
    })

  } catch (error) {
    console.error('Mock webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
