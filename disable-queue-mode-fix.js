#!/usr/bin/env node

/**
 * 禁用翻译队列模式修复脚本
 * 
 * 问题：线上翻译功能触发了fast_queue模式，导致翻译结果不显示
 * 解决方案：强制所有翻译使用instant模式，确保结果直接显示
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 开始禁用翻译队列模式...\n');

// 1. 确认smart-translation.ts已经修改
function checkSmartTranslationService() {
  const filePath = path.join(__dirname, 'frontend/lib/services/smart-translation.ts');
  
  console.log('🔍 检查智能翻译服务配置...');
  
  if (!fs.existsSync(filePath)) {
    console.error('❌ 智能翻译服务文件不存在');
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // 检查是否已经强制返回instant
  if (content.includes("return 'instant'") && content.includes('临时禁用队列模式')) {
    console.log('✅ 智能翻译服务已配置为强制instant模式');
    return true;
  } else {
    console.log('⚠️  智能翻译服务可能需要进一步修改');
    return false;
  }
}

// 2. 检查unified-translator.tsx中的处理逻辑
function checkUnifiedTranslator() {
  const filePath = path.join(__dirname, 'frontend/components/translation/unified-translator.tsx');
  
  console.log('🔍 检查统一翻译器组件...');
  
  if (!fs.existsSync(filePath)) {
    console.error('❌ 统一翻译器组件文件不存在');
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // 检查是否有简化处理的注释
  if (content.includes('简化处理：直接开始翻译')) {
    console.log('✅ 统一翻译器已配置为简化处理模式');
    return true;
  } else {
    console.log('⚠️  统一翻译器可能需要进一步修改');
    return false;
  }
}

// 3. 创建测试脚本验证修复效果
function createTestScript() {
  const testScript = `#!/usr/bin/env node

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
      
      console.log(\`\${testCase.description}: \${mode} \${mode === 'instant' ? '✅' : '❌'}\`);
    }
    
    console.log('\\n📊 测试结果:');
    console.log('如果所有测试都显示 instant ✅，则修复成功');
    console.log('如果有任何 fast_queue 或 background ❌，则需要进一步修复');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

if (require.main === module) {
  testModeSelection();
}
`;

  const testPath = path.join(__dirname, 'test-translation-mode.js');
  fs.writeFileSync(testPath, testScript);
  console.log('✅ 测试脚本已创建: test-translation-mode.js');
}

// 4. 生成部署说明
function generateDeploymentInstructions() {
  const instructions = `
📋 禁用队列模式部署说明

## 修改内容
1. ✅ 智能翻译服务强制返回 'instant' 模式
2. ✅ 统一翻译器使用简化处理逻辑

## 预期效果
- 所有翻译请求都使用即时处理模式
- 翻译结果直接显示，不进入队列
- 不再出现 "[Translation Mode] Auto-selected: fast_queue" 日志
- 不再出现 "[Translation Start] Mode: fast_queue" 日志

## 验证步骤
1. 部署修改后的代码到生产环境
2. 测试不同长度的文本翻译
3. 检查浏览器控制台日志，确认只显示 instant 模式
4. 确认翻译结果能够直接显示

## 监控要点
- 翻译请求的响应时间
- 翻译成功率
- 用户体验是否改善

## 如果需要恢复队列模式
如果将来需要恢复智能队列模式，可以：
1. 恢复 smart-translation.ts 中的原始逻辑
2. 移除强制返回 'instant' 的代码
3. 重新启用基于文本长度的模式判断

---
修复时间: ${new Date().toISOString()}
`;

  console.log(instructions);
}

// 主函数
function main() {
  let allChecksPass = true;
  
  // 检查各个组件
  if (!checkSmartTranslationService()) {
    allChecksPass = false;
  }
  
  if (!checkUnifiedTranslator()) {
    allChecksPass = false;
  }
  
  // 创建测试脚本
  createTestScript();
  
  // 显示部署说明
  generateDeploymentInstructions();
  
  if (allChecksPass) {
    console.log('\\n🎉 队列模式禁用修复完成！');
    console.log('📝 请将修改后的代码部署到生产环境');
    console.log('🧪 可以运行 node test-translation-mode.js 进行本地测试');
  } else {
    console.log('\\n⚠️  部分检查未通过，请检查上述问题');
  }
}

// 运行修复
if (require.main === module) {
  main();
}

module.exports = {
  checkSmartTranslationService,
  checkUnifiedTranslator,
  createTestScript
};
