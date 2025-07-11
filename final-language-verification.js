#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 最终验证所有语言页面配置...\n');

// 从配置文件读取所有可用语言
function getAvailableLanguages() {
  const configPath = '/home/hwt/translation-low-source/config/app.config.ts';
  const content = fs.readFileSync(configPath, 'utf8');
  
  const languages = [];
  const regex = /{\s*code:\s*'([^']+)'[^}]+name:\s*'([^']+)'[^}]+slug:\s*'([^']+)'[^}]+available:\s*true[^}]*}/g;
  
  let match;
  while ((match = regex.exec(content)) !== null) {
    if (match[1] !== 'en') {
      languages.push({
        code: match[1],
        name: match[2],
        slug: match[3]
      });
    }
  }
  
  return languages;
}

// 检查实际页面文件
function getActualPageFiles() {
  const localeDir = '/home/hwt/translation-low-source/frontend/app/[locale]';
  return fs.readdirSync(localeDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .filter(name => name.includes('-to-'));
}

// 从page-utils.ts读取配置的页面
function getConfiguredPages() {
  const pageUtilsPath = '/home/hwt/translation-low-source/frontend/lib/utils/page-utils.ts';
  const content = fs.readFileSync(pageUtilsPath, 'utf8');
  
  const match = content.match(/const EXISTING_TRANSLATION_PAGES = \[([\s\S]*?)\]/);
  if (!match) return [];
  
  return match[1]
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith("'") || line.startsWith('"'))
    .map(line => line.replace(/['"',]/g, ''));
}

const availableLanguages = getAvailableLanguages();
const actualFiles = getActualPageFiles();
const configuredPages = getConfiguredPages();

console.log('📋 可用语言列表:');
availableLanguages.forEach((lang, index) => {
  console.log(`   ${index + 1}. ${lang.name} (${lang.code}/${lang.slug})`);
});

console.log(`\n📊 统计:`);
console.log(`   可用语言数: ${availableLanguages.length}`);
console.log(`   实际页面文件数: ${actualFiles.length}`);
console.log(`   配置页面数: ${configuredPages.length}`);

// 验证每种语言的页面
console.log('\n🔍 验证每种语言的页面存在性:');
let allPagesExist = true;

availableLanguages.forEach(lang => {
  const toEnglishPage = `${lang.slug}-to-english`;
  const fromEnglishPage = `english-to-${lang.slug}`;
  
  const toEnglishExists = actualFiles.includes(toEnglishPage);
  const fromEnglishExists = actualFiles.includes(fromEnglishPage);
  
  const toEnglishConfigured = configuredPages.includes(toEnglishPage);
  const fromEnglishConfigured = configuredPages.includes(fromEnglishPage);
  
  console.log(`   ${lang.name}:`);
  console.log(`     ${toEnglishPage}: 文件${toEnglishExists ? '✅' : '❌'} 配置${toEnglishConfigured ? '✅' : '❌'}`);
  console.log(`     ${fromEnglishPage}: 文件${fromEnglishExists ? '✅' : '❌'} 配置${fromEnglishConfigured ? '✅' : '❌'}`);
  
  if (!toEnglishExists || !fromEnglishExists || !toEnglishConfigured || !fromEnglishConfigured) {
    allPagesExist = false;
  }
});

// 检查是否有多余的文件
console.log('\n🔍 检查多余或缺失的配置:');
const expectedPages = [];
availableLanguages.forEach(lang => {
  expectedPages.push(`${lang.slug}-to-english`);
  expectedPages.push(`english-to-${lang.slug}`);
});

const missingInConfig = actualFiles.filter(file => !configuredPages.includes(file));
const missingFiles = configuredPages.filter(page => !actualFiles.includes(page));

if (missingInConfig.length > 0) {
  console.log('⚠️  文件存在但配置中缺失:');
  missingInConfig.forEach(file => console.log(`     ${file}`));
}

if (missingFiles.length > 0) {
  console.log('❌ 配置中存在但文件缺失:');
  missingFiles.forEach(file => console.log(`     ${file}`));
}

if (missingInConfig.length === 0 && missingFiles.length === 0) {
  console.log('✅ 文件和配置完全匹配！');
}

console.log('\n🎯 最终结果:');
if (allPagesExist && missingInConfig.length === 0 && missingFiles.length === 0) {
  console.log('🎉 所有语言页面配置完美！');
  console.log('✅ 所有可用语言都有对应的翻译页面');
  console.log('✅ 所有页面文件都在配置中正确注册');
  console.log('✅ 首页语言网格的跳转应该完全正常工作');
} else {
  console.log('⚠️  还有一些问题需要解决');
}

console.log('\n📝 支持的语言总览:');
console.log('🌍 主要语言: Chinese, Arabic, Hindi, French, Spanish, Portuguese');
console.log('🏝️  小语种: Creole, Lao, Swahili, Burmese, Telugu');
console.log('🌏 南亚语言: Sinhala, Nepali, Hindi');
console.log('🌍 非洲语言: Amharic, Yoruba, Igbo, Hausa, Zulu, Xhosa, Malagasy');
console.log('🏔️  中亚语言: Mongolian, Kyrgyz, Tajik');
console.log('🕌 中东语言: Arabic, Pashto, Sindhi');
console.log('🇰🇭 东南亚语言: Khmer, Burmese, Lao');

console.log('\n✨ 验证完成!');
