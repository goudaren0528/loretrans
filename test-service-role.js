// 测试Service Role Key配置
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 检查Service Role Key配置...\n');

console.log('Supabase URL:', supabaseUrl);
console.log('Service Key存在:', !!supabaseServiceKey);
console.log('Service Key长度:', supabaseServiceKey ? supabaseServiceKey.length : 0);
console.log('Service Key前缀:', supabaseServiceKey ? supabaseServiceKey.substring(0, 20) + '...' : 'N/A');

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('❌ 环境变量未正确配置');
  process.exit(1);
}

// 创建服务角色客户端
const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

async function testServiceRole() {
  try {
    console.log('\n🧪 测试Service Role权限...');
    
    // 测试1: 查询用户表
    const { data: users, error: usersError } = await supabaseService
      .from('users')
      .select('id, email, credits')
      .limit(5);
    
    if (usersError) {
      console.log('❌ 查询用户表失败:', usersError.message);
    } else {
      console.log('✅ 用户表查询成功, 找到', users.length, '条记录');
    }
    
    // 测试2: 查询认证用户（需要service role权限）
    const { data: authUsers, error: authError } = await supabaseService.auth.admin.listUsers();
    
    if (authError) {
      console.log('❌ 查询认证用户失败:', authError.message);
    } else {
      console.log('✅ 认证用户查询成功, 找到', authUsers.users.length, '个认证用户');
      
      // 显示认证用户信息
      authUsers.users.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.email} (${user.id})`);
      });
    }
    
  } catch (err) {
    console.log('❌ 测试异常:', err.message);
  }
}

testServiceRole();
