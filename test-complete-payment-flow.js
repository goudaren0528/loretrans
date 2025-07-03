#!/usr/bin/env node

/**
 * 完整支付流程测试
 * 使用ngrok公网URL测试真实的支付回调
 */

const fetch = require('node-fetch');

const NGROK_URL = 'https://33bb-38-98-190-191.ngrok-free.app';
const LOCAL_URL = 'http://localhost:3000';

async function testCompletePaymentFlow() {
  console.log('🚀 完整支付流程测试\n');
  console.log(`🌐 ngrok公网URL: ${NGROK_URL}`);
  console.log(`🏠 本地URL: ${LOCAL_URL}\n`);

  try {
    // 1. 测试ngrok隧道是否正常工作
    console.log('1️⃣ 测试ngrok隧道...');
    
    const ngrokResponse = await fetch(`${NGROK_URL}/api/health`, {
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });
    
    if (ngrokResponse.ok) {
      const healthData = await ngrokResponse.json();
      console.log('✅ ngrok隧道正常工作');
      console.log(`   服务状态: ${healthData.data?.status || 'OK'}`);
    } else {
      console.log(`⚠️  ngrok响应状态: ${ngrokResponse.status}`);
    }

    // 2. 测试本地服务
    console.log('\n2️⃣ 测试本地服务...');
    
    const localResponse = await fetch(`${LOCAL_URL}/api/health`);
    if (localResponse.ok) {
      console.log('✅ 本地服务正常运行');
    } else {
      console.log(`❌ 本地服务问题: ${localResponse.status}`);
    }

    // 3. 模拟支付回调 - 使用ngrok URL
    console.log('\n3️⃣ 模拟支付回调 (使用ngrok URL)...');
    
    const userId = '5f36d348-7553-4d70-9003-4994c6b23428';
    const planId = 'basic';
    const orderId = `ngrok_test_${Date.now()}`;
    const checkoutId = `checkout_${Date.now()}`;
    const productId = 'prod_7ghOSJ2klCjPTjnURPbMoh';
    const requestId = `${userId}_${planId}_${Date.now()}`;

    const callbackParams = new URLSearchParams({
      checkout_id: checkoutId,
      order_id: orderId,
      customer_id: userId,
      product_id: productId,
      request_id: requestId,
      plan: planId
    });

    // 使用ngrok URL进行回调测试
    const callbackUrl = `${NGROK_URL}/api/payment/success?${callbackParams.toString()}`;
    
    console.log('📋 回调参数:');
    console.log(`   order_id: ${orderId}`);
    console.log(`   product_id: ${productId}`);
    console.log(`   request_id: ${requestId}`);
    console.log('');
    console.log(`🔗 回调URL: ${callbackUrl}`);
    console.log('');

    // 获取用户当前积分
    const creditsBefore = await getUserCredits(userId);
    console.log(`💰 支付前积分: ${creditsBefore}`);

    // 发送回调请求
    console.log('🚀 发送支付回调请求...');
    
    const callbackResponse = await fetch(callbackUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Creem-Webhook/1.0',
        'ngrok-skip-browser-warning': 'true'
      },
      redirect: 'manual'
    });

    console.log(`📊 回调响应: ${callbackResponse.status} ${callbackResponse.statusText}`);
    
    if (callbackResponse.status >= 300 && callbackResponse.status < 400) {
      const location = callbackResponse.headers.get('location');
      console.log(`🔄 重定向到: ${location}`);
      
      if (location && location.includes('payment-success')) {
        console.log('✅ 支付成功处理！');
      } else if (location && location.includes('purchase=error')) {
        console.log('❌ 支付处理失败');
      }
    }

    // 等待处理完成
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 验证积分变化
    console.log('\n4️⃣ 验证积分变化...');
    const creditsAfter = await getUserCredits(userId);
    const creditsAdded = creditsAfter - creditsBefore;
    
    console.log(`💰 支付后积分: ${creditsAfter}`);
    console.log(`📈 积分变化: +${creditsAdded}`);
    
    if (creditsAdded === 5000) {
      console.log('🎉 支付流程测试成功！积分正确增加5000');
    } else if (creditsAdded > 0) {
      console.log(`⚠️  积分增加了${creditsAdded}，但期望是5000`);
    } else {
      console.log('❌ 积分没有增加，支付回调可能失败');
    }

    // 5. 生成测试报告
    console.log('\n📋 测试报告:');
    console.log('─'.repeat(50));
    console.log(`ngrok隧道: ${ngrokResponse.ok ? '✅ 正常' : '❌ 异常'}`);
    console.log(`本地服务: ${localResponse.ok ? '✅ 正常' : '❌ 异常'}`);
    console.log(`支付回调: ${callbackResponse.status < 400 ? '✅ 成功' : '❌ 失败'}`);
    console.log(`积分发放: ${creditsAdded === 5000 ? '✅ 正确' : creditsAdded > 0 ? '⚠️ 部分' : '❌ 失败'}`);
    console.log('─'.repeat(50));

    // 6. 下一步建议
    console.log('\n🎯 下一步测试建议:');
    console.log(`1. 在浏览器中访问: ${NGROK_URL}/en/pricing`);
    console.log('2. 登录用户账户 (hongwane323@gmail.com)');
    console.log('3. 点击Basic Pack的购买按钮');
    console.log('4. 验证是否跳转到Creem支付页面');
    console.log('5. 完成测试支付并验证积分增加');

  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
  }
}

async function getUserCredits(userId) {
  const { createClient } = require('@supabase/supabase-js');
  require('dotenv').config({ path: '.env.local' });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return 0;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single();

    return error ? 0 : user.credits;
  } catch (error) {
    return 0;
  }
}

// 运行测试
testCompletePaymentFlow();
