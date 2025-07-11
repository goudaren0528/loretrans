#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 启用Pashto和Sindhi语言并创建对应页面...\n');

// 需要启用的语言
const languagesToEnable = [
  {
    code: 'ps',
    name: 'Pashto',
    nativeName: 'پښتو',
    slug: 'pashto'
  },
  {
    code: 'sd', 
    name: 'Sindhi',
    nativeName: 'سنڌي',
    slug: 'sindhi'
  }
];

// 1. 启用这些语言
function enableLanguages() {
  const configPath = '/home/hwt/translation-low-source/config/app.config.ts';
  let content = fs.readFileSync(configPath, 'utf8');
  let modifiedCount = 0;

  console.log('📝 启用语言配置...\n');

  languagesToEnable.forEach(lang => {
    const regex = new RegExp(
      `(\\{[^}]*slug:\\s*'${lang.slug}'[^}]*available:\\s*)false([^}]*\\})`,
      'g'
    );
    
    const matches = content.match(regex);
    if (matches) {
      content = content.replace(regex, '$1true$2');
      modifiedCount++;
      console.log(`✅ ${lang.name} (${lang.slug}): available: false → available: true`);
    } else {
      console.log(`⚠️  未找到语言配置: ${lang.slug}`);
    }
  });

  if (modifiedCount > 0) {
    fs.writeFileSync(configPath, content, 'utf8');
    console.log(`\n🎉 成功启用了 ${modifiedCount} 个语言!`);
  }

  return modifiedCount;
}

// 2. 生成页面模板
function generatePageTemplate(sourceSlug, targetSlug, sourceName, targetName, sourceNative, targetNative, sourceCode, targetCode) {
  const isToEnglish = targetSlug === 'english';
  const pageTitle = isToEnglish ? 
    `${sourceName} to English Translation` : 
    `English to ${sourceName} Translation`;
  
  const description = isToEnglish ?
    `Translate ${sourceName} (${sourceNative}) to English instantly with our AI-powered translator. Convert ${sourceNative} text to English with high accuracy.` :
    `Translate English to ${sourceName} (${sourceNative}) instantly with our AI-powered translator. Convert English text to ${sourceNative} with high accuracy.`;

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

// 3. 创建页面文件
function createPageFile(pageDir, pageContent) {
  if (!fs.existsSync(pageDir)) {
    fs.mkdirSync(pageDir, { recursive: true });
  }
  
  const pageFile = path.join(pageDir, 'page.tsx');
  fs.writeFileSync(pageFile, pageContent, 'utf8');
}

// 4. 创建页面
function createPages() {
  const localeDir = '/home/hwt/translation-low-source/frontend/app/[locale]';
  let createdCount = 0;
  
  console.log('\n🔧 创建翻译页面...\n');
  
  languagesToEnable.forEach(lang => {
    // 创建 xxx-to-english 页面
    const toEnglishPage = `${lang.slug}-to-english`;
    const toEnglishDir = path.join(localeDir, toEnglishPage);
    
    if (!fs.existsSync(toEnglishDir)) {
      try {
        const pageContent = generatePageTemplate(
          lang.slug, 'english', 
          lang.name, 'English',
          lang.nativeName, 'English',
          lang.code, 'en'
        );
        createPageFile(toEnglishDir, pageContent);
        console.log(`   ✅ 创建: ${toEnglishPage}`);
        createdCount++;
      } catch (error) {
        console.log(`   ❌ 创建失败: ${toEnglishPage} - ${error.message}`);
      }
    } else {
      console.log(`   ✓ 已存在: ${toEnglishPage}`);
    }
    
    // 创建 english-to-xxx 页面
    const fromEnglishPage = `english-to-${lang.slug}`;
    const fromEnglishDir = path.join(localeDir, fromEnglishPage);
    
    if (!fs.existsSync(fromEnglishDir)) {
      try {
        const pageContent = generatePageTemplate(
          'english', lang.slug,
          'English', lang.name,
          'English', lang.nativeName,
          'en', lang.code
        );
        createPageFile(fromEnglishDir, pageContent);
        console.log(`   ✅ 创建: ${fromEnglishPage}`);
        createdCount++;
      } catch (error) {
        console.log(`   ❌ 创建失败: ${fromEnglishPage} - ${error.message}`);
      }
    } else {
      console.log(`   ✓ 已存在: ${fromEnglishPage}`);
    }
  });
  
  return createdCount;
}

// 5. 更新page-utils.ts
function updatePageUtils() {
  const pageUtilsPath = '/home/hwt/translation-low-source/frontend/lib/utils/page-utils.ts';
  let content = fs.readFileSync(pageUtilsPath, 'utf8');
  
  console.log('\n🔧 更新page-utils.ts配置...');
  
  // 添加新的语言代码映射
  languagesToEnable.forEach(lang => {
    const mappingPattern = `'${lang.code}': '${lang.slug}'`;
    if (!content.includes(mappingPattern)) {
      // 在LANGUAGE_CODE_TO_SLUG中添加映射
      content = content.replace(
        /(const LANGUAGE_CODE_TO_SLUG: Record<string, string> = \{[\s\S]*?)(\n\})/,
        `$1,\n  '${lang.code}': '${lang.slug}'$2`
      );
      console.log(`   ✅ 添加语言代码映射: ${lang.code} -> ${lang.slug}`);
    }
  });
  
  // 添加新的页面到EXISTING_TRANSLATION_PAGES
  const newPages = [];
  languagesToEnable.forEach(lang => {
    newPages.push(`${lang.slug}-to-english`);
    newPages.push(`english-to-${lang.slug}`);
  });
  
  newPages.forEach(page => {
    if (!content.includes(`'${page}'`)) {
      if (page.endsWith('-to-english')) {
        // 添加到xxx-to-english部分
        content = content.replace(
          /(\/\/ xxx-to-english pages[\s\S]*?)(,\s*\n\s*\/\/ english-to-xxx pages)/,
          `$1,\n  '${page}'$2`
        );
      } else {
        // 添加到english-to-xxx部分
        content = content.replace(
          /(\/\/ english-to-xxx pages[\s\S]*?)(\n\])/,
          `$1,\n  '${page}'$2`
        );
      }
      console.log(`   ✅ 添加页面路由: ${page}`);
    }
  });
  
  fs.writeFileSync(pageUtilsPath, content, 'utf8');
  console.log('   ✅ 已更新page-utils.ts');
}

// 主函数
function main() {
  console.log('🎯 目标: 启用Pashto和Sindhi语言并创建对应的翻译页面\n');
  
  // 1. 启用语言
  const enabledCount = enableLanguages();
  
  // 2. 创建页面
  const createdCount = createPages();
  
  // 3. 更新配置
  updatePageUtils();
  
  console.log('\n📊 总结:');
  console.log(`   启用的语言数: ${enabledCount}`);
  console.log(`   创建的页面数: ${createdCount}`);
  console.log(`   处理的语言: Pashto, Sindhi`);
  
  console.log('\n🚀 下一步:');
  console.log('1. 重新构建项目: cd frontend && npm run build');
  console.log('2. 测试首页语言网格的跳转');
  console.log('3. 验证Pashto和Sindhi页面的功能');
  
  console.log('\n✨ 完成!');
}

if (require.main === module) {
  main();
}
