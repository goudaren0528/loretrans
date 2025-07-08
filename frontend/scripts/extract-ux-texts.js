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

// 提取中文文本的正则表达式
const CHINESE_TEXT_PATTERNS = [
  // 字符串字面量中的中文
  /'([^']*[\u4e00-\u9fff][^']*)'/g,
  /"([^"]*[\u4e00-\u9fff][^"]*)"/g,
  // JSX文本节点中的中文
  />([^<]*[\u4e00-\u9fff][^<]*)</g,
  // 模板字符串中的中文
  /`([^`]*[\u4e00-\u9fff][^`]*)`/g
];

// 生成翻译键的函数
function generateTranslationKey(text, context = '') {
  // 清理文本
  const cleanText = text.trim()
    .replace(/\s+/g, '_')
    .replace(/[^\u4e00-\u9fff\w]/g, '')
    .toLowerCase();
  
  // 根据内容生成合适的键名
  if (text.includes('翻译')) return `translation.${cleanText}`;
  if (text.includes('任务') || text.includes('管理')) return `task.${cleanText}`;
  if (text.includes('错误') || text.includes('失败')) return `error.${cleanText}`;
  if (text.includes('成功') || text.includes('完成')) return `success.${cleanText}`;
  if (text.includes('进度') || text.includes('处理')) return `progress.${cleanText}`;
  if (text.includes('时间') || text.includes('预估')) return `time.${cleanText}`;
  if (text.includes('积分') || text.includes('消耗')) return `credits.${cleanText}`;
  if (text.includes('按钮') || text.includes('操作')) return `actions.${cleanText}`;
  if (text.includes('状态')) return `status.${cleanText}`;
  if (text.includes('语言')) return `language.${cleanText}`;
  
  return `ui.${cleanText}`;
}

// 提取文件中的中文文本
function extractChineseTexts(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const texts = new Set();
  
  CHINESE_TEXT_PATTERNS.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const text = match[1].trim();
      if (text && text.length > 1 && /[\u4e00-\u9fff]/.test(text)) {
        // 过滤掉一些不需要翻译的内容
        if (!text.includes('className') && 
            !text.includes('console.log') &&
            !text.includes('TODO') &&
            !text.includes('http') &&
            !text.includes('px') &&
            !text.includes('rem')) {
          texts.add(text);
        }
      }
    }
  });
  
  return Array.from(texts);
}

// 主函数
function main() {
  console.log('🔍 提取UX优化组件中的硬编码中文文本...\n');
  
  const allTexts = new Map(); // text -> {key, files}
  
  // 遍历所有UX组件文件
  UX_COMPONENTS.forEach(filePath => {
    const fullPath = path.join(__dirname, '..', filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  文件不存在: ${filePath}`);
      return;
    }
    
    console.log(`📄 检查文件: ${filePath}`);
    
    try {
      const texts = extractChineseTexts(fullPath);
      
      if (texts.length > 0) {
        console.log(`   发现 ${texts.length} 个中文文本:`);
        
        texts.forEach(text => {
          console.log(`   - "${text}"`);
          
          if (!allTexts.has(text)) {
            allTexts.set(text, {
              key: generateTranslationKey(text),
              files: []
            });
          }
          allTexts.get(text).files.push(filePath);
        });
      } else {
        console.log(`   ✅ 未发现硬编码中文文本`);
      }
      
    } catch (error) {
      console.log(`   ❌ 处理文件时出错: ${error.message}`);
    }
    
    console.log('');
  });
  
  // 生成翻译键建议
  if (allTexts.size > 0) {
    console.log('📋 建议的翻译键映射:\n');
    
    const translationEntries = {};
    
    allTexts.forEach((info, text) => {
      console.log(`"${info.key}": "${text}"`);
      console.log(`   使用文件: ${info.files.join(', ')}`);
      console.log('');
      
      // 按分类组织翻译条目
      const [category, key] = info.key.split('.');
      if (!translationEntries[category]) {
        translationEntries[category] = {};
      }
      translationEntries[category][key] = text;
    });
    
    // 生成JSON格式的翻译文件内容
    console.log('📝 建议添加到翻译文件的内容:\n');
    console.log('```json');
    Object.keys(translationEntries).forEach(category => {
      console.log(`"${category}": {`);
      Object.keys(translationEntries[category]).forEach(key => {
        console.log(`  "${key}": "${translationEntries[category][key]}",`);
      });
      console.log('},');
    });
    console.log('```\n');
    
    // 生成修复脚本建议
    console.log('🔧 修复建议:');
    console.log('1. 将上述翻译键添加到 messages/en.json');
    console.log('2. 运行翻译脚本为其他语言生成翻译');
    console.log('3. 在组件中使用 useTranslations() 替换硬编码文本');
    console.log('4. 示例替换:');
    console.log('   - "翻译完成" → t("success.translation_complete")');
    console.log('   - "处理中" → t("status.processing")');
    console.log('   - "开始翻译" → t("actions.start_translation")');
    
  } else {
    console.log('✅ 所有UX组件都已正确使用多语言支持！');
  }
  
  console.log(`\n📊 总计发现 ${allTexts.size} 个需要多语言支持的文本`);
}

main();
