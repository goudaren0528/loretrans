#!/usr/bin/env node

/**
 * 处理第二次支付
 */

require('dotenv').config({ path: '.env.local' });

console.log('🔍 检查和处理第二次支付...\n');

async function processSecondPayment() {
  try {
    const { createClient } = require('@supabase/supabase-js');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const userId = 'b7bee007-2a9f-4fb8-8020-10b707e2f4f4';
    
    // 1. 检查当前用户积分
    console.log('📊 1. 检查当前用户积分:');
    
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (userError) {
      console.error('   ❌ 获取用户数据失败:', userError);
      return;
    }
    
    console.log(`   👤 用户: ${currentUser.email}`);
    console.log(`   💰 当前积分: ${currentUser.credits}`);
    console.log(`   📅 最后更新: ${currentUser.updated_at}`);
    
    // 2. 分析第二次支付信息
    console.log('\n📋 2. 第二次支付信息:');
    
    const secondPaymentInfo = {
      userId: 'b7bee007-2a9f-4fb8-8020-10b707e2f4f4',
      email: 'hongwane322@gmail.com',
      planId: 'basic',
      credits: 5000,
      amount: 5.00,
      paymentId: 'ch_pT4iP7hdJLEVDNXsYZx6q',
      timestamp: '2025-07-02T07:21:21.683Z'
    };
    
    console.log(`   🆔 支付ID: ${secondPaymentInfo.paymentId}`);
    console.log(`   💰 支付金额: $${secondPaymentInfo.amount}`);
    console.log(`   🎁 应得积分: ${secondPaymentInfo.credits}`);
    console.log(`   📅 支付时间: ${secondPaymentInfo.timestamp}`);
    
    // 3. 检查是否已处理
    console.log('\n📋 3. 检查支付处理状态:');
    
    try {
      const fs = require('fs');
      const paymentLog = fs.readFileSync('/home/hwt/translation-low-source/payment-history.log', 'utf8');
      
      if (paymentLog.includes(secondPaymentInfo.paymentId)) {
        console.log('   ⚠️  第二次支付已在日志中，可能已处理');
      } else {
        console.log('   ❌ 第二次支付未在日志中，需要处理');
      }
    } catch (logError) {
      console.log('   ⚠️  无法读取支付日志');
    }
    
    // 4. 计算预期积分
    console.log('\n📋 4. 计算预期积分:');
    
    const firstPaymentCredits = 5000;  // 第一次支付
    const secondPaymentCredits = 5000; // 第二次支付
    const originalCredits = 30500;     // 原始积分
    
    const expectedTotalCredits = originalCredits + firstPaymentCredits + secondPaymentCredits;
    
    console.log(`   📊 原始积分: ${originalCredits}`);
    console.log(`   ➕ 第一次支付: +${firstPaymentCredits}`);
    console.log(`   ➕ 第二次支付: +${secondPaymentCredits}`);
    console.log(`   📊 预期总积分: ${expectedTotalCredits}`);
    console.log(`   📊 当前积分: ${currentUser.credits}`);
    console.log(`   📉 缺少积分: ${expectedTotalCredits - currentUser.credits}`);
    
    // 5. 处理第二次支付
    if (currentUser.credits < expectedTotalCredits) {
      console.log('\n🔧 5. 处理第二次支付积分:');
      
      const creditsToAdd = expectedTotalCredits - currentUser.credits;
      const newCredits = currentUser.credits + creditsToAdd;
      
      console.log(`   ➕ 需要添加积分: ${creditsToAdd}`);
      console.log(`   📊 更新后积分: ${newCredits}`);
      
      // 更新用户积分
      const { data: updateResult, error: updateError } = await supabase
        .from('users')
        .update({ 
          credits: newCredits,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select();
      
      if (updateError) {
        console.error('   ❌ 更新积分失败:', updateError);
      } else {
        console.log('   ✅ 积分更新成功');
        console.log('   📋 更新结果:', updateResult[0]);
        
        // 记录第二次支付
        try {
          const fs = require('fs');
          const logPath = '/home/hwt/translation-low-source/payment-history.log';
          const logEntry = `${new Date().toISOString()} - Payment Completed (Second): ${JSON.stringify(secondPaymentInfo)}\n`;
          
          fs.appendFileSync(logPath, logEntry);
          console.log('   📝 第二次支付已记录到日志');
        } catch (logError) {
          console.log('   ⚠️  日志记录失败:', logError.message);
        }
      }
    } else {
      console.log('\n✅ 5. 积分已正确，无需处理');
    }
    
    // 6. 最终验证
    console.log('\n📋 6. 最终验证:');
    
    const { data: finalUser, error: finalError } = await supabase
      .from('users')
      .select('credits, updated_at')
      .eq('id', userId)
      .single();
    
    if (finalError) {
      console.error('   ❌ 最终验证失败:', finalError);
    } else {
      console.log(`   💰 最终积分: ${finalUser.credits}`);
      console.log(`   📅 更新时间: ${finalUser.updated_at}`);
      
      if (finalUser.credits >= expectedTotalCredits) {
        console.log('   ✅ 两次支付积分全部到账！');
      } else {
        console.log('   ❌ 积分仍有缺失');
      }
    }
    
    // 7. 生成总结报告
    console.log('\n📊 支付处理总结:');
    console.log('='.repeat(60));
    
    console.log('\n💳 支付记录:');
    console.log('   第一次支付: ch_Talaw5HOl84xI5bjsbd3P (+5000积分)');
    console.log('   第二次支付: ch_pT4iP7hdJLEVDNXsYZx6q (+5000积分)');
    
    console.log('\n📊 积分变化:');
    console.log(`   原始积分: 30,500`);
    console.log(`   第一次后: 35,500 (+5,000)`);
    console.log(`   第二次后: ${finalUser.credits} (+${finalUser.credits - 35500})`);
    
    if (finalUser.credits >= 40500) {
      console.log('\n🎉 恭喜！两次支付都已成功处理！');
      console.log(`   总共获得: ${finalUser.credits - 30500} 积分`);
      console.log(`   当前可用: ${finalUser.credits} 积分`);
    }
    
  } catch (error) {
    console.error('❌ 处理第二次支付失败:', error);
  }
}

processSecondPayment();
