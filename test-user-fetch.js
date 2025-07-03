// 测试用户数据获取
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://crhchsvaesipbifykbnp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyaGNoc3ZhZXNpcGJpZnlrYm5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2MjkxMjQsImV4cCI6MjA2NTIwNTEyNH0.Vi9DQkdTD9ZgjNfqYUN6Ngar1fPIIiycDsMDaGgaz0o'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testUserFetch() {
  console.log('🔍 Testing user data fetch...\n')
  
  try {
    // 获取最近创建的用户
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (usersError) {
      console.log('❌ Failed to fetch users:', usersError.message)
      return
    }
    
    if (!users || users.length === 0) {
      console.log('ℹ️  No users found in database')
      return
    }
    
    const user = users[0]
    console.log('✅ Found user:', {
      id: user.id,
      email: user.email,
      credits: user.credits,
      role: user.role
    })
    
    // 测试获取用户资料
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
    
    if (profileError) {
      console.log('❌ Failed to fetch profile:', profileError.message)
    } else if (profile) {
      console.log('✅ Found profile:', {
        name: profile.name,
        language: profile.language,
        timezone: profile.timezone
      })
    } else {
      console.log('ℹ️  No profile found for user')
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testUserFetch()
