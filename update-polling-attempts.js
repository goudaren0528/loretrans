#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/components/document-translator.tsx');

console.log('🔧 修改文档翻译轮询次数：300次 → 500次...');

// 读取文件内容
let content = fs.readFileSync(filePath, 'utf8');

// 修改最大轮询次数
const oldMaxAttempts = `    const maxAttempts = 300 // 最多轮询5分钟 (300 * 1秒)，增加轮询次数`;
const newMaxAttempts = `    const maxAttempts = 500 // 最多轮询约8.3分钟 (500 * 1秒)，增加轮询次数`;

if (content.includes(oldMaxAttempts)) {
  content = content.replace(oldMaxAttempts, newMaxAttempts);
  console.log('✅ 已修改最大轮询次数: 300 → 500');
} else {
  console.log('⚠️  未找到预期的轮询次数配置');
}

// 写回文件
fs.writeFileSync(filePath, content, 'utf8');

console.log('\n📊 轮询次数修改总结:');
console.log('- ✅ 最大轮询次数: 300次 → 500次');
console.log('- ✅ 轮询时长: ~5分钟 → ~8.3分钟');
console.log('- ✅ 适应性: 更好地处理长文档翻译');
console.log('- ✅ 稳定性: 减少因轮询超时导致的任务失败');
console.log('\n✅ 轮询次数修改完成');
