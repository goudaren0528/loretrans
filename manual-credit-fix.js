#!/usr/bin/env node

/**
 * 手动补发积分脚本
 * 用于修复支付成功但积分未发放的问题
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

// 商品配置
const PRICING_PLANS = [
  {
    id: 'basic',
    name: 'Basic Pack',
    credits: 5000,
    priceUSD: 5,
  }
];

async function manualCreditFix() {
  console.log('🔧 手动积分补发工具\n');

  // 配置参数
  const targetEmail = 'hongwane323@gmail.com'; // 目标用户邮箱
  const planId = 'basic'; // 购买的商品ID
  const paymentReference = `manual_fix_${Date.now()}`; // 支付参考号

  try {
    // 1. 查找用户
    console.log('1️⃣ 查找目标用户...');
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', targetEmail)
      .single();

    if (userError) {
      console.error('❌ 找不到用户:', userError.message);
      return;
    }

    console.log(`✅ 找到用户: ${user.email} (ID: ${user.id})`);
    console.log(`   当前积分: ${user.credits}`);

    // 2. 查找商品配置
    console.log('\n2️⃣ 查找商品配置...');
    const plan = PRICING_PLANS.find(p => p.id === planId);
    
    if (!plan) {
      console.error('❌ 找不到商品配置:', planId);
      return;
    }

    console.log(`✅ 商品配置: ${plan.name}`);
    console.log(`   积分数量: ${plan.credits}`);
    console.log(`   价格: $${plan.priceUSD}`);

    // 3. 确认操作
    console.log('\n3️⃣ 准备补发积分...');
    console.log(`📋 操作详情:`);
    console.log(`   用户: ${user.email}`);
    console.log(`   当前积分: ${user.credits}`);
    console.log(`   补发积分: ${plan.credits}`);
    console.log(`   补发后积分: ${user.credits + plan.credits}`);
    console.log(`   支付参考: ${paymentReference}`);

    // 4. 执行积分补发
    console.log('\n4️⃣ 执行积分补发...');
    
    const { data: result, error: creditError } = await supabase.rpc('purchase_credits', {
      p_user_id: user.id,
      p_amount: plan.credits,
      p_payment_id: paymentReference,
      p_description: `Manual credit fix for ${plan.name} - Payment callback issue resolved`
    });

    if (creditError) {
      console.error('❌ 积分补发失败:', creditError.message);
      return;
    }

    console.log('✅ 积分补发成功:', result);

    // 5. 验证结果
    console.log('\n5️⃣ 验证补发结果...');
    
    const { data: updatedUser, error: verifyError } = await supabase
      .from('users')
      .select('credits, updated_at')
      .eq('id', user.id)
      .single();

    if (verifyError) {
      console.error('❌ 验证失败:', verifyError.message);
      return;
    }

    const creditsAdded = updatedUser.credits - user.credits;
    console.log(`📊 补发结果:`);
    console.log(`   补发前积分: ${user.credits}`);
    console.log(`   补发后积分: ${updatedUser.credits}`);
    console.log(`   实际增加: ${creditsAdded} 积分`);
    console.log(`   更新时间: ${updatedUser.updated_at}`);

    // 6. 检查交易记录
    console.log('\n6️⃣ 检查交易记录...');
    
    const { data: transactions, error: txError } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3);

    if (txError) {
      console.error('❌ 获取交易记录失败:', txError.message);
    } else {
      console.log('📋 最新交易记录:');
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

    // 7. 总结
    console.log('🎉 积分补发完成！');
    console.log('\n📋 操作总结:');
    if (creditsAdded === plan.credits) {
      console.log('✅ 积分补发成功');
      console.log(`✅ 用户 ${user.email} 获得了 ${plan.credits} 积分`);
      console.log(`✅ 当前总积分: ${updatedUser.credits}`);
      console.log('✅ 交易记录已正确记录');
    } else {
      console.log('❌ 积分补发可能有问题');
      console.log(`   期望增加: ${plan.credits} 积分`);
      console.log(`   实际增加: ${creditsAdded} 积分`);
    }

    console.log('\n💡 后续建议:');
    console.log('1. 通知用户积分已补发');
    console.log('2. 修复回调URL配置以避免未来问题');
    console.log('3. 考虑部署到公网环境进行测试');

  } catch (error) {
    console.error('❌ 操作过程中出现错误:', error.message);
  }
}

// 运行修复
manualCreditFix();
