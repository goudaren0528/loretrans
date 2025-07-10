#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Language configurations
const languages = {
  'english-to-arabic': {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    direction: 'rtl'
  },
  'english-to-burmese': {
    code: 'my',
    name: 'Burmese',
    nativeName: 'မြန်မာ',
    direction: 'ltr'
  },
  'english-to-chinese': {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    direction: 'ltr'
  },
  'english-to-creole': {
    code: 'ht',
    name: 'Haitian Creole',
    nativeName: 'Kreyòl Ayisyen',
    direction: 'ltr'
  },
  'english-to-french': {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    direction: 'ltr'
  },
  'english-to-hindi': {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    direction: 'ltr'
  },
  'english-to-lao': {
    code: 'lo',
    name: 'Lao',
    nativeName: 'ລາວ',
    direction: 'ltr'
  },
  'english-to-portuguese': {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    direction: 'ltr'
  },
  'english-to-spanish': {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    direction: 'ltr'
  },
  'english-to-swahili': {
    code: 'sw',
    name: 'Swahili',
    nativeName: 'Kiswahili',
    direction: 'ltr'
  },
  'english-to-telugu': {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    direction: 'ltr'
  }
};

// Read the creole-to-english template
const templateDir = '/home/hwt/translation-low-source/frontend/app/[locale]/creole-to-english';
const pageTemplate = fs.readFileSync(path.join(templateDir, 'page.tsx'), 'utf8');
const clientTemplate = fs.readFileSync(path.join(templateDir, 'client.tsx'), 'utf8');

function generatePageContent(langKey, langConfig) {
  const langName = langConfig.name;
  const langNativeName = langConfig.nativeName;
  const langCode = langConfig.code;
  
  // Replace Haitian Creole specific content with English to target language
  let content = pageTemplate
    // Replace metadata
    .replace(/Haitian Creole to English Translation/g, `English to ${langName} Translation`)
    .replace(/Haitian Creole \(Kreyòl Ayisyen\) to English/g, `English to ${langName} (${langNativeName})`)
    .replace(/Kreyòl Ayisyen to English/g, `English to ${langNativeName}`)
    .replace(/Haitian Creole translator/g, `English to ${langName} translator`)
    .replace(/free Haitian Creole translation/g, `free English to ${langName} translation`)
    .replace(/Haitian Creole English converter/g, `English ${langName} converter`)
    .replace(/creole-to-english/g, langKey)
    
    // Replace page title and descriptions
    .replace(/Haitian Creole to English/g, `English to ${langName}`)
    .replace(/Haitian Creole \(Kreyòl Ayisyen\)/g, `English`)
    .replace(/Translate Haitian Creole \(Kreyòl Ayisyen\) to English instantly/g, `Translate English to ${langName} (${langNativeName}) instantly`)
    .replace(/Kreyòl Ayisyen/g, langNativeName)
    
    // Replace FAQ content
    .replace(/creoleToEnglishFAQs/g, `${langKey.replace(/-/g, '')}FAQs`)
    .replace(/How accurate is the Haitian Creole to English translation\?/g, `How accurate is the English to ${langName} translation?`)
    .replace(/Our AI-powered translator provides high-accuracy Haitian Creole to English translations/g, `Our AI-powered translator provides high-accuracy English to ${langName} translations`)
    .replace(/Can I translate English text back to Haitian Creole\?/g, `Can I translate ${langName} text back to English?`)
    .replace(/Haitian Creole-to-English and English-to-Haitian Creole/g, `English-to-${langName} and ${langName}-to-English`)
    .replace(/Is the Haitian Creole to English translator free to use\?/g, `Is the English to ${langName} translator free to use?`)
    .replace(/our Haitian Creole to English translation service/g, `our English to ${langName} translation service`)
    .replace(/How long can the text be for Haitian Creole to English translation\?/g, `How long can the text be for English to ${langName} translation?`)
    .replace(/Can I use this for business Haitian Creole to English translation\?/g, `Can I use this for business English to ${langName} translation?`)
    .replace(/Does the translator support Haitian Creole script properly\?/g, `Does the translator support ${langName} script properly?`)
    .replace(/our translator fully supports the Haitian Creole script \(Kreyòl Ayisyen\)/g, `our translator fully supports the ${langName} script (${langNativeName})`)
    .replace(/the unique characteristics of the Haitian Creole writing system/g, `the unique characteristics of the ${langName} writing system`)
    
    // Replace component props - swap source and target languages
    .replace(/defaultSourceLang="ht"/g, `defaultSourceLang="en"`)
    .replace(/defaultTargetLang="en"/g, `defaultTargetLang="${langCode}"`)
    
    // Replace about section
    .replace(/About the Haitian Creole Language/g, `About the ${langName} Language`)
    .replace(/Haitian Creole \(Kreyòl Ayisyen\) is a widely spoken language/g, `${langName} (${langNativeName}) is a widely spoken language`)
    .replace(/Our AI translator respects these linguistic characteristics to provide accurate Haitian Creole to English translations/g, `Our AI translator respects these linguistic characteristics to provide accurate English to ${langName} translations`)
    .replace(/translating Haitian Creole documents/g, `translating English documents to ${langName}`)
    .replace(/communicating with English speakers/g, `communicating with ${langName} speakers`)
    
    // Replace structured data
    .replace(/Haitian Creole to English Translator/g, `English to ${langName} Translator`)
    .replace(/Free AI-powered Haitian Creole to English translation tool/g, `Free AI-powered English to ${langName} translation tool`)
    
    // Replace language info section
    .replace(/Language:<\/span>\s*<span className="font-medium">Haitian Creole<\/span>/g, `Language:</span>\n                      <span className="font-medium">${langName}</span>`)
    .replace(/Native Name:<\/span>\s*<span className="font-medium">Kreyòl Ayisyen<\/span>/g, `Native Name:</span>\n                      <span className="font-medium">${langNativeName}</span>`)
    .replace(/Code:<\/span>\s*<span className="font-medium">ht<\/span>/g, `Code:</span>\n                      <span className="font-medium">${langCode}</span>`)
    
    // Replace function name
    .replace(/export default function HaitianCreoleToEnglishPage\(\)/g, `export default function EnglishTo${langName.replace(/\s+/g, '')}Page()`)
    
    // Replace FAQ section title
    .replace(/Everything you need to know about our Haitian Creole to English translator/g, `Everything you need to know about our English to ${langName} translator`)
    
    // Replace hero section content
    .replace(/AI Translator<\/span>/g, `AI Translator</span>`)
    .replace(/Support for long texts, queue processing, and translation history\./g, `Support for long texts, queue processing, and translation history.`)
    
    // Replace bidirectional support description
    .replace(/Seamlessly switch between Haitian Creole-to-English and English-to-Haitian Creole translation/g, `Seamlessly switch between English-to-${langName} and ${langName}-to-English translation`);
    
  return content;
}

function generateClientContent(langKey, langConfig) {
  const langName = langConfig.name;
  const langNativeName = langConfig.nativeName;
  const langCode = langConfig.code;
  
  // Replace Haitian Creole specific content with English to target language
  let content = clientTemplate
    .replace(/creoleExamples/g, `${langKey.replace(/-/g, '')}Examples`)
    .replace(/creoleFAQ/g, `${langKey.replace(/-/g, '')}FAQ`)
    // Swap source and target languages
    .replace(/defaultSourceLang="ht"/g, `defaultSourceLang="en"`)
    .replace(/defaultTargetLang="en"/g, `defaultTargetLang="${langCode}"`)
    .replace(/Is this Haitian Creole translator accurate\?/g, `Is this English to ${langName} translator accurate?`)
    .replace(/Our translator uses Meta's NLLB AI model, specifically trained on Haitian Creole \(Kreyòl Ayisyen\)/g, `Our translator uses Meta's NLLB AI model, specifically trained on ${langName} (${langNativeName})`)
    .replace(/significantly better accuracy than traditional translation services for Creole text/g, `significantly better accuracy than traditional translation services for ${langName} text`)
    .replace(/Can I translate documents from Creole to English\?/g, `Can I translate documents from English to ${langName}?`)
    .replace(/Upload your Haitian Creole document and get an English translation/g, `Upload your English document and get a ${langName} translation`)
    .replace(/Do you support both Haitian Creole dialects\?/g, `Do you support ${langName} dialects?`)
    .replace(/Our AI model is trained on standard Haitian Creole \(Kreyòl Ayisyen\)/g, `Our AI model is trained on standard ${langName} (${langNativeName})`)
    .replace(/common dialectal variations found in Haiti and Haitian diaspora communities/g, `common dialectal variations of ${langName}`);
    
  return content;
}

// Process each language
Object.keys(languages).forEach(langKey => {
  const langConfig = languages[langKey];
  const targetDir = `/home/hwt/translation-low-source/frontend/app/[locale]/${langKey}`;
  
  console.log(`Processing ${langKey}...`);
  
  // Generate and write page.tsx
  const pageContent = generatePageContent(langKey, langConfig);
  fs.writeFileSync(path.join(targetDir, 'page.tsx'), pageContent);
  
  // Generate and write client.tsx
  const clientContent = generateClientContent(langKey, langConfig);
  fs.writeFileSync(path.join(targetDir, 'client.tsx'), clientContent);
  
  console.log(`✅ Updated ${langKey}`);
});

console.log('\n🎉 All english-to-xxx pages have been synchronized with creole-to-english template!');
console.log('\nUpdated pages:');
Object.keys(languages).forEach(langKey => {
  console.log(`- ${langKey}`);
});
