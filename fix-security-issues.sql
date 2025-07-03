-- 修复安全问题的SQL脚本

-- 1. 修复 handle_new_user 函数的 search_path 问题
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- 检查用户记录是否已存在，避免重复插入
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
        -- 创建用户记录
        INSERT INTO public.users (id, email, email_verified, credits, role)
        VALUES (NEW.id, NEW.email, NEW.email_confirmed, 500, 'free_user');
    END IF;
    
    -- 检查用户资料是否已存在
    IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = NEW.id) THEN
        -- 创建用户资料
        INSERT INTO public.user_profiles (user_id, name, language, timezone)
        VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'User'), 'en', 'UTC');
    END IF;
    
    -- 检查积分记录是否已存在
    IF NOT EXISTS (SELECT 1 FROM public.credit_transactions WHERE user_id = NEW.id AND description = 'Welcome bonus') THEN
        -- 创建初始积分记录
        INSERT INTO public.credit_transactions (user_id, type, amount, balance, description)
        VALUES (NEW.id, 'reward', 500, 500, 'Welcome bonus');
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- 记录错误但不阻止用户创建
        RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. 修复 update_updated_at_column 函数
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. 修复 consume_credits 函数
CREATE OR REPLACE FUNCTION public.consume_credits(
    user_id_param UUID,
    amount_param INTEGER,
    description_param TEXT DEFAULT 'Credit consumption'
)
RETURNS BOOLEAN AS $$
DECLARE
    current_balance INTEGER;
    new_balance INTEGER;
BEGIN
    -- 获取当前积分余额
    SELECT credits INTO current_balance 
    FROM public.users 
    WHERE id = user_id_param;
    
    -- 检查余额是否足够
    IF current_balance IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;
    
    IF current_balance < amount_param THEN
        RETURN FALSE;
    END IF;
    
    -- 计算新余额
    new_balance := current_balance - amount_param;
    
    -- 更新用户积分
    UPDATE public.users 
    SET credits = new_balance, updated_at = CURRENT_TIMESTAMP
    WHERE id = user_id_param;
    
    -- 记录积分交易
    INSERT INTO public.credit_transactions (user_id, type, amount, balance, description)
    VALUES (user_id_param, 'consumption', -amount_param, new_balance, description_param);
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. 修复 purchase_credits 函数
CREATE OR REPLACE FUNCTION public.purchase_credits(
    user_id_param UUID,
    amount_param INTEGER,
    description_param TEXT DEFAULT 'Credit purchase'
)
RETURNS BOOLEAN AS $$
DECLARE
    current_balance INTEGER;
    new_balance INTEGER;
BEGIN
    -- 获取当前积分余额
    SELECT credits INTO current_balance 
    FROM public.users 
    WHERE id = user_id_param;
    
    -- 检查用户是否存在
    IF current_balance IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;
    
    -- 计算新余额
    new_balance := current_balance + amount_param;
    
    -- 更新用户积分
    UPDATE public.users 
    SET credits = new_balance, updated_at = CURRENT_TIMESTAMP
    WHERE id = user_id_param;
    
    -- 记录积分交易
    INSERT INTO public.credit_transactions (user_id, type, amount, balance, description)
    VALUES (user_id_param, 'purchase', amount_param, new_balance, description_param);
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. 修复 user_stats 视图的安全定义器问题
DROP VIEW IF EXISTS public.user_stats;
CREATE VIEW public.user_stats AS
SELECT 
    u.id,
    u.email,
    u.credits,
    u.role,
    u.created_at as user_created_at,
    up.name,
    up.language,
    up.timezone,
    COALESCE(ct.total_consumed, 0) as total_credits_consumed,
    COALESCE(ct.total_purchased, 0) as total_credits_purchased,
    COALESCE(ct.transaction_count, 0) as transaction_count
FROM public.users u
LEFT JOIN public.user_profiles up ON u.id = up.user_id
LEFT JOIN (
    SELECT 
        user_id,
        SUM(CASE WHEN amount < 0 THEN -amount ELSE 0 END) as total_consumed,
        SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as total_purchased,
        COUNT(*) as transaction_count
    FROM public.credit_transactions
    GROUP BY user_id
) ct ON u.id = ct.user_id;

-- 6. 重新创建触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. 确保所有表都有正确的更新时间戳触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
