// 详细的认证诊断脚本
require('dotenv').config({ path: 'frontend/.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Supabase认证诊断\n');

// 创建客户端
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

async function diagnoseAuth() {
  try {
    console.log('1️⃣ 检查基本连接...');
    
    // 测试匿名客户端连接
    const { data: testData, error: testError } = await supabaseAnon
      .from('users')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.log('❌ 匿名客户端连接失败:', testError.message);
    } else {
      console.log('✅ 匿名客户端连接正常');
    }
    
    console.log('\n2️⃣ 检查认证配置...');
    
    // 使用服务角色检查认证设置
    try {
      const { data: settings, error: settingsError } = await supabaseService.auth.admin.getSettings();
      
      if (settingsError) {
        console.log('❌ 无法获取认证设置:', settingsError.message);
      } else {
        console.log('✅ 认证设置获取成功');
        console.log('邮箱注册启用:', settings.external?.email?.enabled || 'Unknown');
        console.log('邮箱确认要求:', settings.email_confirm || 'Unknown');
      }
    } catch (err) {
      console.log('⚠️ 认证设置检查跳过:', err.message);
    }
    
    console.log('\n3️⃣ 检查现有用户...');
    
    // 列出现有认证用户
    const { data: authUsers, error: authError } = await supabaseService.auth.admin.listUsers();
    
    if (authError) {
      console.log('❌ 获取认证用户失败:', authError.message);
    } else {
      console.log('✅ 现有认证用户:', authUsers.users.length, '个');
      authUsers.users.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.email} - 确认: ${user.email_confirmed}`);
      });
    }
    
    console.log('\n4️⃣ 测试简单认证操作...');
    
    // 测试获取会话（不需要登录）
    const { data: session, error: sessionError } = await supabaseAnon.auth.getSession();
    
    if (sessionError) {
      console.log('❌ 获取会话失败:', sessionError.message);
    } else {
      console.log('✅ 会话检查正常, 当前状态:', session.session ? '已登录' : '未登录');
    }
    
    console.log('\n5️⃣ 尝试不同的注册方式...');
    
    // 尝试1: 基本邮箱注册
    const testEmail1 = `test${Date.now()}@example.com`;
    console.log('测试邮箱1:', testEmail1);
    
    const { data: signup1, error: signupError1 } = await supabaseAnon.auth.signUp({
      email: testEmail1,
      password: 'TestPassword123!'
    });
    
    if (signupError1) {
      console.log('❌ 基本注册失败:', signupError1.message);
      console.log('错误代码:', signupError1.code);
      
      // 分析错误类型
      if (signupError1.message.includes('disabled')) {
        console.log('💡 建议: 在Supabase控制台启用邮箱注册');
      } else if (signupError1.message.includes('password')) {
        console.log('💡 建议: 检查密码策略设置');
      }
    } else {
      console.log('✅ 基本注册成功!');
      console.log('用户ID:', signup1.user?.id);
      console.log('邮箱确认:', signup1.user?.email_confirmed);
    }
    
  } catch (err) {
    console.log('❌ 诊断过程异常:', err.message);
  }
}

diagnoseAuth();
