-- =============================================
-- Transly 加密数据RLS策略配置
-- 迁移文件: 005_update_rls_for_encryption.sql
-- 创建时间: 2025-01-25
-- =============================================

-- =============================================
-- 1. user_profiles表加密列RLS策略
-- =============================================

-- 用户只能更新自己的加密数据
CREATE POLICY "Users can update own encrypted data" ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 禁止用户直接读取加密列
-- 解密操作必须通过安全函数进行
CREATE POLICY "Deny direct read access to encrypted column" ON public.user_profiles
  FOR SELECT
  USING (false);

-- =============================================
-- 2. 调整现有策略以允许服务角色访问
-- =============================================

-- 我们需要调整现有的 'user_profiles' 表策略，以确保服务角色可以访问
-- 首先，删除可能冲突的旧服务角色策略（如果存在）
DROP POLICY IF EXISTS "Service role has full access to profiles" ON public.user_profiles;

-- 创建一个新的、更通用的服务角色策略
CREATE POLICY "Service accounts can bypass all policies" ON public.user_profiles
  FOR ALL
  USING (bypasses_rls())
  WITH CHECK (bypasses_rls());

-- 注意: 'bypasses_rls()' 是一个内置的Supabase函数，当使用service_role密钥时返回true

-- =============================================
-- 3. 调整现有SELECT策略
-- =============================================
-- 之前的RLS文件创建了一个策略，允许用户查看自己的个人资料。
-- 我需要更新它，以便它可以与拒绝直接读取加密列的新策略共存。
-- `SELECT` 策略应该是 `PERMISSIVE` 的，这意味着如果任何一个 `SELECT` 策略允许访问，那么访问就会被授予。
-- `Deny direct read...` 策略应该是 `RESTRICTIVE` 的（尽管默认是 PERMISSIVE）。
-- 为了简单起见，我将确保基础的 SELECT 策略存在且为 PERMISSIVE。

-- 删除可能存在的旧策略以避免冲突
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;

-- 重新创建，确保是 PERMISSIVE (默认)
CREATE POLICY "Users can view own profile" ON public.user_profiles
  AS PERMISSIVE
  FOR SELECT
  USING (auth.uid() = user_id);

-- 现在，明确地将拒绝策略设置为 RESTRICTIVE
DROP POLICY IF EXISTS "Deny direct read access to encrypted column" ON public.user_profiles;

CREATE POLICY "Deny direct read access to encrypted column" ON public.user_profiles
  AS RESTRICTIVE
  FOR SELECT
  USING (false);

-- =============================================
-- 完成加密RLS策略配置
-- ============================================= 