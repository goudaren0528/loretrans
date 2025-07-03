/**
 * 用户操作审计日志服务
 * 记录和查询所有重要的用户操作和系统事件
 */

import { createSupabaseBrowserClient, createSupabaseServerClient } from '../supabase'

// 审计事件类型
export type AuditActionType = 
  | 'user_login' | 'user_logout' | 'user_register' | 'user_update'
  | 'translation_request' | 'translation_success' | 'translation_failed'
  | 'credit_purchase' | 'credit_consume' | 'credit_refund'
  | 'document_upload' | 'document_translate' | 'document_download'
  | 'api_request' | 'system_error' | 'security_event'

// 审计日志接口
export interface AuditLog {
  id: string
  user_id?: string
  session_id?: string
  action_type: AuditActionType
  resource_type?: string
  resource_id?: string
  details: Record<string, any>
  ip_address?: string
  user_agent?: string
  success: boolean
  error_message?: string
  created_at: string
}

// 审计事件参数
export interface AuditEventParams {
  userId?: string
  sessionId?: string
  actionType: AuditActionType
  resourceType?: string
  resourceId?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  success?: boolean
  errorMessage?: string
}

// 审计统计信息
export interface AuditStatistics {
  total_events: number
  successful_events: number
  failed_events: number
  unique_users: number
  unique_ips: number
  events_by_type: Record<string, number>
  events_by_hour: Record<string, number>
  top_users: Array<{ user_id: string; event_count: number }>
  error_summary: Array<{
    action_type: string
    error_count: number
    sample_error: string
  }>
}

// 安全事件
export interface SecurityEvent {
  event_type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  affected_users: number
  event_count: number
  first_seen: string
  last_seen: string
}

class AuditService {
  private supabase: ReturnType<typeof createSupabaseBrowserClient>

  constructor(useServerClient = false) {
    this.supabase = useServerClient 
      ? createSupabaseServerClient() 
      : createSupabaseBrowserClient()
  }

  /**
   * 记录审计事件
   */
  async logEvent(params: AuditEventParams): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .rpc('log_audit_event', {
          p_user_id: params.userId || null,
          p_session_id: params.sessionId || null,
          p_action_type: params.actionType,
          p_resource_type: params.resourceType || null,
          p_resource_id: params.resourceId || null,
          p_details: params.details || {},
          p_ip_address: params.ipAddress || null,
          p_user_agent: params.userAgent || null,
          p_success: params.success !== false, // 默认为true
          p_error_message: params.errorMessage || null
        })

      if (error) {
        console.error('Failed to log audit event:', error)
        return null
      }

      return data as string
    } catch (error) {
      console.error('Audit logging error:', error)
      return null
    }
  }

  /**
   * 获取用户审计日志
   */
  async getUserLogs(
    userId: string,
    options?: {
      limit?: number
      offset?: number
      actionType?: AuditActionType
      startDate?: Date
      endDate?: Date
    }
  ): Promise<AuditLog[]> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_user_audit_logs', {
          p_user_id: userId,
          p_limit: options?.limit || 50,
          p_offset: options?.offset || 0,
          p_action_type: options?.actionType || null,
          p_start_date: options?.startDate?.toISOString() || null,
          p_end_date: options?.endDate?.toISOString() || null
        })

      if (error) {
        console.error('Failed to get user audit logs:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Failed to fetch user audit logs:', error)
      return []
    }
  }

  /**
   * 获取审计统计信息
   */
  async getStatistics(
    startDate?: Date,
    endDate?: Date
  ): Promise<AuditStatistics | null> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_audit_statistics', {
          p_start_date: startDate?.toISOString() || null,
          p_end_date: endDate?.toISOString() || null
        })

      if (error) {
        console.error('Failed to get audit statistics:', error)
        return null
      }

      return data as AuditStatistics
    } catch (error) {
      console.error('Failed to fetch audit statistics:', error)
      return null
    }
  }

  /**
   * 检测安全事件
   */
  async detectSecurityEvents(timeWindow?: string): Promise<SecurityEvent[]> {
    try {
      const { data, error } = await this.supabase
        .rpc('detect_security_events', {
          p_time_window: timeWindow || '1 hour'
        })

      if (error) {
        console.error('Failed to detect security events:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Failed to detect security events:', error)
      return []
    }
  }

  /**
   * 清理旧审计日志
   */
  async cleanupOldLogs(retentionDays: number = 90): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .rpc('cleanup_old_audit_logs', {
          p_retention_days: retentionDays
        })

      if (error) {
        console.error('Failed to cleanup old audit logs:', error)
        return 0
      }

      return data || 0
    } catch (error) {
      console.error('Failed to cleanup old audit logs:', error)
      return 0
    }
  }
}

// 便捷函数用于常见的审计事件

/**
 * 记录用户登录事件
 */
export async function logUserLogin(
  userId: string,
  sessionId: string,
  ipAddress?: string,
  userAgent?: string,
  success: boolean = true,
  errorMessage?: string
) {
  const auditService = new AuditService(true)
  return await auditService.logEvent({
    userId,
    sessionId,
    actionType: 'user_login',
    ipAddress,
    userAgent,
    success,
    errorMessage,
    details: {
      login_method: 'email_password',
      timestamp: new Date().toISOString()
    }
  })
}

/**
 * 记录翻译请求事件
 */
export async function logTranslationRequest(
  userId: string,
  sourceLanguage: string,
  targetLanguage: string,
  characterCount: number,
  success: boolean = true,
  errorMessage?: string,
  processingTime?: number,
  method?: string
) {
  const auditService = new AuditService(true)
  return await auditService.logEvent({
    userId,
    actionType: success ? 'translation_success' : 'translation_failed',
    resourceType: 'translation',
    success,
    errorMessage,
    details: {
      source_language: sourceLanguage,
      target_language: targetLanguage,
      character_count: characterCount,
      processing_time: processingTime,
      method: method,
      timestamp: new Date().toISOString()
    }
  })
}

/**
 * 记录积分消耗事件
 */
export async function logCreditConsumption(
  userId: string,
  creditsConsumed: number,
  transactionId: string,
  purpose: string,
  success: boolean = true,
  errorMessage?: string
) {
  const auditService = new AuditService(true)
  return await auditService.logEvent({
    userId,
    actionType: 'credit_consume',
    resourceType: 'credits',
    resourceId: transactionId,
    success,
    errorMessage,
    details: {
      credits_consumed: creditsConsumed,
      purpose: purpose,
      transaction_id: transactionId,
      timestamp: new Date().toISOString()
    }
  })
}

/**
 * 记录文档上传事件
 */
export async function logDocumentUpload(
  userId: string,
  fileName: string,
  fileSize: number,
  fileType: string,
  success: boolean = true,
  errorMessage?: string
) {
  const auditService = new AuditService(true)
  return await auditService.logEvent({
    userId,
    actionType: 'document_upload',
    resourceType: 'document',
    success,
    errorMessage,
    details: {
      file_name: fileName,
      file_size: fileSize,
      file_type: fileType,
      timestamp: new Date().toISOString()
    }
  })
}

/**
 * 记录API请求事件
 */
export async function logAPIRequest(
  userId: string | undefined,
  endpoint: string,
  method: string,
  statusCode: number,
  responseTime: number,
  ipAddress?: string,
  userAgent?: string
) {
  const auditService = new AuditService(true)
  return await auditService.logEvent({
    userId,
    actionType: 'api_request',
    resourceType: 'api',
    resourceId: endpoint,
    ipAddress,
    userAgent,
    success: statusCode < 400,
    details: {
      endpoint: endpoint,
      method: method,
      status_code: statusCode,
      response_time: responseTime,
      timestamp: new Date().toISOString()
    }
  })
}

/**
 * 记录系统错误事件
 */
export async function logSystemError(
  errorType: string,
  errorMessage: string,
  stackTrace?: string,
  userId?: string,
  context?: Record<string, any>
) {
  const auditService = new AuditService(true)
  return await auditService.logEvent({
    userId,
    actionType: 'system_error',
    resourceType: 'system',
    success: false,
    errorMessage,
    details: {
      error_type: errorType,
      stack_trace: stackTrace,
      context: context,
      timestamp: new Date().toISOString()
    }
  })
}

/**
 * 记录安全事件
 */
export async function logSecurityEvent(
  eventType: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  description: string,
  userId?: string,
  ipAddress?: string,
  details?: Record<string, any>
) {
  const auditService = new AuditService(true)
  return await auditService.logEvent({
    userId,
    actionType: 'security_event',
    resourceType: 'security',
    ipAddress,
    success: false, // 安全事件通常表示异常情况
    details: {
      event_type: eventType,
      severity: severity,
      description: description,
      ...details,
      timestamp: new Date().toISOString()
    }
  })
}

// 导出服务类和便捷函数
export { AuditService }

// 创建服务实例的便捷函数
export function createAuditService(useServerClient = false): AuditService {
  return new AuditService(useServerClient)
}
