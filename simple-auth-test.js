// 简化的认证测试
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://crhchsvaesipbifykbnp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyaGNoc3ZhZXNpcGJpZnlrYm5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2MjkxMjQsImV4cCI6MjA2NTIwNTEyNH0.Vi9DQkdTD9ZgjNfqYUN6Ngar1fPIIiycDsMDaGgaz0o';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function simpleAuthTest() {
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  
  console.log('🧪 开始简化认证测试');
  console.log('📧 测试邮箱:', testEmail);
  console.log('🔒 测试密码:', testPassword);
  console.log('');
  
  try {
    // 步骤1: 尝试注册
    console.log('1️⃣ 尝试注册用户...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: 'Test User'
        }
      }
    });
    
    if (signUpError) {
      console.log('❌ 注册失败:', signUpError.message);
      console.log('错误代码:', signUpError.status);
      console.log('错误详情:', signUpError);
      
      // 如果是邮箱已存在的错误，尝试登录
      if (signUpError.message.includes('already registered')) {
        console.log('');
        console.log('2️⃣ 邮箱已存在，尝试登录...');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword
        });
        
        if (signInError) {
          console.log('❌ 登录也失败:', signInError.message);
        } else {
          console.log('✅ 登录成功!');
          console.log('用户ID:', signInData.user?.id);
        }
      }
      return;
    }
    
    console.log('✅ 注册成功!');
    console.log('用户ID:', signUpData.user?.id);
    console.log('邮箱:', signUpData.user?.email);
    console.log('邮箱确认状态:', signUpData.user?.email_confirmed);
    console.log('');
    
    // 步骤2: 检查会话
    console.log('2️⃣ 检查会话状态...');
    const { data: session } = await supabase.auth.getSession();
    if (session.session) {
      console.log('✅ 会话已建立');
      console.log('访问令牌存在:', !!session.session.access_token);
    } else {
      console.log('❌ 没有活动会话');
    }
    
    // 步骤3: 尝试手动创建用户记录
    if (signUpData.user?.id) {
      console.log('');
      console.log('3️⃣ 尝试创建用户记录...');
      
      // 使用我们的API创建用户记录
      const response = await fetch('http://localhost:3000/api/auth/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: signUpData.user.id,
          email: signUpData.user.email,
          name: 'Test User'
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ 用户记录创建成功');
        console.log('积分:', result.user?.credits);
      } else {
        console.log('❌ 用户记录创建失败:', response.status);
        const errorText = await response.text();
        console.log('错误详情:', errorText);
      }
    }
    
  } catch (err) {
    console.log('❌ 测试过程中出现异常:', err.message);
  }
}

simpleAuthTest();
