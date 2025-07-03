#!/usr/bin/env node

/**
 * 检查和处理第三次支付
 */

require('dotenv').config({ path: '.env.local' });

console.log('🔍 检查第三次支付状态...\n');

async function processThirdPayment() {
  try {
    const { createClient } = require('@supabase/supabase-js');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const userId = 'b7bee007-2a9f-4fb8-8020-10b707e2f4f4';
    
    // 1. 检查当前用户积分
    console.log('📊 1. 检查当前数据库积分:');
    
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
    
    // 2. 分析所有支付记录
    console.log('\n📋 2. 所有支付记录分析:');
    
    const allPayments = [
      { id: 'ch_Talaw5HOl84xI5bjsbd3P', credits: 5000, status: '已处理', timestamp: '2025-07-02T06:59:43.628Z' },
      { id: 'ch_pT4iP7hdJLEVDNXsYZx6q', credits: 5000, status: '已处理', timestamp: '2025-07-02T07:21:21.683Z' },
      { id: 'ch_6BiWBCCO51YIIcfFapQ1S3', credits: 5000, status: '待处理', timestamp: '2025-07-02T07:48:57.868Z' }
    ];
    
    console.log('   支付历史:');
    allPayments.forEach((payment, index) => {
      console.log(`   ${index + 1}. ${payment.id} - ${payment.credits}积分 - ${payment.status}`);
    });
    
    // 3. 计算预期积分
    console.log('\n📋 3. 积分计算:');
    
    const originalCredits = 30500;
    const totalPaidCredits = allPayments.reduce((sum, payment) => sum + payment.credits, 0);
    const expectedTotalCredits = originalCredits + totalPaidCredits;
    
    console.log(`   📊 原始积分: ${originalCredits}`);
    console.log(`   ➕ 总支付积分: ${totalPaidCredits} (3次 × 5000)`);
    console.log(`   📊 预期总积分: ${expectedTotalCredits}`);
    console.log(`   📊 当前积分: ${currentUser.credits}`);
    console.log(`   📉 缺少积分: ${expectedTotalCredits - currentUser.credits}`);
    
    // 4. 处理第三次支付
    if (currentUser.credits < expectedTotalCredits) {
      console.log('\n🔧 4. 处理第三次支付:');
      
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
        
        // 记录第三次支付
        try {
          const fs = require('fs');
          const logPath = '/home/hwt/translation-low-source/payment-history.log';
          const logEntry = `${new Date().toISOString()} - Payment Completed (Third): {"payment_id":"ch_6BiWBCCO51YIIcfFapQ1S3","user_id":"${userId}","credits":${creditsToAdd},"amount":5.00,"status":"completed"}\n`;
          
          fs.appendFileSync(logPath, logEntry);
          console.log('   📝 第三次支付已记录到日志');
        } catch (logError) {
          console.log('   ⚠️  日志记录失败:', logError.message);
        }
      }
    } else {
      console.log('\n✅ 4. 积分已正确，无需处理');
    }
    
    // 5. 最终验证
    console.log('\n📋 5. 最终验证:');
    
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
        console.log('   ✅ 三次支付积分全部到账！');
      } else {
        console.log('   ❌ 积分仍有缺失');
      }
    }
    
    // 6. 检查前端API
    console.log('\n📋 6. 测试前端API:');
    
    try {
      const apiResponse = await fetch('https://fdb2-38-98-191-33.ngrok-free.app/api/auth/get-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userId
        })
      });
      
      if (apiResponse.ok) {
        const apiData = await apiResponse.json();
        console.log(`   📊 API返回积分: ${apiData.credits}`);
        
        if (apiData.credits === finalUser.credits) {
          console.log('   ✅ 数据库和API积分一致');
        } else {
          console.log('   ⚠️  数据库和API积分不一致');
          console.log(`   📊 数据库: ${finalUser.credits}`);
          console.log(`   📊 API: ${apiData.credits}`);
        }
      } else {
        const errorText = await apiResponse.text();
        console.log('   ❌ API调用失败:', errorText);
      }
    } catch (apiError) {
      console.log('   ❌ API测试失败:', apiError.message);
    }
    
    // 7. 生成总结报告
    console.log('\n📊 支付处理总结:');
    console.log('='.repeat(60));
    
    console.log('\n💳 所有支付记录:');
    console.log('   第一次: ch_Talaw5HOl84xI5bjsbd3P (+5000积分) ✅');
    console.log('   第二次: ch_pT4iP7hdJLEVDNXsYZx6q (+5000积分) ✅');
    console.log('   第三次: ch_6BiWBCCO51YIIcfFapQ1S3 (+5000积分) ✅');
    
    console.log('\n📊 积分变化历程:');
    console.log(`   原始积分: 30,500`);
    console.log(`   第一次后: 35,500 (+5,000)`);
    console.log(`   第二次后: 40,500 (+5,000)`);
    console.log(`   第三次后: ${finalUser.credits} (+${finalUser.credits - 40500})`);
    
    if (finalUser.credits >= 45500) {
      console.log('\n🎉 恭喜！三次支付都已成功处理！');
      console.log(`   总共获得: ${finalUser.credits - 30500} 积分`);
      console.log(`   当前可用: ${finalUser.credits} 积分`);
      
      console.log('\n🔧 前端显示问题排查:');
      console.log('   1. 清除浏览器缓存');
      console.log('   2. 强制刷新页面 (Ctrl+F5)');
      console.log('   3. 重新登录账户');
      console.log('   4. 检查浏览器控制台错误');
    } else {
      console.log('\n⚠️  积分处理可能有问题');
    }
    
  } catch (error) {
    console.error('❌ 处理第三次支付失败:', error);
  }
}

processThirdPayment();
