#!/usr/bin/env node

/**
 * 精确修复 Sindhi to English 页面的元数据本地化
 */

const fs = require('fs');
const path = require('path');

// 本地化元数据
const LOCALIZED_METADATA = {
  en: {
    title: 'Sindhi to English Translation - Free AI Translator | LoReTrans',
    description: 'Translate Sindhi (سنڌي) to English instantly with our AI-powered translator. Convert Sindhi (سنڌي) text to English with high accuracy. Support for long texts up to 5,000 characters.',
    keywords: ['Sindhi to English translation', 'sindhi-to-english', 'sindhi-to-english translator', 'free sindhi-to-english translation', 'sindhi english converter'],
    ogTitle: 'Sindhi to English Translation - Free AI Translator',
    ogDescription: 'Translate Sindhi (سنڌي) to English instantly with our AI-powered translator. Convert Sindhi (سنڌي) text to English with high accuracy. Support for long texts and queue processing.',
    twitterTitle: 'Sindhi to English Translation - Free AI Translator',
    twitterDescription: 'Translate Sindhi (سنڌي) to English instantly with our AI-powered translator. Convert Sindhi (سنڌي) text to English with high accuracy. Support for long texts and queue processing.'
  },
  fr: {
    title: 'Traduction Sindhi vers Anglais - Traducteur IA Gratuit | LoReTrans',
    description: 'Traduisez le sindhi (سنڌي) vers l\'anglais instantanément avec notre traducteur IA. Convertissez le texte sindhi en anglais avec une grande précision. Support pour les longs textes jusqu\'à 5 000 caractères.',
    keywords: ['traduction sindhi anglais', 'traducteur sindhi-anglais', 'traduction sindhi-anglais gratuite', 'convertisseur sindhi anglais', 'traducteur IA sindhi'],
    ogTitle: 'Traduction Sindhi vers Anglais - Traducteur IA Gratuit',
    ogDescription: 'Traduisez le sindhi (سنڌي) vers l\'anglais instantanément avec notre traducteur IA. Convertissez le texte sindhi en anglais avec une grande précision. Support pour les longs textes et traitement en file d\'attente.',
    twitterTitle: 'Traduction Sindhi vers Anglais - Traducteur IA Gratuit',
    twitterDescription: 'Traduisez le sindhi (سنڌي) vers l\'anglais instantanément avec notre traducteur IA. Convertissez le texte sindhi en anglais avec une grande précision. Support pour les longs textes et traitement en file d\'attente.'
  },
  es: {
    title: 'Traducción de Sindhi a Inglés - Traductor IA Gratuito | LoReTrans',
    description: 'Traduce sindhi (سنڌي) al inglés instantáneamente con nuestro traductor IA. Convierte texto sindhi al inglés con alta precisión. Soporte para textos largos hasta 5,000 caracteres.',
    keywords: ['traducción sindhi inglés', 'traductor sindhi-inglés', 'traducción sindhi-inglés gratis', 'convertidor sindhi inglés', 'traductor IA sindhi'],
    ogTitle: 'Traducción de Sindhi a Inglés - Traductor IA Gratuito',
    ogDescription: 'Traduce sindhi (سنڌي) al inglés instantáneamente con nuestro traductor IA. Convierte texto sindhi al inglés con alta precisión. Soporte para textos largos y procesamiento en cola.',
    twitterTitle: 'Traducción de Sindhi a Inglés - Traductor IA Gratuito',
    twitterDescription: 'Traduce sindhi (سنڌي) al inglés instantáneamente con nuestro traductor IA. Convierte texto sindhi al inglés con alta precisión. Soporte para textos largos y procesamiento en cola.'
  },
  zh: {
    title: '信德语到英语翻译 - 免费AI翻译器 | LoReTrans',
    description: '使用我们的AI翻译器即时将信德语(سنڌي)翻译成英语。高精度将信德语文本转换为英语。支持最多5,000字符的长文本。',
    keywords: ['信德语英语翻译', '信德语-英语翻译器', '免费信德语-英语翻译', '信德语英语转换器', 'AI信德语翻译器'],
    ogTitle: '信德语到英语翻译 - 免费AI翻译器',
    ogDescription: '使用我们的AI翻译器即时将信德语(سنڌي)翻译成英语。高精度将信德语文本转换为英语。支持长文本和队列处理。',
    twitterTitle: '信德语到英语翻译 - 免费AI翻译器',
    twitterDescription: '使用我们的AI翻译器即时将信德语(سنڌي)翻译成英语。高精度将信德语文本转换为英语。支持长文本和队列处理。'
  }
};

function fixSindhiPageMetadata() {
  const pagePath = path.join(__dirname, 'frontend/app/[locale]/sindhi-to-english/page.tsx');
  
  if (!fs.existsSync(pagePath)) {
    console.log('❌ Sindhi to English page not found');
    return false;
  }

  let content = fs.readFileSync(pagePath, 'utf8');

  // 替换整个 generateMetadata 函数
  const newGenerateMetadata = `export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = params
  
  // 本地化元数据
  const metadata = {
    en: {
      title: 'Sindhi to English Translation - Free AI Translator | LoReTrans',
      description: 'Translate Sindhi (سنڌي) to English instantly with our AI-powered translator. Convert Sindhi (سنڌي) text to English with high accuracy. Support for long texts up to 5,000 characters.',
      keywords: ['Sindhi to English translation', 'sindhi-to-english', 'sindhi-to-english translator', 'free sindhi-to-english translation', 'sindhi english converter'],
      ogTitle: 'Sindhi to English Translation - Free AI Translator',
      ogDescription: 'Translate Sindhi (سنڌي) to English instantly with our AI-powered translator. Convert Sindhi (سنڌي) text to English with high accuracy. Support for long texts and queue processing.',
      twitterTitle: 'Sindhi to English Translation - Free AI Translator',
      twitterDescription: 'Translate Sindhi (سنڌي) to English instantly with our AI-powered translator. Convert Sindhi (سنڌي) text to English with high accuracy. Support for long texts and queue processing.'
    },
    fr: {
      title: 'Traduction Sindhi vers Anglais - Traducteur IA Gratuit | LoReTrans',
      description: 'Traduisez le sindhi (سنڌي) vers l\\'anglais instantanément avec notre traducteur IA. Convertissez le texte sindhi en anglais avec une grande précision. Support pour les longs textes jusqu\\'à 5 000 caractères.',
      keywords: ['traduction sindhi anglais', 'traducteur sindhi-anglais', 'traduction sindhi-anglais gratuite', 'convertisseur sindhi anglais', 'traducteur IA sindhi'],
      ogTitle: 'Traduction Sindhi vers Anglais - Traducteur IA Gratuit',
      ogDescription: 'Traduisez le sindhi (سنڌي) vers l\\'anglais instantanément avec notre traducteur IA. Convertissez le texte sindhi en anglais avec une grande précision. Support pour les longs textes et traitement en file d\\'attente.',
      twitterTitle: 'Traduction Sindhi vers Anglais - Traducteur IA Gratuit',
      twitterDescription: 'Traduisez le sindhi (سنڌي) vers l\\'anglais instantanément avec notre traducteur IA. Convertissez le texte sindhi en anglais avec une grande précision. Support pour les longs textes et traitement en file d\\'attente.'
    },
    es: {
      title: 'Traducción de Sindhi a Inglés - Traductor IA Gratuito | LoReTrans',
      description: 'Traduce sindhi (سنڌي) al inglés instantáneamente con nuestro traductor IA. Convierte texto sindhi al inglés con alta precisión. Soporte para textos largos hasta 5,000 caracteres.',
      keywords: ['traducción sindhi inglés', 'traductor sindhi-inglés', 'traducción sindhi-inglés gratis', 'convertidor sindhi inglés', 'traductor IA sindhi'],
      ogTitle: 'Traducción de Sindhi a Inglés - Traductor IA Gratuito',
      ogDescription: 'Traduce sindhi (سنڌي) al inglés instantáneamente con nuestro traductor IA. Convierte texto sindhi al inglés con alta precisión. Soporte para textos largos y procesamiento en cola.',
      twitterTitle: 'Traducción de Sindhi a Inglés - Traductor IA Gratuito',
      twitterDescription: 'Traduce sindhi (سنڌي) al inglés instantáneamente con nuestro traductor IA. Convierte texto sindhi al inglés con alta precisión. Soporte para textos largos y procesamiento en cola.'
    },
    zh: {
      title: '信德语到英语翻译 - 免费AI翻译器 | LoReTrans',
      description: '使用我们的AI翻译器即时将信德语(سنڌي)翻译成英语。高精度将信德语文本转换为英语。支持最多5,000字符的长文本。',
      keywords: ['信德语英语翻译', '信德语-英语翻译器', '免费信德语-英语翻译', '信德语英语转换器', 'AI信德语翻译器'],
      ogTitle: '信德语到英语翻译 - 免费AI翻译器',
      ogDescription: '使用我们的AI翻译器即时将信德语(سنڌي)翻译成英语。高精度将信德语文本转换为英语。支持长文本和队列处理。',
      twitterTitle: '信德语到英语翻译 - 免费AI翻译器',
      twitterDescription: '使用我们的AI翻译器即时将信德语(سنڌي)翻译成英语。高精度将信德语文本转换为英语。支持长文本和队列处理。'
    }
  };

  // 获取当前语言的元数据，如果不存在则使用英语
  const currentMetadata = metadata[locale as keyof typeof metadata] || metadata.en;
  
  return {
    title: currentMetadata.title,
    description: currentMetadata.description,
    keywords: currentMetadata.keywords,
    openGraph: {
      title: currentMetadata.ogTitle,
      description: currentMetadata.ogDescription,
      url: \`https://loretrans.com/\${locale}/sindhi-to-english\`,
      siteName: 'LoReTrans',
      locale: locale === 'zh' ? 'zh_CN' : locale === 'es' ? 'es_ES' : locale === 'fr' ? 'fr_FR' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: currentMetadata.twitterTitle,
      description: currentMetadata.twitterDescription,
    },
    alternates: {
      canonical: \`https://loretrans.com/\${locale}/sindhi-to-english\`,
    },
  }
}`;

  // 替换现有的 generateMetadata 函数
  const metadataRegex = /export async function generateMetadata\([^}]+\): Promise<Metadata> \{[^}]+return \{[^}]+\}\s*\}/s;
  
  if (metadataRegex.test(content)) {
    content = content.replace(metadataRegex, newGenerateMetadata);
    console.log('✅ Successfully updated Sindhi page metadata with localization');
  } else {
    console.log('❌ Could not find generateMetadata function to replace');
    return false;
  }

  fs.writeFileSync(pagePath, content);
  return true;
}

function main() {
  console.log('🚀 Fixing Sindhi page metadata localization...\n');
  
  if (fixSindhiPageMetadata()) {
    console.log('\n🎉 Sindhi page metadata fix completed successfully!');
    console.log('\n📋 What was changed:');
    console.log('✅ Added localized title, description, keywords for en, fr, es, zh');
    console.log('✅ Added localized OpenGraph metadata');
    console.log('✅ Added localized Twitter metadata');
    console.log('✅ Set correct locale for OpenGraph');
    console.log('✅ Maintained canonical URL structure');
    
    console.log('\n🔍 Next steps:');
    console.log('1. Test locally: npm run dev');
    console.log('2. Check different language URLs:');
    console.log('   - https://localhost:3000/en/sindhi-to-english');
    console.log('   - https://localhost:3000/fr/sindhi-to-english');
    console.log('   - https://localhost:3000/es/sindhi-to-english');
    console.log('   - https://localhost:3000/zh/sindhi-to-english');
    console.log('3. Verify metadata in browser dev tools');
    console.log('4. Deploy to production');
    console.log('5. Monitor Google Search Console');
  } else {
    console.log('\n❌ Failed to fix Sindhi page metadata');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixSindhiPageMetadata, LOCALIZED_METADATA };
