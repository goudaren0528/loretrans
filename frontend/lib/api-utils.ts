import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUserRole } from './auth-utils'
import type { UserRole } from '../../shared/types'
import { User } from '@supabase/supabase-js'

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
export function validateTextLength(text: string, maxLength: number = 5000): { valid: boolean; length: number } {
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

// 扩展 NextRequest 类型以包含用户上下文
export interface NextRequestWithUser extends NextRequest {
  userContext: {
    user: User
    role: UserRole
  }
}

type AppRouterApiHandler = (
  req: NextRequestWithUser,
  // context (e.g., params) is implicitly available in the handler
) => Promise<NextResponse> 

type RoleCheck = UserRole | UserRole[]

/**
 * 高阶函数，用于保护App Router的API路由
 * @param handler - 原始的API路由处理函数
 * @param requiredRoles - 可选的角色要求
 */
export function withApiAuth(handler: AppRouterApiHandler, requiredRoles?: RoleCheck) {
  return async (req: NextRequest) => {
    console.log('[API Auth] 开始认证检查:', {
      method: req.method,
      url: req.url,
      timestamp: new Date().toISOString()
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[API Auth] Supabase配置缺失');
      return NextResponse.json({ error: 'API auth not configured' }, { status: 500 })
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const authHeader = req.headers.get('authorization')
    console.log('[API Auth] 认证头检查:', {
      hasAuthHeader: !!authHeader,
      headerFormat: authHeader?.startsWith('Bearer ') ? 'Bearer格式正确' : '格式错误或缺失',
      headerLength: authHeader?.length
    });
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[API Auth] 认证失败: 缺少或格式错误的Authorization头');
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 })
    }

    const jwt = authHeader.split(' ')[1]

    try {
      console.log('[API Auth] 验证JWT token:', { tokenLength: jwt.length, tokenPreview: jwt.substring(0, 20) + '...' });
      const { data, error } = await supabase.auth.getUser(jwt)

      if (error) {
        console.log('[API Auth] JWT验证失败:', { error: error?.message, hasUser: !!data?.user });
        
        // 检查是否是网络连接问题
        if (error.message && (error.message.includes('fetch failed') || error.message.includes('EAI_AGAIN'))) {
          console.log('[API Auth] 检测到网络连接问题，返回服务不可用错误');
          return NextResponse.json({ 
            error: 'Service temporarily unavailable. Please check your network connection and try again.',
            code: 'NETWORK_ERROR'
          }, { status: 503 })
        }
        
        return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 })
      }

      if (!data.user) {
        console.log('[API Auth] JWT验证失败: 用户数据为空');
        return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 })
      }

      const user = data.user
      const role = (await getUserRole(user.id)) as UserRole | null

      if (!role) {
        return NextResponse.json({ error: 'Forbidden: Could not determine user role' }, { status: 403 })
      }
      
      if (requiredRoles) {
        const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
        if (!roles.includes(role)) {
          return NextResponse.json({ error: `Forbidden: Role '${role}' is not authorized` }, { status: 403 })
        }
      }

      const extendedReq = req as NextRequestWithUser
      extendedReq.userContext = { user, role }
      
      return handler(extendedReq)

    } catch (e) {
      console.error('API Auth Error:', e)
      
      // 检查是否是网络连接错误
      if (e instanceof Error && (e.message.includes('fetch failed') || e.message.includes('EAI_AGAIN') || e.message.includes('ENOTFOUND'))) {
        console.log('[API Auth] Catch块检测到网络连接问题');
        return NextResponse.json({ 
          error: 'Service temporarily unavailable. Please check your network connection and try again.',
          code: 'NETWORK_ERROR'
        }, { status: 503 })
      }
      
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
  }
} 