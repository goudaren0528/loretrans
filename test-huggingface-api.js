#!/usr/bin/env node

/**
 * Hugging Face API 测试脚本
 * 用于验证API Token和NLLB模型连接
 */

const API_KEY = process.env.HUGGINGFACE_API_KEY;
const MODEL = 'facebook/nllb-200-distilled-600M';
const API_URL = `https://api-inference.huggingface.co/models/${MODEL}`;

if (!API_KEY) {
  console.error('❌ 错误: 请设置 HUGGINGFACE_API_KEY 环境变量');
  console.log('💡 运行: export HUGGINGFACE_API_KEY=hf_your_token_here');
  process.exit(1);
}

async function testHuggingFaceAPI() {
  console.log('🧪 测试 Hugging Face API 连接...');
  console.log(`📡 API URL: ${API_URL}`);
  console.log(`🔑 API Key: ${API_KEY.substring(0, 10)}...`);
  
  try {
    // 测试1: 检查模型状态
    console.log('\n1️⃣ 检查模型状态...');
    const statusResponse = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      }
    });

    if (statusResponse.status === 200) {
      console.log('✅ 模型可用');
    } else if (statusResponse.status === 503) {
      console.log('⏳ 模型正在加载中，这可能需要几分钟...');
    } else {
      console.log(`⚠️ 状态码: ${statusResponse.status}`);
    }

    // 测试2: 尝试翻译
    console.log('\n2️⃣ 测试翻译功能...');
    const testText = 'Hello world';
    const sourceCode = 'eng_Latn';
    const targetCode = 'hat_Latn'; // 海地克里奥尔语
    const prompt = `${sourceCode}: ${testText} ${targetCode}:`;

    console.log(`📝 测试文本: "${testText}"`);
    console.log(`🔄 翻译方向: English → Haitian Creole`);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: 512,
          temperature: 0.3,
          do_sample: false,
          num_return_sequences: 1,
          return_full_text: false,
        },
        options: {
          wait_for_model: true,
        }
      }),
    });

    console.log(`📊 响应状态: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API 错误:', errorData);
      return;
    }

    const data = await response.json();
    console.log('📦 原始响应:', JSON.stringify(data, null, 2));

    if (data && Array.isArray(data) && data[0]) {
      const result = data[0];
      if (result.generated_text) {
        // 提取翻译结果
        const generatedText = result.generated_text;
        const targetPrefix = `${targetCode}:`;
        const targetIndex = generatedText.indexOf(targetPrefix);
        
        let translation = generatedText;
        if (targetIndex !== -1) {
          translation = generatedText.substring(targetIndex + targetPrefix.length).trim();
        }

        console.log('✅ 翻译成功!');
        console.log(`📖 原文: "${testText}"`);
        console.log(`📝 译文: "${translation}"`);
      } else {
        console.log('⚠️ 未收到翻译结果');
      }
    } else {
      console.log('❌ 响应格式异常');
    }

  } catch (error) {
    console.error('💥 测试失败:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('💡 网络连接问题，请检查:');
      console.log('   - 网络连接是否正常');
      console.log('   - 是否需要使用代理');
    } else if (error.message.includes('401')) {
      console.log('💡 认证失败，请检查:');
      console.log('   - API Token 是否正确');
      console.log('   - Token 是否已过期');
    }
  }
}

// 测试支持的语言代码
function showSupportedLanguages() {
  console.log('\n🌍 支持的语言代码:');
  const languages = {
    'en': 'eng_Latn', // English
    'ht': 'hat_Latn', // Haitian Creole
    'lo': 'lao_Laoo', // Lao
    'sw': 'swh_Latn', // Swahili
    'my': 'mya_Mymr', // Burmese
    'te': 'tel_Telu', // Telugu
    'zh': 'zho_Hans', // Chinese (Simplified)
  };

  Object.entries(languages).forEach(([code, nllbCode]) => {
    console.log(`   ${code} → ${nllbCode}`);
  });
}

// 运行测试
async function main() {
  await testHuggingFaceAPI();
  showSupportedLanguages();
}

main().catch(console.error);