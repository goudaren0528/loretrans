#!/usr/bin/env node

/**
 * 支付流程测试脚本
 * 测试Basic Pack的支付流程是否正常工作
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';
const TEST_USER_EMAIL = 'hongwane323@gmail.com'; // 从日志中看到的用户邮箱

async function testPaymentFlow() {
  console.log('🧪 开始测试支付流程...\n');

  try {
    // 1. 测试健康检查
    console.log('1️⃣ 检查服务状态...');
    const healthResponse = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log(`   ✅ 服务状态: ${healthData.data.status}`);
    console.log(`   📊 内存使用: ${healthData.data.memory.percentage}%\n`);

    // 2. 测试定价页面
    console.log('2️⃣ 检查定价页面...');
    const pricingResponse = await fetch(`${BASE_URL}/en/pricing`);
    if (pricingResponse.ok) {
      console.log('   ✅ 定价页面可访问');
    } else {
      console.log(`   ❌ 定价页面访问失败: ${pricingResponse.status}`);
    }

    // 3. 测试商品配置
    console.log('\n3️⃣ 检查商品配置...');
    const { PRICING_PLANS } = require('./config/pricing.config.ts');
    const basicPlan = PRICING_PLANS.find(p => p.id === 'basic');
    
    if (basicPlan) {
      console.log('   ✅ Basic Pack 配置找到:');
      console.log(`      名称: ${basicPlan.name}`);
      console.log(`      价格: $${basicPlan.priceUSD}`);
      console.log(`      积分: ${basicPlan.credits}`);
      console.log(`      产品ID: ${basicPlan.creemPriceId}`);
      console.log(`      支付URL: ${basicPlan.creemPaymentUrl || '未配置'}`);
      
      if (basicPlan.creemPaymentUrl) {
        console.log('   ✅ 支付URL已配置');
      } else {
        console.log('   ⚠️  支付URL未配置');
      }
    } else {
      console.log('   ❌ Basic Pack 配置未找到');
    }

    // 4. 模拟支付API调用（需要认证，所以这里只能测试错误响应）
    console.log('\n4️⃣ 测试支付API端点...');
    const checkoutResponse = await fetch(`${BASE_URL}/api/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ planId: 'basic' }),
    });

    const checkoutData = await checkoutResponse.json();
    
    if (checkoutResponse.status === 401) {
      console.log('   ✅ 支付API需要认证 (正常行为)');
      console.log(`   📝 响应: ${checkoutData.error}`);
    } else {
      console.log(`   📊 支付API响应状态: ${checkoutResponse.status}`);
      console.log(`   📝 响应内容:`, checkoutData);
    }

    // 5. 测试支付URL可访问性
    if (basicPlan && basicPlan.creemPaymentUrl) {
      console.log('\n5️⃣ 测试支付URL可访问性...');
      try {
        const paymentResponse = await fetch(basicPlan.creemPaymentUrl, {
          method: 'HEAD',
          timeout: 5000
        });
        console.log(`   📊 支付URL状态: ${paymentResponse.status}`);
        if (paymentResponse.ok) {
          console.log('   ✅ 支付URL可访问');
        } else {
          console.log('   ⚠️  支付URL返回非200状态');
        }
      } catch (error) {
        console.log(`   ⚠️  支付URL测试失败: ${error.message}`);
      }
    }

    console.log('\n🎉 测试完成！');
    console.log('\n📋 下一步测试建议:');
    console.log('1. 在浏览器中访问: http://localhost:3000/en/pricing');
    console.log('2. 登录用户账户');
    console.log('3. 点击 Basic Pack 的购买按钮');
    console.log('4. 验证是否正确跳转到Creem支付页面');

  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
  }
}

// 运行测试
testPaymentFlow();
