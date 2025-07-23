#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const configFilePath = path.join(__dirname, 'frontend/lib/config/translation.ts');

console.log('🔧 优化翻译配置，提高稳定性...');

// 读取当前配置文件
let content = fs.readFileSync(configFilePath, 'utf8');

// 优化配置参数
const optimizations = [
  {
    old: 'MAX_CHUNK_SIZE: 200,        // 🔥 进一步减小块大小到200字符，适应NLLB服务响应时间',
    new: 'MAX_CHUNK_SIZE: 600,        // 🔥 优化块大小到600字符，平衡稳定性和效率',
    description: '增加块大小，减少请求数量'
  },
  {
    old: 'MAX_RETRIES: 5,             // 🔥 增加到5次重试，提高成功率',
    new: 'MAX_RETRIES: 4,             // 🔥 适度重试4次，平衡成功率和速度',
    description: '适度减少重试次数'
  },
  {
    old: 'RETRY_DELAY: 2000,          // 🔥 增加重试延迟到2秒，给NLLB服务更多恢复时间',
    new: 'RETRY_DELAY: 1500,          // 🔥 重试延迟1.5秒，平衡恢复时间和速度',
    description: '适度减少重试延迟'
  },
  {
    old: 'REQUEST_TIMEOUT: 30000,     // 🔥 调整请求超时到30秒，基于NLLB服务实际响应时间',
    new: 'REQUEST_TIMEOUT: 45000,     // 🔥 增加请求超时到45秒，适应NLLB服务不稳定情况',
    description: '增加请求超时时间'
  },
  {
    old: 'CHUNK_DELAY: 500,           // 块间延迟：500ms',
    new: 'CHUNK_DELAY: 800,           // 块间延迟：800ms，减少NLLB服务压力',
    description: '增加块间延迟'
  },
  {
    old: 'BATCH_DELAY: 2000,          // 🔥 批次间延迟：2秒（与文档翻译一致）',
    new: 'BATCH_DELAY: 3000,          // 🔥 批次间延迟：3秒，给NLLB服务更多恢复时间',
    description: '增加批次间延迟'
  }
];

let changesMade = 0;

optimizations.forEach(opt => {
  if (content.includes(opt.old)) {
    content = content.replace(opt.old, opt.new);
    console.log(`✅ ${opt.description}`);
    changesMade++;
  } else {
    console.log(`⚠️  未找到: ${opt.description}`);
  }
});

// 写回文件
fs.writeFileSync(configFilePath, content, 'utf8');

console.log(`\n📊 配置优化总结:`);
console.log(`- 块大小: 200字符 → 600字符 (减少67%的请求数量)`);
console.log(`- 10000字符文本: 50个块 → 17个块`);
console.log(`- 请求超时: 30秒 → 45秒`);
console.log(`- 块间延迟: 500ms → 800ms`);
console.log(`- 批次间延迟: 2秒 → 3秒`);
console.log(`\n✅ 配置优化完成 (${changesMade}项更改)`);
console.log('🔄 请重启开发服务器以应用更改');
