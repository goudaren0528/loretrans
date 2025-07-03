-- =============================================
-- 管理员功能数据库表
-- 迁移文件: 017_admin_tables.sql
-- 创建时间: 2025-01-03
-- 目标: 支持管理员后台功能
-- =============================================

-- =============================================
-- 1. 管理员访问日志表
-- =============================================

CREATE TABLE IF NOT EXISTS public.admin_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_admin_access_logs_user_id ON public.admin_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_access_logs_action ON public.admin_access_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_access_logs_timestamp ON public.admin_access_logs(timestamp);

-- =============================================
-- 2. 系统配置管理表（扩展）
-- =============================================

-- 添加管理员配置
INSERT INTO public.system_config (key, value, description) VALUES
  ('admin_emails', '["admin@transly.app", "support@transly.app"]', '管理员邮箱列表'),
  ('system_maintenance', 'false', '系统维护模式开关'),
  ('feature_flags', '{
    "new_user_onboarding": true,
    "achievement_system": true,
    "feedback_system": true,
    "analytics_tracking": true
  }', '功能开关配置')
ON CONFLICT (key) DO NOTHING;

-- =============================================
-- 3. 系统监控表
-- =============================================

CREATE TABLE IF NOT EXISTS public.system_health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('healthy', 'degraded', 'unhealthy')),
  response_time INTEGER,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_system_health_checks_service ON public.system_health_checks(service_name);
CREATE INDEX IF NOT EXISTS idx_system_health_checks_status ON public.system_health_checks(status);
CREATE INDEX IF NOT EXISTS idx_system_health_checks_checked_at ON public.system_health_checks(checked_at);

-- =============================================
-- 4. 系统告警表
-- =============================================

CREATE TABLE IF NOT EXISTS public.system_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_system_alerts_type ON public.system_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_system_alerts_severity ON public.system_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_system_alerts_resolved ON public.system_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_system_alerts_created_at ON public.system_alerts(created_at);

-- =============================================
-- 5. 创建系统健康检查函数
-- =============================================

CREATE OR REPLACE FUNCTION public.record_health_check(
  p_service_name VARCHAR(100),
  p_status VARCHAR(20),
  p_response_time INTEGER DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
  health_check_id UUID;
BEGIN
  INSERT INTO public.system_health_checks (
    service_name, status, response_time, error_message, metadata
  ) VALUES (
    p_service_name, p_status, p_response_time, p_error_message, p_metadata
  ) RETURNING id INTO health_check_id;
  
  -- 如果服务不健康，创建告警
  IF p_status IN ('degraded', 'unhealthy') THEN
    INSERT INTO public.system_alerts (
      alert_type, severity, title, message, metadata
    ) VALUES (
      'service_health',
      CASE WHEN p_status = 'unhealthy' THEN 'high' ELSE 'medium' END,
      p_service_name || ' 服务异常',
      COALESCE(p_error_message, p_service_name || ' 服务状态: ' || p_status),
      jsonb_build_object(
        'service_name', p_service_name,
        'status', p_status,
        'response_time', p_response_time
      )
    );
  END IF;
  
  RETURN health_check_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 6. 创建系统告警函数
-- =============================================

CREATE OR REPLACE FUNCTION public.create_system_alert(
  p_alert_type VARCHAR(50),
  p_severity VARCHAR(20),
  p_title VARCHAR(255),
  p_message TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
  alert_id UUID;
BEGIN
  INSERT INTO public.system_alerts (
    alert_type, severity, title, message, metadata
  ) VALUES (
    p_alert_type, p_severity, p_title, p_message, p_metadata
  ) RETURNING id INTO alert_id;
  
  RETURN alert_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 7. 创建管理员统计视图
-- =============================================

CREATE OR REPLACE VIEW public.admin_dashboard_stats AS
SELECT 
  -- 用户统计
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(DISTINCT user_id) FROM public.translations 
   WHERE created_at >= NOW() - INTERVAL '7 days') as active_users_7d,
  (SELECT COUNT(DISTINCT user_id) FROM public.translations 
   WHERE created_at >= NOW() - INTERVAL '30 days') as active_users_30d,
  
  -- 翻译统计
  (SELECT COUNT(*) FROM public.translations) as total_translations,
  (SELECT COUNT(*) FROM public.translations 
   WHERE created_at >= NOW() - INTERVAL '24 hours') as translations_24h,
  (SELECT COUNT(*) FROM public.translations 
   WHERE created_at >= NOW() - INTERVAL '7 days') as translations_7d,
  
  -- 错误统计
  (SELECT COUNT(*) FROM public.javascript_errors 
   WHERE timestamp >= NOW() - INTERVAL '24 hours') as js_errors_24h,
  (SELECT COUNT(*) FROM public.translation_errors 
   WHERE timestamp >= NOW() - INTERVAL '24 hours') as translation_errors_24h,
  
  -- 反馈统计
  (SELECT COUNT(*) FROM public.user_feedback 
   WHERE created_at >= NOW() - INTERVAL '7 days') as feedback_7d,
  (SELECT AVG(rating) FROM public.user_feedback 
   WHERE rating IS NOT NULL AND created_at >= NOW() - INTERVAL '30 days') as avg_rating_30d,
  
  -- 系统健康
  (SELECT COUNT(*) FROM public.system_alerts WHERE NOT resolved) as unresolved_alerts,
  
  -- 更新时间
  NOW() as updated_at;

-- =============================================
-- 8. 设置行级安全策略
-- =============================================

-- 管理员访问日志表（只有管理员可以查看）
ALTER TABLE public.admin_access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view admin logs" ON public.admin_access_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.system_config 
      WHERE key = 'admin_emails' 
      AND value::jsonb ? (auth.jwt() ->> 'email')
    )
  );

-- 系统健康检查表（只有管理员可以查看）
ALTER TABLE public.system_health_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view health checks" ON public.system_health_checks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.system_config 
      WHERE key = 'admin_emails' 
      AND value::jsonb ? (auth.jwt() ->> 'email')
    )
  );

-- 系统告警表（只有管理员可以查看和更新）
ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can manage alerts" ON public.system_alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.system_config 
      WHERE key = 'admin_emails' 
      AND value::jsonb ? (auth.jwt() ->> 'email')
    )
  );

-- =============================================
-- 9. 授予权限
-- =============================================

-- 授予函数执行权限
GRANT EXECUTE ON FUNCTION public.record_health_check(VARCHAR, VARCHAR, INTEGER, TEXT, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.create_system_alert(VARCHAR, VARCHAR, VARCHAR, TEXT, JSONB) TO service_role;

-- 授予表访问权限（仅服务角色，通过RLS控制实际访问）
GRANT SELECT, INSERT ON public.admin_access_logs TO service_role;
GRANT SELECT, INSERT ON public.system_health_checks TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.system_alerts TO service_role;

-- 授予视图访问权限
GRANT SELECT ON public.admin_dashboard_stats TO service_role;

-- =============================================
-- 10. 创建定期清理函数
-- =============================================

CREATE OR REPLACE FUNCTION public.cleanup_admin_data()
RETURNS void AS $$
BEGIN
  -- 清理30天前的管理员访问日志
  DELETE FROM public.admin_access_logs 
  WHERE timestamp < NOW() - INTERVAL '30 days';
  
  -- 清理7天前的健康检查记录
  DELETE FROM public.system_health_checks 
  WHERE checked_at < NOW() - INTERVAL '7 days';
  
  -- 清理已解决的30天前的告警
  DELETE FROM public.system_alerts 
  WHERE resolved = true AND resolved_at < NOW() - INTERVAL '30 days';
  
  -- 记录清理日志
  INSERT INTO public.system_config (key, value, description)
  VALUES ('last_admin_cleanup', to_jsonb(NOW()), '最后管理员数据清理时间')
  ON CONFLICT (key) DO UPDATE SET value = to_jsonb(NOW()), updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 11. 添加注释
-- =============================================

COMMENT ON TABLE public.admin_access_logs IS '管理员访问日志表';
COMMENT ON TABLE public.system_health_checks IS '系统健康检查记录表';
COMMENT ON TABLE public.system_alerts IS '系统告警表';
COMMENT ON VIEW public.admin_dashboard_stats IS '管理员仪表板统计视图';

COMMENT ON FUNCTION public.record_health_check(VARCHAR, VARCHAR, INTEGER, TEXT, JSONB) IS '记录系统健康检查结果';
COMMENT ON FUNCTION public.create_system_alert(VARCHAR, VARCHAR, VARCHAR, TEXT, JSONB) IS '创建系统告警';
COMMENT ON FUNCTION public.cleanup_admin_data() IS '清理管理员相关的过期数据';

-- =============================================
-- 完成迁移
-- =============================================

-- 记录迁移完成
INSERT INTO public.system_config (key, value, description)
VALUES ('migration_017_completed', to_jsonb(NOW()), '管理员功能数据库表创建完成时间')
ON CONFLICT (key) DO UPDATE SET value = to_jsonb(NOW()), updated_at = NOW();
