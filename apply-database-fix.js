#!/usr/bin/env node

/**
 * 应用数据库修复
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少Supabase配置');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyDatabaseFix() {
  console.log('🔧 应用数据库修复...\n');

  try {
    // 读取SQL修复文件
    const sqlContent = fs.readFileSync('fix-purchase-credits-function.sql', 'utf8');
    
    console.log('📝 执行SQL修复...');
    
    // 执行SQL
    const { error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error('❌ SQL执行失败:', error.message);
      
      // 尝试直接创建函数
      console.log('🔄 尝试直接创建函数...');
      
      const createFunctionSQL = `
        CREATE OR REPLACE FUNCTION public.purchase_credits(
          p_user_id UUID,
          p_amount INTEGER,
          p_payment_id TEXT,
          p_description TEXT DEFAULT '积分购买'
        )
        RETURNS BOOLEAN AS $$
        DECLARE
          current_balance INTEGER;
          new_balance INTEGER;
        BEGIN
          -- 获取当前积分
          SELECT credits INTO current_balance 
          FROM public.users 
          WHERE id = p_user_id;
          
          IF NOT FOUND THEN
            RAISE EXCEPTION '用户不存在';
          END IF;
          
          -- 计算新余额
          new_balance := current_balance + p_amount;
          
          -- 更新用户积分余额 (这是关键的修复)
          UPDATE public.users 
          SET credits = new_balance, updated_at = NOW()
          WHERE id = p_user_id;
          
          -- 插入购买记录
          INSERT INTO public.credit_transactions (user_id, type, amount, balance, description, metadata)
          VALUES (p_user_id, 'purchase', p_amount, new_balance, p_description, 
                  jsonb_build_object('payment_id', p_payment_id));
          
          RETURN TRUE;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `;
      
      // 由于Supabase可能不支持直接执行DDL，我们需要手动测试函数
      console.log('⚠️  需要手动在Supabase控制台中执行以下SQL:');
      console.log('---');
      console.log(createFunctionSQL);
      console.log('---');
    } else {
      console.log('✅ SQL修复执行成功');
    }

    // 测试修复后的函数
    console.log('\n🧪 测试修复后的函数...');
    
    // 获取一个测试用户
    const testUserId = '5f36d348-7553-4d70-9003-4994c6b23428'; // hongwane323@gmail.com
    
    console.log(`📊 测试用户 ${testUserId} 的当前积分...`);
    
    const { data: userBefore, error: userError } = await supabase
      .from('users')
      .select('credits')
      .eq('id', testUserId)
      .single();
    
    if (userError) {
      console.error('❌ 获取用户信息失败:', userError.message);
      return;
    }
    
    console.log(`   当前积分: ${userBefore.credits}`);
    
    // 测试函数调用（使用小额积分避免影响）
    console.log('\n🔬 测试函数调用...');
    const testAmount = 1; // 只测试1积分
    const testPaymentId = `test_${Date.now()}`;
    
    const { data: result, error: funcError } = await supabase.rpc('purchase_credits', {
      p_user_id: testUserId,
      p_amount: testAmount,
      p_payment_id: testPaymentId,
      p_description: 'Test purchase for function verification'
    });
    
    if (funcError) {
      console.error('❌ 函数调用失败:', funcError.message);
      console.log('\n💡 可能的解决方案:');
      console.log('1. 在Supabase控制台的SQL编辑器中手动执行修复SQL');
      console.log('2. 检查函数权限设置');
      console.log('3. 确认数据库迁移已正确应用');
    } else {
      console.log('✅ 函数调用成功:', result);
      
      // 验证积分是否更新
      const { data: userAfter } = await supabase
        .from('users')
        .select('credits')
        .eq('id', testUserId)
        .single();
      
      if (userAfter) {
        console.log(`   更新后积分: ${userAfter.credits}`);
        console.log(`   积分变化: +${userAfter.credits - userBefore.credits}`);
        
        if (userAfter.credits === userBefore.credits + testAmount) {
          console.log('🎉 函数修复成功！积分正确更新');
        } else {
          console.log('⚠️  积分更新可能有问题');
        }
      }
    }

  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error.message);
  }
}

applyDatabaseFix();
