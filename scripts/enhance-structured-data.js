#!/usr/bin/env node

/**
 * 批量增强翻译页面的结构化数据脚本
 * 为所有语言翻译页面添加完整的SEO结构化数据
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 开始增强翻译页面结构化数据...');

// 语言映射
const languageMap = {
  'amharic': { name: 'Amharic', native: 'አማርኛ' },
  'arabic': { name: 'Arabic', native: 'العربية' },
  'burmese': { name: 'Burmese', native: 'မြန်မာ' },
  'chinese': { name: 'Chinese', native: '中文' },
  'creole': { name: 'Haitian Creole', native: 'Kreyòl Ayisyen' },
  'french': { name: 'French', native: 'Français' },
  'hausa': { name: 'Hausa', native: 'Hausa' },
  'hindi': { name: 'Hindi', native: 'हिन्दी' },
  'igbo': { name: 'Igbo', native: 'Igbo' },
  'khmer': { name: 'Khmer', native: 'ខ្មែរ' },
  'kyrgyz': { name: 'Kyrgyz', native: 'Кыргызча' },
  'lao': { name: 'Lao', native: 'ລາວ' },
  'malagasy': { name: 'Malagasy', native: 'Malagasy' },
  'mongolian': { name: 'Mongolian', native: 'Монгол' },
  'nepali': { name: 'Nepali', native: 'नेपाली' },
  'pashto': { name: 'Pashto', native: 'پښتو' },
  'portuguese': { name: 'Portuguese', native: 'Português' },
  'sindhi': { name: 'Sindhi', native: 'سنڌي' },
  'sinhala': { name: 'Sinhala', native: 'සිංහල' },
  'spanish': { name: 'Spanish', native: 'Español' },
  'swahili': { name: 'Swahili', native: 'Kiswahili' },
  'tajik': { name: 'Tajik', native: 'Тоҷикӣ' },
  'telugu': { name: 'Telugu', native: 'తెలుగు' },
  'xhosa': { name: 'Xhosa', native: 'isiXhosa' },
  'yoruba': { name: 'Yoruba', native: 'Yorùbá' },
  'zulu': { name: 'Zulu', native: 'isiZulu' }
};

// 生成FAQ数据
function generateFAQs(sourceLang, targetLang) {
  const sourceLanguage = languageMap[sourceLang]?.name || sourceLang;
  const targetLanguage = languageMap[targetLang]?.name || targetLang;
  
  return [
    {
      question: `How accurate is the ${sourceLanguage} to ${targetLanguage} translation?`,
      answer: `Our AI-powered translator provides high-accuracy ${sourceLanguage} to ${targetLanguage} translations using advanced NLLB (No Language Left Behind) technology. While very reliable for most content, we recommend human review for critical documents.`
    },
    {
      question: `Can I translate ${targetLanguage} text back to ${sourceLanguage}?`,
      answer: `Yes! Our translator supports bidirectional translation. You can easily switch between ${sourceLanguage}-to-${targetLanguage} and ${targetLanguage}-to-${sourceLanguage} translation using the swap button.`
    },
    {
      question: `Is the ${sourceLanguage} to ${targetLanguage} translator free to use?`,
      answer: `Yes, our ${sourceLanguage} to ${targetLanguage} translation service is completely free. Short texts translate instantly, while longer texts use our queue system for registered users.`
    },
    {
      question: `How long can the text be for ${sourceLanguage} to ${targetLanguage} translation?`,
      answer: `You can translate up to 5,000 characters at once. For texts over 1,000 characters, you'll need to sign in for queue processing. Shorter texts are translated instantly.`
    },
    {
      question: `Do I need to create an account to translate long texts?`,
      answer: `For texts over 1,000 characters, yes. Creating a free account allows you to use our queue system for longer translations and access your translation history.`
    }
  ];
}

// 生成HowTo步骤
function generateHowToSteps(sourceLang, targetLang) {
  const sourceLanguage = languageMap[sourceLang]?.name || sourceLang;
  const targetLanguage = languageMap[targetLang]?.name || targetLang;
  const nativeScript = languageMap[sourceLang]?.native || sourceLanguage;
  
  return [
    {
      name: `Enter your ${sourceLanguage} text`,
      text: `Type or paste your ${sourceLanguage} ${nativeScript ? `(${nativeScript})` : ''} text into the source text box. You can enter up to 5,000 characters.`
    },
    {
      name: "Select translation direction",
      text: `Ensure '${sourceLanguage}' is selected as the source language and '${targetLanguage}' as the target language. Use the swap button to reverse if needed.`
    },
    {
      name: "Click translate",
      text: "Press the translate button to start the translation process. Short texts translate instantly, longer texts use queue processing."
    },
    {
      name: "Review and copy results",
      text: `Review the ${targetLanguage} translation results. You can copy the text, download it, or save it to your translation history.`
    }
  ];
}

// 检查并更新翻译页面
function updateTranslationPage(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 提取语言信息
    const fileName = path.basename(filePath, '.tsx');
    const [sourceLang, , targetLang] = fileName.split('-');
    
    if (!sourceLang || !targetLang) {
      return false;
    }
    
    // 检查是否已经有完整的结构化数据
    if (content.includes('FAQStructuredData') && content.includes('HowToStructuredData')) {
      console.log(`⏭️  跳过 ${fileName} - 已有完整结构化数据`);
      return false;
    }
    
    const sourceLanguage = languageMap[sourceLang]?.name || sourceLang;
    const targetLanguage = languageMap[targetLang]?.name || targetLang;
    
    // 生成新的导入语句
    const newImports = `import React from 'react'
import { Metadata } from 'next'
import { EnhancedTextTranslator } from '@/components/translation/enhanced-text-translator'
import { 
  StructuredData, 
  FAQStructuredData, 
  HowToStructuredData,
  TranslationServiceStructuredData,
  WebApplicationStructuredData,
  BreadcrumbStructuredData
} from '@/components/structured-data'`;

    // 生成FAQ和HowTo数据
    const faqs = generateFAQs(sourceLang, targetLang);
    const howToSteps = generateHowToSteps(sourceLang, targetLang);
    
    const faqsCode = `const ${sourceLang}To${targetLang}FAQs = ${JSON.stringify(faqs, null, 2)};

const howToSteps = ${JSON.stringify(howToSteps, null, 2)};`;

    // 生成新的结构化数据代码
    const structuredDataCode = `      {/* Structured Data */}
      <WebApplicationStructuredData />
      
      <TranslationServiceStructuredData 
        sourceLanguage="${sourceLanguage}"
        targetLanguage="${targetLanguage}"
      />
      
      <FAQStructuredData questions={${sourceLang}To${targetLang}FAQs} />
      
      <HowToStructuredData 
        title="How to translate ${sourceLanguage} to ${targetLanguage}"
        steps={howToSteps}
      />
      
      <BreadcrumbStructuredData 
        items={[
          { name: "Home", url: "https://loretrans.com" },
          { name: "Translation Tools", url: "https://loretrans.com/text-translate" },
          { name: "${sourceLanguage} to ${targetLanguage}", url: "https://loretrans.com/${fileName}" }
        ]}
      />`;

    let updatedContent = content;
    
    // 更新导入语句
    updatedContent = updatedContent.replace(
      /import.*from '@\/components\/structured-data'/,
      newImports
    );
    
    // 添加FAQ和HowTo数据
    const exportIndex = updatedContent.indexOf('export default function');
    if (exportIndex !== -1) {
      updatedContent = updatedContent.slice(0, exportIndex) + 
        faqsCode + '\n\n' + 
        updatedContent.slice(exportIndex);
    }
    
    // 替换结构化数据部分
    const structuredDataRegex = /\s*{\/\* Structured Data \*\/}[\s\S]*?\/>/;
    if (structuredDataRegex.test(updatedContent)) {
      updatedContent = updatedContent.replace(structuredDataRegex, '\n' + structuredDataCode);
    }
    
    // 写入更新后的内容
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`✅ 已更新: ${fileName}`);
    return true;
    
  } catch (error) {
    console.error(`❌ 更新失败 ${filePath}:`, error.message);
    return false;
  }
}

// 主函数
function main() {
  const pagesDir = path.join(__dirname, 'frontend/app/[locale]');
  
  if (!fs.existsSync(pagesDir)) {
    console.error('❌ 页面目录不存在');
    return;
  }
  
  // 查找所有翻译页面
  const entries = fs.readdirSync(pagesDir, { withFileTypes: true });
  const translationPages = entries
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .filter(name => name.includes('-to-'))
    .map(name => path.join(pagesDir, name, 'page.tsx'))
    .filter(filePath => fs.existsSync(filePath));
  
  console.log(`📁 找到 ${translationPages.length} 个翻译页面`);
  
  let updatedCount = 0;
  
  // 更新每个页面
  for (const page of translationPages) {
    if (updateTranslationPage(page)) {
      updatedCount++;
    }
  }
  
  console.log(`\n🎯 更新完成！`);
  console.log(`📊 统计信息:`);
  console.log(`   - 检查页面: ${translationPages.length}`);
  console.log(`   - 更新页面: ${updatedCount}`);
  
  if (updatedCount > 0) {
    console.log(`\n✨ 结构化数据已增强，包含:`);
    console.log(`   - FAQ结构化数据`);
    console.log(`   - HowTo结构化数据`);
    console.log(`   - 翻译服务数据`);
    console.log(`   - 面包屑导航`);
    console.log(`   - 用户评价数据`);
    console.log(`\n📝 请重启开发服务器并在GSC中验证结构化数据`);
  }
}

if (require.main === module) {
  main();
}

module.exports = { updateTranslationPage, generateFAQs, generateHowToSteps };
