#!/usr/bin/env node

/**
 * 平衡的分块优化方案
 * 
 * 考虑因素：
 * 1. Vercel 30秒超时限制
 * 2. NLLB服务稳定性
 * 3. 用户体验
 * 
 * 策略：
 * 1. 短文本（≤1000字符）：直接翻译，适中分块
 * 2. 长文本（>1000字符）：队列处理，优化分块
 * 3. 减少API调用频率，但不超过单次处理能力
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 创建平衡的分块优化方案...\n');

// 分析当前问题
console.log('📊 当前问题分析：');
console.log('- 300字符分块 → 10000字符产生33+个块');
console.log('- 过多的API调用导致NLLB服务压力过大');
console.log('- 队列处理时间过长，用户体验差');
console.log('- 但需要考虑Vercel 30秒限制');

console.log('\n🎯 优化策略：');

// 1. 更新队列处理的分块配置（主要优化目标）
const queueApiPath = path.join(__dirname, 'frontend/app/api/translate/queue/route.ts');
let queueContent = fs.readFileSync(queueApiPath, 'utf8');

// 优化队列配置
const optimizedQueueConfig = `// 翻译队列配置 - 优化版本
const QUEUE_CONFIG = {
  MAX_CHUNK_SIZE: 600,        // 增加到600字符（平衡块数和处理时间）
  BATCH_SIZE: 3,              // 减少到3个块/批次（降低并发压力）
  MAX_RETRIES: 3,             // 保持3次重试
  RETRY_DELAY: 2000,          // 增加重试延迟到2秒
  CHUNK_DELAY: 1500,          // 增加块间延迟到1.5秒
  BATCH_DELAY: 3000,          // 增加批次间延迟到3秒
  REQUEST_TIMEOUT: 25000,     // 请求超时25秒
  CONCURRENT_CHUNKS: 1        // 顺序处理
};`;

queueContent = queueContent.replace(
  /\/\/ 翻译队列配置[\s\S]*?CONCURRENT_CHUNKS: 1[\s\S]*?\};/,
  optimizedQueueConfig
);

fs.writeFileSync(queueApiPath, queueContent);
console.log('✅ 已优化队列处理配置（600字符分块）');

// 2. 保持短文本翻译的配置不变（避免30秒超时）
const textApiPath = path.join(__dirname, 'frontend/app/api/translate/route.ts');
let textContent = fs.readFileSync(textApiPath, 'utf8');

// 短文本翻译保持较小分块，确保在30秒内完成
const optimizedTextConfig = `// 增强的翻译服务配置 - 短文本优化
const ENHANCED_CONFIG = {
  MAX_CHUNK_SIZE: 400,        // 短文本使用400字符分块（平衡性能和超时）
  MAX_RETRIES: 2,             // 减少重试次数（避免超时）
  RETRY_DELAY: 1000,          // 重试延迟1秒
  CHUNK_DELAY: 800,           // 块间延迟800ms
  REQUEST_TIMEOUT: 20000,     // 请求超时20秒（为Vercel留出缓冲）
  CONCURRENT_CHUNKS: 1        // 顺序处理
};`;

textContent = textContent.replace(
  /\/\/ 增强的翻译服务配置[\s\S]*?CONCURRENT_CHUNKS: 1[\s\S]*?\};/,
  optimizedTextConfig
);

fs.writeFileSync(textApiPath, textContent);
console.log('✅ 已优化短文本翻译配置（400字符分块）');

// 3. 优化文档翻译配置
const docApiPath = path.join(__dirname, 'frontend/app/api/document/translate/route.ts');
let docContent = fs.readFileSync(docApiPath, 'utf8');

const optimizedDocConfig = `// 增强的文档翻译配置 - 优化版本
const ENHANCED_DOC_CONFIG = {
  MAX_CHUNK_SIZE: 700,        // 文档翻译使用700字符分块
  MAX_RETRIES: 3,             // 保持3次重试
  RETRY_DELAY: 2500,          // 增加重试延迟
  CHUNK_DELAY: 2000,          // 增加块间延迟
  BATCH_DELAY: 4000,          // 增加批次间延迟
  REQUEST_TIMEOUT: 30000,     // 请求超时30秒
  CONCURRENT_CHUNKS: 1,       // 顺序处理
  BATCH_SIZE: 2               // 文档翻译每批2个块
};`;

docContent = docContent.replace(
  /\/\/ 增强的文档翻译配置[\s\S]*?CONCURRENT_CHUNKS: 1[\s\S]*?\};/,
  optimizedDocConfig
);

fs.writeFileSync(docApiPath, docContent);
console.log('✅ 已优化文档翻译配置（700字符分块）');

console.log('\n📊 优化效果预估：');
console.log('┌─────────────────┬──────────┬──────────┬──────────┬──────────┐');
console.log('│ 场景            │ 文本长度 │ 旧配置   │ 新配置   │ 改善     │');
console.log('├─────────────────┼──────────┼──────────┼──────────┼──────────┤');
console.log('│ 短文本直接翻译  │ 1000字符 │ 4个块    │ 3个块    │ -25%     │');
console.log('│ 队列处理        │ 5000字符 │ 17个块   │ 9个块    │ -47%     │');
console.log('│ 队列处理        │ 10000字符│ 34个块   │ 17个块   │ -50%     │');
console.log('│ 文档翻译        │ 10000字符│ 34个块   │ 15个块   │ -56%     │');
console.log('└─────────────────┴──────────┴──────────┴──────────┴──────────┘');

console.log('\n🎯 分层优化策略：');
console.log('1. **短文本翻译**（≤1000字符）：');
console.log('   - 400字符分块，确保30秒内完成');
console.log('   - 减少重试次数，避免超时');
console.log('   - 直接返回结果');

console.log('\n2. **队列处理**（>1000字符）：');
console.log('   - 600字符分块，平衡效率和稳定性');
console.log('   - 3个块/批次，降低并发压力');
console.log('   - 增加延迟，给NLLB服务喘息时间');

console.log('\n3. **文档翻译**：');
console.log('   - 700字符分块，处理大文档');
console.log('   - 2个块/批次，更保守的处理');
console.log('   - 更长的延迟，确保稳定性');

console.log('\n⚡ 预期改善：');
console.log('- 减少API调用次数25-56%');
console.log('- 降低NLLB服务压力');
console.log('- 避免Vercel 30秒超时');
console.log('- 提高翻译成功率');
console.log('- 改善用户体验');

console.log('\n⚠️  重要说明：');
console.log('- 短文本翻译仍在30秒限制内');
console.log('- 长文本使用队列处理，避开超时限制');
console.log('- 分块大小经过平衡优化');
console.log('- 需要重启服务测试效果');

console.log('\n🧪 建议测试：');
console.log('1. 测试500字符文本（短文本直接翻译）');
console.log('2. 测试2000字符文本（队列处理）');
console.log('3. 测试10000字符文本（队列处理）');
console.log('4. 观察NLLB服务健康状态');
console.log('5. 检查翻译成功率和处理时间');
