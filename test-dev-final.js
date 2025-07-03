#!/usr/bin/env node

/**
 * 最终开发环境测试
 * 使用网络修复功能测试CREEM集成
 */

const { initializeCreemNetworkFix, enhancedFetch, testCreemConnection } = require('./lib/creem-network-fix.js');
require('dotenv').config({ path: '.env.local' });

async function finalDevTest() {
  console.log('🚀 最终开发环境测试 (使用网络修复)\n');
  
  // 初始化网络修复
  initializeCreemNetworkFix();
  
  const apiKey = process.env.CREEM_API_KEY;
  
  if (!apiKey) {
    console.log('❌ CREEM_API_KEY未配置');
    return;
  }
  
  // 1. 测试基础连接
  console.log('🔍 测试1: 基础连接测试');
  const connectionOk = await testCreemConnection(apiKey);
  
  if (!connectionOk) {
    console.log('❌ 基础连接失败，停止测试');
    return;
  }
  
  console.log('');
  
  // 2. 测试产品ID
  await testProductIDs(apiKey);
  
  // 3. 测试完整的checkout流程
  await testFullCheckoutFlow(apiKey);
  
  // 4. 生成开发指南
  generateDevGuide();
}

async function testProductIDs(apiKey) {
  console.log('📦 测试2: 产品ID验证');
  
  const productIds = [
    'prod_6tW66i0oZM7w1qXReHJrwg', // 文档示例
    'prod_7ghOSJ2klCjPTjnURPbMoh'  // 配置中的
  ];
  
  for (const productId of productIds) {
    console.log(`   测试产品: ${productId}`);
    
    try {
      const response = await enhancedFetch('https://api.creem.io/v1/checkouts', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          product_id: productId
        })
      });
      
      const responseText = await response.text();
      console.log(`     状态: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = JSON.parse(responseText);
        console.log('     ✅ 产品ID有效!');
        console.log(`     🔗 Checkout URL: ${data.checkout_url}`);
        
        // 如果成功，这就是我们要使用的产品ID
        console.log(`     💡 建议: 在配置中使用此产品ID: ${productId}`);
        return productId; // 返回有效的产品ID
      } else {
        console.log(`     ❌ 失败: ${responseText}`);
      }
      
    } catch (error) {
      console.log(`     ❌ 错误: ${error.message}`);
    }
  }
  
  console.log('');
  return null;
}

async function testFullCheckoutFlow(apiKey) {
  console.log('🛒 测试3: 完整checkout流程');
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // 使用文档示例产品ID进行测试
  const testPayload = {
    product_id: 'prod_6tW66i0oZM7w1qXReHJrwg',
    request_id: `dev_final_test_${Date.now()}`,
    success_url: `${baseUrl}/payment-success`,
    cancel_url: `${baseUrl}/pricing?purchase=canceled`,
    customer: {
      email: 'developer@test.com'
    },
    metadata: {
      environment: 'development',
      test_type: 'final_integration_test',
      timestamp: new Date().toISOString(),
      user_id: 'test_user_123'
    }
  };
  
  console.log('   📤 发送完整checkout请求...');
  console.log('   📋 请求payload:');
  console.log(JSON.stringify(testPayload, null, 4));
  
  try {
    const response = await enhancedFetch('https://api.creem.io/v1/checkouts', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });
    
    const responseText = await response.text();
    console.log(`   📊 响应状态: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('   ✅ 完整checkout流程测试成功!');
      console.log('   📋 响应数据:');
      console.log(JSON.stringify(data, null, 4));
      
      if (data.checkout_url) {
        console.log(`   🔗 支付页面URL: ${data.checkout_url}`);
        console.log('   💡 您可以在浏览器中打开此URL进行支付测试');
        console.log('   🎯 这表明CREEM集成已经完全正常工作!');
      }
      
      return true;
    } else {
      console.log('   ❌ 完整checkout流程测试失败');
      console.log('   📋 错误响应:', responseText);
      
      // 分析错误类型
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.status === 403) {
          console.log('   💡 分析: API密钥权限不足，需要在CREEM控制台中检查权限');
        } else if (errorData.status === 404) {
          console.log('   💡 分析: 产品ID不存在，需要在CREEM控制台中创建产品');
        }
      } catch (parseError) {
        // 忽略解析错误
      }
      
      return false;
    }
    
  } catch (error) {
    console.log('   ❌ 请求失败:', error.message);
    return false;
  }
}

function generateDevGuide() {
  console.log('\n🎯 开发指南');
  console.log('');
  
  console.log('✅ 网络问题已解决:');
  console.log('   - DNS解析问题已通过自定义解析器修复');
  console.log('   - 网络连接现在应该稳定工作');
  console.log('   - 代码已集成网络修复功能');
  console.log('');
  
  console.log('🚀 下一步开发步骤:');
  console.log('   1. 启动开发服务器: npm run dev 或 yarn dev');
  console.log('   2. 访问 http://localhost:3000/pricing');
  console.log('   3. 点击支付按钮测试完整流程');
  console.log('   4. 检查支付成功页面和积分充值');
  console.log('');
  
  console.log('🔧 如果仍有问题:');
  console.log('   1. 检查CREEM控制台中的API密钥权限');
  console.log('   2. 确认产品ID在CREEM控制台中存在');
  console.log('   3. 检查webhook配置');
  console.log('   4. 联系CREEM技术支持');
  console.log('');
  
  console.log('📞 获取帮助:');
  console.log('   - CREEM控制台: https://creem.io/dashboard');
  console.log('   - 技术支持: support@creem.io');
  console.log('   - Discord: https://discord.gg/q3GKZs92Av');
  console.log('');
  
  console.log('🎉 恭喜!');
  console.log('   如果上面的测试成功，您的CREEM支付集成已经准备就绪!');
  console.log('   现在可以在开发环境中进行完整的支付流程测试了。');
}

// 运行最终测试
finalDevTest().then(() => {
  console.log('\n' + '='.repeat(60));
  console.log('🎯 最终开发环境测试完成');
  console.log('='.repeat(60));
}).catch(error => {
  console.error('❌ 测试过程中发生错误:', error);
});
