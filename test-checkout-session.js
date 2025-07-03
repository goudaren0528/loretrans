#!/usr/bin/env node

/**
 * 测试Creem Checkout Session API
 * 验证request_id是否正确传递
 */

const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

async function testCheckoutSession() {
  console.log('🧪 测试Creem Checkout Session API\n');
  
  const apiKey = process.env.CREEM_SECRET_KEY;
  const productId = 'prod_7ghOSJ2klCjPTjnURPbMoh';
  const userId = 'b7bee007-2a9f-4fb8-8020-10b707e2f4f4';
  const planId = 'basic';
  const requestId = `${userId}_${planId}_${Date.now()}`;
  
  console.log('📋 测试参数:');
  console.log(`   API Key: ${apiKey ? apiKey.substring(0, 20) + '...' : '未设置'}`);
  console.log(`   Product ID: ${productId}`);
  console.log(`   Request ID: ${requestId}`);
  console.log(`   User ID: ${userId}`);
  console.log('');
  
  if (!apiKey) {
    console.error('❌ CREEM_SECRET_KEY 环境变量未设置');
    return;
  }
  
  const checkoutData = {
    product_id: productId,
    request_id: requestId,
    success_url: 'https://be46-184-169-178-219.ngrok-free.app/api/payment/success?plan=basic',
    cancel_url: 'https://be46-184-169-178-219.ngrok-free.app/pricing?purchase=canceled',
    customer: {
      email: 'hongwane322@gmail.com'
    },
    metadata: {
      userId: userId,
      planId: planId,
      userEmail: 'hongwane322@gmail.com'
    }
  };
  
  console.log('📤 发送请求到Creem API...');
  console.log('请求数据:', JSON.stringify(checkoutData, null, 2));
  console.log('');
  
  try {
    const response = await fetch('https://api.creem.io/v1/checkouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify(checkoutData)
    });
    
    console.log(`📊 响应状态: ${response.status} ${response.statusText}`);
    
    const responseText = await response.text();
    console.log('📝 响应内容:');
    
    try {
      const responseData = JSON.parse(responseText);
      console.log(JSON.stringify(responseData, null, 2));
      
      if (response.ok && responseData.checkout_url) {
        console.log('');
        console.log('✅ Checkout Session 创建成功！');
        console.log(`🔗 Checkout URL: ${responseData.checkout_url}`);
        console.log(`📋 Session ID: ${responseData.id}`);
        
        // 验证request_id是否包含在响应中
        if (responseData.request_id === requestId) {
          console.log('✅ Request ID 正确传递');
        } else {
          console.log(`⚠️  Request ID 不匹配: 期望 ${requestId}, 收到 ${responseData.request_id}`);
        }
        
        console.log('');
        console.log('🎯 下一步测试:');
        console.log('1. 在浏览器中访问 checkout_url');
        console.log('2. 完成测试支付');
        console.log('3. 验证webhook是否收到正确的request_id');
        
      } else {
        console.log('❌ Checkout Session 创建失败');
      }
      
    } catch (parseError) {
      console.log('原始响应文本:', responseText);
    }
    
  } catch (error) {
    console.error('❌ 请求失败:', error.message);
  }
}

// 运行测试
testCheckoutSession();
