-- 临时禁用触发器，让API处理用户创建
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 可选：删除触发器函数
-- DROP FUNCTION IF EXISTS public.handle_new_user();
