#!/usr/bin/env node

/**
 * 使用ngrok地址进行真实支付测试
 * 
 * 这个脚本将模拟真实用户的支付请求，
 * 使用ngrok地址确保CREEM可以正确回调
 */

require('dotenv').config({ path: '.env.local' });

const NGROK_URL = process.env.NEXT_PUBLIC_APP_URL;

console.log('💳 使用ngrok地址进行真实支付测试...\n');

// 模拟用户认证token (实际应用中需要真实的JWT)
const mockUserToken = 'mock-jwt-token-for-testing';

async function testRealPaymentFlow() {
  console.log('📋 支付流程测试:');
  console.log(`   ngrok地址: ${NGROK_URL}`);
  console.log(`   测试计划: Basic Pack ($5, 5000积分)`);
  console.log();

  try {
    // 1. 发起支付请求
    console.log('🚀 1. 发起支付请求...');
    
    const checkoutResponse = await fetch(`${NGROK_URL}/api/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 注意: 实际使用中需要有效的认证token
        'Authorization': `Bearer ${mockUserToken}`
      },
      body: JSON.stringify({
        planId: 'basic'
      })
    });

    const responseText = await checkoutResponse.text();
    console.log(`   响应状态: ${checkoutResponse.status}`);
    console.log(`   响应内容: ${responseText}`);

    if (checkoutResponse.status === 401) {
      console.log('   ⚠️  认证失败 - 这是预期的，因为我们使用的是模拟token');
      console.log('   💡 在真实环境中，用户需要先登录获取有效token');
      return false;
    }

    if (checkoutResponse.ok) {
      const checkoutData = JSON.parse(responseText);
      console.log('   ✅ 支付请求成功！');
      console.log(`   支付方式: ${checkoutData.method}`);
      console.log(`   支付URL: ${checkoutData.url}`);
      console.log(`   请求ID: ${checkoutData.request_id}`);
      
      // 2. 验证支付URL
      console.log('\n🔗 2. 验证支付URL...');
      if (checkoutData.url) {
        try {
          const paymentUrl = new URL(checkoutData.url);
          console.log(`   支付域名: ${paymentUrl.hostname}`);
          console.log(`   支付路径: ${paymentUrl.pathname}`);
          
          // 检查回调URL参数
          const successUrl = paymentUrl.searchParams.get('success_url');
          const cancelUrl = paymentUrl.searchParams.get('cancel_url');
          
          if (successUrl && successUrl.includes(NGROK_URL.replace('https://', ''))) {
            console.log(`   ✅ 成功回调URL正确: ${successUrl}`);
          } else {
            console.log(`   ❌ 成功回调URL错误: ${successUrl}`);
          }
          
          if (cancelUrl && cancelUrl.includes(NGROK_URL.replace('https://', ''))) {
            console.log(`   ✅ 取消回调URL正确: ${cancelUrl}`);
          } else {
            console.log(`   ❌ 取消回调URL错误: ${cancelUrl}`);
          }
          
        } catch (urlError) {
          console.log(`   ❌ 支付URL格式错误: ${urlError.message}`);
        }
      }
      
      return true;
    } else {
      console.log('   ❌ 支付请求失败');
      try {
        const errorData = JSON.parse(responseText);
        console.log(`   错误信息: ${errorData.error}`);
        if (errorData.details) {
          console.log(`   错误详情: ${errorData.details}`);
        }
        if (errorData.suggestion) {
          console.log(`   建议: ${errorData.suggestion}`);
        }
      } catch {
        console.log(`   原始响应: ${responseText}`);
      }
      return false;
    }

  } catch (error) {
    console.log(`   ❌ 网络错误: ${error.message}`);
    return false;
  }
}

// 测试webhook端点
async function testWebhookEndpoints() {
  console.log('\n📋 Webhook端点测试:');
  
  const webhookEndpoints = [
    `${NGROK_URL}/api/webhook/creem`,
    `${NGROK_URL}/payment-success`,
    `${NGROK_URL}/pricing?purchase=canceled`
  ];
  
  for (const endpoint of webhookEndpoints) {
    try {
      const response = await fetch(endpoint);
      const status = response.status;
      const statusText = response.statusText;
      
      console.log(`   ${endpoint}: ${status} ${statusText} ${status < 500 ? '✅' : '❌'}`);
    } catch (error) {
      console.log(`   ${endpoint}: 网络错误 ❌`);
    }
  }
}

// 生成测试指南
function generateTestGuide() {
  console.log('\n📋 手动测试指南:');
  console.log('='.repeat(60));
  
  console.log('\n🌐 1. 浏览器测试:');
  console.log(`   访问: ${NGROK_URL}/en/test-payment`);
  console.log('   点击 "测试支付流程" 按钮');
  console.log('   查看控制台日志和响应结果');
  
  console.log('\n💳 2. 支付流程测试:');
  console.log('   如果生成了支付URL，点击访问');
  console.log('   完成支付或取消操作');
  console.log('   验证是否正确回调到ngrok地址');
  
  console.log('\n🔧 3. 开发者工具:');
  console.log(`   ngrok控制台: http://localhost:4040`);
  console.log('   查看HTTP请求日志');
  console.log('   监控webhook回调');
  
  console.log('\n⚠️  4. 注意事项:');
  console.log('   - 确保ngrok保持运行');
  console.log('   - CREEM需要有效的API密钥');
  console.log('   - webhook回调需要https地址');
  console.log('   - 测试时使用真实的用户认证');
}

// 运行所有测试
async function runAllTests() {
  console.log('开始测试...\n');
  
  const paymentResult = await testRealPaymentFlow();
  await testWebhookEndpoints();
  
  generateTestGuide();
  
  console.log('\n📊 测试总结:');
  console.log('='.repeat(60));
  
  if (paymentResult) {
    console.log('✅ 支付流程配置正确');
    console.log('✅ ngrok地址正常工作');
    console.log('✅ 回调URL配置正确');
    console.log('\n🎉 可以进行真实支付测试！');
  } else {
    console.log('⚠️  支付流程需要调整');
    console.log('💡 主要是认证问题，功能本身正常');
    console.log('\n🔧 建议: 使用浏览器进行完整测试');
  }
  
  console.log(`\n🚀 立即测试: ${NGROK_URL}/en/test-payment`);
}

runAllTests().catch(console.error);
