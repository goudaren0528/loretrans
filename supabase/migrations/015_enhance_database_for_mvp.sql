-- =============================================
-- 增强数据库设计以支持MVP功能
-- 迁移文件: 015_enhance_database_for_mvp.sql
-- 创建时间: 2025-01-03
-- 目标: 完善用户系统、积分系统、支付系统
-- =============================================

-- =============================================
-- 1. 确保用户表结构完整
-- =============================================

-- 检查并添加缺失的列
DO $$
BEGIN
  -- 添加用户偏好设置
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'preferences') THEN
    ALTER TABLE public.users ADD COLUMN preferences JSONB DEFAULT '{
      "language": "zh-CN",
      "notifications": true,
      "theme": "light"
    }'::jsonb;
  END IF;
  
  -- 添加用户统计信息
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'stats') THEN
    ALTER TABLE public.users ADD COLUMN stats JSONB DEFAULT '{
      "total_translations": 0,
      "total_characters": 0,
      "total_spent": 0,
      "favorite_languages": []
    }'::jsonb;
  END IF;
  
  -- 添加用户等级信息
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'tier') THEN
    ALTER TABLE public.users ADD COLUMN tier VARCHAR(20) DEFAULT 'free';
  END IF;
END $$;

-- =============================================
-- 2. 创建翻译历史表
-- =============================================

CREATE TABLE IF NOT EXISTS public.translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  source_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  source_language VARCHAR(10) NOT NULL,
  target_language VARCHAR(10) NOT NULL,
  character_count INTEGER NOT NULL,
  credits_used INTEGER DEFAULT 0,
  translation_method VARCHAR(50) DEFAULT 'nllb',
  translation_time_ms INTEGER,
  quality_score DECIMAL(3,2),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_translations_user_id ON public.translations(user_id);
CREATE INDEX IF NOT EXISTS idx_translations_created_at ON public.translations(created_at);
CREATE INDEX IF NOT EXISTS idx_translations_languages ON public.translations(source_language, target_language);

-- =============================================
-- 3. 创建支付记录表
-- =============================================

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  creem_payment_id VARCHAR(255) UNIQUE,
  creem_order_id VARCHAR(255),
  amount_usd DECIMAL(10,2) NOT NULL,
  credits INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method VARCHAR(50),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE
);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_creem_payment_id ON public.payments(creem_payment_id);

-- =============================================
-- 4. 创建用户会话表（用于限制未登录用户）
-- =============================================

CREATE TABLE IF NOT EXISTS public.guest_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  translation_count INTEGER DEFAULT 0,
  last_translation_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_guest_sessions_session_id ON public.guest_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_guest_sessions_expires_at ON public.guest_sessions(expires_at);

-- =============================================
-- 5. 创建系统配置表
-- =============================================

CREATE TABLE IF NOT EXISTS public.system_config (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- 插入默认配置
INSERT INTO public.system_config (key, value, description) VALUES
  ('free_character_limit', '500', '免费字符限制'),
  ('credit_rate', '0.1', '积分费率（积分/字符）'),
  ('guest_daily_limit', '10', '未登录用户每日翻译限制'),
  ('new_user_bonus', '500', '新用户注册奖励积分'),
  ('supported_languages', '["ht", "lo", "sw", "my", "te", "en"]', '支持的语言代码'),
  ('pricing_plans', '{
    "starter": {"price": 5, "credits": 2500, "name": "Starter"},
    "basic": {"price": 10, "credits": 6000, "name": "Basic"},
    "pro": {"price": 25, "credits": 20000, "name": "Professional"},
    "business": {"price": 50, "credits": 50000, "name": "Business"}
  }', '定价计划配置')
ON CONFLICT (key) DO NOTHING;

-- =============================================
-- 6. 创建积分扣减函数（原子性操作）
-- =============================================

CREATE OR REPLACE FUNCTION public.deduct_user_credits(
  p_user_id UUID,
  p_credit_amount INTEGER,
  p_transaction_reason TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS JSON AS $$
DECLARE
  current_credits INTEGER;
  new_balance INTEGER;
  transaction_id UUID;
BEGIN
  -- 获取当前积分并锁定行
  SELECT credits INTO current_credits 
  FROM public.users 
  WHERE id = p_user_id 
  FOR UPDATE;
  
  -- 检查用户是否存在
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;
  
  -- 检查积分是否足够
  IF current_credits < p_credit_amount THEN
    RAISE EXCEPTION 'Insufficient credits. Required: %, Available: %', p_credit_amount, current_credits;
  END IF;
  
  -- 计算新余额
  new_balance := current_credits - p_credit_amount;
  
  -- 更新用户积分
  UPDATE public.users 
  SET credits = new_balance, 
      updated_at = NOW(),
      stats = stats || jsonb_build_object(
        'total_spent', COALESCE((stats->>'total_spent')::integer, 0) + p_credit_amount
      )
  WHERE id = p_user_id;
  
  -- 记录交易
  INSERT INTO public.credit_transactions (user_id, type, amount, balance, description, metadata)
  VALUES (p_user_id, 'consume', -p_credit_amount, new_balance, p_transaction_reason, p_metadata)
  RETURNING id INTO transaction_id;
  
  -- 返回结果
  RETURN json_build_object(
    'success', true,
    'remaining_credits', new_balance,
    'transaction_id', transaction_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 7. 创建积分充值函数
-- =============================================

CREATE OR REPLACE FUNCTION public.add_user_credits(
  p_user_id UUID,
  p_credit_amount INTEGER,
  p_transaction_reason TEXT,
  p_payment_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS JSON AS $$
DECLARE
  current_credits INTEGER;
  new_balance INTEGER;
  transaction_id UUID;
BEGIN
  -- 获取当前积分
  SELECT credits INTO current_credits 
  FROM public.users 
  WHERE id = p_user_id;
  
  -- 检查用户是否存在
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;
  
  -- 计算新余额
  new_balance := current_credits + p_credit_amount;
  
  -- 更新用户积分
  UPDATE public.users 
  SET credits = new_balance, 
      updated_at = NOW()
  WHERE id = p_user_id;
  
  -- 记录交易
  INSERT INTO public.credit_transactions (user_id, type, amount, balance, description, metadata)
  VALUES (p_user_id, 'purchase', p_credit_amount, new_balance, p_transaction_reason, 
          p_metadata || COALESCE(jsonb_build_object('payment_id', p_payment_id), '{}'::jsonb))
  RETURNING id INTO transaction_id;
  
  -- 返回结果
  RETURN json_build_object(
    'success', true,
    'new_balance', new_balance,
    'transaction_id', transaction_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 8. 创建翻译记录函数
-- =============================================

CREATE OR REPLACE FUNCTION public.record_translation(
  p_user_id UUID,
  p_source_text TEXT,
  p_translated_text TEXT,
  p_source_language VARCHAR(10),
  p_target_language VARCHAR(10),
  p_character_count INTEGER,
  p_credits_used INTEGER DEFAULT 0,
  p_translation_time_ms INTEGER DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
  translation_id UUID;
BEGIN
  -- 插入翻译记录
  INSERT INTO public.translations (
    user_id, source_text, translated_text, source_language, target_language,
    character_count, credits_used, translation_time_ms, metadata
  ) VALUES (
    p_user_id, p_source_text, p_translated_text, p_source_language, p_target_language,
    p_character_count, p_credits_used, p_translation_time_ms, p_metadata
  ) RETURNING id INTO translation_id;
  
  -- 更新用户统计
  IF p_user_id IS NOT NULL THEN
    UPDATE public.users 
    SET stats = stats || jsonb_build_object(
      'total_translations', COALESCE((stats->>'total_translations')::integer, 0) + 1,
      'total_characters', COALESCE((stats->>'total_characters')::integer, 0) + p_character_count
    ),
    updated_at = NOW()
    WHERE id = p_user_id;
  END IF;
  
  RETURN translation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 9. 创建访客限制管理函数
-- =============================================

CREATE OR REPLACE FUNCTION public.check_guest_limit(
  p_session_id VARCHAR(255),
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  session_record RECORD;
  daily_limit INTEGER;
  current_count INTEGER;
BEGIN
  -- 获取每日限制配置
  SELECT (value::text)::integer INTO daily_limit 
  FROM public.system_config 
  WHERE key = 'guest_daily_limit';
  
  daily_limit := COALESCE(daily_limit, 10);
  
  -- 查找或创建会话记录
  SELECT * INTO session_record 
  FROM public.guest_sessions 
  WHERE session_id = p_session_id 
  AND expires_at > NOW();
  
  IF NOT FOUND THEN
    -- 创建新会话
    INSERT INTO public.guest_sessions (session_id, ip_address, user_agent, translation_count)
    VALUES (p_session_id, p_ip_address, p_user_agent, 0);
    current_count := 0;
  ELSE
    current_count := session_record.translation_count;
  END IF;
  
  -- 返回限制状态
  RETURN json_build_object(
    'can_translate', current_count < daily_limit,
    'used', current_count,
    'limit', daily_limit,
    'remaining', daily_limit - current_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 10. 创建访客翻译计数函数
-- =============================================

CREATE OR REPLACE FUNCTION public.increment_guest_translation(
  p_session_id VARCHAR(255)
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.guest_sessions 
  SET translation_count = translation_count + 1,
      last_translation_at = NOW()
  WHERE session_id = p_session_id 
  AND expires_at > NOW();
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 11. 设置行级安全策略
-- =============================================

-- 启用RLS
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_sessions ENABLE ROW LEVEL SECURITY;

-- 翻译记录策略
CREATE POLICY "Users can view their own translations" ON public.translations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own translations" ON public.translations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 支付记录策略
CREATE POLICY "Users can view their own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 访客会话策略（允许匿名访问）
CREATE POLICY "Allow anonymous access to guest sessions" ON public.guest_sessions
  FOR ALL USING (true);

-- =============================================
-- 12. 授予权限
-- =============================================

-- 授予函数执行权限
GRANT EXECUTE ON FUNCTION public.deduct_user_credits(UUID, INTEGER, TEXT, JSONB) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.add_user_credits(UUID, INTEGER, TEXT, TEXT, JSONB) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.record_translation(UUID, TEXT, TEXT, VARCHAR, VARCHAR, INTEGER, INTEGER, INTEGER, JSONB) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.check_guest_limit(VARCHAR, INET, TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.increment_guest_translation(VARCHAR) TO authenticated, anon;

-- 授予表访问权限
GRANT SELECT, INSERT ON public.translations TO authenticated, anon;
GRANT SELECT, INSERT ON public.payments TO authenticated;
GRANT ALL ON public.guest_sessions TO authenticated, anon;
GRANT SELECT ON public.system_config TO authenticated, anon;

-- =============================================
-- 13. 创建清理过期数据的函数
-- =============================================

CREATE OR REPLACE FUNCTION public.cleanup_expired_data()
RETURNS void AS $$
BEGIN
  -- 清理过期的访客会话
  DELETE FROM public.guest_sessions 
  WHERE expires_at < NOW() - INTERVAL '7 days';
  
  -- 清理旧的翻译记录（根据用户等级保留不同时长）
  DELETE FROM public.translations 
  WHERE created_at < NOW() - INTERVAL '7 days'
  AND user_id IN (
    SELECT id FROM public.users WHERE tier = 'free'
  );
  
  -- 记录清理日志
  INSERT INTO public.system_config (key, value, description)
  VALUES ('last_cleanup', to_jsonb(NOW()), '最后清理时间')
  ON CONFLICT (key) DO UPDATE SET value = to_jsonb(NOW()), updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 14. 添加触发器自动更新时间戳
-- =============================================

-- 创建更新时间戳函数
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为相关表添加触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_translations_updated_at ON public.translations;
CREATE TRIGGER update_translations_updated_at
  BEFORE UPDATE ON public.translations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 15. 添加注释
-- =============================================

COMMENT ON TABLE public.translations IS '用户翻译历史记录';
COMMENT ON TABLE public.payments IS '用户支付记录';
COMMENT ON TABLE public.guest_sessions IS '访客会话管理，用于限制未登录用户使用';
COMMENT ON TABLE public.system_config IS '系统配置参数';

COMMENT ON FUNCTION public.deduct_user_credits(UUID, INTEGER, TEXT, JSONB) IS '扣减用户积分，确保原子性操作';
COMMENT ON FUNCTION public.add_user_credits(UUID, INTEGER, TEXT, TEXT, JSONB) IS '增加用户积分，用于充值和奖励';
COMMENT ON FUNCTION public.record_translation(UUID, TEXT, TEXT, VARCHAR, VARCHAR, INTEGER, INTEGER, INTEGER, JSONB) IS '记录翻译历史并更新用户统计';
COMMENT ON FUNCTION public.check_guest_limit(VARCHAR, INET, TEXT) IS '检查访客用户翻译限制';
COMMENT ON FUNCTION public.increment_guest_translation(VARCHAR) IS '增加访客翻译计数';
COMMENT ON FUNCTION public.cleanup_expired_data() IS '清理过期数据，建议定期执行';

-- =============================================
-- 完成迁移
-- =============================================

-- 记录迁移完成
INSERT INTO public.system_config (key, value, description)
VALUES ('migration_015_completed', to_jsonb(NOW()), 'MVP数据库增强迁移完成时间')
ON CONFLICT (key) DO UPDATE SET value = to_jsonb(NOW()), updated_at = NOW();
