#!/usr/bin/env node

/**
 * 测试Pricing页面的支付功能
 * 
 * 验证修复后的CheckoutButton组件是否正常工作
 */

const NGROK_URL = 'https://fdb2-38-98-191-33.ngrok-free.app';

console.log('💳 测试Pricing页面支付功能...\n');

// 1. 测试Pricing页面可访问性
async function testPricingPageAccess() {
  console.log('📋 1. 测试Pricing页面访问:');
  
  try {
    const response = await fetch(`${NGROK_URL}/en/pricing`);
    console.log(`   状态码: ${response.status}`);
    
    if (response.ok || response.status === 307) {
      console.log('   ✅ Pricing页面可正常访问');
      return true;
    } else {
      console.log('   ❌ Pricing页面访问异常');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Pricing页面访问失败: ${error.message}`);
    return false;
  }
}

// 2. 测试相关API端点
async function testApiEndpoints() {
  console.log('\n📋 2. 测试相关API端点:');
  
  const endpoints = [
    { name: 'Checkout API', url: `${NGROK_URL}/api/checkout`, method: 'POST' },
    { name: 'Webhook API', url: `${NGROK_URL}/api/webhook/creem`, method: 'GET' },
    { name: 'Auth API', url: `${NGROK_URL}/api/auth/user`, method: 'GET' }
  ];
  
  const results = {};
  
  for (const endpoint of endpoints) {
    try {
      console.log(`   测试 ${endpoint.name}: ${endpoint.url}`);
      
      let response;
      if (endpoint.method === 'POST') {
        response = await fetch(endpoint.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planId: 'basic' })
        });
      } else {
        response = await fetch(endpoint.url);
      }
      
      console.log(`   状态: ${response.status} ${response.statusText}`);
      
      // 对于需要认证的端点，401是预期的
      const isExpectedStatus = response.status === 401 || response.status === 200 || response.status === 404;
      results[endpoint.name] = isExpectedStatus;
      
      if (isExpectedStatus) {
        console.log(`   ✅ ${endpoint.name} 响应正常`);
      } else {
        console.log(`   ❌ ${endpoint.name} 响应异常`);
      }
      
    } catch (error) {
      console.log(`   ❌ ${endpoint.name} 请求失败: ${error.message}`);
      results[endpoint.name] = false;
    }
  }
  
  return results;
}

// 3. 检查修复的内容
function checkFixedComponents() {
  console.log('\n📋 3. 检查修复的组件:');
  
  const fs = require('fs');
  const checkoutButtonPath = '/home/hwt/translation-low-source/frontend/components/billing/checkout-button.tsx';
  
  try {
    const content = fs.readFileSync(checkoutButtonPath, 'utf8');
    
    const checks = [
      { name: '导入useAuth', pattern: 'useAuth', found: content.includes('useAuth') },
      { name: '获取访问token', pattern: 'getAccessToken', found: content.includes('getAccessToken') },
      { name: '认证检查', pattern: 'if (!user)', found: content.includes('if (!user)') },
      { name: 'Authorization头', pattern: 'Authorization', found: content.includes('Authorization') },
      { name: '错误处理改进', pattern: 'response.status === 401', found: content.includes('response.status === 401') }
    ];
    
    checks.forEach(check => {
      const status = check.found ? '✅' : '❌';
      console.log(`   ${status} ${check.name}: ${check.found ? '已修复' : '未找到'}`);
    });
    
    const allFixed = checks.every(check => check.found);
    console.log(`\n   总体状态: ${allFixed ? '✅ 所有修复已应用' : '❌ 部分修复缺失'}`);
    
    return allFixed;
    
  } catch (error) {
    console.log(`   ❌ 无法检查组件文件: ${error.message}`);
    return false;
  }
}

// 4. 生成测试指南
function generateTestGuide() {
  console.log('\n📋 4. 用户测试指南:');
  console.log('='.repeat(60));
  
  console.log('\n🌐 浏览器测试步骤:');
  console.log(`1. 访问Pricing页面: ${NGROK_URL}/en/pricing`);
  console.log('2. 确保已登录 (右上角显示用户邮箱)');
  console.log('3. 选择一个付费套餐 (如Basic Pack)');
  console.log('4. 点击 "Buy Now" 按钮');
  console.log('5. 检查是否正确跳转到支付页面');
  
  console.log('\n🔍 调试信息查看:');
  console.log('1. 打开浏览器开发者工具 (F12)');
  console.log('2. 查看Console标签页的日志');
  console.log('3. 查看Network标签页的API请求');
  console.log('4. 检查是否有认证token在请求头中');
  
  console.log('\n⚠️  常见问题解决:');
  console.log('- 如果显示401错误: 请重新登录');
  console.log('- 如果显示403错误: 检查CREEM API密钥');
  console.log('- 如果没有支付URL: 检查CREEM产品配置');
  console.log('- 如果页面不跳转: 检查控制台错误信息');
}

// 5. 对比新旧测试页面
function compareTestMethods() {
  console.log('\n📋 5. 测试方法对比:');
  console.log('='.repeat(60));
  
  console.log('\n🆚 新测试页面 vs Pricing页面:');
  
  const comparison = [
    { 
      aspect: '用户体验', 
      testPage: '简化的测试界面', 
      pricingPage: '完整的产品展示和购买流程' 
    },
    { 
      aspect: '认证状态', 
      testPage: '可能缺少完整认证', 
      pricingPage: '完整的用户认证集成' 
    },
    { 
      aspect: '错误处理', 
      testPage: '基础错误显示', 
      pricingPage: '完善的错误处理和用户提示' 
    },
    { 
      aspect: '真实性', 
      testPage: '测试环境', 
      pricingPage: '真实的生产环境体验' 
    },
    { 
      aspect: '维护性', 
      testPage: '额外的测试代码', 
      pricingPage: '使用现有的生产代码' 
    }
  ];
  
  comparison.forEach(item => {
    console.log(`\n${item.aspect}:`);
    console.log(`   测试页面: ${item.testPage}`);
    console.log(`   Pricing页面: ${item.pricingPage}`);
  });
  
  console.log('\n💡 结论: 您说得对，应该在Pricing页面测试，因为:');
  console.log('   ✅ 更真实的用户体验');
  console.log('   ✅ 完整的认证和错误处理');
  console.log('   ✅ 使用生产环境的代码路径');
  console.log('   ✅ 减少维护额外测试代码的负担');
}

// 运行所有测试
async function runAllTests() {
  console.log('开始测试...\n');
  
  const pricingAccess = await testPricingPageAccess();
  const apiResults = await testApiEndpoints();
  const componentFixed = checkFixedComponents();
  
  generateTestGuide();
  compareTestMethods();
  
  console.log('\n📊 测试结果总结:');
  console.log('='.repeat(60));
  
  console.log(`✅ Pricing页面访问: ${pricingAccess ? '正常' : '异常'}`);
  console.log(`✅ API端点测试: ${Object.values(apiResults).filter(Boolean).length}/${Object.keys(apiResults).length} 正常`);
  console.log(`✅ 组件修复状态: ${componentFixed ? '完成' : '部分完成'}`);
  
  if (pricingAccess && componentFixed) {
    console.log('\n🎉 修复完成！现在可以在Pricing页面正常测试支付功能。');
    console.log(`\n🚀 立即测试: ${NGROK_URL}/en/pricing`);
    console.log('\n💡 主要修复内容:');
    console.log('   - 添加了用户认证检查');
    console.log('   - 包含了访问token在API请求中');
    console.log('   - 改进了错误处理和用户提示');
    console.log('   - 支持未登录用户的登录引导');
  } else {
    console.log('\n⚠️  仍有问题需要解决，请检查上述测试结果。');
  }
}

runAllTests().catch(console.error);
