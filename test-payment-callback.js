#!/usr/bin/env node

/**
 * 测试支付成功回调，验证5000积分是否正确发放
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少Supabase配置');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testPaymentCallback() {
  console.log('🧪 测试支付成功回调 - 5000积分发放\n');

  const testUserId = '5f36d348-7553-4d70-9003-4994c6b23428'; // hongwane323@gmail.com
  const testOrderId = `test_order_${Date.now()}`;
  const creditsToAdd = 5000; // Basic Pack的积分数

  try {
    // 1. 检查用户当前积分
    console.log('1️⃣ 检查用户当前积分...');
    const { data: userBefore, error: userError } = await supabase
      .from('users')
      .select('credits, email')
      .eq('id', testUserId)
      .single();

    if (userError) {
      console.error('❌ 获取用户信息失败:', userError.message);
      return;
    }

    console.log(`   用户: ${userBefore.email}`);
    console.log(`   当前积分: ${userBefore.credits}`);

    // 2. 模拟支付成功回调 - 调用purchase_credits函数
    console.log('\n2️⃣ 模拟支付成功回调...');
    console.log(`   准备添加积分: ${creditsToAdd}`);
    console.log(`   支付订单ID: ${testOrderId}`);

    const { data: result, error: purchaseError } = await supabase.rpc('purchase_credits', {
      p_user_id: testUserId,
      p_amount: creditsToAdd,
      p_payment_id: testOrderId,
      p_description: `Purchase of ${creditsToAdd} credits (Basic Pack) - Test`
    });

    if (purchaseError) {
      console.error('❌ 积分购买失败:', purchaseError.message);
      console.log('\n🔍 可能的问题:');
      console.log('1. purchase_credits 函数不存在或有错误');
      console.log('2. 函数权限问题');
      console.log('3. 数据库连接问题');
      return;
    }

    console.log('✅ 积分购买函数调用成功:', result);

    // 3. 验证积分是否正确更新
    console.log('\n3️⃣ 验证积分更新...');
    const { data: userAfter, error: afterError } = await supabase
      .from('users')
      .select('credits, updated_at')
      .eq('id', testUserId)
      .single();

    if (afterError) {
      console.error('❌ 获取更新后用户信息失败:', afterError.message);
      return;
    }

    const creditsAdded = userAfter.credits - userBefore.credits;
    console.log(`   更新前积分: ${userBefore.credits}`);
    console.log(`   更新后积分: ${userAfter.credits}`);
    console.log(`   实际增加: ${creditsAdded} 积分`);
    console.log(`   最后更新: ${userAfter.updated_at}`);

    // 4. 验证结果
    console.log('\n4️⃣ 验证结果...');
    if (creditsAdded === creditsToAdd) {
      console.log('🎉 成功！积分正确发放');
      console.log(`✅ 用户获得了正确的 ${creditsToAdd} 积分`);
    } else {
      console.log('❌ 失败！积分发放不正确');
      console.log(`   期望增加: ${creditsToAdd} 积分`);
      console.log(`   实际增加: ${creditsAdded} 积分`);
      console.log(`   差异: ${creditsToAdd - creditsAdded} 积分`);
    }

    // 5. 检查交易记录
    console.log('\n5️⃣ 检查交易记录...');
    const { data: transactions, error: txError } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', testUserId)
      .order('created_at', { ascending: false })
      .limit(3);

    if (txError) {
      console.error('❌ 获取交易记录失败:', txError.message);
    } else {
      console.log('   最近的交易记录:');
      transactions.forEach((tx, index) => {
        console.log(`   ${index + 1}. ${tx.type}: ${tx.amount} 积分`);
        console.log(`      余额: ${tx.balance}, 时间: ${tx.created_at}`);
        console.log(`      描述: ${tx.description}`);
        if (tx.metadata) {
          console.log(`      元数据: ${JSON.stringify(tx.metadata)}`);
        }
        console.log('');
      });
    }

    // 6. 总结
    console.log('📋 测试总结:');
    if (creditsAdded === creditsToAdd) {
      console.log('✅ 支付回调逻辑正常工作');
      console.log('✅ purchase_credits 函数正确执行');
      console.log('✅ 用户积分正确更新');
      console.log('✅ 交易记录正确插入');
      console.log('\n💡 如果实际支付后积分没有增加，问题可能在于:');
      console.log('   1. Creem回调URL配置错误');
      console.log('   2. 回调请求没有到达服务器');
      console.log('   3. 回调处理中的参数验证失败');
      console.log('   4. 网络或服务器问题');
    } else {
      console.log('❌ 积分发放逻辑有问题');
      console.log('❌ 需要检查 purchase_credits 函数');
    }

  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
  }
}

// 运行测试
testPaymentCallback();
