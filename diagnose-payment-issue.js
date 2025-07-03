#!/usr/bin/env node

/**
 * 支付问题诊断脚本
 * 检查支付后没有发货的问题
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

async function diagnosePaymentIssue() {
  console.log('🔍 支付问题诊断开始...\n');

  try {
    // 1. 检查用户信息
    console.log('1️⃣ 检查用户信息...');
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('id, email, credits, created_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(5);

    if (usersError) {
      console.error('   ❌ 获取用户信息失败:', usersError.message);
    } else {
      console.log('   ✅ 最近的用户:');
      users.forEach(user => {
        console.log(`      📧 ${user.email}: ${user.credits} 积分 (更新: ${user.updated_at})`);
      });
    }

    // 2. 检查支付记录
    console.log('\n2️⃣ 检查支付记录...');
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (paymentsError) {
      console.error('   ❌ 获取支付记录失败:', paymentsError.message);
    } else if (payments.length === 0) {
      console.log('   ⚠️  没有找到支付记录');
    } else {
      console.log('   ✅ 最近的支付记录:');
      payments.forEach(payment => {
        console.log(`      💳 用户: ${payment.user_id}`);
        console.log(`         金额: $${payment.amount}, 积分: ${payment.credits}`);
        console.log(`         状态: ${payment.status}`);
        console.log(`         Creem ID: ${payment.creem_payment_id}`);
        console.log(`         时间: ${payment.created_at}`);
        console.log('');
      });
    }

    // 3. 检查积分交易记录
    console.log('3️⃣ 检查积分交易记录...');
    const { data: transactions, error: transactionsError } = await supabase
      .from('credit_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (transactionsError) {
      console.error('   ❌ 获取交易记录失败:', transactionsError.message);
    } else if (transactions.length === 0) {
      console.log('   ⚠️  没有找到积分交易记录');
    } else {
      console.log('   ✅ 最近的积分交易:');
      transactions.forEach(tx => {
        console.log(`      🪙 用户: ${tx.user_id}`);
        console.log(`         类型: ${tx.type}, 数量: ${tx.amount}`);
        console.log(`         描述: ${tx.description}`);
        console.log(`         时间: ${tx.created_at}`);
        if (tx.metadata) {
          console.log(`         元数据: ${JSON.stringify(tx.metadata)}`);
        }
        console.log('');
      });
    }

    // 4. 检查数据库函数
    console.log('4️⃣ 检查数据库函数...');
    const { data: functions, error: functionsError } = await supabase
      .rpc('add_credits_on_purchase', {
        p_user_id: '00000000-0000-0000-0000-000000000000', // 测试UUID
        p_credits_to_add: 0,
        p_amount_paid_usd: 0,
        p_creem_charge_id: 'test_charge_id',
        p_payment_metadata: {}
      });

    if (functionsError) {
      if (functionsError.message.includes('User not found')) {
        console.log('   ✅ 数据库函数存在且工作正常');
      } else {
        console.error('   ❌ 数据库函数错误:', functionsError.message);
      }
    } else {
      console.log('   ✅ 数据库函数测试成功');
    }

    // 5. 检查特定用户的支付情况
    console.log('\n5️⃣ 检查特定用户支付情况...');
    const testEmail = 'hongwane323@gmail.com';
    
    const { data: testUser, error: testUserError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', testEmail)
      .single();

    if (testUserError) {
      console.error(`   ❌ 找不到用户 ${testEmail}:`, testUserError.message);
    } else {
      console.log(`   ✅ 用户 ${testEmail}:`);
      console.log(`      ID: ${testUser.id}`);
      console.log(`      积分: ${testUser.credits}`);
      console.log(`      创建时间: ${testUser.created_at}`);
      console.log(`      更新时间: ${testUser.updated_at}`);

      // 检查该用户的支付记录
      const { data: userPayments, error: userPaymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', testUser.id)
        .order('created_at', { ascending: false });

      if (userPaymentsError) {
        console.error('   ❌ 获取用户支付记录失败:', userPaymentsError.message);
      } else if (userPayments.length === 0) {
        console.log('   ⚠️  该用户没有支付记录');
      } else {
        console.log(`   💳 该用户的支付记录 (${userPayments.length} 条):`);
        userPayments.forEach(payment => {
          console.log(`      - $${payment.amount} → ${payment.credits} 积分 (${payment.status})`);
          console.log(`        Creem ID: ${payment.creem_payment_id}`);
          console.log(`        时间: ${payment.created_at}`);
        });
      }

      // 检查该用户的积分交易记录
      const { data: userTransactions, error: userTransactionsError } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', testUser.id)
        .order('created_at', { ascending: false });

      if (userTransactionsError) {
        console.error('   ❌ 获取用户交易记录失败:', userTransactionsError.message);
      } else if (userTransactions.length === 0) {
        console.log('   ⚠️  该用户没有积分交易记录');
      } else {
        console.log(`   🪙 该用户的积分交易记录 (${userTransactions.length} 条):`);
        userTransactions.forEach(tx => {
          console.log(`      - ${tx.type}: ${tx.amount} 积分`);
          console.log(`        描述: ${tx.description}`);
          console.log(`        时间: ${tx.created_at}`);
          if (tx.metadata && tx.metadata.creemChargeId) {
            console.log(`        Creem ID: ${tx.metadata.creemChargeId}`);
          }
        });
      }
    }

    console.log('\n📋 诊断总结:');
    console.log('1. 检查是否有支付记录但没有对应的积分增加');
    console.log('2. 检查Creem回调是否正确到达API');
    console.log('3. 检查数据库函数是否正确执行');
    console.log('4. 检查是否有重复处理的问题');

    console.log('\n🔧 可能的问题:');
    console.log('- Creem回调URL配置错误');
    console.log('- 支付成功但回调失败');
    console.log('- 数据库函数执行失败');
    console.log('- 签名验证失败');
    console.log('- 网络问题导致回调丢失');

  } catch (error) {
    console.error('❌ 诊断过程中出现错误:', error.message);
  }
}

// 运行诊断
diagnosePaymentIssue();
