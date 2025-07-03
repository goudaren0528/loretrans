#!/usr/bin/env node

/**
 * Creem配置测试脚本
 * 用于验证Creem API密钥和配置是否正确
 */

require('dotenv').config({ path: './frontend/.env.local' });

const CREEM_API_KEY = process.env.CREEM_SECRET_KEY || process.env.CREEM_API_KEY;
const WEBHOOK_SECRET = process.env.CREEM_WEBHOOK_SECRET;

console.log('🔍 Creem配置检查');
console.log('================');

// 检查API密钥
if (!CREEM_API_KEY) {
  console.log('❌ CREEM_SECRET_KEY 未设置');
  console.log('   请在 .env.local 中设置: CREEM_SECRET_KEY=你的_api_key');
} else {
  console.log('✅ CREEM_SECRET_KEY 已设置');
  console.log(`   密钥前缀: ${CREEM_API_KEY.substring(0, 10)}...`);
}

// 检查Webhook密钥
if (!WEBHOOK_SECRET) {
  console.log('⚠️  CREEM_WEBHOOK_SECRET 未设置');
  console.log('   这是可选的，用于验证webhook请求');
} else {
  console.log('✅ CREEM_WEBHOOK_SECRET 已设置');
}

console.log('\n📋 Webhook配置指南:');
console.log('开发环境: http://localhost:3000/api/webhooks/creem');
console.log('生产环境: https://你的域名.com/api/webhooks/creem');

console.log('\n🔗 Creem控制台: https://creem.io/dashboard');

// 测试API连接（如果有密钥）
if (CREEM_API_KEY && CREEM_API_KEY !== 'placeholder-secret-key') {
  console.log('\n🧪 测试API连接...');
  testCreemAPI();
}

async function testCreemAPI() {
  try {
    const response = await fetch('https://api.creem.io/v1/products', {
      headers: {
        'x-api-key': CREEM_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      console.log('✅ Creem API连接成功');
      const data = await response.json();
      console.log(`   找到 ${data.length || 0} 个产品`);
    } else {
      console.log(`❌ Creem API连接失败: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log(`❌ Creem API测试失败: ${error.message}`);
  }
}
