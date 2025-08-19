#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function fixSindhiPage() {
  const pagePath = path.join(__dirname, 'frontend/app/[locale]/sindhi-to-english/page.tsx');
  
  if (!fs.existsSync(pagePath)) {
    console.log('❌ Sindhi page not found');
    return false;
  }

  let content = fs.readFileSync(pagePath, 'utf8');

  // 新的 generateMetadata 函数
  const newMetadataFunction = `export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = params
  
  // 本地化元数据
  const metadata = {
    en: {
      title: 'Sindhi to English Translation - Free AI Translator | LoReTrans',
      description: 'Translate Sindhi (سنڌي) to English instantly with our AI-powered translator. Convert Sindhi (سنڌي) text to English with high accuracy. Support for long texts up to 5,000 characters.',
      keywords: ['Sindhi to English translation', 'sindhi-to-english', 'sindhi-to-english translator', 'free sindhi-to-english translation', 'sindhi english converter'],
      ogTitle: 'Sindhi to English Translation - Free AI Translator',
      ogDescription: 'Translate Sindhi (سنڌي) to English instantly with our AI-powered translator. Convert Sindhi (سنڌي) text to English with high accuracy. Support for long texts and queue processing.'
    },
    fr: {
      title: 'Traduction Sindhi vers Anglais - Traducteur IA Gratuit | LoReTrans',
      description: 'Traduisez le sindhi (سنڌي) vers l\\'anglais instantanément avec notre traducteur IA. Convertissez le texte sindhi en anglais avec une grande précision. Support pour les longs textes jusqu\\'à 5 000 caractères.',
      keywords: ['traduction sindhi anglais', 'traducteur sindhi-anglais', 'traduction sindhi-anglais gratuite', 'convertisseur sindhi anglais', 'traducteur IA sindhi'],
      ogTitle: 'Traduction Sindhi vers Anglais - Traducteur IA Gratuit',
      ogDescription: 'Traduisez le sindhi (سنڌي) vers l\\'anglais instantanément avec notre traducteur IA. Convertissez le texte sindhi en anglais avec une grande précision. Support pour les longs textes et traitement en file d\\'attente.'
    },
    es: {
      title: 'Traducción de Sindhi a Inglés - Traductor IA Gratuito | LoReTrans',
      description: 'Traduce sindhi (سنڌي) al inglés instantáneamente con nuestro traductor IA. Convierte texto sindhi al inglés con alta precisión. Soporte para textos largos hasta 5,000 caracteres.',
      keywords: ['traducción sindhi inglés', 'traductor sindhi-inglés', 'traducción sindhi-inglés gratis', 'convertidor sindhi inglés', 'traductor IA sindhi'],
      ogTitle: 'Traducción de Sindhi a Inglés - Traductor IA Gratuito',
      ogDescription: 'Traduce sindhi (سنڌي) al inglés instantáneamente con nuestro traductor IA. Convierte texto sindhi al inglés con alta precisión. Soporte para textos largos y procesamiento en cola.'
    },
    zh: {
      title: '信德语到英语翻译 - 免费AI翻译器 | LoReTrans',
      description: '使用我们的AI翻译器即时将信德语(سنڌي)翻译成英语。高精度将信德语文本转换为英语。支持最多5,000字符的长文本。',
      keywords: ['信德语英语翻译', '信德语-英语翻译器', '免费信德语-英语翻译', '信德语英语转换器', 'AI信德语翻译器'],
      ogTitle: '信德语到英语翻译 - 免费AI翻译器',
      ogDescription: '使用我们的AI翻译器即时将信德语(سنڌي)翻译成英语。高精度将信德语文本转换为英语。支持长文本和队列处理。'
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
      title: currentMetadata.ogTitle,
      description: currentMetadata.ogDescription,
    },
    alternates: {
      canonical: \`https://loretrans.com/\${locale}/sindhi-to-english\`,
    },
  }
}`;

  // 找到并替换 generateMetadata 函数
  const startPattern = /export async function generateMetadata\(\{ params \}: Props\): Promise<Metadata> \{/;
  const endPattern = /\}\s*const sindhiToEnglishFAQs/;
  
  const startMatch = content.match(startPattern);
  const endMatch = content.match(endPattern);
  
  if (startMatch && endMatch) {
    const beforeFunction = content.substring(0, startMatch.index);
    const afterFunction = content.substring(content.indexOf('const sindhiToEnglishFAQs'));
    
    content = beforeFunction + newMetadataFunction + '\n\n' + afterFunction;
    
    fs.writeFileSync(pagePath, content);
    console.log('✅ Successfully updated Sindhi page metadata');
    return true;
  } else {
    console.log('❌ Could not find function boundaries');
    return false;
  }
}

if (require.main === module) {
  console.log('🚀 Fixing Sindhi page metadata...');
  if (fixSindhiPage()) {
    console.log('🎉 Fix completed successfully!');
  } else {
    console.log('❌ Fix failed');
    process.exit(1);
  }
}

module.exports = { fixSindhiPage };
