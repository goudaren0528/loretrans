#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 更新翻译文件中的年份从2024到2025...\n');

// 获取所有翻译文件
function getTranslationFiles() {
  const messagesDir = '/home/hwt/translation-low-source/frontend/messages';
  const files = fs.readdirSync(messagesDir)
    .filter(file => file.endsWith('.json'))
    .map(file => path.join(messagesDir, file));
  
  return files;
}

// 更新单个翻译文件
function updateTranslationFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let jsonData = JSON.parse(content);
    let modified = false;
    
    // 递归更新JSON对象中的2024年份
    function updateYear(obj) {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          if (obj[key].includes('2024')) {
            const oldValue = obj[key];
            obj[key] = obj[key].replace(/2024/g, '2025');
            if (obj[key] !== oldValue) {
              console.log(`   更新: "${key}": "${oldValue}" → "${obj[key]}"`);
              modified = true;
            }
          }
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          updateYear(obj[key]);
        }
      }
    }
    
    updateYear(jsonData);
    
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

// 主函数
function main() {
  console.log('🎯 目标: 更新所有翻译文件中的2024年份为2025\n');
  
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
  
  console.log('📊 更新总结:');
  console.log(`   处理的文件数: ${translationFiles.length}`);
  console.log(`   成功更新的文件数: ${updatedCount}`);
  
  if (updatedCount > 0) {
    console.log('\n🎉 翻译文件年份更新完成！');
    console.log('\n📝 更新内容:');
    console.log('✅ 版权信息中的年份: © 2024 → © 2025');
    console.log('✅ 其他包含2024的文本内容');
    
    console.log('\n🚀 建议下一步:');
    console.log('1. 重新启动开发服务以应用翻译更改');
    console.log('2. 清除浏览器缓存');
    console.log('3. 验证网页中的年份显示');
  } else {
    console.log('\n⚠️  没有翻译文件被更新');
  }
  
  console.log('\n✨ 更新完成!');
}

if (require.main === module) {
  main();
}
