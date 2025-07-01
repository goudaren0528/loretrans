import { NextRequest, NextResponse } from 'next/server';
import { creem } from '@/lib/services/creem';
import { PRICING_PLANS } from '@/config/pricing.config';
import { createServiceRoleClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  console.log('[POST /api/webhooks/creem] Received Creem webhook');
  
  try {
    const body = await request.json();
    console.log('Creem webhook payload:', JSON.stringify(body, null, 2));

    // 验证webhook签名（如果Creem提供）
    const signature = request.headers.get('x-creem-signature');
    if (signature) {
      const isValid = creem.verifySignature(body, signature);
      if (!isValid) {
        console.error('Invalid Creem webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    }

    // 处理不同类型的webhook事件
    const { event_type, data } = body;
    
    if (event_type === 'payment.completed' || event_type === 'order.completed') {
      return await handlePaymentCompleted(data);
    }
    
    if (event_type === 'payment.failed') {
      console.log('Payment failed:', data);
      return NextResponse.json({ received: true });
    }

    console.log(`Unhandled webhook event type: ${event_type}`);
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Error processing Creem webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handlePaymentCompleted(data: any) {
  console.log('Processing completed payment:', data);

  const {
    order_id,
    customer_email,
    product_id,
    amount,
    currency,
    request_id,
    customer_id
  } = data;

  // 验证必要参数
  if (!order_id || !product_id || !request_id) {
    console.error('Missing required parameters in webhook data');
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  try {
    // 从request_id提取用户ID和计划ID
    const [userId, planId] = request_id.split('_');
    if (!userId || !planId) {
      console.error('Invalid request_id format:', request_id);
      return NextResponse.json({ error: 'Invalid request ID format' }, { status: 400 });
    }

    // 查找对应的定价计划
    const pricingPlan = PRICING_PLANS.find(p => p.id === planId);
    if (!pricingPlan) {
      console.error('Unknown pricing plan:', planId);
      return NextResponse.json({ error: 'Unknown pricing plan' }, { status: 400 });
    }

    // 验证产品ID匹配
    if (pricingPlan.creemPriceId !== product_id) {
      console.error('Product ID mismatch:', { expected: pricingPlan.creemPriceId, received: product_id });
      return NextResponse.json({ error: 'Product ID mismatch' }, { status: 400 });
    }

    console.log(`Processing webhook payment for user ${userId}, plan ${planId}, credits ${pricingPlan.credits}`);

    // 使用Supabase服务角色客户端处理积分充值
    const supabase = createServiceRoleClient();
    const { error } = await supabase.rpc('purchase_credits', {
      p_user_id: userId,
      p_amount: pricingPlan.credits,
      p_payment_id: order_id,
      p_description: `Purchase of ${pricingPlan.credits} credits (${pricingPlan.name}) via webhook`
    });

    if (error) {
      console.error('Failed to add credits via webhook:', error);
      return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 });
    }

    console.log(`Successfully added ${pricingPlan.credits} credits to user ${userId} via webhook`);
    return NextResponse.json({ received: true, processed: true });

  } catch (error) {
    console.error('Error processing payment webhook:', error);
    return NextResponse.json({ error: 'Payment processing failed' }, { status: 500 });
  }
}

// 支持GET请求用于webhook验证
export async function GET(request: NextRequest) {
  console.log('[GET /api/webhooks/creem] Webhook verification request');
  
  // 如果Creem需要验证webhook端点
  const challenge = request.nextUrl.searchParams.get('challenge');
  if (challenge) {
    return NextResponse.json({ challenge });
  }
  
  return NextResponse.json({ status: 'Creem webhook endpoint active' });
}
