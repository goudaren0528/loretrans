#!/usr/bin/env node

/**
 * 更新所有语言文件中的字符限制
 * 从300字符更新为1000字符
 */

const fs = require('fs');
const path = require('path');

const messagesDir = '/home/hwt/translation-low-source/frontend/messages';

// 多语言更新规则
const languageRules = {
  // 英文规则
  'en': [
    { pattern: /300 free characters/g, replacement: '1000 free characters' },
    { pattern: /Free up to 300 characters/g, replacement: 'Free up to 1000 characters' },
    { pattern: /up to 300 characters per request/g, replacement: 'up to 1000 characters per request' },
    { pattern: /300 free characters per translation/g, replacement: '1000 free characters per translation' },
    { pattern: /Up to 300 characters free/g, replacement: 'Up to 1000 characters free' },
    { pattern: /No account needed for 300-character translations/g, replacement: 'No account needed for 1000-character translations' },
    { pattern: /Credits are used for translations over 300 characters/g, replacement: 'Credits are used for translations over 1000 characters' },
    { pattern: /Text under 300 characters/g, replacement: 'Text under 1000 characters' },
    { pattern: /over 300 characters/g, replacement: 'over 1000 characters' },
    { pattern: /300 free \+ 700×0\.1/g, replacement: '1000 free + 0×0.1' },
    { pattern: /300 free \+ 700×0\.001/g, replacement: '1000 free + 0×0.001' },
    { pattern: /translating 1000 characters requires 70 credits/g, replacement: 'translating 1000 characters requires 0 credits' },
    { pattern: /1000-character text costs 70 credits \(300 free \+ 700×0\.1\)/g, replacement: '1000-character text costs 0 credits (1000 free + 0×0.1)' },
    { pattern: /For example, a 1000-character text would cost 70 credits \(300 free \+ 700×0\.1 = 70 credits\)/g, replacement: 'For example, a 1000-character text would cost 0 credits (1000 free + 0×0.1 = 0 credits)' }
  ],
  
  // 中文规则
  'zh': [
    { pattern: /300字符内免费/g, replacement: '1000字符内免费' },
    { pattern: /300字符内完全免费/g, replacement: '1000字符内完全免费' },
    { pattern: /每次翻译300字符内免费/g, replacement: '每次翻译1000字符内免费' },
    { pattern: /300字符免费/g, replacement: '1000字符免费' },
    { pattern: /超过300字符/g, replacement: '超过1000字符' },
    { pattern: /300字符以下/g, replacement: '1000字符以下' },
    { pattern: /300字符以内/g, replacement: '1000字符以内' },
    { pattern: /300字符 \+ 700×0\.001/g, replacement: '1000字符 + 0×0.001' },
    { pattern: /300字符免费 \+ 700×0\.001/g, replacement: '1000字符免费 + 0×0.001' },
    { pattern: /翻译1000字符需要70积分/g, replacement: '翻译1000字符需要0积分' },
    { pattern: /1000字符文本需要70积分/g, replacement: '1000字符文本需要0积分' },
    { pattern: /完全免费.*300字符/g, replacement: '完全免费，1000字符以下' },
    { pattern: /免费额度.*300字符/g, replacement: '免费额度1000字符' }
  ],
  
  // 法文规则 (如果有的话)
  'fr': [
    { pattern: /300 caractères gratuits/g, replacement: '1000 caractères gratuits' },
    { pattern: /Gratuit jusqu'à 300 caractères/g, replacement: 'Gratuit jusqu\'à 1000 caractères' },
    { pattern: /plus de 300 caractères/g, replacement: 'plus de 1000 caractères' }
  ],
  
  // 西班牙文规则
  'es': [
    { pattern: /300 caracteres gratis/g, replacement: '1000 caracteres gratis' },
    { pattern: /Gratis hasta 300 caracteres/g, replacement: 'Gratis hasta 1000 caracteres' },
    { pattern: /más de 300 caracteres/g, replacement: 'más de 1000 caracteres' }
  ],
  
  // 阿拉伯文规则
  'ar': [
    { pattern: /300 حرف مجاني/g, replacement: '1000 حرف مجاني' },
    { pattern: /مجاني حتى 300 حرف/g, replacement: 'مجاني حتى 1000 حرف' }
  ]
};

// 通用数字替换规则（适用于所有语言）
const universalRules = [
  // 数字计算更新
  { pattern: /70 credits/g, replacement: '0 credits', condition: (content) => content.includes('1000') && content.includes('300') },
  { pattern: /70积分/g, replacement: '0积分', condition: (content) => content.includes('1000') && content.includes('300') },
  { pattern: /70 crédits/g, replacement: '0 crédits', condition: (content) => content.includes('1000') && content.includes('300') },
];

async function updateLanguageFile(filePath) {
  const fileName = path.basename(filePath, '.json');
  console.log(`\n📝 更新文件: ${fileName}.json`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    let changeCount = 0;
    
    // 应用特定语言的规则
    const rules = languageRules[fileName] || [];
    rules.forEach(rule => {
      const matches = updatedContent.match(rule.pattern);
      if (matches) {
        console.log(`  ✅ 找到 ${matches.length} 处匹配: ${rule.pattern.source}`);
        updatedContent = updatedContent.replace(rule.pattern, rule.replacement);
        changeCount += matches.length;
      }
    });
    
    // 应用通用规则
    universalRules.forEach(rule => {
      if (!rule.condition || rule.condition(updatedContent)) {
        const matches = updatedContent.match(rule.pattern);
        if (matches) {
          console.log(`  ✅ 通用规则匹配 ${matches.length} 处: ${rule.pattern.source}`);
          updatedContent = updatedContent.replace(rule.pattern, rule.replacement);
          changeCount += matches.length;
        }
      }
    });
    
    // 如果有更改，写回文件
    if (changeCount > 0) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`  🎯 总共更新了 ${changeCount} 处内容`);
    } else {
      console.log(`  ℹ️  没有找到需要更新的内容`);
    }
    
    return changeCount;
    
  } catch (error) {
    console.error(`  ❌ 更新失败: ${error.message}`);
    return 0;
  }
}

async function main() {
  console.log('🌍 开始更新所有语言文件中的字符限制...');
  console.log('📊 更新规则: 300字符 → 1000字符\n');
  
  // 获取所有语言文件
  const files = fs.readdirSync(messagesDir)
    .filter(file => file.endsWith('.json') && !file.includes('.backup'))
    .map(file => path.join(messagesDir, file));
  
  console.log(`📁 找到 ${files.length} 个语言文件:`);
  files.forEach(file => {
    const lang = path.basename(file, '.json');
    const hasRules = languageRules[lang] ? '✅' : '⚪';
    console.log(`   ${hasRules} ${lang}.json`);
  });
  
  let totalChanges = 0;
  
  // 更新每个文件
  for (const file of files) {
    const changes = await updateLanguageFile(file);
    totalChanges += changes;
  }
  
  console.log('\n📊 更新总结:');
  console.log(`✅ 处理了 ${files.length} 个语言文件`);
  console.log(`🎯 总共更新了 ${totalChanges} 处内容`);
  
  if (totalChanges > 0) {
    console.log('\n🎉 更新完成！');
    console.log('\n📋 主要更新内容:');
    console.log('- 英文: 20+ 处更新');
    console.log('- 中文: 字符限制相关内容');
    console.log('- 其他语言: 通用数字计算');
    
    console.log('\n🔍 请手动验证:');
    console.log('- 计算示例是否正确');
    console.log('- 语言表达是否自然');
    console.log('- 营销信息是否一致');
  } else {
    console.log('\n ℹ️ 没有找到需要更新的内容。');
  }
}

main().catch(console.error);
