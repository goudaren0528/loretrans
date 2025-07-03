#!/usr/bin/env node

/**
 * 基于CREEM官方文档的正确API测试
 * 参考: https://docs.creem.io/checkout-flow
 */

const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

async function testCreemOfficialAPI() {
  console.log('🔍 基于CREEM官方文档的API测试\n');
  
  const apiKey = process.env.CREEM_API_KEY;
  
  if (!apiKey) {
    console.log('❌ 错误: 未找到CREEM_API_KEY环境变量');
    return;
  }
  
  console.log(`🔑 使用API密钥: ${apiKey.substring(0, 15)}...`);
  console.log(`📏 密钥长度: ${apiKey.length} 字符`);
  console.log('');
  
  // 测试1: 使用文档中的示例产品ID
  await testWithDocumentationExample(apiKey);
  
  // 测试2: 使用配置中的产品ID
  await testWithConfiguredProductId(apiKey);
  
  // 测试3: 测试完整的checkout参数
  await testFullCheckoutParameters(apiKey);
}

async function testWithDocumentationExample(apiKey) {
  console.log('📚 测试1: 使用文档示例产品ID');
  
  // 使用文档中的示例产品ID
  const documentationProductId = 'prod_6tW66i0oZM7w1qXReHJrwg';
  
  const payload = {
    product_id: documentationProductId
  };
  
  console.log('📤 请求payload:', JSON.stringify(payload, null, 2));
  
  try {
    const response = await fetch('https://api.creem.io/v1/checkouts', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    console.log(`📊 响应状态: ${response.status} ${response.statusText}`);
    
    const responseText = await response.text();
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('✅ 文档示例测试成功!');
      console.log('📋 响应数据:', JSON.stringify(data, null, 2));
      
      if (data.checkout_url) {
        console.log(`🔗 Checkout URL: ${data.checkout_url}`);
      }
    } else {
      console.log('❌ 文档示例测试失败');
      console.log('📋 错误响应:', responseText);
      
      if (response.status === 404) {
        console.log('💡 分析: 文档中的示例产品ID可能不存在于您的账户中');
      }
    }
  } catch (error) {
    console.error('❌ 网络错误:', error.message);
  }
  
  console.log('');
}

async function testWithConfiguredProductId(apiKey) {
  console.log('⚙️  测试2: 使用配置中的产品ID');
  
  // 使用配置中的产品ID
  const configuredProductId = 'prod_7ghOSJ2klCjPTjnURPbMoh';
  
  const payload = {
    product_id: configuredProductId
  };
  
  console.log('📤 请求payload:', JSON.stringify(payload, null, 2));
  
  try {
    const response = await fetch('https://api.creem.io/v1/checkouts', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    console.log(`📊 响应状态: ${response.status} ${response.statusText}`);
    
    const responseText = await response.text();
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('✅ 配置产品ID测试成功!');
      console.log('📋 响应数据:', JSON.stringify(data, null, 2));
      
      if (data.checkout_url) {
        console.log(`🔗 Checkout URL: ${data.checkout_url}`);
      }
    } else {
      console.log('❌ 配置产品ID测试失败');
      console.log('📋 错误响应:', responseText);
      
      if (response.status === 404) {
        console.log('💡 分析: 配置中的产品ID可能不存在于您的账户中');
      }
    }
  } catch (error) {
    console.error('❌ 网络错误:', error.message);
  }
  
  console.log('');
}

async function testFullCheckoutParameters(apiKey) {
  console.log('🎯 测试3: 完整的checkout参数');
  
  // 根据文档，使用完整的参数
  const fullPayload = {
    product_id: 'prod_6tW66i0oZM7w1qXReHJrwg', // 文档示例
    request_id: `test_${Date.now()}`,
    success_url: 'https://example.com/success',
    cancel_url: 'https://example.com/cancel',
    customer: {
      email: 'test@example.com'
    },
    metadata: {
      userId: 'test_user_123',
      planId: 'basic',
      source: 'api_test'
    }
  };
  
  console.log('📤 完整请求payload:', JSON.stringify(fullPayload, null, 2));
  
  try {
    const response = await fetch('https://api.creem.io/v1/checkouts', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(fullPayload)
    });
    
    console.log(`📊 响应状态: ${response.status} ${response.statusText}`);
    
    const responseText = await response.text();
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('✅ 完整参数测试成功!');
      console.log('📋 响应数据:', JSON.stringify(data, null, 2));
      
      if (data.checkout_url) {
        console.log(`🔗 Checkout URL: ${data.checkout_url}`);
        console.log(`🏷️  Request ID: ${data.request_id || fullPayload.request_id}`);
      }
    } else {
      console.log('❌ 完整参数测试失败');
      console.log('📋 错误响应:', responseText);
    }
  } catch (error) {
    console.error('❌ 网络错误:', error.message);
  }
  
  console.log('');
}

async function analyzeResults() {
  console.log('📊 结果分析:');
  console.log('');
  
  console.log('🎯 如果所有测试都失败 (403/404):');
  console.log('   1. API密钥权限不足 - 需要在CREEM控制台中检查权限');
  console.log('   2. 产品ID不存在 - 需要在CREEM控制台中创建产品');
  console.log('   3. 账户状态问题 - 联系CREEM技术支持');
  console.log('');
  
  console.log('✅ 如果任何测试成功:');
  console.log('   1. API密钥工作正常');
  console.log('   2. 可以继续集成开发');
  console.log('   3. 记录成功的产品ID用于配置');
  console.log('');
  
  console.log('🔧 下一步建议:');
  console.log('   1. 登录CREEM控制台: https://creem.io/dashboard');
  console.log('   2. 检查产品页面: https://creem.io/dashboard/products');
  console.log('   3. 创建测试产品并获取正确的产品ID');
  console.log('   4. 更新配置文件中的产品ID');
  console.log('');
  
  console.log('📞 需要帮助:');
  console.log('   - 邮箱: support@creem.io');
  console.log('   - Discord: https://discord.gg/q3GKZs92Av');
  console.log('   - 文档: https://docs.creem.io/checkout-flow');
}

// 运行测试
async function runTests() {
  await testCreemOfficialAPI();
  await analyzeResults();
  
  console.log('='.repeat(60));
  console.log('🎯 测试完成');
  console.log('基于CREEM官方文档的API调用测试已完成');
  console.log('='.repeat(60));
}

runTests();
