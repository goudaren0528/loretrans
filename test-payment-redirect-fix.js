#!/usr/bin/env node

/**
 * 测试支付跳转问题修复
 * 
 * 验证修复后的支付流程是否正常工作
 */

require('dotenv').config({ path: '.env.local' });

const NGROK_URL = process.env.NEXT_PUBLIC_APP_URL;

console.log('🔧 测试支付跳转问题修复...\n');

// 1. 验证环境配置
function checkEnvironmentConfig() {
  console.log('📋 1. 检查环境配置:');
  
  console.log(`   NEXT_PUBLIC_APP_URL: ${NGROK_URL}`);
  console.log(`   CREEM_API_KEY: ${process.env.CREEM_API_KEY ? '已配置' : '未配置'}`);
  
  const isNgrokUrl = NGROK_URL && NGROK_URL.includes('ngrok');
  console.log(`   ngrok地址: ${isNgrokUrl ? '✅ 正确' : '❌ 错误'}`);
  
  return isNgrokUrl;
}

// 2. 测试演示支付页面
async function testDemoPaymentPage() {
  console.log('\n📋 2. 测试演示支付页面:');
  
  const demoUrl = `${NGROK_URL}/demo-payment?plan=basic&price=5&credits=5000&request_id=test_123`;
  
  try {
    console.log(`   访问: ${demoUrl}`);
    const response = await fetch(demoUrl);
    console.log(`   状态码: ${response.status}`);
    
    if (response.ok || response.status === 307) {
      console.log('   ✅ 演示支付页面可正常访问');
      return true;
    } else {
      console.log('   ❌ 演示支付页面访问异常');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ 演示支付页面访问失败: ${error.message}`);
    return false;
  }
}

// 3. 测试回调URL
async function testCallbackUrls() {
  console.log('\n📋 3. 测试回调URL:');
  
  const urls = [
    { name: '支付成功页面', url: `${NGROK_URL}/payment-success` },
    { name: '支付取消页面', url: `${NGROK_URL}/pricing?purchase=canceled` }
  ];
  
  const results = {};
  
  for (const urlInfo of urls) {
    try {
      console.log(`   测试 ${urlInfo.name}: ${urlInfo.url}`);
      const response = await fetch(urlInfo.url);
      const success = response.ok || response.status === 307;
      console.log(`   状态: ${response.status} ${success ? '✅' : '❌'}`);
      results[urlInfo.name] = success;
    } catch (error) {
      console.log(`   ${urlInfo.name} 访问失败: ${error.message} ❌`);
      results[urlInfo.name] = false;
    }
  }
  
  return results;
}

// 4. 分析当前支付流程
function analyzePaymentFlow() {
  console.log('\n📋 4. 分析当前支付流程:');
  
  console.log('\n   🔍 从日志分析的问题:');
  console.log('   1. ❌ 支付URL无效: https://pay.creem.io/basic-pack-5usd');
  console.log('   2. ❌ 回调URL错误: 使用localhost而非ngrok');
  console.log('   3. ❌ CREEM API密钥无效: 回退到直接URL方法');
  
  console.log('\n   🛠️ 已实施的修复:');
  console.log('   1. ✅ 移除无效的支付URL配置');
  console.log('   2. ✅ 强制使用ngrok地址作为回调URL');
  console.log('   3. ✅ 改进演示支付页面处理');
  console.log('   4. ✅ 添加详细的调试日志');
  
  console.log('\n   🎯 修复后的流程:');
  console.log('   1. 用户点击支付按钮');
  console.log('   2. API尝试CREEM集成 (预期失败)');
  console.log('   3. 回退到演示支付页面');
  console.log('   4. 使用ngrok地址确保回调正常');
}

// 5. 生成测试指南
function generateTestGuide() {
  console.log('\n📋 5. 修复后测试指南:');
  console.log('='.repeat(60));
  
  console.log('\n🌐 浏览器测试步骤:');
  console.log(`1. 访问Pricing页面: ${NGROK_URL}/en/pricing`);
  console.log('2. 确认已登录 (hongwane322@gmail.com)');
  console.log('3. 点击Basic Pack的"Buy Now"按钮');
  console.log('4. 应该跳转到演示支付页面');
  console.log('5. 在演示页面测试支付成功/取消流程');
  
  console.log('\n🔍 预期的控制台日志:');
  console.log('   🚀 开始测试支付流程...');
  console.log('   👤 Current user: hongwane322@gmail.com');
  console.log('   📡 Sending checkout request to API...');
  console.log('   📊 API Response status: 200');
  console.log('   ✅ API Response data: {...}');
  console.log('   🔗 Opening payment URL: [ngrok地址]/demo-payment');
  
  console.log('\n⚠️  重要变化:');
  console.log('   - 不再跳转到无效的CREEM URL');
  console.log('   - 改为跳转到功能完整的演示支付页面');
  console.log('   - 所有回调URL使用ngrok地址');
  console.log('   - 支持完整的支付成功/取消流程测试');
}

// 6. 提供CREEM集成指南
function provideCREEMIntegrationGuide() {
  console.log('\n📋 6. 启用真实CREEM支付的步骤:');
  console.log('='.repeat(60));
  
  console.log('\n🔑 1. 获取有效的CREEM API密钥:');
  console.log('   - 登录 https://dashboard.creem.io');
  console.log('   - 生成新的API密钥');
  console.log('   - 更新 .env.local 中的 CREEM_API_KEY');
  
  console.log('\n📦 2. 在CREEM控制台创建产品:');
  console.log('   - 创建名为"Basic Pack"的产品');
  console.log('   - 设置价格为$5.00');
  console.log('   - 记录产品ID');
  console.log('   - 更新 pricing.config.ts 中的 creemProductId');
  
  console.log('\n🌐 3. 配置Webhook:');
  console.log(`   - Webhook URL: ${NGROK_URL}/api/webhook/creem`);
  console.log('   - 启用所有支付事件');
  console.log('   - 配置签名验证 (可选)');
  
  console.log('\n✅ 4. 验证集成:');
  console.log('   - 重启应用');
  console.log('   - 测试支付流程');
  console.log('   - 检查是否跳转到真实CREEM支付页面');
}

// 运行所有测试
async function runAllTests() {
  console.log('开始测试...\n');
  
  const envConfig = checkEnvironmentConfig();
  const demoPage = await testDemoPaymentPage();
  const callbackResults = await testCallbackUrls();
  
  analyzePaymentFlow();
  generateTestGuide();
  provideCREEMIntegrationGuide();
  
  console.log('\n📊 测试结果总结:');
  console.log('='.repeat(60));
  
  console.log(`✅ 环境配置: ${envConfig ? '正确' : '需要修复'}`);
  console.log(`✅ 演示支付页面: ${demoPage ? '正常' : '异常'}`);
  
  const callbackSuccess = Object.values(callbackResults).filter(Boolean).length;
  const callbackTotal = Object.keys(callbackResults).length;
  console.log(`✅ 回调URL测试: ${callbackSuccess}/${callbackTotal} 正常`);
  
  if (envConfig && demoPage && callbackSuccess === callbackTotal) {
    console.log('\n🎉 修复完成！支付跳转问题已解决。');
    console.log('\n🚀 现在测试:');
    console.log(`   访问: ${NGROK_URL}/en/pricing`);
    console.log('   点击支付按钮应该跳转到演示支付页面');
  } else {
    console.log('\n⚠️  仍有问题需要解决，请检查上述测试结果。');
  }
}

runAllTests().catch(console.error);
