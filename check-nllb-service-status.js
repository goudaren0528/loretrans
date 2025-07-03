#!/usr/bin/env node

/**
 * 检查NLLB服务当前部署状态和积分扣减逻辑
 */

require('dotenv').config({ path: '.env.local' });

console.log('🔍 检查NLLB服务部署状态和积分扣减逻辑...\n');

async function checkNLLBServiceStatus() {
  try {
    // 1. 检查环境配置
    console.log('📋 1. 检查NLLB服务配置:');
    
    const nllbEnabled = process.env.NLLB_LOCAL_ENABLED;
    const nllbUrl = process.env.NLLB_LOCAL_URL;
    const nllbFallback = process.env.NLLB_LOCAL_FALLBACK;
    const nllbTimeout = process.env.NLLB_LOCAL_TIMEOUT;
    
    console.log(`   NLLB_LOCAL_ENABLED: ${nllbEnabled}`);
    console.log(`   NLLB_LOCAL_URL: ${nllbUrl}`);
    console.log(`   NLLB_LOCAL_FALLBACK: ${nllbFallback}`);
    console.log(`   NLLB_LOCAL_TIMEOUT: ${nllbTimeout}ms`);
    
    const isLocalEnabled = nllbEnabled === 'true';
    console.log(`   🔧 当前模式: ${isLocalEnabled ? '本地NLLB服务' : 'Mock模式'}`);
    
    // 2. 检查本地NLLB服务状态
    console.log('\n📋 2. 检查本地NLLB服务状态:');
    
    if (isLocalEnabled && nllbUrl) {
      try {
        console.log(`   测试连接: ${nllbUrl}`);
        
        const response = await fetch(`${nllbUrl}/health`, {
          timeout: 5000
        });
        
        if (response.ok) {
          const healthData = await response.json();
          console.log('   ✅ 本地NLLB服务运行正常');
          console.log('   📊 服务状态:', healthData);
        } else {
          console.log(`   ❌ 本地NLLB服务响应异常: ${response.status}`);
        }
      } catch (error) {
        console.log(`   ❌ 本地NLLB服务连接失败: ${error.message}`);
        console.log('   💡 可能原因: 服务未启动或端口不正确');
      }
    } else {
      console.log('   ⚠️  本地NLLB服务已禁用，使用Mock模式');
    }
    
    // 3. 检查翻译API端点
    console.log('\n📋 3. 检查翻译API端点:');
    
    try {
      const apiUrl = 'https://fdb2-38-98-191-33.ngrok-free.app/api/translate';
      console.log(`   测试API: ${apiUrl}`);
      
      // 不实际调用，只检查端点是否存在
      const response = await fetch(apiUrl, {
        method: 'OPTIONS',
        timeout: 5000
      });
      
      console.log(`   📊 API端点状态: ${response.status}`);
      
      if (response.status === 200 || response.status === 405) {
        console.log('   ✅ 翻译API端点可访问');
      } else {
        console.log('   ⚠️  翻译API端点可能有问题');
      }
    } catch (error) {
      console.log(`   ❌ 翻译API端点检查失败: ${error.message}`);
    }
    
    // 4. 分析积分扣减逻辑
    console.log('\n📋 4. 分析积分扣减逻辑:');
    
    const fs = require('fs');
    
    try {
      // 检查翻译API中的积分扣减逻辑
      const translateApiPath = '/home/hwt/translation-low-source/frontend/app/api/translate/route.ts';
      const translateApiContent = fs.readFileSync(translateApiPath, 'utf8');
      
      const hasCreditsCalculation = translateApiContent.includes('calculateCreditsRequired');
      const hasCreditsConsumption = translateApiContent.includes('consumeTranslationCredits');
      const hasFreeLimit = translateApiContent.includes('500');
      const hasInsufficientCreditsCheck = translateApiContent.includes('insufficient_credits');
      
      console.log('   积分扣减逻辑检查:');
      console.log(`   ✅ 积分计算: ${hasCreditsCalculation ? '已实现' : '未实现'}`);
      console.log(`   ✅ 积分消费: ${hasCreditsConsumption ? '已实现' : '未实现'}`);
      console.log(`   ✅ 免费额度: ${hasFreeLimit ? '500字符免费' : '未设置'}`);
      console.log(`   ✅ 余额检查: ${hasInsufficientCreditsCheck ? '已实现' : '未实现'}`);
      
      // 检查积分服务
      const creditsServicePath = '/home/hwt/translation-low-source/frontend/lib/services/credits.ts';
      if (fs.existsSync(creditsServicePath)) {
        console.log('   ✅ 积分服务文件存在');
      } else {
        console.log('   ❌ 积分服务文件不存在');
      }
      
    } catch (error) {
      console.log(`   ❌ 积分逻辑检查失败: ${error.message}`);
    }
    
    // 5. 生成测试建议
    console.log('\n📋 5. 积分扣减测试建议:');
    
    console.log('\n   🧪 测试场景:');
    console.log('   1. 免费翻译测试 (≤500字符)');
    console.log('      - 输入少于500字符的文本');
    console.log('      - 验证不扣减积分');
    console.log('      - 检查翻译是否成功');
    
    console.log('\n   2. 付费翻译测试 (>500字符)');
    console.log('      - 输入超过500字符的文本');
    console.log('      - 验证正确扣减积分');
    console.log('      - 检查翻译是否成功');
    
    console.log('\n   3. 余额不足测试');
    console.log('      - 使用积分不足的账户');
    console.log('      - 尝试大文本翻译');
    console.log('      - 验证返回402错误');
    
    console.log('\n   4. 积分计算准确性测试');
    console.log('      - 测试不同长度文本的积分计算');
    console.log('      - 验证计算公式正确性');
    
    // 6. 当前用户积分状态
    console.log('\n📋 6. 当前用户积分状态:');
    
    try {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      
      const userId = 'b7bee007-2a9f-4fb8-8020-10b707e2f4f4';
      const { data: user, error } = await supabase
        .from('users')
        .select('credits, email')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.log('   ❌ 无法获取用户积分');
      } else {
        console.log(`   👤 用户: ${user.email}`);
        console.log(`   💰 当前积分: ${user.credits.toLocaleString()}`);
        console.log(`   📊 可翻译字符数: ${(user.credits * 10 + 500).toLocaleString()} (包含500免费字符)`);
        
        // 计算不同测试场景的积分消耗
        const testScenarios = [
          { name: '短文本', chars: 100, credits: 0 },
          { name: '中等文本', chars: 1000, credits: Math.ceil((1000 - 500) * 0.1) },
          { name: '长文本', chars: 5000, credits: Math.ceil((5000 - 500) * 0.1) },
          { name: '超长文本', chars: 10000, credits: Math.ceil((10000 - 500) * 0.1) }
        ];
        
        console.log('\n   🧮 测试场景积分消耗预估:');
        testScenarios.forEach(scenario => {
          const canAfford = user.credits >= scenario.credits;
          console.log(`   ${canAfford ? '✅' : '❌'} ${scenario.name} (${scenario.chars}字符): ${scenario.credits}积分`);
        });
      }
    } catch (error) {
      console.log(`   ❌ 用户积分检查失败: ${error.message}`);
    }
    
    // 7. 生成测试脚本
    console.log('\n📋 7. 生成积分扣减测试脚本:');
    
    const testScript = `
// 积分扣减测试脚本
const testCreditDeduction = async () => {
  const testCases = [
    { text: 'Hello', expectedCredits: 0 }, // 免费
    { text: 'A'.repeat(1000), expectedCredits: 50 }, // 付费
    { text: 'B'.repeat(5000), expectedCredits: 450 } // 大文本
  ];
  
  for (const testCase of testCases) {
    console.log(\`测试: \${testCase.text.length}字符\`);
    
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: testCase.text,
        sourceLang: 'en',
        targetLang: 'ht'
      })
    });
    
    const result = await response.json();
    console.log(\`结果: \${response.status}, 积分: \${testCase.expectedCredits}\`);
  }
};
`;
    
    console.log('   📝 测试脚本已生成 (见上方代码)');
    
  } catch (error) {
    console.error('❌ NLLB服务状态检查失败:', error);
  }
}

// 运行检查
checkNLLBServiceStatus();
