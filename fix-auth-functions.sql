-- 修复认证相关的数据库函数安全问题

-- 1. 修复 handle_new_user 函数 - 这是关键的用户创建触发器
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- 创建用户记录
    INSERT INTO public.users (id, email, email_verified, credits, role)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.email_confirmed, false), 500, 'free_user')
    ON CONFLICT (id) DO NOTHING;
    
    -- 创建用户资料
    INSERT INTO public.user_profiles (user_id, name, language, timezone)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'name', 'User'), 
        'en', 
        'UTC'
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    -- 创建初始积分记录
    INSERT INTO public.credit_transactions (user_id, type, amount, balance, description)
    VALUES (NEW.id, 'reward', 500, 500, 'Welcome bonus')
    ON CONFLICT DO NOTHING;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- 记录错误但不阻止认证用户创建
        RAISE LOG 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$;

-- 2. 修复其他函数的 search_path 问题
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- 3. 修复积分消费函数
CREATE OR REPLACE FUNCTION public.consume_credits(
    user_id_param UUID,
    amount_param INTEGER,
    description_param TEXT DEFAULT 'Credit consumption'
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    current_balance INTEGER;
    new_balance INTEGER;
BEGIN
    SELECT credits INTO current_balance 
    FROM public.users 
    WHERE id = user_id_param;
    
    IF current_balance IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;
    
    IF current_balance < amount_param THEN
        RETURN FALSE;
    END IF;
    
    new_balance := current_balance - amount_param;
    
    UPDATE public.users 
    SET credits = new_balance, updated_at = CURRENT_TIMESTAMP
    WHERE id = user_id_param;
    
    INSERT INTO public.credit_transactions (user_id, type, amount, balance, description)
    VALUES (user_id_param, 'consumption', -amount_param, new_balance, description_param);
    
    RETURN TRUE;
END;
$$;

-- 4. 修复积分购买函数
CREATE OR REPLACE FUNCTION public.purchase_credits(
    user_id_param UUID,
    amount_param INTEGER,
    description_param TEXT DEFAULT 'Credit purchase'
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    current_balance INTEGER;
    new_balance INTEGER;
BEGIN
    SELECT credits INTO current_balance 
    FROM public.users 
    WHERE id = user_id_param;
    
    IF current_balance IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;
    
    new_balance := current_balance + amount_param;
    
    UPDATE public.users 
    SET credits = new_balance, updated_at = CURRENT_TIMESTAMP
    WHERE id = user_id_param;
    
    INSERT INTO public.credit_transactions (user_id, type, amount, balance, description)
    VALUES (user_id_param, 'purchase', amount_param, new_balance, description_param);
    
    RETURN TRUE;
END;
$$;

-- 5. 重新创建触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

-- 6. 确保触发器权限正确
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;

-- 7. 检查并修复表权限
GRANT INSERT ON public.users TO authenticated;
GRANT INSERT ON public.user_profiles TO authenticated;
GRANT INSERT ON public.credit_transactions TO authenticated;

-- 8. 添加调试信息
CREATE OR REPLACE FUNCTION public.debug_auth_trigger()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE LOG 'Auth user created: id=%, email=%', NEW.id, NEW.email;
    RETURN NEW;
END;
$$;

-- 临时添加调试触发器
DROP TRIGGER IF EXISTS debug_auth_user_created ON auth.users;
CREATE TRIGGER debug_auth_user_created
    BEFORE INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.debug_auth_trigger();
