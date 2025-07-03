#!/usr/bin/env node

/**
 * 调试NLLB服务调用
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

async function debugNLLBCall() {
  console.log('🔍 调试NLLB服务调用');
  console.log('===================');

  try {
    // 1. 直接测试NLLB服务
    console.log('1. 直接测试NLLB服务...');
    const directResponse = await axios.post('http://localhost:8081/translate', {
      text: 'Hello, how are you today?',
      sourceLanguage: 'en',
      targetLanguage: 'ht'
    });
    
    console.log('✅ 直接NLLB调用成功');
    console.log(`结果: "${directResponse.data.translatedText}"`);
    console.log(`处理时间: ${directResponse.data.processingTime}ms`);

    // 2. 获取用户认证
    console.log('\n2. 获取用户认证...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'test-real-nllb@example.com',
      password: 'TestPassword123!'
    });

    if (authError) throw authError;
    const authToken = authData.session?.access_token;
    console.log('✅ 认证成功');

    // 3. 测试前端API调用，并捕获详细错误
    console.log('\n3. 测试前端API调用...');
    
    try {
      const frontendResponse = await axios.post(`${config.frontend.url}/api/translate`, {
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

      console.log('✅ 前端API调用成功');
      console.log(`结果: "${frontendResponse.data.translatedText}"`);
      console.log(`方法: ${frontendResponse.data.method}`);
      console.log(`处理时间: ${frontendResponse.data.processingTime}ms`);
      
      if (frontendResponse.data.debug) {
        console.log('调试信息:', frontendResponse.data.debug);
      }

    } catch (frontendError) {
      console.log('❌ 前端API调用失败');
      console.log(`错误: ${frontendError.message}`);
      
      if (frontendError.response) {
        console.log(`HTTP状态: ${frontendError.response.status}`);
        console.log(`响应数据:`, frontendError.response.data);
      }
    }

    // 4. 检查环境变量
    console.log('\n4. 检查环境变量...');
    console.log(`NLLB_LOCAL_ENABLED: ${process.env.NLLB_LOCAL_ENABLED}`);
    console.log(`NLLB_LOCAL_URL: ${process.env.NLLB_LOCAL_URL}`);
    console.log(`USE_MOCK_TRANSLATION: ${process.env.USE_MOCK_TRANSLATION}`);
    console.log(`HUGGINGFACE_API_KEY exists: ${!!process.env.HUGGINGFACE_API_KEY}`);

  } catch (error) {
    console.log(`❌ 调试过程失败: ${error.message}`);
    console.error(error);
  }
}

// 运行调试
debugNLLBCall().catch(console.error);
