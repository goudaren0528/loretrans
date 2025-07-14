/**
 * 并行翻译配置文件
 * 用于管理长文本翻译的并行处理参数
 */

export const PARALLEL_TRANSLATION_CONFIG = {
  // 基础配置
  CHUNK_SIZE: 300,                    // 每个块的最大字符数
  MAX_RETRIES: 5,                     // 每个块的最大重试次数
  RETRY_DELAY: 1000,                  // 重试延迟（毫秒）
  REQUEST_TIMEOUT: 30000,             // 单个请求超时时间（毫秒）
  
  // 并发控制
  MAX_CONCURRENT_CHUNKS: 3,           // 最大并发处理块数
  CHUNK_START_DELAY: 200,             // 块启动间隔（毫秒）
  
  // 触发条件
  PARALLEL_THRESHOLD: 1000,           // 启用并行处理的文本长度阈值
  FORCE_PARALLEL_THRESHOLD: 2000,     // 强制使用并行处理的阈值
  
  // 性能优化
  ENABLE_CHUNK_CACHING: true,         // 启用块级缓存
  CACHE_DURATION: 300000,             // 缓存持续时间（5分钟）
  
  // 错误处理
  PARTIAL_SUCCESS_THRESHOLD: 0.7,     // 部分成功阈值（70%块成功即认为翻译成功）
  ENABLE_FALLBACK: true,              // 启用备用翻译
  FALLBACK_SERVICE: 'simple',         // 备用服务类型
  
  // 监控和日志
  ENABLE_DETAILED_LOGGING: true,      // 启用详细日志
  ENABLE_PERFORMANCE_METRICS: true,   // 启用性能指标收集
  LOG_CHUNK_DETAILS: false,           // 记录块详细信息（调试用）
  
  // 用户体验
  SHOW_PROGRESS_BAR: true,            // 显示进度条
  SHOW_CHUNK_DETAILS: true,           // 显示块处理详情
  ENABLE_REAL_TIME_UPDATES: false,    // 启用实时更新（实验性）
  
  // 服务端点
  ENDPOINTS: {
    PARALLEL: '/api/translate-parallel',
    SEQUENTIAL: '/api/translate',
    SIMPLE: '/api/translate-simple'
  }
} as const;

/**
 * 根据文本长度决定使用的翻译策略
 */
export function getTranslationStrategy(textLength: number): {
  useParallel: boolean;
  endpoint: string;
  chunkSize: number;
  maxRetries: number;
  reason: string;
} {
  if (textLength <= PARALLEL_TRANSLATION_CONFIG.PARALLEL_THRESHOLD) {
    return {
      useParallel: false,
      endpoint: PARALLEL_TRANSLATION_CONFIG.ENDPOINTS.SEQUENTIAL,
      chunkSize: PARALLEL_TRANSLATION_CONFIG.CHUNK_SIZE,
      maxRetries: 3, // 短文本使用较少重试
      reason: '文本较短，使用顺序处理'
    };
  }
  
  if (textLength >= PARALLEL_TRANSLATION_CONFIG.FORCE_PARALLEL_THRESHOLD) {
    return {
      useParallel: true,
      endpoint: PARALLEL_TRANSLATION_CONFIG.ENDPOINTS.PARALLEL,
      chunkSize: PARALLEL_TRANSLATION_CONFIG.CHUNK_SIZE,
      maxRetries: PARALLEL_TRANSLATION_CONFIG.MAX_RETRIES,
      reason: '长文本，强制使用并行处理'
    };
  }
  
  return {
    useParallel: true,
    endpoint: PARALLEL_TRANSLATION_CONFIG.ENDPOINTS.PARALLEL,
    chunkSize: PARALLEL_TRANSLATION_CONFIG.CHUNK_SIZE,
    maxRetries: PARALLEL_TRANSLATION_CONFIG.MAX_RETRIES,
    reason: '中等长度文本，使用并行处理提高成功率'
  };
}

/**
 * 计算预估的处理时间
 */
export function estimateProcessingTime(textLength: number): {
  estimatedTime: number; // 毫秒
  chunkCount: number;
  strategy: string;
} {
  const strategy = getTranslationStrategy(textLength);
  const chunkCount = Math.ceil(textLength / strategy.chunkSize);
  
  if (!strategy.useParallel) {
    // 顺序处理：每个块平均5秒
    return {
      estimatedTime: chunkCount * 5000,
      chunkCount,
      strategy: 'sequential'
    };
  }
  
  // 并行处理：考虑并发限制
  const batchCount = Math.ceil(chunkCount / PARALLEL_TRANSLATION_CONFIG.MAX_CONCURRENT_CHUNKS);
  const estimatedTime = batchCount * 8000; // 每批平均8秒
  
  return {
    estimatedTime,
    chunkCount,
    strategy: 'parallel'
  };
}

/**
 * 验证翻译结果质量
 */
export function validateTranslationQuality(result: {
  chunksProcessed: number;
  successCount: number;
  failedCount: number;
  chunkResults: Array<{status: string}>;
}): {
  isValid: boolean;
  quality: 'excellent' | 'good' | 'acceptable' | 'poor';
  score: number;
  recommendation: string;
} {
  const successRate = result.successCount / result.chunksProcessed;
  
  if (successRate >= 0.95) {
    return {
      isValid: true,
      quality: 'excellent',
      score: successRate,
      recommendation: '翻译质量优秀，所有块都成功处理'
    };
  }
  
  if (successRate >= 0.8) {
    return {
      isValid: true,
      quality: 'good',
      score: successRate,
      recommendation: '翻译质量良好，大部分块成功处理'
    };
  }
  
  if (successRate >= PARALLEL_TRANSLATION_CONFIG.PARTIAL_SUCCESS_THRESHOLD) {
    return {
      isValid: true,
      quality: 'acceptable',
      score: successRate,
      recommendation: '翻译质量可接受，建议检查失败的块'
    };
  }
  
  return {
    isValid: false,
    quality: 'poor',
    score: successRate,
    recommendation: '翻译质量较差，建议重新翻译或使用其他服务'
  };
}

/**
 * 生成翻译报告
 */
export function generateTranslationReport(result: any): {
  summary: string;
  details: string[];
  recommendations: string[];
} {
  const quality = validateTranslationQuality(result);
  const processingTime = result.processingTime || 0;
  const avgTimePerChunk = processingTime / result.chunksProcessed;
  
  const summary = `
    翻译完成：${result.chunksProcessed}个块，成功${result.successCount}个，失败${result.failedCount}个
    质量评级：${quality.quality}（${(quality.score * 100).toFixed(1)}%）
    处理时间：${processingTime}ms（平均${avgTimePerChunk.toFixed(0)}ms/块）
  `.trim();
  
  const details = [
    `原文长度：${result.characterCount}字符`,
    `译文长度：${result.translatedText?.length || 0}字符`,
    `分块策略：${result.chunkSize}字符/块`,
    `服务类型：${result.service}`,
    `并发处理：${result.chunksProcessed > 1 ? '是' : '否'}`
  ];
  
  const recommendations = [];
  
  if (quality.quality === 'poor') {
    recommendations.push('建议重新翻译或联系技术支持');
  }
  
  if (avgTimePerChunk > 10000) {
    recommendations.push('处理时间较长，建议检查网络连接或服务状态');
  }
  
  if (result.failedCount > 0) {
    recommendations.push(`有${result.failedCount}个块处理失败，可能影响翻译完整性`);
  }
  
  if (recommendations.length === 0) {
    recommendations.push('翻译处理正常，无需特别注意');
  }
  
  return {
    summary,
    details,
    recommendations
  };
}

export type TranslationStrategy = ReturnType<typeof getTranslationStrategy>;
export type ProcessingEstimate = ReturnType<typeof estimateProcessingTime>;
export type QualityValidation = ReturnType<typeof validateTranslationQuality>;
export type TranslationReport = ReturnType<typeof generateTranslationReport>;
