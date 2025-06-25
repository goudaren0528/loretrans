-- =============================================
-- Transly 数据库性能优化
-- 迁移文件: 006_performance_optimizations.sql
-- 创建时间: 2025-01-25
-- =============================================

-- =============================================
-- 1. 为 user_profiles 表添加索引
-- =============================================

-- 为 name 列添加索引，以加速按名称搜索用户的功能。
-- 使用 GIN 索引和 pg_trgm 扩展可以支持更高效的模糊搜索。
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_user_profiles_name_gin ON public.user_profiles USING gin (name gin_trgm_ops);

COMMENT ON INDEX public.idx_user_profiles_name_gin IS '为用户名称添加GIN索引，优化模糊搜索性能';

-- =============================================
-- 2. 为 payments 表添加复合索引
-- =============================================

-- 为 (user_id, status) 添加复合索引，以优化查询特定用户特定状态的支付记录。
-- 例如，查询某用户所有已完成的支付。
CREATE INDEX IF NOT EXISTS idx_payments_user_id_status ON public.payments(user_id, status);

COMMENT ON INDEX public.idx_payments_user_id_status IS '为用户ID和支付状态添加复合索引，优化支付记录查询';


-- =============================================
-- 3. 为 credit_transactions 表添加额外索引
-- =============================================

-- 虽然已有 (user_id, created_at DESC) 索引，但如果需要频繁查询特定类型的交易，
-- 增加一个包含交易类型的复合索引会更有帮助。
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_type_created ON public.credit_transactions(user_id, type, created_at DESC);

COMMENT ON INDEX public.idx_credit_transactions_user_type_created IS '为用户ID、交易类型和创建时间添加复合索引，优化特定交易类型历史查询';

-- =============================================
-- 完成性能优化
-- =============================================
ANALYZE; -- 分析所有表以更新统计信息 