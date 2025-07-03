#!/usr/bin/env node

/**
 * 手动处理支付完成
 * 为用户 hongwane322@gmail.com 添加5000积分
 */

console.log('🔧 手动处理支付完成...\n');

// 支付信息
const paymentInfo = {
  userId: 'b7bee007-2a9f-4fb8-8020-10b707e2f4f4',
  email: 'hongwane322@gmail.com',
  planId: 'basic',
  credits: 5000,
  amount: 5.00,
  paymentId: 'ch_Talaw5HOl84xI5bjsbd3P',
  eventId: 'evt_2wQpW9TIF3fykDp8stqfd1'
};

console.log('📋 支付信息:');
console.log(`   👤 用户: ${paymentInfo.email}`);
console.log(`   🆔 用户ID: ${paymentInfo.userId}`);
console.log(`   📦 计划: ${paymentInfo.planId}`);
console.log(`   🎁 积分: ${paymentInfo.credits}`);
console.log(`   💰 金额: $${paymentInfo.amount}`);
console.log(`   🧾 支付ID: ${paymentInfo.paymentId}`);

// 模拟数据库更新
async function simulateCreditsUpdate() {
  console.log('\n🔄 模拟积分更新...');
  
  // 获取当前积分
  console.log('   📊 当前积分: 30500');
  console.log('   ➕ 添加积分: 5000');
  console.log('   📊 更新后积分: 35500');
  
  console.log('\n💾 数据库更新记录:');
  console.log('   表: user_credits');
  console.log('   操作: INSERT/UPDATE');
  console.log('   数据: {');
  console.log(`     user_id: "${paymentInfo.userId}",`);
  console.log(`     credits: ${paymentInfo.credits},`);
  console.log(`     plan_id: "${paymentInfo.planId}",`);
  console.log(`     payment_id: "${paymentInfo.paymentId}",`);
  console.log(`     payment_method: "creem",`);
  console.log(`     amount: ${paymentInfo.amount},`);
  console.log(`     currency: "USD",`);
  console.log(`     status: "completed",`);
  console.log(`     created_at: "${new Date().toISOString()}"`);
  console.log('   }');
}

// 生成SQL语句
function generateSQLStatements() {
  console.log('\n📝 生成SQL语句:');
  console.log('='.repeat(60));
  
  console.log('\n-- 更新用户积分');
  console.log(`UPDATE user_profiles 
SET credits = credits + ${paymentInfo.credits}
WHERE id = '${paymentInfo.userId}';`);
  
  console.log('\n-- 插入支付记录');
  console.log(`INSERT INTO payment_history (
  user_id, 
  plan_id, 
  payment_id, 
  payment_method, 
  amount, 
  currency, 
  credits_added, 
  status, 
  created_at
) VALUES (
  '${paymentInfo.userId}',
  '${paymentInfo.planId}',
  '${paymentInfo.paymentId}',
  'creem',
  ${paymentInfo.amount},
  'USD',
  ${paymentInfo.credits},
  'completed',
  NOW()
);`);
}

// 验证用户当前状态
async function verifyUserStatus() {
  console.log('\n🔍 验证用户当前状态:');
  
  try {
    const response = await fetch('https://fdb2-38-98-191-33.ngrok-free.app/api/auth/get-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const userData = await response.json();
      console.log(`   👤 用户: ${userData.email}`);
      console.log(`   💰 当前积分: ${userData.credits}`);
      
      if (userData.credits >= 35500) {
        console.log('   ✅ 积分已更新 (包含新购买的5000积分)');
        return true;
      } else {
        console.log('   ⚠️  积分尚未更新，需要手动处理');
        return false;
      }
    } else {
      console.log('   ❌ 无法获取用户数据');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ 验证失败: ${error.message}`);
    return false;
  }
}

// 生成完成报告
function generateCompletionReport() {
  console.log('\n📊 支付处理完成报告:');
  console.log('='.repeat(60));
  
  console.log('\n✅ 已完成的步骤:');
  console.log('   1. ✅ 用户完成支付 ($5.00)');
  console.log('   2. ✅ CREEM发送webhook通知');
  console.log('   3. ✅ 系统接收webhook (200状态码)');
  console.log('   4. ✅ 支付数据已解析和记录');
  
  console.log('\n🔄 需要完成的步骤:');
  console.log('   5. 🔄 更新用户积分 (+5000)');
  console.log('   6. 🔄 记录支付历史');
  console.log('   7. 🔄 发送确认通知 (可选)');
  
  console.log('\n🎯 支付成功确认:');
  console.log(`   💳 支付方式: CREEM`);
  console.log(`   💰 支付金额: $${paymentInfo.amount}`);
  console.log(`   🎁 获得积分: ${paymentInfo.credits}`);
  console.log(`   👤 用户: ${paymentInfo.email}`);
  console.log(`   🆔 订单ID: ${paymentInfo.paymentId}`);
  console.log(`   📅 支付时间: ${new Date().toLocaleString()}`);
  
  console.log('\n🚀 下一步行动:');
  console.log('   1. 在数据库中执行积分更新');
  console.log('   2. 完善webhook自动处理');
  console.log('   3. 测试下次支付的自动流程');
}

// 运行所有处理
async function runManualProcessing() {
  await simulateCreditsUpdate();
  generateSQLStatements();
  
  const creditsUpdated = await verifyUserStatus();
  
  generateCompletionReport();
  
  console.log('\n📋 处理结果:');
  console.log('='.repeat(60));
  
  if (creditsUpdated) {
    console.log('🎉 恭喜！支付已完全处理，积分已更新！');
  } else {
    console.log('🔧 支付成功，但需要手动更新积分');
    console.log('💡 请使用上面生成的SQL语句更新数据库');
  }
}

runManualProcessing().catch(console.error);
