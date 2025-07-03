#!/usr/bin/env node

/**
 * 诊断支付回调URL配置问题
 */

// 直接定义配置，避免TypeScript导入问题
const PRICING_PLANS = [
  {
    id: 'free',
    name: 'Free Plan',
    description: 'Perfect for trying out our service',
    credits: 0,
    priceUSD: 0,
    creemPriceId: '',
    creemPaymentUrl: '',
    originalValue: 0,
    discount: 0,
    popular: false,
  },
  {
    id: 'basic',
    name: 'Basic Pack',
    description: 'Great for personal use',
    credits: 5000,
    priceUSD: 5,
    creemPriceId: 'prod_7ghOSJ2klCjPTjnURPbMoh',
    creemPaymentUrl: 'https://www.creem.io/test/payment/prod_7ghOSJ2klCjPTjnURPbMoh',
    originalValue: 5,
    discount: 0,
    popular: true,
  },
];

function diagnoseCallbackUrl() {
  console.log('🔍 诊断支付回调URL配置...\n');

  // 1. 检查定价配置
  console.log('1️⃣ 检查定价配置...');
  const basicPlan = PRICING_PLANS.find(p => p.id === 'basic');
  
  if (!basicPlan) {
    console.error('❌ 找不到Basic Pack配置');
    return;
  }

  console.log('✅ Basic Pack配置:');
  console.log(`   名称: ${basicPlan.name}`);
  console.log(`   积分: ${basicPlan.credits}`);
  console.log(`   价格: $${basicPlan.priceUSD}`);
  console.log(`   产品ID: ${basicPlan.creemPriceId}`);
  console.log(`   支付URL: ${basicPlan.creemPaymentUrl}`);

  // 2. 模拟回调URL构建
  console.log('\n2️⃣ 模拟回调URL构建...');
  
  const mockUserId = '5f36d348-7553-4d70-9003-4994c6b23428';
  const mockEmail = 'hongwane323@gmail.com';
  const planId = 'basic';
  const mockOrigin = 'http://localhost:3001'; // 假设的服务器地址
  
  const success_url = `${mockOrigin}/api/payment/success?plan=${planId}`;
  const cancel_url = `${mockOrigin}/pricing?purchase=canceled`;
  const request_id = `${mockUserId}_${planId}_${Date.now()}`;
  
  console.log('📋 构建的回调参数:');
  console.log(`   success_url: ${success_url}`);
  console.log(`   cancel_url: ${cancel_url}`);
  console.log(`   customer_email: ${mockEmail}`);
  console.log(`   request_id: ${request_id}`);

  // 3. 构建完整的支付URL
  console.log('\n3️⃣ 构建完整支付URL...');
  
  try {
    const paymentUrl = new URL(basicPlan.creemPaymentUrl);
    paymentUrl.searchParams.set('success_url', success_url);
    paymentUrl.searchParams.set('cancel_url', cancel_url);
    paymentUrl.searchParams.set('customer_email', mockEmail);
    paymentUrl.searchParams.set('request_id', request_id);
    
    console.log('✅ 完整支付URL:');
    console.log(`   ${paymentUrl.toString()}`);
    
    // 4. 分析可能的问题
    console.log('\n4️⃣ 分析可能的问题...');
    
    const urlParams = paymentUrl.searchParams;
    console.log('📋 URL参数检查:');
    console.log(`   success_url: ${urlParams.get('success_url')}`);
    console.log(`   cancel_url: ${urlParams.get('cancel_url')}`);
    console.log(`   customer_email: ${urlParams.get('customer_email')}`);
    console.log(`   request_id: ${urlParams.get('request_id')}`);

    // 5. 检查回调URL的可访问性
    console.log('\n5️⃣ 回调URL分析...');
    
    const callbackUrl = new URL(success_url);
    console.log('📋 回调URL分析:');
    console.log(`   协议: ${callbackUrl.protocol}`);
    console.log(`   主机: ${callbackUrl.hostname}`);
    console.log(`   端口: ${callbackUrl.port || '默认'}`);
    console.log(`   路径: ${callbackUrl.pathname}`);
    console.log(`   查询参数: ${callbackUrl.search}`);

    // 6. 潜在问题识别
    console.log('\n6️⃣ 潜在问题识别...');
    
    const issues = [];
    
    if (callbackUrl.hostname === 'localhost') {
      issues.push('❌ 使用localhost - Creem无法访问本地服务器');
    }
    
    if (callbackUrl.protocol === 'http:') {
      issues.push('⚠️  使用HTTP - 某些支付服务要求HTTPS');
    }
    
    if (!callbackUrl.pathname.includes('/api/payment/success')) {
      issues.push('❌ 回调路径错误');
    }
    
    if (issues.length === 0) {
      console.log('✅ 没有发现明显的配置问题');
    } else {
      console.log('发现的问题:');
      issues.forEach(issue => console.log(`   ${issue}`));
    }

    // 7. 解决方案建议
    console.log('\n7️⃣ 解决方案建议...');
    
    if (callbackUrl.hostname === 'localhost') {
      console.log('🔧 本地开发环境解决方案:');
      console.log('   1. 使用ngrok等工具创建公网隧道:');
      console.log('      npm install -g ngrok');
      console.log('      ngrok http 3001');
      console.log('   2. 使用ngrok提供的HTTPS URL替换localhost');
      console.log('   3. 在Creem中配置正确的回调URL');
      console.log('');
      console.log('🚀 生产环境解决方案:');
      console.log('   1. 部署到公网服务器（Vercel、Netlify等）');
      console.log('   2. 使用HTTPS域名');
      console.log('   3. 确保回调端点可公网访问');
    }

    // 8. 创建修复后的支付成功处理增强版
    console.log('\n8️⃣ 建议的修复方案...');
    console.log('🔧 为了确保积分正确发放，建议:');
    console.log('');
    console.log('1. 增强支付成功回调的日志记录');
    console.log('2. 添加重试机制');
    console.log('3. 实现webhook备用处理');
    console.log('4. 添加手动补发积分的管理功能');

  } catch (error) {
    console.error('❌ URL构建失败:', error.message);
  }
}

// 运行诊断
diagnoseCallbackUrl();
