import { NextRequest, NextResponse } from 'next/server'

// 定义基础类型
interface ApiError {
  code: string
  message: string
  details?: any
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
  meta?: {
    timestamp: string
    requestId: string
    version: string
  }
}

/**
 * 标准API响应格式
 */
export function apiResponse<T>(
  data: T,
  status: number = 200,
  headers?: Record<string, string>
): NextResponse<ApiResponse<T>> {
  const response = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: generateRequestId(),
      version: '1.0.0',
    },
  }

  return NextResponse.json(response, { 
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  })
}

/**
 * 标准错误响应格式
 */
export function apiError(
  code: string,
  message: string,
  status: number = 400,
  details?: any
): NextResponse<ApiResponse<null>> {
  const error: ApiError = {
    code,
    message,
    details,
  }

  const response: ApiResponse<null> = {
    success: false,
    error,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: generateRequestId(),
      version: '1.0.0',
    },
  }

  return NextResponse.json(response, { status })
}

/**
 * 生成请求ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 验证请求方法
 */
export function validateMethod(request: NextRequest, allowedMethods: string[]): boolean {
  return allowedMethods.includes(request.method)
}

/**
 * 解析请求JSON
 */
export async function parseRequestBody<T>(request: NextRequest): Promise<T> {
  try {
    const body = await request.json()
    return body as T
  } catch (error) {
    throw new Error('Invalid JSON in request body')
  }
}

/**
 * 验证必需字段
 */
export function validateRequiredFields(data: any, fields: string[]): { valid: boolean; missing: string[] } {
  const missing = fields.filter(field => {
    const value = data[field]
    return value === undefined || value === null || value === ''
  })
  
  return {
    valid: missing.length === 0,
    missing,
  }
}

/**
 * 获取客户端IP
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIp) {
    return realIp
  }
  
  return 'unknown'
}

/**
 * 验证文本长度
 */
export function validateTextLength(text: string, maxLength: number = 1000): { valid: boolean; length: number } {
  const length = Array.from(text).length
  return {
    valid: length <= maxLength,
    length,
  }
}

/**
 * 清理和标准化文本
 */
export function sanitizeText(text: string): string {
  return text
    .trim()
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    .replace(/\s+/g, ' ')
}

/**
 * API错误码定义
 */
export const ApiErrorCodes = {
  INVALID_REQUEST: 'INVALID_REQUEST',
  MISSING_FIELDS: 'MISSING_FIELDS',
  INVALID_JSON: 'INVALID_JSON',
  METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  TEXT_TOO_LONG: 'TEXT_TOO_LONG',
  UNSUPPORTED_LANGUAGE: 'UNSUPPORTED_LANGUAGE',
  TRANSLATION_FAILED: 'TRANSLATION_FAILED',
  TTS_FAILED: 'TTS_FAILED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const 