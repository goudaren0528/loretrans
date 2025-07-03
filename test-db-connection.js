// 测试数据库连接和表结构
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://crhchsvaesipbifykbnp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyaGNoc3ZhZXNpcGJpZnlrYm5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2MjkxMjQsImV4cCI6MjA2NTIwNTEyNH0.Vi9DQkdTD9ZgjNfqYUN6Ngar1fPIIiycDsMDaGgaz0o'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabase() {
  console.log('🔍 Testing database connection and tables...\n')
  
  try {
    // 测试各个表是否存在
    const tables = ['users', 'user_profiles', 'credit_transactions', 'payments']
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (error) {
          console.log(`❌ Table '${table}': ${error.message}`)
        } else {
          console.log(`✅ Table '${table}': OK`)
        }
      } catch (err) {
        console.log(`❌ Table '${table}': ${err.message}`)
      }
    }
    
    console.log('\n🧪 Testing user creation...')
    
    // 测试创建一个测试用户 - 使用正确的UUID格式
    function generateUUID() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
    
    const testUserId = generateUUID()
    const testEmail = `test${Date.now()}@example.com`
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: testUserId,
        email: testEmail,
        email_verified: false,
        credits: 10000,
        role: 'free_user'
      })
      .select()
      .single()
    
    if (userError) {
      console.log('❌ User creation failed:', userError.message)
    } else {
      console.log('✅ User creation successful:', userData)
      
      // 清理测试数据
      await supabase.from('users').delete().eq('id', testUserId)
      console.log('🧹 Test data cleaned up')
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message)
  }
}

testDatabase()
