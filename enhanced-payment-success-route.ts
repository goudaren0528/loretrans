import { NextRequest, NextResponse } from 'next/server';
import { creem } from '@/lib/services/creem';
import { PRICING_PLANS } from '@/config/pricing.config';
import { createServiceRoleClient } from '@/lib/supabase-server';

/**
 * 增强版支付成功回调处理
 * 解决积分发放问题，增加详细日志和错误处理
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `payment_${startTime}`;
  
  console.log(`[${requestId}] [GET /api/payment/success] Processing payment success callback`);
  
  const searchParams = request.nextUrl.searchParams;
  
  // 从Creem Return URL获取参数
  const checkout_id = searchParams.get('checkout_id');
  const order_id = searchParams.get('order_id');
  const customer_id = searchParams.get('customer_id');
  const product_id = searchParams.get('product_id');
  const signature = searchParams.get('signature');
  const request_id = searchParams.get('request_id');
  const plan = searchParams.get('plan');

  console.log(`[${requestId}] Payment success parameters:`, {
    checkout_id,
    order_id,
    customer_id,
    product_id,
    signature: signature ? 'present' : 'missing',
    request_id,
    plan,
    timestamp: new Date().toISOString()
  });

  // 验证必要参数
  if (!checkout_id || !order_id || !product_id || !request_id) {
    console.error(`[${requestId}] Missing required parameters:`, {
      checkout_id: !!checkout_id,
      order_id: !!order_id,
      product_id: !!product_id,
      request_id: !!request_id
    });
    return NextResponse.json({ 
      error: 'Missing required parameters',
      requestId 
    }, { status: 400 });
  }

  try {
    // 验证Creem签名（如果提供）
    if (signature) {
      console.log(`[${requestId}] Verifying Creem signature...`);
      const params = {
        checkout_id: checkout_id!,
        order_id: order_id!,
        customer_id: customer_id || '',
        product_id: product_id!,
        request_id: request_id!
      };

      if (!creem.verifySignature(params, signature)) {
        console.error(`[${requestId}] Invalid Creem signature`);
        return NextResponse.json({ 
          error: 'Invalid signature',
          requestId 
        }, { status: 400 });
      }
      console.log(`[${requestId}] Signature verification passed`);
    } else {
      console.warn(`[${requestId}] No signature provided for verification`);
    }

    // 从request_id提取用户ID和计划ID
    console.log(`[${requestId}] Parsing request_id: ${request_id}`);
    const requestParts = request_id.split('_');
    
    if (requestParts.length < 2) {
      console.error(`[${requestId}] Invalid request_id format:`, request_id);
      return NextResponse.json({ 
        error: 'Invalid request ID format',
        requestId 
      }, { status: 400 });
    }

    const userId = requestParts[0];
    const planId = requestParts[1];
    
    console.log(`[${requestId}] Extracted: userId=${userId}, planId=${planId}`);

    // 查找对应的定价计划
    const pricingPlan = PRICING_PLANS.find(p => p.id === planId);
    if (!pricingPlan) {
      console.error(`[${requestId}] Unknown pricing plan:`, planId);
      return NextResponse.json({ 
        error: 'Unknown pricing plan',
        requestId 
      }, { status: 400 });
    }

    console.log(`[${requestId}] Found pricing plan:`, {
      id: pricingPlan.id,
      name: pricingPlan.name,
      credits: pricingPlan.credits,
      priceUSD: pricingPlan.priceUSD
    });

    // 验证产品ID匹配
    if (pricingPlan.creemPriceId !== product_id) {
      console.error(`[${requestId}] Product ID mismatch:`, { 
        expected: pricingPlan.creemPriceId, 
        received: product_id 
      });
      return NextResponse.json({ 
        error: 'Product ID mismatch',
        requestId 
      }, { status: 400 });
    }

    console.log(`[${requestId}] Processing payment for user ${userId}, plan ${planId}, credits ${pricingPlan.credits}`);

    // 使用Supabase服务角色客户端处理积分充值
    const supabase = createServiceRoleClient();
    
    // 先检查用户当前积分
    const { data: userBefore, error: userError } = await supabase
      .from('users')
      .select('credits, email')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error(`[${requestId}] Failed to fetch user:`, userError);
      return NextResponse.json({ 
        error: 'User not found',
        requestId 
      }, { status: 404 });
    }

    console.log(`[${requestId}] User before payment:`, {
      email: userBefore.email,
      currentCredits: userBefore.credits
    });

    // 执行积分充值
    console.log(`[${requestId}] Calling purchase_credits function...`);
    const { data: purchaseResult, error: purchaseError } = await supabase.rpc('purchase_credits', {
      p_user_id: userId,
      p_amount: pricingPlan.credits,
      p_payment_id: order_id,
      p_description: `Purchase of ${pricingPlan.credits} credits (${pricingPlan.name}) - Order: ${order_id}`
    });

    if (purchaseError) {
      console.error(`[${requestId}] Failed to add credits:`, purchaseError);
      
      // 记录失败的支付，以便后续手动处理
      console.error(`[${requestId}] PAYMENT PROCESSING FAILED - Manual intervention required:`, {
        userId,
        userEmail: userBefore.email,
        planId,
        planName: pricingPlan.name,
        creditsToAdd: pricingPlan.credits,
        orderId: order_id,
        error: purchaseError.message,
        timestamp: new Date().toISOString()
      });

      return NextResponse.json({ 
        error: 'Failed to process payment',
        requestId 
      }, { status: 500 });
    }

    console.log(`[${requestId}] purchase_credits function result:`, purchaseResult);

    // 验证积分是否正确更新
    const { data: userAfter, error: verifyError } = await supabase
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single();

    if (verifyError) {
      console.error(`[${requestId}] Failed to verify credit update:`, verifyError);
    } else {
      const creditsAdded = userAfter.credits - userBefore.credits;
      console.log(`[${requestId}] Credit verification:`, {
        before: userBefore.credits,
        after: userAfter.credits,
        added: creditsAdded,
        expected: pricingPlan.credits,
        success: creditsAdded === pricingPlan.credits
      });

      if (creditsAdded !== pricingPlan.credits) {
        console.error(`[${requestId}] CREDIT MISMATCH - Expected ${pricingPlan.credits}, got ${creditsAdded}`);
      }
    }

    console.log(`[${requestId}] Successfully processed payment in ${Date.now() - startTime}ms`);
    console.log(`[${requestId}] User ${userBefore.email} received ${pricingPlan.credits} credits`);

    // 重定向到成功页面
    const successUrl = new URL('/payment-success', request.url);
    successUrl.searchParams.set('purchase', 'success');
    successUrl.searchParams.set('plan', planId);
    successUrl.searchParams.set('credits', pricingPlan.credits.toString());
    successUrl.searchParams.set('requestId', requestId);

    console.log(`[${requestId}] Redirecting to success page: ${successUrl.toString()}`);
    return NextResponse.redirect(successUrl);

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`[${requestId}] Error processing payment success after ${processingTime}ms:`, error);
    
    // 记录详细错误信息以便调试
    console.error(`[${requestId}] CRITICAL ERROR - Payment callback failed:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      parameters: {
        checkout_id,
        order_id,
        customer_id,
        product_id,
        request_id,
        plan
      },
      timestamp: new Date().toISOString()
    });
    
    // 重定向到错误页面
    const errorUrl = new URL('/pricing', request.url);
    errorUrl.searchParams.set('purchase', 'error');
    errorUrl.searchParams.set('message', 'Payment processing failed');
    errorUrl.searchParams.set('requestId', requestId);

    return NextResponse.redirect(errorUrl);
  }
}

// 也支持POST方法，以防Creem使用POST回调
export const POST = GET;
