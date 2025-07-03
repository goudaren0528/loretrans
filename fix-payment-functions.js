#!/usr/bin/env node

/**
 * 修复支付函数调用问题
 * 将 add_credits_on_purchase 改为 purchase_credits
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 修复支付函数调用问题...\n');

// 需要修复的文件列表
const filesToFix = [
  'frontend/app/api/payment/success/route.ts',
  'frontend/app/api/webhooks/creem/route.ts'
];

filesToFix.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  if (fs.existsSync(fullPath)) {
    console.log(`📝 修复文件: ${filePath}`);
    
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // 替换函数调用
    const oldFunctionCall = `supabase.rpc('add_credits_on_purchase', {
      p_user_id: userId,
      p_credits_to_add: pricingPlan.credits,
      p_amount_paid_usd: pricingPlan.priceUSD,
      p_creem_charge_id: order_id, // 修复：使用正确的参数名
      p_payment_metadata: {`;
    
    const newFunctionCall = `supabase.rpc('purchase_credits', {
      p_user_id: userId,
      p_amount: pricingPlan.credits,
      p_payment_id: order_id,
      p_description: \`Purchase of \${pricingPlan.credits} credits (\${pricingPlan.name})\``;
    
    if (content.includes('add_credits_on_purchase')) {
      // 更简单的替换方式
      content = content.replace(/add_credits_on_purchase/g, 'purchase_credits');
      
      // 修复参数名
      content = content.replace(/p_credits_to_add/g, 'p_amount');
      content = content.replace(/p_amount_paid_usd/g, 'p_amount_paid');
      content = content.replace(/p_creem_charge_id/g, 'p_payment_id');
      
      // 移除不需要的参数
      content = content.replace(/,\s*p_payment_metadata:\s*\{[^}]*\}/g, '');
      
      fs.writeFileSync(fullPath, content);
      console.log(`   ✅ 已修复`);
    } else {
      console.log(`   ⚠️  文件中未找到需要修复的函数调用`);
    }
  } else {
    console.log(`   ❌ 文件不存在: ${filePath}`);
  }
});

console.log('\n🎯 修复完成！');
console.log('\n📋 修复内容:');
console.log('1. 将 add_credits_on_purchase 改为 purchase_credits');
console.log('2. 调整函数参数以匹配数据库函数签名');
console.log('3. 移除不必要的参数');

console.log('\n🧪 现在可以测试支付流程了！');
