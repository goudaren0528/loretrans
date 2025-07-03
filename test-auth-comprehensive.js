#!/usr/bin/env node

/**
 * 综合认证问题测试脚本
 * 系统性地测试三个主要认证问题
 */

const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

// Supabase 配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 开始综合认证测试...\n');

// 检查环境变量
console.log('📋 环境变量检查:');
console.log('- Supabase URL:', supabaseUrl ? '✅ 已配置' : '❌ 未配置');
console.log('- Anon Key:', supabaseAnonKey ? '✅ 已配置' : '❌ 未配置');
console.log('- Service Key:', supabaseServiceKey ? '✅ 已配置' : '❌ 未配置');
console.log('');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase 配置不完整，无法继续测试');
  process.exit(1);
}

// 创建客户端
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseService = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

async function testDatabaseConnection() {
  console.log('🔗 测试数据库连接...');
  
  try {
    // 测试基本连接
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ 数据库连接失败:', error.message);
      return false;
    }
    
    console.log('✅ 数据库连接正常');
    return true;
  } catch (error) {
    console.log('❌ 数据库连接异常:', error.message);
    return false;
  }
}

async function testUserTableStructure() {
  console.log('🏗️ 测试用户表结构...');
  
  if (!supabaseService) {
    console.log('⚠️ 无服务角色密钥，跳过表结构测试');
    return;
  }
  
  try {
    // 检查 users 表
    const { data: usersData, error: usersError } = await supabaseService
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.log('❌ users 表访问失败:', usersError.message);
    } else {
      console.log('✅ users 表结构正常');
    }
    
    // 检查 user_profiles 表
    const { data: profilesData, error: profilesError } = await supabaseService
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ user_profiles 表访问失败:', profilesError.message);
    } else {
      console.log('✅ user_profiles 表结构正常');
    }
    
  } catch (error) {
    console.log('❌ 表结构测试异常:', error.message);
  }
}

async function testAuthAPIs() {
  console.log('🔌 测试认证API端点...');
  
  const baseUrl = 'http://localhost:3000';
  
  try {
    // 测试 get-user API
    console.log('- 测试 /api/auth/get-user...');
    const getUserResponse = await fetch(`${baseUrl}/api/auth/get-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: 'test-user-id' }),
    });
    
    if (getUserResponse.ok) {
      console.log('  ✅ get-user API 响应正常');
    } else {
      console.log(`  ❌ get-user API 响应异常: ${getUserResponse.status}`);
    }
    
    // 测试 create-user API
    console.log('- 测试 /api/auth/create-user...');
    const createUserResponse = await fetch(`${baseUrl}/api/auth/create-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        userId: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User'
      }),
    });
    
    if (createUserResponse.ok) {
      console.log('  ✅ create-user API 响应正常');
    } else {
      console.log(`  ❌ create-user API 响应异常: ${createUserResponse.status}`);
    }
    
  } catch (error) {
    console.log('❌ API测试异常:', error.message);
  }
}

async function testSignInFlow() {
  console.log('🔐 测试登录流程...');
  
  const testEmail = 'test@example.com';
  const testPassword = 'TestPassword123!';
  
  try {
    // 尝试登录（预期会失败，因为用户不存在）
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });
    
    if (error) {
      if (error.message === 'Invalid login credentials') {
        console.log('✅ 登录错误处理正常（用户不存在）');
      } else {
        console.log('❌ 登录错误:', error.message);
      }
    } else {
      console.log('⚠️ 意外登录成功');
    }
    
  } catch (error) {
    console.log('❌ 登录测试异常:', error.message);
  }
}

async function testSignUpFlow() {
  console.log('📝 测试注册流程...');
  
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  
  try {
    // 尝试注册
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: 'Test User',
        },
      },
    });
    
    if (error) {
      console.log('❌ 注册错误:', error.message);
    } else if (data.user) {
      console.log('✅ 注册成功，用户ID:', data.user.id);
      
      // 测试用户数据获取
      setTimeout(async () => {
        try {
          const getUserResponse = await fetch('http://localhost:3000/api/auth/get-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: data.user.id }),
          });
          
          if (getUserResponse.ok) {
            const userData = await getUserResponse.json();
            console.log('✅ 用户数据获取成功:', userData.user?.email);
          } else {
            console.log('❌ 用户数据获取失败');
          }
        } catch (error) {
          console.log('❌ 用户数据获取异常:', error.message);
        }
      }, 2000);
    }
    
  } catch (error) {
    console.log('❌ 注册测试异常:', error.message);
  }
}

async function testEmailUniqueness() {
  console.log('🔍 测试邮箱唯一性验证...');
  
  // 这个功能需要实现
  console.log('⚠️ 邮箱唯一性验证API尚未实现');
  console.log('📝 需要创建 /api/auth/check-email 端点');
}

async function runAllTests() {
  console.log('🚀 开始执行所有测试...\n');
  
  // 基础连接测试
  const dbConnected = await testDatabaseConnection();
  console.log('');
  
  if (dbConnected) {
    await testUserTableStructure();
    console.log('');
    
    await testAuthAPIs();
    console.log('');
    
    await testSignInFlow();
    console.log('');
    
    await testSignUpFlow();
    console.log('');
    
    await testEmailUniqueness();
    console.log('');
  }
  
  console.log('📊 测试总结:');
  console.log('1. 用户菜单显示问题: 需要检查前端组件和API调用');
  console.log('2. 登录400错误: 需要检查Supabase配置和数据库权限');
  console.log('3. 邮箱唯一性验证: 需要实现检查API和前端验证');
  console.log('');
  console.log('🔧 建议的修复步骤:');
  console.log('- 检查 .env.local 配置');
  console.log('- 验证数据库表和触发器');
  console.log('- 实现邮箱唯一性检查API');
  console.log('- 优化前端错误处理');
}

// 运行测试
runAllTests().catch(console.error);
