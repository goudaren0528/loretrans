#!/usr/bin/env node

/**
 * 检查数据库结构
 */

require('dotenv').config({ path: '.env.local' });

async function checkDatabaseStructure() {
  console.log('🔍 检查数据库结构...\n');
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // 检查用户相关表
    console.log('📋 1. 检查用户相关表:');
    
    // 尝试不同的可能表名
    const possibleUserTables = ['users', 'user_profiles', 'profiles', 'auth.users'];
    
    for (const tableName of possibleUserTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .eq('id', 'b7bee007-2a9f-4fb8-8020-10b707e2f4f4')
          .limit(1);
        
        if (!error && data) {
          console.log(`   ✅ 找到表: ${tableName}`);
          console.log(`   📊 用户数据:`, data[0]);
          break;
        }
      } catch (e) {
        // 继续尝试下一个表
      }
    }
    
    // 检查所有表
    console.log('\n📋 2. 检查所有可用表:');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (!tablesError && tables) {
      console.log('   可用的表:');
      tables.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
    }
    
    // 尝试直接查询用户
    console.log('\n📋 3. 尝试查询用户数据:');
    
    try {
      // 尝试通过API获取用户数据
      const response = await fetch('https://fdb2-38-98-191-33.ngrok-free.app/api/auth/get-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        console.log('   ✅ 通过API获取用户数据成功:');
        console.log('   📊 用户信息:', userData);
        
        // 分析数据结构
        console.log('\n📋 4. 分析用户数据结构:');
        Object.keys(userData).forEach(key => {
          console.log(`   - ${key}: ${typeof userData[key]} = ${userData[key]}`);
        });
      }
    } catch (error) {
      console.log('   ❌ API查询失败:', error.message);
    }
    
  } catch (error) {
    console.error('❌ 数据库结构检查失败:', error);
  }
}

checkDatabaseStructure();
