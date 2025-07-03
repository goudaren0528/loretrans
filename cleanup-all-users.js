// 清空所有用户账号的脚本
require('dotenv').config({ path: 'frontend/.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少Supabase环境变量');
  process.exit(1);
}

const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

async function cleanupAllUsers() {
  console.log('🧹 开始清理所有用户数据...\n');
  
  try {
    // 1. 获取所有认证用户
    console.log('1️⃣ 获取所有认证用户...');
    const { data: authUsers, error: authError } = await supabaseService.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ 获取认证用户失败:', authError.message);
      return;
    }
    
    console.log(`找到 ${authUsers.users.length} 个认证用户`);
    
    // 2. 删除所有认证用户
    if (authUsers.users.length > 0) {
      console.log('\n2️⃣ 删除认证用户...');
      for (const user of authUsers.users) {
        try {
          const { error: deleteError } = await supabaseService.auth.admin.deleteUser(user.id);
          if (deleteError) {
            console.error(`❌ 删除用户 ${user.email} 失败:`, deleteError.message);
          } else {
            console.log(`✅ 删除用户: ${user.email}`);
          }
        } catch (err) {
          console.error(`❌ 删除用户 ${user.email} 异常:`, err.message);
        }
      }
    }
    
    // 3. 清理数据库表
    console.log('\n3️⃣ 清理数据库表...');
    
    // 删除积分交易记录
    const { error: transError } = await supabaseService
      .from('credit_transactions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // 删除所有记录
    
    if (transError) {
      console.error('❌ 清理积分交易记录失败:', transError.message);
    } else {
      console.log('✅ 清理积分交易记录');
    }
    
    // 删除用户资料
    const { error: profileError } = await supabaseService
      .from('user_profiles')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // 删除所有记录
    
    if (profileError) {
      console.error('❌ 清理用户资料失败:', profileError.message);
    } else {
      console.log('✅ 清理用户资料');
    }
    
    // 删除用户记录
    const { error: userError } = await supabaseService
      .from('users')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // 删除所有记录
    
    if (userError) {
      console.error('❌ 清理用户记录失败:', userError.message);
    } else {
      console.log('✅ 清理用户记录');
    }
    
    // 4. 验证清理结果
    console.log('\n4️⃣ 验证清理结果...');
    
    const { data: remainingAuthUsers } = await supabaseService.auth.admin.listUsers();
    const { data: remainingUsers } = await supabaseService.from('users').select('count');
    const { data: remainingProfiles } = await supabaseService.from('user_profiles').select('count');
    const { data: remainingTransactions } = await supabaseService.from('credit_transactions').select('count');
    
    console.log(`认证用户剩余: ${remainingAuthUsers?.users.length || 0}`);
    console.log(`用户记录剩余: ${remainingUsers?.length || 0}`);
    console.log(`用户资料剩余: ${remainingProfiles?.length || 0}`);
    console.log(`积分交易剩余: ${remainingTransactions?.length || 0}`);
    
    console.log('\n🎉 用户数据清理完成！');
    
  } catch (error) {
    console.error('❌ 清理过程中出现异常:', error.message);
  }
}

cleanupAllUsers();
