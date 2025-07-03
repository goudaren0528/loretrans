-- 清理数据库脚本（测试阶段使用）
-- 注意：这将删除所有用户数据！

-- 1. 删除所有积分交易记录
DELETE FROM public.credit_transactions;

-- 2. 删除所有用户资料
DELETE FROM public.user_profiles;

-- 3. 删除所有用户记录
DELETE FROM public.users;

-- 4. 删除所有支付记录（如果有）
DELETE FROM public.payments;

-- 5. 重置序列（如果有自增ID）
-- ALTER SEQUENCE IF EXISTS users_id_seq RESTART WITH 1;

-- 6. 显示清理结果
SELECT 'users' as table_name, COUNT(*) as remaining_records FROM public.users
UNION ALL
SELECT 'user_profiles' as table_name, COUNT(*) as remaining_records FROM public.user_profiles
UNION ALL
SELECT 'credit_transactions' as table_name, COUNT(*) as remaining_records FROM public.credit_transactions
UNION ALL
SELECT 'payments' as table_name, COUNT(*) as remaining_records FROM public.payments;
