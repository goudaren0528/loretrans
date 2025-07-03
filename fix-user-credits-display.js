#!/usr/bin/env node

/**
 * 修复用户积分显示问题
 */

require('dotenv').config({ path: '.env.local' });

console.log('🔧 修复用户积分显示问题...\n');

async function fixUserCreditsDisplay() {
  try {
    const { createClient } = require('@supabase/supabase-js');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const userId = 'b7bee007-2a9f-4fb8-8020-10b707e2f4f4';
    
    // 1. 确认数据库中的积分
    console.log('📊 1. 确认数据库中的积分:');
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('   ❌ 数据库查询失败:', error);
      return;
    }
    
    console.log(`   👤 用户: ${user.email}`);
    console.log(`   💰 数据库积分: ${user.credits}`);
    console.log(`   📅 更新时间: ${user.updated_at}`);
    
    // 2. 测试API调用
    console.log('\n📋 2. 测试用户API调用:');
    
    try {
      const apiResponse = await fetch('https://fdb2-38-98-191-33.ngrok-free.app/api/auth/get-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userId
        })
      });
      
      console.log(`   📊 API响应状态: ${apiResponse.status}`);
      
      if (apiResponse.ok) {
        const apiData = await apiResponse.json();
        console.log('   ✅ API调用成功');
        console.log(`   💰 API返回积分: ${apiData.credits}`);
        
        if (apiData.credits === user.credits) {
          console.log('   ✅ 数据库和API积分一致');
        } else {
          console.log('   ⚠️  数据库和API积分不一致');
        }
      } else {
        const errorText = await apiResponse.text();
        console.log('   ❌ API调用失败:', errorText);
      }
      
    } catch (apiError) {
      console.log('   ❌ API调用异常:', apiError.message);
    }
    
    // 3. 检查前端认证状态
    console.log('\n📋 3. 检查前端认证状态:');
    
    try {
      const homeResponse = await fetch('https://fdb2-38-98-191-33.ngrok-free.app/en');
      console.log(`   📊 首页响应状态: ${homeResponse.status}`);
      
      if (homeResponse.ok) {
        const homeContent = await homeResponse.text();
        
        // 检查是否包含用户邮箱
        if (homeContent.includes('hongwane322@gmail.com')) {
          console.log('   ✅ 用户已登录，邮箱显示正常');
        } else {
          console.log('   ⚠️  用户可能未登录或显示异常');
        }
        
        // 检查是否包含积分信息
        if (homeContent.includes('35500') || homeContent.includes('35,500')) {
          console.log('   ✅ 积分显示正常');
        } else {
          console.log('   ⚠️  积分可能未正确显示');
        }
      }
      
    } catch (frontendError) {
      console.log('   ❌ 前端检查失败:', frontendError.message);
    }
    
    // 4. 生成解决方案
    console.log('\n🔧 4. 问题诊断和解决方案:');
    
    if (user.credits === 35500) {
      console.log('   ✅ 数据库积分正确 (35,500)');
      console.log('   💡 如果前端显示不正确，可能的原因:');
      console.log('      1. 浏览器缓存问题 - 请刷新页面');
      console.log('      2. 认证状态异常 - 请重新登录');
      console.log('      3. API调用失败 - 检查网络连接');
      console.log('      4. 前端状态管理问题 - 检查控制台错误');
      
      console.log('\n🚀 建议操作:');
      console.log('   1. 强制刷新浏览器 (Ctrl+F5)');
      console.log('   2. 清除浏览器缓存');
      console.log('   3. 重新登录账户');
      console.log('   4. 检查浏览器控制台是否有错误');
      
    } else {
      console.log('   ❌ 数据库积分异常');
      console.log('   🔧 需要手动修复积分');
    }
    
    // 5. 提供直接访问链接
    console.log('\n🔗 5. 直接测试链接:');
    console.log(`   首页: https://fdb2-38-98-191-33.ngrok-free.app/en`);
    console.log(`   定价页: https://fdb2-38-98-191-33.ngrok-free.app/en/pricing`);
    console.log(`   登录页: https://fdb2-38-98-191-33.ngrok-free.app/en/auth/login`);
    
  } catch (error) {
    console.error('❌ 修复过程失败:', error);
  }
}

fixUserCreditsDisplay();
