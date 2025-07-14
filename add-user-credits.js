#!/usr/bin/env node

/**
 * 用户积分管理脚本
 * 用于给用户添加积分，解决积分不足问题
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Supabase配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少Supabase配置');
  console.error('请确保 .env.local 文件包含:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * 获取所有用户
 */
async function getAllUsers() {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, credits, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return users || [];
  } catch (error) {
    console.error('获取用户列表失败:', error.message);
    return [];
  }
}

/**
 * 添加积分给用户
 */
async function addCreditsToUser(userId, credits, reason = '管理员手动添加') {
  try {
    console.log(`\n🔄 为用户 ${userId} 添加 ${credits} 积分...`);

    // 1. 获取当前积分
    const { data: currentUser, error: getUserError } = await supabase
      .from('users')
      .select('credits, email')
      .eq('id', userId)
      .single();

    if (getUserError) {
      throw new Error(`获取用户信息失败: ${getUserError.message}`);
    }

    const currentCredits = currentUser.credits || 0;
    const newCredits = currentCredits + credits;

    console.log(`   当前积分: ${currentCredits}`);
    console.log(`   添加积分: ${credits}`);
    console.log(`   新的积分: ${newCredits}`);

    // 2. 更新用户积分
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        credits: newCredits,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      throw new Error(`更新用户积分失败: ${updateError.message}`);
    }

    // 3. 记录积分交易
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        type: 'purchase',
        amount: credits,
        description: reason,
        status: 'completed',
        created_at: new Date().toISOString()
      });

    if (transactionError) {
      console.warn(`⚠️  记录交易失败: ${transactionError.message}`);
    }

    console.log(`✅ 成功为用户 ${currentUser.email} 添加 ${credits} 积分`);
    return { success: true, newCredits };

  } catch (error) {
    console.error(`❌ 添加积分失败: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 批量给所有用户添加积分
 */
async function addCreditsToAllUsers(credits, reason = '系统奖励') {
  console.log(`\n🚀 开始为所有用户添加 ${credits} 积分...`);
  
  const users = await getAllUsers();
  
  if (users.length === 0) {
    console.log('❌ 没有找到用户');
    return;
  }

  console.log(`📋 找到 ${users.length} 个用户`);

  let successCount = 0;
  let failCount = 0;

  for (const user of users) {
    const result = await addCreditsToUser(user.id, credits, reason);
    if (result.success) {
      successCount++;
    } else {
      failCount++;
    }
    
    // 添加延迟避免限流
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n📊 批量操作完成:`);
  console.log(`✅ 成功: ${successCount} 个用户`);
  console.log(`❌ 失败: ${failCount} 个用户`);
}

/**
 * 查看用户积分状态
 */
async function showUserCredits() {
  console.log('\n📊 用户积分状态:');
  console.log('=' .repeat(80));
  
  const users = await getAllUsers();
  
  if (users.length === 0) {
    console.log('❌ 没有找到用户');
    return;
  }

  users.forEach((user, index) => {
    const credits = user.credits || 0;
    const status = credits > 0 ? '✅' : '❌';
    console.log(`${index + 1}. ${status} ${user.email} - ${credits} 积分`);
  });

  const totalCredits = users.reduce((sum, user) => sum + (user.credits || 0), 0);
  const avgCredits = Math.round(totalCredits / users.length);
  
  console.log('=' .repeat(80));
  console.log(`总用户数: ${users.length}`);
  console.log(`总积分数: ${totalCredits}`);
  console.log(`平均积分: ${avgCredits}`);
  console.log(`零积分用户: ${users.filter(u => (u.credits || 0) === 0).length}`);
}

/**
 * 创建测试用户（如果需要）
 */
async function createTestUser(email, password = 'test123456') {
  try {
    console.log(`\n🔄 创建测试用户: ${email}`);

    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true
    });

    if (error) {
      throw error;
    }

    console.log(`✅ 测试用户创建成功: ${email}`);
    console.log(`   用户ID: ${data.user.id}`);
    
    // 给新用户添加初始积分
    await addCreditsToUser(data.user.id, 5000, '新用户注册奖励');
    
    return data.user;

  } catch (error) {
    console.error(`❌ 创建测试用户失败: ${error.message}`);
    return null;
  }
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  console.log('🎯 Loretrans 积分管理工具');
  console.log('=' .repeat(50));

  switch (command) {
    case 'show':
      await showUserCredits();
      break;

    case 'add':
      const userId = args[1];
      const credits = parseInt(args[2]);
      const reason = args[3] || '管理员手动添加';
      
      if (!userId || !credits) {
        console.log('用法: node add-user-credits.js add <用户ID> <积分数> [原因]');
        process.exit(1);
      }
      
      await addCreditsToUser(userId, credits, reason);
      break;

    case 'add-all':
      const allCredits = parseInt(args[1]);
      const allReason = args[2] || '系统奖励';
      
      if (!allCredits) {
        console.log('用法: node add-user-credits.js add-all <积分数> [原因]');
        process.exit(1);
      }
      
      await addCreditsToAllUsers(allCredits, allReason);
      break;

    case 'create-test':
      const testEmail = args[1] || 'test@example.com';
      await createTestUser(testEmail);
      break;

    case 'fix-zero':
      // 给所有零积分用户添加5000积分
      console.log('\n🔧 修复零积分用户...');
      const users = await getAllUsers();
      const zeroUsers = users.filter(u => (u.credits || 0) === 0);
      
      console.log(`找到 ${zeroUsers.length} 个零积分用户`);
      
      for (const user of zeroUsers) {
        await addCreditsToUser(user.id, 5000, '零积分修复');
      }
      break;

    default:
      console.log('可用命令:');
      console.log('  show              - 显示所有用户积分状态');
      console.log('  add <用户ID> <积分数> [原因] - 给指定用户添加积分');
      console.log('  add-all <积分数> [原因]     - 给所有用户添加积分');
      console.log('  create-test [邮箱]         - 创建测试用户');
      console.log('  fix-zero                   - 修复所有零积分用户');
      console.log('');
      console.log('示例:');
      console.log('  node add-user-credits.js show');
      console.log('  node add-user-credits.js add user123 1000 "测试奖励"');
      console.log('  node add-user-credits.js add-all 5000 "新年奖励"');
      console.log('  node add-user-credits.js fix-zero');
      break;
  }
}

// 运行主函数
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  getAllUsers,
  addCreditsToUser,
  addCreditsToAllUsers,
  showUserCredits,
  createTestUser
};
