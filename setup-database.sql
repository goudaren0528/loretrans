-- Transly数据库设置脚本
-- 在Supabase SQL编辑器中运行此脚本

-- 1. 创建用户表
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT auth.uid(),
    email TEXT UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    credits INTEGER DEFAULT 500,
    role TEXT DEFAULT 'free_user' CHECK (role IN ('admin', 'pro_user', 'free_user', 'guest')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建用户资料表
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT,
    avatar_url TEXT,
    language TEXT DEFAULT 'en',
    timezone TEXT DEFAULT 'UTC',
    notification_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建积分交易表
CREATE TABLE IF NOT EXISTS public.credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('purchase', 'consume', 'reward', 'refund')),
    amount INTEGER NOT NULL,
    balance INTEGER NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 创建支付表
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    creem_payment_id TEXT UNIQUE NOT NULL,
    creem_session_id TEXT,
    amount DECIMAL(10,2) NOT NULL,
    credits INTEGER NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
    payment_method TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 5. 启用行级安全性 (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 6. 创建RLS策略

-- 用户表策略
CREATE POLICY "Users can view own data" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- 用户资料表策略
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 积分交易表策略
CREATE POLICY "Users can view own transactions" ON public.credit_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert transactions" ON public.credit_transactions
    FOR INSERT WITH CHECK (true);

-- 支付表策略
CREATE POLICY "Users can view own payments" ON public.payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage payments" ON public.payments
    FOR ALL WITH CHECK (true);

-- 7. 创建触发器函数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- 创建用户记录
    INSERT INTO public.users (id, email, email_verified)
    VALUES (NEW.id, NEW.email, NEW.email_confirmed);
    
    -- 创建用户资料
    INSERT INTO public.user_profiles (user_id, name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''));
    
    -- 创建初始积分记录
    INSERT INTO public.credit_transactions (user_id, type, amount, balance, description)
    VALUES (NEW.id, 'reward', 500, 500, 'Welcome bonus');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. 创建触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. 创建更新时间戳函数
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. 为所有表添加更新时间戳触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 11. 创建积分管理函数
CREATE OR REPLACE FUNCTION public.consume_credits(
    p_user_id UUID,
    p_amount INTEGER,
    p_description TEXT,
    p_metadata JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    current_balance INTEGER;
    new_balance INTEGER;
BEGIN
    -- 获取当前余额
    SELECT credits INTO current_balance FROM public.users WHERE id = p_user_id;
    
    IF current_balance IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- 检查余额是否足够
    IF current_balance < p_amount THEN
        RETURN FALSE;
    END IF;
    
    -- 计算新余额
    new_balance := current_balance - p_amount;
    
    -- 更新用户余额
    UPDATE public.users SET credits = new_balance WHERE id = p_user_id;
    
    -- 记录交易
    INSERT INTO public.credit_transactions (user_id, type, amount, balance, description, metadata)
    VALUES (p_user_id, 'consume', -p_amount, new_balance, p_description, p_metadata);
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.purchase_credits(
    p_user_id UUID,
    p_amount INTEGER,
    p_payment_id TEXT,
    p_description TEXT DEFAULT 'Credit purchase'
)
RETURNS BOOLEAN AS $$
DECLARE
    current_balance INTEGER;
    new_balance INTEGER;
BEGIN
    -- 获取当前余额
    SELECT credits INTO current_balance FROM public.users WHERE id = p_user_id;
    
    IF current_balance IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- 计算新余额
    new_balance := current_balance + p_amount;
    
    -- 更新用户余额
    UPDATE public.users SET credits = new_balance WHERE id = p_user_id;
    
    -- 记录交易
    INSERT INTO public.credit_transactions (user_id, type, amount, balance, description, metadata)
    VALUES (p_user_id, 'purchase', p_amount, new_balance, p_description, jsonb_build_object('payment_id', p_payment_id));
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. 创建用户统计视图
CREATE OR REPLACE VIEW public.user_stats AS
SELECT 
    u.id,
    u.email,
    u.credits,
    u.created_at,
    up.name,
    up.language,
    COALESCE(SUM(CASE WHEN ct.type = 'consume' THEN -ct.amount ELSE 0 END), 0) as total_consumed,
    COALESCE(SUM(CASE WHEN ct.type = 'purchase' THEN ct.amount ELSE 0 END), 0) as total_purchased,
    COALESCE(COUNT(DISTINCT p.id), 0) as total_payments,
    COALESCE(SUM(p.amount), 0) as total_spent
FROM public.users u
LEFT JOIN public.user_profiles up ON u.id = up.user_id
LEFT JOIN public.credit_transactions ct ON u.id = ct.user_id
LEFT JOIN public.payments p ON u.id = p.user_id AND p.status = 'completed'
GROUP BY u.id, u.email, u.credits, u.created_at, up.name, up.language;

-- 13. 创建索引以提高性能
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON public.credit_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_creem_payment_id ON public.payments(creem_payment_id);

-- 完成
SELECT 'Database setup completed successfully!' as message;
