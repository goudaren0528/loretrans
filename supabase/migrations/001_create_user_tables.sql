-- =============================================
-- Transly 用户系统数据库表结构
-- 迁移文件: 001_create_user_tables.sql
-- 创建时间: 2025-01-25
-- =============================================

-- 启用UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. 用户表 (users)
-- 扩展Supabase Auth用户数据
-- =============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  credits INTEGER NOT NULL DEFAULT 500, -- 注册奖励500积分
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 添加用户表注释
COMMENT ON TABLE public.users IS '用户基本信息表，扩展Supabase Auth用户数据';
COMMENT ON COLUMN public.users.id IS '用户ID，关联auth.users表';
COMMENT ON COLUMN public.users.email IS '用户邮箱';
COMMENT ON COLUMN public.users.email_verified IS '邮箱验证状态';
COMMENT ON COLUMN public.users.credits IS '用户积分余额';
COMMENT ON COLUMN public.users.created_at IS '账户创建时间';
COMMENT ON COLUMN public.users.updated_at IS '账户更新时间';

-- =============================================
-- 2. 用户资料表 (user_profiles)
-- 存储用户扩展信息
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT,
  avatar_url TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  notification_preferences JSONB DEFAULT '{"email": true, "push": true}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- 确保每个用户只有一个资料
  UNIQUE(user_id)
);

-- 添加用户资料表注释
COMMENT ON TABLE public.user_profiles IS '用户扩展资料表';
COMMENT ON COLUMN public.user_profiles.user_id IS '关联用户ID';
COMMENT ON COLUMN public.user_profiles.name IS '用户显示名称';
COMMENT ON COLUMN public.user_profiles.avatar_url IS '用户头像URL';
COMMENT ON COLUMN public.user_profiles.language IS '用户界面语言偏好';
COMMENT ON COLUMN public.user_profiles.timezone IS '用户时区';
COMMENT ON COLUMN public.user_profiles.notification_preferences IS '通知偏好设置';

-- =============================================
-- 3. 积分交易记录表 (credit_transactions)
-- 记录所有积分变动
-- =============================================
CREATE TYPE transaction_type AS ENUM ('purchase', 'consume', 'reward', 'refund');

CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  amount INTEGER NOT NULL, -- 积分变动数量（正数增加，负数减少）
  balance INTEGER NOT NULL, -- 交易后的积分余额
  description TEXT NOT NULL,
  metadata JSONB, -- 额外数据（如翻译文本长度、支付ID等）
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- 约束检查
  CONSTRAINT positive_balance CHECK (balance >= 0),
  CONSTRAINT valid_amount CHECK (
    (type IN ('purchase', 'reward', 'refund') AND amount > 0) OR
    (type = 'consume' AND amount < 0)
  )
);

-- 添加积分交易表注释
COMMENT ON TABLE public.credit_transactions IS '积分交易记录表';
COMMENT ON COLUMN public.credit_transactions.user_id IS '用户ID';
COMMENT ON COLUMN public.credit_transactions.type IS '交易类型：purchase(购买), consume(消费), reward(奖励), refund(退款)';
COMMENT ON COLUMN public.credit_transactions.amount IS '积分变动数量';
COMMENT ON COLUMN public.credit_transactions.balance IS '交易后积分余额';
COMMENT ON COLUMN public.credit_transactions.description IS '交易描述';
COMMENT ON COLUMN public.credit_transactions.metadata IS '交易元数据（JSON格式）';

-- =============================================
-- 4. 支付记录表 (payments)
-- 记录Creem支付信息
-- =============================================
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'cancelled', 'refunded');

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  creem_payment_id TEXT NOT NULL UNIQUE, -- Creem支付ID
  creem_session_id TEXT, -- Creem会话ID
  amount DECIMAL(10,2) NOT NULL, -- 支付金额（USD）
  credits INTEGER NOT NULL, -- 购买的积分数量
  status payment_status NOT NULL DEFAULT 'pending',
  payment_method TEXT, -- 支付方式
  metadata JSONB, -- Creem返回的额外数据
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ, -- 支付完成时间
  
  -- 约束检查
  CONSTRAINT positive_amount CHECK (amount > 0),
  CONSTRAINT positive_credits CHECK (credits > 0)
);

-- 添加支付记录表注释
COMMENT ON TABLE public.payments IS '支付记录表，集成Creem支付';
COMMENT ON COLUMN public.payments.user_id IS '用户ID';
COMMENT ON COLUMN public.payments.creem_payment_id IS 'Creem支付唯一标识';
COMMENT ON COLUMN public.payments.creem_session_id IS 'Creem支付会话ID';
COMMENT ON COLUMN public.payments.amount IS '支付金额（美元）';
COMMENT ON COLUMN public.payments.credits IS '购买的积分数量';
COMMENT ON COLUMN public.payments.status IS '支付状态';
COMMENT ON COLUMN public.payments.payment_method IS '支付方式';
COMMENT ON COLUMN public.payments.metadata IS 'Creem支付元数据';
COMMENT ON COLUMN public.payments.completed_at IS '支付完成时间';

-- =============================================
-- 5. 创建索引以优化查询性能
-- =============================================

-- 用户表索引
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

-- 用户资料表索引
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);

-- 积分交易表索引
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON public.credit_transactions(type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON public.credit_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_created ON public.credit_transactions(user_id, created_at DESC);

-- 支付记录表索引
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_creem_payment_id ON public.payments(creem_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at);

-- =============================================
-- 6. 创建更新时间自动触发器
-- =============================================

-- 创建更新时间函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为users表添加更新时间触发器
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON public.users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 为user_profiles表添加更新时间触发器
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON public.user_profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 7. 创建积分余额同步函数
-- =============================================

-- 创建积分余额同步函数
CREATE OR REPLACE FUNCTION sync_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  -- 更新用户表中的积分余额
  UPDATE public.users 
  SET credits = NEW.balance, updated_at = now()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为credit_transactions表添加积分同步触发器
CREATE TRIGGER sync_credits_on_transaction
  AFTER INSERT ON public.credit_transactions
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_credits();

-- =============================================
-- 8. 创建用户注册触发器
-- =============================================

-- 创建用户注册时自动创建资料的函数
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 在users表中插入用户记录
  INSERT INTO public.users (id, email, email_verified, credits)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.email_confirmed_at IS NOT NULL,
    500 -- 注册奖励500积分
  );
  
  -- 在user_profiles表中创建用户资料
  INSERT INTO public.user_profiles (user_id, name, language)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'),
    COALESCE(NEW.raw_user_meta_data->>'language', 'en')
  );
  
  -- 创建注册奖励积分记录
  INSERT INTO public.credit_transactions (user_id, type, amount, balance, description, metadata)
  VALUES (
    NEW.id,
    'reward',
    500,
    500,
    '注册奖励',
    '{"reward_type": "signup"}'::jsonb
  );
  
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- 为auth.users表添加注册触发器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =============================================
-- 迁移完成标记
-- =============================================
-- 插入迁移记录（如果使用迁移管理系统）
-- INSERT INTO schema_migrations (version) VALUES ('001_create_user_tables'); 