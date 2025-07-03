#!/usr/bin/env node

/**
 * 完成支付处理：更新用户积分和记录支付历史
 */

require('dotenv').config({ path: '.env.local' });

console.log('🔄 完成支付处理...\n');

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

// 初始化Supabase客户端
async function initSupabase() {
  const { createClient } = require('@supabase/supabase-js');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase配置缺失');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

// 步骤5: 更新用户积分
async function updateUserCredits(supabase) {
  console.log('📊 步骤5: 更新用户积分 (+5000)');
  
  try {
    // 获取当前用户积分
    const { data: currentUser, error: fetchError } = await supabase
      .from('user_profiles')
      .select('credits')
      .eq('id', paymentInfo.userId)
      .single();
    
    if (fetchError) {
      console.error('   ❌ 获取用户当前积分失败:', fetchError);
      return false;
    }
    
    const currentCredits = currentUser?.credits || 0;
    const newCredits = currentCredits + paymentInfo.credits;
    
    console.log(`   📊 当前积分: ${currentCredits}`);
    console.log(`   ➕ 添加积分: ${paymentInfo.credits}`);
    console.log(`   📊 更新后积分: ${newCredits}`);
    
    // 更新用户积分
    const { data: updateResult, error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        credits: newCredits,
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentInfo.userId)
      .select();
    
    if (updateError) {
      console.error('   ❌ 更新用户积分失败:', updateError);
      return false;
    }
    
    console.log('   ✅ 用户积分更新成功');
    console.log('   📋 更新结果:', updateResult);
    
    return true;
    
  } catch (error) {
    console.error('   ❌ 更新用户积分异常:', error);
    return false;
  }
}

// 步骤6: 记录支付历史
async function recordPaymentHistory(supabase) {
  console.log('\n💾 步骤6: 记录支付历史');
  
  try {
    // 检查是否已存在该支付记录
    const { data: existingRecord, error: checkError } = await supabase
      .from('payment_history')
      .select('id')
      .eq('payment_id', paymentInfo.paymentId)
      .single();
    
    if (existingRecord) {
      console.log('   ⚠️  支付记录已存在，跳过插入');
      return true;
    }
    
    // 插入支付历史记录
    const paymentRecord = {
      user_id: paymentInfo.userId,
      plan_id: paymentInfo.planId,
      payment_id: paymentInfo.paymentId,
      payment_method: 'creem',
      amount: paymentInfo.amount,
      currency: 'USD',
      credits_added: paymentInfo.credits,
      status: 'completed',
      webhook_event_id: paymentInfo.eventId,
      metadata: {
        userEmail: paymentInfo.email,
        planName: 'Basic Pack',
        processingMethod: 'manual'
      },
      created_at: new Date().toISOString()
    };
    
    console.log('   📝 插入支付记录:', paymentRecord);
    
    const { data: insertResult, error: insertError } = await supabase
      .from('payment_history')
      .insert(paymentRecord)
      .select();
    
    if (insertError) {
      console.error('   ❌ 插入支付历史失败:', insertError);
      return false;
    }
    
    console.log('   ✅ 支付历史记录成功');
    console.log('   📋 插入结果:', insertResult);
    
    return true;
    
  } catch (error) {
    console.error('   ❌ 记录支付历史异常:', error);
    return false;
  }
}

// 验证处理结果
async function verifyProcessingResult(supabase) {
  console.log('\n🔍 验证处理结果:');
  
  try {
    // 验证用户积分
    const { data: userProfile, error: userError } = await supabase
      .from('user_profiles')
      .select('credits, email')
      .eq('id', paymentInfo.userId)
      .single();
    
    if (userError) {
      console.error('   ❌ 验证用户积分失败:', userError);
    } else {
      console.log(`   👤 用户: ${userProfile.email}`);
      console.log(`   💰 当前积分: ${userProfile.credits}`);
      
      if (userProfile.credits >= 35500) {
        console.log('   ✅ 积分更新验证成功');
      } else {
        console.log('   ⚠️  积分可能未正确更新');
      }
    }
    
    // 验证支付历史
    const { data: paymentHistory, error: historyError } = await supabase
      .from('payment_history')
      .select('*')
      .eq('payment_id', paymentInfo.paymentId)
      .single();
    
    if (historyError) {
      console.error('   ❌ 验证支付历史失败:', historyError);
    } else {
      console.log('   ✅ 支付历史记录验证成功');
      console.log('   📋 支付记录:', {
        id: paymentHistory.id,
        amount: paymentHistory.amount,
        credits_added: paymentHistory.credits_added,
        status: paymentHistory.status,
        created_at: paymentHistory.created_at
      });
    }
    
    return true;
    
  } catch (error) {
    console.error('   ❌ 验证处理结果异常:', error);
    return false;
  }
}

// 生成完成报告
function generateCompletionReport(creditsUpdated, historyRecorded) {
  console.log('\n📊 支付处理完成报告:');
  console.log('='.repeat(60));
  
  console.log('\n✅ 处理结果:');
  console.log(`   5. 更新用户积分: ${creditsUpdated ? '✅ 完成' : '❌ 失败'}`);
  console.log(`   6. 记录支付历史: ${historyRecorded ? '✅ 完成' : '❌ 失败'}`);
  
  if (creditsUpdated && historyRecorded) {
    console.log('\n🎉 支付处理完全成功！');
    console.log('\n📋 处理详情:');
    console.log(`   💳 支付方式: CREEM`);
    console.log(`   💰 支付金额: $${paymentInfo.amount}`);
    console.log(`   🎁 添加积分: ${paymentInfo.credits}`);
    console.log(`   👤 用户: ${paymentInfo.email}`);
    console.log(`   🆔 订单ID: ${paymentInfo.paymentId}`);
    console.log(`   📅 处理时间: ${new Date().toLocaleString()}`);
    
    console.log('\n🚀 后续步骤:');
    console.log('   1. ✅ 用户可以正常使用新积分');
    console.log('   2. ✅ 支付记录已保存到数据库');
    console.log('   3. 🔄 完善webhook自动处理机制');
    console.log('   4. 🔄 测试下次支付的自动流程');
    
  } else {
    console.log('\n⚠️  部分处理失败，请检查错误信息');
  }
}

// 主处理函数
async function completePaymentProcessing() {
  try {
    console.log('🔧 初始化数据库连接...');
    const supabase = await initSupabase();
    console.log('✅ 数据库连接成功\n');
    
    // 执行步骤5和6
    const creditsUpdated = await updateUserCredits(supabase);
    const historyRecorded = await recordPaymentHistory(supabase);
    
    // 验证结果
    if (creditsUpdated && historyRecorded) {
      await verifyProcessingResult(supabase);
    }
    
    // 生成报告
    generateCompletionReport(creditsUpdated, historyRecorded);
    
  } catch (error) {
    console.error('❌ 支付处理失败:', error);
    console.log('\n💡 可能的解决方案:');
    console.log('   1. 检查Supabase配置');
    console.log('   2. 确认数据库表结构');
    console.log('   3. 验证用户ID和支付ID');
  }
}

// 运行处理
completePaymentProcessing();
