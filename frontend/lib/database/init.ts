import { createClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'

const CREATE_TRANSLATION_JOBS_TABLE = `
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
`

const CREATE_INDEXES = `
-- 创建索引
CREATE INDEX IF NOT EXISTS idx_translation_jobs_user_status 
ON translation_jobs(user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_translation_jobs_status_priority 
ON translation_jobs(status, priority, created_at) WHERE status IN ('pending', 'processing');
`

const SETUP_RLS = `
-- 启用行级安全
ALTER TABLE translation_jobs ENABLE ROW LEVEL SECURITY;

-- 删除现有策略（如果存在）
DROP POLICY IF EXISTS "Users can view their own translation jobs" ON translation_jobs;
DROP POLICY IF EXISTS "Users can create their own translation jobs" ON translation_jobs;
DROP POLICY IF EXISTS "System can update translation jobs" ON translation_jobs;

-- 创建RLS策略
CREATE POLICY "Users can view their own translation jobs" ON translation_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own translation jobs" ON translation_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update translation jobs" ON translation_jobs
  FOR UPDATE USING (true);
`

export async function initializeDatabase() {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    console.log('[DB Init] Checking if translation_jobs table exists...')
    
    // 首先检查表是否存在
    const { data: tableCheck, error: checkError } = await supabase
      .from('translation_jobs')
      .select('count')
      .limit(1)
    
    if (!checkError) {
      console.log('[DB Init] Table already exists')
      return { success: true, message: 'Table already exists' }
    }
    
    if (checkError.code !== '42P01') {
      console.error('[DB Init] Unexpected error checking table:', checkError)
      return { success: false, error: checkError }
    }
    
    console.log('[DB Init] Table does not exist, creating...')
    
    // 表不存在，需要创建
    // 注意：这需要 service_role 权限，在生产环境中应该通过迁移来完成
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      console.error('[DB Init] Service role key not available')
      return { 
        success: false, 
        error: 'Service role key required for table creation',
        needsManualSetup: true
      }
    }
    
    // 使用 service role 创建表
    const { createClient: createServiceClient } = await import('@supabase/supabase-js')
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    )
    
    // 执行表创建
    console.log('[DB Init] Creating table...')
    const { error: createError } = await serviceSupabase.rpc('exec_sql', {
      sql: CREATE_TRANSLATION_JOBS_TABLE
    })
    
    if (createError) {
      console.error('[DB Init] Error creating table:', createError)
      return { 
        success: false, 
        error: createError,
        needsManualSetup: true
      }
    }
    
    // 创建索引
    console.log('[DB Init] Creating indexes...')
    const { error: indexError } = await serviceSupabase.rpc('exec_sql', {
      sql: CREATE_INDEXES
    })
    
    if (indexError) {
      console.warn('[DB Init] Warning creating indexes:', indexError)
    }
    
    // 设置 RLS
    console.log('[DB Init] Setting up RLS...')
    const { error: rlsError } = await serviceSupabase.rpc('exec_sql', {
      sql: SETUP_RLS
    })
    
    if (rlsError) {
      console.warn('[DB Init] Warning setting up RLS:', rlsError)
    }
    
    console.log('[DB Init] Database initialization completed')
    return { success: true, message: 'Database initialized successfully' }
    
  } catch (error) {
    console.error('[DB Init] Unexpected error:', error)
    return { 
      success: false, 
      error,
      needsManualSetup: true
    }
  }
}

export async function checkTableExists() {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    const { error } = await supabase
      .from('translation_jobs')
      .select('count')
      .limit(1)
    
    return !error || error.code !== '42P01'
  } catch (error) {
    console.error('[DB Check] Error checking table:', error)
    return false
  }
}
