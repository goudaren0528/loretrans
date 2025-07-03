-- 积分系统原子操作函数
-- 解决并发用户同时翻译时的积分重复扣减问题

-- 1. 原子性积分消耗函数
CREATE OR REPLACE FUNCTION consume_credits_atomic(
  p_user_id UUID,
  p_credits_required INTEGER,
  p_character_count INTEGER,
  p_source_lang TEXT,
  p_target_lang TEXT,
  p_translation_type TEXT DEFAULT 'text'
) RETURNS JSON AS $$
DECLARE
  v_result JSON;
  v_current_credits INTEGER;
  v_transaction_id UUID;
BEGIN
  -- 生成事务ID用于审计
  v_transaction_id := gen_random_uuid();
  
  -- 原子性更新积分余额
  UPDATE user_credits 
  SET 
    credits = credits - p_credits_required,
    updated_at = NOW()
  WHERE 
    user_id = p_user_id 
    AND credits >= p_credits_required
  RETURNING credits INTO v_current_credits;
  
  -- 检查更新是否成功
  IF v_current_credits IS NULL THEN
    -- 获取当前积分余额用于错误信息
    SELECT credits INTO v_current_credits 
    FROM user_credits 
    WHERE user_id = p_user_id;
    
    RAISE EXCEPTION 'Insufficient credits. Required: %, Available: %', 
      p_credits_required, COALESCE(v_current_credits, 0);
  END IF;
  
  -- 记录积分消耗日志
  INSERT INTO credit_transactions (
    id,
    user_id,
    transaction_type,
    credits_amount,
    credits_before,
    credits_after,
    character_count,
    source_language,
    target_language,
    translation_type,
    created_at,
    metadata
  ) VALUES (
    v_transaction_id,
    p_user_id,
    'consume',
    -p_credits_required,
    v_current_credits + p_credits_required,
    v_current_credits,
    p_character_count,
    p_source_lang,
    p_target_lang,
    p_translation_type,
    NOW(),
    jsonb_build_object(
      'atomic_operation', true,
      'function_version', '1.0'
    )
  );
  
  -- 返回操作结果
  SELECT jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'credits_consumed', p_credits_required,
    'credits_remaining', v_current_credits,
    'timestamp', NOW()
  ) INTO v_result;
  
  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- 记录错误日志
    INSERT INTO credit_transactions (
      id,
      user_id,
      transaction_type,
      credits_amount,
      character_count,
      source_language,
      target_language,
      translation_type,
      created_at,
      metadata,
      error_message
    ) VALUES (
      gen_random_uuid(),
      p_user_id,
      'consume_failed',
      -p_credits_required,
      p_character_count,
      p_source_lang,
      p_target_lang,
      p_translation_type,
      NOW(),
      jsonb_build_object(
        'atomic_operation', true,
        'function_version', '1.0',
        'error_code', SQLSTATE
      ),
      SQLERRM
    );
    
    -- 返回错误结果
    SELECT jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'error_code', SQLSTATE,
      'timestamp', NOW()
    ) INTO v_result;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 积分余额实时校验函数
CREATE OR REPLACE FUNCTION validate_credit_balance(
  p_user_id UUID
) RETURNS JSON AS $$
DECLARE
  v_credits INTEGER;
  v_pending_transactions INTEGER;
  v_result JSON;
BEGIN
  -- 获取当前积分余额
  SELECT credits INTO v_credits
  FROM user_credits
  WHERE user_id = p_user_id;
  
  -- 检查是否有待处理的积分事务
  SELECT COUNT(*) INTO v_pending_transactions
  FROM credit_transactions
  WHERE 
    user_id = p_user_id
    AND transaction_type = 'consume'
    AND created_at > NOW() - INTERVAL '5 minutes'
    AND metadata->>'status' = 'pending';
  
  SELECT jsonb_build_object(
    'user_id', p_user_id,
    'credits_available', COALESCE(v_credits, 0),
    'pending_transactions', v_pending_transactions,
    'last_updated', NOW(),
    'is_valid', v_credits IS NOT NULL AND v_credits >= 0
  ) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 积分退款函数（翻译失败时使用）
CREATE OR REPLACE FUNCTION refund_credits_atomic(
  p_transaction_id UUID,
  p_reason TEXT DEFAULT 'translation_failed'
) RETURNS JSON AS $$
DECLARE
  v_original_transaction RECORD;
  v_result JSON;
  v_refund_transaction_id UUID;
BEGIN
  -- 生成退款事务ID
  v_refund_transaction_id := gen_random_uuid();
  
  -- 获取原始事务信息
  SELECT * INTO v_original_transaction
  FROM credit_transactions
  WHERE id = p_transaction_id
    AND transaction_type = 'consume';
  
  IF v_original_transaction IS NULL THEN
    RAISE EXCEPTION 'Original transaction not found: %', p_transaction_id;
  END IF;
  
  -- 检查是否已经退款
  IF EXISTS (
    SELECT 1 FROM credit_transactions
    WHERE metadata->>'original_transaction_id' = p_transaction_id::text
      AND transaction_type = 'refund'
  ) THEN
    RAISE EXCEPTION 'Transaction already refunded: %', p_transaction_id;
  END IF;
  
  -- 原子性退还积分
  UPDATE user_credits
  SET 
    credits = credits + ABS(v_original_transaction.credits_amount),
    updated_at = NOW()
  WHERE user_id = v_original_transaction.user_id;
  
  -- 记录退款事务
  INSERT INTO credit_transactions (
    id,
    user_id,
    transaction_type,
    credits_amount,
    character_count,
    source_language,
    target_language,
    translation_type,
    created_at,
    metadata
  ) VALUES (
    v_refund_transaction_id,
    v_original_transaction.user_id,
    'refund',
    ABS(v_original_transaction.credits_amount),
    v_original_transaction.character_count,
    v_original_transaction.source_language,
    v_original_transaction.target_language,
    v_original_transaction.translation_type,
    NOW(),
    jsonb_build_object(
      'original_transaction_id', p_transaction_id,
      'refund_reason', p_reason,
      'atomic_operation', true
    )
  );
  
  SELECT jsonb_build_object(
    'success', true,
    'refund_transaction_id', v_refund_transaction_id,
    'credits_refunded', ABS(v_original_transaction.credits_amount),
    'reason', p_reason,
    'timestamp', NOW()
  ) INTO v_result;
  
  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    SELECT jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'error_code', SQLSTATE,
      'timestamp', NOW()
    ) INTO v_result;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 创建积分事务表（如果不存在）
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('consume', 'refund', 'purchase', 'bonus', 'consume_failed')),
  credits_amount INTEGER NOT NULL,
  credits_before INTEGER,
  credits_after INTEGER,
  character_count INTEGER,
  source_language TEXT,
  target_language TEXT,
  translation_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  error_message TEXT,
  
  -- 索引
  CONSTRAINT credit_transactions_user_id_idx UNIQUE (user_id, created_at, id)
);

-- 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_type_date 
ON credit_transactions(user_id, transaction_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_metadata_status 
ON credit_transactions USING GIN(metadata) 
WHERE metadata ? 'status';

-- 5. 创建积分余额校验触发器
CREATE OR REPLACE FUNCTION check_credit_balance_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- 确保积分余额不会变成负数
  IF NEW.credits < 0 THEN
    RAISE EXCEPTION 'Credit balance cannot be negative. Attempted balance: %', NEW.credits;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 应用触发器到user_credits表
DROP TRIGGER IF EXISTS trigger_check_credit_balance ON user_credits;
CREATE TRIGGER trigger_check_credit_balance
  BEFORE UPDATE ON user_credits
  FOR EACH ROW
  EXECUTE FUNCTION check_credit_balance_trigger();

-- 6. 权限设置
GRANT EXECUTE ON FUNCTION consume_credits_atomic TO authenticated;
GRANT EXECUTE ON FUNCTION validate_credit_balance TO authenticated;
GRANT EXECUTE ON FUNCTION refund_credits_atomic TO authenticated;

-- 7. 行级安全策略
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own credit transactions" ON credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert credit transactions" ON credit_transactions
  FOR INSERT WITH CHECK (true);

-- 注释
COMMENT ON FUNCTION consume_credits_atomic IS '原子性积分消耗函数，防止并发竞态条件';
COMMENT ON FUNCTION validate_credit_balance IS '积分余额实时校验函数';
COMMENT ON FUNCTION refund_credits_atomic IS '积分退款函数，用于翻译失败时退还积分';
COMMENT ON TABLE credit_transactions IS '积分事务记录表，用于审计和追踪所有积分变动';
