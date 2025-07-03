#!/usr/bin/env node

/**
 * 测试不同的Creem API认证方式
 */

const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

async function testCreemAuth() {
  console.log('🔐 测试Creem API认证方式\n');
  
  const apiKey = process.env.CREEM_SECRET_KEY;
  const productId = 'prod_7ghOSJ2klCjPTjnURPbMoh';
  
  console.log(`API Key: ${apiKey}`);
  console.log(`Product ID: ${productId}\n`);
  
  const testData = {
    product_id: productId,
    request_id: 'test_' + Date.now()
  };
  
  // 测试不同的认证头
  const authMethods = [
    { name: 'x-api-key', headers: { 'x-api-key': apiKey } },
    { name: 'Authorization Bearer', headers: { 'Authorization': `Bearer ${apiKey}` } },
    { name: 'Authorization', headers: { 'Authorization': apiKey } },
    { name: 'api-key', headers: { 'api-key': apiKey } }
  ];
  
  for (const method of authMethods) {
    console.log(`🧪 测试认证方式: ${method.name}`);
    
    try {
      const response = await fetch('https://api.creem.io/v1/checkouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...method.headers
        },
        body: JSON.stringify(testData)
      });
      
      console.log(`   状态: ${response.status} ${response.statusText}`);
      
      const responseText = await response.text();
      
      if (response.status === 403) {
        console.log('   ❌ 认证失败 (403 Forbidden)');
      } else if (response.status === 401) {
        console.log('   ❌ 认证失败 (401 Unauthorized)');
      } else if (response.status === 400) {
        console.log('   ⚠️  请求格式问题 (400 Bad Request)');
        console.log('   响应:', responseText.substring(0, 200));
      } else if (response.ok) {
        console.log('   ✅ 认证成功！');
        console.log('   响应:', responseText.substring(0, 200));
      } else {
        console.log(`   ❓ 其他状态: ${response.status}`);
        console.log('   响应:', responseText.substring(0, 200));
      }
      
    } catch (error) {
      console.log(`   ❌ 请求失败: ${error.message}`);
    }
    
    console.log('');
  }
  
  // 测试简单的GET请求（如果有的话）
  console.log('🧪 测试GET请求到根端点...');
  try {
    const response = await fetch('https://api.creem.io/v1/', {
      headers: {
        'x-api-key': apiKey
      }
    });
    
    console.log(`   状态: ${response.status} ${response.statusText}`);
    const responseText = await response.text();
    console.log('   响应:', responseText.substring(0, 200));
    
  } catch (error) {
    console.log(`   ❌ 请求失败: ${error.message}`);
  }
}

// 运行测试
testCreemAuth();
