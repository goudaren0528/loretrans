#!/usr/bin/env node

/**
 * 验证正式CREEM支付流程恢复
 */

require('dotenv').config({ path: '.env.local' });

console.log('🏢 验证正式CREEM支付流程恢复...\n');

// 1. 检查配置恢复
function checkConfiguration() {
  console.log('📋 1. 检查配置恢复:');
  
  const fs = require('fs');
  
  try {
    // 检查pricing配置
    const pricingPath = '/home/hwt/translation-low-source/config/pricing.config.ts';
    const pricingContent = fs.readFileSync(pricingPath, 'utf8');
    
    const hasProductId = pricingContent.includes('prod_7ghOSJ2klCjPTjnURPbMoh');
    const hasPaymentUrl = pricingContent.includes('https://www.creem.io/test/payment/prod_7ghOSJ2klCjPTjnURPbMoh');
    const noEmptyUrl = !pricingContent.includes("creemPaymentUrl: '',");
    
    console.log(`   ✅ CREEM产品ID: ${hasProductId ? '已配置' : '未配置'}`);
    console.log(`   ✅ CREEM支付URL: ${hasPaymentUrl ? '已配置' : '未配置'}`);
    console.log(`   ✅ 非空URL配置: ${noEmptyUrl ? '正确' : '错误'}`);
    
    // 检查API配置
    const apiKey = process.env.CREEM_API_KEY;
    console.log(`   ✅ CREEM API密钥: ${apiKey ? '已配置' : '未配置'}`);
    
    return hasProductId && hasPaymentUrl && noEmptyUrl && apiKey;
    
  } catch (error) {
    console.log(`   ❌ 配置检查失败: ${error.message}`);
    return false;
  }
}

// 2. 检查API逻辑恢复
function checkApiLogic() {
  console.log('\n📋 2. 检查API逻辑恢复:');
  
  const fs = require('fs');
  
  try {
    const apiPath = '/home/hwt/translation-low-source/frontend/app/api/checkout/route.ts';
    const apiContent = fs.readFileSync(apiPath, 'utf8');
    
    // 检查是否移除了强制演示支付
    const noForcedDemo = !apiContent.includes('直接使用演示支付页面');
    const hasApiAttempt = apiContent.includes('🧪 Attempting CREEM API call');
    const hasDirectUrlFallback = apiContent.includes('falling back to direct URL');
    const hasProperErrorHandling = apiContent.includes('Payment method not configured');
    
    console.log(`   ✅ 移除强制演示: ${noForcedDemo ? '已移除' : '未移除'}`);
    console.log(`   ✅ API调用尝试: ${hasApiAttempt ? '已恢复' : '未恢复'}`);
    console.log(`   ✅ 直接URL回退: ${hasDirectUrlFallback ? '已配置' : '未配置'}`);
    console.log(`   ✅ 错误处理: ${hasProperErrorHandling ? '已配置' : '未配置'}`);
    
    return noForcedDemo && hasApiAttempt && hasDirectUrlFallback && hasProperErrorHandling;
    
  } catch (error) {
    console.log(`   ❌ API逻辑检查失败: ${error.message}`);
    return false;
  }
}

// 3. 分析支付流程
function analyzePaymentFlow() {
  console.log('\n📋 3. 分析恢复后的支付流程:');
  
  console.log('\n   🔄 正式CREEM支付流程:');
  console.log('   1. 用户点击支付按钮');
  console.log('   2. 尝试CREEM API调用 (使用您的API密钥)');
  console.log('   3. 如果API成功 → 跳转到CREEM官方支付页面');
  console.log('   4. 如果API失败 → 回退到直接支付URL');
  console.log('   5. 使用您提供的支付URL: https://www.creem.io/test/payment/...');
  console.log('   6. 支付完成后回调到ngrok地址');
  
  console.log('\n   ⚠️  可能的结果:');
  console.log('   - 如果API密钥有效: 使用API创建checkout session');
  console.log('   - 如果API密钥无效: 使用直接支付URL');
  console.log('   - 如果支付URL无效: 返回错误信息');
}

// 4. 生成测试指南
function generateTestGuide() {
  console.log('\n📋 4. 正式流程测试指南:');
  console.log('='.repeat(60));
  
  console.log('\n🌐 浏览器测试:');
  console.log('1. 访问: https://fdb2-38-98-191-33.ngrok-free.app/en/pricing');
  console.log('2. 确认已登录 (hongwane322@gmail.com)');
  console.log('3. 点击Basic Pack的"Buy Now"按钮');
  console.log('4. 观察控制台日志');
  
  console.log('\n🔍 预期日志 (API密钥有效):');
  console.log('   🧪 Attempting CREEM API call');
  console.log('   CREEM API payload: {...}');
  console.log('   CREEM API response status: 200');
  console.log('   ✅ CREEM API checkout session created successfully');
  console.log('   跳转到: CREEM官方支付页面');
  
  console.log('\n🔍 预期日志 (API密钥无效):');
  console.log('   🧪 Attempting CREEM API call');
  console.log('   CREEM API response status: 403');
  console.log('   ⚠️ CREEM API call failed, falling back to direct URL');
  console.log('   🔗 Using direct payment URL');
  console.log('   跳转到: https://www.creem.io/test/payment/...');
  
  console.log('\n⚠️  如果仍有问题:');
  console.log('   - 检查CREEM API密钥是否有效');
  console.log('   - 检查产品ID是否存在于您的CREEM账户');
  console.log('   - 检查支付URL是否可访问');
  console.log('   - 确认webhook URL已在CREEM控制台配置');
}

// 5. CREEM配置检查清单
function generateCreemChecklist() {
  console.log('\n📋 5. CREEM配置检查清单:');
  console.log('='.repeat(60));
  
  console.log('\n🔑 API密钥检查:');
  console.log('   - 登录 https://dashboard.creem.io');
  console.log('   - 检查API密钥是否有效');
  console.log('   - 确认API密钥权限正确');
  
  console.log('\n📦 产品配置检查:');
  console.log('   - 产品ID: prod_7ghOSJ2klCjPTjnURPbMoh');
  console.log('   - 确认产品存在于您的账户');
  console.log('   - 检查产品价格设置 ($5.00)');
  
  console.log('\n🌐 Webhook配置:');
  console.log('   - Webhook URL: https://fdb2-38-98-191-33.ngrok-free.app/api/webhook/creem');
  console.log('   - 启用支付相关事件');
  console.log('   - 测试webhook连接');
  
  console.log('\n🔗 支付URL检查:');
  console.log('   - 直接访问: https://www.creem.io/test/payment/prod_7ghOSJ2klCjPTjnURPbMoh');
  console.log('   - 确认页面可正常加载');
  console.log('   - 检查是否为您的产品页面');
}

// 运行所有检查
function runAllChecks() {
  console.log('开始验证...\n');
  
  const configOk = checkConfiguration();
  const apiLogicOk = checkApiLogic();
  
  analyzePaymentFlow();
  generateTestGuide();
  generateCreemChecklist();
  
  console.log('\n📊 验证结果总结:');
  console.log('='.repeat(60));
  
  console.log(`✅ 配置恢复: ${configOk ? '完成' : '需要检查'}`);
  console.log(`✅ API逻辑恢复: ${apiLogicOk ? '完成' : '需要检查'}`);
  
  if (configOk && apiLogicOk) {
    console.log('\n🎉 正式CREEM支付流程已恢复！');
    console.log('\n🚀 现在测试:');
    console.log('   访问: https://fdb2-38-98-191-33.ngrok-free.app/en/pricing');
    console.log('   点击支付按钮应该使用正式CREEM流程');
    console.log('\n💡 不再有演示支付页面，使用真实的CREEM支付');
  } else {
    console.log('\n⚠️  部分配置需要检查，请参考上述清单');
  }
}

runAllChecks();
