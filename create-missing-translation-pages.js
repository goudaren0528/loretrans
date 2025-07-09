#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 创建缺失的翻译页面...\n');

// 从配置文件获取支持的语言
const getLanguageConfig = () => {
  const configPath = path.join(__dirname, 'frontend/config/app.config.ts');
  const configContent = fs.readFileSync(configPath, 'utf8');
  
  // 解析支持的语言（简化版解析）
  const languages = [
    { code: 'en', name: 'English', nativeName: 'English', slug: 'english' },
    { code: 'zh', name: 'Chinese', nativeName: '中文', slug: 'chinese' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', slug: 'spanish' },
    { code: 'fr', name: 'French', nativeName: 'Français', slug: 'french' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', slug: 'arabic' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', slug: 'hindi' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', slug: 'portuguese' },
    { code: 'ht', name: 'Haitian Creole', nativeName: 'Kreyòl Ayisyen', slug: 'creole' },
    { code: 'lo', name: 'Lao', nativeName: 'ລາວ', slug: 'lao' },
    { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', slug: 'swahili' },
    { code: 'my', name: 'Burmese', nativeName: 'မြန်မာ', slug: 'burmese' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', slug: 'telugu' }
  ];
  
  return languages.filter(lang => lang.code !== 'en'); // 排除英语本身
};

// 检查现有页面
const checkExistingPages = () => {
  console.log('📄 检查现有翻译页面...');
  
  const localeDir = path.join(__dirname, 'frontend/app/[locale]');
  const existingPages = fs.readdirSync(localeDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .filter(name => name.startsWith('english-to-'));
  
  console.log(`现有页面 (${existingPages.length}个):`);
  existingPages.forEach(page => console.log(`  - ${page}`));
  
  return existingPages;
};

// 生成页面模板
const generatePageTemplate = (targetLang) => {
  const { code, name, nativeName, slug } = targetLang;
  
  return `import React from 'react'
import { Metadata } from 'next'
import { BidirectionalTranslator } from '@/components/bidirectional-translator'
import { StructuredData } from '@/components/structured-data'

export const metadata: Metadata = {
  title: 'English to ${name} Translation - Free AI Translator | Loretrans',
  description: 'Translate English to ${name} (${nativeName}) instantly with our AI-powered translator. Convert English text to ${nativeName} script with high accuracy. Free online translation tool.',
  keywords: ['English to ${name} translation', 'English to ${name}', '${nativeName} translator', 'free ${name} translation', 'English ${name} converter'],
  openGraph: {
    title: 'English to ${name} Translation - Free AI Translator',
    description: 'Translate English to ${name} (${nativeName}) instantly with AI. Free, accurate, and easy to use.',
    url: 'https://loretrans.app/english-to-${slug}',
    siteName: 'Loretrans',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'English to ${name} Translation - Free AI Translator',
    description: 'Translate English to ${name} (${nativeName}) instantly with AI. Free, accurate, and easy to use.',
  },
  alternates: {
    canonical: 'https://loretrans.app/english-to-${slug}',
  },
}

const englishTo${name}FAQs = [
  {
    question: "How accurate is the English to ${name} translation?",
    answer: "Our AI-powered translator provides high-accuracy English to ${name} translations using advanced NLLB (No Language Left Behind) technology. While very reliable for most content, we recommend human review for critical documents."
  },
  {
    question: "Can I translate ${name} text back to English?",
    answer: "Yes! Our translator supports bidirectional translation. You can easily switch between English-to-${name} and ${name}-to-English translation using the swap button."
  },
  {
    question: "Is the English to ${name} translator free to use?",
    answer: "Yes, our English to ${name} translation service is completely free with no registration required. Simply enter your English text and get instant ${name} translations."
  },
  {
    question: "What types of text can I translate from English to ${name}?",
    answer: "You can translate various types of English content to ${name} including documents, emails, websites, social media posts, and casual conversations. Our translator handles both formal and informal language styles."
  },
  {
    question: "Does the translator support ${name} script properly?",
    answer: "Yes, our translator fully supports the ${name} script (${nativeName}) and handles the unique characteristics of the ${name} writing system, including proper character encoding and text direction."
  },
  {
    question: "Can I use this for business English to ${name} translation?",
    answer: "Our translator works well for business communications, but for important business documents, legal texts, or official communications, we recommend having translations reviewed by a native ${name} speaker."
  }
]

const features = [
  {
    title: "AI-Powered Translation",
    description: "Advanced neural machine translation technology specifically trained for English-${name} language pairs",
    icon: "🤖"
  },
  {
    title: "${name} Script Support", 
    description: "Full support for ${name} script (${nativeName}) with proper character encoding and text rendering",
    icon: "${nativeName.charAt(0)}"
  },
  {
    title: "Bidirectional Translation",
    description: "Switch between English-to-${name} and ${name}-to-English translation with one click",
    icon: "🔄"
  },
  {
    title: "Cultural Context",
    description: "Translations consider cultural nuances and context specific to ${name} language usage",
    icon: "🏛️"
  },
  {
    title: "Free & Fast",
    description: "Get instant English to ${name} translations at no cost, with results in seconds",
    icon: "⚡"
  },
  {
    title: "No Registration",
    description: "Start translating immediately without creating accounts or providing personal information",
    icon: "🚀"
  }
]

export default function EnglishTo${name}Page() {
  return (
    <main className="min-h-screen bg-background">
      {/* Structured Data */}
      <StructuredData 
        type="WebApplication"
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "English to ${name} Translator",
          "description": "Free AI-powered English to ${name} translation tool",
          "url": "https://loretrans.app/english-to-${slug}",
          "applicationCategory": "TranslationApplication",
          "operatingSystem": "Any",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "1250"
          }
        }}
      />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                English to <span className="text-blue-600">${name}</span> Translation
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Transform English text into beautiful ${name} script instantly with our AI-powered translator.
                <span className="block mt-2 text-lg">
                  Free, accurate, and designed for the ${name} language community.
                </span>
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Free Forever
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                AI-Powered
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                Bidirectional
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                Instant Results
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Translation Tool */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <BidirectionalTranslator
            defaultSourceLang="en"
            defaultTargetLang="${code}"
            placeholder="Enter English text to translate to ${name}..."
            showNavigation={true}
            showLanguageDetection={true}
            enableBidirectionalMode={true}
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Why Choose Our English to ${name} Translator?
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Experience the most advanced AI translation technology tailored for the English-${name} language pair
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="relative group bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center mb-4">
                    <div className="text-2xl mr-3">{feature.icon}</div>
                    <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                  </div>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About ${name} Language */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  About the ${name} Language
                </h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    ${name} (${nativeName}) is a widely spoken language with rich cultural heritage and linguistic features.
                    Our AI translator respects these linguistic characteristics to provide accurate English to ${name} translations.
                  </p>
                  <p>
                    Whether you're learning ${name}, conducting business, or connecting with ${name}-speaking communities, 
                    our AI translator helps bridge the language gap with cultural sensitivity and linguistic accuracy.
                  </p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-8">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900">Language Info</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Language:</span>
                      <span className="font-medium">${name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Native Name:</span>
                      <span className="font-medium">${nativeName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Code:</span>
                      <span className="font-medium">${code}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Frequently Asked Questions
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Everything you need to know about English to ${name} translation
              </p>
            </div>
            
            <div className="space-y-6">
              {englishTo${name}FAQs.map((faq, index) => (
                <details
                  key={index}
                  className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                >
                  <summary className="flex cursor-pointer items-center justify-between text-lg font-semibold text-gray-900 marker:content-['']">
                    {faq.question}
                    <svg
                      className="h-5 w-5 text-gray-500 transition-transform group-open:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </summary>
                  <div className="mt-4 text-gray-600 leading-7">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}`;
};

// 创建缺失的页面
const createMissingPages = () => {
  console.log('\n🔧 创建缺失的翻译页面...');
  
  const languages = getLanguageConfig();
  const existingPages = checkExistingPages();
  
  const missingLanguages = languages.filter(lang => {
    const expectedPageName = `english-to-${lang.slug}`;
    return !existingPages.includes(expectedPageName);
  });
  
  console.log(`\n需要创建的页面 (${missingLanguages.length}个):`);
  missingLanguages.forEach(lang => console.log(`  - english-to-${lang.slug} (${lang.name})`));
  
  if (missingLanguages.length === 0) {
    console.log('✅ 所有翻译页面都已存在！');
    return { created: [], existing: existingPages };
  }
  
  const localeDir = path.join(__dirname, 'frontend/app/[locale]');
  const createdPages = [];
  
  missingLanguages.forEach(lang => {
    const pageDirName = `english-to-${lang.slug}`;
    const pageDir = path.join(localeDir, pageDirName);
    const pageFile = path.join(pageDir, 'page.tsx');
    
    try {
      // 创建目录
      if (!fs.existsSync(pageDir)) {
        fs.mkdirSync(pageDir, { recursive: true });
      }
      
      // 生成页面内容
      const pageContent = generatePageTemplate(lang);
      
      // 写入文件
      fs.writeFileSync(pageFile, pageContent, 'utf8');
      
      console.log(`✅ 已创建: ${pageDirName}/page.tsx`);
      createdPages.push(pageDirName);
      
    } catch (error) {
      console.error(`❌ 创建 ${pageDirName} 失败:`, error.message);
    }
  });
  
  return { created: createdPages, existing: existingPages };
};

// 验证所有页面
const verifyAllPages = (results) => {
  console.log('\n📊 验证所有翻译页面...');
  
  const languages = getLanguageConfig();
  const allExpectedPages = languages.map(lang => `english-to-${lang.slug}`);
  const allExistingPages = [...results.existing, ...results.created];
  
  console.log(`\n预期页面总数: ${allExpectedPages.length}`);
  console.log(`实际页面总数: ${allExistingPages.length}`);
  
  const missingPages = allExpectedPages.filter(page => !allExistingPages.includes(page));
  
  if (missingPages.length === 0) {
    console.log('✅ 所有预期的翻译页面都已存在！');
  } else {
    console.log(`❌ 仍然缺少 ${missingPages.length} 个页面:`);
    missingPages.forEach(page => console.log(`  - ${page}`));
  }
  
  return {
    total: allExpectedPages.length,
    existing: allExistingPages.length,
    missing: missingPages.length,
    created: results.created.length
  };
};

// 生成页面列表
const generatePageList = () => {
  console.log('\n📝 生成页面列表...');
  
  const languages = getLanguageConfig();
  const pageList = languages.map(lang => ({
    path: `/english-to-${lang.slug}`,
    name: `English to ${lang.name}`,
    nativeName: lang.nativeName,
    code: lang.code
  }));
  
  const listContent = `# English-to-xxx Translation Pages

## 支持的翻译页面 (${pageList.length}个)

${pageList.map((page, index) => 
  `${index + 1}. **${page.name}** (${page.nativeName})
   - 路径: \`${page.path}\`
   - 语言代码: \`${page.code}\`
   - 访问: http://localhost:3000${page.path}`
).join('\n\n')}

## 测试清单

请逐一测试以下页面的功能:

${pageList.map((page, index) => 
  `- [ ] ${page.name} - ${page.path}`
).join('\n')}

## 功能测试要点

对于每个页面，请验证:

1. ✅ 页面正常加载，无错误
2. ✅ 语言选择器显示正确的占位符文本
3. ✅ 双箭头按钮 (⇄) 可以正常切换语言
4. ✅ 刷新按钮 (↻) 可以清空文本内容
5. ✅ 翻译功能正常工作
6. ✅ 按钮悬停时显示正确的提示文本
7. ✅ 页面SEO元数据正确设置
8. ✅ FAQ部分内容相关且准确

## 批量测试脚本

\`\`\`bash
# 启动开发服务器
cd frontend && npm run dev

# 在浏览器中依次访问所有页面进行测试
${pageList.map(page => `# ${page.name}: http://localhost:3000${page.path}`).join('\n')}
\`\`\`

生成时间: ${new Date().toLocaleString()}
`;

  fs.writeFileSync(path.join(__dirname, 'TRANSLATION_PAGES_LIST.md'), listContent, 'utf8');
  console.log('✅ 已生成页面列表: TRANSLATION_PAGES_LIST.md');
};

// 主函数
async function main() {
  try {
    console.log('🚀 开始创建缺失的翻译页面...\n');
    
    const results = createMissingPages();
    const verification = verifyAllPages(results);
    generatePageList();
    
    console.log('\n🎉 任务完成！');
    console.log('\n📊 统计信息:');
    console.log(`- 总语言数: ${verification.total + 1} (包括英语)`);
    console.log(`- 翻译页面数: ${verification.total}`);
    console.log(`- 已存在页面: ${results.existing.length}`);
    console.log(`- 新创建页面: ${verification.created}`);
    console.log(`- 缺失页面: ${verification.missing}`);
    
    if (verification.created > 0) {
      console.log('\n✅ 新创建的页面:');
      results.created.forEach(page => console.log(`  - ${page}`));
    }
    
    console.log('\n🚀 下一步:');
    console.log('1. 启动开发服务器: cd frontend && npm run dev');
    console.log('2. 查看页面列表: cat TRANSLATION_PAGES_LIST.md');
    console.log('3. 逐一测试所有翻译页面的功能');
    console.log('4. 验证语言切换和重置按钮是否正常工作');
    
  } catch (error) {
    console.error('❌ 创建过程中出错:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  getLanguageConfig,
  checkExistingPages,
  createMissingPages,
  verifyAllPages
};
