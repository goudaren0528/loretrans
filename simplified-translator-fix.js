#!/usr/bin/env node

/**
 * 简化翻译组件，移除队列处理逻辑
 */

const fs = require('fs');

const translatorFile = '/home/hwt/translation-low-source/frontend/components/translation/unified-translator.tsx';

console.log('🔧 简化翻译组件，移除队列处理逻辑...');

try {
  let content = fs.readFileSync(translatorFile, 'utf8');
  
  // 1. 移除队列相关的状态
  content = content.replace(
    /jobId\?\: string \/\/ 用于队列任务/g,
    '// jobId removed - no queue processing'
  );
  
  // 2. 简化处理模式判断
  content = content.replace(
    /const processingMode = state\.processingMode \|\| 'instant'/g,
    '// Always use instant processing mode'
  );
  
  // 3. 移除队列处理的else分支
  const queueElsePattern = /} else {\s*\/\/ 队列任务创建成功[\s\S]*?pollJobStatus\(data\.data\.jobId\)\s*}\s*}/;
  content = content.replace(queueElsePattern, '}');
  
  // 4. 简化翻译结果处理
  const instantProcessingPattern = /if \(processingMode === 'instant'\) {([\s\S]*?)} else {/;
  const match = content.match(instantProcessingPattern);
  
  if (match) {
    const instantLogic = match[1];
    // 替换整个条件块，只保留即时处理逻辑
    content = content.replace(
      /if \(processingMode === 'instant'\) {[\s\S]*?} else {[\s\S]*?}/,
      `// Always process translations instantly
      ${instantLogic.trim()}`
    );
  }
  
  // 5. 移除processingMode相关的日志
  content = content.replace(
    /console\.log\(\`\[Translation Start\] Mode: \$\{processingMode\}\`[\s\S]*?\}\)/g,
    'console.log("[Translation Start] Using simplified instant mode")'
  );
  
  // 6. 移除队列相关的导入和函数
  content = content.replace(
    /import.*smart-translation.*\n/g,
    '// Removed smart-translation imports\n'
  );
  
  // 7. 移除processingMode相关的类型定义
  content = content.replace(
    /processingMode: ProcessingMode \| null/g,
    '// processingMode removed'
  );
  
  // 8. 移除pollJobStatus函数调用
  content = content.replace(
    /pollJobStatus\([^)]*\)/g,
    '// pollJobStatus removed'
  );
  
  console.log('✅ 应用简化修改...');
  
  // 写回文件
  fs.writeFileSync(translatorFile, content, 'utf8');
  
  console.log('🎉 翻译组件简化完成！');
  console.log('📋 主要修改:');
  console.log('- 移除了队列处理逻辑');
  console.log('- 简化为纯即时翻译模式');
  console.log('- 移除了复杂的处理模式判断');
  console.log('- 保留了基本的翻译功能');
  
} catch (error) {
  console.error('❌ 简化失败:', error.message);
}

console.log('\n🔍 建议测试:');
console.log('1. 测试短文本翻译 (< 1000字符)');
console.log('2. 测试长文本翻译 (> 1000字符)');
console.log('3. 验证翻译结果正确显示');
console.log('4. 确认不再出现队列提示');
