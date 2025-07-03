-- 用户操作审计日志系统
-- 记录所有重要的用户操作和系统事件

-- 1. 创建审计日志表
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  action_type TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 索引
  CONSTRAINT audit_logs_action_type_check CHECK (action_type IN (
    'user_login', 'user_logout', 'user_register', 'user_update',
    'translation_request', 'translation_success', 'translation_failed',
    'credit_purchase', 'credit_consume', 'credit_refund',
    'document_upload', 'document_translate', 'document_download',
    'api_request', 'system_error', 'security_event'
  ))
);

-- 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id_created_at 
ON audit_logs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type_created_at 
ON audit_logs(action_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type_id 
ON audit_logs(resource_type, resource_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address 
ON audit_logs(ip_address);

CREATE INDEX IF NOT EXISTS idx_audit_logs_success_created_at 
ON audit_logs(success, created_at DESC) WHERE success = false;

-- 2. 创建审计日志记录函数
CREATE OR REPLACE FUNCTION log_audit_event(
  p_user_id UUID DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL,
  p_action_type TEXT,
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id TEXT DEFAULT NULL,
  p_details JSONB DEFAULT '{}',
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_success BOOLEAN DEFAULT true,
  p_error_message TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO audit_logs (
    user_id,
    session_id,
    action_type,
    resource_type,
    resource_id,
    details,
    ip_address,
    user_agent,
    success,
    error_message,
    created_at
  ) VALUES (
    p_user_id,
    p_session_id,
    p_action_type,
    p_resource_type,
    p_resource_id,
    p_details,
    p_ip_address::INET,
    p_user_agent,
    p_success,
    p_error_message,
    NOW()
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 创建审计日志查询函数
CREATE OR REPLACE FUNCTION get_user_audit_logs(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0,
  p_action_type TEXT DEFAULT NULL,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL
) RETURNS TABLE (
  id UUID,
  action_type TEXT,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB,
  ip_address INET,
  success BOOLEAN,
  error_message TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.action_type,
    al.resource_type,
    al.resource_id,
    al.details,
    al.ip_address,
    al.success,
    al.error_message,
    al.created_at
  FROM audit_logs al
  WHERE 
    al.user_id = p_user_id
    AND (p_action_type IS NULL OR al.action_type = p_action_type)
    AND (p_start_date IS NULL OR al.created_at >= p_start_date)
    AND (p_end_date IS NULL OR al.created_at <= p_end_date)
  ORDER BY al.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 创建系统审计统计函数
CREATE OR REPLACE FUNCTION get_audit_statistics(
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '24 hours',
  p_end_date TIMESTAMPTZ DEFAULT NOW()
) RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT jsonb_build_object(
    'total_events', COUNT(*),
    'successful_events', COUNT(*) FILTER (WHERE success = true),
    'failed_events', COUNT(*) FILTER (WHERE success = false),
    'unique_users', COUNT(DISTINCT user_id),
    'unique_ips', COUNT(DISTINCT ip_address),
    'events_by_type', jsonb_object_agg(
      action_type, 
      COUNT(*)
    ),
    'events_by_hour', (
      SELECT jsonb_object_agg(
        hour_bucket,
        event_count
      )
      FROM (
        SELECT 
          date_trunc('hour', created_at) as hour_bucket,
          COUNT(*) as event_count
        FROM audit_logs
        WHERE created_at BETWEEN p_start_date AND p_end_date
        GROUP BY date_trunc('hour', created_at)
        ORDER BY hour_bucket
      ) hourly_stats
    ),
    'top_users', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'user_id', user_id,
          'event_count', event_count
        )
      )
      FROM (
        SELECT 
          user_id,
          COUNT(*) as event_count
        FROM audit_logs
        WHERE created_at BETWEEN p_start_date AND p_end_date
          AND user_id IS NOT NULL
        GROUP BY user_id
        ORDER BY event_count DESC
        LIMIT 10
      ) top_users_stats
    ),
    'error_summary', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'action_type', action_type,
          'error_count', error_count,
          'sample_error', sample_error
        )
      )
      FROM (
        SELECT 
          action_type,
          COUNT(*) as error_count,
          array_agg(DISTINCT error_message)[1] as sample_error
        FROM audit_logs
        WHERE created_at BETWEEN p_start_date AND p_end_date
          AND success = false
          AND error_message IS NOT NULL
        GROUP BY action_type
        ORDER BY error_count DESC
      ) error_stats
    )
  ) INTO v_result
  FROM audit_logs
  WHERE created_at BETWEEN p_start_date AND p_end_date;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 创建安全事件检测函数
CREATE OR REPLACE FUNCTION detect_security_events(
  p_time_window INTERVAL DEFAULT INTERVAL '1 hour'
) RETURNS TABLE (
  event_type TEXT,
  severity TEXT,
  description TEXT,
  affected_users INTEGER,
  event_count INTEGER,
  first_seen TIMESTAMPTZ,
  last_seen TIMESTAMPTZ
) AS $$
BEGIN
  -- 检测异常登录活动
  RETURN QUERY
  SELECT 
    'suspicious_login_activity'::TEXT as event_type,
    'medium'::TEXT as severity,
    'Multiple failed login attempts from same IP'::TEXT as description,
    COUNT(DISTINCT user_id)::INTEGER as affected_users,
    COUNT(*)::INTEGER as event_count,
    MIN(created_at) as first_seen,
    MAX(created_at) as last_seen
  FROM audit_logs
  WHERE 
    created_at >= NOW() - p_time_window
    AND action_type = 'user_login'
    AND success = false
  GROUP BY ip_address
  HAVING COUNT(*) >= 5;
  
  -- 检测异常翻译活动
  RETURN QUERY
  SELECT 
    'unusual_translation_volume'::TEXT as event_type,
    'low'::TEXT as severity,
    'High volume translation requests from single user'::TEXT as description,
    1::INTEGER as affected_users,
    COUNT(*)::INTEGER as event_count,
    MIN(created_at) as first_seen,
    MAX(created_at) as last_seen
  FROM audit_logs
  WHERE 
    created_at >= NOW() - p_time_window
    AND action_type = 'translation_request'
    AND user_id IS NOT NULL
  GROUP BY user_id
  HAVING COUNT(*) >= 100;
  
  -- 检测API滥用
  RETURN QUERY
  SELECT 
    'api_abuse'::TEXT as event_type,
    'high'::TEXT as severity,
    'High frequency API requests from same IP'::TEXT as description,
    COUNT(DISTINCT user_id)::INTEGER as affected_users,
    COUNT(*)::INTEGER as event_count,
    MIN(created_at) as first_seen,
    MAX(created_at) as last_seen
  FROM audit_logs
  WHERE 
    created_at >= NOW() - p_time_window
    AND action_type = 'api_request'
  GROUP BY ip_address
  HAVING COUNT(*) >= 1000;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 创建数据清理函数（定期清理旧日志）
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(
  p_retention_days INTEGER DEFAULT 90
) RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM audit_logs
  WHERE created_at < NOW() - (p_retention_days || ' days')::INTERVAL;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  -- 记录清理操作
  INSERT INTO audit_logs (
    action_type,
    resource_type,
    details,
    success,
    created_at
  ) VALUES (
    'system_maintenance',
    'audit_logs',
    jsonb_build_object(
      'operation', 'cleanup',
      'deleted_count', v_deleted_count,
      'retention_days', p_retention_days
    ),
    true,
    NOW()
  );
  
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. 行级安全策略
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的审计日志
CREATE POLICY "Users can view their own audit logs" ON audit_logs
  FOR SELECT USING (auth.uid() = user_id);

-- 系统可以插入审计日志
CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- 管理员可以查看所有审计日志
CREATE POLICY "Admins can view all audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- 8. 权限设置
GRANT EXECUTE ON FUNCTION log_audit_event TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_audit_logs TO authenticated;
GRANT EXECUTE ON FUNCTION get_audit_statistics TO authenticated;
GRANT EXECUTE ON FUNCTION detect_security_events TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_audit_logs TO authenticated;

-- 9. 创建定期清理任务（需要pg_cron扩展）
-- SELECT cron.schedule('cleanup-audit-logs', '0 2 * * *', 'SELECT cleanup_old_audit_logs(90);');

-- 注释
COMMENT ON TABLE audit_logs IS '用户操作审计日志表，记录所有重要的用户操作和系统事件';
COMMENT ON FUNCTION log_audit_event IS '记录审计事件的通用函数';
COMMENT ON FUNCTION get_user_audit_logs IS '获取用户审计日志的查询函数';
COMMENT ON FUNCTION get_audit_statistics IS '获取审计统计信息的函数';
COMMENT ON FUNCTION detect_security_events IS '检测安全事件的函数';
COMMENT ON FUNCTION cleanup_old_audit_logs IS '清理旧审计日志的维护函数';
