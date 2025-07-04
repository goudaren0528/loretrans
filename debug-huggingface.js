#!/usr/bin/env node

/**
 * Hugging Face API 调试工具
 * 用于排查翻译问题和性能监控
 */

const API_KEY = process.env.HUGGINGFACE_API_KEY;
const MODEL = 'facebook/nllb-200-distilled-600M';
const API_URL = `https://api-inference.huggingface.co/models/${MODEL}`;

// 语言代码映射
const LANGUAGE_MAP = {
  'en': 'eng_Latn',
  'ht': 'hat_Latn', 
  'lo': 'lao_Laoo',
  'sw': 'swh_Latn',
  'my': 'mya_Mymr',
  'te': 'tel_Telu',
  'zh': 'zho_Hans',
};

async function debugTranslation(text, sourceLang, targetLang) {
  console.log('🔍 开始调试翻译请求...');
  console.log(`📝 文本: "${text}"`);
  console.log(`🔄 方向: ${sourceLang} → ${targetLang}`);
  
  const startTime = Date.now();
  
  try {
    // 1. 验证语言代码
    const sourceCode = LANGUAGE_MAP[sourceLang];
    const targetCode = LANGUAGE_MAP[targetLang];
    
    if (!sourceCode || !targetCode) {
      throw new Error(`不支持的语言: ${sourceLang} 或 ${targetLang}`);
    }
    
    console.log(`🌍 NLLB代码: ${sourceCode} → ${targetCode}`);
    
    // 2. 构建请求
    const prompt = `${sourceCode}: ${text} ${targetCode}:`;
    console.log(`💬 提示词: "${prompt}"`);
    
    const requestBody = {
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
    };
    
    console.log('📦 请求体:', JSON.stringify(requestBody, null, 2));
    
    // 3. 发送请求
    console.log('🚀 发送API请求...');
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    const responseTime = Date.now() - startTime;
    console.log(`⏱️ 响应时间: ${responseTime}ms`);
    console.log(`📊 状态码: ${response.status}`);
    
    // 4. 处理响应
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API错误响应:', errorText);
      
      // 分析错误类型
      if (response.status === 503) {
        console.log('💡 建议: 模型正在加载，请等待5-10分钟后重试');
      } else if (response.status === 429) {
        console.log('💡 建议: 触发速率限制，请降低请求频率');
      } else if (response.status === 401) {
        console.log('💡 建议: API Token无效，请检查密钥配置');
      }
      return;
    }
    
    const data = await response.json();
    console.log('✅ 原始响应:', JSON.stringify(data, null, 2));
    
    // 5. 提取翻译结果
    if (data && Array.isArray(data) && data[0] && data[0].generated_text) {
      const generatedText = data[0].generated_text;
      const targetPrefix = `${targetCode}:`;
      const targetIndex = generatedText.indexOf(targetPrefix);
      
      let translation = generatedText.trim();
      if (targetIndex !== -1) {
        translation = generatedText.substring(targetIndex + targetPrefix.length).trim();
      }
      
      console.log('🎯 最终翻译结果:');
      console.log(`   原文: "${text}"`);
      console.log(`   译文: "${translation}"`);
      console.log(`   耗时: ${responseTime}ms`);
      
      // 6. 质量评估
      evaluateTranslation(text, translation, responseTime);
      
    } else {
      console.error('❌ 响应格式异常，未找到翻译结果');
    }
    
  } catch (error) {
    console.error('💥 调试过程出错:', error.message);
    console.log('🔧 请检查:');
    console.log('   - 网络连接');
    console.log('   - API Token配置');
    console.log('   - 输入参数格式');
  }
}

function evaluateTranslation(original, translation, responseTime) {
  console.log('\n📈 质量评估:');
  
  // 长度比较
  const lengthRatio = translation.length / original.length;
  console.log(`   长度比: ${lengthRatio.toFixed(2)} (原:${original.length}, 译:${translation.length})`);
  
  // 性能评估
  if (responseTime < 3000) {
    console.log('   ⚡ 性能: 优秀 (< 3s)');
  } else if (responseTime < 10000) {
    console.log('   🚀 性能: 良好 (< 10s)');
  } else {
    console.log('   🐌 性能: 需要优化 (> 10s)');
  }
  
  // 基本检查
  if (translation.includes('[') || translation.includes('TRANSLATION')) {
    console.log('   ⚠️ 可能是fallback结果，非真实翻译');
  } else {
    console.log('   ✅ 翻译格式正常');
  }
}

// 批量测试不同语言对
async function batchTest() {
  const testCases = [
    { text: 'Hello world', source: 'en', target: 'ht' },
    { text: 'Good morning', source: 'en', target: 'sw' },
    { text: 'Thank you', source: 'en', target: 'zh' },
  ];
  
  console.log('🧪 开始批量测试...\n');
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n=== 测试用例 ${i + 1}/${testCases.length} ===`);
    await debugTranslation(testCase.text, testCase.source, testCase.target);
    
    // 避免触发速率限制
    if (i < testCases.length - 1) {
      console.log('⏸️ 等待2秒避免速率限制...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

// 主函数
async function main() {
  if (!API_KEY) {
    console.error('❌ 请设置 HUGGINGFACE_API_KEY 环境变量');
    process.exit(1);
  }
  
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // 默认批量测试
    await batchTest();
  } else if (args.length === 3) {
    // 自定义测试
    const [text, source, target] = args;
    await debugTranslation(text, source, target);
  } else {
    console.log('📖 用法:');
    console.log('   node debug-huggingface.js                    # 批量测试');
    console.log('   node debug-huggingface.js "text" en ht      # 自定义测试');
  }
}

main().catch(console.error);