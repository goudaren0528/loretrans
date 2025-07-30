const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration')
  console.error('Please check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const createTranslationJobsTable = async () => {
  console.log('🗄️ Creating translation_jobs table...')
  
  const sql = `
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

    CREATE INDEX IF NOT EXISTS idx_translation_jobs_status_priority 
    ON translation_jobs(status, priority, created_at) WHERE status IN ('pending', 'processing');

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

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql })
    
    if (error) {
      console.error('❌ Error creating table:', error)
      
      // 如果 exec_sql 不存在，尝试直接执行 SQL
      console.log('🔄 Trying alternative method...')
      
      // 分步执行 SQL 语句
      const statements = sql.split(';').filter(stmt => stmt.trim())
      
      for (const statement of statements) {
        if (statement.trim()) {
          console.log(`Executing: ${statement.trim().substring(0, 50)}...`)
          
          // 这里我们需要使用不同的方法，因为 Supabase JS 客户端不直接支持 DDL
          // 让我们创建一个测试记录来验证表是否存在
          break
        }
      }
    } else {
      console.log('✅ Table created successfully')
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

const testTableExists = async () => {
  console.log('🔍 Testing if translation_jobs table exists...')
  
  try {
    const { data, error } = await supabase
      .from('translation_jobs')
      .select('count')
      .limit(1)
    
    if (error) {
      if (error.code === '42P01') {
        console.log('❌ Table does not exist')
        return false
      } else {
        console.error('❌ Error testing table:', error)
        return false
      }
    } else {
      console.log('✅ Table exists')
      return true
    }
  } catch (error) {
    console.error('❌ Unexpected error testing table:', error)
    return false
  }
}

const main = async () => {
  console.log('🚀 Starting database migration...')
  console.log(`📡 Connecting to: ${supabaseUrl}`)
  
  const tableExists = await testTableExists()
  
  if (!tableExists) {
    console.log('📝 Table does not exist, please create it manually in Supabase Dashboard')
    console.log('🔗 Go to: https://supabase.com/dashboard/project/crhchsvaesipbifykbnp/sql')
    console.log('📄 Execute the SQL from: create-translation-jobs-table.sql')
  } else {
    console.log('✅ Table already exists, no migration needed')
  }
  
  // 测试认证用户的历史记录
  console.log('\n🧪 Testing with authenticated user...')
  
  // 这里我们需要模拟一个认证用户的请求
  // 由于我们无法直接在 Node.js 中模拟浏览器的认证状态，
  // 我们建议用户在浏览器中测试
  console.log('📝 Please test in browser:')
  console.log('   1. Go to: http://localhost:3000/en/test-auth-history')
  console.log('   2. Login with: test@example.com / testpassword123')
  console.log('   3. Check if history shows "Please log in" or works correctly')
}

main().catch(console.error)
