#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// 配置
const CONFIG = {
  // Hugging Face Space API URL (从项目配置中获取)
  nllbServiceUrl: process.env.NLLB_SERVICE_URL || 'https://wane0528-my-nllb-api.hf.space/api/v4/translator',
  timeout: parseInt(process.env.NLLB_SERVICE_TIMEOUT || '60000'),
  
  // 翻译文件路径
  messagesDir: path.join(__dirname, '../frontend/messages'),
  
  // 支持的语言列表（除了英语）
  targetLanguages: [
    { code: 'zh', name: 'Chinese' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ht', name: 'Haitian Creole' },
    { code: 'lo', name: 'Lao' },
    { code: 'sw', name: 'Swahili' },
    { code: 'my', name: 'Burmese' },
    { code: 'te', name: 'Telugu' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'pt', name: 'Portuguese' }
  ],
  
  // 批处理配置
  batchSize: 5, // 每批处理的文本数量
  delayBetweenRequests: 1000, // 请求间延迟（毫秒）
  maxRetries: 3, // 最大重试次数
};

// 工具函数
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 调用 Hugging Face Space API 进行翻译
async function translateText(text, sourceLang, targetLang, retries = 0) {
  try {
    console.log(`  翻译: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}" (${sourceLang} -> ${targetLang})`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.timeout);
    
    const response = await fetch(CONFIG.nllbServiceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        source_language: sourceLang,
        target_language: targetLang,
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API错误: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // 处理不同的响应格式
    let translatedText = '';
    if (data.translated_text) {
      translatedText = data.translated_text;
    } else if (data.translation) {
      translatedText = data.translation;
    } else if (typeof data === 'string') {
      translatedText = data;
    } else {
      throw new Error('API未返回翻译结果');
    }
    
    console.log(`  ✓ 翻译成功: "${translatedText.substring(0, 50)}${translatedText.length > 50 ? '...' : ''}"`);
    return translatedText;

  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      console.error(`  ✗ 翻译超时 (${CONFIG.timeout}ms)`);
    } else {
      console.error(`  ✗ 翻译失败: ${error.message}`);
    }
    
    // 重试逻辑
    if (retries < CONFIG.maxRetries) {
      console.log(`  ⟳ 重试 ${retries + 1}/${CONFIG.maxRetries}...`);
      await sleep(CONFIG.delayBetweenRequests * (retries + 1)); // 递增延迟
      return translateText(text, sourceLang, targetLang, retries + 1);
    }
    
    throw error;
  }
}

// 递归处理嵌套对象
async function translateObject(obj, sourceLang, targetLang, keyPath = '') {
  const result = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = keyPath ? `${keyPath}.${key}` : key;
    
    if (typeof value === 'string') {
      try {
        // 跳过空字符串和占位符
        if (!value.trim() || value.startsWith('[') && value.endsWith(']')) {
          result[key] = value;
          continue;
        }
        
        result[key] = await translateText(value, sourceLang, targetLang);
        await sleep(CONFIG.delayBetweenRequests); // 请求间延迟
        
      } catch (error) {
        console.error(`  ✗ 翻译失败 (${currentPath}): ${error.message}`);
        result[key] = value; // 保持原文
      }
    } else if (typeof value === 'object' && value !== null) {
      result[key] = await translateObject(value, sourceLang, targetLang, currentPath);
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

// 更新单个语言文件
async function updateLanguageFile(langCode, langName) {
  console.log(`\n🌍 开始更新 ${langName} (${langCode}) 翻译...`);
  
  try {
    // 读取英语基准文件
    const enFilePath = path.join(CONFIG.messagesDir, 'en.json');
    const enContent = JSON.parse(fs.readFileSync(enFilePath, 'utf8'));
    
    // 读取目标语言文件（如果存在）
    const langFilePath = path.join(CONFIG.messagesDir, `${langCode}.json`);
    let existingContent = {};
    
    if (fs.existsSync(langFilePath)) {
      existingContent = JSON.parse(fs.readFileSync(langFilePath, 'utf8'));
      console.log(`  📖 已加载现有翻译文件`);
    } else {
      console.log(`  📝 创建新的翻译文件`);
    }
    
    // 统计信息
    const totalKeys = countKeys(enContent);
    const existingKeys = countKeys(existingContent);
    console.log(`  📊 英语基准: ${totalKeys} 个键`);
    console.log(`  📊 现有翻译: ${existingKeys} 个键`);
    
    // 翻译缺失的内容
    console.log(`  🔄 开始翻译...`);
    const updatedContent = await translateObject(enContent, 'en', langCode);
    
    // 合并现有翻译（保留已有的翻译）
    const finalContent = mergeTranslations(existingContent, updatedContent);
    
    // 保存更新后的文件
    fs.writeFileSync(langFilePath, JSON.stringify(finalContent, null, 2), 'utf8');
    
    const finalKeys = countKeys(finalContent);
    console.log(`  ✅ ${langName} 翻译更新完成!`);
    console.log(`  📊 最终翻译: ${finalKeys} 个键`);
    console.log(`  💾 已保存到: ${langFilePath}`);
    
    return {
      language: langName,
      code: langCode,
      totalKeys,
      existingKeys,
      finalKeys,
      newKeys: finalKeys - existingKeys
    };
    
  } catch (error) {
    console.error(`  ❌ ${langName} 翻译更新失败: ${error.message}`);
    return {
      language: langName,
      code: langCode,
      error: error.message
    };
  }
}

// 计算对象中的键数量
function countKeys(obj) {
  let count = 0;
  for (const value of Object.values(obj)) {
    if (typeof value === 'string') {
      count++;
    } else if (typeof value === 'object' && value !== null) {
      count += countKeys(value);
    }
  }
  return count;
}

// 合并翻译，保留现有的翻译
function mergeTranslations(existing, updated) {
  const result = { ...updated };
  
  for (const [key, value] of Object.entries(existing)) {
    if (typeof value === 'string' && value.trim()) {
      result[key] = value; // 保留现有翻译
    } else if (typeof value === 'object' && value !== null && result[key]) {
      result[key] = mergeTranslations(value, result[key]);
    }
  }
  
  return result;
}

// 主函数
async function main() {
  console.log('🚀 开始使用 Hugging Face Space API 更新多语言翻译...');
  console.log(`📡 API 端点: ${CONFIG.nllbServiceUrl}`);
  console.log(`🌐 目标语言: ${CONFIG.targetLanguages.map(l => l.name).join(', ')}`);
  
  const results = [];
  
  for (const lang of CONFIG.targetLanguages) {
    const result = await updateLanguageFile(lang.code, lang.name);
    results.push(result);
    
    // 语言间延迟
    if (CONFIG.targetLanguages.indexOf(lang) < CONFIG.targetLanguages.length - 1) {
      console.log(`  ⏳ 等待 ${CONFIG.delayBetweenRequests}ms...`);
      await sleep(CONFIG.delayBetweenRequests);
    }
  }
  
  // 生成报告
  console.log('\n📋 翻译更新报告:');
  console.log('=' .repeat(60));
  
  let totalSuccess = 0;
  let totalErrors = 0;
  let totalNewKeys = 0;
  
  for (const result of results) {
    if (result.error) {
      console.log(`❌ ${result.language} (${result.code}): ${result.error}`);
      totalErrors++;
    } else {
      console.log(`✅ ${result.language} (${result.code}): ${result.finalKeys} 键 (+${result.newKeys} 新增)`);
      totalSuccess++;
      totalNewKeys += result.newKeys;
    }
  }
  
  console.log('=' .repeat(60));
  console.log(`📊 总计: ${totalSuccess} 成功, ${totalErrors} 失败`);
  console.log(`🆕 新增翻译键: ${totalNewKeys}`);
  
  if (totalErrors > 0) {
    console.log('\n⚠️  部分语言更新失败，请检查网络连接和API状态');
    process.exit(1);
  } else {
    console.log('\n🎉 所有语言翻译更新完成!');
  }
}

// 处理命令行参数
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
使用方法: node update-translations-with-hf.js [选项]

选项:
  --help, -h     显示帮助信息
  --lang CODE    只更新指定语言 (例如: --lang zh)
  --dry-run      预览模式，不实际更新文件

环境变量:
  NLLB_SERVICE_URL      Hugging Face Space API URL
  NLLB_SERVICE_TIMEOUT  API 超时时间（毫秒）

示例:
  node update-translations-with-hf.js              # 更新所有语言
  node update-translations-with-hf.js --lang zh    # 只更新中文
  node update-translations-with-hf.js --dry-run    # 预览模式
`);
  process.exit(0);
}

// 处理单个语言参数
const langIndex = process.argv.indexOf('--lang');
if (langIndex !== -1 && process.argv[langIndex + 1]) {
  const targetLangCode = process.argv[langIndex + 1];
  const targetLang = CONFIG.targetLanguages.find(l => l.code === targetLangCode);
  
  if (targetLang) {
    CONFIG.targetLanguages = [targetLang];
    console.log(`🎯 只更新 ${targetLang.name} (${targetLang.code})`);
  } else {
    console.error(`❌ 不支持的语言代码: ${targetLangCode}`);
    console.log(`支持的语言: ${CONFIG.targetLanguages.map(l => l.code).join(', ')}`);
    process.exit(1);
  }
}

// 预览模式
if (process.argv.includes('--dry-run')) {
  console.log('🔍 预览模式 - 不会实际更新文件');
  // 这里可以添加预览逻辑
  process.exit(0);
}

// 运行主函数
if (require.main === module) {
  main().catch(error => {
    console.error('💥 脚本执行失败:', error);
    process.exit(1);
  });
}

module.exports = {
  translateText,
  updateLanguageFile,
  CONFIG
};
