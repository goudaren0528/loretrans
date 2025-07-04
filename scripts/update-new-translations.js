#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔄 更新新添加页面的翻译内容...\n');

const messagesDir = path.join(__dirname, '../frontend/messages');

// 需要翻译的新内容 (英文原文)
const newTranslations = {
  "NotFound": {
    "title": "Page Not Found",
    "description": "The page you are looking for doesn't exist or has been moved.",
    "goHome": "Go Home",
    "contactSupport": "Contact Support"
  },
  "Error": {
    "title": "Something went wrong!",
    "description": "An unexpected error occurred. Please try again.",
    "errorDetails": "Error Details (Development)",
    "tryAgain": "Try Again",
    "goHome": "Go Home",
    "contactSupport": "Contact Support"
  },
  "Admin": {
    "dashboard": {
      "title": "Admin Dashboard",
      "description": "Manage your application settings and monitor system status."
    }
  }
};

// 语言映射到NLLB代码
const NLLB_LANGUAGE_MAP = {
  'zh': 'zho_Hans', // Chinese (Simplified)
  'es': 'spa_Latn', // Spanish
  'fr': 'fra_Latn', // French
  'ar': 'arb_Arab', // Arabic
  'hi': 'hin_Deva', // Hindi
  'ht': 'hat_Latn', // Haitian Creole
  'lo': 'lao_Laoo', // Lao
  'sw': 'swh_Latn', // Swahili
  'my': 'mya_Mymr', // Burmese
  'te': 'tel_Telu', // Telugu
  'pt': 'por_Latn', // Portuguese
};

// 翻译函数
async function translateText(text, targetLang) {
  const nllbUrl = 'https://wane0528-my-nllb-api.hf.space/api/v4/translator';
  const nllbTargetLang = NLLB_LANGUAGE_MAP[targetLang];
  
  if (!nllbTargetLang) {
    console.log(`⚠️  不支持的语言: ${targetLang}`);
    return text;
  }
  
  try {
    const response = await fetch(nllbUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        source_language: 'eng_Latn',
        target_language: nllbTargetLang,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const result = await response.json();
    return result.translated_text || text;
  } catch (error) {
    console.log(`❌ 翻译失败 "${text}" -> ${targetLang}: ${error.message}`);
    return text;
  }
}

// 递归翻译对象
async function translateObject(obj, targetLang, path = '') {
  const result = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key;
    
    if (typeof value === 'string') {
      console.log(`  🔄 翻译: "${value}" (${currentPath})`);
      const translated = await translateText(value, targetLang);
      console.log(`    ✅ 结果: "${translated}"`);
      result[key] = translated;
      
      // 添加延迟避免API限制
      await new Promise(resolve => setTimeout(resolve, 500));
    } else if (typeof value === 'object' && value !== null) {
      result[key] = await translateObject(value, targetLang, currentPath);
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

// 主函数
async function updateNewTranslations() {
  const supportedLocales = Object.keys(NLLB_LANGUAGE_MAP);
  
  for (const locale of supportedLocales) {
    console.log(`\n🌍 更新 ${locale} 语言翻译...`);
    
    const messageFile = path.join(messagesDir, `${locale}.json`);
    
    if (!fs.existsSync(messageFile)) {
      console.log(`⚠️  跳过不存在的文件: ${locale}.json`);
      continue;
    }
    
    try {
      const content = fs.readFileSync(messageFile, 'utf8');
      const translations = JSON.parse(content);
      
      // 检查是否需要更新
      let needsUpdate = false;
      for (const [section, sectionContent] of Object.entries(newTranslations)) {
        if (translations[section]) {
          // 检查是否还是英文内容
          const currentContent = JSON.stringify(translations[section]);
          const englishContent = JSON.stringify(sectionContent);
          if (currentContent === englishContent) {
            needsUpdate = true;
            break;
          }
        }
      }
      
      if (!needsUpdate) {
        console.log(`✅ ${locale} 翻译已更新，跳过`);
        continue;
      }
      
      // 翻译新内容
      const translatedContent = await translateObject(newTranslations, locale);
      
      // 更新翻译文件
      Object.assign(translations, translatedContent);
      
      // 写回文件
      fs.writeFileSync(messageFile, JSON.stringify(translations, null, 2), 'utf8');
      console.log(`✅ 已更新 ${locale}.json`);
      
    } catch (error) {
      console.error(`❌ 处理 ${locale}.json 时出错:`, error.message);
    }
  }
}

// 运行更新
updateNewTranslations().then(() => {
  console.log('\n🎉 新翻译内容更新完成！');
}).catch(error => {
  console.error('❌ 更新过程中出错:', error);
  process.exit(1);
});
