#!/usr/bin/env node

/**
 * 支付回调模拟器
 * 模拟Creem支付成功后的回调，用于测试积分发放
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function simulatePaymentCallback() {
  console.log('🧪 支付回调模拟器\n');
  console.log('模拟Creem支付成功后的回调请求...\n');

  // 模拟支付成功的参数
  const userId = '5f36d348-7553-4d70-9003-4994c6b23428'; // hongwane323@gmail.com
  const planId = 'basic';
  const orderId = `order_${Date.now()}`;
  const checkoutId = `checkout_${Date.now()}`;
  const productId = 'prod_7ghOSJ2klCjPTjnURPbMoh'; // Basic Pack的产品ID
  const requestId = `${userId}_${planId}_${Date.now()}`;

  const callbackParams = new URLSearchParams({
    checkout_id: checkoutId,
    order_id: orderId,
    customer_id: userId,
    product_id: productId,
    request_id: requestId,
    plan: planId
  });

  const callbackUrl = `${BASE_URL}/api/payment/success?${callbackParams.toString()}`;

  console.log('📋 模拟的回调参数:');
  console.log(`   checkout_id: ${checkoutId}`);
  console.log(`   order_id: ${orderId}`);
  console.log(`   customer_id: ${userId}`);
  console.log(`   product_id: ${productId}`);
  console.log(`   request_id: ${requestId}`);
  console.log(`   plan: ${planId}`);
  console.log('');
  console.log(`🔗 完整回调URL:`);
  console.log(`   ${callbackUrl}`);
  console.log('');

  try {
    console.log('🚀 发送回调请求...');
    
    const response = await fetch(callbackUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Creem-Webhook/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      redirect: 'manual' // 不自动跟随重定向
    });

    console.log(`📊 响应状态: ${response.status} ${response.statusText}`);
    
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      console.log(`🔄 重定向到: ${location}`);
      
      if (location && location.includes('payment-success')) {
        console.log('✅ 支付成功！重定向到成功页面');
      } else if (location && location.includes('purchase=error')) {
        console.log('❌ 支付处理失败');
      }
    } else {
      const responseText = await response.text();
      console.log('📝 响应内容:');
      console.log(responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''));
    }

    // 验证积分是否增加
    console.log('\n🔍 验证积分变化...');
    await verifyCredits(userId);

  } catch (error) {
    console.error('❌ 回调请求失败:', error.message);
  }
}

async function verifyCredits(userId) {
  const { createClient } = require('@supabase/supabase-js');
  require('dotenv').config({ path: '.env.local' });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('⚠️  无法验证积分：缺少Supabase配置');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('credits, email, updated_at')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('❌ 获取用户信息失败:', error.message);
      return;
    }

    console.log('📊 用户当前状态:');
    console.log(`   邮箱: ${user.email}`);
    console.log(`   积分: ${user.credits}`);
    console.log(`   更新时间: ${user.updated_at}`);

    // 检查最近的交易记录
    const { data: transactions, error: txError } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(3);

    if (!txError && transactions.length > 0) {
      console.log('\n📋 最近的交易记录:');
      transactions.forEach((tx, index) => {
        console.log(`   ${index + 1}. ${tx.type}: ${tx.amount} 积分 (余额: ${tx.balance})`);
        console.log(`      时间: ${tx.created_at}`);
        console.log(`      描述: ${tx.description}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ 验证积分时出错:', error.message);
  }
}

// 运行模拟器
simulatePaymentCallback();
