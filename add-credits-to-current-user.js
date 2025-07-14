#!/usr/bin/env node

/**
 * 为当前登录用户添加积分的脚本
 * 解决文档翻译积分不足问题
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🎯 为当前用户添加积分');
console.log('=' .repeat(50));

// 从环境变量获取Supabase配置
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 如果.env.local中没有配置，尝试从其他文件加载
if (!supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('your_') || supabaseServiceKey.includes('your_')) {
  console.log('🔍 .env.local中的配置不完整，尝试从其他配置文件加载...');
  
  // 尝试从.env.production.complete加载
  try {
    require('dotenv').config({ path: '.env.production.complete' });
    supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (supabaseUrl && supabaseServiceKey && !supabaseUrl.includes('your_') && !supabaseServiceKey.includes('your_')) {
      console.log('✅ 从 .env.production.complete 加载配置成功');
    }
  } catch (error) {
    console.log('⚠️  无法加载 .env.production.complete');
  }
}

// 检查配置
if (!supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('your_') || supabaseServiceKey.includes('your_')) {
  console.error('❌ Supabase配置不完整');
  console.error('当前配置:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl || '未设置');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '已设置但可能是占位符' : '未设置');
  console.log('\n💡 解决方案:');
  console.log('1. 请在 .env.local 或 .env.production.complete 中设置正确的Supabase配置');
  console.log('2. 或者手动在数据库中更新用户积分');
  console.log('3. 或者使用前端管理页面: credit-admin.html');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * 获取所有用户并显示积分状态
 */
async function showAllUsers() {
  try {
    console.log('📋 获取所有用户积分状态...\n');
    
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, credits, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    if (users.length === 0) {
      console.log('❌ 没有找到用户');
      console.log('💡 请先在应用中注册一个账户');
      return [];
    }

    console.log('用户列表:');
    console.log('-'.repeat(80));
    users.forEach((user, index) => {
      const credits = user.credits || 0;
      const status = credits >= 1000 ? '✅' : credits > 0 ? '⚠️ ' : '❌';
      const createdAt = new Date(user.created_at).toLocaleDateString();
      console.log(`${index + 1}. ${status} ${user.email}`);
      console.log(`   积分: ${credits} | 注册: ${createdAt} | ID: ${user.id.substring(0, 8)}...`);
      console.log('');
    });

    const zeroUsers = users.filter(u => (u.credits || 0) === 0);
    const lowUsers = users.filter(u => (u.credits || 0) > 0 && (u.credits || 0) < 1000);
    
    console.log('📊 统计:');
    console.log(`总用户: ${users.length}`);
    console.log(`零积分: ${zeroUsers.length}`);
    console.log(`积分不足(<1000): ${lowUsers.length}`);
    console.log(`积分充足(>=1000): ${users.length - zeroUsers.length - lowUsers.length}`);

    return users;

  } catch (error) {
    console.error('❌ 获取用户失败:', error.message);
    return [];
  }
}

/**
 * 为指定用户添加积分
 */
async function addCreditsToUser(userId, credits, reason = '管理员添加') {
  try {
    console.log(`\n🔄 为用户添加积分...`);
    console.log(`用户ID: ${userId}`);
    console.log(`添加积分: ${credits}`);
    console.log(`原因: ${reason}`);

    // 1. 获取当前用户信息
    const { data: currentUser, error: getUserError } = await supabase
      .from('users')
      .select('id, email, credits')
      .eq('id', userId)
      .single();

    if (getUserError) {
      throw new Error(`获取用户信息失败: ${getUserError.message}`);
    }

    const currentCredits = currentUser.credits || 0;
    const newCredits = currentCredits + credits;

    console.log(`当前积分: ${currentCredits}`);
    console.log(`新的积分: ${newCredits}`);

    // 2. 更新用户积分
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        credits: newCredits,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      throw new Error(`更新积分失败: ${updateError.message}`);
    }

    // 3. 记录交易（可选）
    try {
      await supabase
        .from('credit_transactions')
        .insert({
          user_id: userId,
          type: 'bonus',
          amount: credits,
          description: reason,
          status: 'completed',
          created_at: new Date().toISOString()
        });
      console.log('✅ 交易记录已保存');
    } catch (transError) {
      console.warn('⚠️  交易记录保存失败:', transError.message);
    }

    console.log(`✅ 成功为用户 ${currentUser.email} 添加 ${credits} 积分`);
    console.log(`💰 新的积分余额: ${newCredits}`);

    return { success: true, newCredits, userEmail: currentUser.email };

  } catch (error) {
    console.error(`❌ 添加积分失败: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 批量修复所有积分不足的用户
 */
async function fixAllLowCreditUsers() {
  console.log('\n🔧 批量修复积分不足用户...');
  
  const users = await showAllUsers();
  const lowUsers = users.filter(u => (u.credits || 0) < 2000); // 少于2000积分的用户
  
  if (lowUsers.length === 0) {
    console.log('✅ 所有用户积分都充足');
    return;
  }

  console.log(`\n找到 ${lowUsers.length} 个积分不足的用户，将为每人添加 5000 积分`);
  
  if (process.argv.includes('--confirm')) {
    let successCount = 0;
    
    for (const user of lowUsers) {
      const result = await addCreditsToUser(user.id, 5000, '批量积分修复');
      if (result.success) {
        successCount++;
      }
      // 添加延迟避免限流
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log(`\n🎉 批量修复完成: ${successCount}/${lowUsers.length} 个用户成功`);
  } else {
    console.log('\n⚠️  这是预览模式，要执行修复请添加 --confirm 参数');
    console.log('命令: node add-credits-to-current-user.js fix-all --confirm');
  }
}

/**
 * 主函数
 */
async function main() {
  const command = process.argv[2];
  
  try {
    // 测试数据库连接
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      throw new Error(`数据库连接失败: ${error.message}`);
    }
    
    console.log('✅ 数据库连接正常\n');

    switch (command) {
      case 'show':
        await showAllUsers();
        break;

      case 'add':
        const userId = process.argv[3];
        const credits = parseInt(process.argv[4]);
        const reason = process.argv[5] || '手动添加';
        
        if (!userId || !credits) {
          console.log('用法: node add-credits-to-current-user.js add <用户ID> <积分数> [原因]');
          console.log('示例: node add-credits-to-current-user.js add abc123 2000 "文档翻译积分"');
          process.exit(1);
        }
        
        await addCreditsToUser(userId, credits, reason);
        break;

      case 'fix-all':
        await fixAllLowCreditUsers();
        break;

      case 'quick-fix':
        // 快速修复：给所有用户添加足够的积分
        console.log('\n⚡ 快速修复模式');
        const users = await showAllUsers();
        
        if (users.length === 0) {
          console.log('没有找到用户');
          break;
        }

        console.log(`\n将为所有 ${users.length} 个用户添加 5000 积分`);
        
        if (process.argv.includes('--confirm')) {
          for (const user of users) {
            await addCreditsToUser(user.id, 5000, '快速修复 - 确保积分充足');
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          console.log('\n🎉 快速修复完成！');
        } else {
          console.log('\n⚠️  要执行修复请添加 --confirm 参数');
          console.log('命令: node add-credits-to-current-user.js quick-fix --confirm');
        }
        break;

      default:
        console.log('🎯 Loretrans 积分管理工具');
        console.log('\n可用命令:');
        console.log('  show                           - 显示所有用户积分状态');
        console.log('  add <用户ID> <积分数> [原因]    - 给指定用户添加积分');
        console.log('  fix-all [--confirm]            - 修复所有积分不足用户');
        console.log('  quick-fix [--confirm]          - 给所有用户添加5000积分');
        console.log('');
        console.log('示例:');
        console.log('  node add-credits-to-current-user.js show');
        console.log('  node add-credits-to-current-user.js add abc123 2000');
        console.log('  node add-credits-to-current-user.js quick-fix --confirm');
        console.log('');
        console.log('💡 建议先运行 show 命令查看用户状态');
        break;
    }

  } catch (error) {
    console.error('❌ 执行失败:', error.message);
    console.error('详细错误:', error);
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  showAllUsers,
  addCreditsToUser,
  fixAllLowCreditUsers
};
