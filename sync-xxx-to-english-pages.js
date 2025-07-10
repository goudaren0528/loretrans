#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Language configurations
const languages = {
  'arabic-to-english': {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    direction: 'rtl'
  },
  'burmese-to-english': {
    code: 'my',
    name: 'Burmese',
    nativeName: 'မြန်မာ',
    direction: 'ltr'
  },
  'chinese-to-english': {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    direction: 'ltr'
  },
  'french-to-english': {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    direction: 'ltr'
  },
  'hindi-to-english': {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    direction: 'ltr'
  },
  'lao-to-english': {
    code: 'lo',
    name: 'Lao',
    nativeName: 'ລາວ',
    direction: 'ltr'
  },
  'portuguese-to-english': {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    direction: 'ltr'
  },
  'spanish-to-english': {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    direction: 'ltr'
  },
  'swahili-to-english': {
    code: 'sw',
    name: 'Swahili',
    nativeName: 'Kiswahili',
    direction: 'ltr'
  },
  'telugu-to-english': {
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
  
  // Replace Haitian Creole specific content with the target language
  let content = pageTemplate
    // Replace metadata
    .replace(/Haitian Creole to English Translation/g, `${langName} to English Translation`)
    .replace(/Haitian Creole \(Kreyòl Ayisyen\) to English/g, `${langName} (${langNativeName}) to English`)
    .replace(/Kreyòl Ayisyen to English/g, `${langNativeName} to English`)
    .replace(/Haitian Creole translator/g, `${langName} translator`)
    .replace(/free Haitian Creole translation/g, `free ${langName} translation`)
    .replace(/Haitian Creole English converter/g, `${langName} English converter`)
    .replace(/creole-to-english/g, langKey)
    
    // Replace page title and descriptions
    .replace(/Haitian Creole to English/g, `${langName} to English`)
    .replace(/Haitian Creole \(Kreyòl Ayisyen\)/g, `${langName} (${langNativeName})`)
    .replace(/Kreyòl Ayisyen/g, langNativeName)
    
    // Replace FAQ content
    .replace(/creoleToEnglishFAQs/g, `${langKey.replace(/-/g, '')}FAQs`)
    .replace(/How accurate is the Haitian Creole to English translation\?/g, `How accurate is the ${langName} to English translation?`)
    .replace(/Our AI-powered translator provides high-accuracy Haitian Creole to English translations/g, `Our AI-powered translator provides high-accuracy ${langName} to English translations`)
    .replace(/Can I translate English text back to Haitian Creole\?/g, `Can I translate English text back to ${langName}?`)
    .replace(/Haitian Creole-to-English and English-to-Haitian Creole/g, `${langName}-to-English and English-to-${langName}`)
    .replace(/Is the Haitian Creole to English translator free to use\?/g, `Is the ${langName} to English translator free to use?`)
    .replace(/our Haitian Creole to English translation service/g, `our ${langName} to English translation service`)
    .replace(/How long can the text be for Haitian Creole to English translation\?/g, `How long can the text be for ${langName} to English translation?`)
    .replace(/Can I use this for business Haitian Creole to English translation\?/g, `Can I use this for business ${langName} to English translation?`)
    .replace(/Does the translator support Haitian Creole script properly\?/g, `Does the translator support ${langName} script properly?`)
    .replace(/our translator fully supports the Haitian Creole script \(Kreyòl Ayisyen\)/g, `our translator fully supports the ${langName} script (${langNativeName})`)
    .replace(/the unique characteristics of the Haitian Creole writing system/g, `the unique characteristics of the ${langName} writing system`)
    
    // Replace component props
    .replace(/defaultSourceLang="ht"/g, `defaultSourceLang="${langCode}"`)
    
    // Replace about section
    .replace(/About the Haitian Creole Language/g, `About the ${langName} Language`)
    .replace(/Haitian Creole \(Kreyòl Ayisyen\) is a widely spoken language/g, `${langName} (${langNativeName}) is a widely spoken language`)
    .replace(/Our AI translator respects these linguistic characteristics to provide accurate Haitian Creole to English translations/g, `Our AI translator respects these linguistic characteristics to provide accurate ${langName} to English translations`)
    .replace(/translating Haitian Creole documents/g, `translating ${langName} documents`)
    
    // Replace structured data
    .replace(/Haitian Creole to English Translator/g, `${langName} to English Translator`)
    .replace(/Free AI-powered Haitian Creole to English translation tool/g, `Free AI-powered ${langName} to English translation tool`)
    
    // Replace language info section
    .replace(/Language:<\/span>\s*<span className="font-medium">Haitian Creole<\/span>/g, `Language:</span>\n                      <span className="font-medium">${langName}</span>`)
    .replace(/Native Name:<\/span>\s*<span className="font-medium">Kreyòl Ayisyen<\/span>/g, `Native Name:</span>\n                      <span className="font-medium">${langNativeName}</span>`)
    .replace(/Code:<\/span>\s*<span className="font-medium">ht<\/span>/g, `Code:</span>\n                      <span className="font-medium">${langCode}</span>`)
    
    // Replace function name
    .replace(/export default function HaitianCreoleToEnglishPage\(\)/g, `export default function ${langName.replace(/\s+/g, '')}ToEnglishPage()`)
    
    // Replace FAQ section title
    .replace(/Everything you need to know about our Haitian Creole to English translator/g, `Everything you need to know about our ${langName} to English translator`);
    
  return content;
}

function generateClientContent(langKey, langConfig) {
  const langName = langConfig.name;
  const langNativeName = langConfig.nativeName;
  const langCode = langConfig.code;
  
  // Replace Haitian Creole specific content with the target language
  let content = clientTemplate
    .replace(/creoleExamples/g, `${langKey.replace(/-/g, '')}Examples`)
    .replace(/creoleFAQ/g, `${langKey.replace(/-/g, '')}FAQ`)
    .replace(/defaultSourceLang="ht"/g, `defaultSourceLang="${langCode}"`)
    .replace(/Is this Haitian Creole translator accurate\?/g, `Is this ${langName} translator accurate?`)
    .replace(/Our translator uses Meta's NLLB AI model, specifically trained on Haitian Creole \(Kreyòl Ayisyen\)/g, `Our translator uses Meta's NLLB AI model, specifically trained on ${langName} (${langNativeName})`)
    .replace(/significantly better accuracy than traditional translation services for Creole text/g, `significantly better accuracy than traditional translation services for ${langName} text`)
    .replace(/Can I translate documents from Creole to English\?/g, `Can I translate documents from ${langName} to English?`)
    .replace(/Upload your Haitian Creole document and get an English translation/g, `Upload your ${langName} document and get an English translation`)
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

console.log('\n🎉 All xxx-to-english pages have been synchronized with creole-to-english template!');
console.log('\nUpdated pages:');
Object.keys(languages).forEach(langKey => {
  console.log(`- ${langKey}`);
});
