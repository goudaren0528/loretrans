#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 创建缺失的翻译页面（修复版）...\n');

// 语言代码映射
const LANGUAGE_CODE_MAP = {
  'creole': 'ht',
  'lao': 'lo',
  'swahili': 'sw',
  'burmese': 'my',
  'telugu': 'te',
  'arabic': 'ar',
  'chinese': 'zh',
  'french': 'fr',
  'hindi': 'hi',
  'portuguese': 'pt',
  'spanish': 'es',
  'sinhala': 'si',
  'amharic': 'am',
  'khmer': 'km',
  'nepali': 'ne',
  'malagasy': 'mg',
  'yoruba': 'yo',
  'igbo': 'ig',
  'hausa': 'ha',
  'zulu': 'zu',
  'xhosa': 'xh',
  'mongolian': 'mn',
  'kyrgyz': 'ky',
  'tajik': 'tg',
  'pashto': 'ps',
  'sindhi': 'sd',
  'english': 'en'
};

// 从配置文件读取所有语言
function getAllLanguagesFromConfig() {
  const configPath = '/home/hwt/translation-low-source/config/app.config.ts';
  const content = fs.readFileSync(configPath, 'utf8');
  
  const languages = [];
  const regex = /{\s*code:\s*'([^']+)'[^}]+name:\s*'([^']+)'[^}]+nativeName:\s*'([^']+)'[^}]+slug:\s*'([^']+)'[^}]+available:\s*(true|false)[^}]*}/g;
  
  let match;
  while ((match = regex.exec(content)) !== null) {
    if (match[1] !== 'en') {
      languages.push({
        code: match[1],
        name: match[2],
        nativeName: match[3],
        slug: match[4],
        available: match[5] === 'true'
      });
    }
  }
  
  return languages;
}

// 生成页面模板
function generatePageTemplate(sourceSlug, targetSlug, sourceName, targetName, sourceNative, targetNative) {
  const isToEnglish = targetSlug === 'english';
  const pageTitle = isToEnglish ? 
    `${sourceName} to English Translation` : 
    `English to ${sourceName} Translation`;
  
  const description = isToEnglish ?
    `Translate ${sourceName} (${sourceNative}) to English instantly with our AI-powered translator. Convert ${sourceNative} text to English with high accuracy.` :
    `Translate English to ${sourceName} (${sourceNative}) instantly with our AI-powered translator. Convert English text to ${sourceNative} with high accuracy.`;

  const sourceCode = LANGUAGE_CODE_MAP[sourceSlug] || sourceSlug;
  const targetCode = LANGUAGE_CODE_MAP[targetSlug] || targetSlug;

  return `import React from 'react'
import { Metadata } from 'next'
import { EnhancedTextTranslator } from '@/components/translation/enhanced-text-translator'
import { StructuredData } from '@/components/structured-data'

export const metadata: Metadata = {
  title: '${pageTitle} - Free AI Translator | Loretrans',
  description: '${description} Support for long texts up to 5,000 characters.',
  keywords: ['${sourceName} to ${targetName} translation', '${sourceName} to ${targetNative}', '${sourceName} to ${targetName} translator', 'free ${sourceName} to ${targetName} translation', '${sourceName} ${targetName} converter', 'queue translation'],
  openGraph: {
    title: '${pageTitle} - Free AI Translator',
    description: '${description} Support for long texts and queue processing.',
    url: 'https://loretrans.com/${sourceSlug}-to-${targetSlug}',
    siteName: 'Loretrans',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '${pageTitle} - Free AI Translator',
    description: '${description} Support for long texts and queue processing.',
  },
  alternates: {
    canonical: 'https://loretrans.com/${sourceSlug}-to-${targetSlug}',
  },
}

const ${sourceSlug.replace(/-/g, '')}to${targetSlug.replace(/-/g, '')}FAQs = [
  {
    question: "How accurate is the ${sourceName} to ${targetName} translation?",
    answer: "Our AI-powered translator provides high-accuracy ${sourceName} to ${targetName} translations using advanced NLLB (No Language Left Behind) technology. While very reliable for most content, we recommend human review for critical documents."
  },
  {
    question: "Can I translate ${targetName} text back to ${sourceName}?",
    answer: "Yes! Our translator supports bidirectional translation. You can easily switch between ${sourceName}-to-${targetName} and ${targetName}-to-${sourceName} translation using the swap button."
  },
  {
    question: "Is the ${sourceName} to ${targetName} translator free to use?",
    answer: "Yes, our ${sourceName} to ${targetName} translation service is completely free. Short texts translate instantly, while longer texts use our queue system for registered users."
  },
  {
    question: "How long can the text be for ${sourceName} to ${targetName} translation?",
    answer: "You can translate up to 5,000 characters at once. For texts over 1,000 characters, you'll need to sign in for queue processing. Shorter texts are translated instantly."
  },
  {
    question: "Do I need to create an account to translate long texts?",
    answer: "For texts over 1,000 characters, yes. Creating a free account allows you to use our queue system for longer translations and access your translation history."
  }
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "${pageTitle}",
  "url": "https://loretrans.com/${sourceSlug}-to-${targetSlug}",
  "description": "${description}",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "featureList": [
    "AI-powered ${sourceName} to ${targetName} translation",
    "Support for long texts up to 5,000 characters",
    "Queue processing for registered users",
    "Bidirectional translation support",
    "Free translation service"
  ]
};

export default function ${sourceName.replace(/\s+/g, '')}To${targetName.replace(/\s+/g, '')}Page() {
  return (
    <>
      <StructuredData type="WebApplication" data={structuredData} />
      <EnhancedTextTranslator
        defaultSourceLang="${sourceCode}"
        defaultTargetLang="${targetCode}"
        title="${pageTitle}"
        description="${description}"
        faqs={${sourceSlug.replace(/-/g, '')}to${targetSlug.replace(/-/g, '')}FAQs}
        showLanguageInfo={true}
        enableBidirectionalMode={true}
      />
    </>
  );
}`;
}

// 创建页面文件
function createPageFile(pageDir, pageContent) {
  if (!fs.existsSync(pageDir)) {
    fs.mkdirSync(pageDir, { recursive: true });
  }
  
  const pageFile = path.join(pageDir, 'page.tsx');
  fs.writeFileSync(pageFile, pageContent, 'utf8');
}

// 检查现有页面
function getExistingPageFiles() {
  const localeDir = '/home/hwt/translation-low-source/frontend/app/[locale]';
  return fs.readdirSync(localeDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .filter(name => name.includes('-to-'));
}

// 主函数
function main() {
  const allLanguages = getAllLanguagesFromConfig();
  const existingFiles = getExistingPageFiles();
  const localeDir = '/home/hwt/translation-low-source/frontend/app/[locale]';
  
  console.log('📋 将要创建页面的语言:');
  
  // 只为标记为available: true的语言创建页面
  const availableLanguages = allLanguages.filter(lang => lang.available);
  availableLanguages.forEach(lang => {
    console.log(`   ${lang.code} (${lang.slug}) - ${lang.name} ✅`);
  });
  
  // 检查需要创建的页面
  const missingPages = [];
  
  availableLanguages.forEach(lang => {
    // xxx-to-english 页面
    const toEnglishPage = `${lang.slug}-to-english`;
    if (!existingFiles.includes(toEnglishPage)) {
      missingPages.push({
        slug: toEnglishPage,
        sourceSlug: lang.slug,
        targetSlug: 'english',
        sourceName: lang.name,
        targetName: 'English',
        sourceNative: lang.nativeName,
        targetNative: 'English'
      });
    }
    
    // english-to-xxx 页面
    const fromEnglishPage = `english-to-${lang.slug}`;
    if (!existingFiles.includes(fromEnglishPage)) {
      missingPages.push({
        slug: fromEnglishPage,
        sourceSlug: 'english',
        targetSlug: lang.slug,
        sourceName: 'English',
        targetName: lang.name,
        sourceNative: 'English',
        targetNative: lang.nativeName
      });
    }
  });
  
  console.log(`\n❌ 需要创建的页面 (${missingPages.length}个):`);
  missingPages.forEach(page => {
    console.log(`   ${page.slug}`);
  });
  
  if (missingPages.length === 0) {
    console.log('\n✅ 所有可用语言的页面都已存在！');
    return;
  }
  
  console.log('\n🔧 开始创建页面...');
  let createdCount = 0;
  
  missingPages.forEach(page => {
    try {
      const pageDir = path.join(localeDir, page.slug);
      const pageContent = generatePageTemplate(
        page.sourceSlug,
        page.targetSlug,
        page.sourceName,
        page.targetName,
        page.sourceNative,
        page.targetNative
      );
      
      createPageFile(pageDir, pageContent);
      console.log(`   ✅ 创建: ${page.slug}`);
      createdCount++;
    } catch (error) {
      console.log(`   ❌ 创建失败: ${page.slug} - ${error.message}`);
    }
  });
  
  console.log(`\n🎉 创建完成！`);
  console.log(`   需要创建: ${missingPages.length}`);
  console.log(`   成功创建: ${createdCount}`);
  console.log(`   创建失败: ${missingPages.length - createdCount}`);
  
  if (createdCount > 0) {
    console.log('\n🔧 更新page-utils.ts配置...');
    updatePageUtils(availableLanguages);
  }
}

// 更新page-utils.ts文件
function updatePageUtils(availableLanguages) {
  const pageUtilsPath = '/home/hwt/translation-low-source/frontend/lib/utils/page-utils.ts';
  let content = fs.readFileSync(pageUtilsPath, 'utf8');
  
  // 生成新的EXISTING_TRANSLATION_PAGES数组
  const allPages = [];
  
  availableLanguages.forEach(lang => {
    allPages.push(`${lang.slug}-to-english`);
    allPages.push(`english-to-${lang.slug}`);
  });
  
  allPages.sort();
  
  const toEnglishPages = allPages.filter(p => p.endsWith('-to-english'));
  const fromEnglishPages = allPages.filter(p => p.startsWith('english-to-'));
  
  const newPagesArray = `const EXISTING_TRANSLATION_PAGES = [
  // xxx-to-english pages
  ${toEnglishPages.map(p => `'${p}'`).join(',\n  ')},
  
  // english-to-xxx pages
  ${fromEnglishPages.map(p => `'${p}'`).join(',\n  ')}
]`;
  
  // 替换现有的EXISTING_TRANSLATION_PAGES数组
  content = content.replace(
    /const EXISTING_TRANSLATION_PAGES = \[[\s\S]*?\]/,
    newPagesArray
  );
  
  fs.writeFileSync(pageUtilsPath, content, 'utf8');
  console.log('   ✅ 已更新page-utils.ts');
}

if (require.main === module) {
  main();
}
