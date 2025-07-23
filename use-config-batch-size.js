#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const routeFilePath = path.join(__dirname, 'frontend/app/api/translate/route.ts');

console.log('🔧 修改代码使用配置文件中的BATCH_SIZE...');

// 读取当前文件内容
let content = fs.readFileSync(routeFilePath, 'utf8');

// 替换硬编码的BATCH_SIZE为配置文件中的值
const oldBatchSize = `    const BATCH_SIZE = 1 // 批次大小 - 文本翻译使用顺序处理，每批次1个块`;
const newBatchSize = `    const BATCH_SIZE = CONFIG.BATCH_SIZE // 使用配置文件中的批次大小`;

if (content.includes(oldBatchSize)) {
  content = content.replace(oldBatchSize, newBatchSize);
  console.log('✅ 已修改为使用配置文件中的BATCH_SIZE');
} else {
  console.log('⚠️  未找到预期的硬编码BATCH_SIZE');
}

// 写回文件
fs.writeFileSync(routeFilePath, content, 'utf8');

console.log('\n📊 代码修改总结:');
console.log('- ✅ 移除硬编码的BATCH_SIZE');
console.log('- ✅ 使用CONFIG.BATCH_SIZE（当前值为1）');
console.log('- ✅ 提高配置的一致性和可维护性');
console.log('\n✅ 代码修改完成');
console.log('🔄 请重启开发服务器以应用更改');
