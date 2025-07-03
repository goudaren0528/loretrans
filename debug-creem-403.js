#!/usr/bin/env node

/**
 * CREEM API 403错误详细诊断工具
 * 
 * 既然CREEM控制台没有权限设置，403错误可能由以下原因造成：
 * 1. API密钥格式错误
 * 2. 请求头格式错误
 * 3. 产品ID不存在或格式错误
 * 4. 请求体格式不符合API规范
 * 5. API端点URL错误
 * 6. 测试环境vs生产环境配置问题
 */

require('dotenv').config({ path: '.env.local' });

const CREEM_API_KEY = process.env.CREEM_API_KEY;
const PRODUCT_ID = 'prod_7ghOSJ2klCjPTjnURPbMoh';

console.log('🔍 CREEM API 403错误诊断开始...\n');

// 1. 检查基础配置
console.log('📋 1. 基础配置检查:');
console.log(`   API Key: ${CREEM_API_KEY ? `${CREEM_API_KEY.substring(0, 15)}...` : '❌ 未配置'}`);
console.log(`   Product ID: ${PRODUCT_ID}`);
console.log(`   API Key 格式: ${CREEM_API_KEY?.startsWith('creem_') ? '✅ 正确' : '❌ 可能错误'}`);
console.log();

if (!CREEM_API_KEY) {
  console.error('❌ CREEM_API_KEY 未配置，请检查 .env.local 文件');
  process.exit(1);
}

// 2. 测试不同的API调用方式
async function testApiCall(testName, options) {
  console.log(`🧪 ${testName}:`);
  
  try {
    const response = await fetch('https://api.creem.io/v1/checkouts', options);
    const responseText = await response.text();
    
    console.log(`   状态码: ${response.status}`);
    console.log(`   状态文本: ${response.statusText}`);
    console.log(`   响应头: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}`);
    console.log(`   响应体: ${responseText}`);
    
    if (response.status === 403) {
      console.log('   ❌ 403 Forbidden - 继续诊断...');
    } else if (response.ok) {
      console.log('   ✅ 请求成功！');
      return true;
    } else {
      console.log(`   ⚠️  其他错误: ${response.status}`);
    }
    
  } catch (error) {
    console.log(`   ❌ 网络错误: ${error.message}`);
  }
  
  console.log();
  return false;
}

async function runDiagnostics() {
  // 测试1: 标准请求格式
  const standardPayload = {
    product_id: PRODUCT_ID,
    request_id: `test_${Date.now()}`,
    success_url: 'https://example.com/success',
    cancel_url: 'https://example.com/cancel',
    customer: {
      email: 'test@example.com'
    }
  };

  await testApiCall('标准API调用 (x-api-key)', {
    method: 'POST',
    headers: {
      'x-api-key': CREEM_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(standardPayload)
  });

  // 测试2: 尝试Authorization头
  await testApiCall('使用Authorization头', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CREEM_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(standardPayload)
  });

  // 测试3: 尝试不同的API Key头格式
  await testApiCall('使用API-Key头', {
    method: 'POST',
    headers: {
      'API-Key': CREEM_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(standardPayload)
  });

  // 测试4: 最小化payload
  const minimalPayload = {
    product_id: PRODUCT_ID
  };

  await testApiCall('最小化请求体', {
    method: 'POST',
    headers: {
      'x-api-key': CREEM_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(minimalPayload)
  });

  // 测试5: 检查产品是否存在 (GET请求)
  console.log('🔍 5. 检查产品是否存在:');
  try {
    const productResponse = await fetch(`https://api.creem.io/v1/products/${PRODUCT_ID}`, {
      method: 'GET',
      headers: {
        'x-api-key': CREEM_API_KEY
      }
    });
    
    console.log(`   产品查询状态: ${productResponse.status}`);
    const productText = await productResponse.text();
    console.log(`   产品查询响应: ${productText}`);
    
    if (productResponse.status === 404) {
      console.log('   ❌ 产品不存在！这可能是403错误的原因');
    } else if (productResponse.ok) {
      console.log('   ✅ 产品存在');
    }
  } catch (error) {
    console.log(`   ❌ 产品查询失败: ${error.message}`);
  }
  console.log();

  // 测试6: 检查API密钥有效性 (尝试获取产品列表)
  console.log('🔑 6. 检查API密钥有效性:');
  try {
    const listResponse = await fetch('https://api.creem.io/v1/products', {
      method: 'GET',
      headers: {
        'x-api-key': CREEM_API_KEY
      }
    });
    
    console.log(`   产品列表状态: ${listResponse.status}`);
    const listText = await listResponse.text();
    console.log(`   产品列表响应: ${listText.substring(0, 500)}...`);
    
    if (listResponse.status === 403) {
      console.log('   ❌ API密钥无效或权限不足');
    } else if (listResponse.ok) {
      console.log('   ✅ API密钥有效');
    }
  } catch (error) {
    console.log(`   ❌ API密钥验证失败: ${error.message}`);
  }
  console.log();

  // 测试7: 尝试不同的API端点
  console.log('🌐 7. 测试不同的API端点:');
  
  const endpoints = [
    'https://api.creem.io/v1/checkouts',
    'https://api.creem.io/checkouts',
    'https://creem.io/api/v1/checkouts'
  ];

  for (const endpoint of endpoints) {
    console.log(`   测试端点: ${endpoint}`);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'x-api-key': CREEM_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(standardPayload)
      });
      
      console.log(`   状态: ${response.status} ${response.statusText}`);
      
      if (response.status !== 403) {
        const text = await response.text();
        console.log(`   响应: ${text.substring(0, 200)}...`);
      }
    } catch (error) {
      console.log(`   错误: ${error.message}`);
    }
  }
  console.log();

  // 总结和建议
  console.log('📝 诊断总结和建议:');
  console.log('   1. 如果所有测试都返回403，可能是API密钥问题');
  console.log('   2. 如果产品查询失败，需要在CREEM控制台创建产品');
  console.log('   3. 如果某个端点工作，使用该端点');
  console.log('   4. 检查CREEM文档是否有API格式更新');
  console.log('   5. 联系CREEM支持获取正确的API使用方法');
}

runDiagnostics().catch(console.error);
