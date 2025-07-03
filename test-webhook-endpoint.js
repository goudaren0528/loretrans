#!/usr/bin/env node

/**
 * 测试CREEM Webhook端点
 * 
 * 这个脚本将测试我们的webhook端点是否正常工作
 */

const NGROK_URL = 'https://fdb2-38-98-191-33.ngrok-free.app';
const WEBHOOK_URL = `${NGROK_URL}/api/webhook/creem`;

console.log('🔗 测试CREEM Webhook端点...\n');

// 1. 测试GET请求 (验证端点活跃)
async function testWebhookGet() {
  console.log('📋 1. 测试GET请求 (端点验证):');
  
  try {
    const response = await fetch(WEBHOOK_URL);
    const data = await response.json();
    
    console.log(`   状态码: ${response.status}`);
    console.log(`   响应: ${JSON.stringify(data, null, 2)}`);
    
    if (response.ok && data.status) {
      console.log('   ✅ Webhook端点正常运行');
      return true;
    } else {
      console.log('   ❌ Webhook端点响应异常');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Webhook端点访问失败: ${error.message}`);
    return false;
  }
}

// 2. 测试POST请求 (模拟CREEM webhook)
async function testWebhookPost() {
  console.log('\n📋 2. 测试POST请求 (模拟CREEM webhook):');
  
  const testPayloads = [
    {
      name: '支付成功',
      data: {
        type: 'payment.completed',
        id: 'pay_test_123456',
        request_id: 'test_user_basic_1234567890',
        amount: 5.00,
        currency: 'USD',
        status: 'completed',
        customer: {
          email: 'test@example.com',
          id: 'cust_test_123'
        },
        metadata: {
          userId: 'test_user',
          planId: 'basic',
          credits: '5000',
          planName: 'Basic Pack'
        },
        created_at: new Date().toISOString()
      }
    },
    {
      name: '支付失败',
      data: {
        type: 'payment.failed',
        id: 'pay_test_789012',
        request_id: 'test_user_basic_1234567891',
        amount: 5.00,
        currency: 'USD',
        status: 'failed',
        error_message: 'Card declined',
        customer: {
          email: 'test@example.com',
          id: 'cust_test_123'
        },
        created_at: new Date().toISOString()
      }
    },
    {
      name: '支付取消',
      data: {
        type: 'payment.cancelled',
        id: 'pay_test_345678',
        request_id: 'test_user_basic_1234567892',
        amount: 5.00,
        currency: 'USD',
        status: 'cancelled',
        customer: {
          email: 'test@example.com',
          id: 'cust_test_123'
        },
        created_at: new Date().toISOString()
      }
    }
  ];
  
  const results = [];
  
  for (const payload of testPayloads) {
    console.log(`\n   测试: ${payload.name}`);
    
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'CREEM-Webhook/1.0',
          'X-CREEM-Event': payload.data.type
        },
        body: JSON.stringify(payload.data)
      });
      
      const responseData = await response.json();
      
      console.log(`   状态码: ${response.status}`);
      console.log(`   响应: ${JSON.stringify(responseData, null, 2)}`);
      
      if (response.ok && responseData.received) {
        console.log(`   ✅ ${payload.name} webhook处理成功`);
        results.push({ name: payload.name, success: true });
      } else {
        console.log(`   ❌ ${payload.name} webhook处理失败`);
        results.push({ name: payload.name, success: false });
      }
      
    } catch (error) {
      console.log(`   ❌ ${payload.name} 请求失败: ${error.message}`);
      results.push({ name: payload.name, success: false });
    }
  }
  
  return results;
}

// 3. 生成CREEM控制台配置信息
function generateCreemConfig() {
  console.log('\n📋 3. CREEM控制台配置信息:');
  console.log('='.repeat(60));
  
  console.log('\n🔧 需要在CREEM控制台配置的信息:');
  console.log(`   Webhook URL: ${WEBHOOK_URL}`);
  console.log('   HTTP Method: POST');
  console.log('   Content-Type: application/json');
  
  console.log('\n📡 推荐启用的事件类型:');
  console.log('   ✅ payment.completed - 支付成功');
  console.log('   ✅ payment.failed - 支付失败');
  console.log('   ✅ payment.cancelled - 支付取消');
  console.log('   ✅ checkout.completed - 结账完成');
  console.log('   ✅ checkout.failed - 结账失败');
  
  console.log('\n🔐 Webhook签名验证 (可选):');
  console.log('   Secret: whsec_65jSbiU6yfhC9NDVdbAIpf');
  console.log('   (已在环境变量 CREEM_WEBHOOK_SECRET 中配置)');
}

// 4. 监控指南
function generateMonitoringGuide() {
  console.log('\n📋 4. 监控和调试指南:');
  console.log('='.repeat(60));
  
  console.log('\n🔍 实时监控方法:');
  console.log(`   1. ngrok控制台: http://localhost:4040`);
  console.log('   2. 应用日志: 查看控制台输出');
  console.log('   3. 浏览器开发者工具: 网络请求监控');
  
  console.log('\n🧪 测试支付流程:');
  console.log(`   1. 访问测试页面: ${NGROK_URL}/en/test-payment`);
  console.log('   2. 点击支付测试按钮');
  console.log('   3. 完成支付流程');
  console.log('   4. 检查webhook是否被调用');
  
  console.log('\n⚠️  重要提醒:');
  console.log('   - 确保ngrok保持运行状态');
  console.log('   - ngrok地址重启后会改变，需要更新CREEM配置');
  console.log('   - webhook URL必须使用HTTPS协议');
}

// 运行所有测试
async function runAllTests() {
  console.log('开始webhook端点测试...\n');
  
  const getResult = await testWebhookGet();
  const postResults = await testWebhookPost();
  
  generateCreemConfig();
  generateMonitoringGuide();
  
  console.log('\n📊 测试结果总结:');
  console.log('='.repeat(60));
  
  console.log(`✅ GET请求测试: ${getResult ? '通过' : '失败'}`);
  
  const postSuccess = postResults.filter(r => r.success).length;
  const postTotal = postResults.length;
  console.log(`✅ POST请求测试: ${postSuccess}/${postTotal} 通过`);
  
  postResults.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`   ${status} ${result.name}`);
  });
  
  console.log('='.repeat(60));
  
  if (getResult && postSuccess === postTotal) {
    console.log('\n🎉 所有测试通过！Webhook端点配置正确。');
    console.log('\n🚀 下一步: 在CREEM控制台配置webhook URL');
    console.log(`   URL: ${WEBHOOK_URL}`);
  } else {
    console.log('\n⚠️  部分测试失败，请检查配置。');
  }
}

runAllTests().catch(console.error);
