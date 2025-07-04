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
    { code: 'pt', name: 'Portuguese' },
    { code: 'si', name: 'Sinhala' },
    { code: 'am', name: 'Amharic' },
    { code: 'km', name: 'Khmer' },
    { code: 'ne', name: 'Nepali' },
    { code: 'mg', name: 'Malagasy' }
  ]
};

// 占位符文本模式 - 各种语言中的"需要翻译"表达
const PLACEHOLDER_PATTERNS = {
  // 通用占位符
  common: [
    /^Translation needed$/i,
    /^Need translation$/i,
    /^To be translated$/i,
    /^Translate this$/i,
    /^TODO: translate$/i,
    /^\[Translation needed\]$/i,
    /^\[需要翻译\]$/,
    /^翻译待完成$/,
    /^待翻译$/
  ],
  
  // 各语言特定的占位符
  'pt': [
    /^Tradução necessária$/i,
    /^Precisa de tradução$/i,
    /^Traduzir$/i,
    /^Para traduzir$/i
  ],
  'es': [
    /^Traducción necesaria$/i,
    /^Necesita traducción$/i,
    /^Traducir$/i,
    /^Para traducir$/i
  ],
  'fr': [
    /^Traduction nécessaire$/i,
    /^Traduction requise$/i,
    /^À traduire$/i,
    /^Traduire$/i
  ],
  'zh': [
    /^需要翻译$/,
    /^翻译需要$/,
    /^待翻译$/,
    /^请翻译$/
  ],
  'ar': [
    /^يحتاج ترجمة$/,
    /^ترجمة مطلوبة$/,
    /^للترجمة$/
  ],
  'hi': [
    /^अनुवाद की आवश्यकता$/,
    /^अनुवाद चाहिए$/
  ]
};

// 语境相关的翻译修正规则
const CONTEXT_CORRECTIONS = {
  'zh': {
    // 语言名称相关错误
    '劳斯人': {
      contexts: ['greeting', 'language', 'lao'],
      correction: '老挝语',
      reason: '在语言语境下"Lao"应该翻译为"老挝语"而不是"劳斯人"'
    },
    '劳斯': {
      contexts: ['greeting', 'language', 'lao'],
      correction: '老挝语',
      reason: '在语言语境下"Lao"应该翻译为"老挝语"'
    },
    '斯瓦希里语的问候': {
      contexts: ['greeting', 'swahili'],
      correction: '斯瓦希里语问候',
      reason: '简化表达，去掉多余的"的"'
    },
    '克里奥尔语的问候': {
      contexts: ['greeting', 'creole'],
      correction: '克里奥尔语问候',
      reason: '简化表达，去掉多余的"的"'
    },
    '海地克里奥尔语的问候': {
      contexts: ['greeting', 'haitian', 'creole'],
      correction: '海地克里奥尔语问候',
      reason: '简化表达，去掉多余的"的"'
    },
    '老挝语的问候': {
      contexts: ['greeting', 'lao'],
      correction: '老挝语问候',
      reason: '简化表达，去掉多余的"的"'
    },
    
    // 技术术语错误
    '现在我们要做什么': {
      contexts: ['sign_up', 'register', 'signup'],
      correction: '注册',
      reason: '"Sign up"应该翻译为"注册"'
    },
    '现在我们要做什么?': {
      contexts: ['sign_up', 'register', 'signup'],
      correction: '注册',
      reason: '"Sign up"应该翻译为"注册"'
    },
    '批量加工': {
      contexts: ['batch', 'processing'],
      correction: '批量处理',
      reason: '"Batch processing"应该翻译为"批量处理"而不是"批量加工"'
    },
    '很快就会来': {
      contexts: ['coming', 'soon'],
      correction: '即将推出',
      reason: '"Coming soon"应该翻译为"即将推出"'
    },
    
    // UI相关错误 - 移除了误报的登录注册检查
  },
  
  // 其他语言的修正规则可以在这里添加
  'ar': {
    // 阿拉伯语修正规则
  },
  'hi': {
    // 印地语修正规则
  }
};

// 检查是否为占位符文本
function isPlaceholderText(text, langCode) {
  // 检查通用占位符
  for (const pattern of PLACEHOLDER_PATTERNS.common) {
    if (pattern.test(text.trim())) {
      return true;
    }
  }
  
  // 检查特定语言的占位符
  if (PLACEHOLDER_PATTERNS[langCode]) {
    for (const pattern of PLACEHOLDER_PATTERNS[langCode]) {
      if (pattern.test(text.trim())) {
        return true;
      }
    }
  }
  
  return false;
}

// 检查语境相关的翻译错误
function checkContextualErrors(text, langCode, keyPath) {
  const corrections = CONTEXT_CORRECTIONS[langCode] || {};
  const issues = [];
  
  for (const [incorrectText, correctionInfo] of Object.entries(corrections)) {
    if (text.includes(incorrectText)) {
      // 检查语境是否匹配
      const contextMatch = correctionInfo.contexts.some(context => 
        keyPath.toLowerCase().includes(context) || 
        keyPath.toLowerCase().includes(context.replace('_', ''))
      );
      
      if (contextMatch) {
        issues.push({
          type: 'contextual_error',
          incorrectText: incorrectText,
          suggestedCorrection: text.replace(incorrectText, correctionInfo.correction),
          reason: correctionInfo.reason,
          confidence: 'high'
        });
      }
    }
  }
  
  return issues;
}

// 检查单个翻译条目
function checkTranslationEntry(key, value, langCode, keyPath = '', issues = []) {
  const currentPath = keyPath ? `${keyPath}.${key}` : key;
  
  if (typeof value === 'string') {
    // 检查占位符文本
    if (isPlaceholderText(value, langCode)) {
      issues.push({
        path: currentPath,
        key: key,
        currentText: value,
        type: 'placeholder_text',
        reason: `包含占位符文本，需要实际翻译`,
        confidence: 'high'
      });
    }
    
    // 检查语境相关错误
    const contextualErrors = checkContextualErrors(value, langCode, currentPath);
    for (const error of contextualErrors) {
      issues.push({
        path: currentPath,
        key: key,
        currentText: value,
        ...error
      });
    }
    
  } else if (typeof value === 'object' && value !== null) {
    // 递归检查嵌套对象
    for (const [nestedKey, nestedValue] of Object.entries(value)) {
      checkTranslationEntry(nestedKey, nestedValue, langCode, currentPath, issues);
    }
  }
  
  return issues;
}

// 检查单个语言文件
function checkLanguageFile(langCode, langName) {
  console.log(`\n🔍 检查 ${langName} (${langCode}) 的翻译质量...`);
  
  const langFilePath = path.join(CONFIG.messagesDir, `${langCode}.json`);
  
  if (!fs.existsSync(langFilePath)) {
    console.log(`  ❌ 文件不存在: ${langFilePath}`);
    return { language: langName, code: langCode, error: 'File not found' };
  }
  
  try {
    const langContent = JSON.parse(fs.readFileSync(langFilePath, 'utf8'));
    const issues = [];
    
    // 检查所有翻译条目
    for (const [key, value] of Object.entries(langContent)) {
      checkTranslationEntry(key, value, langCode, '', issues);
    }
    
    console.log(`  📊 总键数: ${countKeys(langContent)}`);
    console.log(`  🔍 发现质量问题: ${issues.length}`);
    
    if (issues.length > 0) {
      console.log(`  📋 质量问题详情:`);
      
      // 按类型分组显示
      const placeholderIssues = issues.filter(i => i.type === 'placeholder_text');
      const contextualIssues = issues.filter(i => i.type === 'contextual_error');
      
      if (placeholderIssues.length > 0) {
        console.log(`    📝 占位符文本问题 (${placeholderIssues.length}个):`);
        placeholderIssues.slice(0, 5).forEach((issue, index) => {
          console.log(`      ${index + 1}. ${issue.path}: "${issue.currentText}"`);
        });
        if (placeholderIssues.length > 5) {
          console.log(`      ... 还有 ${placeholderIssues.length - 5} 个类似问题`);
        }
      }
      
      if (contextualIssues.length > 0) {
        console.log(`    🎯 语境翻译错误 (${contextualIssues.length}个):`);
        contextualIssues.forEach((issue, index) => {
          console.log(`      ${index + 1}. ${issue.path}`);
          console.log(`         当前: "${issue.currentText}"`);
          console.log(`         建议: "${issue.suggestedCorrection}"`);
          console.log(`         原因: ${issue.reason}`);
          console.log('');
        });
      }
    }
    
    return {
      language: langName,
      code: langCode,
      totalKeys: countKeys(langContent),
      issues: issues,
      issueCount: issues.length,
      placeholderCount: issues.filter(i => i.type === 'placeholder_text').length,
      contextualErrorCount: issues.filter(i => i.type === 'contextual_error').length
    };
    
  } catch (error) {
    console.error(`  ❌ 解析文件失败: ${error.message}`);
    return { language: langName, code: langCode, error: error.message };
  }
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
  console.log('🚀 开始增强翻译质量检查...');
  console.log('🎯 重点检查: 1) 占位符文本 2) 语境翻译错误');
  
  // 处理命令行参数
  const args = process.argv.slice(2);
  const langIndex = args.indexOf('--lang');
  
  let targetLanguages = CONFIG.targetLanguages;
  
  if (langIndex !== -1 && args[langIndex + 1]) {
    const targetLangCode = args[langIndex + 1];
    const targetLang = CONFIG.targetLanguages.find(l => l.code === targetLangCode);
    
    if (targetLang) {
      targetLanguages = [targetLang];
      console.log(`🎯 只检查 ${targetLang.name} (${targetLang.code})`);
    } else {
      console.error(`❌ 不支持的语言代码: ${targetLangCode}`);
      console.log(`支持的语言: ${CONFIG.targetLanguages.map(l => l.code).join(', ')}`);
      process.exit(1);
    }
  }
  
  console.log(`🌐 目标语言: ${targetLanguages.map(l => l.name).join(', ')}`);
  
  const results = [];
  
  // 检查所有语言
  for (const lang of targetLanguages) {
    const result = await checkLanguageFile(lang.code, lang.name);
    results.push(result);
  }
  
  // 生成报告
  console.log('\n📋 增强翻译质量检查报告:');
  console.log('=' .repeat(80));
  
  let totalIssues = 0;
  let totalPlaceholders = 0;
  let totalContextualErrors = 0;
  let languagesWithIssues = 0;
  
  for (const result of results) {
    if (result.error) {
      console.log(`❌ ${result.language} (${result.code}): ${result.error}`);
    } else {
      const status = result.issueCount === 0 ? '✅' : '⚠️';
      let statusText = `${status} ${result.language.padEnd(20)} (${result.code}): `;
      
      if (result.issueCount === 0) {
        statusText += '无质量问题';
      } else {
        const parts = [];
        if (result.placeholderCount > 0) {
          parts.push(`${result.placeholderCount}个占位符`);
        }
        if (result.contextualErrorCount > 0) {
          parts.push(`${result.contextualErrorCount}个语境错误`);
        }
        statusText += parts.join(', ');
      }
      
      console.log(statusText);
      
      if (result.issueCount > 0) {
        languagesWithIssues++;
        totalIssues += result.issueCount;
        totalPlaceholders += result.placeholderCount || 0;
        totalContextualErrors += result.contextualErrorCount || 0;
      }
    }
  }
  
  console.log('=' .repeat(80));
  console.log(`📊 总计: ${languagesWithIssues} 个语言存在质量问题`);
  console.log(`🔍 发现问题总数: ${totalIssues}`);
  console.log(`📝 占位符文本: ${totalPlaceholders}`);
  console.log(`🎯 语境翻译错误: ${totalContextualErrors}`);
  
  // 提供建议
  if (totalPlaceholders > 0) {
    console.log('\n💡 建议: 使用翻译脚本批量处理占位符文本');
  }
  if (totalContextualErrors > 0) {
    console.log('💡 建议: 手动修正语境翻译错误，或更新翻译规则');
  }
  
  return results;
}

// 帮助信息
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🔍 增强翻译质量检查工具

专门检查两类关键问题:
1. 📝 占位符文本 - 各种语言中的"需要翻译"占位符
2. 🎯 语境翻译错误 - 如"Lao"被错误翻译为"劳斯人"而不是"老挝语"

使用方法: node enhanced-translation-quality-check.js [选项]

选项:
  --help, -h     显示帮助信息
  --lang CODE    只检查指定语言 (例如: --lang zh)

示例:
  node enhanced-translation-quality-check.js              # 检查所有语言
  node enhanced-translation-quality-check.js --lang zh    # 只检查中文
  node enhanced-translation-quality-check.js --lang pt    # 只检查葡萄牙语

检查内容:
  ✅ 占位符文本检测 (如"Tradução necessária", "需要翻译")
  ✅ 语境相关翻译错误 (如语言名称翻译错误)
  ✅ 技术术语翻译一致性
  ✅ UI文本翻译准确性
`);
  process.exit(0);
}

// 运行主函数
if (require.main === module) {
  main().catch(error => {
    console.error('💥 检查执行失败:', error);
    process.exit(1);
  });
}

module.exports = {
  checkLanguageFile,
  isPlaceholderText,
  checkContextualErrors,
  PLACEHOLDER_PATTERNS,
  CONTEXT_CORRECTIONS
};
