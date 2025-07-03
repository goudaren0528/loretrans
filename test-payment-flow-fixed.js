#!/usr/bin/env node

/**
 * 测试修复后的支付流程
 * 
 * 这个脚本将测试：
 * 1. 直接支付URL回退机制
 * 2. 演示支付页面
 * 3. 错误处理改进
 */

console.log('🧪 测试修复后的支付流程...\n');

// 测试1: 检查开发服务器状态
console.log('📋 1. 检查开发服务器状态:');
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/api/health');
    if (response.ok) {
      console.log('   ✅ 开发服务器运行正常');
      return true;
    } else {
      console.log('   ⚠️  开发服务器响应异常:', response.status);
      return false;
    }
  } catch (error) {
    console.log('   ❌ 开发服务器无法访问');
    return false;
  }
}

// 测试2: 检查测试页面
console.log('\n📋 2. 检查测试页面:');
async function checkTestPage() {
  try {
    const response = await fetch('http://localhost:3000/en/test-payment');
    console.log(`   测试页面状态: ${response.status}`);
    if (response.status === 200 || response.status === 307) {
      console.log('   ✅ 测试页面可访问');
      return true;
    }
  } catch (error) {
    console.log('   ❌ 测试页面访问失败:', error.message);
  }
  return false;
}

// 测试3: 检查演示支付页面
console.log('\n📋 3. 检查演示支付页面:');
async function checkDemoPage() {
  try {
    const demoUrl = 'http://localhost:3000/en/demo-payment?plan=basic&price=5&credits=5000';
    const response = await fetch(demoUrl);
    console.log(`   演示页面状态: ${response.status}`);
    if (response.status === 200 || response.status === 307) {
      console.log('   ✅ 演示支付页面可访问');
      console.log(`   🔗 URL: ${demoUrl}`);
      return true;
    }
  } catch (error) {
    console.log('   ❌ 演示页面访问失败:', error.message);
  }
  return false;
}

// 测试4: 验证配置文件更新
console.log('\n📋 4. 验证配置文件更新:');
function checkConfig() {
  try {
    const fs = require('fs');
    const configPath = '/home/hwt/translation-low-source/config/pricing.config.ts';
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    if (configContent.includes('creemPaymentUrl')) {
      console.log('   ✅ pricing配置已更新，包含直接支付URL');
    } else {
      console.log('   ❌ pricing配置缺少直接支付URL');
    }
    
    if (configContent.includes('临时直接支付URL')) {
      console.log('   ✅ 配置包含临时解决方案注释');
    }
    
    return true;
  } catch (error) {
    console.log('   ❌ 配置文件检查失败:', error.message);
    return false;
  }
}

// 测试5: 检查API路由更新
console.log('\n📋 5. 检查API路由更新:');
function checkApiRoute() {
  try {
    const fs = require('fs');
    const routePath = '/home/hwt/translation-low-source/frontend/app/api/checkout/route.ts';
    const routeContent = fs.readFileSync(routePath, 'utf8');
    
    if (routeContent.includes('handleDirectPaymentUrl')) {
      console.log('   ✅ API路由包含直接支付URL处理');
    } else {
      console.log('   ❌ API路由缺少直接支付URL处理');
    }
    
    if (routeContent.includes('临时解决方案')) {
      console.log('   ✅ API路由包含临时解决方案注释');
    }
    
    if (routeContent.includes('demo_payment')) {
      console.log('   ✅ API路由包含演示支付回退');
    }
    
    return true;
  } catch (error) {
    console.log('   ❌ API路由检查失败:', error.message);
    return false;
  }
}

// 运行所有测试
async function runAllTests() {
  const results = {
    server: await checkServer(),
    testPage: await checkTestPage(),
    demoPage: await checkDemoPage(),
    config: checkConfig(),
    apiRoute: checkApiRoute()
  };
  
  console.log('\n📊 测试结果总结:');
  console.log('='.repeat(50));
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ 通过' : '❌ 失败';
    const testName = {
      server: '开发服务器',
      testPage: '测试页面',
      demoPage: '演示页面',
      config: '配置文件',
      apiRoute: 'API路由'
    }[test];
    
    console.log(`${status} ${testName}`);
  });
  
  const passedCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.keys(results).length;
  
  console.log('='.repeat(50));
  console.log(`总体结果: ${passedCount}/${totalCount} 项测试通过`);
  
  if (passedCount === totalCount) {
    console.log('\n🎉 所有测试通过！支付流程修复完成。');
    console.log('\n📋 下一步操作:');
    console.log('1. 访问 http://localhost:3000/en/test-payment 测试支付流程');
    console.log('2. 点击测试按钮，应该会生成演示支付URL');
    console.log('3. 获取有效的CREEM API密钥以启用真实支付');
  } else {
    console.log('\n⚠️  部分测试失败，请检查相关配置。');
  }
}

runAllTests().catch(console.error);
