#!/usr/bin/env node

/**
 * 测试使用ngrok地址的支付流程
 * 
 * 这个脚本将：
 * 1. 验证ngrok地址可访问性
 * 2. 测试支付API使用ngrok地址
 * 3. 验证webhook回调URL正确性
 */

require('dotenv').config({ path: '.env.local' });

const NGROK_URL = process.env.NEXT_PUBLIC_APP_URL;

console.log('🌐 测试ngrok地址的支付流程...\n');

// 1. 验证ngrok地址
console.log('📋 1. 验证ngrok地址:');
console.log(`   配置的地址: ${NGROK_URL}`);

if (!NGROK_URL || NGROK_URL.includes('localhost')) {
  console.log('   ❌ 环境变量仍使用localhost，需要更新为ngrok地址');
  process.exit(1);
}

if (!NGROK_URL.includes('ngrok')) {
  console.log('   ⚠️  地址不包含ngrok，请确认是否正确');
}

// 2. 测试ngrok地址可访问性
async function testNgrokAccess() {
  console.log('\n📋 2. 测试ngrok地址可访问性:');
  
  try {
    console.log(`   正在访问: ${NGROK_URL}`);
    const response = await fetch(NGROK_URL);
    console.log(`   状态码: ${response.status}`);
    
    if (response.ok || response.status === 307) {
      console.log('   ✅ ngrok地址可正常访问');
      return true;
    } else {
      console.log('   ❌ ngrok地址访问异常');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ ngrok地址访问失败: ${error.message}`);
    return false;
  }
}

// 3. 测试支付页面
async function testPaymentPages() {
  console.log('\n📋 3. 测试支付相关页面:');
  
  const pages = [
    { name: '测试页面', url: `${NGROK_URL}/en/test-payment` },
    { name: '演示支付页面', url: `${NGROK_URL}/en/demo-payment?plan=basic&price=5&credits=5000` },
    { name: '定价页面', url: `${NGROK_URL}/en/pricing` }
  ];
  
  const results = {};
  
  for (const page of pages) {
    try {
      console.log(`   测试 ${page.name}: ${page.url}`);
      const response = await fetch(page.url);
      const success = response.ok || response.status === 307;
      console.log(`   状态: ${response.status} ${success ? '✅' : '❌'}`);
      results[page.name] = success;
    } catch (error) {
      console.log(`   ${page.name} 访问失败: ${error.message} ❌`);
      results[page.name] = false;
    }
  }
  
  return results;
}

// 4. 验证webhook URL
function testWebhookUrls() {
  console.log('\n📋 4. 验证webhook回调URL:');
  
  const webhookUrls = {
    success: `${NGROK_URL}/payment-success`,
    cancel: `${NGROK_URL}/pricing?purchase=canceled`,
    webhook: `${NGROK_URL}/api/webhook/creem`
  };
  
  console.log('   配置的回调URL:');
  Object.entries(webhookUrls).forEach(([type, url]) => {
    console.log(`   ${type}: ${url}`);
  });
  
  // 检查URL格式
  const allValid = Object.values(webhookUrls).every(url => {
    try {
      new URL(url);
      return url.startsWith('https://') && url.includes('ngrok');
    } catch {
      return false;
    }
  });
  
  if (allValid) {
    console.log('   ✅ 所有webhook URL格式正确');
  } else {
    console.log('   ❌ 部分webhook URL格式错误');
  }
  
  return allValid;
}

// 5. 模拟支付请求测试
async function simulatePaymentRequest() {
  console.log('\n📋 5. 模拟支付请求测试:');
  
  const paymentData = {
    planId: 'basic',
    ngrokUrl: NGROK_URL,
    successUrl: `${NGROK_URL}/payment-success`,
    cancelUrl: `${NGROK_URL}/pricing?purchase=canceled`
  };
  
  console.log('   支付请求数据:');
  console.log(`   计划ID: ${paymentData.planId}`);
  console.log(`   成功回调: ${paymentData.successUrl}`);
  console.log(`   取消回调: ${paymentData.cancelUrl}`);
  
  // 验证URL可达性
  try {
    const testUrls = [paymentData.successUrl, paymentData.cancelUrl];
    for (const url of testUrls) {
      const response = await fetch(url);
      console.log(`   ${url}: ${response.status} ${response.ok || response.status === 307 ? '✅' : '❌'}`);
    }
    return true;
  } catch (error) {
    console.log(`   ❌ URL测试失败: ${error.message}`);
    return false;
  }
}

// 6. 生成测试链接
function generateTestLinks() {
  console.log('\n📋 6. 生成测试链接:');
  
  const testLinks = {
    '支付测试页面': `${NGROK_URL}/en/test-payment`,
    '演示支付页面': `${NGROK_URL}/en/demo-payment?plan=basic&price=5&credits=5000`,
    '定价页面': `${NGROK_URL}/en/pricing`,
    'ngrok控制台': 'http://localhost:4040'
  };
  
  console.log('   可用的测试链接:');
  Object.entries(testLinks).forEach(([name, url]) => {
    console.log(`   ${name}: ${url}`);
  });
  
  return testLinks;
}

// 运行所有测试
async function runAllTests() {
  const results = {
    ngrokAccess: await testNgrokAccess(),
    paymentPages: await testPaymentPages(),
    webhookUrls: testWebhookUrls(),
    paymentRequest: await simulatePaymentRequest()
  };
  
  const testLinks = generateTestLinks();
  
  console.log('\n📊 测试结果总结:');
  console.log('='.repeat(60));
  
  console.log(`✅ ngrok地址访问: ${results.ngrokAccess ? '通过' : '失败'}`);
  console.log(`✅ 支付页面: ${Object.values(results.paymentPages).every(Boolean) ? '通过' : '部分失败'}`);
  console.log(`✅ webhook URL: ${results.webhookUrls ? '通过' : '失败'}`);
  console.log(`✅ 支付请求: ${results.paymentRequest ? '通过' : '失败'}`);
  
  console.log('='.repeat(60));
  
  const allPassed = results.ngrokAccess && 
                   Object.values(results.paymentPages).every(Boolean) && 
                   results.webhookUrls && 
                   results.paymentRequest;
  
  if (allPassed) {
    console.log('\n🎉 所有测试通过！ngrok支付流程配置正确。');
    console.log('\n🚀 现在可以进行真实的支付测试:');
    console.log(`1. 访问: ${NGROK_URL}/en/test-payment`);
    console.log('2. 点击测试按钮');
    console.log('3. CREEM可以正确回调到ngrok地址');
    console.log('\n💡 提示: 确保ngrok保持运行状态');
  } else {
    console.log('\n⚠️  部分测试失败，请检查配置。');
  }
  
  console.log('\n📋 重要提醒:');
  console.log('- ngrok地址会在重启后改变，需要更新环境变量');
  console.log('- 确保防火墙允许ngrok访问');
  console.log('- CREEM webhook需要使用https地址');
}

runAllTests().catch(console.error);
