#!/usr/bin/env node

/**
 * CREEM API密钥权限专项测试
 * 专门测试API密钥的具体权限和访问能力
 */

const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

async function testCreemPermissions() {
  console.log('🔐 CREEM API密钥权限专项测试\n');
  
  const apiKey = process.env.CREEM_API_KEY;
  
  if (!apiKey) {
    console.log('❌ 错误: 未找到CREEM_API_KEY');
    return;
  }
  
  console.log(`🔑 测试API密钥: ${apiKey.substring(0, 15)}...`);
  console.log(`📏 密钥长度: ${apiKey.length} 字符`);
  console.log(`🏷️  密钥类型: ${apiKey.startsWith('creem_test_') ? '测试密钥' : '生产密钥'}`);
  console.log('');
  
  // 测试基础API访问
  await testBasicAPIAccess(apiKey);
  
  // 测试产品相关权限
  await testProductPermissions(apiKey);
  
  // 测试支付相关权限
  await testCheckoutPermissions(apiKey);
  
  // 生成权限报告
  generatePermissionReport();
}

async function testBasicAPIAccess(apiKey) {
  console.log('🌐 测试基础API访问权限');
  
  const testCases = [
    {
      name: '根路径访问',
      url: 'https://api.creem.io/',
      method: 'GET'
    },
    {
      name: 'API版本信息',
      url: 'https://api.creem.io/v1',
      method: 'GET'
    },
    {
      name: '健康检查',
      url: 'https://api.creem.io/health',
      method: 'GET'
    }
  ];
  
  for (const test of testCases) {
    try {
      const response = await fetch(test.url, {
        method: test.method,
        headers: {
          'x-api-key': apiKey,
          'User-Agent': 'Translation-App-Debug/1.0'
        }
      });
      
      console.log(`   ${test.name}: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        console.log(`     ✅ 访问成功`);
      } else if (response.status === 403) {
        console.log(`     ❌ 权限被拒绝`);
      } else if (response.status === 401) {
        console.log(`     ❌ 认证失败`);
      } else {
        console.log(`     ⚠️  其他错误: ${response.status}`);
      }
      
    } catch (error) {
      console.log(`   ${test.name}: ❌ 网络错误 - ${error.message}`);
    }
  }
  console.log('');
}

async function testProductPermissions(apiKey) {
  console.log('📦 测试产品相关权限');
  
  // 测试产品列表访问
  console.log('   测试产品列表访问...');
  try {
    const response = await fetch('https://api.creem.io/v1/products', {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   产品列表: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ 产品列表访问成功`);
      
      if (data.products && Array.isArray(data.products)) {
        console.log(`   📊 找到 ${data.products.length} 个产品:`);
        data.products.forEach((product, index) => {
          console.log(`     ${index + 1}. ${product.name || 'Unnamed'}`);
          console.log(`        ID: ${product.id}`);
          console.log(`        价格: $${(product.price || 0) / 100}`);
          console.log(`        状态: ${product.active ? '✅ 活跃' : '❌ 非活跃'}`);
          console.log('');
        });
        
        // 如果找到产品，测试单个产品访问
        if (data.products.length > 0) {
          const firstProduct = data.products[0];
          await testSingleProductAccess(apiKey, firstProduct.id);
        }
      }
    } else {
      const errorText = await response.text();
      console.log(`   ❌ 产品列表访问失败`);
      console.log(`   错误详情: ${errorText}`);
      
      if (response.status === 403) {
        console.log(`   💡 建议: API密钥缺少"读取产品"权限`);
      }
    }
  } catch (error) {
    console.log(`   ❌ 网络错误: ${error.message}`);
  }
  console.log('');
}

async function testSingleProductAccess(apiKey, productId) {
  console.log(`   测试单个产品访问 (${productId})...`);
  
  try {
    const response = await fetch(`https://api.creem.io/v1/products/${productId}`, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   单个产品: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      console.log(`   ✅ 单个产品访问成功`);
      const data = await response.json();
      console.log(`   产品详情: ${data.name} - $${(data.price || 0) / 100}`);
    } else {
      console.log(`   ❌ 单个产品访问失败`);
    }
  } catch (error) {
    console.log(`   ❌ 网络错误: ${error.message}`);
  }
}

async function testCheckoutPermissions(apiKey) {
  console.log('🛒 测试支付会话创建权限');
  
  // 首先获取一个有效的产品ID
  let validProductId = null;
  
  try {
    const productsResponse = await fetch('https://api.creem.io/v1/products', {
      method: 'GET',
      headers: { 'x-api-key': apiKey }
    });
    
    if (productsResponse.ok) {
      const data = await productsResponse.json();
      if (data.products && data.products.length > 0) {
        validProductId = data.products[0].id;
        console.log(`   使用产品ID进行测试: ${validProductId}`);
      }
    }
  } catch (error) {
    console.log(`   无法获取产品列表用于测试`);
  }
  
  // 如果没有有效产品ID，使用配置中的ID
  if (!validProductId) {
    validProductId = 'prod_7ghOSJ2klCjPTjnURPbMoh';
    console.log(`   使用配置的产品ID: ${validProductId}`);
  }
  
  // 测试创建checkout
  console.log('   测试创建支付会话...');
  
  const checkoutPayload = {
    product_id: validProductId,
    customer_email: 'test@example.com',
    success_url: 'https://example.com/success',
    cancel_url: 'https://example.com/cancel'
  };
  
  try {
    const response = await fetch('https://api.creem.io/v1/checkouts', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(checkoutPayload)
    });
    
    console.log(`   创建支付会话: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ 支付会话创建成功!`);
      console.log(`   会话ID: ${data.id}`);
      console.log(`   支付URL: ${data.checkout_url || data.url}`);
    } else {
      const errorText = await response.text();
      console.log(`   ❌ 支付会话创建失败`);
      console.log(`   错误详情: ${errorText}`);
      
      if (response.status === 403) {
        console.log(`   💡 建议: API密钥缺少"创建支付会话"权限`);
      } else if (response.status === 404) {
        console.log(`   💡 建议: 产品ID不存在或无权访问`);
      } else if (response.status === 400) {
        console.log(`   💡 建议: 请求参数错误`);
      }
    }
  } catch (error) {
    console.log(`   ❌ 网络错误: ${error.message}`);
  }
  console.log('');
}

function generatePermissionReport() {
  console.log('📊 权限诊断报告');
  console.log('');
  
  console.log('🎯 下一步行动建议:');
  console.log('');
  
  console.log('1. 如果产品列表访问失败 (403):');
  console.log('   - 登录CREEM控制台');
  console.log('   - 检查API密钥权限设置');
  console.log('   - 启用"读取产品"权限');
  console.log('');
  
  console.log('2. 如果支付会话创建失败 (403):');
  console.log('   - 在API密钥设置中启用"创建支付会话"权限');
  console.log('   - 确认账户有创建支付会话的权限');
  console.log('');
  
  console.log('3. 如果产品ID不存在 (404):');
  console.log('   - 在CREEM控制台创建新产品');
  console.log('   - 或使用现有产品的正确ID');
  console.log('   - 更新配置文件中的产品ID');
  console.log('');
  
  console.log('4. 如果所有请求都失败:');
  console.log('   - 验证API密钥是否正确');
  console.log('   - 检查账户状态是否正常');
  console.log('   - 联系CREEM技术支持');
  console.log('');
  
  console.log('📞 CREEM技术支持:');
  console.log('   邮箱: support@creem.io');
  console.log('   Discord: https://discord.gg/q3GKZs92Av');
}

// 运行权限测试
testCreemPermissions();
