-- 修复 purchase_credits 函数，确保更新用户积分余额

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
  
  -- 更新用户积分余额 (这是关键的修复)
  UPDATE public.users 
  SET credits = new_balance, updated_at = NOW()
  WHERE id = p_user_id;
  
  -- 插入购买记录
  INSERT INTO public.credit_transactions (user_id, type, amount, balance, description, metadata)
  VALUES (p_user_id, 'purchase', p_amount, new_balance, p_description, 
          jsonb_build_object('payment_id', p_payment_id));
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 授予执行权限
GRANT EXECUTE ON FUNCTION public.purchase_credits(UUID, INTEGER, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.purchase_credits(UUID, INTEGER, TEXT, TEXT) TO service_role;

COMMENT ON FUNCTION public.purchase_credits(UUID, INTEGER, TEXT, TEXT) IS '购买积分并更新用户余额，用于支付成功后充值';
