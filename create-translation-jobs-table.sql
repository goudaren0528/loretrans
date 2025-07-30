-- 创建翻译任务表
CREATE TABLE IF NOT EXISTS translation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL CHECK (job_type IN ('text', 'document', 'batch')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'completed', 'failed', 'cancelled', 'partial_success'
  )),
  priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  
  -- 翻译参数
  source_language TEXT NOT NULL,
  target_language TEXT NOT NULL,
  
  -- 内容信息
  original_content TEXT,
  file_info JSONB,
  content_chunks JSONB DEFAULT '[]',
  
  -- 翻译结果
  translated_content TEXT,
  translated_chunks JSONB DEFAULT '[]',
  partial_results JSONB DEFAULT '[]',
  
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
  worker_id TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  
  -- 错误信息
  error_message TEXT,
  error_details JSONB,
  
  -- 元数据
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_translation_jobs_user_status 
ON translation_jobs(user_id, status, created_at DESC);

-- 启用行级安全
ALTER TABLE translation_jobs ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
CREATE POLICY "Users can view their own translation jobs" ON translation_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own translation jobs" ON translation_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update translation jobs" ON translation_jobs
  FOR UPDATE USING (true);
