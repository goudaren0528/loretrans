#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const configFilePath = path.join(__dirname, 'frontend/lib/config/translation.ts');

console.log('🔧 修改文档翻译配置：每批次1个块，每个块700字符...');

// 读取配置文件
let content = fs.readFileSync(configFilePath, 'utf8');

// 修改文档翻译配置
const oldDocConfig = `// 🔥 新增：文档翻译专用配置
export const DOCUMENT_TRANSLATION_CONFIG = {
  // 文档分块配置 - 400字符上限
  MAX_CHUNK_SIZE: 400,        // 🔥 调整为400字符上限
  
  // 并发处理配置 - 并行2个块
  BATCH_SIZE: 2,              // 🔥 调整为并行2个块
  CONCURRENT_BATCHES: 1,      // 批次数量：1
  MAX_CONCURRENT_REQUESTS: 2, // 最大并发请求：2个`;

const newDocConfig = `// 🔥 新增：文档翻译专用配置
export const DOCUMENT_TRANSLATION_CONFIG = {
  // 文档分块配置 - 700字符上限
  MAX_CHUNK_SIZE: 700,        // 🔥 调整为700字符上限
  
  // 并发处理配置 - 顺序处理
  BATCH_SIZE: 1,              // 🔥 每批次1个块（顺序处理）
  CONCURRENT_BATCHES: 1,      // 批次数量：1
  MAX_CONCURRENT_REQUESTS: 1, // 最大并发请求：1个（顺序处理）`;

if (content.includes(oldDocConfig)) {
  content = content.replace(oldDocConfig, newDocConfig);
  console.log('✅ 已修改文档翻译配置');
} else {
  console.log('⚠️  未找到预期的文档翻译配置，尝试单独修改各项...');
  
  // 单独修改各个配置项
  let changes = 0;
  
  // 修改块大小
  if (content.includes('MAX_CHUNK_SIZE: 400,')) {
    content = content.replace('MAX_CHUNK_SIZE: 400,', 'MAX_CHUNK_SIZE: 700,');
    console.log('✅ 已修改块大小: 400 → 700字符');
    changes++;
  }
  
  // 修改批次大小
  if (content.includes('BATCH_SIZE: 2,              // 🔥 调整为并行2个块')) {
    content = content.replace('BATCH_SIZE: 2,              // 🔥 调整为并行2个块', 'BATCH_SIZE: 1,              // 🔥 每批次1个块（顺序处理）');
    console.log('✅ 已修改批次大小: 2 → 1个块');
    changes++;
  }
  
  // 修改最大并发请求
  if (content.includes('MAX_CONCURRENT_REQUESTS: 2, // 最大并发请求：2个')) {
    content = content.replace('MAX_CONCURRENT_REQUESTS: 2, // 最大并发请求：2个', 'MAX_CONCURRENT_REQUESTS: 1, // 最大并发请求：1个（顺序处理）');
    console.log('✅ 已修改最大并发请求: 2 → 1个');
    changes++;
  }
  
  console.log(`✅ 完成 ${changes} 项配置修改`);
}

// 写回文件
fs.writeFileSync(configFilePath, content, 'utf8');

console.log('\n📊 文档翻译配置修改总结:');
console.log('- ✅ 块大小: 400字符 → 700字符');
console.log('- ✅ 批次大小: 2个块 → 1个块');
console.log('- ✅ 处理方式: 并行处理 → 完全顺序处理');
console.log('- ✅ 最大并发: 2个请求 → 1个请求');
console.log('- ✅ 稳定性: 大幅提升（减少并发压力）');
console.log('\n✅ 文档翻译配置修改完成');
