#!/usr/bin/env node

/**
 * 支付回调实时监控
 * 监控支付回调请求和积分变化
 */

const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

let lastLogSize = 0;
let lastTransactionCount = 0;

async function monitorPaymentCallbacks() {
  console.log('🔍 支付回调实时监控启动...\n');
  console.log('监控内容:');
  console.log('- 前端服务器日志中的支付回调');
  console.log('- 数据库中的积分交易记录');
  console.log('- 用户积分变化');
  console.log('\n按 Ctrl+C 停止监控\n');
  console.log('─'.repeat(60));

  // 获取初始状态
  try {
    const logStats = fs.statSync('logs/frontend.log');
    lastLogSize = logStats.size;
    
    const { data: transactions } = await supabase
      .from('credit_transactions')
      .select('id')
      .order('created_at', { ascending: false });
    
    lastTransactionCount = transactions ? transactions.length : 0;
    
    console.log(`📊 初始状态:`);
    console.log(`   日志文件大小: ${lastLogSize} bytes`);
    console.log(`   交易记录数: ${lastTransactionCount}`);
    console.log('─'.repeat(60));
    
  } catch (error) {
    console.error('❌ 获取初始状态失败:', error.message);
  }

  // 开始监控
  setInterval(async () => {
    await checkLogChanges();
    await checkTransactionChanges();
  }, 2000); // 每2秒检查一次
}

async function checkLogChanges() {
  try {
    const logStats = fs.statSync('logs/frontend.log');
    
    if (logStats.size > lastLogSize) {
      // 读取新增的日志内容
      const stream = fs.createReadStream('logs/frontend.log', {
        start: lastLogSize,
        end: logStats.size
      });
      
      let newContent = '';
      stream.on('data', (chunk) => {
        newContent += chunk.toString();
      });
      
      stream.on('end', () => {
        // 检查是否包含支付相关的日志
        const paymentLines = newContent.split('\n').filter(line => 
          line.includes('payment') || 
          line.includes('checkout') || 
          line.includes('success') ||
          line.includes('credits')
        );
        
        if (paymentLines.length > 0) {
          console.log(`\n🔔 [${new Date().toLocaleTimeString()}] 检测到支付相关日志:`);
          paymentLines.forEach(line => {
            if (line.trim()) {
              console.log(`   📝 ${line.trim()}`);
            }
          });
          console.log('─'.repeat(60));
        }
      });
      
      lastLogSize = logStats.size;
    }
  } catch (error) {
    // 日志文件可能不存在或无法访问
  }
}

async function checkTransactionChanges() {
  try {
    const { data: transactions, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ 获取交易记录失败:', error.message);
      return;
    }
    
    const currentCount = transactions ? transactions.length : 0;
    
    if (currentCount > lastTransactionCount) {
      const newTransactions = transactions.slice(0, currentCount - lastTransactionCount);
      
      console.log(`\n💰 [${new Date().toLocaleTimeString()}] 检测到新的积分交易:`);
      
      for (const tx of newTransactions) {
        // 获取用户信息
        const { data: user } = await supabase
          .from('users')
          .select('email')
          .eq('id', tx.user_id)
          .single();
        
        console.log(`   🪙 用户: ${user?.email || tx.user_id}`);
        console.log(`      类型: ${tx.type}`);
        console.log(`      数量: ${tx.amount} 积分`);
        console.log(`      余额: ${tx.balance} 积分`);
        console.log(`      描述: ${tx.description}`);
        console.log(`      时间: ${tx.created_at}`);
        
        if (tx.metadata) {
          console.log(`      元数据: ${JSON.stringify(tx.metadata)}`);
        }
        console.log('');
      }
      
      console.log('─'.repeat(60));
      lastTransactionCount = currentCount;
    }
  } catch (error) {
    console.error('❌ 检查交易变化失败:', error.message);
  }
}

// 优雅退出
process.on('SIGINT', () => {
  console.log('\n\n🛑 监控已停止');
  process.exit(0);
});

// 启动监控
monitorPaymentCallbacks();
