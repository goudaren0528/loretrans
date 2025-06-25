-- =============================================
-- Transly 增强行级安全策略（RLS）配置
-- 迁移文件: 003_enhance_rls_security.sql
-- 创建时间: 2025-01-25
-- =============================================

-- =============================================
-- 1. 增强用户数据安全策略
-- =============================================

-- 添加用户数据完整性检查策略
CREATE POLICY "Enforce user data integrity" ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    -- 确保用户不能修改敏感字段
    auth.uid() = id 
    AND OLD.id = NEW.id 
    AND OLD.created_at = NEW.created_at
    AND OLD.credits >= NEW.credits  -- 积分只能减少，不能直接增加
  );

-- 添加用户资料更新验证策略
CREATE POLICY "Validate profile updates" ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND OLD.user_id = NEW.user_id
    AND OLD.created_at = NEW.created_at
    -- 验证邮箱格式
    AND (NEW.email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' OR NEW.email IS NULL)
    -- 限制昵称长度
    AND (LENGTH(NEW.display_name) <= 50 OR NEW.display_name IS NULL)
  );

-- =============================================
-- 2. 积分交易安全增强
-- =============================================

-- 添加积分交易合法性检查
CREATE POLICY "Validate credit transactions" ON public.credit_transactions
  FOR INSERT
  WITH CHECK (
    -- 只允许特定类型的交易
    transaction_type IN ('purchase', 'consume', 'reward', 'refund')
    -- 确保金额合理（不能为负数，不能超过最大限制）
    AND amount > 0
    AND amount <= 1000000  -- 单次交易最大100万积分
    -- 描述不能为空
    AND description IS NOT NULL
    AND LENGTH(description) > 0
    AND LENGTH(description) <= 500
    -- 用户ID必须存在
    AND EXISTS (SELECT 1 FROM public.users WHERE id = user_id)
  );

-- 禁止用户直接操作积分交易记录
CREATE POLICY "Block direct transaction manipulation" ON public.credit_transactions
  FOR ALL
  USING (
    -- 只有系统角色或管理员可以操作
    current_setting('role') = 'service_role'
    OR EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() 
      AND metadata->>'role' = 'admin'
    )
  );

-- =============================================
-- 3. 支付记录安全增强
-- =============================================

-- 添加支付记录验证策略
CREATE POLICY "Validate payment records" ON public.payments
  FOR INSERT
  WITH CHECK (
    -- 验证支付状态
    status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')
    -- 验证支付金额
    AND amount > 0
    AND amount <= 100000  -- 单次支付最大1000美元
    -- 验证货币代码
    AND currency IN ('USD', 'EUR', 'GBP', 'JPY', 'CNY', 'AUD', 'CAD')
    -- 外部支付ID不能为空
    AND external_payment_id IS NOT NULL
    AND LENGTH(external_payment_id) > 0
    -- 用户ID必须存在
    AND EXISTS (SELECT 1 FROM public.users WHERE id = user_id)
  );

-- 限制支付记录更新（只能更新状态和元数据）
CREATE POLICY "Restrict payment updates" ON public.payments
  FOR UPDATE
  USING (true)
  WITH CHECK (
    -- 只能更新状态、更新时间和元数据
    OLD.id = NEW.id
    AND OLD.user_id = NEW.user_id
    AND OLD.amount = NEW.amount
    AND OLD.currency = NEW.currency
    AND OLD.external_payment_id = NEW.external_payment_id
    AND OLD.created_at = NEW.created_at
    -- 状态转换必须合法
    AND (
      (OLD.status = 'pending' AND NEW.status IN ('completed', 'failed', 'cancelled'))
      OR (OLD.status = 'completed' AND NEW.status = 'refunded')
      OR (OLD.status = OLD.status) -- 允许保持相同状态
    )
  );

-- =============================================
-- 4. 创建审计日志表和策略
-- =============================================

-- 创建审计日志表
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  user_id UUID REFERENCES auth.users(id),
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- 索引
  CONSTRAINT audit_logs_table_operation_idx UNIQUE (table_name, operation, created_at)
);

-- 为审计日志表启用RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 只有管理员可以查看审计日志
CREATE POLICY "Only admins can view audit logs" ON public.audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() 
      AND metadata->>'role' = 'admin'
    )
  );

-- 系统可以插入审计日志
CREATE POLICY "System can insert audit logs" ON public.audit_logs
  FOR INSERT
  WITH CHECK (true);

-- =============================================
-- 5. 创建安全监控函数
-- =============================================

-- 创建异常活动检测函数
CREATE OR REPLACE FUNCTION detect_suspicious_activity(
  p_user_id UUID DEFAULT auth.uid(),
  p_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
  activity_type TEXT,
  count INTEGER,
  risk_level TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH activity_stats AS (
    -- 检查短时间内大量积分交易
    SELECT 
      'high_volume_transactions' as activity_type,
      COUNT(*)::INTEGER as count,
      CASE 
        WHEN COUNT(*) > 100 THEN 'HIGH'
        WHEN COUNT(*) > 50 THEN 'MEDIUM'
        ELSE 'LOW'
      END as risk_level
    FROM public.credit_transactions
    WHERE user_id = p_user_id
    AND created_at > NOW() - INTERVAL '1 hour' * p_hours
    
    UNION ALL
    
    -- 检查频繁的支付尝试
    SELECT 
      'frequent_payment_attempts' as activity_type,
      COUNT(*)::INTEGER as count,
      CASE 
        WHEN COUNT(*) > 10 THEN 'HIGH'
        WHEN COUNT(*) > 5 THEN 'MEDIUM'
        ELSE 'LOW'
      END as risk_level
    FROM public.payments
    WHERE user_id = p_user_id
    AND created_at > NOW() - INTERVAL '1 hour' * p_hours
    
    UNION ALL
    
    -- 检查大额积分消费
    SELECT 
      'large_credit_consumption' as activity_type,
      COUNT(*)::INTEGER as count,
      CASE 
        WHEN COUNT(*) > 5 THEN 'HIGH'
        WHEN COUNT(*) > 2 THEN 'MEDIUM'
        ELSE 'LOW'
      END as risk_level
    FROM public.credit_transactions
    WHERE user_id = p_user_id
    AND transaction_type = 'consume'
    AND amount > 10000  -- 大于10000积分的消费
    AND created_at > NOW() - INTERVAL '1 hour' * p_hours
  )
  SELECT * FROM activity_stats WHERE count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建用户权限检查函数
CREATE OR REPLACE FUNCTION check_user_permissions(
  p_user_id UUID DEFAULT auth.uid(),
  p_resource TEXT DEFAULT NULL,
  p_action TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
  is_verified BOOLEAN;
  account_status TEXT;
BEGIN
  -- 获取用户信息
  SELECT 
    COALESCE(metadata->>'role', 'user'),
    COALESCE((metadata->>'email_verified')::boolean, false),
    COALESCE(metadata->>'account_status', 'active')
  INTO user_role, is_verified, account_status
  FROM public.user_profiles
  WHERE user_id = p_user_id;
  
  -- 检查账户状态
  IF account_status != 'active' THEN
    RETURN false;
  END IF;
  
  -- 基本权限检查
  CASE p_action
    WHEN 'translate' THEN
      -- 翻译功能需要验证邮箱（可选）
      RETURN true;
    WHEN 'purchase_credits' THEN
      -- 购买积分需要验证邮箱
      RETURN is_verified;
    WHEN 'admin_access' THEN
      -- 管理员访问
      RETURN user_role = 'admin';
    ELSE
      -- 默认允许
      RETURN true;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 6. 创建数据完整性约束
-- =============================================

-- 添加用户积分余额约束
ALTER TABLE public.users 
ADD CONSTRAINT check_positive_credits 
CHECK (credits >= 0);

-- 添加积分交易金额约束
ALTER TABLE public.credit_transactions 
ADD CONSTRAINT check_positive_amount 
CHECK (amount > 0);

-- 添加支付金额约束
ALTER TABLE public.payments 
ADD CONSTRAINT check_positive_payment_amount 
CHECK (amount > 0);

-- 添加用户资料约束
ALTER TABLE public.user_profiles 
ADD CONSTRAINT check_email_format 
CHECK (email IS NULL OR email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE public.user_profiles 
ADD CONSTRAINT check_display_name_length 
CHECK (display_name IS NULL OR LENGTH(display_name) BETWEEN 1 AND 50);

-- =============================================
-- 7. 创建安全触发器
-- =============================================

-- 创建用户积分变更审计触发器
CREATE OR REPLACE FUNCTION audit_user_credits_change()
RETURNS TRIGGER AS $$
BEGIN
  -- 记录积分变更
  IF OLD.credits != NEW.credits THEN
    INSERT INTO public.audit_logs (
      table_name,
      operation,
      user_id,
      old_values,
      new_values
    ) VALUES (
      'users',
      'UPDATE',
      NEW.id,
      jsonb_build_object('credits', OLD.credits),
      jsonb_build_object('credits', NEW.credits)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 绑定触发器到users表
CREATE TRIGGER trigger_audit_user_credits
  AFTER UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION audit_user_credits_change();

-- 创建支付状态变更审计触发器
CREATE OR REPLACE FUNCTION audit_payment_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- 记录支付状态变更
  IF OLD.status != NEW.status THEN
    INSERT INTO public.audit_logs (
      table_name,
      operation,
      user_id,
      old_values,
      new_values
    ) VALUES (
      'payments',
      'UPDATE',
      NEW.user_id,
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 绑定触发器到payments表
CREATE TRIGGER trigger_audit_payment_status
  AFTER UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION audit_payment_status_change();

-- =============================================
-- 8. 创建安全视图
-- =============================================

-- 创建安全的用户统计视图
CREATE OR REPLACE VIEW secure_user_stats AS
SELECT 
  u.id,
  u.email,
  u.credits,
  up.display_name,
  up.language,
  COUNT(ct.id) as total_transactions,
  COALESCE(SUM(CASE WHEN ct.transaction_type = 'consume' THEN ct.amount ELSE 0 END), 0) as total_consumed,
  COALESCE(SUM(CASE WHEN ct.transaction_type = 'purchase' THEN ct.amount ELSE 0 END), 0) as total_purchased,
  COUNT(p.id) as total_payments,
  COALESCE(SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END), 0) as total_paid
FROM public.users u
LEFT JOIN public.user_profiles up ON u.id = up.user_id
LEFT JOIN public.credit_transactions ct ON u.id = ct.user_id
LEFT JOIN public.payments p ON u.id = p.user_id
WHERE u.id = auth.uid()  -- 只能查看自己的统计
GROUP BY u.id, u.email, u.credits, up.display_name, up.language;

-- 为安全视图启用RLS
ALTER VIEW secure_user_stats SET (security_invoker = true);

-- =============================================
-- 9. 创建数据保留策略
-- =============================================

-- 创建定期清理函数（清理旧的审计日志）
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(
  p_retention_days INTEGER DEFAULT 90
)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- 删除超过保留期的审计日志
  DELETE FROM public.audit_logs
  WHERE created_at < NOW() - INTERVAL '1 day' * p_retention_days;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 注释：实际生产环境中，应该通过pg_cron或外部调度器定期执行清理

-- =============================================
-- 10. 创建安全配置表
-- =============================================

-- 创建系统配置表（用于存储安全相关配置）
CREATE TABLE IF NOT EXISTS public.system_configs (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 为系统配置表启用RLS
ALTER TABLE public.system_configs ENABLE ROW LEVEL SECURITY;

-- 只有管理员可以查看和修改系统配置
CREATE POLICY "Only admins can access system configs" ON public.system_configs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() 
      AND metadata->>'role' = 'admin'
    )
  );

-- 插入默认安全配置
INSERT INTO public.system_configs (key, value, description) VALUES
('security.max_daily_transactions', '100', '用户每日最大交易次数'),
('security.max_transaction_amount', '10000', '单次交易最大积分数'),
('security.require_email_verification', 'false', '是否要求邮箱验证'),
('security.session_timeout_hours', '24', '会话超时时间（小时）'),
('security.max_failed_login_attempts', '5', '最大登录失败次数'),
('audit.retention_days', '90', '审计日志保留天数')
ON CONFLICT (key) DO NOTHING;

-- =============================================
-- 完成增强安全策略配置
-- =============================================

-- 添加注释记录
COMMENT ON TABLE public.audit_logs IS '系统审计日志表，记录重要操作的审计信息';
COMMENT ON TABLE public.system_configs IS '系统配置表，存储安全和业务相关的配置参数';
COMMENT ON VIEW secure_user_stats IS '安全的用户统计视图，用户只能查看自己的数据';

-- 刷新统计信息
ANALYZE public.users;
ANALYZE public.user_profiles;
ANALYZE public.credit_transactions;
ANALYZE public.payments;
ANALYZE public.audit_logs;
ANALYZE public.system_configs; 