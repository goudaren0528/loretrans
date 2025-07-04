#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 添加缺失的翻译内容...\n');

const messagesDir = path.join(__dirname, '../frontend/messages');

// 需要添加的翻译内容
const missingTranslations = {
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

// 支持的语言
const supportedLocales = ['en', 'zh', 'es', 'fr', 'ar', 'hi', 'ht', 'lo', 'my', 'pt', 'sw', 'te'];

// 为每种语言添加翻译
supportedLocales.forEach(locale => {
  const messageFile = path.join(messagesDir, `${locale}.json`);
  
  if (!fs.existsSync(messageFile)) {
    console.log(`⚠️  跳过不存在的文件: ${locale}.json`);
    return;
  }
  
  try {
    const content = fs.readFileSync(messageFile, 'utf8');
    const translations = JSON.parse(content);
    
    // 检查是否已经有这些翻译
    let hasChanges = false;
    
    Object.keys(missingTranslations).forEach(key => {
      if (!translations[key]) {
        if (locale === 'en') {
          // 英文直接使用原始翻译
          translations[key] = missingTranslations[key];
        } else {
          // 其他语言暂时使用英文，后续可以通过翻译工具更新
          translations[key] = missingTranslations[key];
        }
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      // 写回文件
      fs.writeFileSync(messageFile, JSON.stringify(translations, null, 2), 'utf8');
      console.log(`✅ 更新了 ${locale}.json`);
    } else {
      console.log(`✓ ${locale}.json 已包含所需翻译`);
    }
    
  } catch (error) {
    console.error(`❌ 处理 ${locale}.json 时出错:`, error.message);
  }
});

console.log('\n🎉 翻译内容添加完成！');
console.log('💡 提示: 非英文语言的翻译内容暂时使用英文，可以稍后通过翻译工具更新。');
