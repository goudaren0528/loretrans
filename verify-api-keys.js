#!/usr/bin/env node

/**
 * Creem API密钥验证工具 - 简化版
 * 验证单一API密钥配置
 */

require('dotenv').config({ path: '.env.local' });

function verifyApiKeys() {
  console.log('🔑 Creem API密钥验证 (简化版)\n');
  
  const apiKey = process.env.CREEM_API_KEY;
  const webhookSecret = process.env.CREEM_WEBHOOK_SECRET;
  
  // 检查旧配置
  const oldPublicKey = process.env.NEXT_PUBLIC_CREEM_PUBLISHABLE_KEY;
  const oldSecretKey = process.env.CREEM_SECRET_KEY;
  
  console.log('📋 当前配置:');
  console.log(`   CREEM_API_KEY: ${apiKey || '❌ 未设置'}`);
  console.log(`   CREEM_WEBHOOK_SECRET: ${webhookSecret || '❌ 未设置'}`);
  console.log('');
  
  if (oldPublicKey || oldSecretKey) {
    console.log('⚠️  发现旧配置 (应该移除):');
    if (oldPublicKey) {
      console.log(`   NEXT_PUBLIC_CREEM_PUBLISHABLE_KEY: ${oldPublicKey}`);
    }
    if (oldSecretKey) {
      console.log(`   CREEM_SECRET_KEY: ${oldSecretKey}`);
    }
    console.log('');
  }
  
  // 验证密钥格式
  console.log('🔍 密钥格式验证:');
  
  if (apiKey) {
    if (apiKey.startsWith('creem_test_') || apiKey.startsWith('creem_sk_') || apiKey.startsWith('creem_')) {
      console.log('   ✅ API Key格式正确');
    } else {
      console.log('   ❌ API Key格式可能错误');
      console.log('      应该以 creem_ 开头');
    }
    
    console.log(`   📏 API Key长度: ${apiKey.length} 字符`);
  } else {
    console.log('   ❌ 缺少CREEM_API_KEY');
  }
  
  if (webhookSecret) {
    if (webhookSecret.startsWith('whsec_')) {
      console.log('   ✅ Webhook Secret格式正确');
    } else {
      console.log('   ❌ Webhook Secret格式错误');
      console.log('      应该以 whsec_ 开头');
    }
  } else {
    console.log('   ⚠️  缺少CREEM_WEBHOOK_SECRET (可选)');
  }
  
  console.log('');
  
  // 提供解决建议
  console.log('💡 配置建议:');
  
  if (!apiKey) {
    console.log('   1. 登录Creem控制台: https://creem.io/dashboard');
    console.log('   2. 进入API Keys页面');
    console.log('   3. 复制API Key');
    console.log('   4. 在.env.local中设置: CREEM_API_KEY=your_api_key_here');
  }
  
  if (oldPublicKey || oldSecretKey) {
    console.log('   🧹 清理旧配置:');
    console.log('      - 删除 NEXT_PUBLIC_CREEM_PUBLISHABLE_KEY');
    console.log('      - 删除 CREEM_SECRET_KEY');
    console.log('      - 只保留 CREEM_API_KEY');
  }
  
  console.log('');
  console.log('📝 正确的.env.local格式:');
  console.log('   CREEM_API_KEY=creem_test_xxxxx');
  console.log('   CREEM_WEBHOOK_SECRET=whsec_xxxxx');
  console.log('');
  console.log('🚫 不再需要的配置:');
  console.log('   ❌ NEXT_PUBLIC_CREEM_PUBLISHABLE_KEY (删除)');
  console.log('   ❌ CREEM_SECRET_KEY (重命名为CREEM_API_KEY)');
}

async function testApiAccess() {
  const apiKey = process.env.CREEM_API_KEY;
  
  if (!apiKey) {
    console.log('❌ 无法测试API访问：缺少CREEM_API_KEY');
    return;
  }
  
  console.log('\n🧪 测试API访问...');
  
  try {
    const fetch = require('node-fetch');
    
    // 尝试一个简单的API调用 - 获取产品列表
    const response = await fetch('https://api.creem.io/v1/products', {
      method: 'GET',
      headers: {
        'x-api-key': apiKey
      }
    });
    
    console.log(`📊 API响应状态: ${response.status} ${response.statusText}`);
    
    if (response.status === 403) {
      console.log('❌ 403 Forbidden - API密钥无效或权限不足');
      console.log('   请检查API密钥是否正确');
      console.log('   确保API密钥有访问产品的权限');
    } else if (response.status === 401) {
      console.log('❌ 401 Unauthorized - API密钥格式错误或未提供');
      console.log('   请检查API密钥格式');
    } else if (response.ok) {
      console.log('✅ API访问正常！');
      
      try {
        const data = await response.json();
        if (data.products && Array.isArray(data.products)) {
          console.log(`📦 找到 ${data.products.length} 个产品`);
          data.products.slice(0, 3).forEach(product => {
            console.log(`   - ${product.name} (${product.id})`);
          });
        }
      } catch (parseError) {
        console.log('   (响应解析失败，但API访问正常)');
      }
    } else {
      console.log(`⚠️  其他错误: ${response.status}`);
      const errorText = await response.text().catch(() => 'Unable to read error');
      console.log(`   错误详情: ${errorText}`);
    }
    
  } catch (error) {
    console.error('❌ API测试失败:', error.message);
    console.log('   可能的原因:');
    console.log('   1. 网络连接问题');
    console.log('   2. Creem API服务不可用');
    console.log('   3. 防火墙阻止了请求');
  }
}

async function testCheckoutCreation() {
  const apiKey = process.env.CREEM_API_KEY;
  
  if (!apiKey) {
    console.log('\n❌ 无法测试Checkout创建：缺少CREEM_API_KEY');
    return;
  }
  
  console.log('\n🛒 测试Checkout创建...');
  
  try {
    const fetch = require('node-fetch');
    
    // 测试创建checkout session
    const testPayload = {
      product_id: 'prod_test_example', // 使用测试产品ID
      customer_email: 'test@example.com',
      success_url: 'https://example.com/success',
      cancel_url: 'https://example.com/cancel',
      request_id: `test_${Date.now()}`
    };
    
    console.log('📤 测试Payload:', JSON.stringify(testPayload, null, 2));
    
    const response = await fetch('https://api.creem.io/v1/checkouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify(testPayload)
    });
    
    console.log(`📊 Checkout API响应: ${response.status} ${response.statusText}`);
    
    const responseText = await response.text();
    
    if (response.ok) {
      console.log('✅ Checkout创建API调用成功！');
      try {
        const data = JSON.parse(responseText);
        console.log('📋 响应数据:', JSON.stringify(data, null, 2));
      } catch {
        console.log('📋 响应内容:', responseText);
      }
    } else {
      console.log('❌ Checkout创建失败');
      console.log('📋 错误响应:', responseText);
      
      if (response.status === 400) {
        console.log('   可能原因: 产品ID不存在或参数错误');
      } else if (response.status === 403) {
        console.log('   可能原因: API密钥权限不足');
      }
    }
    
  } catch (error) {
    console.error('❌ Checkout测试失败:', error.message);
  }
}

// 运行验证
async function runVerification() {
  verifyApiKeys();
  await testApiAccess();
  await testCheckoutCreation();
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 总结:');
  console.log('1. 确保只使用 CREEM_API_KEY，移除旧的公私钥配置');
  console.log('2. API密钥应该以 creem_ 开头');
  console.log('3. 所有API调用都在后端进行，使用 x-api-key header');
  console.log('4. 前端不再需要任何Creem密钥');
  console.log('='.repeat(60));
}

runVerification();
