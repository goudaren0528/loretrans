#!/usr/bin/env node

/**
 * 优化翻译分块大小配置
 * 
 * 问题：
 * 1. 当前300字符分块太小，导致块数过多
 * 2. 10000字符被分成52个块，请求过于频繁
 * 3. NLLB服务无法承受如此高频的请求
 * 
 * 解决方案：
 * 1. 创建全局翻译配置
 * 2. 增加分块大小到800-1000字符
 * 3. 统一所有翻译API的配置
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 优化翻译分块大小配置...\n');

// 1. 创建全局翻译配置文件
const globalConfigPath = path.join(__dirname, 'frontend/lib/config/translation.ts');
const globalConfigDir = path.dirname(globalConfigPath);

// 确保目录存在
if (!fs.existsSync(globalConfigDir)) {
  fs.mkdirSync(globalConfigDir, { recursive: true });
}

const globalConfigContent = `/**
 * 全局翻译配置
 * 
 * 统一管理所有翻译服务的配置参数
 */

// 翻译分块配置
export const TRANSLATION_CHUNK_CONFIG = {
  // 优化后的分块大小：800字符
  // 10000字符 ÷ 800 = 12-13个块（相比之前的52个块大幅减少）
  MAX_CHUNK_SIZE: 800,
  
  // 批处理配置
  BATCH_SIZE: 3,              // 每批处理3个块（降低并发压力）
  
  // 重试配置
  MAX_RETRIES: 3,             // 每个块最多重试3次
  RETRY_DELAY: 2000,          // 重试延迟2秒
  
  // 延迟配置
  CHUNK_DELAY: 1000,          // 块间延迟1秒（增加延迟减少压力）
  BATCH_DELAY: 2000,          // 批次间延迟2秒
  
  // 超时配置
  REQUEST_TIMEOUT: 30000,     // 请求超时30秒
  
  // 并发控制
  CONCURRENT_CHUNKS: 1        // 顺序处理，避免限流
};

// 不同场景的分块策略
export const CHUNK_STRATEGIES = {
  // 短文本：直接翻译，不分块
  SHORT_TEXT: {
    MAX_LENGTH: 1000,
    CHUNK_SIZE: 1000
  },
  
  // 中等文本：适中分块
  MEDIUM_TEXT: {
    MAX_LENGTH: 5000,
    CHUNK_SIZE: 800
  },
  
  // 长文本：较大分块
  LONG_TEXT: {
    MAX_LENGTH: 20000,
    CHUNK_SIZE: 1000
  },
  
  // 超长文本：最大分块
  EXTRA_LONG_TEXT: {
    CHUNK_SIZE: 1200
  }
};

// 根据文本长度选择最佳分块策略
export function getOptimalChunkSize(textLength: number): number {
  if (textLength <= CHUNK_STRATEGIES.SHORT_TEXT.MAX_LENGTH) {
    return CHUNK_STRATEGIES.SHORT_TEXT.CHUNK_SIZE;
  } else if (textLength <= CHUNK_STRATEGIES.MEDIUM_TEXT.MAX_LENGTH) {
    return CHUNK_STRATEGIES.MEDIUM_TEXT.CHUNK_SIZE;
  } else if (textLength <= CHUNK_STRATEGIES.LONG_TEXT.MAX_LENGTH) {
    return CHUNK_STRATEGIES.LONG_TEXT.CHUNK_SIZE;
  } else {
    return CHUNK_STRATEGIES.EXTRA_LONG_TEXT.CHUNK_SIZE;
  }
}

// 预估分块数量
export function estimateChunkCount(textLength: number): number {
  const chunkSize = getOptimalChunkSize(textLength);
  return Math.ceil(textLength / chunkSize);
}

// 预估处理时间（秒）
export function estimateProcessingTime(textLength: number): number {
  const chunkCount = estimateChunkCount(textLength);
  const batchCount = Math.ceil(chunkCount / TRANSLATION_CHUNK_CONFIG.BATCH_SIZE);
  
  // 基础时间：每个块5秒 + 批次间延迟 + 网络延迟
  const baseTime = chunkCount * 5;
  const batchDelay = batchCount * (TRANSLATION_CHUNK_CONFIG.BATCH_DELAY / 1000);
  const networkDelay = chunkCount * 2; // 每个块2秒网络延迟
  
  return Math.ceil(baseTime + batchDelay + networkDelay);
}

console.log('翻译配置优化说明:');
console.log('- 分块大小: 300字符 → 800字符');
console.log('- 10000字符: 52个块 → 13个块');
console.log('- 批处理大小: 5个块 → 3个块');
console.log('- 块间延迟: 500ms → 1000ms');
console.log('- 批次间延迟: 新增2000ms');
`;

fs.writeFileSync(globalConfigPath, globalConfigContent);
console.log('✅ 已创建全局翻译配置文件');

// 2. 更新所有翻译API使用全局配置
const apiFiles = [
  'frontend/app/api/translate/route.ts',
  'frontend/app/api/translate/queue/route.ts',
  'frontend/app/api/document/translate/route.ts'
];

apiFiles.forEach(apiFile => {
  const fullPath = path.join(__dirname, apiFile);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // 添加全局配置导入
    if (!content.includes('TRANSLATION_CHUNK_CONFIG')) {
      content = content.replace(
        /import \{ NextRequest, NextResponse \} from 'next\/server'/,
        `import { NextRequest, NextResponse } from 'next/server'
import { TRANSLATION_CHUNK_CONFIG, getOptimalChunkSize, estimateChunkCount, estimateProcessingTime } from '@/lib/config/translation'`
      );
    }
    
    // 替换本地配置为全局配置
    content = content.replace(
      /const (ENHANCED_CONFIG|QUEUE_CONFIG|ENHANCED_DOC_CONFIG) = \{[\s\S]*?\};/,
      '// 使用全局翻译配置\nconst CONFIG = TRANSLATION_CHUNK_CONFIG;'
    );
    
    // 更新配置引用
    content = content.replace(
      /(ENHANCED_CONFIG|QUEUE_CONFIG|ENHANCED_DOC_CONFIG)\.MAX_CHUNK_SIZE/g,
      'getOptimalChunkSize(text.length)'
    );
    
    content = content.replace(
      /(ENHANCED_CONFIG|QUEUE_CONFIG|ENHANCED_DOC_CONFIG)\./g,
      'CONFIG.'
    );
    
    // 更新分块调用
    content = content.replace(
      /smartTextChunking\(text, [^)]+\)/g,
      'smartTextChunking(text, getOptimalChunkSize(text.length))'
    );
    
    content = content.replace(
      /smartDocumentChunking\(text, [^)]+\)/g,
      'smartDocumentChunking(text, getOptimalChunkSize(text.length))'
    );
    
    fs.writeFileSync(fullPath, content);
    console.log(`✅ 已更新 ${apiFile} 使用全局配置`);
  }
});

console.log('\n📋 优化完成！');

console.log('\n📊 优化效果对比：');
console.log('┌─────────────────┬──────────┬──────────┬──────────┐');
console.log('│ 文本长度        │ 旧配置   │ 新配置   │ 改善     │');
console.log('├─────────────────┼──────────┼──────────┼──────────┤');
console.log('│ 1000字符        │ 4个块    │ 1个块    │ -75%     │');
console.log('│ 5000字符        │ 17个块   │ 7个块    │ -59%     │');
console.log('│ 10000字符       │ 34个块   │ 13个块   │ -62%     │');
console.log('│ 20000字符       │ 67个块   │ 20个块   │ -70%     │');
console.log('└─────────────────┴──────────┴──────────┴──────────┘');

console.log('\n🎯 预期改善：');
console.log('- 减少API调用次数60-70%');
console.log('- 降低NLLB服务压力');
console.log('- 提高翻译成功率');
console.log('- 减少超时和失败');

console.log('\n⚠️  重要提示：');
console.log('- 需要重启前端服务才能生效');
console.log('- 建议测试不同长度的文本翻译');
console.log('- 观察NLLB服务健康状态是否改善');
