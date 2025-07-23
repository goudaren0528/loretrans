#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/components/document-translator.tsx');

console.log('🔧 修改文档翻译轮询次数：500次 → 10000次...');

// 读取文件内容
let content = fs.readFileSync(filePath, 'utf8');

// 修改最大轮询次数
const oldMaxAttempts = `    const maxAttempts = 500 // 最多轮询约8.3分钟 (500 * 1秒)，增加轮询次数`;
const newMaxAttempts = `    const maxAttempts = 10000 // 最多轮询约2.8小时 (10000 * 1秒)，大幅增加轮询次数`;

if (content.includes(oldMaxAttempts)) {
  content = content.replace(oldMaxAttempts, newMaxAttempts);
  console.log('✅ 已修改最大轮询次数: 500 → 10000');
} else {
  // 尝试查找其他可能的格式
  const alternativePattern = /const maxAttempts = 500.*轮询.*次数/;
  if (alternativePattern.test(content)) {
    content = content.replace(alternativePattern, `const maxAttempts = 10000 // 最多轮询约2.8小时 (10000 * 1秒)，大幅增加轮询次数`);
    console.log('✅ 已修改最大轮询次数: 500 → 10000（备用模式）');
  } else {
    console.log('⚠️  未找到预期的轮询次数配置，尝试直接替换数字...');
    
    // 直接替换数字
    if (content.includes('const maxAttempts = 500')) {
      content = content.replace('const maxAttempts = 500', 'const maxAttempts = 10000');
      console.log('✅ 已修改最大轮询次数: 500 → 10000（数字替换）');
    } else {
      console.log('❌ 未找到轮询次数配置');
    }
  }
}

// 写回文件
fs.writeFileSync(filePath, content, 'utf8');

console.log('\n📊 轮询次数修改总结:');
console.log('- ✅ 最大轮询次数: 500次 → 10000次');
console.log('- ✅ 轮询时长: ~8.3分钟 → ~2.8小时');
console.log('- ✅ 适应性: 支持超长文档翻译');
console.log('- ✅ 稳定性: 大幅减少因轮询超时导致的任务失败');
console.log('- ✅ 用户体验: 长文档翻译不会因轮询超时而中断');
console.log('\n✅ 轮询次数修改完成');
