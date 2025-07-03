// 测试Supabase连接的脚本
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://crhchsvaesipbifykbnp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyaGNoc3ZhZXNpcGJpZnlrYm5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2MjkxMjQsImV4cCI6MjA2NTIwNTEyNH0.Vi9DQkdTD9ZgjNfqYUN6Ngar1fPIIiycDsMDaGgaz0o'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('Testing Supabase connection...')
    
    // 测试基本连接
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Connection test failed:', error)
      if (error.code === '42P01') {
        console.log('\n❌ 数据库表不存在！')
        console.log('请按照以下步骤设置数据库：')
        console.log('1. 访问 https://supabase.com/dashboard/project/crhchsvaesipbifykbnp')
        console.log('2. 进入 SQL Editor')
        console.log('3. 运行 setup-database.sql 文件中的SQL脚本')
        console.log('4. 重新测试注册功能')
      }
    } else {
      console.log('✅ Supabase connection successful!')
      console.log('Data:', data)
    }
  } catch (err) {
    console.error('Test error:', err)
  }
}

testConnection()
