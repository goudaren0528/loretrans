#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 更新翻译组件中的语言列表...\n');

// 从配置文件读取所有可用语言
function getAvailableLanguagesFromConfig() {
  const configPath = '/home/hwt/translation-low-source/config/app.config.ts';
  const content = fs.readFileSync(configPath, 'utf8');
  
  const languages = [];
  const regex = /{\s*code:\s*'([^']+)'[^}]+name:\s*'([^']+)'[^}]+nativeName:\s*'([^']+)'[^}]+slug:\s*'([^']+)'[^}]+available:\s*true[^}]*}/g;
  
  let match;
  while ((match = regex.exec(content)) !== null) {
    languages.push({
      code: match[1],
      name: match[2],
      nativeName: match[3],
      slug: match[4]
    });
  }
  
  return languages.sort((a, b) => a.name.localeCompare(b.name));
}

// 生成语言到国旗的映射
function getLanguageFlags() {
  return {
    'en': '🇺🇸',
    'ht': '🇭🇹',
    'lo': '🇱🇦', 
    'sw': '🇰🇪',
    'my': '🇲🇲',
    'te': '🇮🇳',
    'zh': '🇨🇳',
    'fr': '🇫🇷',
    'es': '🇪🇸',
    'pt': '🇵🇹',
    'ar': '🇸🇦',
    'hi': '🇮🇳',
    'si': '🇱🇰',
    'am': '🇪🇹',
    'km': '🇰🇭',
    'ne': '🇳🇵',
    'mg': '🇲🇬',
    'yo': '🇳🇬',
    'ig': '🇳🇬',
    'ha': '🇳🇬',
    'zu': '🇿🇦',
    'xh': '🇿🇦',
    'mn': '🇲🇳',
    'ky': '🇰🇬',
    'tg': '🇹🇯',
    'ps': '🇦🇫',
    'sd': '🇵🇰'
  };
}

// 更新EnhancedTextTranslator组件
function updateEnhancedTextTranslator() {
  const filePath = '/home/hwt/translation-low-source/frontend/components/translation/enhanced-text-translator.tsx';
  let content = fs.readFileSync(filePath, 'utf8');
  
  const availableLanguages = getAvailableLanguagesFromConfig();
  const languageFlags = getLanguageFlags();
  
  console.log('📋 从配置文件读取的可用语言:');
  availableLanguages.forEach(lang => {
    console.log(`   ${lang.code} - ${lang.name} (${lang.nativeName})`);
  });
  
  // 生成新的SUPPORTED_LANGUAGES数组
  const newLanguagesArray = availableLanguages.map(lang => {
    const flag = languageFlags[lang.code] || '🌐';
    return `  { code: '${lang.code}', name: '${lang.name}', flag: '${flag}' }`;
  }).join(',\n');
  
  const newSupportedLanguages = `// 支持的语言列表
const SUPPORTED_LANGUAGES = [
${newLanguagesArray}
]`;
  
  // 替换现有的SUPPORTED_LANGUAGES数组
  content = content.replace(
    /\/\/ 支持的语言列表[\s\S]*?const SUPPORTED_LANGUAGES = \[[\s\S]*?\]/,
    newSupportedLanguages
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('\n✅ 已更新EnhancedTextTranslator组件的语言列表');
  
  return availableLanguages.length;
}

// 检查其他可能需要更新的翻译组件
function checkOtherTranslationComponents() {
  const componentsDir = '/home/hwt/translation-low-source/frontend/components';
  const translationFiles = [];
  
  // 递归搜索翻译相关的组件文件
  function searchFiles(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        searchFiles(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('code:') && content.includes('name:') && 
            (content.includes('language') || content.includes('translate'))) {
          translationFiles.push(filePath);
        }
      }
    });
  }
  
  searchFiles(componentsDir);
  
  console.log('\n🔍 检查其他可能需要更新的翻译组件:');
  translationFiles.forEach(file => {
    const relativePath = file.replace('/home/hwt/translation-low-source/frontend/', '');
    console.log(`   ${relativePath}`);
  });
  
  return translationFiles;
}

// 验证更新结果
function verifyUpdate() {
  const filePath = '/home/hwt/translation-low-source/frontend/components/translation/enhanced-text-translator.tsx';
  const content = fs.readFileSync(filePath, 'utf8');
  
  // 检查是否包含新增的语言
  const newLanguages = ['sindhi', 'pashto', 'sinhala', 'amharic', 'yoruba'];
  const missingLanguages = [];
  
  newLanguages.forEach(lang => {
    // 查找语言代码映射
    const langCodeMap = {
      'sindhi': 'sd',
      'pashto': 'ps', 
      'sinhala': 'si',
      'amharic': 'am',
      'yoruba': 'yo'
    };
    
    const code = langCodeMap[lang];
    if (!content.includes(`code: '${code}'`)) {
      missingLanguages.push(lang);
    }
  });
  
  console.log('\n🔍 验证更新结果:');
  if (missingLanguages.length === 0) {
    console.log('✅ 所有新增语言都已包含在翻译组件中');
  } else {
    console.log('❌ 以下语言仍然缺失:');
    missingLanguages.forEach(lang => console.log(`   - ${lang}`));
  }
  
  return missingLanguages.length === 0;
}

// 主函数
function main() {
  console.log('🎯 目标: 更新翻译组件中的语言列表，包含所有新增语言\n');
  
  try {
    // 1. 更新EnhancedTextTranslator组件
    const languageCount = updateEnhancedTextTranslator();
    
    // 2. 检查其他组件
    const otherComponents = checkOtherTranslationComponents();
    
    // 3. 验证更新结果
    const isValid = verifyUpdate();
    
    console.log('\n📊 更新结果:');
    console.log(`   更新的语言数量: ${languageCount}`);
    console.log(`   检查的组件文件: ${otherComponents.length}`);
    console.log(`   验证结果: ${isValid ? '✅ 成功' : '❌ 失败'}`);
    
    if (isValid) {
      console.log('\n🎉 语言列表更新完成！');
      console.log('\n📝 更新内容:');
      console.log('✅ EnhancedTextTranslator组件包含所有可用语言');
      console.log('✅ 新增语言: Sindhi, Pashto, Sinhala, Amharic, Yoruba等');
      console.log('✅ 语言按字母顺序排序');
      console.log('✅ 包含适当的国旗emoji');
      
      console.log('\n🚀 现在用户可以在翻译组件中选择所有新增的语言！');
    } else {
      console.log('\n⚠️  更新可能不完整，请检查日志');
    }
    
  } catch (error) {
    console.error('❌ 更新过程中出现错误:', error.message);
  }
  
  console.log('\n✨ 更新完成!');
}

if (require.main === module) {
  main();
}
