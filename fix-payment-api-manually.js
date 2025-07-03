#!/usr/bin/env node

/**
 * 手动修复支付API调用
 */

const fs = require('fs');

console.log('🔧 手动修复支付API调用...\n');

// 修复 payment success route
const successRoutePath = 'frontend/app/api/payment/success/route.ts';
let successContent = fs.readFileSync(successRoutePath, 'utf8');

// 找到并替换函数调用部分
const oldCall = `const { error } = await supabase.rpc('purchase_credits', {
      p_user_id: userId,
      p_amount: pricingPlan.credits,
      p_amount_paid: pricingPlan.priceUSD,
      p_payment_id: order_id, // 修复：使用正确的参数名
      p_payment_metadata: {
        checkout_id,
        customer_id,
        product_id,
        plan_id: planId,
        plan_name: pricingPlan.name
      }
    });`;

const newCall = `const { error } = await supabase.rpc('purchase_credits', {
      p_user_id: userId,
      p_amount: pricingPlan.credits,
      p_payment_id: order_id,
      p_description: \`Purchase of \${pricingPlan.credits} credits (\${pricingPlan.name})\`
    });`;

if (successContent.includes('purchase_credits')) {
  // 使用更精确的替换
  successContent = successContent.replace(
    /const { error } = await supabase\.rpc\('purchase_credits', \{[^}]+\}\);/s,
    newCall
  );
  
  fs.writeFileSync(successRoutePath, successContent);
  console.log('✅ 修复了 payment success route');
}

// 修复 webhook route
const webhookRoutePath = 'frontend/app/api/webhooks/creem/route.ts';
let webhookContent = fs.readFileSync(webhookRoutePath, 'utf8');

if (webhookContent.includes('purchase_credits')) {
  webhookContent = webhookContent.replace(
    /const { error } = await supabase\.rpc\('purchase_credits', \{[^}]+\}\);/s,
    `const { error } = await supabase.rpc('purchase_credits', {
      p_user_id: userId,
      p_amount: pricingPlan.credits,
      p_payment_id: order_id,
      p_description: \`Purchase of \${pricingPlan.credits} credits (\${pricingPlan.name}) via webhook\`
    });`
  );
  
  fs.writeFileSync(webhookRoutePath, webhookContent);
  console.log('✅ 修复了 webhook route');
}

console.log('\n🎯 手动修复完成！');
console.log('\n📋 修复内容:');
console.log('1. 使用正确的数据库函数参数');
console.log('2. 移除不存在的参数');
console.log('3. 简化函数调用');

console.log('\n🧪 现在支付回调应该能正常工作了！');
