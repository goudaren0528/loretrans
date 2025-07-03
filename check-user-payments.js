#!/usr/bin/env node

/**
 * 检查用户支付情况
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUserPayments() {
  console.log('🔍 检查用户支付情况...\n');

  try {
    // 1. 检查所有用户
    console.log('1️⃣ 检查所有用户...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('updated_at', { ascending: false });

    if (usersError) {
      console.error('   ❌ 获取用户失败:', usersError.message);
    } else {
      console.log(`   ✅ 找到 ${users.length} 个用户:`);
      users.forEach(user => {
        console.log(`      👤 ${user.email}: ${user.credits} 积分 (ID: ${user.id})`);
        console.log(`         角色: ${user.role}, 邮箱验证: ${user.email_verified}`);
        console.log(`         创建: ${user.created_at}, 更新: ${user.updated_at}`);
        console.log('');
      });
    }

    // 2. 检查支付记录
    console.log('2️⃣ 检查支付记录...');
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (paymentsError) {
      console.error('   ❌ 获取支付记录失败:', paymentsError.message);
    } else if (payments.length === 0) {
      console.log('   ⚠️  没有找到任何支付记录');
      console.log('   💡 这可能是问题所在：支付完成但没有记录到数据库');
    } else {
      console.log(`   ✅ 找到 ${payments.length} 条支付记录:`);
      payments.forEach(payment => {
        console.log(`      💳 支付ID: ${payment.id}`);
        console.log(`         用户: ${payment.user_id}`);
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
      .order('created_at', { ascending: false });

    if (transactionsError) {
      console.error('   ❌ 获取交易记录失败:', transactionsError.message);
    } else {
      console.log(`   ✅ 找到 ${transactions.length} 条积分交易:`);
      transactions.forEach(tx => {
        console.log(`      🪙 交易ID: ${tx.id}`);
        console.log(`         用户: ${tx.user_id}`);
        console.log(`         类型: ${tx.type}, 数量: ${tx.amount}`);
        console.log(`         余额: ${tx.balance}`);
        console.log(`         描述: ${tx.description}`);
        console.log(`         时间: ${tx.created_at}`);
        if (tx.metadata) {
          console.log(`         元数据: ${JSON.stringify(tx.metadata)}`);
        }
        console.log('');
      });
    }

    // 4. 检查特定用户的详细情况
    console.log('4️⃣ 检查目标用户详细情况...');
    const targetEmail = 'hongwane323@gmail.com';
    
    const { data: targetUser, error: targetUserError } = await supabase
      .from('users')
      .select('*')
      .eq('email', targetEmail)
      .single();

    if (targetUserError) {
      console.error(`   ❌ 找不到用户 ${targetEmail}:`, targetUserError.message);
    } else {
      console.log(`   ✅ 目标用户 ${targetEmail}:`);
      console.log(`      ID: ${targetUser.id}`);
      console.log(`      当前积分: ${targetUser.credits}`);
      console.log(`      角色: ${targetUser.role}`);
      console.log(`      最后更新: ${targetUser.updated_at}`);

      // 检查该用户的支付记录
      const { data: userPayments } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', targetUser.id);

      console.log(`      支付记录数: ${userPayments?.length || 0}`);

      // 检查该用户的积分交易
      const { data: userTransactions } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', targetUser.id);

      console.log(`      积分交易数: ${userTransactions?.length || 0}`);
      if (userTransactions && userTransactions.length > 0) {
        userTransactions.forEach(tx => {
          console.log(`        - ${tx.type}: ${tx.amount} 积分 (${tx.created_at})`);
        });
      }
    }

    console.log('\n📋 问题分析:');
    if (payments.length === 0) {
      console.log('❌ 主要问题：没有任何支付记录');
      console.log('   可能原因：');
      console.log('   1. Creem回调没有到达 /api/payment/success');
      console.log('   2. 回调到达但处理失败');
      console.log('   3. 数据库写入失败');
      console.log('   4. 支付实际上没有完成');
    } else {
      console.log('✅ 有支付记录，需要检查积分是否正确更新');
    }

  } catch (error) {
    console.error('❌ 检查过程中出现错误:', error.message);
  }
}

checkUserPayments();
