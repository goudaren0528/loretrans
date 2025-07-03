const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://crhchsvaesipbifykbnp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyaGNoc3ZhZXNpcGJpZnlrYm5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2MjkxMjQsImV4cCI6MjA2NTIwNTEyNH0.Vi9DQkdTD9ZgjNfqYUN6Ngar1fPIIiycDsMDaGgaz0o'
);

async function testFixedAuth() {
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'TestPass123!';
  
  console.log('🔧 测试修复后的认证');
  console.log('📧 邮箱:', testEmail);
  console.log('🔒 密码:', testPassword);
  console.log('');
  
  try {
    console.log('1️⃣ 尝试注册...');
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: 'Test User'
        }
      }
    });
    
    if (error) {
      console.log('❌ 注册失败:', error.message);
      console.log('错误状态:', error.status);
      console.log('错误代码:', error.code || 'N/A');
      
      // 提供具体的错误分析
      if (error.message.includes('Database error')) {
        console.log('💡 数据库错误 - 可能是触发器或权限问题');
      } else if (error.message.includes('password')) {
        console.log('💡 密码问题 - 检查密码策略设置');
      } else if (error.message.includes('email')) {
        console.log('💡 邮箱问题 - 检查邮箱验证设置');
      }
      
      return;
    }
    
    console.log('✅ 注册成功!');
    console.log('用户ID:', data.user?.id);
    console.log('邮箱:', data.user?.email);
    console.log('邮箱确认:', data.user?.email_confirmed);
    console.log('');
    
    // 测试登录
    console.log('2️⃣ 测试登录...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (signInError) {
      console.log('❌ 登录失败:', signInError.message);
    } else {
      console.log('✅ 登录成功!');
      console.log('会话存在:', !!signInData.session);
    }
    
  } catch (err) {
    console.log('❌ 测试异常:', err.message);
  }
}

testFixedAuth();
