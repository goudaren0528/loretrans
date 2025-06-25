-- =============================================
-- Transly 数据库加密功能配置
-- 迁移文件: 004_setup_encryption.sql
-- 创建时间: 2025-01-25
-- =============================================

-- =============================================
-- 1. 启用 pgsodium 扩展
-- =============================================
-- pgsodium 默认在 Supabase 项目中启用，这里确保它存在
CREATE EXTENSION IF NOT EXISTS pgsodium WITH SCHEMA pgsodium;

-- =============================================
-- 2. 创建加密和解密函数
-- =============================================
-- 注意: 此函数依赖于一个预先存在于 Supabase Vault 中的密钥。
-- 您需要在 Supabase Dashboard -> Project Settings -> Vault 中创建一个新的密钥
-- 并将其UUID复制到下面的函数中，替换 'key_id_from_supabase_vault'。
--
-- 示例密钥ID: 'e1c6b4e3-89e6-42d1-b2b1-d15f7c3b3cb8'
--
-- 文档: https://supabase.com/docs/guides/database/vault

CREATE OR REPLACE FUNCTION public.encrypt_secret(
  p_secret TEXT,
  p_key_id UUID
)
RETURNS bytea AS $$
BEGIN
  RETURN pgsodium.crypto_aead_encrypt(
    p_secret::bytea,
    '{}'::bytea,
    p_key_id,
    ''
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.decrypt_secret(
  p_encrypted_secret bytea,
  p_key_id UUID
)
RETURNS TEXT AS $$
BEGIN
  RETURN convert_from(
    pgsodium.crypto_aead_decrypt(
      p_encrypted_secret,
      '{}'::bytea,
      p_key_id,
      ''
    ),
    'utf8'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================
-- 3. 修改 user_profiles 表
-- =============================================
-- 添加用于存储加密数据的列
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS encrypted_metadata bytea;

-- 添加注释
COMMENT ON COLUMN public.user_profiles.encrypted_metadata IS '用于存储加密后的用户敏感信息，例如第三方API密钥';

-- =============================================
-- 4. 刷新统计信息
-- =============================================
ANALYZE public.user_profiles;

-- =============================================
-- 完成加密功能配置
-- =============================================
COMMENT ON FUNCTION public.encrypt_secret IS '使用Vault中的密钥加密敏感数据';
COMMENT ON FUNCTION public.decrypt_secret IS '使用Vault中的密钥解密敏感数据'; 