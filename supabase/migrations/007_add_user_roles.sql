-- =============================================
-- Transly 用户角色与权限系统
-- 迁移文件: 007_add_user_roles.sql
-- 创建时间: 2025-01-25
-- =============================================

-- =============================================
-- 1. 创建 user_role 枚举类型
-- =============================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('admin', 'pro_user', 'free_user');
    END IF;
END$$;

COMMENT ON TYPE public.user_role IS '定义系统中的用户角色：admin(管理员), pro_user(付费用户), free_user(免费用户)';

-- =============================================
-- 2. 向 users 表添加 role 列
-- =============================================
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS role public.user_role NOT NULL DEFAULT 'free_user';

COMMENT ON COLUMN public.users.role IS '用户的角色，决定其权限';

-- =============================================
-- 3. 为新列添加索引
-- =============================================
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

COMMENT ON INDEX public.idx_users_role IS '为用户角色列添加索引，以优化按角色查询';

-- =============================================
-- 4. 创建一个函数来检查用户角色（可选，但推荐）
-- =============================================
CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id UUID)
RETURNS public.user_role AS $$
DECLARE
  v_role public.user_role;
BEGIN
  SELECT role INTO v_role FROM public.users WHERE id = p_user_id;
  RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_user_role(UUID) IS '获取指定用户的角色';

-- =============================================
-- 完成用户角色添加
-- =============================================
ANALYZE public.users; 