-- =============================================
-- 修复积分函数，确保与产品文档需求一致
-- 迁移文件: 014_fix_credit_functions.sql
-- 创建时间: 2025-01-26
-- =============================================

-- =============================================
-- 1. 修复积分消费函数，实现正确的计费逻辑
-- =============================================

-- 删除旧的函数
DROP FUNCTION IF EXISTS public.consume_credits_for_translation(UUID, INTEGER);

-- 创建新的积分消费函数，符合产品文档需求
CREATE OR REPLACE FUNCTION public.consume_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance INTEGER;
  new_balance INTEGER;
BEGIN
  -- 检查用户是否存在并获取当前积分
  SELECT credits INTO current_balance 
  FROM public.users 
  WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION '用户不存在';
  END IF;
  
  -- 检查积分是否足够
  IF current_balance < p_amount THEN
    RAISE EXCEPTION '积分不足，当前余额: %, 需要: %', current_balance, p_amount;
  END IF;
  
  -- 计算新余额
  new_balance := current_balance - p_amount;
  
  -- 插入消费记录
  INSERT INTO public.credit_transactions (user_id, type, amount, balance, description, metadata)
  VALUES (p_user_id, 'consume', -p_amount, new_balance, p_description, p_metadata);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 2. 创建积分退款函数
-- =============================================

CREATE OR REPLACE FUNCTION public.refund_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance INTEGER;
  new_balance INTEGER;
BEGIN
  -- 获取当前积分
  SELECT credits INTO current_balance 
  FROM public.users 
  WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION '用户不存在';
  END IF;
  
  -- 计算新余额
  new_balance := current_balance + p_amount;
  
  -- 插入退款记录
  INSERT INTO public.credit_transactions (user_id, type, amount, balance, description, metadata)
  VALUES (p_user_id, 'refund', p_amount, new_balance, p_description, p_metadata);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 3. 确保积分购买函数存在且正确
-- =============================================

CREATE OR REPLACE FUNCTION public.purchase_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_payment_id TEXT,
  p_description TEXT DEFAULT '积分购买'
)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance INTEGER;
  new_balance INTEGER;
BEGIN
  -- 获取当前积分
  SELECT credits INTO current_balance 
  FROM public.users 
  WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION '用户不存在';
  END IF;
  
  -- 计算新余额
  new_balance := current_balance + p_amount;
  
  -- 插入购买记录
  INSERT INTO public.credit_transactions (user_id, type, amount, balance, description, metadata)
  VALUES (p_user_id, 'purchase', p_amount, new_balance, p_description, 
          jsonb_build_object('payment_id', p_payment_id));
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 4. 确保获取积分函数正确
-- =============================================

CREATE OR REPLACE FUNCTION public.get_user_credits(p_user_id UUID DEFAULT auth.uid())
RETURNS INTEGER AS $$
DECLARE
  balance INTEGER;
BEGIN
  -- 只允许用户查看自己的积分或管理员查看
  IF p_user_id != auth.uid() AND NOT (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() 
      AND metadata->>'role' = 'admin'
    )
  ) THEN
    RAISE EXCEPTION '权限不足';
  END IF;
  
  SELECT credits INTO balance FROM public.users WHERE id = p_user_id;
  RETURN COALESCE(balance, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 5. 添加函数注释
-- =============================================

COMMENT ON FUNCTION public.consume_credits(UUID, INTEGER, TEXT, JSONB) IS '消费用户积分，检查余额并记录交易';
COMMENT ON FUNCTION public.refund_credits(UUID, INTEGER, TEXT, JSONB) IS '退还用户积分，用于翻译失败等情况';
COMMENT ON FUNCTION public.purchase_credits(UUID, INTEGER, TEXT, TEXT) IS '购买积分，用于支付成功后充值';
COMMENT ON FUNCTION public.get_user_credits(UUID) IS '获取用户积分余额，支持权限检查';

-- =============================================
-- 6. 授予执行权限
-- =============================================

-- 授予认证用户执行权限
GRANT EXECUTE ON FUNCTION public.consume_credits(UUID, INTEGER, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.refund_credits(UUID, INTEGER, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.purchase_credits(UUID, INTEGER, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_credits(UUID) TO authenticated;

-- 授予服务角色执行权限
GRANT EXECUTE ON FUNCTION public.consume_credits(UUID, INTEGER, TEXT, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.refund_credits(UUID, INTEGER, TEXT, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.purchase_credits(UUID, INTEGER, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_user_credits(UUID) TO service_role;
