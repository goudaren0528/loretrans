-- 设置角色为 service_role
SET ROLE service_role;

-- 执行迁移
-- 异步翻译队列系统
-- 支持长文本和文档翻译的后台处理，用户可以离开页面后继续处理

-- 1. 翻译任务表
CREATE TABLE IF NOT EXISTS translation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL CHECK (job_type IN ('text', 'document', 'batch')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'completed', 'failed', 'cancelled', 'partial_success'
  )),
  priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10), -- 1最高优先级，10最低
  
  -- 翻译参数
  source_language TEXT NOT NULL,
  target_language TEXT NOT NULL,
  
  -- 内容信息
  original_content TEXT, -- 原始文本内容
  file_info JSONB, -- 文件信息（文档翻译时使用）
  content_chunks JSONB DEFAULT '[]', -- 分块内容
  
  -- 翻译结果
  translated_content TEXT, -- 完整翻译结果
  translated_chunks JSONB DEFAULT '[]', -- 分块翻译结果
  partial_results JSONB DEFAULT '[]', -- 部分翻译结果（失败时保存已完成部分）
  
  -- 进度信息
  total_chunks INTEGER DEFAULT 1,
  completed_chunks INTEGER DEFAULT 0,
  failed_chunks INTEGER DEFAULT 0,
  progress_percentage DECIMAL(5,2) DEFAULT 0.00,
  
  -- 积分信息
  estimated_credits INTEGER DEFAULT 0,
  consumed_credits INTEGER DEFAULT 0,
  refunded_credits INTEGER DEFAULT 0,
  credit_transaction_ids JSONB DEFAULT '[]',
  
  -- 处理信息
  processing_started_at TIMESTAMPTZ,
  processing_completed_at TIMESTAMPTZ,
  processing_time_ms INTEGER,
  worker_id TEXT, -- 处理该任务的worker标识
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  
  -- 错误信息
  error_message TEXT,
  error_details JSONB,
  
  -- 元数据
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days', -- 任务过期时间
  
  -- 索引
  CONSTRAINT translation_jobs_user_created_idx UNIQUE (user_id, created_at, id)
);

-- 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_translation_jobs_status_priority 
ON translation_jobs(status, priority, created_at) WHERE status IN ('pending', 'processing');

CREATE INDEX IF NOT EXISTS idx_translation_jobs_user_status 
ON translation_jobs(user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_translation_jobs_expires_at 
ON translation_jobs(expires_at) WHERE status NOT IN ('completed', 'cancelled');

CREATE INDEX IF NOT EXISTS idx_translation_jobs_worker_processing 
ON translation_jobs(worker_id, processing_started_at) WHERE status = 'processing';

-- 2. 翻译队列管理函数

-- 创建翻译任务
CREATE OR REPLACE FUNCTION create_translation_job(
  p_user_id UUID,
  p_job_type TEXT,
  p_source_language TEXT,
  p_target_language TEXT,
  p_original_content TEXT DEFAULT NULL,
  p_file_info JSONB DEFAULT NULL,
  p_priority INTEGER DEFAULT 5,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  v_job_id UUID;
  v_estimated_credits INTEGER;
  v_content_chunks JSONB;
  v_total_chunks INTEGER;
BEGIN
  -- 生成任务ID
  v_job_id := gen_random_uuid();
  
  -- 计算预估积分和分块
  IF p_job_type = 'text' THEN
    -- 文本翻译：按500字符分块
    v_content_chunks := jsonb_build_array();
    IF p_original_content IS NOT NULL THEN
      -- 简化分块逻辑，实际应该更智能
      v_total_chunks := CEIL(LENGTH(p_original_content) / 500.0);
      v_estimated_credits := GREATEST(0, CEIL((LENGTH(p_original_content) - 500) * 0.1));
      
      -- 创建分块
      FOR i IN 0..v_total_chunks-1 LOOP
        v_content_chunks := v_content_chunks || jsonb_build_object(
          'chunk_id', i,
          'content', SUBSTRING(p_original_content FROM i*500+1 FOR 500),
          'status', 'pending'
        );
      END LOOP;
    END IF;
  ELSIF p_job_type = 'document' THEN
    -- 文档翻译：根据文件大小估算
    v_total_chunks := COALESCE((p_file_info->>'estimated_chunks')::INTEGER, 1);
    v_estimated_credits := COALESCE((p_file_info->>'estimated_credits')::INTEGER, 0);
    v_content_chunks := COALESCE(p_file_info->'chunks', '[]'::jsonb);
  ELSE
    v_total_chunks := 1;
    v_estimated_credits := 0;
    v_content_chunks := '[]'::jsonb;
  END IF;
  
  -- 插入翻译任务
  INSERT INTO translation_jobs (
    id,
    user_id,
    job_type,
    source_language,
    target_language,
    original_content,
    file_info,
    content_chunks,
    total_chunks,
    estimated_credits,
    priority,
    metadata,
    created_at,
    updated_at
  ) VALUES (
    v_job_id,
    p_user_id,
    p_job_type,
    p_source_language,
    p_target_language,
    p_original_content,
    p_file_info,
    v_content_chunks,
    v_total_chunks,
    v_estimated_credits,
    p_priority,
    p_metadata,
    NOW(),
    NOW()
  );
  
  -- 记录审计日志
  INSERT INTO audit_logs (
    user_id,
    action_type,
    resource_type,
    resource_id,
    details,
    success
  ) VALUES (
    p_user_id,
    'translation_request',
    'translation_job',
    v_job_id::TEXT,
    jsonb_build_object(
      'job_type', p_job_type,
      'source_language', p_source_language,
      'target_language', p_target_language,
      'estimated_credits', v_estimated_credits,
      'total_chunks', v_total_chunks
    ),
    true
  );
  
  RETURN v_job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 获取下一个待处理任务
CREATE OR REPLACE FUNCTION get_next_translation_job(
  p_worker_id TEXT
) RETURNS TABLE (
  job_id UUID,
  user_id UUID,
  job_type TEXT,
  source_language TEXT,
  target_language TEXT,
  content_chunks JSONB,
  metadata JSONB
) AS $$
DECLARE
  v_job_id UUID;
BEGIN
  -- 获取优先级最高的待处理任务
  SELECT id INTO v_job_id
  FROM translation_jobs
  WHERE status = 'pending'
    AND expires_at > NOW()
    AND retry_count < max_retries
  ORDER BY priority ASC, created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;
  
  IF v_job_id IS NULL THEN
    RETURN;
  END IF;
  
  -- 更新任务状态为处理中
  UPDATE translation_jobs
  SET 
    status = 'processing',
    processing_started_at = NOW(),
    worker_id = p_worker_id,
    updated_at = NOW()
  WHERE id = v_job_id;
  
  -- 返回任务信息
  RETURN QUERY
  SELECT 
    tj.id,
    tj.user_id,
    tj.job_type,
    tj.source_language,
    tj.target_language,
    tj.content_chunks,
    tj.metadata
  FROM translation_jobs tj
  WHERE tj.id = v_job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 更新任务进度
CREATE OR REPLACE FUNCTION update_job_progress(
  p_job_id UUID,
  p_chunk_id INTEGER,
  p_chunk_result TEXT,
  p_credits_consumed INTEGER DEFAULT 0,
  p_transaction_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_total_chunks INTEGER;
  v_completed_chunks INTEGER;
  v_progress DECIMAL(5,2);
  v_translated_chunks JSONB;
  v_credit_transactions JSONB;
BEGIN
  -- 获取当前任务信息
  SELECT 
    total_chunks, 
    completed_chunks, 
    translated_chunks,
    credit_transaction_ids
  INTO 
    v_total_chunks, 
    v_completed_chunks, 
    v_translated_chunks,
    v_credit_transactions
  FROM translation_jobs
  WHERE id = p_job_id;
  
  IF v_total_chunks IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- 更新翻译结果
  v_translated_chunks := COALESCE(v_translated_chunks, '[]'::jsonb);
  v_translated_chunks := v_translated_chunks || jsonb_build_object(
    'chunk_id', p_chunk_id,
    'result', p_chunk_result,
    'completed_at', NOW()
  );
  
  -- 更新积分事务记录
  IF p_transaction_id IS NOT NULL THEN
    v_credit_transactions := COALESCE(v_credit_transactions, '[]'::jsonb);
    v_credit_transactions := v_credit_transactions || to_jsonb(p_transaction_id);
  END IF;
  
  -- 计算进度
  v_completed_chunks := v_completed_chunks + 1;
  v_progress := (v_completed_chunks::DECIMAL / v_total_chunks::DECIMAL) * 100;
  
  -- 更新任务状态
  UPDATE translation_jobs
  SET 
    completed_chunks = v_completed_chunks,
    progress_percentage = v_progress,
    translated_chunks = v_translated_chunks,
    consumed_credits = consumed_credits + p_credits_consumed,
    credit_transaction_ids = v_credit_transactions,
    updated_at = NOW(),
    -- 如果所有块都完成了，标记为完成
    status = CASE 
      WHEN v_completed_chunks >= v_total_chunks THEN 'completed'
      ELSE status
    END,
    processing_completed_at = CASE 
      WHEN v_completed_chunks >= v_total_chunks THEN NOW()
      ELSE processing_completed_at
    END
  WHERE id = p_job_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 处理任务失败
CREATE OR REPLACE FUNCTION handle_job_failure(
  p_job_id UUID,
  p_error_message TEXT,
  p_error_details JSONB DEFAULT NULL,
  p_save_partial_results BOOLEAN DEFAULT TRUE
) RETURNS BOOLEAN AS $$
DECLARE
  v_job RECORD;
  v_partial_results JSONB;
  v_refund_amount INTEGER;
BEGIN
  -- 获取任务信息
  SELECT * INTO v_job
  FROM translation_jobs
  WHERE id = p_job_id;
  
  IF v_job IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- 保存部分结果
  IF p_save_partial_results AND v_job.completed_chunks > 0 THEN
    v_partial_results := jsonb_build_object(
      'completed_chunks', v_job.completed_chunks,
      'total_chunks', v_job.total_chunks,
      'translated_chunks', v_job.translated_chunks,
      'partial_content', 'Available on request'
    );
    
    -- 计算部分退款（未完成部分的积分）
    v_refund_amount := CEIL(
      v_job.consumed_credits * 
      (v_job.total_chunks - v_job.completed_chunks)::DECIMAL / 
      v_job.total_chunks::DECIMAL
    );
    
    UPDATE translation_jobs
    SET 
      status = 'partial_success',
      partial_results = v_partial_results,
      refunded_credits = v_refund_amount,
      error_message = p_error_message,
      error_details = p_error_details,
      processing_completed_at = NOW(),
      updated_at = NOW()
    WHERE id = p_job_id;
    
  ELSE
    -- 完全失败，全额退款
    UPDATE translation_jobs
    SET 
      status = 'failed',
      refunded_credits = consumed_credits,
      error_message = p_error_message,
      error_details = p_error_details,
      retry_count = retry_count + 1,
      processing_completed_at = NOW(),
      updated_at = NOW()
    WHERE id = p_job_id;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 获取用户的翻译任务
CREATE OR REPLACE FUNCTION get_user_translation_jobs(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0,
  p_status TEXT DEFAULT NULL
) RETURNS TABLE (
  id UUID,
  job_type TEXT,
  status TEXT,
  source_language TEXT,
  target_language TEXT,
  progress_percentage DECIMAL(5,2),
  estimated_credits INTEGER,
  consumed_credits INTEGER,
  created_at TIMESTAMPTZ,
  processing_completed_at TIMESTAMPTZ,
  error_message TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tj.id,
    tj.job_type,
    tj.status,
    tj.source_language,
    tj.target_language,
    tj.progress_percentage,
    tj.estimated_credits,
    tj.consumed_credits,
    tj.created_at,
    tj.processing_completed_at,
    tj.error_message
  FROM translation_jobs tj
  WHERE 
    tj.user_id = p_user_id
    AND (p_status IS NULL OR tj.status = p_status)
  ORDER BY tj.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 清理过期任务
CREATE OR REPLACE FUNCTION cleanup_expired_jobs() RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- 删除过期的未完成任务
  DELETE FROM translation_jobs
  WHERE expires_at < NOW()
    AND status NOT IN ('completed', 'partial_success');
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 触发器：自动更新updated_at
CREATE OR REPLACE FUNCTION update_translation_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_translation_jobs_updated_at
  BEFORE UPDATE ON translation_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_translation_jobs_updated_at();

-- 4. 行级安全策略
ALTER TABLE translation_jobs ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的翻译任务
CREATE POLICY "Users can view their own translation jobs" ON translation_jobs
  FOR SELECT USING (auth.uid() = user_id);

-- 用户可以创建自己的翻译任务
CREATE POLICY "Users can create their own translation jobs" ON translation_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 系统可以更新翻译任务
CREATE POLICY "System can update translation jobs" ON translation_jobs
  FOR UPDATE USING (true);

-- 5. 权限设置
GRANT EXECUTE ON FUNCTION create_translation_job TO authenticated;
GRANT EXECUTE ON FUNCTION get_next_translation_job TO authenticated;
GRANT EXECUTE ON FUNCTION update_job_progress TO authenticated;
GRANT EXECUTE ON FUNCTION handle_job_failure TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_translation_jobs TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_jobs TO authenticated;

-- 注释
COMMENT ON TABLE translation_jobs IS '异步翻译任务队列表，支持长文本和文档的后台处理';
COMMENT ON FUNCTION create_translation_job IS '创建新的翻译任务';
COMMENT ON FUNCTION get_next_translation_job IS '获取下一个待处理的翻译任务';
COMMENT ON FUNCTION update_job_progress IS '更新翻译任务进度';
COMMENT ON FUNCTION handle_job_failure IS '处理翻译任务失败，支持部分结果保存';
COMMENT ON FUNCTION get_user_translation_jobs IS '获取用户的翻译任务列表';
COMMENT ON FUNCTION cleanup_expired_jobs IS '清理过期的翻译任务';
