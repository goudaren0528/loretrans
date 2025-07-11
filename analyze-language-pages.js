#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 从配置文件中读取支持的语言
const configPath = '/home/hwt/translation-low-source/config/app.config.ts';
const pageUtilsPath = '/home/hwt/translation-low-source/frontend/lib/utils/page-utils.ts';

console.log('🔍 分析语言页面配置问题...\n');

// 读取实际存在的页面目录
const localeDir = '/home/hwt/translation-low-source/frontend/app/[locale]';
const existingDirs = fs.readdirSync(localeDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name)
  .filter(name => name.includes('-to-'));

console.log('📁 实际存在的翻译页面目录:');
existingDirs.sort().forEach(dir => {
  console.log(`   ✅ ${dir}`);
});

// 从配置文件中提取语言信息
const configContent = fs.readFileSync(configPath, 'utf8');

// 提取所有标记为 available: true 的语言
const availableLanguages = [];
const languageMatches = configContent.match(/{\s*code:\s*'([^']+)'[^}]+available:\s*true[^}]*}/g);

if (languageMatches) {
  languageMatches.forEach(match => {
    const codeMatch = match.match(/code:\s*'([^']+)'/);
    const nameMatch = match.match(/name:\s*'([^']+)'/);
    const slugMatch = match.match(/slug:\s*'([^']+)'/);
    
    if (codeMatch && nameMatch && slugMatch) {
      availableLanguages.push({
        code: codeMatch[1],
        name: nameMatch[1],
        slug: slugMatch[1]
      });
    }
  });
}

console.log('\n📋 配置中标记为可用的语言:');
availableLanguages.forEach(lang => {
  console.log(`   ${lang.code} (${lang.slug}) - ${lang.name}`);
});

// 检查缺失的页面
console.log('\n❌ 缺失的翻译页面:');
const missingPages = [];

availableLanguages.forEach(lang => {
  if (lang.code !== 'en') { // 跳过英语
    const toEnglishPage = `${lang.slug}-to-english`;
    const fromEnglishPage = `english-to-${lang.slug}`;
    
    if (!existingDirs.includes(toEnglishPage)) {
      missingPages.push(toEnglishPage);
      console.log(`   ❌ ${toEnglishPage} (${lang.name} → English)`);
    }
    
    if (!existingDirs.includes(fromEnglishPage)) {
      missingPages.push(fromEnglishPage);
      console.log(`   ❌ ${fromEnglishPage} (English → ${lang.name})`);
    }
  }
});

// 检查page-utils.ts中的配置
const pageUtilsContent = fs.readFileSync(pageUtilsPath, 'utf8');
const existingPagesMatch = pageUtilsContent.match(/const EXISTING_TRANSLATION_PAGES = \[([\s\S]*?)\]/);

if (existingPagesMatch) {
  const existingPagesInConfig = existingPagesMatch[1]
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith("'") || line.startsWith('"'))
    .map(line => line.replace(/['"',]/g, ''));
  
  console.log('\n📝 page-utils.ts 中配置的页面:');
  existingPagesInConfig.forEach(page => {
    const exists = existingDirs.includes(page);
    console.log(`   ${exists ? '✅' : '❌'} ${page}`);
  });
}

console.log('\n📊 统计:');
console.log(`   可用语言数: ${availableLanguages.length}`);
console.log(`   实际页面数: ${existingDirs.length}`);
console.log(`   缺失页面数: ${missingPages.length}`);

console.log('\n🔧 建议的解决方案:');
console.log('1. 将缺失页面的语言在配置中标记为 available: false');
console.log('2. 或者创建缺失的翻译页面');
console.log('3. 更新 page-utils.ts 中的 EXISTING_TRANSLATION_PAGES 数组');

// 生成修复建议
if (missingPages.length > 0) {
  console.log('\n📝 需要在 app.config.ts 中修改的语言:');
  const languagesToDisable = [];
  
  missingPages.forEach(page => {
    const parts = page.split('-to-');
    const sourceLang = parts[0] === 'english' ? parts[1] : parts[0];
    
    const lang = availableLanguages.find(l => l.slug === sourceLang);
    if (lang && !languagesToDisable.includes(lang.slug)) {
      languagesToDisable.push(lang.slug);
      console.log(`   ${lang.name} (${lang.slug}): available: true → available: false`);
    }
  });
}

console.log('\n✨ 分析完成!');
