/**
 * 增强的重试配置 - 更稳定的长文本翻译重试策略
 * 
 * 设计原则：
 * 1. 指数退避算法 - 避免服务过载
 * 2. 熔断器模式 - 快速失败和恢复
 * 3. 智能错误分类 - 不同错误不同处理
 * 4. 用户友好提示 - 清晰的错误信息
 */

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitterRange: number;
  circuitBreakerThreshold: number;
  circuitBreakerTimeout: number;
}

export const ENHANCED_RETRY_CONFIG: RetryConfig = {
  // 基础重试配置
  maxRetries: 8,                    // 增加到8次重试，提高成功率
  baseDelay: 1000,                  // 基础延迟1秒
  maxDelay: 30000,                  // 最大延迟30秒
  backoffMultiplier: 2,             // 指数退避倍数
  jitterRange: 0.1,                 // 随机抖动范围10%
  
  // 熔断器配置
  circuitBreakerThreshold: 5,       // 连续失败5次后熔断
  circuitBreakerTimeout: 60000,     // 熔断1分钟后尝试恢复
};

// 错误类型分类
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',           // 网络错误 - 可重试
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',           // 超时错误 - 可重试
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE', // 服务不可用 - 可重试
  RATE_LIMIT = 'RATE_LIMIT',                 // 限流错误 - 可重试，需要更长延迟
  CLIENT_ERROR = 'CLIENT_ERROR',             // 客户端错误 - 不可重试
  SERVER_ERROR = 'SERVER_ERROR',             // 服务器错误 - 可重试
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'            // 未知错误 - 可重试
}

// 熔断器状态
export enum CircuitState {
  CLOSED = 'CLOSED',     // 正常状态
  OPEN = 'OPEN',         // 熔断状态
  HALF_OPEN = 'HALF_OPEN' // 半开状态
}

// 熔断器实例
class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private successCount: number = 0;

  constructor(private config: RetryConfig) {}

  canExecute(): boolean {
    if (this.state === CircuitState.CLOSED) {
      return true;
    }
    
    if (this.state === CircuitState.OPEN) {
      const now = Date.now();
      if (now - this.lastFailureTime >= this.config.circuitBreakerTimeout) {
        this.state = CircuitState.HALF_OPEN;
        this.successCount = 0;
        console.log('[Circuit Breaker] 进入半开状态，尝试恢复服务');
        return true;
      }
      return false;
    }
    
    // HALF_OPEN state
    return true;
  }

  onSuccess(): void {
    this.failureCount = 0;
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= 3) { // 连续3次成功后恢复
        this.state = CircuitState.CLOSED;
        console.log('[Circuit Breaker] 服务恢复，熔断器关闭');
      }
    }
  }

  onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.OPEN;
      console.log('[Circuit Breaker] 半开状态失败，重新熔断');
    } else if (this.failureCount >= this.config.circuitBreakerThreshold) {
      this.state = CircuitState.OPEN;
      console.log(`[Circuit Breaker] 连续失败${this.failureCount}次，熔断器开启`);
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}

// 全局熔断器实例
const globalCircuitBreaker = new CircuitBreaker(ENHANCED_RETRY_CONFIG);

/**
 * 分类错误类型
 */
export function classifyError(error: any): ErrorType {
  const message = error.message?.toLowerCase() || '';
  
  if (error.name === 'AbortError' || message.includes('timeout')) {
    return ErrorType.TIMEOUT_ERROR;
  }
  
  if (message.includes('fetch') || message.includes('network') || message.includes('connection')) {
    return ErrorType.NETWORK_ERROR;
  }
  
  if (message.includes('503') || message.includes('502') || message.includes('504')) {
    return ErrorType.SERVICE_UNAVAILABLE;
  }
  
  if (message.includes('429') || message.includes('rate limit')) {
    return ErrorType.RATE_LIMIT;
  }
  
  if (message.includes('400') || message.includes('401') || message.includes('403')) {
    return ErrorType.CLIENT_ERROR;
  }
  
  if (message.includes('500') || message.includes('501') || message.includes('505')) {
    return ErrorType.SERVER_ERROR;
  }
  
  return ErrorType.UNKNOWN_ERROR;
}

/**
 * 判断错误是否可重试
 */
export function isRetryableError(errorType: ErrorType): boolean {
  return errorType !== ErrorType.CLIENT_ERROR;
}

/**
 * 计算重试延迟（指数退避 + 随机抖动）
 */
export function calculateRetryDelay(attempt: number, config: RetryConfig = ENHANCED_RETRY_CONFIG): number {
  const exponentialDelay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt);
  const jitter = exponentialDelay * config.jitterRange * (Math.random() - 0.5);
  const delay = Math.min(exponentialDelay + jitter, config.maxDelay);
  
  return Math.max(delay, config.baseDelay);
}

/**
 * 获取用户友好的错误信息
 */
export function getUserFriendlyErrorMessage(errorType: ErrorType, attempt: number, maxRetries: number): string {
  const isLastAttempt = attempt >= maxRetries;
  
  switch (errorType) {
    case ErrorType.NETWORK_ERROR:
      return isLastAttempt 
        ? '网络连接不稳定，请检查网络后重新提交任务'
        : '网络连接不稳定，正在重试...';
        
    case ErrorType.TIMEOUT_ERROR:
      return isLastAttempt
        ? '翻译服务响应超时，请稍后重新提交任务'
        : '翻译服务响应较慢，正在重试...';
        
    case ErrorType.SERVICE_UNAVAILABLE:
      return isLastAttempt
        ? '翻译服务暂时不可用，请稍后重新提交任务'
        : '翻译服务暂时不可用，正在重试...';
        
    case ErrorType.RATE_LIMIT:
      return isLastAttempt
        ? '请求过于频繁，请等待几分钟后重新提交任务'
        : '请求过于频繁，正在等待后重试...';
        
    case ErrorType.SERVER_ERROR:
      return isLastAttempt
        ? '翻译服务出现错误，请稍后重新提交任务'
        : '翻译服务出现错误，正在重试...';
        
    case ErrorType.CLIENT_ERROR:
      return '请求参数错误，请检查输入内容';
      
    default:
      return isLastAttempt
        ? '翻译失败，请稍后重新提交任务'
        : '翻译出现问题，正在重试...';
  }
}

/**
 * 增强的重试函数
 */
export async function enhancedRetry<T>(
  operation: () => Promise<T>,
  operationName: string = 'operation',
  config: RetryConfig = ENHANCED_RETRY_CONFIG
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    // 检查熔断器状态
    if (!globalCircuitBreaker.canExecute()) {
      throw new Error('翻译服务暂时不可用，请稍后重新提交任务（服务正在恢复中）');
    }
    
    try {
      console.log(`[Enhanced Retry] ${operationName} 尝试 ${attempt + 1}/${config.maxRetries + 1}`);
      
      const result = await operation();
      
      // 成功时通知熔断器
      globalCircuitBreaker.onSuccess();
      
      if (attempt > 0) {
        console.log(`[Enhanced Retry] ${operationName} 在第${attempt + 1}次尝试后成功`);
      }
      
      return result;
      
    } catch (error) {
      lastError = error;
      const errorType = classifyError(error);
      
      console.error(`[Enhanced Retry] ${operationName} 第${attempt + 1}次尝试失败:`, error.message);
      console.error(`[Enhanced Retry] 错误类型: ${errorType}`);
      
      // 通知熔断器失败
      globalCircuitBreaker.onFailure();
      
      // 如果是不可重试的错误，直接抛出
      if (!isRetryableError(errorType)) {
        console.error(`[Enhanced Retry] ${operationName} 不可重试的错误，停止重试`);
        throw new Error(getUserFriendlyErrorMessage(errorType, attempt, config.maxRetries));
      }
      
      // 如果已经是最后一次尝试，抛出错误
      if (attempt >= config.maxRetries) {
        console.error(`[Enhanced Retry] ${operationName} 已达到最大重试次数，停止重试`);
        throw new Error(getUserFriendlyErrorMessage(errorType, attempt, config.maxRetries));
      }
      
      // 计算重试延迟
      const delay = calculateRetryDelay(attempt, config);
      
      // 对于限流错误，使用更长的延迟
      const actualDelay = errorType === ErrorType.RATE_LIMIT ? delay * 2 : delay;
      
      console.log(`[Enhanced Retry] ${operationName} ${actualDelay}ms后进行第${attempt + 2}次尝试...`);
      console.log(`[Enhanced Retry] 用户提示: ${getUserFriendlyErrorMessage(errorType, attempt, config.maxRetries)}`);
      
      await new Promise(resolve => setTimeout(resolve, actualDelay));
    }
  }
  
  // 理论上不会到达这里，但为了类型安全
  throw lastError;
}

/**
 * 获取熔断器状态信息
 */
export function getCircuitBreakerStatus() {
  return {
    state: globalCircuitBreaker.getState(),
    canExecute: globalCircuitBreaker.canExecute()
  };
}

export default {
  ENHANCED_RETRY_CONFIG,
  enhancedRetry,
  classifyError,
  isRetryableError,
  calculateRetryDelay,
  getUserFriendlyErrorMessage,
  getCircuitBreakerStatus,
  ErrorType,
  CircuitState
};
