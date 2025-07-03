#!/usr/bin/env node

/**
 * 支付Webhook调试工具
 * 深入分析支付回调问题
 */

const fetch = require('node-fetch');
const fs = require('fs');

const NGROK_URL = 'https://33bb-38-98-190-191.ngrok-free.app';

async function debugPaymentWebhook() {
  console.log('🔍 支付Webhook深度调试\n');
  
  // 1. 检查ngrok隧道状态
  console.log('1️⃣ 检查ngrok隧道状态...');
  try {
    const ngrokApi = await fetch('http://localhost:4040/api/tunnels');
    const tunnels = await ngrokApi.json();
    
    console.log('✅ ngrok API响应正常');
    if (tunnels.tunnels && tunnels.tunnels.length > 0) {
      const tunnel = tunnels.tunnels[0];
      console.log(`   公网URL: ${tunnel.public_url}`);
      console.log(`   本地URL: ${tunnel.config.addr}`);
      console.log(`   连接数: ${tunnel.metrics.conns.count}`);
      console.log(`   HTTP请求数: ${tunnel.metrics.http.count}`);
    }
  } catch (error) {
    console.error('❌ ngrok API访问失败:', error.message);
  }
  
  // 2. 测试回调端点可访问性
  console.log('\n2️⃣ 测试回调端点可访问性...');
  const callbackUrl = `${NGROK_URL}/api/payment/success`;
  
  try {
    const response = await fetch(callbackUrl + '?test=1', {
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'User-Agent': 'Creem-Webhook-Test/1.0'
      },
      timeout: 10000
    });
    
    console.log(`✅ 回调端点可访问: ${response.status}`);
    
    if (response.status === 400) {
      console.log('   ℹ️  返回400是正常的（缺少必要参数）');
    }
  } catch (error) {
    console.error('❌ 回调端点访问失败:', error.message);
  }
  
  // 3. 分析最新的checkout请求
  console.log('\n3️⃣ 分析最新的checkout请求...');
  try {
    const logContent = fs.readFileSync('logs/frontend.log', 'utf8');
    const lines = logContent.split('\n');
    
    // 查找最新的checkout请求
    const checkoutLines = lines.filter(line => 
      line.includes('checkout') && line.includes('request_id')
    ).slice(-3);
    
    if (checkoutLines.length > 0) {
      console.log('📋 最近的checkout请求:');
      checkoutLines.forEach((line, i) => {
        console.log(`   ${i + 1}. ${line.trim()}`);
        
        // 提取request_id
        const requestIdMatch = line.match(/request_id=([^&\\s]+)/);
        if (requestIdMatch) {
          const requestId = decodeURIComponent(requestIdMatch[1]);
          console.log(`      Request ID: ${requestId}`);
          
          // 分析request_id格式
          const parts = requestId.split('_');
          if (parts.length >= 3) {
            console.log(`      用户ID: ${parts[0]}`);
            console.log(`      计划ID: ${parts[1]}`);
            console.log(`      时间戳: ${parts[2]} (${new Date(parseInt(parts[2])).toLocaleString()})`);
          }
        }
      });
    } else {
      console.log('⚠️  没有找到checkout请求记录');
    }
  } catch (error) {
    console.error('❌ 分析日志失败:', error.message);
  }
  
  // 4. 检查是否有任何支付成功回调
  console.log('\n4️⃣ 检查支付成功回调记录...');
  try {
    const logContent = fs.readFileSync('logs/frontend.log', 'utf8');
    const successCallbacks = logContent.split('\n').filter(line => 
      line.includes('/api/payment/success') && !line.includes('test')
    );
    
    if (successCallbacks.length > 0) {
      console.log('📋 真实的支付成功回调:');
      successCallbacks.forEach((line, i) => {
        console.log(`   ${i + 1}. ${line.trim()}`);
      });
    } else {
      console.log('❌ 没有找到真实的支付成功回调');
      console.log('   这说明Creem没有发送回调到我们的服务器');
    }
  } catch (error) {
    console.error('❌ 检查回调记录失败:', error.message);
  }
  
  // 5. 分析可能的问题
  console.log('\n5️⃣ 问题分析...');
  console.log('🔍 可能的原因:');
  console.log('   1. Creem测试环境不发送真实回调');
  console.log('   2. 支付没有真正完成（用户取消或失败）');
  console.log('   3. 回调URL被防火墙或安全策略阻止');
  console.log('   4. ngrok免费版的限制');
  console.log('   5. Creem回调有延迟');
  
  // 6. 建议的解决方案
  console.log('\n6️⃣ 建议的解决方案:');
  console.log('🔧 立即可行的方案:');
  console.log('   1. 检查Creem控制台的webhook日志');
  console.log('   2. 使用webhook测试工具验证端点');
  console.log('   3. 实现webhook重试机制');
  console.log('   4. 添加支付状态查询API');
  console.log('   5. 实现手动补发积分功能');
  
  // 7. 创建webhook测试URL
  console.log('\n7️⃣ Webhook测试URL:');
  const testParams = new URLSearchParams({
    checkout_id: 'test_checkout_' + Date.now(),
    order_id: 'test_order_' + Date.now(),
    product_id: 'prod_7ghOSJ2klCjPTjnURPbMoh',
    request_id: 'b7bee007-2a9f-4fb8-8020-10b707e2f4f4_basic_' + Date.now(),
    customer_id: 'b7bee007-2a9f-4fb8-8020-10b707e2f4f4'
  });
  
  const testUrl = `${NGROK_URL}/api/payment/success?${testParams.toString()}`;
  console.log('🔗 测试URL:');
  console.log(`   ${testUrl}`);
  console.log('');
  console.log('💡 您可以在浏览器中访问此URL来测试回调处理');
}

// 运行调试
debugPaymentWebhook().catch(console.error);
