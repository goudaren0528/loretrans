#!/usr/bin/env node

/**
 * 快速测试真实NLLB翻译服务
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// 配置
const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  },
  frontend: {
    url: 'http://localhost:3000'
  }
};

// 初始化Supabase客户端
const supabase = createClient(config.supabase.url, config.supabase.serviceKey);

// 测试用户
const testUser = {
  email: 'test-real-nllb@example.com',
  password: 'TestPassword123!'
};

async function testRealNLLBTranslation() {
  console.log('🧪 快速测试真实NLLB翻译服务');
  console.log('================================');

  try {
    // 1. 创建/获取测试用户
    console.log('👤 设置测试用户...');
    
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', testUser.email)
      .single();

    let userId;
    if (existingUser) {
      userId = existingUser.id;
      console.log('✅ 测试用户已存在');
    } else {
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: testUser.email,
        password: testUser.password,
        email_confirm: true
      });

      if (createError) throw createError;

      const { data: userRecord, error: insertError } = await supabase
        .from('users')
        .insert({
          id: newUser.user.id,
          email: testUser.email,
          credits: 100,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) throw insertError;
      userId = userRecord.id;
      console.log('✅ 测试用户创建成功');
    }

    // 2. 用户认证
    console.log('🔐 进行用户认证...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password
    });

    if (authError) throw authError;

    const authToken = authData.session?.access_token;
    if (!authToken) throw new Error('未获取到认证token');

    console.log('✅ 用户认证成功');

    // 3. 测试翻译
    console.log('🔄 测试翻译...');
    console.log('文本: "Hello, how are you today?"');
    console.log('语言: en → ht (海地克里奥尔语)');

    const response = await axios.post(`${config.frontend.url}/api/translate`, {
      text: 'Hello, how are you today?',
      sourceLang: 'en',
      targetLang: 'ht'
    }, {
      timeout: 30000,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ 翻译成功！');
    console.log(`结果: "${response.data.translatedText}"`);
    console.log(`方法: ${response.data.method}`);
    
    // 检查是否使用了真实翻译
    if (response.data.translatedText.includes('[MOCK TRANSLATION]')) {
      console.log('❌ 仍在使用MOCK翻译');
      return false;
    } else if (response.data.method === 'nllb-local') {
      console.log('✅ 成功使用真实NLLB本地服务');
      return true;
    } else if (response.data.method === 'huggingface') {
      console.log('✅ 成功使用HuggingFace API');
      return true;
    } else {
      console.log(`⚠️ 使用了其他翻译方法: ${response.data.method}`);
      return true;
    }

  } catch (error) {
    console.log(`❌ 测试失败: ${error.message}`);
    if (error.response) {
      console.log(`HTTP状态: ${error.response.status}`);
      console.log(`响应: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    return false;
  }
}

// 运行测试
testRealNLLBTranslation().then(success => {
  if (success) {
    console.log('\n🎉 真实NLLB翻译测试成功！');
  } else {
    console.log('\n❌ 真实NLLB翻译测试失败！');
  }
}).catch(console.error);
