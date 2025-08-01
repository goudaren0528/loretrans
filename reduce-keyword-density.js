#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 优化关键词密度 - 减少过高频率的关键词...\n');

// 读取当前的 English to Khmer 页面内容
const englishToKhmerPagePath = path.join(__dirname, 'frontend/app/[locale]/english-to-khmer/page.tsx');
let content = fs.readFileSync(englishToKhmerPagePath, 'utf8');

console.log('📊 当前关键词统计:');
const originalEnglishToKhmer = (content.match(/English to Khmer/g) || []).length;
const originalEnglishToKhmerTranslation = (content.match(/English to Khmer translation/g) || []).length;
console.log(`• "English to Khmer": ${originalEnglishToKhmer}次`);
console.log(`• "English to Khmer translation": ${originalEnglishToKhmerTranslation}次`);

// 策略：将一些 "English to Khmer" 替换为同义词或变体
const replacements = [
  // 将部分 "English to Khmer translation" 替换为变体
  {
    from: /English to Khmer translation service/g,
    to: 'English-Khmer translation service'
  },
  {
    from: /English to Khmer translation tool/g,
    to: 'English-Khmer translator'
  },
  {
    from: /English to Khmer translation process/g,
    to: 'English-Khmer conversion process'
  },
  {
    from: /English to Khmer translation quality/g,
    to: 'translation quality from English to ខ្មែរ'
  },
  {
    from: /English to Khmer translation history/g,
    to: 'English-Khmer translation records'
  },
  {
    from: /English to Khmer translation requirements/g,
    to: 'English-Khmer conversion needs'
  },
  {
    from: /English to Khmer translation work/g,
    to: 'English-Khmer translation projects'
  },
  
  // 将部分 "English to Khmer" 替换为变体
  {
    from: /our English to Khmer translator/g,
    to: 'our English-Khmer translator'
  },
  {
    from: /the English to Khmer translator/g,
    to: 'the English-Khmer conversion tool'
  },
  {
    from: /English to Khmer translator supports/g,
    to: 'English-Khmer translator supports'
  },
  {
    from: /English to Khmer translator understands/g,
    to: 'English-Khmer conversion system understands'
  },
  {
    from: /for English to Khmer translations/g,
    to: 'for English-Khmer conversions'
  },
  {
    from: /longer English to Khmer translations/g,
    to: 'longer English-Khmer conversions'
  },
  {
    from: /English to Khmer translations and/g,
    to: 'English-Khmer translations and'
  },
  {
    from: /your English to Khmer translation/g,
    to: 'your English-Khmer conversion'
  },
  {
    from: /English to Khmer translation with/g,
    to: 'English-Khmer translation with'
  },
  {
    from: /English to Khmer translation capabilities/g,
    to: 'English-Khmer conversion capabilities'
  },
  {
    from: /Advanced English to Khmer Translation Features/g,
    to: 'Advanced English-Khmer Translation Features'
  },
  {
    from: /Professional English to Khmer translation/g,
    to: 'Professional English-Khmer translation'
  },
  {
    from: /Free English to Khmer/g,
    to: 'Free English-Khmer'
  },
  {
    from: /English to Khmer queue processing/g,
    to: 'English-Khmer queue processing'
  },
  {
    from: /English to Khmer history/g,
    to: 'English-Khmer history'
  }
];

// 应用替换
replacements.forEach(replacement => {
  content = content.replace(replacement.from, replacement.to);
});

// 额外的语义变体替换
const semanticReplacements = [
  {
    from: /translate English to Khmer/g,
    to: 'convert English to ខ្មែរ'
  },
  {
    from: /translating English to Khmer/g,
    to: 'converting English to ខ្មែរ'
  },
  {
    from: /English to Khmer conversion tool/g,
    to: 'English-ខ្មែរ translator'
  }
];

semanticReplacements.forEach(replacement => {
  content = content.replace(replacement.from, replacement.to);
});

// 写入优化后的内容
fs.writeFileSync(englishToKhmerPagePath, content);

// 统计优化后的关键词频率
const newEnglishToKhmer = (content.match(/English to Khmer/g) || []).length;
const newEnglishToKhmerTranslation = (content.match(/English to Khmer translation/g) || []).length;

console.log('');
console.log('✅ 关键词密度优化完成!');
console.log('');
console.log('📊 优化后关键词统计:');
console.log(`• "English to Khmer": ${originalEnglishToKhmer} → ${newEnglishToKhmer}次 (减少${originalEnglishToKhmer - newEnglishToKhmer}次)`);
console.log(`• "English to Khmer translation": ${originalEnglishToKhmerTranslation} → ${newEnglishToKhmerTranslation}次 (减少${originalEnglishToKhmerTranslation - newEnglishToKhmerTranslation}次)`);

console.log('');
console.log('🔄 使用的替换策略:');
console.log('• "English to Khmer" → "English-Khmer" (连字符形式)');
console.log('• "English to Khmer translation" → "English-Khmer translation"');
console.log('• "translate English to Khmer" → "convert English to ខ្មែរ"');
console.log('• 部分替换为 "English-ខ្មែរ translator"');
console.log('• 使用 "conversion" 替代部分 "translation"');

console.log('');
console.log('📈 优化效果:');
console.log('• 保持语义自然性');
console.log('• 降低关键词密度到合理范围');
console.log('• 增加关键词变体多样性');
console.log('• 避免关键词堆砌风险');
console.log('• 提升用户阅读体验');

// 同样优化 Khmer to English 页面
console.log('');
console.log('🔧 同时优化 Khmer to English 页面...');

const khmerToEnglishPagePath = path.join(__dirname, 'frontend/app/[locale]/khmer-to-english/page.tsx');
let khmerContent = fs.readFileSync(khmerToEnglishPagePath, 'utf8');

const originalKhmerToEnglish = (khmerContent.match(/Khmer to English/g) || []).length;
console.log(`• "Khmer to English": ${originalKhmerToEnglish}次`);

// Khmer to English 的替换策略
const khmerReplacements = [
  {
    from: /Khmer to English translator/g,
    to: 'Khmer-English translator'
  },
  {
    from: /Khmer to English translation service/g,
    to: 'Khmer-English translation service'
  },
  {
    from: /Khmer to English translation with/g,
    to: 'Khmer-English translation with'
  },
  {
    from: /for Khmer to English translations/g,
    to: 'for Khmer-English conversions'
  },
  {
    from: /longer Khmer to English translations/g,
    to: 'longer Khmer-English conversions'
  },
  {
    from: /your Khmer to English translation/g,
    to: 'your Khmer-English conversion'
  },
  {
    from: /Advanced Khmer to English Translation Features/g,
    to: 'Advanced Khmer-English Translation Features'
  },
  {
    from: /Professional-grade Khmer to English translation/g,
    to: 'Professional-grade Khmer-English translation'
  },
  {
    from: /Free Khmer translation/g,
    to: 'Free ខ្មែរ translation'
  },
  {
    from: /Khmer queue processing/g,
    to: 'ខ្មែរ queue processing'
  },
  {
    from: /Khmer translation history/g,
    to: 'ខ្មែរ translation history'
  }
];

// 应用 Khmer 页面替换
khmerReplacements.forEach(replacement => {
  khmerContent = khmerContent.replace(replacement.from, replacement.to);
});

// 写入优化后的 Khmer 页面内容
fs.writeFileSync(khmerToEnglishPagePath, khmerContent);

const newKhmerToEnglish = (khmerContent.match(/Khmer to English/g) || []).length;
console.log(`• "Khmer to English": ${originalKhmerToEnglish} → ${newKhmerToEnglish}次 (减少${originalKhmerToEnglish - newKhmerToEnglish}次)`);

console.log('');
console.log('🎯 两个页面关键词密度优化完成!');
console.log('预期密度范围: 1.5-2.5% (更自然的SEO密度)');
