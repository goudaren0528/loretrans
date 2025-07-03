-- 修复用户创建触发器
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 重新创建触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
