#!/usr/bin/env node

/**
 * 快速验证支付API修复
 */

console.log('🔧 快速验证支付API修复...\n');

// 检查修复的代码
const fs = require('fs');

try {
  const checkoutApiPath = '/home/hwt/translation-low-source/frontend/app/api/checkout/route.ts';
  const content = fs.readFileSync(checkoutApiPath, 'utf8');
  
  console.log('📋 检查修复内容:');
  
  // 检查是否直接调用handleDirectPaymentUrl
  const hasDirectCall = content.includes('return handleDirectPaymentUrl(plan, planId, req, origin);') && 
                       content.includes('📋 Using demo payment page (API key issue workaround)');
  
  console.log(`   ✅ 直接调用演示支付: ${hasDirectCall ? '已修复' : '未修复'}`);
  
  // 检查handleDirectPaymentUrl函数是否正确处理空URL
  const hasEmptyUrlHandling = content.includes('if (!plan.creemPaymentUrl || plan.creemPaymentUrl === \'\')');
  
  console.log(`   ✅ 空URL处理: ${hasEmptyUrlHandling ? '已修复' : '未修复'}`);
  
  // 检查ngrok地址处理
  const hasNgrokHandling = content.includes('const ngrokOrigin = process.env.NEXT_PUBLIC_APP_URL || origin;');
  
  console.log(`   ✅ ngrok地址处理: ${hasNgrokHandling ? '已修复' : '未修复'}`);
  
  if (hasDirectCall && hasEmptyUrlHandling && hasNgrokHandling) {
    console.log('\n🎉 所有修复都已应用！');
    
    console.log('\n📋 修复后的流程:');
    console.log('1. 用户点击支付按钮');
    console.log('2. API直接调用handleDirectPaymentUrl');
    console.log('3. 检测到空的creemPaymentUrl');
    console.log('4. 生成演示支付页面URL');
    console.log('5. 返回演示支付URL给前端');
    console.log('6. 前端跳转到演示支付页面');
    
    console.log('\n🚀 现在应该可以正常工作了！');
    console.log('   访问: https://fdb2-38-98-191-33.ngrok-free.app/en/pricing');
    console.log('   点击Basic Pack的"Buy Now"按钮');
    console.log('   应该跳转到演示支付页面');
    
  } else {
    console.log('\n⚠️  部分修复可能未完全应用');
  }
  
} catch (error) {
  console.error('❌ 无法检查修复状态:', error.message);
}

console.log('\n💡 如果仍有问题，请检查:');
console.log('1. 浏览器控制台是否显示新的日志');
console.log('2. API响应状态码是否从503变为200');
console.log('3. 是否返回了演示支付页面URL');
