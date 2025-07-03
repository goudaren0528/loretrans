#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 新创建的UX优化组件文件
const UX_COMPONENTS = [
  'components/translation/unified-translator.tsx',
  'components/translation/smart-time-estimate.tsx', 
  'components/translation/error-recovery.tsx',
  'components/translation/friendly-progress.tsx',
  'components/translation/task-dashboard.tsx',
  'components/mobile/mobile-translator.tsx',
  'app/[locale]/dashboard/tasks/page.tsx'
];

// 关键的中文文本模式
const KEY_PATTERNS = [
  // 简单的字符串字面量
  /'([^']*[\u4e00-\u9fff][^']*)'/g,
  /"([^"]*[\u4e00-\u9fff][^"]*)"/g,
];

// 过滤函数 - 只保留重要的文本
function isImportantText(text) {
  // 过滤掉不重要的文本
  const skipPatterns = [
    /className/,
    /console\./,
    /TODO/,
    /http/,
    /px|rem|em/,
    /^\s*$/,
    /^[\d\s\-\+\*\/\(\)]+$/,
    /^[a-zA-Z\s]+$/
  ];
  
  return !skipPatterns.some(pattern => pattern.test(text)) && 
         text.length > 1 && 
         /[\u4e00-\u9fff]/.test(text);
}

// 生成翻译键
function generateKey(text) {
  // 根据内容生成分类键
  if (text.includes('翻译')) return `translation.${text.replace(/[^\u4e00-\u9fff]/g, '').slice(0, 10)}`;
  if (text.includes('任务')) return `task.${text.replace(/[^\u4e00-\u9fff]/g, '').slice(0, 10)}`;
  if (text.includes('错误') || text.includes('失败')) return `error.${text.replace(/[^\u4e00-\u9fff]/g, '').slice(0, 10)}`;
  if (text.includes('成功') || text.includes('完成')) return `success.${text.replace(/[^\u4e00-\u9fff]/g, '').slice(0, 10)}`;
  if (text.includes('进度') || text.includes('处理')) return `progress.${text.replace(/[^\u4e00-\u9fff]/g, '').slice(0, 10)}`;
  if (text.includes('时间')) return `time.${text.replace(/[^\u4e00-\u9fff]/g, '').slice(0, 10)}`;
  if (text.includes('积分')) return `credits.${text.replace(/[^\u4e00-\u9fff]/g, '').slice(0, 10)}`;
  if (text.includes('语言')) return `language.${text.replace(/[^\u4e00-\u9fff]/g, '').slice(0, 10)}`;
  return `ui.${text.replace(/[^\u4e00-\u9fff]/g, '').slice(0, 10)}`;
}

function main() {
  console.log('🔍 提取UX组件中的关键中文文本...\n');
  
  const keyTexts = new Set();
  
  UX_COMPONENTS.forEach(filePath => {
    const fullPath = path.join(__dirname, '..', filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  文件不存在: ${filePath}`);
      return;
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    
    KEY_PATTERNS.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const text = match[1].trim();
        if (isImportantText(text)) {
          keyTexts.add(text);
        }
      }
    });
  });
  
  if (keyTexts.size === 0) {
    console.log('✅ 未发现需要多语言支持的文本');
    return;
  }
  
  console.log(`📋 发现 ${keyTexts.size} 个需要多语言支持的关键文本:\n`);
  
  // 按分类整理
  const categories = {
    translation: [],
    task: [],
    error: [],
    success: [],
    progress: [],
    time: [],
    credits: [],
    language: [],
    ui: []
  };
  
  Array.from(keyTexts).sort().forEach(text => {
    const key = generateKey(text);
    const category = key.split('.')[0];
    if (categories[category]) {
      categories[category].push({ key, text });
    }
  });
  
  // 输出分类结果
  Object.keys(categories).forEach(category => {
    if (categories[category].length > 0) {
      console.log(`📂 ${category.toUpperCase()}:`);
      categories[category].forEach(({ key, text }) => {
        console.log(`   "${key}": "${text}"`);
      });
      console.log('');
    }
  });
  
  // 生成建议的翻译文件内容
  console.log('📝 建议添加到 messages/en.json 的内容:\n');
  console.log('{');
  Object.keys(categories).forEach(category => {
    if (categories[category].length > 0) {
      console.log(`  "${category}": {`);
      categories[category].forEach(({ key, text }) => {
        const simpleKey = key.split('.')[1];
        console.log(`    "${simpleKey}": "${text}",`);
      });
      console.log('  },');
    }
  });
  console.log('}');
  
  console.log('\n🔧 下一步操作:');
  console.log('1. 将上述内容添加到 messages/en.json');
  console.log('2. 运行翻译脚本生成其他语言版本');
  console.log('3. 在组件中使用 useTranslations() 替换硬编码文本');
  console.log('4. 示例: "翻译完成" → t("success.翻译完成")');
}

main();
