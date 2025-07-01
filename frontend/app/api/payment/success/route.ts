import { NextRequest, NextResponse } from 'next/server';
import { creem } from '@/lib/services/creem';
import { PRICING_PLANS } from '@/config/pricing.config';
import { createServiceRoleClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  console.log('[GET /api/payment/success] Processing payment success callback');
  
  const searchParams = request.nextUrl.searchParams;
  
  // 从Creem Return URL获取参数
  const checkout_id = searchParams.get('checkout_id');
  const order_id = searchParams.get('order_id');
  const customer_id = searchParams.get('customer_id');
  const product_id = searchParams.get('product_id');
  const signature = searchParams.get('signature');
  const request_id = searchParams.get('request_id');
  const plan = searchParams.get('plan');

  console.log('Payment success parameters:', {
    checkout_id,
    order_id,
    customer_id,
    product_id,
    signature,
    request_id,
    plan
  });

  // 验证必要参数
  if (!checkout_id || !order_id || !product_id || !request_id) {
    console.error('Missing required parameters in payment success callback');
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  try {
    // 验证Creem签名
    const params = {
      checkout_id: checkout_id!,
      order_id: order_id!,
      customer_id: customer_id || '',
      product_id: product_id!,
      request_id: request_id!
    };

    if (signature && !creem.verifySignature(params, signature)) {
      console.error('Invalid Creem signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

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

    console.log(`Processing payment for user ${userId}, plan ${planId}, credits ${pricingPlan.credits}`);

    // 使用Supabase服务角色客户端处理积分充值
    const supabase = createServiceRoleClient();
    const { error } = await supabase.rpc('purchase_credits', {
      p_user_id: userId,
      p_amount: pricingPlan.credits,
      p_payment_id: order_id,
      p_description: `Purchase of ${pricingPlan.credits} credits (${pricingPlan.name})`
    });

    if (error) {
      console.error('Failed to add credits:', error);
      return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 });
    }

    console.log(`Successfully added ${pricingPlan.credits} credits to user ${userId}`);

    // 重定向到成功页面
    const successUrl = new URL('/payment-success', request.url);
    successUrl.searchParams.set('purchase', 'success');
    successUrl.searchParams.set('plan', planId);
    successUrl.searchParams.set('credits', pricingPlan.credits.toString());

    return NextResponse.redirect(successUrl);

  } catch (error) {
    console.error('Error processing payment success:', error);
    
    // 重定向到错误页面
    const errorUrl = new URL('/pricing', request.url);
    errorUrl.searchParams.set('purchase', 'error');
    errorUrl.searchParams.set('message', 'Payment processing failed');

    return NextResponse.redirect(errorUrl);
  }
}

// 也支持POST方法，以防Creem使用POST回调
export const POST = GET;
