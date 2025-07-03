// 检查auth.users表中的数据
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://crhchsvaesipbifykbnp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyaGNoc3ZhZXNpcGJpZnlrYm5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2MjkxMjQsImV4cCI6MjA2NTIwNTEyNH0.Vi9DQkdTD9ZgjNfqYUN6Ngar1fPIIiycDsMDaGgaz0o';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAuthUsers() {
  console.log('🔍 检查认证用户...\n');
  
  try {
    // 尝试查询auth.users表（通常需要服务角色权限）
    const { data, error } = await supabase.rpc('get_auth_users');
    
    if (error) {
      console.log('❌ 无法直接查询auth.users表:', error.message);
      console.log('这是正常的，因为需要服务角色权限');
    } else {
      console.log('✅ 找到认证用户:', data.length, '个');
    }
    
    // 检查当前会话
    const { data: session } = await supabase.auth.getSession();
    console.log('当前会话状态:', session.session ? '已登录' : '未登录');
    
    // 尝试获取当前用户
    const { data: user } = await supabase.auth.getUser();
    console.log('当前用户:', user.user ? user.user.email : '无');
    
  } catch (err) {
    console.log('❌ 检查时出错:', err.message);
  }
}

checkAuthUsers();
