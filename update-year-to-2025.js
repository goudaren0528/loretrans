#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 更新年份从2024到2025...\n');

// 需要更新的文件列表
const filesToUpdate = [
  {
    path: '/home/hwt/translation-low-source/frontend/components/structured-data.tsx',
    description: '结构化数据中的foundingDate'
  },
  {
    path: '/home/hwt/translation-low-source/frontend/components/navigation.tsx',
    description: 'Footer中的版权年份'
  }
];

// 更新单个文件
function updateFile(filePath, description) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // 更新foundingDate
    if (content.includes('"foundingDate": "2024"')) {
      content = content.replace('"foundingDate": "2024"', '"foundingDate": "2025"');
      modified = true;
      console.log(`✅ 更新foundingDate: 2024 → 2025`);
    }
    
    // 更新版权年份
    if (content.includes('© 2024 Loretrans. All rights reserved.')) {
      content = content.replace('© 2024 Loretrans. All rights reserved.', '© 2025 Loretrans. All rights reserved.');
      modified = true;
      console.log(`✅ 更新版权年份: © 2024 → © 2025`);
    }
    
    // 更新其他可能的2024年份格式
    if (content.includes('&copy; 2024 Loretrans')) {
      content = content.replace('&copy; 2024 Loretrans', '&copy; 2025 Loretrans');
      modified = true;
      console.log(`✅ 更新HTML版权年份: &copy; 2024 → &copy; 2025`);
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`📝 已更新文件: ${description}`);
      return true;
    } else {
      console.log(`⚠️  文件中未找到需要更新的2024年份: ${description}`);
      return false;
    }
    
  } catch (error) {
    console.log(`❌ 更新文件失败: ${description} - ${error.message}`);
    return false;
  }
}

// 检查是否还有其他包含2024的文件需要更新
function findOther2024References() {
  console.log('\n🔍 检查是否还有其他需要更新的2024年份引用...\n');
  
  const searchPaths = [
    '/home/hwt/translation-low-source/frontend/components',
    '/home/hwt/translation-low-source/frontend/app',
    '/home/hwt/translation-low-source/config'
  ];
  
  const potentialFiles = [];
  
  searchPaths.forEach(searchPath => {
    try {
      const files = getAllFiles(searchPath, ['.tsx', '.ts', '.js']);
      
      files.forEach(file => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          
          // 检查可能需要更新的2024引用（排除构建文件）
          if (content.includes('2024') && 
              !file.includes('.next/') && 
              !file.includes('node_modules/') &&
              (content.includes('copyright') || 
               content.includes('Copyright') || 
               content.includes('©') || 
               content.includes('&copy;') ||
               content.includes('foundingDate') ||
               content.includes('established') ||
               content.includes('since'))) {
            
            potentialFiles.push({
              file: file.replace('/home/hwt/translation-low-source/', ''),
              matches: content.match(/2024[^0-9]/g) || []
            });
          }
        } catch (err) {
          // 忽略读取错误
        }
      });
    } catch (err) {
      console.log(`⚠️  无法搜索目录: ${searchPath}`);
    }
  });
  
  if (potentialFiles.length > 0) {
    console.log('📋 发现其他可能需要更新的文件:');
    potentialFiles.forEach(item => {
      console.log(`   ${item.file} (${item.matches.length} 个匹配)`);
    });
  } else {
    console.log('✅ 未发现其他需要更新的2024年份引用');
  }
  
  return potentialFiles;
}

// 递归获取所有文件
function getAllFiles(dir, extensions) {
  let results = [];
  
  try {
    const list = fs.readdirSync(dir);
    
    list.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat && stat.isDirectory()) {
        results = results.concat(getAllFiles(filePath, extensions));
      } else {
        if (extensions.some(ext => file.endsWith(ext))) {
          results.push(filePath);
        }
      }
    });
  } catch (err) {
    // 忽略目录访问错误
  }
  
  return results;
}

// 验证更新结果
function verifyUpdates() {
  console.log('\n🔍 验证更新结果...\n');
  
  filesToUpdate.forEach(fileInfo => {
    try {
      const content = fs.readFileSync(fileInfo.path, 'utf8');
      
      console.log(`📁 检查: ${fileInfo.description}`);
      
      // 检查是否还有2024
      if (content.includes('"foundingDate": "2024"') || 
          content.includes('© 2024 Loretrans') ||
          content.includes('&copy; 2024 Loretrans')) {
        console.log(`   ❌ 仍然包含2024年份`);
      } else {
        console.log(`   ✅ 已成功更新为2025`);
      }
      
      // 检查是否包含2025
      if (content.includes('"foundingDate": "2025"') || 
          content.includes('© 2025 Loretrans') ||
          content.includes('&copy; 2025 Loretrans')) {
        console.log(`   ✅ 确认包含2025年份`);
      }
      
    } catch (error) {
      console.log(`   ❌ 验证失败: ${error.message}`);
    }
    
    console.log('');
  });
}

// 主函数
function main() {
  console.log('🎯 目标: 将网页元数据和footer中的2024年份更新为2025\n');
  
  let updatedCount = 0;
  
  // 更新指定文件
  filesToUpdate.forEach(fileInfo => {
    console.log(`📝 处理: ${fileInfo.description}`);
    if (updateFile(fileInfo.path, fileInfo.description)) {
      updatedCount++;
    }
    console.log('');
  });
  
  // 查找其他可能需要更新的文件
  const otherFiles = findOther2024References();
  
  // 验证更新结果
  verifyUpdates();
  
  console.log('📊 更新总结:');
  console.log(`   处理的文件数: ${filesToUpdate.length}`);
  console.log(`   成功更新的文件数: ${updatedCount}`);
  console.log(`   发现的其他潜在文件: ${otherFiles.length}`);
  
  if (updatedCount > 0) {
    console.log('\n🎉 年份更新完成！');
    console.log('\n📝 更新内容:');
    console.log('✅ 结构化数据中的foundingDate: 2024 → 2025');
    console.log('✅ Footer版权年份: © 2024 → © 2025');
    
    console.log('\n🚀 建议下一步:');
    console.log('1. 清除构建缓存: rm -rf frontend/.next');
    console.log('2. 重新构建项目以应用更改');
    console.log('3. 检查网页源代码确认更新生效');
    console.log('4. 验证结构化数据中的foundingDate');
  } else {
    console.log('\n⚠️  没有文件被更新，可能年份已经是最新的');
  }
  
  console.log('\n✨ 更新完成!');
}

if (require.main === module) {
  main();
}
