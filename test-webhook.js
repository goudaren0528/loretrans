#!/usr/bin/env node

/**
 * Webhook测试工具
 * 模拟Creem发送webhook到我们的端点
 */

const fetch = require('node-fetch');

const WEBHOOK_URL = 'https://be46-184-169-178-219.ngrok-free.app/api/webhooks/creem';

async function testWebhook() {
  console.log('🧪 测试Creem Webhook...\n');
  
  const userId = 'b7bee007-2a9f-4fb8-8020-10b707e2f4f4'; // hongwane322@gmail.com
  const testPayload = {
    event_type: 'payment.completed',
    data: {
      order_id: `webhook_test_${Date.now()}`,
      customer_email: 'hongwane322@gmail.com',
      customer_id: userId,
      product_id: 'prod_7ghOSJ2klCjPTjnURPbMoh',
      amount: 5.00,
      currency: 'USD',
      request_id: `${userId}_basic_${Date.now()}`,
      payment_status: 'completed'
    }
  };
  
  console.log('📋 测试数据:');
  console.log(JSON.stringify(testPayload, null, 2));
  console.log('');
  
  try {
    console.log('🚀 发送webhook请求...');
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Creem-Webhook/1.0',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(testPayload)
    });
    
    console.log(`📊 响应状态: ${response.status} ${response.statusText}`);
    
    const responseData = await response.json();
    console.log('📝 响应内容:', responseData);
    
    if (response.ok && responseData.processed) {
      console.log('✅ Webhook处理成功！');
      
      // 验证积分是否增加
      setTimeout(async () => {
        await verifyCredits(userId);
      }, 2000);
    } else {
      console.log('❌ Webhook处理失败');
    }
    
  } catch (error) {
    console.error('❌ Webhook测试失败:', error.message);
  }
}

async function verifyCredits(userId) {
  console.log('\n🔍 验证积分变化...');
  
  const { createClient } = require('@supabase/supabase-js');
  require('dotenv').config({ path: '.env.local' });

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('credits, updated_at')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('❌ 获取用户信息失败:', error.message);
      return;
    }
    
    console.log('📊 用户当前状态:');
    console.log(`   积分: ${user.credits}`);
    console.log(`   更新时间: ${user.updated_at}`);
    
    // 检查最新交易
    const { data: transactions } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);
      
    if (transactions && transactions.length > 0) {
      const tx = transactions[0];
      console.log('📋 最新交易:');
      console.log(`   类型: ${tx.type}`);
      console.log(`   数量: ${tx.amount} 积分`);
      console.log(`   余额: ${tx.balance} 积分`);
      console.log(`   时间: ${tx.created_at}`);
      console.log(`   描述: ${tx.description}`);
    }
    
  } catch (error) {
    console.error('❌ 验证积分失败:', error.message);
  }
}

// 运行测试
testWebhook();
