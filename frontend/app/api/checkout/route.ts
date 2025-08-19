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

    // 免费计划不需要支付
    if (plan.id === 'free') {
      return NextResponse.json({ 
        error: 'Free plan does not require payment' 
      }, { status: 400 });
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL || 'https://fdb2-38-98-191-33.ngrok-free.app';
    const request_id = `${req.userContext.user.id}_${planId}_${Date.now()}`;
    
    console.log(`🚀 Creating checkout session for plan ${planId} with request_id: ${request_id}`);

    // 🔄 尝试CREEM API调用
    const apiKey = process.env.CREEM_API_KEY;
    console.log('🔑 API Key check:', { 
      hasApiKey: !!apiKey, 
      hasProductId: !!plan.creemProductId,
      hasPaymentUrl: !!plan.creemPaymentUrl,
      planId: planId,
      apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'none',
      productId: plan.creemProductId,
      paymentUrl: plan.creemPaymentUrl
    });
    
    if (apiKey && plan.creemProductId) {
      console.log('🧪 Attempting CREEM API call');
      
      const success_url = `${origin}/payment-success`;
      const cancel_url = `${origin}/pricing?purchase=canceled`;
      
      const checkoutPayload = {
        product_id: plan.creemProductId,
        request_id: request_id,
        success_url: success_url,
        cancel_url: cancel_url,
        customer: {
          email: req.userContext.user.email
        },
        metadata: {
          userId: req.userContext.user.id,
          planId: planId,
          userEmail: req.userContext.user.email,
          planName: plan.name,
          credits: plan.credits.toString()
        }
      };

      console.log('CREEM API payload:', JSON.stringify(checkoutPayload, null, 2));

      try {
        const checkoutResponse = await fetch('https://api.creem.io/v1/checkouts', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(checkoutPayload)
        });
        
        const responseText = await checkoutResponse.text();
        console.log(`CREEM API response status: ${checkoutResponse.status}`);
        console.log(`CREEM API response body: ${responseText}`);
        
        if (checkoutResponse.ok) {
          const checkoutData = JSON.parse(responseText);
          console.log(`✅ CREEM API checkout session created successfully:`, checkoutData);
          
          return NextResponse.json({ 
            url: checkoutData.checkout_url,
            checkout_id: checkoutData.id,
            request_id: request_id,
            method: 'api_checkout'
          });
        } else {
          console.log(`⚠️ CREEM API call failed (${checkoutResponse.status}), falling back to direct URL`);
          
          // API失败，回退到直接支付URL
          if (plan.creemPaymentUrl) {
            return handleDirectPaymentUrl(plan, planId, req, origin);
          }
        }
        
      } catch (error) {
        console.log(`⚠️ CREEM API call error, falling back to direct URL:`, error instanceof Error ? error.message : String(error));
        
        // 网络错误，回退到直接支付URL
        if (plan.creemPaymentUrl) {
          return handleDirectPaymentUrl(plan, planId, req, origin);
        }
      }
    }

    // 🔗 如果没有API密钥但有直接支付URL，使用直接支付URL
    if (plan.creemPaymentUrl) {
      console.log('📋 Using direct payment URL (no API key)');
      return handleDirectPaymentUrl(plan, planId, req, origin);
    }

    // 🔗 如果有产品ID但没有API密钥，生成默认的支付URL
    if (plan.creemProductId && !apiKey) {
      console.log('🔧 Generating default payment URL for product:', plan.creemProductId);
      const defaultPaymentUrl = `https://www.creem.io/test/payment/${plan.creemProductId}`;
      const planWithUrl = { ...plan, creemPaymentUrl: defaultPaymentUrl };
      return handleDirectPaymentUrl(planWithUrl, planId, req, origin);
    }

    // 🚨 最后的错误处理
    console.error(`❌ No payment method available for plan: ${planId}`, {
      hasApiKey: !!apiKey,
      hasProductId: !!plan.creemProductId,
      hasPaymentUrl: !!plan.creemPaymentUrl,
      planConfig: {
        id: plan.id,
        name: plan.name,
        creemProductId: plan.creemProductId,
        creemPaymentUrl: plan.creemPaymentUrl
      }
    });
    
    return NextResponse.json({ 
      error: 'Payment method not configured',
      details: `No valid payment method found for plan: ${plan.name}`,
      suggestion: 'Please configure CREEM_API_KEY environment variable or creemPaymentUrl in plan configuration.',
      debug: {
        planId: planId,
        hasApiKey: !!apiKey,
        hasProductId: !!plan.creemProductId,
        hasPaymentUrl: !!plan.creemPaymentUrl,
        timestamp: new Date().toISOString()
      }
    }, { status: 503 });

  } catch (error: any) {
    console.error('❌ Error creating checkout session:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { 
        error: errorMessage,
        suggestion: 'Please try again or contact support if the problem persists.'
      },
      { status: 500 }
    );
  }
}

// 处理直接支付URL的回退方案
function handleDirectPaymentUrl(plan: any, planId: string, req: NextRequestWithUser, origin: string) {
  // 确保使用正确的ngrok地址
  const ngrokOrigin = process.env.NEXT_PUBLIC_APP_URL || origin;
  const success_url = `${ngrokOrigin}/payment-success`;
  const cancel_url = `${ngrokOrigin}/pricing?purchase=canceled`;
  const request_id = `${req.userContext.user.id}_${planId}_${Date.now()}`;
  
  console.log(`🔗 Using direct payment URL for plan ${planId} with request_id: ${request_id}`);
  console.log(`🌐 Origin: ${origin}, NgrokOrigin: ${ngrokOrigin}`);
  
  if (!plan.creemPaymentUrl) {
    console.error('❌ No payment URL configured for plan:', planId);
    return NextResponse.json({ 
      error: 'Payment URL not configured',
      details: 'No payment URL available for this plan.',
      suggestion: 'Please configure creemPaymentUrl in pricing configuration.'
    }, { status: 500 });
  }
  
  let paymentUrl: URL;
  
  try {
    // 检查是否是有效的URL
    paymentUrl = new URL(plan.creemPaymentUrl);
    
    // 添加必要的参数，确保使用ngrok地址
    paymentUrl.searchParams.set('success_url', success_url);
    paymentUrl.searchParams.set('cancel_url', cancel_url);
    paymentUrl.searchParams.set('customer_email', req.userContext.user.email || '');
    paymentUrl.searchParams.set('request_id', request_id);
    
    // 添加元数据参数
    paymentUrl.searchParams.set('metadata[userId]', req.userContext.user.id);
    paymentUrl.searchParams.set('metadata[planId]', planId);
    paymentUrl.searchParams.set('metadata[userEmail]', req.userContext.user.email || '');
    paymentUrl.searchParams.set('metadata[planName]', plan.name);
    paymentUrl.searchParams.set('metadata[credits]', plan.credits.toString());
    
  } catch (urlError) {
    console.error('❌ Invalid payment URL:', plan.creemPaymentUrl, urlError);
    return NextResponse.json({ 
      error: 'Invalid payment URL',
      details: 'The configured payment URL is not valid.',
      suggestion: 'Please check the creemPaymentUrl configuration.'
    }, { status: 500 });
  }
  
  console.log(`✅ Payment URL generated: ${paymentUrl.toString()}`);
  
  return NextResponse.json({ 
    url: paymentUrl.toString(),
    checkout_id: `direct_${planId}_${Date.now()}`,
    request_id: request_id,
    method: 'direct_url',
    note: 'Using direct payment URL with ngrok callback addresses.'
  });
}

export const POST = withApiAuth(createCheckoutSession, ['free_user', 'pro_user', 'admin']); 
