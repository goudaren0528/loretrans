/**
 * 串流翻译配置
 */

export const STREAMING_CONFIG = {
  MAX_CHUNK_SIZE: 800,
  CHUNK_INTERVAL: 2000,
  SINGLE_CHUNK_TIMEOUT: 25000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  STREAM_THRESHOLD: 1600,
  MAX_CONCURRENT_STREAMS: 3,
  TASK_CLEANUP_INTERVAL: 300000,
};

export function shouldUseStreaming(textLength: number): boolean {
  return textLength > STREAMING_CONFIG.STREAM_THRESHOLD;
}

export function calculateStreamingParams(textLength: number) {
  const chunkCount = Math.ceil(textLength / STREAMING_CONFIG.MAX_CHUNK_SIZE);
  const estimatedTime = chunkCount * (STREAMING_CONFIG.CHUNK_INTERVAL / 1000) + 10;
  
  return {
    chunkCount,
    estimatedTime,
    useStreaming: shouldUseStreaming(textLength),
    maxProcessingTime: Math.min(estimatedTime, 28)
  };
}
