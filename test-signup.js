// 测试注册功能的脚本
const testSignup = async () => {
  try {
    console.log('Testing signup functionality...')
    
    // 测试环境变量是否正确加载
    const response = await fetch('http://localhost:3000/api/health')
    const health = await response.json()
    console.log('Health check:', health)
    
    // 测试Supabase连接
    console.log('Environment variables:')
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set')
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testSignup()
