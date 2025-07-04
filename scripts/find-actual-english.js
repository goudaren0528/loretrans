#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  messagesDir: path.join(__dirname, '../frontend/messages'),
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
  ]
};

// 非常精确的英文检测 - 只检测明显的英文文本
function isObviousEnglishText(text, langCode) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) return false;
  
  const trimmedText = text.trim();
  
  // 排除空格
  if (trimmedText === ' ' || trimmedText.length < 2) return false;
  
  // 明确的英文单词列表
  const obviousEnglishWords = [
    'remember me', 'sign up', 'sign in', 'hide password', 'show password',
    'no email', 'translation failed', 'detection failed', 'invalid file',
    'upload failed', 'document translation', 'priority support',
    'ready to translate', 'upload your document', 'creole greeting',
    'lao greeting', 'swahili greeting', 'choose a pricing plan',
    'coming soon', 'copy to clipboard', 'batch processing'
  ];
  
  const lowerText = trimmedText.toLowerCase();
  
  // 检查是否完全匹配明显的英文短语
  if (obviousEnglishWords.includes(lowerText)) {
    return true;
  }
  
  // 检查是否包含明显的英文句子模式
  const englishSentencePatterns = [
    /^(is|are|the|this|that|how|what|when|where|why|can|will|would|should)\s+/i,
    /\s+(to|for|with|and|or|but|in|on|at|by|from)\s+/i,
    /^[A-Z][a-z]+\s+(is|are|has|have|will|would|can|should)/i
  ];
  
  // 只有当文本主要是拉丁字符且匹配英文句子模式时才认为是英文
  const latinChars = trimmedText.match(/[A-Za-z]/g) || [];
  const totalChars = trimmedText.replace(/\s/g, '').length;
  const latinRatio = totalChars > 0 ? latinChars.length / totalChars : 0;
  
  if (latinRatio > 0.95 && englishSentencePatterns.some(pattern => pattern.test(trimmedText))) {
    // 进一步检查是否真的是英文而不是其他拉丁语系语言
    const englishIndicators = [
      /\b(the|and|or|but|in|on|at|to|for|of|with|by|is|are|was|were|have|has|had|will|would|can|could|should|may|might)\b/gi
    ];
    
    const matches = englishIndicators.reduce((count, pattern) => {
      return count + (trimmedText.match(pattern) || []).length;
    }, 0);
    
    // 如果包含多个英文指示词，则认为是英文
    return matches >= 2;
  }
  
  return false;
}

// 通过与英文基准文件比较来查找英文文本
function findEnglishByComparison(langCode, langName) {
  console.log(`\n🔍 通过比较查找 ${langName} (${langCode}) 中的英文文本...`);
  
  const enFilePath = path.join(CONFIG.messagesDir, 'en.json');
  const langFilePath = path.join(CONFIG.messagesDir, `${langCode}.json`);
  
  if (!fs.existsSync(enFilePath) || !fs.existsSync(langFilePath)) {
    console.log(`  ❌ 文件不存在`);
    return { language: langName, code: langCode, error: 'File not found' };
  }
  
  try {
    const enContent = JSON.parse(fs.readFileSync(enFilePath, 'utf8'));
    const langContent = JSON.parse(fs.readFileSync(langFilePath, 'utf8'));
    
    const englishTexts = findIdenticalTexts(enContent, langContent);
    
    console.log(`  📊 总键数: ${countKeys(langContent)}`);
    console.log(`  🔤 发现与英文相同的文本: ${englishTexts.length}`);
    
    if (englishTexts.length > 0) {
      console.log(`  📋 需要翻译的文本:`);
      englishTexts.slice(0, 10).forEach(item => {
        console.log(`    - ${item.path}: "${item.text}"`);
      });
      if (englishTexts.length > 10) {
        console.log(`    ... 还有 ${englishTexts.length - 10} 个文本`);
      }
    } else {
      console.log(`  ✅ 未发现与英文相同的文本`);
    }
    
    return {
      language: langName,
      code: langCode,
      totalKeys: countKeys(langContent),
      englishTexts: englishTexts,
      englishCount: englishTexts.length
    };
    
  } catch (error) {
    console.error(`  ❌ 解析文件失败: ${error.message}`);
    return { language: langName, code: langCode, error: error.message };
  }
}

// 递归查找与英文相同的文本
function findIdenticalTexts(enObj, langObj, keyPath = '', results = []) {
  for (const [key, enValue] of Object.entries(enObj)) {
    const currentPath = keyPath ? `${keyPath}.${key}` : key;
    const langValue = langObj[key];
    
    if (typeof enValue === 'string') {
      // 如果目标语言中的值与英文完全相同，则认为需要翻译
      if (typeof langValue === 'string' && langValue === enValue && enValue.trim().length > 0) {
        results.push({
          path: currentPath,
          key: key,
          text: enValue
        });
      }
    } else if (typeof enValue === 'object' && enValue !== null) {
      if (typeof langValue === 'object' && langValue !== null) {
        findIdenticalTexts(enValue, langValue, currentPath, results);
      }
    }
  }
  
  return results;
}

// 计算键数量
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

// 主函数
async function main() {
  console.log('🚀 查找多语言文件中与英文相同的文本...');
  
  const results = [];
  
  for (const lang of CONFIG.targetLanguages) {
    const result = findEnglishByComparison(lang.code, lang.name);
    results.push(result);
  }
  
  // 生成报告
  console.log('\n📋 英文文本检查详细报告:');
  console.log('=' .repeat(80));
  
  let totalEnglishTexts = 0;
  let languagesWithIssues = 0;
  
  for (const result of results) {
    if (result.error) {
      console.log(`❌ ${result.language} (${result.code}): ${result.error}`);
    } else {
      const status = result.englishCount === 0 ? '✅' : '⚠️';
      console.log(`${status} ${result.language.padEnd(20)} (${result.code}): ${result.englishCount} 个与英文相同的文本`);
      
      if (result.englishCount > 0) {
        languagesWithIssues++;
        totalEnglishTexts += result.englishCount;
      }
    }
  }
  
  console.log('=' .repeat(80));
  console.log(`📊 总计: ${languagesWithIssues} 个语言存在与英文相同的文本`);
  console.log(`🔤 需要翻译的文本总数: ${totalEnglishTexts}`);
  
  if (totalEnglishTexts > 0) {
    console.log('\n⚠️  发现多语言文件中存在与英文相同的文本，需要进行翻译修复');
    console.log('💡 这些文本可能是未翻译的英文内容');
  } else {
    console.log('\n🎉 所有多语言文件都已正确翻译，未发现与英文相同的文本！');
  }
  
  return results;
}

// 运行主函数
if (require.main === module) {
  main().catch(error => {
    console.error('💥 检查执行失败:', error);
    process.exit(1);
  });
}

module.exports = {
  findEnglishByComparison,
  findIdenticalTexts,
  CONFIG
};
