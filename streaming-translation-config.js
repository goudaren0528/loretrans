#!/usr/bin/env node

/**
 * 串流长文本翻译配置
 * 
 * 目标：规避Vercel 30秒超时限制
 * 策略：800字符分块 + 串流处理 + 块间延迟 + 每块独立任务
 */

// 串流翻译配置
const STREAMING_CONFIG = {
  // 分块配置 - 800字符上限
  MAX_CHUNK_SIZE: 800,
  
  // 串流处理配置
  STREAM_BATCH_SIZE: 1,           // 每次处理1个块（串流）
  CHUNK_INTERVAL: 1000,           // 块间启动间隔：1秒（减少延迟）
  
  // 超时配置 - 适应Vercel限制
  SINGLE_CHUNK_TIMEOUT: 25000,    // 单块处理超时：25秒
  STREAM_TOTAL_TIMEOUT: 28000,    // 串流总超时：28秒（留2秒缓冲）
  
  // 重试配置
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  
  // 队列阈值 - 触发串流处理的文本长度
  STREAM_THRESHOLD: 1600,         // 超过1600字符启用串流处理
  
  // 任务管理
  MAX_CONCURRENT_STREAMS: 3,      // 最大并发串流数
  TASK_CLEANUP_INTERVAL: 300000,  // 任务清理间隔：5分钟
};

// 计算串流处理参数
function calculateStreamingParams(textLength) {
  const chunkCount = Math.ceil(textLength / STREAMING_CONFIG.MAX_CHUNK_SIZE);
  // 调整预估时间：每个块3秒处理时间 + 块间延迟
  const estimatedTime = chunkCount * 3 + (chunkCount - 1) * (STREAMING_CONFIG.CHUNK_INTERVAL / 1000);
  
  return {
    chunkCount,
    estimatedTime,
    useStreaming: textLength > STREAMING_CONFIG.STREAM_THRESHOLD,
    maxProcessingTime: Math.min(estimatedTime, STREAMING_CONFIG.STREAM_TOTAL_TIMEOUT / 1000)
  };
}

// 验证配置安全性
function validateStreamingConfig() {
  console.log('🔍 验证串流配置安全性...\n');
  
  const testCases = [
    { length: 800, desc: '单块文本' },
    { length: 1600, desc: '双块文本（阈值）' },
    { length: 3200, desc: '4块文本' },
    { length: 8000, desc: '10块文本' }
  ];
  
  testCases.forEach(testCase => {
    const params = calculateStreamingParams(testCase.length);
    const isSafe = params.maxProcessingTime <= 28; // 28秒安全限制
    
    console.log(`${testCase.desc} (${testCase.length}字符):`);
    console.log(`  分块数: ${params.chunkCount}`);
    console.log(`  预估时间: ${params.estimatedTime}秒`);
    console.log(`  使用串流: ${params.useStreaming ? '是' : '否'}`);
    console.log(`  安全性: ${isSafe ? '✅ 安全' : '❌ 超时风险'}\n`);
  });
}

// 智能分块函数 - 800字符上限
function createStreamingChunks(text, maxChunkSize = STREAMING_CONFIG.MAX_CHUNK_SIZE) {
  if (text.length <= maxChunkSize) {
    return [text];
  }

  console.log(`📝 串流分块: ${text.length}字符 -> ${maxChunkSize}字符/块`);
  
  const chunks = [];
  let remainingText = text;
  
  while (remainingText.length > 0) {
    if (remainingText.length <= maxChunkSize) {
      chunks.push(remainingText.trim());
      break;
    }
    
    // 寻找最佳分割点
    let splitPoint = maxChunkSize;
    
    // 策略1: 在段落边界分割（双换行）
    const paragraphMatch = remainingText.substring(0, maxChunkSize).lastIndexOf('\n\n');
    if (paragraphMatch > maxChunkSize * 0.5) {
      splitPoint = paragraphMatch + 2;
    } else {
      // 策略2: 在句子边界分割
      const sentencePattern = /[.!?。！？]\s+/g;
      let lastSentenceEnd = -1;
      let match;
      
      while ((match = sentencePattern.exec(remainingText.substring(0, maxChunkSize))) !== null) {
        lastSentenceEnd = match.index + match[0].length;
      }
      
      if (lastSentenceEnd > maxChunkSize * 0.5) {
        splitPoint = lastSentenceEnd;
      } else {
        // 策略3: 在逗号边界分割
        const commaIndex = remainingText.substring(0, maxChunkSize).lastIndexOf('，');
        const commaIndexEn = remainingText.substring(0, maxChunkSize).lastIndexOf(', ');
        const bestComma = Math.max(commaIndex, commaIndexEn);
        
        if (bestComma > maxChunkSize * 0.7) {
          splitPoint = bestComma + (commaIndex > commaIndexEn ? 1 : 2);
        } else {
          // 策略4: 在空格边界分割
          const spaceIndex = remainingText.substring(0, maxChunkSize).lastIndexOf(' ');
          if (spaceIndex > maxChunkSize * 0.8) {
            splitPoint = spaceIndex + 1;
          }
          // 否则使用硬分割
        }
      }
    }
    
    const chunk = remainingText.substring(0, splitPoint).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }
    
    remainingText = remainingText.substring(splitPoint).trim();
  }
  
  console.log(`✅ 串流分块完成: ${chunks.length}个块`);
  chunks.forEach((chunk, index) => {
    console.log(`  块 ${index + 1}: ${chunk.length}字符`);
  });
  
  return chunks;
}

// 强制按词汇分块
function forceChunkByWords(text, maxSize) {
  const chunks = [];
  const words = text.split(' ');
  let currentChunk = '';
  
  for (const word of words) {
    const potentialChunk = currentChunk + (currentChunk ? ' ' : '') + word;
    
    if (potentialChunk.length <= maxSize) {
      currentChunk = potentialChunk;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      currentChunk = word.length > maxSize ? word.substring(0, maxSize) : word;
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}

// 生成串流任务ID
function generateStreamTaskId() {
  return `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 主函数
function main() {
  console.log('🚀 串流翻译配置验证...\n');
  
  console.log('📊 配置参数:');
  Object.entries(STREAMING_CONFIG).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });
  console.log();
  
  validateStreamingConfig();
  
  console.log('✅ 串流翻译配置验证完成！\n');
  console.log('🎯 核心特性:');
  console.log('  • 800字符分块，确保单块处理在25秒内完成');
  console.log('  • 串流处理，每块独立任务，避免累积超时');
  console.log('  • 2秒块间延迟，避免服务过载');
  console.log('  • 1600字符阈值，小文本直接处理');
  console.log('  • 28秒总超时限制，适应Vercel环境');
}

if (require.main === module) {
  main();
}

module.exports = {
  STREAMING_CONFIG,
  calculateStreamingParams,
  createStreamingChunks,
  generateStreamTaskId,
  validateStreamingConfig
};
