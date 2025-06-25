-- =============================================
-- Transly 行级安全策略（RLS）配置
-- 迁移文件: 002_setup_rls_policies.sql
-- 创建时间: 2025-01-25
-- =============================================

-- =============================================
-- 1. 启用行级安全（RLS）
-- =============================================

-- 为所有用户相关表启用RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 2. users表安全策略
-- =============================================

-- 用户只能查看自己的记录
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- 用户只能更新自己的记录（除了credits字段，由系统管理）
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 系统服务可以插入用户记录（通过触发器）
CREATE POLICY "System can insert users" ON public.users
  FOR INSERT
  WITH CHECK (true);

-- 管理员可以查看所有用户（可选，用于管理面板）
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() 
      AND metadata->>'role' = 'admin'
    )
  );

-- =============================================
-- 3. user_profiles表安全策略
-- =============================================

-- 用户只能查看自己的资料
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- 用户只能更新自己的资料
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 系统可以插入用户资料（通过触发器）
CREATE POLICY "System can insert profiles" ON public.user_profiles
  FOR INSERT
  WITH CHECK (true);

-- 管理员可以查看所有用户资料
CREATE POLICY "Admins can view all profiles" ON public.user_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() 
      AND metadata->>'role' = 'admin'
    )
  );

-- =============================================
-- 4. credit_transactions表安全策略
-- =============================================

-- 用户只能查看自己的积分交易记录
CREATE POLICY "Users can view own transactions" ON public.credit_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- 只有系统可以插入积分交易记录（保证数据完整性）
CREATE POLICY "System can insert transactions" ON public.credit_transactions
  FOR INSERT
  WITH CHECK (true);

-- 禁止用户直接更新或删除交易记录
-- 这些操作只能通过应用逻辑进行

-- 管理员可以查看所有交易记录
CREATE POLICY "Admins can view all transactions" ON public.credit_transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() 
      AND metadata->>'role' = 'admin'
    )
  );

-- =============================================
-- 5. payments表安全策略
-- =============================================

-- 用户只能查看自己的支付记录
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT
  USING (auth.uid() = user_id);

-- 只有系统可以插入支付记录
CREATE POLICY "System can insert payments" ON public.payments
  FOR INSERT
  WITH CHECK (true);

-- 只有系统可以更新支付状态
CREATE POLICY "System can update payments" ON public.payments
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 管理员可以查看所有支付记录
CREATE POLICY "Admins can view all payments" ON public.payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() 
      AND metadata->>'role' = 'admin'
    )
  );

-- =============================================
-- 6. 创建服务角色策略（用于后端API）
-- =============================================

-- 创建服务角色，用于后端API访问
-- 注意：在实际部署时，需要在Supabase控制台配置服务密钥

-- 服务角色可以绕过RLS进行所有操作
-- 这样后端API可以安全地管理用户数据和积分

-- 为服务角色创建特殊策略
CREATE POLICY "Service role has full access to users" ON public.users
  USING (current_setting('role') = 'service_role')
  WITH CHECK (current_setting('role') = 'service_role');

CREATE POLICY "Service role has full access to profiles" ON public.user_profiles
  USING (current_setting('role') = 'service_role')
  WITH CHECK (current_setting('role') = 'service_role');

CREATE POLICY "Service role has full access to transactions" ON public.credit_transactions
  USING (current_setting('role') = 'service_role')
  WITH CHECK (current_setting('role') = 'service_role');

CREATE POLICY "Service role has full access to payments" ON public.payments
  USING (current_setting('role') = 'service_role')
  WITH CHECK (current_setting('role') = 'service_role');

-- =============================================
-- 7. 创建实时订阅策略
-- =============================================

-- 启用Realtime功能，用于实时更新用户数据
-- 用户只能订阅自己的数据变化

-- 为users表启用实时订阅
ALTER publication supabase_realtime ADD TABLE public.users;

-- 为user_profiles表启用实时订阅
ALTER publication supabase_realtime ADD TABLE public.user_profiles;

-- 为credit_transactions表启用实时订阅
ALTER publication supabase_realtime ADD TABLE public.credit_transactions;

-- 为payments表启用实时订阅
ALTER publication supabase_realtime ADD TABLE public.payments;

-- =============================================
-- 8. 创建数据库函数用于安全操作
-- =============================================

-- 创建安全的积分消费函数
CREATE OR REPLACE FUNCTION consume_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance INTEGER;
  new_balance INTEGER;
BEGIN
  -- 检查用户是否存在并获取当前积分
  SELECT credits INTO current_balance 
  FROM public.users 
  WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION '用户不存在';
  END IF;
  
  -- 检查积分是否足够
  IF current_balance < p_amount THEN
    RETURN FALSE;
  END IF;
  
  -- 计算新余额
  new_balance := current_balance - p_amount;
  
  -- 插入消费记录
  INSERT INTO public.credit_transactions (user_id, type, amount, balance, description, metadata)
  VALUES (p_user_id, 'consume', -p_amount, new_balance, p_description, p_metadata);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建安全的积分购买函数
CREATE OR REPLACE FUNCTION purchase_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_payment_id UUID,
  p_description TEXT DEFAULT '积分购买'
)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance INTEGER;
  new_balance INTEGER;
BEGIN
  -- 获取当前积分
  SELECT credits INTO current_balance 
  FROM public.users 
  WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION '用户不存在';
  END IF;
  
  -- 计算新余额
  new_balance := current_balance + p_amount;
  
  -- 插入购买记录
  INSERT INTO public.credit_transactions (user_id, type, amount, balance, description, metadata)
  VALUES (p_user_id, 'purchase', p_amount, new_balance, p_description, 
          jsonb_build_object('payment_id', p_payment_id));
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建获取用户积分余额的安全函数
CREATE OR REPLACE FUNCTION get_user_credits(p_user_id UUID DEFAULT auth.uid())
RETURNS INTEGER AS $$
DECLARE
  balance INTEGER;
BEGIN
  -- 只允许用户查看自己的积分或管理员查看
  IF p_user_id != auth.uid() AND NOT (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() 
      AND metadata->>'role' = 'admin'
    )
  ) THEN
    RAISE EXCEPTION '权限不足';
  END IF;
  
  SELECT credits INTO balance FROM public.users WHERE id = p_user_id;
  RETURN COALESCE(balance, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 9. 创建视图用于数据统计
-- =============================================

-- 创建用户统计视图（仅管理员可见）
CREATE VIEW user_stats AS
SELECT 
  u.id,
  u.email,
  u.credits,
  u.created_at,
  up.name,
  up.language,
  COALESCE(trans_stats.total_consumed, 0) as total_consumed,
  COALESCE(trans_stats.total_purchased, 0) as total_purchased,
  COALESCE(payment_stats.total_payments, 0) as total_payments,
  COALESCE(payment_stats.total_spent, 0) as total_spent
FROM public.users u
LEFT JOIN public.user_profiles up ON u.id = up.user_id
LEFT JOIN (
  SELECT 
    user_id,
    SUM(CASE WHEN type = 'consume' THEN ABS(amount) ELSE 0 END) as total_consumed,
    SUM(CASE WHEN type = 'purchase' THEN amount ELSE 0 END) as total_purchased
  FROM public.credit_transactions
  GROUP BY user_id
) trans_stats ON u.id = trans_stats.user_id
LEFT JOIN (
  SELECT 
    user_id,
    COUNT(*) as total_payments,
    SUM(amount) as total_spent
  FROM public.payments
  WHERE status = 'completed'
  GROUP BY user_id
) payment_stats ON u.id = payment_stats.user_id;

-- 为统计视图添加RLS
ALTER VIEW user_stats SET (security_barrier = true);

-- 只有管理员可以查看统计视图
CREATE POLICY "Only admins can view user stats" ON user_stats
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() 
      AND metadata->>'role' = 'admin'
    )
  );

-- =============================================
-- RLS策略配置完成标记
-- =============================================
-- 插入迁移记录（如果使用迁移管理系统）
-- INSERT INTO schema_migrations (version) VALUES ('002_setup_rls_policies'); 