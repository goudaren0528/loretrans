import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'

// Creem配置（开发阶段使用模拟数据）
const CREEM_SECRET_KEY = process.env.CREEM_SECRET_KEY
const CREEM_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CREEM_PUBLISHABLE_KEY

// 积分包配置（与定价页面保持一致）
const creditPackages = {
  starter: {
    name: '入门包',
    credits: 1000,
    price: 1.99,
    description: '1,000 翻译积分',
  },
  basic: {
    name: '基础包',
    credits: 5000,
    price: 8.99,
    description: '5,000 翻译积分',
  },
  pro: {
    name: '专业包',
    credits: 10000,
    price: 15.99,
    description: '10,000 翻译积分',
  },
  business: {
    name: '商务包',
    credits: 25000,
    price: 34.99,
    description: '25,000 翻译积分',
  },
  enterprise: {
    name: '企业包',
    credits: 50000,
    price: 59.99,
    description: '50,000 翻译积分',
  },
}

export async function POST(request: NextRequest) {
  try {
    const { packageId } = await request.json()

    // 验证积分包ID
    if (!packageId || !creditPackages[packageId as keyof typeof creditPackages]) {
      return NextResponse.json(
        { error: 'Invalid package ID' },
        { status: 400 }
      )
    }

    // 获取用户信息
    const cookieStore = cookies()
    const supabase = createSupabaseServerClient(cookieStore)
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const selectedPackage = creditPackages[packageId as keyof typeof creditPackages]

    // 检查Creem配置
    if (!CREEM_SECRET_KEY || !CREEM_PUBLISHABLE_KEY) {
      console.warn('Creem not configured, returning mock checkout URL')
      
      // 开发模式：返回模拟的checkout URL
      const mockCheckoutUrl = `/checkout/mock?package=${packageId}&user=${user.id}&amount=${selectedPackage.price}&credits=${selectedPackage.credits}`
      
      return NextResponse.json({
        checkoutUrl: mockCheckoutUrl,
        sessionId: `mock_session_${Date.now()}`,
      })
    }

    // TODO: 实际的Creem集成
    // 这里应该调用Creem API创建checkout会话
    /*
    const creemResponse = await fetch('https://api.creem.io/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CREEM_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer_email: user.email,
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: selectedPackage.name,
              description: selectedPackage.description,
            },
            unit_amount: Math.round(selectedPackage.price * 100), // 转换为分
          },
          quantity: 1,
        }],
        metadata: {
          user_id: user.id,
          package_id: packageId,
          credits: selectedPackage.credits.toString(),
        },
      }),
    })

    if (!creemResponse.ok) {
      throw new Error('Failed to create Creem checkout session')
    }

    const { url: checkoutUrl, id: sessionId } = await creemResponse.json()
    */

    // 临时返回模拟URL
    const mockCheckoutUrl = `/checkout/mock?package=${packageId}&user=${user.id}&amount=${selectedPackage.price}&credits=${selectedPackage.credits}`

    return NextResponse.json({
      checkoutUrl: mockCheckoutUrl,
      sessionId: `mock_session_${Date.now()}`,
    })

  } catch (error) {
    console.error('Checkout creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
