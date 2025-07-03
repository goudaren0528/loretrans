#!/usr/bin/env node

/**
 * CREEM API 详细调试脚本
 * 系统性诊断API密钥和权限问题
 */

const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

async function debugCreemAPI() {
  console.log('🔍 CREEM API 详细调试\n');
  
  const apiKey = process.env.CREEM_API_KEY;
  const webhookSecret = process.env.CREEM_WEBHOOK_SECRET;
  
  console.log('📋 环境配置检查:');
  console.log(`   CREEM_API_KEY: ${apiKey ? '✅ 已设置' : '❌ 未设置'}`);
  console.log(`   密钥长度: ${apiKey ? apiKey.length : 0} 字符`);
  console.log(`   密钥前缀: ${apiKey ? apiKey.substring(0, 12) + '...' : 'N/A'}`);
  console.log(`   WEBHOOK_SECRET: ${webhookSecret ? '✅ 已设置' : '❌ 未设置'}`);
  console.log('');
  
  if (!apiKey) {
    console.log('❌ 无法继续：缺少API密钥');
    return;
  }
  
  // 测试1: 基础连接测试
  await testBasicConnection(apiKey);
  
  // 测试2: 获取账户信息
  await testAccountInfo(apiKey);
  
  // 测试3: 获取产品列表
  await testProductsList(apiKey);
  
  // 测试4: 测试特定产品
  await testSpecificProduct(apiKey, 'prod_7ghOSJ2klCjPTjnURPbMoh');
  
  // 测试5: 尝试创建checkout
  await testCheckoutCreation(apiKey);
  
  // 测试6: 测试不同的API端点
  await testDifferentEndpoints(apiKey);
}

async function testBasicConnection(apiKey) {
  console.log('🌐 测试1: 基础连接测试');
  
  try {
    const response = await fetch('https://api.creem.io/v1/ping', {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'User-Agent': 'Translation-App/1.0'
      }
    });
    
    console.log(`   状态: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.text();
      console.log('   ✅ 基础连接正常');
      console.log(`   响应: ${data}`);
    } else {
      console.log('   ❌ 基础连接失败');
      const errorText = await response.text();
      console.log(`   错误: ${errorText}`);
    }
  } catch (error) {
    console.log('   ❌ 网络错误:', error.message);
  }
  console.log('');
}

async function testAccountInfo(apiKey) {
  console.log('👤 测试2: 获取账户信息');
  
  const endpoints = [
    '/v1/account',
    '/v1/me',
    '/v1/user',
    '/v1/profile'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`https://api.creem.io${endpoint}`, {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`   ${endpoint}: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ 成功获取账户信息`);
        console.log(`   数据: ${JSON.stringify(data, null, 4)}`);
        break;
      } else if (response.status !== 404) {
        const errorText = await response.text();
        console.log(`   错误详情: ${errorText}`);
      }
    } catch (error) {
      console.log(`   网络错误: ${error.message}`);
    }
  }
  console.log('');
}

async function testProductsList(apiKey) {
  console.log('📦 测试3: 获取产品列表');
  
  const endpoints = [
    '/v1/products',
    '/v1/products/list',
    '/v1/catalog/products'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`https://api.creem.io${endpoint}`, {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`   ${endpoint}: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ 成功获取产品列表`);
        
        if (data.products && Array.isArray(data.products)) {
          console.log(`   📊 找到 ${data.products.length} 个产品:`);
          data.products.forEach((product, index) => {
            console.log(`     ${index + 1}. ${product.name || 'Unnamed'} (${product.id})`);
            console.log(`        价格: $${(product.price || 0) / 100}`);
            console.log(`        状态: ${product.active ? '✅ 活跃' : '❌ 非活跃'}`);
          });
        } else if (data.data && Array.isArray(data.data)) {
          console.log(`   📊 找到 ${data.data.length} 个产品:`);
          data.data.forEach((product, index) => {
            console.log(`     ${index + 1}. ${product.name || 'Unnamed'} (${product.id})`);
          });
        } else {
          console.log(`   📊 响应数据结构: ${JSON.stringify(data, null, 4)}`);
        }
        break;
      } else if (response.status !== 404) {
        const errorText = await response.text();
        console.log(`   错误详情: ${errorText}`);
      }
    } catch (error) {
      console.log(`   网络错误: ${error.message}`);
    }
  }
  console.log('');
}

async function testSpecificProduct(apiKey, productId) {
  console.log(`🎯 测试4: 获取特定产品 (${productId})`);
  
  try {
    const response = await fetch(`https://api.creem.io/v1/products/${productId}`, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   状态: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ 产品存在且可访问');
      console.log(`   产品详情: ${JSON.stringify(data, null, 4)}`);
    } else {
      const errorText = await response.text();
      console.log('   ❌ 产品不存在或无权访问');
      console.log(`   错误详情: ${errorText}`);
      
      if (response.status === 404) {
        console.log('   💡 建议: 产品ID可能不正确，请检查CREEM控制台');
      } else if (response.status === 403) {
        console.log('   💡 建议: API密钥可能无权访问此产品');
      }
    }
  } catch (error) {
    console.log('   ❌ 网络错误:', error.message);
  }
  console.log('');
}

async function testCheckoutCreation(apiKey) {
  console.log('🛒 测试5: 尝试创建checkout');
  
  // 使用最小化的payload
  const minimalPayload = {
    product_id: 'prod_7ghOSJ2klCjPTjnURPbMoh'
  };
  
  console.log('   📤 最小化payload测试:');
  console.log(`   ${JSON.stringify(minimalPayload, null, 4)}`);
  
  try {
    const response = await fetch('https://api.creem.io/v1/checkouts', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(minimalPayload)
    });
    
    console.log(`   状态: ${response.status} ${response.statusText}`);
    
    const responseText = await response.text();
    
    if (response.ok) {
      console.log('   ✅ Checkout创建成功！');
      const data = JSON.parse(responseText);
      console.log(`   响应: ${JSON.stringify(data, null, 4)}`);
    } else {
      console.log('   ❌ Checkout创建失败');
      console.log(`   错误响应: ${responseText}`);
      
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.message) {
          console.log(`   错误消息: ${errorData.message}`);
        }
        if (errorData.details) {
          console.log(`   错误详情: ${JSON.stringify(errorData.details, null, 4)}`);
        }
      } catch (parseError) {
        console.log('   (无法解析错误响应)');
      }
    }
  } catch (error) {
    console.log('   ❌ 网络错误:', error.message);
  }
  console.log('');
}

async function testDifferentEndpoints(apiKey) {
  console.log('🔄 测试6: 测试不同的API端点');
  
  const endpoints = [
    { path: '/v1/health', method: 'GET', desc: '健康检查' },
    { path: '/v1/status', method: 'GET', desc: '状态检查' },
    { path: '/v1/api/health', method: 'GET', desc: 'API健康检查' },
    { path: '/health', method: 'GET', desc: '根健康检查' },
    { path: '/v1/orders', method: 'GET', desc: '订单列表' },
    { path: '/v1/customers', method: 'GET', desc: '客户列表' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`https://api.creem.io${endpoint.path}`, {
        method: endpoint.method,
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`   ${endpoint.desc} (${endpoint.path}): ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        console.log(`     ✅ 端点可访问`);
      } else if (response.status === 403) {
        console.log(`     ❌ 权限不足`);
      } else if (response.status === 404) {
        console.log(`     ❌ 端点不存在`);
      }
    } catch (error) {
      console.log(`   ${endpoint.desc}: 网络错误`);
    }
  }
  console.log('');
}

async function generateRecommendations() {
  console.log('💡 调试建议:');
  console.log('');
  
  console.log('1. 如果所有API调用都返回403:');
  console.log('   - 检查API密钥是否正确');
  console.log('   - 确认API密钥在CREEM控制台中是否激活');
  console.log('   - 验证API密钥权限设置');
  console.log('');
  
  console.log('2. 如果产品不存在:');
  console.log('   - 登录CREEM控制台创建产品');
  console.log('   - 更新配置文件中的产品ID');
  console.log('   - 确保产品状态为"活跃"');
  console.log('');
  
  console.log('3. 如果网络错误:');
  console.log('   - 检查网络连接');
  console.log('   - 确认防火墙设置');
  console.log('   - 尝试使用VPN');
  console.log('');
  
  console.log('4. 下一步行动:');
  console.log('   - 联系CREEM技术支持');
  console.log('   - 提供调试日志');
  console.log('   - 请求API密钥权限检查');
}

// 运行调试
async function runDebug() {
  await debugCreemAPI();
  await generateRecommendations();
  
  console.log('='.repeat(60));
  console.log('🎯 调试完成');
  console.log('请将以上日志发送给CREEM技术支持以获得帮助');
  console.log('='.repeat(60));
}

runDebug();
