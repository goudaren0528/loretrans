#!/usr/bin/env node

/**
 * 测试翻译模式选择
 */

// 模拟智能翻译服务
const mockUserContext = {
  isLoggedIn: false,
  creditBalance: 0,
  hasActiveTasks: false
};

// 测试不同长度的文本
const testCases = [
  { text: 'Hello', description: '短文本' },
  { text: 'A'.repeat(500), description: '中等文本(500字符)' },
  { text: 'A'.repeat(1500), description: '长文本(1500字符)' },
  { text: 'A'.repeat(3000), description: '超长文本(3000字符)' }
];

console.log('🧪 测试翻译模式选择...');

// 动态导入智能翻译服务
async function testModeSelection() {
  try {
    const { determineProcessingMode } = await import('./frontend/lib/services/smart-translation.ts');
    
    for (const testCase of testCases) {
      const mode = determineProcessingMode(
        testCase.text,
        'en',
        'zh',
        mockUserContext
      );
      
      console.log(`${testCase.description}: ${mode} ${mode === 'instant' ? '✅' : '❌'}`);
    }
    
    console.log('\n📊 测试结果:');
    console.log('如果所有测试都显示 instant ✅，则修复成功');
    console.log('如果有任何 fast_queue 或 background ❌，则需要进一步修复');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

if (require.main === module) {
  testModeSelection();
}
