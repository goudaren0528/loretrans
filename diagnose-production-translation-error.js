#!/usr/bin/env node

/**
 * 生产环境翻译API错误诊断脚本
 * 
 * 错误信息：
 * 1. /api/translate/public:1 Failed to load resource: the server responded with a status of 500 ()
 * 2. [Translation Error] Error: NLLB API error: 404 - {"status_code":404,"detail":"Not Found"}
 */

const https = require('https');
const http = require('http');

// 配置
const NLLB_SERVICE_URL = 'https://wane0528-my-nllb-api.hf.space/api/v4/translator';
const PRODUCTION_API_URL = 'https://your-production-domain.com/api/translate/public'; // 请替换为实际的生产域名

// 测试数据
const testData = {
  text: "Hello, how are you?",
  sourceLang: "en",
  targetLang: "zh"
};

// NLLB语言代码映射
const NLLB_LANGUAGE_MAP = {
  'ht': 'hat_Latn',
  'lo': 'lao_Laoo',
  'sw': 'swh_Latn',
  'my': 'mya_Mymr',
  'te': 'tel_Telu',
  'si': 'sin_Sinh',
  'am': 'amh_Ethi',
  'km': 'khm_Khmr',
  'ne': 'npi_Deva',
  'mg': 'plt_Latn',
  'en': 'eng_Latn',
  'zh': 'zho_Hans',
  'fr': 'fra_Latn',
  'es': 'spa_Latn',
  'pt': 'por_Latn',
  'ar': 'arb_Arab',
  'hi': 'hin_Deva',
};

function getNLLBLanguageCode(langCode) {
  return NLLB_LANGUAGE_MAP[langCode] || langCode;
}

// 测试NLLB服务
async function testNLLBService() {
  console.log('\n🔍 测试NLLB服务...');
  console.log(`URL: ${NLLB_SERVICE_URL}`);
  
  const payload = {
    text: testData.text,
    source: getNLLBLanguageCode(testData.sourceLang),
    target: getNLLBLanguageCode(testData.targetLang),
  };
  
  console.log('请求数据:', JSON.stringify(payload, null, 2));
  
  try {
    const response = await fetch(NLLB_SERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Translation-Service/1.0'
      },
      body: JSON.stringify(payload),
    });

    console.log(`响应状态: ${response.status} ${response.statusText}`);
    console.log('响应头:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('响应内容:', responseText);

    if (!response.ok) {
      console.error(`❌ NLLB服务错误: ${response.status} - ${responseText}`);
      return false;
    }

    try {
      const data = JSON.parse(responseText);
      console.log('✅ NLLB服务正常，翻译结果:', data);
      return true;
    } catch (parseError) {
      console.error('❌ 响应不是有效的JSON:', parseError.message);
      return false;
    }

  } catch (error) {
    console.error('❌ NLLB服务连接失败:', error.message);
    return false;
  }
}

// 测试生产环境API
async function testProductionAPI() {
  console.log('\n🔍 测试生产环境API...');
  console.log(`URL: ${PRODUCTION_API_URL}`);
  
  try {
    const response = await fetch(PRODUCTION_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log(`响应状态: ${response.status} ${response.statusText}`);
    console.log('响应头:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('响应内容:', responseText);

    if (!response.ok) {
      console.error(`❌ 生产API错误: ${response.status} - ${responseText}`);
      return false;
    }

    try {
      const data = JSON.parse(responseText);
      console.log('✅ 生产API正常，响应:', data);
      return true;
    } catch (parseError) {
      console.error('❌ 响应不是有效的JSON:', parseError.message);
      return false;
    }

  } catch (error) {
    console.error('❌ 生产API连接失败:', error.message);
    return false;
  }
}

// 检查网络连接
async function checkNetworkConnectivity() {
  console.log('\n🔍 检查网络连接...');
  
  const testUrls = [
    'https://httpbin.org/get',
    'https://api.github.com',
    'https://huggingface.co'
  ];
  
  for (const url of testUrls) {
    try {
      const response = await fetch(url, { method: 'GET' });
      console.log(`✅ ${url}: ${response.status}`);
    } catch (error) {
      console.log(`❌ ${url}: ${error.message}`);
    }
  }
}

// 检查NLLB服务状态
async function checkNLLBServiceStatus() {
  console.log('\n🔍 检查NLLB服务状态...');
  
  const baseUrl = 'https://wane0528-my-nllb-api.hf.space';
  const endpoints = [
    '/',
    '/docs',
    '/health',
    '/api/v4/translator'
  ];
  
  for (const endpoint of endpoints) {
    const url = baseUrl + endpoint;
    try {
      const response = await fetch(url, { 
        method: endpoint === '/api/v4/translator' ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: endpoint === '/api/v4/translator' ? JSON.stringify({
          text: "test",
          source: "eng_Latn",
          target: "zho_Hans"
        }) : undefined
      });
      console.log(`${endpoint}: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.log(`${endpoint}: ❌ ${error.message}`);
    }
  }
}

// 生成修复建议
function generateFixSuggestions() {
  console.log('\n💡 修复建议:');
  console.log('');
  console.log('1. 检查NLLB服务URL是否正确:');
  console.log('   - 当前URL: https://wane0528-my-nllb-api.hf.space/api/v4/translator');
  console.log('   - 确认Hugging Face Space是否在线');
  console.log('');
  console.log('2. 检查生产环境变量:');
  console.log('   - NLLB_SERVICE_URL');
  console.log('   - NLLB_SERVICE_TIMEOUT');
  console.log('');
  console.log('3. 可能的解决方案:');
  console.log('   a) 更新NLLB服务URL到新的端点');
  console.log('   b) 添加备用翻译服务');
  console.log('   c) 增加错误重试机制');
  console.log('   d) 添加服务健康检查');
  console.log('');
  console.log('4. 临时解决方案:');
  console.log('   - 启用本地翻译服务');
  console.log('   - 使用其他翻译API作为备用');
  console.log('');
}

// 主函数
async function main() {
  console.log('🚀 开始诊断生产环境翻译错误...');
  console.log('时间:', new Date().toISOString());
  
  // 检查网络连接
  await checkNetworkConnectivity();
  
  // 检查NLLB服务状态
  await checkNLLBServiceStatus();
  
  // 测试NLLB服务
  const nllbWorking = await testNLLBService();
  
  // 测试生产API（如果提供了URL）
  if (PRODUCTION_API_URL.includes('your-production-domain')) {
    console.log('\n⚠️  请在脚本中设置实际的生产域名来测试生产API');
  } else {
    await testProductionAPI();
  }
  
  // 生成修复建议
  generateFixSuggestions();
  
  console.log('\n✅ 诊断完成');
}

// 运行诊断
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testNLLBService,
  testProductionAPI,
  checkNetworkConnectivity,
  checkNLLBServiceStatus
};
