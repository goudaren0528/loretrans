#!/usr/bin/env node

/**
 * 简单检查数据库表
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTables() {
  console.log('🔍 检查数据库表...\n');

  // 尝试访问可能的表
  const tablesToCheck = [
    'profiles',
    'user_profiles', 
    'users',
    'payments',
    'credit_transactions',
    'transactions'
  ];

  for (const tableName of tablesToCheck) {
    try {
      console.log(`📋 检查表: ${tableName}`);
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`   ❌ ${error.message}`);
      } else {
        console.log(`   ✅ 表存在，有 ${data.length} 条示例数据`);
        if (data.length > 0) {
          console.log(`   📝 列: ${Object.keys(data[0]).join(', ')}`);
        }
      }
    } catch (err) {
      console.log(`   ❌ 访问失败: ${err.message}`);
    }
    console.log('');
  }

  // 检查特定用户
  console.log('👤 检查特定用户...');
  const userId = '5f36d348-7553-4d70-9003-4994c6b23428'; // hongwane323@gmail.com
  
  for (const tableName of ['profiles', 'user_profiles']) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        console.log(`✅ 在表 ${tableName} 中找到用户:`);
        console.log(`   数据: ${JSON.stringify(data, null, 2)}`);
        break;
      }
    } catch (err) {
      // 继续尝试下一个表
    }
  }
}

checkTables();
