// JavaScript版本的翻译配置，供Node.js模块使用

// 翻译分块配置 - NLLB服务优化版本
const TRANSLATION_CHUNK_CONFIG = {
  // NLLB服务分块大小：800字符（考虑NLLB服务限制，最大不超过1000字符）
  MAX_CHUNK_SIZE: 800,
  
  // 批处理配置
  BATCH_SIZE: 3,              // 每批处理3个块（避免过度并发）
  
  // 重试配置
  MAX_RETRIES: 3,             // 每个块最多重试3次
  RETRY_DELAY: 1000,          // 重试延迟1秒
  
  // 延迟配置 - 避免NLLB服务限流
  CHUNK_DELAY: 500,           // 块间延迟0.5秒
  BATCH_DELAY: 1000,          // 批次间延迟1秒
  
  // 超时配置
  REQUEST_TIMEOUT: 30000,     // 请求超时30秒
  
  // 并发控制
  CONCURRENT_CHUNKS: 1        // 顺序处理，避免限流
};

// 不同场景的分块策略 - 考虑NLLB服务限制
const CHUNK_STRATEGIES = {
  // 短文本：直接翻译，不分块
  SHORT_TEXT: {
    MAX_LENGTH: 500,
    CHUNK_SIZE: 500
  },
  
  // 中等文本：适中分块
  MEDIUM_TEXT: {
    MAX_LENGTH: 2000,
    CHUNK_SIZE: 600
  },
  
  // 长文本：较大分块
  LONG_TEXT: {
    MAX_LENGTH: 5000,
    CHUNK_SIZE: 800
  },
  
  // 超长文本：最大分块（不超过NLLB限制）
  EXTRA_LONG_TEXT: {
    CHUNK_SIZE: 800  // 保持800字符，确保NLLB服务稳定性
  }
};

// 根据文本长度选择合适的分块策略（固定800字符上限）
function getOptimalChunkSize(textLength) {
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
function estimateChunkCount(textLength) {
  const chunkSize = getOptimalChunkSize(textLength);
  return Math.ceil(textLength / chunkSize);
}

// 预估处理时间（秒）
function estimateProcessingTime(textLength) {
  const chunkCount = estimateChunkCount(textLength);
  const batchCount = Math.ceil(chunkCount / TRANSLATION_CHUNK_CONFIG.BATCH_SIZE);
  
  // 基础时间：每个块5秒 + 批次间延迟 + 网络延迟
  const baseTime = chunkCount * 5;
  const batchDelay = batchCount * (TRANSLATION_CHUNK_CONFIG.BATCH_DELAY / 1000);
  const networkDelay = chunkCount * 2; // 每个块2秒网络延迟
  
  return Math.ceil(baseTime + batchDelay + networkDelay);
}

module.exports = {
  TRANSLATION_CHUNK_CONFIG,
  CHUNK_STRATEGIES,
  getOptimalChunkSize,
  estimateChunkCount,
  estimateProcessingTime
};

console.log('翻译配置说明:');
console.log('- 分块大小: 800字符（考虑NLLB服务限制）');
console.log('- 10000字符: 约13个块');
console.log('- 批处理大小: 3个块');
console.log('- 块间延迟: 500ms');
console.log('- 批次间延迟: 1000ms');
