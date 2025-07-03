import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

/**
 * CREEM Webhook处理器
 * 
 * 处理来自CREEM的支付通知
 * 文档: https://docs.creem.io/webhooks
 */

export async function POST(request: NextRequest) {
  console.log('[CREEM Webhook] Received webhook request');
  
  try {
    // 获取请求体
    const body = await request.text();
    const headersList = headers();
    
    // 记录webhook详情
    console.log('[CREEM Webhook] Headers:', Object.fromEntries(headersList.entries()));
    console.log('[CREEM Webhook] Body:', body);
    
    // 验证webhook签名 (如果配置了webhook secret)
    const webhookSecret = process.env.CREEM_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = headersList.get('x-creem-signature') || headersList.get('signature');
      console.log('[CREEM Webhook] Signature:', signature);
      
      // TODO: 实现签名验证
      // const isValid = verifyWebhookSignature(body, signature, webhookSecret);
      // if (!isValid) {
      //   console.error('[CREEM Webhook] Invalid signature');
      //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      // }
    }
    
    // 解析webhook数据
    let webhookData;
    try {
      webhookData = JSON.parse(body);
    } catch (parseError) {
      console.error('[CREEM Webhook] Failed to parse JSON:', parseError);
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    
    console.log('[CREEM Webhook] Parsed data:', JSON.stringify(webhookData, null, 2));
    
    // 处理不同类型的webhook事件
    const eventType = webhookData.eventType || webhookData.type || webhookData.event_type || 'unknown';
    console.log('[CREEM Webhook] Event type:', eventType);
    
    switch (eventType) {
      case 'payment.completed':
      case 'checkout.completed':
        await handlePaymentCompleted(webhookData);
        break;
        
      case 'payment.failed':
      case 'checkout.failed':
        await handlePaymentFailed(webhookData);
        break;
        
      case 'payment.cancelled':
      case 'checkout.cancelled':
        await handlePaymentCancelled(webhookData);
        break;
        
      default:
        console.log('[CREEM Webhook] Unknown event type, logging for analysis');
        console.log('[CREEM Webhook] Full webhook data:', JSON.stringify(webhookData, null, 2));
        // 记录未知事件类型以便后续分析
        break;
    }
    
    // 返回成功响应
    return NextResponse.json({ 
      received: true, 
      event_type: eventType,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[CREEM Webhook] Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// 处理支付成功
async function handlePaymentCompleted(data: any) {
  console.log('[CREEM Webhook] Processing payment completed:', data);
  
  try {
    // CREEM的实际数据格式
    const checkoutObject = data.object || data;
    const { request_id, customer, amount, metadata } = checkoutObject;
    
    console.log('[CREEM Webhook] Checkout object:', checkoutObject);
    console.log('[CREEM Webhook] Request ID:', request_id);
    console.log('[CREEM Webhook] Customer:', customer);
    console.log('[CREEM Webhook] Metadata:', metadata);
    
    // 从request_id中提取用户ID和计划ID，或从metadata中获取
    let userId, planId;
    
    if (request_id) {
      [userId, planId] = request_id.split('_');
    }
    
    // 如果从request_id解析失败，尝试从metadata获取
    if (!userId && metadata) {
      userId = metadata.userId;
      planId = metadata.planId;
    }
    
    // 如果还是没有，尝试从customer email匹配用户
    if (!userId && customer?.email) {
      console.log('[CREEM Webhook] Attempting to find user by email:', customer.email);
      // TODO: 通过email查找用户ID
    }
    
    if (!userId || !planId) {
      console.error('[CREEM Webhook] Unable to extract user/plan info:', { request_id, metadata, customer });
      return;
    }
    
    console.log(`[CREEM Webhook] Payment completed for user ${userId}, plan ${planId}`);
    
    // 获取积分数量
    const credits = metadata?.credits ? parseInt(metadata.credits) : 5000; // 默认5000积分
    
    console.log(`[CREEM Webhook] Adding ${credits} credits to user ${userId}`);
    
    // 🔧 关键改进：立即更新数据库积分
    try {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      
      // 获取当前用户积分
      const { data: currentUser, error: fetchError } = await supabase
        .from('users')
        .select('credits, email')
        .eq('id', userId)
        .single();
      
      if (fetchError) {
        console.error('[CREEM Webhook] Failed to fetch user:', fetchError);
        return;
      }
      
      const currentCredits = currentUser?.credits || 0;
      const newCredits = currentCredits + credits;
      
      console.log(`[CREEM Webhook] Current credits: ${currentCredits}, Adding: ${credits}, New total: ${newCredits}`);
      
      // 更新用户积分
      const { data: updateResult, error: updateError } = await supabase
        .from('users')
        .update({ 
          credits: newCredits,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select();
      
      if (updateError) {
        console.error('[CREEM Webhook] Failed to update credits:', updateError);
      } else {
        console.log('[CREEM Webhook] ✅ Credits updated successfully:', updateResult[0]);
        
        // 记录支付历史
        const fs = require('fs');
        const logPath = '/home/hwt/translation-low-source/payment-history.log';
        const logEntry = `${new Date().toISOString()} - Payment Completed (Auto): {"payment_id":"${checkoutObject.id}","user_id":"${userId}","credits":${credits},"amount":${amount || 5.00},"status":"completed","email":"${customer?.email}"}\n`;
        
        try {
          fs.appendFileSync(logPath, logEntry);
          console.log('[CREEM Webhook] Payment logged successfully');
        } catch (logError) {
          console.error('[CREEM Webhook] Failed to log payment:', logError);
        }
        
        // 🔧 新增：通知前端刷新（如果有WebSocket连接）
        // TODO: 实现WebSocket通知机制
        console.log('[CREEM Webhook] 💡 Consider implementing WebSocket notification for real-time updates');
      }
      
    } catch (dbError) {
      console.error('[CREEM Webhook] Database operation failed:', dbError);
    }
    
    // 临时日志记录，直到数据库集成完成
    console.log('[CREEM Webhook] Payment processing completed:', {
      userId,
      planId,
      credits,
      paymentId: checkoutObject.id,
      amount: amount,
      customerEmail: customer?.email,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[CREEM Webhook] Error handling payment completed:', error);
  }
}

// 处理支付失败
async function handlePaymentFailed(data: any) {
  console.log('[CREEM Webhook] Processing payment failed:', data);
  
  try {
    const { request_id, error_message } = data;
    
    // 记录支付失败
    console.log(`[CREEM Webhook] Payment failed for request ${request_id}: ${error_message}`);
    
    // TODO: 可以发送邮件通知用户支付失败
    
  } catch (error) {
    console.error('[CREEM Webhook] Error handling payment failed:', error);
  }
}

// 处理支付取消
async function handlePaymentCancelled(data: any) {
  console.log('[CREEM Webhook] Processing payment cancelled:', data);
  
  try {
    const { request_id } = data;
    
    // 记录支付取消
    console.log(`[CREEM Webhook] Payment cancelled for request ${request_id}`);
    
    // TODO: 可以记录取消原因用于分析
    
  } catch (error) {
    console.error('[CREEM Webhook] Error handling payment cancelled:', error);
  }
}

// GET方法用于webhook验证 (某些支付服务需要)
export async function GET(request: NextRequest) {
  console.log('[CREEM Webhook] GET request received - webhook verification');
  
  const { searchParams } = new URL(request.url);
  const challenge = searchParams.get('challenge');
  
  if (challenge) {
    // 返回challenge用于webhook验证
    return new Response(challenge, { status: 200 });
  }
  
  return NextResponse.json({ 
    status: 'CREEM webhook endpoint active',
    timestamp: new Date().toISOString(),
    url: request.url
  });
}
