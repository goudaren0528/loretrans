import { NextRequest, NextResponse } from 'next/server';
import { PRICING_PLANS } from '@/config/pricing.config';
import { createServiceRoleClient } from '@/lib/supabase-server';
import { APP_CONFIG } from '@/config/app.config';

export async function POST(request: NextRequest) {
  const requestId = `webhook_${Date.now()}`;
  console.log(`[${requestId}] [POST /api/webhooks/creem] Received Creem webhook`);
  
  try {
    const body = await request.json();
    console.log(`[${requestId}] Creem webhook payload:`, JSON.stringify(body, null, 2));

    // 记录所有headers用于调试
    const headers = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log(`[${requestId}] Request headers:`, JSON.stringify(headers, null, 2));

    // 验证webhook签名（如果Creem提供）
    const signature = request.headers.get('x-creem-signature') || request.headers.get('creem-signature');
    if (signature && APP_CONFIG.creem.webhookSecret) {
      console.log(`[${requestId}] Verifying webhook signature...`);
      const rawBody = await request.text();
      const isValid = verifyWebhookSignature(rawBody, signature, APP_CONFIG.creem.webhookSecret);
      if (!isValid) {
        console.error(`[${requestId}] Invalid Creem webhook signature`);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
      console.log(`[${requestId}] Signature verification passed`);
    } else {
      console.log(`[${requestId}] No signature verification (signature: ${!!signature}, secret: ${!!APP_CONFIG.creem.webhookSecret})`);
    }

    // 处理不同类型的webhook事件
    const { event_type, data, type, event, payload, eventType } = body;
    
    // 尝试多种可能的事件类型字段
    const finalEventType = event_type || type || event || eventType || 'unknown';
    console.log(`[${requestId}] Event type: ${finalEventType}`);
    
    // 尝试多种可能的数据字段
    const eventData = data || payload || body;
    console.log(`[${requestId}] Event data:`, JSON.stringify(eventData, null, 2));
    
    if (finalEventType === 'payment.completed' || 
        finalEventType === 'order.completed' || 
        finalEventType === 'payment_completed' ||
        finalEventType === 'checkout.completed') {
      console.log(`[${requestId}] Processing payment completed event`);
      return await handlePaymentCompleted(eventData, requestId);
    }
    
    if (finalEventType === 'payment.failed' || finalEventType === 'payment_failed') {
      console.log(`[${requestId}] Payment failed:`, eventData);
      return NextResponse.json({ received: true });
    }

    // 如果没有明确的事件类型，尝试根据数据内容判断
    if (!finalEventType || finalEventType === 'unknown' || finalEventType === 'undefined') {
      console.log(`[${requestId}] No clear event type, analyzing data...`);
      
      // 检查是否包含支付完成的标识
      if (eventData.payment_status === 'completed' || 
          eventData.status === 'completed' || 
          eventData.order_status === 'completed' ||
          (eventData.order_id && eventData.product_id)) {
        console.log(`[${requestId}] Detected payment completion based on data content`);
        return await handlePaymentCompleted(eventData, requestId);
      }
    }

    console.log(`[${requestId}] Unhandled webhook event type: ${finalEventType}`);
    console.log(`[${requestId}] Full webhook body for analysis:`, JSON.stringify(body, null, 2));
    
    return NextResponse.json({ 
      received: true, 
      event_type: finalEventType,
      message: 'Event received but not processed'
    });

  } catch (error) {
    console.error(`[${requestId}] Error processing Creem webhook:`, error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

// Webhook签名验证函数
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  // TODO: 实现Creem的实际签名验证逻辑
  // 这需要根据Creem官方文档实现
  console.log('Verifying Creem webhook signature');
  
  // 临时实现 - 生产环境需要实现真实的签名验证
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  try {
    // 根据Creem文档实现签名验证
    // const expectedSignature = generateWebhookSignature(payload, secret)
    // return signature === expectedSignature
    return true; // 临时返回true
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return false;
  }
}

async function handlePaymentCompleted(data: any, requestId: string) {
  console.log(`[${requestId}] Processing completed payment:`, JSON.stringify(data, null, 2));

  // 处理Creem的嵌套数据结构
  const order = data.object?.order || data.order || {};
  const product = data.object?.product || data.product || {};
  const customer = data.object?.customer || data.customer || {};

  const {
    order_id,
    customer_email,
    product_id,
    amount,
    currency,
    request_id,
    customer_id,
    // 尝试其他可能的字段名
    orderId,
    productId,
    requestId: altRequestId,
    customerId
  } = data;

  // 从Creem的数据结构中提取信息
  const finalOrderId = order_id || orderId || order.id;
  const finalProductId = product_id || productId || product.id || order.product;
  const finalRequestId = request_id || altRequestId;
  const finalCustomerId = customer_id || customerId || customer.id || order.customer;
  const finalCustomerEmail = customer_email || customer.email;

  console.log(`[${requestId}] Extracted parameters:`, {
    order_id: finalOrderId,
    product_id: finalProductId,
    request_id: finalRequestId,
    customer_id: finalCustomerId,
    customer_email: finalCustomerEmail,
    order_status: order.status,
    amount_paid: order.amount_paid
  });

  // 验证必要参数
  if (!finalOrderId || !finalProductId) {
    console.error(`[${requestId}] Missing required parameters in webhook data`);
    console.error(`[${requestId}] Available data keys:`, Object.keys(data));
    console.error(`[${requestId}] Order keys:`, Object.keys(order));
    console.error(`[${requestId}] Product keys:`, Object.keys(product));
    
    // 如果没有request_id，尝试通过邮箱匹配用户
    if (!finalRequestId && finalCustomerEmail && finalProductId) {
      console.log(`[${requestId}] No request_id found, attempting to match by email and product`);
      return await handlePaymentByEmail(finalCustomerEmail, finalProductId, finalOrderId, requestId);
    }
    
    return NextResponse.json({ 
      error: 'Missing required parameters',
      available_keys: Object.keys(data),
      required: ['order_id', 'product_id'],
      order_data: order,
      product_data: product
    }, { status: 400 });
  }

  // 如果有request_id，使用原有逻辑
  if (finalRequestId) {
    try {
      // 从request_id提取用户ID和计划ID
      const requestParts = finalRequestId.split('_');
      if (requestParts.length < 2) {
        console.error(`[${requestId}] Invalid request_id format:`, finalRequestId);
        return NextResponse.json({ error: 'Invalid request ID format' }, { status: 400 });
      }

      const userId = requestParts[0];
      const planId = requestParts[1];
      
      console.log(`[${requestId}] Extracted userId: ${userId}, planId: ${planId}`);
      return await processPaymentForUser(userId, planId, finalProductId, finalOrderId, requestId);
      
    } catch (error) {
      console.error(`[${requestId}] Error processing with request_id:`, error);
    }
  }

  // 如果没有request_id，尝试通过邮箱匹配
  if (finalCustomerEmail && finalProductId) {
    console.log(`[${requestId}] No valid request_id, attempting to match by email: ${finalCustomerEmail}`);
    return await handlePaymentByEmail(finalCustomerEmail, finalProductId, finalOrderId, requestId);
  }

  console.error(`[${requestId}] Cannot process payment: insufficient data`);
  return NextResponse.json({ error: 'Insufficient data to process payment' }, { status: 400 });
}

async function handlePaymentByEmail(customerEmail: string, productId: string, orderId: string, requestId: string) {
  console.log(`[${requestId}] Attempting to process payment by email: ${customerEmail}`);
  
  try {
    // 查找用户
    const supabase = createServiceRoleClient();
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', customerEmail)
      .single();
    
    if (userError || !user) {
      console.error(`[${requestId}] User not found for email: ${customerEmail}`);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    console.log(`[${requestId}] Found user: ${user.email} (${user.id})`);
    
    // 根据产品ID确定计划
    const pricingPlan = PRICING_PLANS.find(p => p.creemProductId === productId);
    if (!pricingPlan) {
      console.error(`[${requestId}] Unknown product ID: ${productId}`);
      return NextResponse.json({ error: 'Unknown product' }, { status: 400 });
    }
    
    console.log(`[${requestId}] Found pricing plan: ${pricingPlan.name} (${pricingPlan.credits} credits)`);
    
    return await processPaymentForUser(user.id, pricingPlan.id, productId, orderId, requestId);
    
  } catch (error) {
    console.error(`[${requestId}] Error processing payment by email:`, error);
    return NextResponse.json({ error: 'Payment processing failed' }, { status: 500 });
  }
}

async function processPaymentForUser(userId: string, planId: string, productId: string, orderId: string, requestId: string) {
  console.log(`[${requestId}] Processing payment for user ${userId}, plan ${planId}`);
  
  try {
    // 查找对应的定价计划
    const pricingPlan = PRICING_PLANS.find(p => p.id === planId);
    if (!pricingPlan) {
      console.error(`[${requestId}] Unknown pricing plan: ${planId}`);
      return NextResponse.json({ error: 'Unknown pricing plan' }, { status: 400 });
    }

    console.log(`[${requestId}] Found pricing plan:`, {
      id: pricingPlan.id,
      name: pricingPlan.name,
      credits: pricingPlan.credits
    });

    // 验证产品ID匹配
    if (pricingPlan.creemProductId !== productId) {
      console.error(`[${requestId}] Product ID mismatch:`, { 
        expected: pricingPlan.creemProductId, 
        received: productId 
      });
      return NextResponse.json({ error: 'Product ID mismatch' }, { status: 400 });
    }

    console.log(`[${requestId}] Processing webhook payment for user ${userId}, plan ${planId}, credits ${pricingPlan.credits}`);

    // 使用Supabase服务角色客户端处理积分充值
    const supabase = createServiceRoleClient();
    
    // 先检查是否已经处理过这个订单
    const { data: existingTransaction } = await supabase
      .from('credit_transactions')
      .select('id')
      .eq('metadata->payment_id', orderId)
      .single();
      
    if (existingTransaction) {
      console.log(`[${requestId}] Order ${orderId} already processed, skipping`);
      return NextResponse.json({ 
        received: true, 
        processed: false, 
        message: 'Order already processed' 
      });
    }

    const { error } = await supabase.rpc('purchase_credits', {
      p_user_id: userId,
      p_amount: pricingPlan.credits,
      p_payment_id: orderId,
      p_description: `Purchase of ${pricingPlan.credits} credits (${pricingPlan.name}) via webhook - Order: ${orderId}`
    });

    if (error) {
      console.error(`[${requestId}] Failed to add credits via webhook:`, error);
      return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 });
    }

    console.log(`[${requestId}] Successfully added ${pricingPlan.credits} credits to user ${userId} via webhook`);
    return NextResponse.json({ 
      received: true, 
      processed: true,
      credits_added: pricingPlan.credits,
      user_id: userId,
      order_id: orderId
    });

  } catch (error) {
    console.error(`[${requestId}] Error processing payment:`, error);
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

export async function POST(request: NextRequest) {
  const requestId = `webhook_${Date.now()}`;
  console.log(`[${requestId}] [POST /api/webhooks/creem] Received Creem webhook`);
  
  try {
    const body = await request.json();
    console.log(`[${requestId}] Creem webhook payload:`, JSON.stringify(body, null, 2));

    // 记录所有headers用于调试
    const headers = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log(`[${requestId}] Request headers:`, JSON.stringify(headers, null, 2));

    // 验证webhook签名（如果Creem提供）
    const signature = request.headers.get('x-creem-signature');
    if (signature) {
      console.log(`[${requestId}] Verifying signature...`);
      const isValid = creem.verifySignature(body, signature);
      if (!isValid) {
        console.error(`[${requestId}] Invalid Creem webhook signature`);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
      console.log(`[${requestId}] Signature verification passed`);
    } else {
      console.log(`[${requestId}] No signature provided`);
    }

    // 处理不同类型的webhook事件
    const { event_type, data, type, event, payload, eventType } = body;
    
    // 尝试多种可能的事件类型字段
    const finalEventType = event_type || type || event || eventType || 'unknown';
    console.log(`[${requestId}] Event type: ${finalEventType}`);
    
    // 尝试多种可能的数据字段
    const eventData = data || payload || body;
    console.log(`[${requestId}] Event data:`, JSON.stringify(eventData, null, 2));
    
    if (finalEventType === 'payment.completed' || 
        finalEventType === 'order.completed' || 
        finalEventType === 'payment_completed' ||
        finalEventType === 'checkout.completed') {
      console.log(`[${requestId}] Processing payment completed event`);
      return await handlePaymentCompleted(eventData, requestId);
    }
    
    if (eventType === 'payment.failed' || eventType === 'payment_failed') {
      console.log(`[${requestId}] Payment failed:`, eventData);
      return NextResponse.json({ received: true });
    }

    // 如果没有明确的事件类型，尝试根据数据内容判断
    if (!eventType || eventType === 'unknown' || eventType === 'undefined') {
      console.log(`[${requestId}] No clear event type, analyzing data...`);
      
      // 检查是否包含支付完成的标识
      if (eventData.payment_status === 'completed' || 
          eventData.status === 'completed' || 
          eventData.order_status === 'completed' ||
          (eventData.order_id && eventData.product_id)) {
        console.log(`[${requestId}] Detected payment completion based on data content`);
        return await handlePaymentCompleted(eventData, requestId);
      }
    }

    console.log(`[${requestId}] Unhandled webhook event type: ${eventType}`);
    console.log(`[${requestId}] Full webhook body for analysis:`, JSON.stringify(body, null, 2));
    
    return NextResponse.json({ 
      received: true, 
      event_type: eventType,
      message: 'Event received but not processed'
    });

  } catch (error) {
    console.error(`[${requestId}] Error processing Creem webhook:`, error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handlePaymentCompleted(data: any, requestId: string) {
  console.log(`[${requestId}] Processing completed payment:`, JSON.stringify(data, null, 2));

  // 处理Creem的嵌套数据结构
  const order = data.object?.order || data.order || {};
  const product = data.object?.product || data.product || {};
  const customer = data.object?.customer || data.customer || {};

  const {
    order_id,
    customer_email,
    product_id,
    amount,
    currency,
    request_id,
    customer_id,
    // 尝试其他可能的字段名
    orderId,
    productId,
    requestId: altRequestId,
    customerId
  } = data;

  // 从Creem的数据结构中提取信息
  const finalOrderId = order_id || orderId || order.id;
  const finalProductId = product_id || productId || product.id || order.product;
  const finalRequestId = request_id || altRequestId;
  const finalCustomerId = customer_id || customerId || customer.id || order.customer;
  const finalCustomerEmail = customer_email || customer.email;

  console.log(`[${requestId}] Extracted parameters:`, {
    order_id: finalOrderId,
    product_id: finalProductId,
    request_id: finalRequestId,
    customer_id: finalCustomerId,
    customer_email: finalCustomerEmail,
    order_status: order.status,
    amount_paid: order.amount_paid
  });

  // 验证必要参数
  if (!finalOrderId || !finalProductId) {
    console.error(`[${requestId}] Missing required parameters in webhook data`);
    console.error(`[${requestId}] Available data keys:`, Object.keys(data));
    console.error(`[${requestId}] Order keys:`, Object.keys(order));
    console.error(`[${requestId}] Product keys:`, Object.keys(product));
    
    // 如果没有request_id，尝试通过邮箱匹配用户
    if (!finalRequestId && finalCustomerEmail && finalProductId) {
      console.log(`[${requestId}] No request_id found, attempting to match by email and product`);
      return await handlePaymentByEmail(finalCustomerEmail, finalProductId, finalOrderId, requestId);
    }
    
    return NextResponse.json({ 
      error: 'Missing required parameters',
      available_keys: Object.keys(data),
      required: ['order_id', 'product_id'],
      order_data: order,
      product_data: product
    }, { status: 400 });
  }

  // 如果有request_id，使用原有逻辑
  if (finalRequestId) {
    try {
      // 从request_id提取用户ID和计划ID
      const requestParts = finalRequestId.split('_');
      if (requestParts.length < 2) {
        console.error(`[${requestId}] Invalid request_id format:`, finalRequestId);
        return NextResponse.json({ error: 'Invalid request ID format' }, { status: 400 });
      }

      const userId = requestParts[0];
      const planId = requestParts[1];
      
      console.log(`[${requestId}] Extracted userId: ${userId}, planId: ${planId}`);
      return await processPaymentForUser(userId, planId, finalProductId, finalOrderId, requestId);
      
    } catch (error) {
      console.error(`[${requestId}] Error processing with request_id:`, error);
    }
  }

  // 如果没有request_id，尝试通过邮箱匹配
  if (finalCustomerEmail && finalProductId) {
    console.log(`[${requestId}] No valid request_id, attempting to match by email: ${finalCustomerEmail}`);
    return await handlePaymentByEmail(finalCustomerEmail, finalProductId, finalOrderId, requestId);
  }

  console.error(`[${requestId}] Cannot process payment: insufficient data`);
  return NextResponse.json({ error: 'Insufficient data to process payment' }, { status: 400 });
}

async function handlePaymentByEmail(customerEmail: string, productId: string, orderId: string, requestId: string) {
  console.log(`[${requestId}] Attempting to process payment by email: ${customerEmail}`);
  
  try {
    // 查找用户
    const supabase = createServiceRoleClient();
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', customerEmail)
      .single();
    
    if (userError || !user) {
      console.error(`[${requestId}] User not found for email: ${customerEmail}`);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    console.log(`[${requestId}] Found user: ${user.email} (${user.id})`);
    
    // 根据产品ID确定计划
    const pricingPlan = PRICING_PLANS.find(p => p.creemPriceId === productId);
    if (!pricingPlan) {
      console.error(`[${requestId}] Unknown product ID: ${productId}`);
      return NextResponse.json({ error: 'Unknown product' }, { status: 400 });
    }
    
    console.log(`[${requestId}] Found pricing plan: ${pricingPlan.name} (${pricingPlan.credits} credits)`);
    
    return await processPaymentForUser(user.id, pricingPlan.id, productId, orderId, requestId);
    
  } catch (error) {
    console.error(`[${requestId}] Error processing payment by email:`, error);
    return NextResponse.json({ error: 'Payment processing failed' }, { status: 500 });
  }
}

async function processPaymentForUser(userId: string, planId: string, productId: string, orderId: string, requestId: string) {
  console.log(`[${requestId}] Processing payment for user ${userId}, plan ${planId}`);
  
  try {
    // 查找对应的定价计划
    const pricingPlan = PRICING_PLANS.find(p => p.id === planId);
    if (!pricingPlan) {
      console.error(`[${requestId}] Unknown pricing plan: ${planId}`);
      return NextResponse.json({ error: 'Unknown pricing plan' }, { status: 400 });
    }

    console.log(`[${requestId}] Found pricing plan:`, {
      id: pricingPlan.id,
      name: pricingPlan.name,
      credits: pricingPlan.credits
    });

    // 验证产品ID匹配
    if (pricingPlan.creemPriceId !== productId) {
      console.error(`[${requestId}] Product ID mismatch:`, { 
        expected: pricingPlan.creemPriceId, 
        received: productId 
      });
      return NextResponse.json({ error: 'Product ID mismatch' }, { status: 400 });
    }

    console.log(`[${requestId}] Processing webhook payment for user ${userId}, plan ${planId}, credits ${pricingPlan.credits}`);

    // 使用Supabase服务角色客户端处理积分充值
    const supabase = createServiceRoleClient();
    
    // 先检查是否已经处理过这个订单
    const { data: existingTransaction } = await supabase
      .from('credit_transactions')
      .select('id')
      .eq('metadata->payment_id', orderId)
      .single();
      
    if (existingTransaction) {
      console.log(`[${requestId}] Order ${orderId} already processed, skipping`);
      return NextResponse.json({ 
        received: true, 
        processed: false, 
        message: 'Order already processed' 
      });
    }

    const { error } = await supabase.rpc('purchase_credits', {
      p_user_id: userId,
      p_amount: pricingPlan.credits,
      p_payment_id: orderId,
      p_description: `Purchase of ${pricingPlan.credits} credits (${pricingPlan.name}) via webhook - Order: ${orderId}`
    });

    if (error) {
      console.error(`[${requestId}] Failed to add credits via webhook:`, error);
      return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 });
    }

    console.log(`[${requestId}] Successfully added ${pricingPlan.credits} credits to user ${userId} via webhook`);
    return NextResponse.json({ 
      received: true, 
      processed: true,
      credits_added: pricingPlan.credits,
      user_id: userId,
      order_id: orderId
    });

  } catch (error) {
    console.error(`[${requestId}] Error processing payment:`, error);
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
