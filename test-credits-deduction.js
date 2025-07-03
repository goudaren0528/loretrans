#!/usr/bin/env node

/**
 * 测试积分扣减逻辑
 */

console.log('🧪 测试积分扣减逻辑...\n');

async function testCreditsDeduction() {
  const baseUrl = 'https://fdb2-38-98-191-33.ngrok-free.app';
  const userId = 'b7bee007-2a9f-4fb8-8020-10b707e2f4f4';
  
  // 获取用户当前积分
  async function getCurrentCredits() {
    try {
      const response = await fetch(`${baseUrl}/api/auth/get-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.user.credits;
      }
      return null;
    } catch (error) {
      console.error('获取积分失败:', error);
      return null;
    }
  }
  
  // 测试翻译并检查积分扣减
  async function testTranslation(testName, text, expectedCreditsDeduction) {
    console.log(`\n🔬 测试: ${testName}`);
    console.log(`   文本长度: ${text.length} 字符`);
    console.log(`   预期扣减: ${expectedCreditsDeduction} 积分`);
    
    // 获取翻译前积分
    const creditsBefore = await getCurrentCredits();
    if (creditsBefore === null) {
      console.log('   ❌ 无法获取翻译前积分');
      return;
    }
    
    console.log(`   翻译前积分: ${creditsBefore.toLocaleString()}`);
    
    try {
      // 执行翻译
      const response = await fetch(`${baseUrl}/api/translate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // 注意：实际使用时需要有效的认证token
        },
        body: JSON.stringify({
          text: text,
          sourceLang: 'en',
          targetLang: 'ht' // 海地克里奥尔语
        })
      });
      
      const result = await response.json();
      console.log(`   翻译响应: ${response.status}`);
      
      if (response.ok) {
        console.log(`   翻译结果: ${result.translatedText?.substring(0, 50)}...`);
        
        // 等待一小段时间让积分更新
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 获取翻译后积分
        const creditsAfter = await getCurrentCredits();
        if (creditsAfter !== null) {
          const actualDeduction = creditsBefore - creditsAfter;
          console.log(`   翻译后积分: ${creditsAfter.toLocaleString()}`);
          console.log(`   实际扣减: ${actualDeduction} 积分`);
          
          if (actualDeduction === expectedCreditsDeduction) {
            console.log('   ✅ 积分扣减正确');
          } else {
            console.log(`   ❌ 积分扣减错误 (预期${expectedCreditsDeduction}, 实际${actualDeduction})`);
          }
        } else {
          console.log('   ⚠️  无法获取翻译后积分');
        }
      } else {
        console.log(`   ❌ 翻译失败: ${result.error || '未知错误'}`);
        
        if (response.status === 402) {
          console.log('   💡 这是余额不足的正确响应');
        }
      }
      
    } catch (error) {
      console.log(`   ❌ 翻译请求失败: ${error.message}`);
    }
  }
  
  // 定义测试用例
  const testCases = [
    {
      name: '免费翻译测试 (100字符)',
      text: 'Hello world! This is a test message for translation. It should be free because it is under 500 characters.',
      expectedCredits: 0
    },
    {
      name: '免费翻译边界测试 (500字符)',
      text: 'A'.repeat(500),
      expectedCredits: 0
    },
    {
      name: '付费翻译测试 (1000字符)',
      text: 'B'.repeat(1000),
      expectedCredits: Math.ceil((1000 - 500) * 0.1) // 50积分
    },
    {
      name: '中等文本翻译 (2000字符)',
      text: 'C'.repeat(2000),
      expectedCredits: Math.ceil((2000 - 500) * 0.1) // 150积分
    },
    {
      name: '长文本翻译 (5000字符)',
      text: 'D'.repeat(5000),
      expectedCredits: Math.ceil((5000 - 500) * 0.1) // 450积分
    }
  ];
  
  console.log('📊 开始积分扣减测试...');
  console.log(`🎯 测试用户: hongwane322@gmail.com`);
  
  // 显示当前积分状态
  const initialCredits = await getCurrentCredits();
  if (initialCredits !== null) {
    console.log(`💰 初始积分: ${initialCredits.toLocaleString()}`);
  }
  
  // 执行所有测试用例
  for (const testCase of testCases) {
    await testTranslation(testCase.name, testCase.text, testCase.expectedCredits);
    
    // 测试之间等待一小段时间
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // 显示最终积分状态
  console.log('\n📊 测试完成总结:');
  const finalCredits = await getCurrentCredits();
  if (finalCredits !== null && initialCredits !== null) {
    const totalDeduction = initialCredits - finalCredits;
    console.log(`💰 最终积分: ${finalCredits.toLocaleString()}`);
    console.log(`📉 总计扣减: ${totalDeduction} 积分`);
    
    // 计算预期总扣减
    const expectedTotalDeduction = testCases.reduce((sum, test) => sum + test.expectedCredits, 0);
    console.log(`📊 预期扣减: ${expectedTotalDeduction} 积分`);
    
    if (totalDeduction === expectedTotalDeduction) {
      console.log('✅ 总体积分扣减正确');
    } else {
      console.log(`❌ 总体积分扣减有误差 (差异: ${Math.abs(totalDeduction - expectedTotalDeduction)})`);
    }
  }
  
  console.log('\n💡 测试说明:');
  console.log('- 前500字符免费');
  console.log('- 超过500字符的部分按0.1积分/字符计费');
  console.log('- 积分不足时返回402错误');
  console.log('- 当前使用Mock翻译模式');
}

// 运行测试
testCreditsDeduction().catch(console.error);
