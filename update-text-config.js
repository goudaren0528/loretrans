#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const configFilePath = path.join(__dirname, 'frontend/lib/config/translation.ts');

console.log('🔧 更新文本翻译配置，设置批次大小为1...');

// 读取当前配置文件
let content = fs.readFileSync(configFilePath, 'utf8');

// 修改文本翻译的批次大小
const oldBatchConfig = `  // 批处理配置 - 与文档翻译保持一致
  BATCH_SIZE: 3,                      // 批次大小：3个块/批次`;

const newBatchConfig = `  // 批处理配置 - 文本翻译使用顺序处理
  BATCH_SIZE: 1,                      // 批次大小：1个块/批次（顺序处理）`;

if (content.includes(oldBatchConfig)) {
  content = content.replace(oldBatchConfig, newBatchConfig);
  console.log('✅ 已更新文本翻译配置中的批次大小为1');
} else {
  console.log('⚠️  未找到预期的批次配置');
}

// 写回文件
fs.writeFileSync(configFilePath, content, 'utf8');

console.log('\n📊 配置文件更新总结:');
console.log('- ✅ 文本翻译批次大小: 3 → 1');
console.log('- ✅ 处理方式: 完全顺序处理');
console.log('- ✅ 文档翻译配置保持不变');
console.log('\n✅ 配置文件更新完成');
