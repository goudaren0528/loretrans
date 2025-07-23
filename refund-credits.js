require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// 创建Supabase管理客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function refundCredits() {
  try {
    console.log('🔄 开始积分退还流程...');
    
    // 查找最近的翻译失败记录
    // 根据日志，用户当前有47686积分，需要退还542积分
    const refundAmount = 542;
    const currentCredits = 47686;
    const newCredits = currentCredits + refundAmount;
    
    console.log(`📊 退还信息:`);
    console.log(`- 当前积分: ${currentCredits}`);
    console.log(`- 退还金额: ${refundAmount}`);
    console.log(`- 退还后积分: ${newCredits}`);
    
    // 查找需要退还积分的用户
    // 由于我们不知道具体的用户ID，我们需要查找最近有翻译活动的用户
    const { data: users, error: queryError } = await supabase
      .from('users')
      .select('id, email, credits')
      .eq('credits', currentCredits)
      .limit(5);
    
    if (queryError) {
      console.error('❌ 查询用户失败:', queryError);
      return;
    }
    
    if (!users || users.length === 0) {
      console.log('⚠️ 未找到匹配的用户，尝试查找积分在47600-47700范围内的用户...');
      
      const { data: rangeUsers, error: rangeError } = await supabase
        .from('users')
        .select('id, email, credits')
        .gte('credits', 47600)
        .lte('credits', 47700)
        .order('updated_at', { ascending: false })
        .limit(10);
      
      if (rangeError) {
        console.error('❌ 范围查询失败:', rangeError);
        return;
      }
      
      if (rangeUsers && rangeUsers.length > 0) {
        console.log('📋 找到可能的用户:');
        rangeUsers.forEach((user, index) => {
          console.log(`${index + 1}. ID: ${user.id}, Email: ${user.email}, Credits: ${user.credits}`);
        });
        
        console.log('\n⚠️ 请手动确认需要退还积分的用户ID');
        console.log('使用方法: node refund-credits.js <user_id>');
        return;
      } else {
        console.log('❌ 未找到任何匹配的用户');
        return;
      }
    }
    
    // 如果找到唯一用户，进行退还
    if (users.length === 1) {
      const user = users[0];
      console.log(`✅ 找到用户: ${user.email} (ID: ${user.id})`);
      console.log(`当前积分: ${user.credits}`);
      
      // 执行积分退还
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          credits: user.credits + refundAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (updateError) {
        console.error('❌ 积分退还失败:', updateError);
        return;
      }
      
      console.log(`🎉 积分退还成功!`);
      console.log(`- 用户: ${user.email}`);
      console.log(`- 退还前积分: ${user.credits}`);
      console.log(`- 退还金额: ${refundAmount}`);
      console.log(`- 退还后积分: ${user.credits + refundAmount}`);
      
      // 记录退还日志
      console.log(`📝 退还原因: 文档翻译失败 (ENHANCED_DOC_CONFIG未定义错误)`);
      console.log(`📅 退还时间: ${new Date().toISOString()}`);
      
    } else {
      console.log('⚠️ 找到多个用户，请手动确认:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}, Email: ${user.email}, Credits: ${user.credits}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 积分退还过程中发生错误:', error);
  }
}

// 支持命令行参数指定用户ID
async function refundCreditsForUser(userId) {
  try {
    console.log(`🔄 为用户 ${userId} 退还积分...`);
    
    const refundAmount = 542;
    
    // 查询用户当前积分
    const { data: user, error: queryError } = await supabase
      .from('users')
      .select('id, email, credits')
      .eq('id', userId)
      .single();
    
    if (queryError) {
      console.error('❌ 查询用户失败:', queryError);
      return;
    }
    
    if (!user) {
      console.error('❌ 用户不存在');
      return;
    }
    
    console.log(`✅ 找到用户: ${user.email}`);
    console.log(`当前积分: ${user.credits}`);
    
    // 执行积分退还
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        credits: user.credits + refundAmount,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (updateError) {
      console.error('❌ 积分退还失败:', updateError);
      return;
    }
    
    console.log(`🎉 积分退还成功!`);
    console.log(`- 用户: ${user.email}`);
    console.log(`- 退还前积分: ${user.credits}`);
    console.log(`- 退还金额: ${refundAmount}`);
    console.log(`- 退还后积分: ${user.credits + refundAmount}`);
    
  } catch (error) {
    console.error('❌ 积分退还过程中发生错误:', error);
  }
}

// 主函数
async function main() {
  const userId = process.argv[2];
  
  if (userId) {
    await refundCreditsForUser(userId);
  } else {
    await refundCredits();
  }
  
  process.exit(0);
}

main();
