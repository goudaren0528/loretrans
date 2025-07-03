#!/usr/bin/env node

/**
 * 开发环境CREEM集成测试
 * 用于在开发环境中测试完整的支付流程
 */

const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

async function testDevEnvironment() {
  console.log('🚀 开发环境CREEM集成测试\n');
  
  // 检查环境配置
  await checkEnvironmentConfig();
  
  // 测试网络连接
  await testNetworkConnectivity();
  
  // 测试API密钥
  await testAPIKey();
  
  // 测试产品ID
  await testProductIds();
  
  // 测试完整的checkout流程
  await testCheckoutFlow();
  
  // 生成开发建议
  generateDevelopmentRecommendations();
}

async function checkEnvironmentConfig() {
  console.log('📋 检查环境配置');
  
  const requiredEnvVars = [
    'CREEM_API_KEY',
    'CREEM_WEBHOOK_SECRET',
    'NEXT_PUBLIC_APP_URL'
  ];
  
  const config = {};
  let allConfigured = true;
  
  requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    config[varName] = value ? '✅ 已配置' : '❌ 未配置';
    if (!value) allConfigured = false;
  });
  
  console.table(config);
  
  if (allConfigured) {
    console.log('✅ 所有必需的环境变量都已配置\n');
  } else {
    console.log('⚠️  部分环境变量未配置，可能影响测试结果\n');
  }
  
  return allConfigured;
}

async function testNetworkConnectivity() {
  console.log('🌐 测试网络连接');
  
  try {
    const response = await fetch('https://api.creem.io/v1/checkouts', {
      method: 'GET',
      timeout: 5000
    });
    
    console.log(`   状态: ${response.status} ${response.statusText}`);
    
    if (response.status === 403 || response.status === 405) {
      console.log('   ✅ 网络连接正常 (403/405是预期的，因为没有提供正确的请求)');
    } else {
      console.log('   ⚠️  意外的响应状态');
    }
  } catch (error) {
    console.log('   ❌ 网络连接失败:', error.message);
    if (error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
      console.log('   💡 建议: 检查DNS设置或网络连接');
    }
  }
  
  console.log('');
}

async function testAPIKey() {
  console.log('🔑 测试API密钥');
  
  const apiKey = process.env.CREEM_API_KEY;
  
  if (!apiKey) {
    console.log('   ❌ API密钥未配置');
    return false;
  }
  
  console.log(`   密钥格式: ${apiKey.substring(0, 15)}...`);
  console.log(`   密钥长度: ${apiKey.length} 字符`);
  console.log(`   密钥类型: ${apiKey.startsWith('creem_test_') ? '测试密钥' : '生产密钥'}`);
  
  // 测试API密钥权限
  try {
    const response = await fetch('https://api.creem.io/v1/checkouts', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        product_id: 'test_product_id'
      }),
      timeout: 10000
    });
    
    const responseText = await response.text();
    console.log(`   API响应: ${response.status} ${response.statusText}`);
    
    if (response.status === 403) {
      console.log('   ❌ API密钥权限不足');
      console.log('   💡 建议: 检查CREEM控制台中的API密钥权限设置');
    } else if (response.status === 404) {
      console.log('   ✅ API密钥有效 (404是因为测试产品ID不存在)');
    } else if (response.status === 400) {
      console.log('   ✅ API密钥有效 (400是因为请求参数问题)');
    } else {
      console.log('   📋 响应详情:', responseText);
    }
    
  } catch (error) {
    console.log('   ❌ API密钥测试失败:', error.message);
  }
  
  console.log('');
  return true;
}

async function testProductIds() {
  console.log('📦 测试产品ID');
  
  const apiKey = process.env.CREEM_API_KEY;
  if (!apiKey) {
    console.log('   ⏭️  跳过 (API密钥未配置)');
    return;
  }
  
  const testProductIds = [
    'prod_6tW66i0oZM7w1qXReHJrwg', // 文档示例
    'prod_7ghOSJ2klCjPTjnURPbMoh'  // 配置中的ID
  ];
  
  for (const productId of testProductIds) {
    console.log(`   测试产品ID: ${productId}`);
    
    try {
      const response = await fetch('https://api.creem.io/v1/checkouts', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          product_id: productId
        }),
        timeout: 10000
      });
      
      console.log(`     状态: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        console.log('     ✅ 产品ID有效且可访问');
        const data = await response.json();
        if (data.checkout_url) {
          console.log(`     🔗 生成的checkout URL: ${data.checkout_url.substring(0, 50)}...`);
        }
      } else if (response.status === 404) {
        console.log('     ❌ 产品ID不存在');
      } else if (response.status === 403) {
        console.log('     ❌ 无权访问此产品');
      } else {
        const errorText = await response.text();
        console.log(`     ⚠️  其他错误: ${errorText}`);
      }
      
    } catch (error) {
      console.log(`     ❌ 测试失败: ${error.message}`);
    }
  }
  
  console.log('');
}

async function testCheckoutFlow() {
  console.log('🛒 测试完整的checkout流程');
  
  const apiKey = process.env.CREEM_API_KEY;
  if (!apiKey) {
    console.log('   ⏭️  跳过 (API密钥未配置)');
    return;
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  const checkoutPayload = {
    product_id: 'prod_6tW66i0oZM7w1qXReHJrwg', // 使用文档示例
    request_id: `dev_test_${Date.now()}`,
    success_url: `${baseUrl}/payment-success`,
    cancel_url: `${baseUrl}/pricing?purchase=canceled`,
    customer: {
      email: 'developer@test.com'
    },
    metadata: {
      environment: 'development',
      test_type: 'integration_test',
      timestamp: new Date().toISOString()
    }
  };
  
  console.log('   📤 发送checkout请求...');
  console.log('   📋 Payload:', JSON.stringify(checkoutPayload, null, 4));
  
  try {
    const response = await fetch('https://api.creem.io/v1/checkouts', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(checkoutPayload),
      timeout: 15000
    });
    
    const responseText = await response.text();
    console.log(`   📊 响应状态: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('   ✅ Checkout流程测试成功!');
      console.log('   📋 响应数据:');
      console.log(JSON.stringify(data, null, 4));
      
      if (data.checkout_url) {
        console.log(`   🔗 支付页面URL: ${data.checkout_url}`);
        console.log('   💡 您可以在浏览器中打开此URL进行测试');
      }
    } else {
      console.log('   ❌ Checkout流程测试失败');
      console.log('   📋 错误响应:', responseText);
      
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.trace_id) {
          console.log(`   🔍 错误追踪ID: ${errorData.trace_id}`);
        }
      } catch (parseError) {
        // 忽略解析错误
      }
    }
    
  } catch (error) {
    console.log('   ❌ 请求失败:', error.message);
  }
  
  console.log('');
}

function generateDevelopmentRecommendations() {
  console.log('💡 开发环境建议');
  console.log('');
  
  console.log('🎯 如果测试成功:');
  console.log('   1. 启动开发服务器: npm run dev');
  console.log('   2. 访问定价页面测试支付流程');
  console.log('   3. 检查webhook接收情况');
  console.log('   4. 验证支付成功后的积分充值');
  console.log('');
  
  console.log('🔧 如果测试失败:');
  console.log('   1. 检查CREEM控制台中的API密钥权限');
  console.log('   2. 创建测试产品并获取正确的产品ID');
  console.log('   3. 更新配置文件中的产品ID');
  console.log('   4. 联系CREEM技术支持获取帮助');
  console.log('');
  
  console.log('🚀 下一步开发:');
  console.log('   1. 集成到前端支付按钮');
  console.log('   2. 实现支付成功页面');
  console.log('   3. 测试webhook处理');
  console.log('   4. 添加错误处理和用户提示');
  console.log('');
  
  console.log('📞 获取帮助:');
  console.log('   - CREEM控制台: https://creem.io/dashboard');
  console.log('   - 技术支持: support@creem.io');
  console.log('   - Discord社区: https://discord.gg/q3GKZs92Av');
}

// 运行开发环境测试
testDevEnvironment().then(() => {
  console.log('='.repeat(60));
  console.log('🎯 开发环境测试完成');
  console.log('='.repeat(60));
}).catch(error => {
  console.error('❌ 测试过程中发生错误:', error);
});
