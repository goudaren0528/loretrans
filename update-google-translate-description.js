#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 更新Google Translate的描述表达...\n');

// 获取所有翻译文件
function getTranslationFiles() {
  const messagesDir = '/home/hwt/translation-low-source/frontend/messages';
  const files = fs.readdirSync(messagesDir)
    .filter(file => file.endsWith('.json'))
    .map(file => path.join(messagesDir, file));
  
  return files;
}

// 语言对应的新描述
const newDescriptions = {
  'en': 'Limited support for low-resource languages',
  'zh': '对低资源语言支持有限',
  'es': 'Soporte limitado para idiomas de bajos recursos',
  'fr': 'Support limité pour les langues à faibles ressources',
  'pt': 'Suporte limitado para idiomas de baixos recursos',
  'ar': 'دعم محدود للغات ذات الموارد المحدودة',
  'hi': 'कम संसाधन भाषाओं के लिए सीमित समर्थन',
  'lo': 'ການສະຫນັບສະຫນູນທີ່ຈຳກັດສຳລັບພາສາທີ່ມີຊັບພະຍາກອນຕ່ຳ',
  'ht': 'Sipò limite pou lang ki gen resous limite yo',
  'sw': 'Msaada mdogo kwa lugha za rasilimali chache',
  'my': 'အရင်းအမြစ်နည်းသောဘာသာစကားများအတွက် ကန့်သတ်ထားသောပံ့ပိုးမှု',
  'te': 'తక్కువ వనరుల భాషలకు పరిమిత మద్దతు'
};

// 更新单个翻译文件
function updateTranslationFile(filePath) {
  try {
    const fileName = path.basename(filePath, '.json');
    const content = fs.readFileSync(filePath, 'utf8');
    let jsonData = JSON.parse(content);
    let modified = false;
    
    // 检查并更新Google Translate的描述
    if (jsonData.HomePage && 
        jsonData.HomePage.hero && 
        jsonData.HomePage.hero.comparison && 
        jsonData.HomePage.hero.comparison.google) {
      
      const oldDescription = jsonData.HomePage.hero.comparison.google.description;
      const newDescription = newDescriptions[fileName] || newDescriptions['en'];
      
      if (oldDescription !== newDescription) {
        jsonData.HomePage.hero.comparison.google.description = newDescription;
        console.log(`   更新 ${fileName}: "${oldDescription}" → "${newDescription}"`);
        modified = true;
      }
    }
    
    // 检查其他可能的Google Translate引用
    function updateGoogleReferences(obj, path = '') {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          // 查找包含"No low-resource language support"或类似表达的文本
          if (obj[key].includes('No low-resource language support') ||
              obj[key].includes('不支持低资源语言') ||
              obj[key].includes('No soporte para idiomas') ||
              obj[key].includes('Pas de support pour les langues') ||
              obj[key].includes('Nenhum suporte para idiomas')) {
            
            const oldValue = obj[key];
            const newValue = newDescriptions[fileName] || newDescriptions['en'];
            obj[key] = newValue;
            console.log(`   更新其他引用 ${fileName}[${path}.${key}]: "${oldValue}" → "${newValue}"`);
            modified = true;
          }
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          updateGoogleReferences(obj[key], path ? `${path}.${key}` : key);
        }
      }
    }
    
    updateGoogleReferences(jsonData);
    
    if (modified) {
      fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf8');
      return true;
    }
    
    return false;
    
  } catch (error) {
    console.log(`❌ 更新文件失败: ${path.basename(filePath)} - ${error.message}`);
    return false;
  }
}

// 检查是否还有其他需要更新的地方
function checkOtherFiles() {
  console.log('\n🔍 检查其他可能需要更新的文件...\n');
  
  const filesToCheck = [
    '/home/hwt/translation-low-source/frontend/app/[locale]/page.tsx',
    '/home/hwt/translation-low-source/frontend/components/hero-section.tsx',
    '/home/hwt/translation-low-source/frontend/components/comparison-section.tsx'
  ];
  
  const foundFiles = [];
  
  filesToCheck.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('No low-resource language support') ||
            content.includes('Google Translate') && content.includes('不支持')) {
          foundFiles.push(filePath);
        }
      } catch (error) {
        // 忽略读取错误
      }
    }
  });
  
  if (foundFiles.length > 0) {
    console.log('📋 发现其他可能需要更新的文件:');
    foundFiles.forEach(file => {
      console.log(`   ${file.replace('/home/hwt/translation-low-source/', '')}`);
    });
  } else {
    console.log('✅ 未发现其他需要更新的文件');
  }
  
  return foundFiles;
}

// 验证更新结果
function verifyUpdates() {
  console.log('\n🔍 验证更新结果...\n');
  
  const translationFiles = getTranslationFiles();
  let allUpdated = true;
  
  translationFiles.forEach(filePath => {
    const fileName = path.basename(filePath, '.json');
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const jsonData = JSON.parse(content);
      
      console.log(`📁 检查: ${fileName}.json`);
      
      if (jsonData.HomePage && 
          jsonData.HomePage.hero && 
          jsonData.HomePage.hero.comparison && 
          jsonData.HomePage.hero.comparison.google) {
        
        const currentDescription = jsonData.HomePage.hero.comparison.google.description;
        const expectedDescription = newDescriptions[fileName] || newDescriptions['en'];
        
        if (currentDescription === expectedDescription) {
          console.log(`   ✅ 已正确更新: "${currentDescription}"`);
        } else {
          console.log(`   ❌ 更新不完整: "${currentDescription}"`);
          allUpdated = false;
        }
      } else {
        console.log(`   ⚠️  未找到Google Translate比较部分`);
      }
      
    } catch (error) {
      console.log(`   ❌ 验证失败: ${error.message}`);
      allUpdated = false;
    }
    
    console.log('');
  });
  
  return allUpdated;
}

// 主函数
function main() {
  console.log('🎯 目标: 将Google Translate的描述从"不支持"改为"对低资源语言支持有限"\n');
  
  const translationFiles = getTranslationFiles();
  let updatedCount = 0;
  
  console.log(`📋 找到 ${translationFiles.length} 个翻译文件\n`);
  
  translationFiles.forEach(filePath => {
    const fileName = path.basename(filePath);
    console.log(`📝 处理: ${fileName}`);
    
    if (updateTranslationFile(filePath)) {
      console.log(`✅ 已更新: ${fileName}`);
      updatedCount++;
    } else {
      console.log(`⚠️  无需更新: ${fileName}`);
    }
    
    console.log('');
  });
  
  // 检查其他文件
  const otherFiles = checkOtherFiles();
  
  // 验证更新结果
  const allVerified = verifyUpdates();
  
  console.log('📊 更新总结:');
  console.log(`   处理的文件数: ${translationFiles.length}`);
  console.log(`   成功更新的文件数: ${updatedCount}`);
  console.log(`   发现的其他文件: ${otherFiles.length}`);
  console.log(`   验证结果: ${allVerified ? '✅ 成功' : '❌ 需要检查'}`);
  
  if (updatedCount > 0) {
    console.log('\n🎉 Google Translate描述更新完成！');
    console.log('\n📝 更新内容:');
    console.log('✅ 英语: "No low-resource language support" → "Limited support for low-resource languages"');
    console.log('✅ 中文: "不支持低资源语言" → "对低资源语言支持有限"');
    console.log('✅ 其他语言的相应翻译也已更新');
    
    console.log('\n🚀 建议下一步:');
    console.log('1. 重新启动开发服务以应用更改');
    console.log('2. 检查主页HERO部分的显示');
    console.log('3. 验证多语言版本的表达');
  } else {
    console.log('\n⚠️  没有翻译文件被更新');
  }
  
  console.log('\n✨ 更新完成!');
}

if (require.main === module) {
  main();
}
