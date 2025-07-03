// 测试完整的注册和登录流程
require('dotenv').config({ path: 'frontend/.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCompleteFlow() {
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  const testName = 'Test User';
  
  console.log('🎯 测试完整的注册登录流程');
  console.log('📧 邮箱:', testEmail);
  console.log('🔒 密码:', testPassword);
  console.log('👤 姓名:', testName);
  console.log('');
  
  try {
    // 步骤1: 注册
    console.log('1️⃣ 注册新用户...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: testName
        }
      }
    });
    
    if (signUpError) {
      console.log('❌ 注册失败:', signUpError.message);
      return;
    }
    
    console.log('✅ 注册成功!');
    console.log('用户ID:', signUpData.user?.id);
    console.log('邮箱:', signUpData.user?.email);
    console.log('');
    
    const userId = signUpData.user?.id;
    
    // 步骤2: 检查用户数据是否通过触发器创建
    console.log('2️⃣ 检查用户数据创建...');
    
    // 等待触发器执行
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      const response = await fetch('http://localhost:3000/api/auth/get-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log('✅ 用户数据创建成功!');
          console.log('积分:', result.user.credits);
          console.log('角色:', result.user.role);
          console.log('姓名:', result.user.name);
        } else {
          console.log('❌ 用户数据获取失败');
        }
      } else {
        console.log('❌ API调用失败:', response.status);
      }
    } catch (apiError) {
      console.log('⚠️ API调用异常:', apiError.message);
    }
    
    console.log('');
    
    // 步骤3: 登出
    console.log('3️⃣ 登出...');
    const { error: signOutError } = await supabase.auth.signOut();
    
    if (signOutError) {
      console.log('❌ 登出失败:', signOutError.message);
    } else {
      console.log('✅ 登出成功');
    }
    
    console.log('');
    
    // 步骤4: 重新登录
    console.log('4️⃣ 重新登录...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (signInError) {
      console.log('❌ 登录失败:', signInError.message);
    } else {
      console.log('✅ 登录成功!');
      console.log('会话存在:', !!signInData.session);
      console.log('访问令牌存在:', !!signInData.session?.access_token);
    }
    
    console.log('');
    console.log('🎉 完整流程测试完成!');
    
  } catch (err) {
    console.log('❌ 测试异常:', err.message);
  }
}

testCompleteFlow();
