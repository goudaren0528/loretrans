#!/usr/bin/env node

/**
 * 检查支付到账情况和发货状态
 */

require('dotenv').config({ path: '.env.local' });

console.log('🔍 检查支付到账和发货状态...\n');

async function checkPaymentDelivery() {
  try {
    const { createClient } = require('@supabase/supabase-js');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const userId = 'b7bee007-2a9f-4fb8-8020-10b707e2f4f4';
    
    // 1. 检查用户当前积分
    console.log('📊 1. 检查用户当前积分:');
    
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
    
    // 2. 检查最新的webhook日志
    console.log('\n📋 2. 检查最新webhook接收:');
    
    try {
      const fs = require('fs');
      const logContent = fs.readFileSync('/home/hwt/translation-low-source/logs/frontend.log', 'utf8');
      const webhookLines = logContent.split('\n').filter(line => line.includes('CREEM Webhook'));
      
      if (webhookLines.length > 0) {
        console.log('   📨 最近的webhook事件:');
        webhookLines.slice(-5).forEach(line => {
          console.log(`   ${line}`);
        });
      } else {
        console.log('   ⚠️  未找到最新的webhook事件');
      }
    } catch (logError) {
      console.log('   ❌ 读取日志失败:', logError.message);
    }
    
    // 3. 检查支付历史日志
    console.log('\n📋 3. 检查支付历史记录:');
    
    try {
      const fs = require('fs');
      const paymentLog = fs.readFileSync('/home/hwt/translation-low-source/payment-history.log', 'utf8');
      const paymentEntries = paymentLog.trim().split('\n');
      
      console.log(`   📝 支付记录数量: ${paymentEntries.length}`);
      
      if (paymentEntries.length > 0) {
        console.log('   💳 最新支付记录:');
        paymentEntries.slice(-2).forEach(entry => {
          try {
            const timestamp = entry.split(' - ')[0];
            const data = JSON.parse(entry.split(' - Payment Completed: ')[1]);
            console.log(`   📅 ${timestamp}`);
            console.log(`   💰 金额: $${data.amount} | 积分: ${data.credits_added} | 状态: ${data.status}`);
            console.log(`   🆔 支付ID: ${data.payment_id}`);
          } catch (parseError) {
            console.log(`   原始记录: ${entry}`);
          }
        });
      }
    } catch (logError) {
      console.log('   ❌ 读取支付历史失败:', logError.message);
    }
    
    // 4. 检查ngrok webhook接收
    console.log('\n📋 4. 检查ngrok webhook接收:');
    
    try {
      const response = await fetch('http://localhost:4040/api/requests/http', {
        timeout: 5000
      });
      
      if (response.ok) {
        const requests = await response.json();
        const webhookRequests = requests.filter(req => 
          req.uri && req.uri.includes('/api/webhook/creem')
        );
        
        console.log(`   📨 webhook请求数量: ${webhookRequests.length}`);
        
        if (webhookRequests.length > 0) {
          const latestWebhook = webhookRequests[webhookRequests.length - 1];
          console.log('   🕐 最新webhook时间:', new Date(latestWebhook.started_at).toLocaleString());
          console.log('   📊 响应状态:', latestWebhook.response?.status || 'N/A');
        }
      }
    } catch (ngrokError) {
      console.log('   ⚠️  无法访问ngrok API:', ngrokError.message);
    }
    
    // 5. 分析发货状态
    console.log('\n📋 5. 分析发货状态:');
    
    const expectedCredits = 35500; // 之前是30500，应该增加5000
    const actualCredits = currentUser.credits;
    
    if (actualCredits >= expectedCredits) {
      console.log('   ✅ 积分已到账，发货成功');
      console.log(`   📊 预期积分: ${expectedCredits}`);
      console.log(`   📊 实际积分: ${actualCredits}`);
    } else {
      console.log('   ❌ 积分未到账，可能发货失败');
      console.log(`   📊 预期积分: ${expectedCredits}`);
      console.log(`   📊 实际积分: ${actualCredits}`);
      console.log(`   📉 缺少积分: ${expectedCredits - actualCredits}`);
      
      // 检查可能的原因
      console.log('\n🔍 可能的失败原因:');
      console.log('   1. 新的支付webhook未被正确处理');
      console.log('   2. 数据库更新失败');
      console.log('   3. webhook处理器出现错误');
      console.log('   4. 支付可能被重复处理或回滚');
    }
    
    // 6. 生成修复建议
    console.log('\n🔧 修复建议:');
    
    if (actualCredits < expectedCredits) {
      console.log('   1. 检查最新的webhook事件');
      console.log('   2. 手动处理最新的支付');
      console.log('   3. 验证支付ID是否重复');
      console.log('   4. 检查webhook处理器错误日志');
    } else {
      console.log('   ✅ 积分正常，无需修复');
    }
    
  } catch (error) {
    console.error('❌ 检查过程失败:', error);
  }
}

checkPaymentDelivery();
