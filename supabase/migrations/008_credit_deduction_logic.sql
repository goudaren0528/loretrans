-- =============================================
-- Transly 积分扣费逻辑
-- 迁移文件: 008_credit_deduction_logic.sql
-- 创建时间: 2025-01-25
-- =============================================

-- =============================================
-- 1. 创建积分消耗核心函数
-- =============================================
CREATE OR REPLACE FUNCTION public.consume_credits_for_translation(
  p_user_id UUID,
  p_char_count INTEGER
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  new_balance INTEGER
) AS $$
DECLARE
  v_current_credits INTEGER;
  v_cost_credits NUMERIC;
  v_final_cost INTEGER; -- 最终消耗的积分，必须是整数
  v_new_balance INTEGER;
  v_chars_per_credit CONSTANT := 100;
  v_minimum_cost CONSTANT := 0.1;
BEGIN
  -- 输入验证
  IF p_char_count <= 0 THEN
    RETURN QUERY SELECT false, 'Character count must be positive.', 0;
    RETURN;
  END IF;

  -- 获取当前用户积分
  SELECT credits INTO v_current_credits FROM public.users WHERE id = p_user_id;
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'User not found.', 0;
    RETURN;
  END IF;

  -- 计算成本（使用数值类型以保证精度）
  v_cost_credits := p_char_count::NUMERIC / v_chars_per_credit;
  
  -- Supabase/Postgres的积分是整数，我们需要处理小数消耗
  -- 我们的规则是向上取整到最接近的整数积分
  -- 例如，消耗0.11积分，记为消耗1积分。
  -- 这简化了模型，避免了处理小数积分的复杂性。
  v_final_cost := CEIL(v_cost_credits);

  -- 确保最低消耗为1积分
  IF v_final_cost < 1 THEN
    v_final_cost := 1;
  END IF;

  -- 检查余额是否充足
  IF v_current_credits < v_final_cost THEN
    RETURN QUERY SELECT false, 'Insufficient credits.', v_current_credits;
    RETURN;
  END IF;
  
  -- 计算新余额
  v_new_balance := v_current_credits - v_final_cost;

  -- 插入交易记录
  -- 触发器 `sync_credits_on_transaction` 会自动更新 users 表中的余额
  INSERT INTO public.credit_transactions(user_id, type, amount, balance, description, metadata)
  VALUES (
    p_user_id,
    'consume'::transaction_type,
    -v_final_cost, -- 消耗的积分用负数表示
    v_new_balance,
    'Translation of ' || p_char_count || ' characters.',
    jsonb_build_object('char_count', p_char_count, 'calculated_cost', v_cost_credits)
  );

  -- 返回成功
  RETURN QUERY SELECT true, 'Credits consumed successfully.', v_new_balance;

EXCEPTION
  WHEN OTHERS THEN
    -- 发生任何其他错误，返回失败
    RETURN QUERY SELECT false, 'An unexpected error occurred: ' || SQLERRM, v_current_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.consume_credits_for_translation(UUID, INTEGER) IS '为翻译任务消耗用户积分。计算成本，检查余额，并插入交易记录。';

-- =============================================
-- 2. 调整现有约束以适应新的计费模型
-- =============================================
-- 旧的约束要求 'consume' 类型的 amount 必须是负数，这很好。
-- 但我们现在使用整数积分，所以更新一下注释以明确。
COMMENT ON CONSTRAINT valid_amount ON public.credit_transactions IS 'Ensures that credit amounts are positive for additions and negative for deductions. All amounts are integers.'; 