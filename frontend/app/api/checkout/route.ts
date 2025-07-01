import { NextResponse } from 'next/server';
import { withApiAuth, type NextRequestWithUser } from '@/lib/api-utils';
import { PRICING_PLANS } from '@/config/pricing.config';

async function createCheckoutSession(req: NextRequestWithUser) {
  console.log(`[POST /api/checkout] User ${req.userContext.user.id} is creating a checkout session.`);
  
  try {
    const { planId } = await req.json();
    const plan = PRICING_PLANS.find(p => p.id === planId);

    if (!plan) {
      console.error(`Checkout attempt for invalid planId: ${planId} by user ${req.userContext.user.id}.`);
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }
    
    console.log(`User ${req.userContext.user.id} is creating a checkout session for plan: ${plan.name} (${planId}).`);

    // 如果商品有直接的payment URL，构建带回调参数的URL
    if (plan.creemPaymentUrl) {
      const origin = req.nextUrl.origin;
      const success_url = `${origin}/api/payment/success?plan=${planId}`;
      const cancel_url = `${origin}/pricing?purchase=canceled`;
      const request_id = `${req.userContext.user.id}_${planId}_${Date.now()}`;
      
      // 构建带参数的支付URL
      const paymentUrl = new URL(plan.creemPaymentUrl);
      paymentUrl.searchParams.set('success_url', success_url);
      paymentUrl.searchParams.set('cancel_url', cancel_url);
      paymentUrl.searchParams.set('customer_email', req.userContext.user.email);
      paymentUrl.searchParams.set('request_id', request_id);
      
      console.log(`Using direct payment URL for plan ${planId}: ${paymentUrl.toString()}`);
      return NextResponse.json({ 
        url: paymentUrl.toString(),
        checkout_id: `direct_${planId}_${Date.now()}`,
        request_id: request_id
      });
    }

    // 如果没有直接的payment URL，返回错误或使用fallback
    if (!plan.creemPaymentUrl && plan.id !== 'free') {
      console.error(`No payment URL configured for plan: ${planId}`);
      return NextResponse.json({ 
        error: 'Payment URL not configured for this plan. Please contact support.' 
      }, { status: 500 });
    }

    // 免费计划不需要支付
    if (plan.id === 'free') {
      return NextResponse.json({ 
        error: 'Free plan does not require payment' 
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export const POST = withApiAuth(createCheckoutSession, ['free_user', 'pro_user', 'admin']); 