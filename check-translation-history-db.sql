
-- 检查translation_jobs表是否存在并包含必要字段
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'translation_jobs' 
ORDER BY ordinal_position;

-- 检查是否有测试数据
SELECT 
  COUNT(*) as total_jobs,
  COUNT(CASE WHEN user_id = '839f0ed5-c42f-45ce-aa3d-fcc251252cb1' THEN 1 END) as user_jobs,
  job_type,
  status
FROM translation_jobs 
GROUP BY job_type, status;

-- 为当前用户创建测试翻译记录
INSERT INTO translation_jobs (
  user_id,
  job_type,
  status,
  source_language,
  target_language,
  original_content,
  translated_content,
  progress_percentage,
  estimated_credits,
  consumed_credits,
  created_at,
  processing_completed_at
) VALUES 
(
  '839f0ed5-c42f-45ce-aa3d-fcc251252cb1'::UUID,
  'text',
  'completed',
  'en',
  'zh',
  'Hello, this is a test translation.',
  '你好，这是一个测试翻译。',
  100.00,
  5,
  5,
  NOW() - INTERVAL '1 hour',
  NOW() - INTERVAL '59 minutes'
),
(
  '839f0ed5-c42f-45ce-aa3d-fcc251252cb1'::UUID,
  'text',
  'completed',
  'zh',
  'en',
  '这是另一个测试翻译。',
  'This is another test translation.',
  100.00,
  8,
  8,
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '119 minutes'
);
