#!/usr/bin/env node

/**
 * 测试新的Checkout Session实现
 * 验证简化的Creem集成是否正常工作
 */

const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

async function testNewCheckout() {
  console.log('🧪 测试简化的Checkout Session实现\n');
  
  const BASE_URL = 'https://be46-184-169-178-219.ngrok-free.app';
  
  // 模拟用户登录token（您需要从实际登录中获取）
  const testUserId = 'b7bee007-2a9f-4fb8-8020-10b707e2f4f4';
  const testEmail = 'hongwane322@gmail.com';
  
  console.log('📋 测试参数:');
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   User ID: ${testUserId}`);
  console.log(`   Email: ${testEmail}`);
  console.log('');
  
  try {
    // 测试checkout API
    console.log('🚀 调用checkout API...');
    
    const checkoutResponse = await fetch(`${BASE_URL}/api/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        planId: 'basic'
      })
    });
    
    console.log(`📊 Checkout API响应: ${checkoutResponse.status} ${checkoutResponse.statusText}`);
    
    if (checkoutResponse.ok) {
      const checkoutData = await checkoutResponse.json();
      console.log('✅ Checkout API成功响应:');
      console.log(JSON.stringify(checkoutData, null, 2));
      
      if (checkoutData.method === 'checkout_session') {
        console.log('🎉 使用了标准的Checkout Session API!');
        console.log(`   Checkout URL: ${checkoutData.url}`);
        console.log(`   Request ID: ${checkoutData.request_id}`);
      } else if (checkoutData.method === 'direct_url') {
        console.log('🔄 回退到直接支付URL');
        console.log(`   Payment URL: ${checkoutData.url}`);
        console.log(`   Request ID: ${checkoutData.request_id}`);
      }
      
    } else {
      const errorText = await checkoutResponse.text();
      console.log('❌ Checkout API失败:');
      console.log(errorText);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

async function testCreemAPI() {
  console.log('\n🔧 直接测试Creem API...');
  
  const apiKey = process.env.CREEM_API_KEY;
  const productId = 'prod_7ghOSJ2klCjPTjnURPbMoh';
  
  if (!apiKey) {
    console.log('❌ 缺少CREEM_API_KEY环境变量');
    console.log('   请确保.env.local中设置了CREEM_API_KEY');
    return;
  }
  
  console.log(`🔑 使用API密钥: ${apiKey.substring(0, 20)}...`);
  
  const testPayload = {
    product_id: productId,
    request_id: 'test_direct_' + Date.now(),
    success_url: 'https://be46-184-169-178-219.ngrok-free.app/payment-success',
    cancel_url: 'https://be46-184-169-178-219.ngrok-free.app/pricing?purchase=canceled',
    customer_email: 'hongwane322@gmail.com',
    metadata: {
      userId: 'b7bee007-2a9f-4fb8-8020-10b707e2f4f4',
      planId: 'basic',
      userEmail: 'hongwane322@gmail.com'
    }
  };
  
  console.log('📤 发送到Creem API:');
  console.log(JSON.stringify(testPayload, null, 2));
  console.log('');
  
  try {
    const response = await fetch('https://api.creem.io/v1/checkouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey // 使用单一API密钥
      },
      body: JSON.stringify(testPayload)
    });
    
    console.log(`📊 Creem API响应: ${response.status} ${response.statusText}`);
    
    const responseText = await response.text();
    console.log('📝 响应内容:');
    
    try {
      const responseData = JSON.parse(responseText);
      console.log(JSON.stringify(responseData, null, 2));
      
      if (response.ok && responseData.checkout_url) {
        console.log('\n✅ Creem API调用成功!');
        console.log(`🔗 Checkout URL: ${responseData.checkout_url}`);
        console.log(`📋 Session ID: ${responseData.id}`);
        
        if (responseData.request_id) {
          console.log(`🏷️  Request ID: ${responseData.request_id}`);
        }
      } else {
        console.log('\n❌ Creem API调用失败');
        if (response.status === 403) {
          console.log('   可能的原因:');
          console.log('   1. API密钥无效或权限不足');
          console.log('   2. 产品ID不存在或无权访问');
          console.log('   3. API密钥格式错误');
        }
      }
      
    } catch (parseError) {
      console.log('原始响应:', responseText);
    }
    
  } catch (error) {
    console.error('❌ Creem API调用失败:', error.message);
  }
}

async function verifyConfiguration() {
  console.log('\n🔍 验证配置...');
  
  const apiKey = process.env.CREEM_API_KEY;
  const webhookSecret = process.env.CREEM_WEBHOOK_SECRET;
  
  console.log('📋 当前配置:');
  console.log(`   CREEM_API_KEY: ${apiKey ? '✅ 已设置' : '❌ 未设置'}`);
  console.log(`   CREEM_WEBHOOK_SECRET: ${webhookSecret ? '✅ 已设置' : '❌ 未设置'}`);
  
  if (apiKey) {
    console.log(`   API密钥格式: ${apiKey.startsWith('creem_') ? '✅ 正确' : '❌ 可能错误'}`);
    console.log(`   API密钥长度: ${apiKey.length} 字符`);
  }
  
  if (webhookSecret) {
    console.log(`   Webhook密钥格式: ${webhookSecret.startsWith('whsec_') ? '✅ 正确' : '❌ 可能错误'}`);
  }
  
  // 检查是否还有旧的配置
  const oldPublicKey = process.env.NEXT_PUBLIC_CREEM_PUBLISHABLE_KEY;
  const oldSecretKey = process.env.CREEM_SECRET_KEY;
  
  if (oldPublicKey || oldSecretKey) {
    console.log('\n⚠️  发现旧配置:');
    if (oldPublicKey) {
      console.log(`   NEXT_PUBLIC_CREEM_PUBLISHABLE_KEY: ${oldPublicKey}`);
      console.log('   建议: 删除此配置，不再需要');
    }
    if (oldSecretKey) {
      console.log(`   CREEM_SECRET_KEY: ${oldSecretKey}`);
      console.log('   建议: 重命名为CREEM_API_KEY');
    }
  }
}

// 运行测试
async function runTests() {
  await verifyConfiguration();
  console.log('\n' + '='.repeat(60) + '\n');
  await testCreemAPI();
  console.log('\n' + '='.repeat(60) + '\n');
  await testNewCheckout();
}

runTests();
