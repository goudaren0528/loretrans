#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// NLLB语言代码映射
const NLLB_LANGUAGE_MAP = {
  'ht': 'hat_Latn', // Haitian Creole
  'lo': 'lao_Laoo', // Lao
  'sw': 'swh_Latn', // Swahili
  'my': 'mya_Mymr', // Burmese
  'te': 'tel_Telu', // Telugu
  'si': 'sin_Sinh', // Sinhala
  'am': 'amh_Ethi', // Amharic
  'km': 'khm_Khmr', // Khmer
  'ne': 'npi_Deva', // Nepali
  'mg': 'plt_Latn', // Malagasy
  'en': 'eng_Latn', // English
  'zh': 'zho_Hans', // Chinese (Simplified)
  'fr': 'fra_Latn', // French
  'es': 'spa_Latn', // Spanish
  'pt': 'por_Latn', // Portuguese
  'ar': 'arb_Arab', // Arabic
  'hi': 'hin_Deva', // Hindi
};

// 获取NLLB格式的语言代码
function getNLLBLanguageCode(language) {
  const nllbCode = NLLB_LANGUAGE_MAP[language];
  if (!nllbCode) {
    throw new Error(`Unsupported language: ${language}`);
  }
  return nllbCode;
}

// 配置
const CONFIG = {
  // Hugging Face Space API URL
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
  batchSize: 3, // 每批处理的文本数量
  delayBetweenRequests: 2000, // 请求间延迟（毫秒）
  maxRetries: 3, // 最大重试次数
  
  // 占位符模式 - 识别需要翻译的内容
  placeholderPatterns: [
    /^\[.*\]$/, // [占位符]
    /^TODO:/i,  // TODO: 开头
    /^PLACEHOLDER/i, // PLACEHOLDER 开头
    /^未翻译/,  // 中文占位符
    /^Not translated/i, // 英文占位符
    // 新增的占位符模式
    /^待翻译$/,  // 中文"待翻译"
    /^需要翻译$/,  // 中文"需要翻译"
    /^翻译需要$/,  // 中文"翻译需要"
    /^Tradução necessária$/i, // 葡萄牙语"需要翻译"
    /^Traducción necesaria$/i, // 西班牙语"需要翻译"
    /^Traduction nécessaire$/i, // 法语"需要翻译"
    /^يحتاج ترجمة$/,  // 阿拉伯语"需要翻译"
    /^अनुवाद की आवश्यकता$/,  // 印地语"需要翻译"
    /^Translation needed$/i, // 英语"需要翻译"
    /^Traduire$/i, // 法语"翻译"
    /^Traducir$/i, // 西班牙语"翻译"
  ]
};

// 工具函数
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 检查是否为占位符或需要翻译的内容
function needsTranslation(text, existingText = '') {
  if (!text || typeof text !== 'string') return false;
  
  // 如果已有翻译且不是占位符，则跳过
  if (existingText && !isPlaceholder(existingText)) {
    return false;
  }
  
  // 检查是否为占位符
  return CONFIG.placeholderPatterns.some(pattern => pattern.test(text)) || 
         !existingText || 
         isPlaceholder(existingText);
}

function isPlaceholder(text) {
  if (!text || typeof text !== 'string') return true;
  return CONFIG.placeholderPatterns.some(pattern => pattern.test(text));
}

// 调用 Hugging Face Space API 进行翻译
async function translateText(text, sourceLang, targetLang, retries = 0) {
  try {
    // 转换为NLLB格式的语言代码
    const sourceNLLB = getNLLBLanguageCode(sourceLang);
    const targetNLLB = getNLLBLanguageCode(targetLang);
    
    console.log(`    🔄 翻译: "${text.substring(0, 40)}${text.length > 40 ? '...' : ''}" (${sourceNLLB} → ${targetNLLB})`);
    
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
        source: sourceNLLB,
        target: targetNLLB,
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API错误: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // 处理API响应格式
    let translatedText = '';
    if (data.result) {
      translatedText = data.result;
    } else if (data.translated_text) {
      translatedText = data.translated_text;
    } else if (data.translation) {
      translatedText = data.translation;
    } else if (typeof data === 'string') {
      translatedText = data;
    } else {
      throw new Error('API未返回翻译结果');
    }
    
    console.log(`    ✅ 翻译完成: "${translatedText.substring(0, 40)}${translatedText.length > 40 ? '...' : ''}"`);
    return translatedText;

  } catch (error) {
    if (error.name === 'AbortError') {
      console.error(`    ❌ 翻译超时 (${CONFIG.timeout}ms)`);
    } else {
      console.error(`    ❌ 翻译失败: ${error.message}`);
    }
    
    // 重试逻辑
    if (retries < CONFIG.maxRetries) {
      console.log(`    🔄 重试 ${retries + 1}/${CONFIG.maxRetries}...`);
      await sleep(CONFIG.delayBetweenRequests * (retries + 1));
      return translateText(text, sourceLang, targetLang, retries + 1);
    }
    
    throw error;
  }
}

// 获取缺失的翻译键
function getMissingKeys(enObj, targetObj, keyPath = '') {
  const missing = [];
  
  for (const [key, value] of Object.entries(enObj)) {
    const currentPath = keyPath ? `${keyPath}.${key}` : key;
    
    if (typeof value === 'string') {
      const targetValue = targetObj[key];
      if (needsTranslation(value, targetValue)) {
        missing.push({
          path: currentPath,
          key: key,
          englishText: value,
          existingText: targetValue || '',
          needsUpdate: !targetValue || isPlaceholder(targetValue)
        });
      }
    } else if (typeof value === 'object' && value !== null) {
      const nestedMissing = getMissingKeys(
        value, 
        targetObj[key] || {}, 
        currentPath
      );
      missing.push(...nestedMissing);
    }
  }
  
  return missing;
}

// 智能更新翻译对象
async function smartUpdateTranslations(enObj, targetObj, sourceLang, targetLang, keyPath = '') {
  const result = { ...targetObj };
  let updatedCount = 0;
  
  for (const [key, value] of Object.entries(enObj)) {
    const currentPath = keyPath ? `${keyPath}.${key}` : key;
    
    if (typeof value === 'string') {
      const existingValue = targetObj[key];
      
      if (needsTranslation(value, existingValue)) {
        try {
          console.log(`  📝 更新键: ${currentPath}`);
          result[key] = await translateText(value, sourceLang, targetLang);
          updatedCount++;
          await sleep(CONFIG.delayBetweenRequests);
        } catch (error) {
          console.error(`  ❌ 翻译失败 (${currentPath}): ${error.message}`);
          result[key] = existingValue || `[${value}]`; // 使用占位符
        }
      } else {
        result[key] = existingValue; // 保持现有翻译
      }
    } else if (typeof value === 'object' && value !== null) {
      const nestedResult = await smartUpdateTranslations(
        value,
        targetObj[key] || {},
        sourceLang,
        targetLang,
        currentPath
      );
      result[key] = nestedResult.obj;
      updatedCount += nestedResult.count;
    } else {
      result[key] = value;
    }
  }
  
  return { obj: result, count: updatedCount };
}

// 分析翻译文件状态
function analyzeTranslationFile(langCode, langName) {
  console.log(`\n🔍 分析 ${langName} (${langCode}) 翻译状态...`);
  
  const enFilePath = path.join(CONFIG.messagesDir, 'en.json');
  const langFilePath = path.join(CONFIG.messagesDir, `${langCode}.json`);
  
  if (!fs.existsSync(enFilePath)) {
    throw new Error('英语基准文件不存在');
  }
  
  const enContent = JSON.parse(fs.readFileSync(enFilePath, 'utf8'));
  let langContent = {};
  
  if (fs.existsSync(langFilePath)) {
    langContent = JSON.parse(fs.readFileSync(langFilePath, 'utf8'));
  }
  
  const missingKeys = getMissingKeys(enContent, langContent);
  const totalKeys = countKeys(enContent);
  const existingKeys = countKeys(langContent);
  const missingCount = missingKeys.length;
  
  console.log(`  📊 总键数: ${totalKeys}`);
  console.log(`  📊 已翻译: ${existingKeys - missingCount}`);
  console.log(`  📊 需更新: ${missingCount}`);
  console.log(`  📊 完成度: ${Math.round((existingKeys - missingCount) / totalKeys * 100)}%`);
  
  if (missingCount > 0) {
    console.log(`  📋 需要翻译的键:`);
    missingKeys.slice(0, 5).forEach(item => {
      console.log(`    - ${item.path}: "${item.englishText.substring(0, 30)}${item.englishText.length > 30 ? '...' : ''}"`);
    });
    if (missingCount > 5) {
      console.log(`    ... 还有 ${missingCount - 5} 个键`);
    }
  }
  
  return {
    totalKeys,
    existingKeys,
    missingCount,
    missingKeys,
    completionRate: Math.round((existingKeys - missingCount) / totalKeys * 100)
  };
}

// 更新单个语言文件
async function updateLanguageFile(langCode, langName, forceUpdate = false) {
  console.log(`\n🌍 开始更新 ${langName} (${langCode}) 翻译...`);
  
  try {
    // 分析当前状态
    const analysis = analyzeTranslationFile(langCode, langName);
    
    if (analysis.missingCount === 0 && !forceUpdate) {
      console.log(`  ✅ ${langName} 翻译已完整，跳过更新`);
      return {
        language: langName,
        code: langCode,
        skipped: true,
        ...analysis
      };
    }
    
    // 读取文件
    const enFilePath = path.join(CONFIG.messagesDir, 'en.json');
    const langFilePath = path.join(CONFIG.messagesDir, `${langCode}.json`);
    
    const enContent = JSON.parse(fs.readFileSync(enFilePath, 'utf8'));
    let langContent = {};
    
    if (fs.existsSync(langFilePath)) {
      langContent = JSON.parse(fs.readFileSync(langFilePath, 'utf8'));
    }
    
    // 智能更新翻译
    console.log(`  🔄 开始翻译 ${analysis.missingCount} 个缺失的键...`);
    const updateResult = await smartUpdateTranslations(enContent, langContent, 'en', langCode);
    
    // 保存更新后的文件
    fs.writeFileSync(langFilePath, JSON.stringify(updateResult.obj, null, 2), 'utf8');
    
    console.log(`  ✅ ${langName} 翻译更新完成!`);
    console.log(`  📊 更新了 ${updateResult.count} 个翻译`);
    console.log(`  💾 已保存到: ${langFilePath}`);
    
    return {
      language: langName,
      code: langCode,
      ...analysis,
      updatedCount: updateResult.count,
      newCompletionRate: Math.round((analysis.existingKeys + updateResult.count - analysis.missingCount) / analysis.totalKeys * 100)
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

// 生成翻译状态报告
function generateStatusReport() {
  console.log('\n📋 当前翻译状态报告:');
  console.log('=' .repeat(80));
  
  const enFilePath = path.join(CONFIG.messagesDir, 'en.json');
  if (!fs.existsSync(enFilePath)) {
    console.log('❌ 英语基准文件不存在');
    return;
  }
  
  const enContent = JSON.parse(fs.readFileSync(enFilePath, 'utf8'));
  const totalKeys = countKeys(enContent);
  
  console.log(`📊 英语基准: ${totalKeys} 个键`);
  console.log('-' .repeat(80));
  
  for (const lang of CONFIG.targetLanguages) {
    const langFilePath = path.join(CONFIG.messagesDir, `${lang.code}.json`);
    
    if (fs.existsSync(langFilePath)) {
      const langContent = JSON.parse(fs.readFileSync(langFilePath, 'utf8'));
      const missingKeys = getMissingKeys(enContent, langContent);
      const completionRate = Math.round((totalKeys - missingKeys.length) / totalKeys * 100);
      
      const status = completionRate === 100 ? '✅' : completionRate >= 90 ? '🟡' : '🔴';
      console.log(`${status} ${lang.name.padEnd(20)} (${lang.code}): ${completionRate}% (${totalKeys - missingKeys.length}/${totalKeys})`);
    } else {
      console.log(`🔴 ${lang.name.padEnd(20)} (${lang.code}): 0% (文件不存在)`);
    }
  }
  
  console.log('=' .repeat(80));
}

// 主函数
async function main() {
  console.log('🚀 智能翻译更新工具');
  console.log(`📡 API 端点: ${CONFIG.nllbServiceUrl}`);
  
  // 处理命令行参数
  const args = process.argv.slice(2);
  const forceUpdate = args.includes('--force');
  const statusOnly = args.includes('--status');
  const langIndex = args.indexOf('--lang');
  
  if (statusOnly) {
    generateStatusReport();
    return;
  }
  
  let targetLanguages = CONFIG.targetLanguages;
  
  if (langIndex !== -1 && args[langIndex + 1]) {
    const targetLangCode = args[langIndex + 1];
    const targetLang = CONFIG.targetLanguages.find(l => l.code === targetLangCode);
    
    if (targetLang) {
      targetLanguages = [targetLang];
      console.log(`🎯 只更新 ${targetLang.name} (${targetLang.code})`);
    } else {
      console.error(`❌ 不支持的语言代码: ${targetLangCode}`);
      console.log(`支持的语言: ${CONFIG.targetLanguages.map(l => l.code).join(', ')}`);
      process.exit(1);
    }
  }
  
  console.log(`🌐 目标语言: ${targetLanguages.map(l => l.name).join(', ')}`);
  if (forceUpdate) {
    console.log('⚠️  强制更新模式 - 将重新翻译所有内容');
  }
  
  const results = [];
  
  for (const lang of targetLanguages) {
    const result = await updateLanguageFile(lang.code, lang.name, forceUpdate);
    results.push(result);
    
    // 语言间延迟
    if (targetLanguages.indexOf(lang) < targetLanguages.length - 1) {
      console.log(`  ⏳ 等待 ${CONFIG.delayBetweenRequests}ms...`);
      await sleep(CONFIG.delayBetweenRequests);
    }
  }
  
  // 生成最终报告
  console.log('\n📋 更新完成报告:');
  console.log('=' .repeat(80));
  
  let totalSuccess = 0;
  let totalErrors = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;
  
  for (const result of results) {
    if (result.error) {
      console.log(`❌ ${result.language} (${result.code}): ${result.error}`);
      totalErrors++;
    } else if (result.skipped) {
      console.log(`⏭️  ${result.language} (${result.code}): 已完整 (${result.completionRate}%)`);
      totalSkipped++;
    } else {
      const improvement = (result.newCompletionRate || result.completionRate) - (result.completionRate || 0);
      console.log(`✅ ${result.language} (${result.code}): ${result.updatedCount} 个更新, ${result.newCompletionRate || result.completionRate}% (+${improvement}%)`);
      totalSuccess++;
      totalUpdated += result.updatedCount || 0;
    }
  }
  
  console.log('=' .repeat(80));
  console.log(`📊 总计: ${totalSuccess} 成功, ${totalSkipped} 跳过, ${totalErrors} 失败`);
  console.log(`🆕 总更新数: ${totalUpdated} 个翻译`);
  
  if (totalErrors > 0) {
    console.log('\n⚠️  部分语言更新失败，请检查网络连接和API状态');
    process.exit(1);
  } else {
    console.log('\n🎉 翻译更新完成!');
  }
}

// 帮助信息
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🌍 智能翻译更新工具

使用方法: node smart-translation-update.js [选项]

选项:
  --help, -h     显示帮助信息
  --status       只显示当前翻译状态，不进行更新
  --lang CODE    只更新指定语言 (例如: --lang zh)
  --force        强制更新所有翻译（包括已有的）

环境变量:
  NLLB_SERVICE_URL      Hugging Face Space API URL
  NLLB_SERVICE_TIMEOUT  API 超时时间（毫秒）

示例:
  node smart-translation-update.js              # 智能更新所有缺失翻译
  node smart-translation-update.js --status     # 查看翻译状态
  node smart-translation-update.js --lang zh    # 只更新中文缺失翻译
  node smart-translation-update.js --force      # 强制重新翻译所有内容

特性:
  ✅ 只翻译缺失或占位符内容
  ✅ 保留现有的高质量翻译
  ✅ 智能识别占位符模式
  ✅ 详细的进度和状态报告
  ✅ 自动重试和错误处理
`);
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
  analyzeTranslationFile,
  generateStatusReport,
  CONFIG
};
