#!/usr/bin/env node

/**
 * SEO优化应用脚本
 * 用于将优化后的页面应用到实际项目中
 */

const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, 'frontend/app/[locale]');

// 要优化的页面配置
const PAGES_TO_OPTIMIZE = [
  {
    name: 'nepali-to-english',
    optimizedFile: 'nepali-to-english/page.tsx.optimized',
    targetFile: 'nepali-to-english/page.tsx'
  },
  {
    name: 'english-to-khmer', 
    optimizedFile: 'english-to-khmer/page.tsx.optimized',
    targetFile: 'english-to-khmer/page.tsx'
  }
];

function backupOriginalFile(filePath) {
  const backupPath = `${filePath}.backup.${Date.now()}`;
  if (fs.existsSync(filePath)) {
    fs.copyFileSync(filePath, backupPath);
    console.log(`✅ 已备份原文件: ${backupPath}`);
    return backupPath;
  }
  return null;
}

function applyOptimization(pageConfig) {
  const optimizedPath = path.join(FRONTEND_DIR, pageConfig.optimizedFile);
  const targetPath = path.join(FRONTEND_DIR, pageConfig.targetFile);
  
  console.log(`\n🔄 正在优化 ${pageConfig.name} 页面...`);
  
  // 检查优化文件是否存在
  if (!fs.existsSync(optimizedPath)) {
    console.error(`❌ 优化文件不存在: ${optimizedPath}`);
    return false;
  }
  
  // 备份原文件
  const backupPath = backupOriginalFile(targetPath);
  
  try {
    // 应用优化
    fs.copyFileSync(optimizedPath, targetPath);
    console.log(`✅ 已应用优化到: ${targetPath}`);
    
    // 验证文件
    const content = fs.readFileSync(targetPath, 'utf8');
    if (content.includes('generateMetadata') && content.includes('FAQ')) {
      console.log(`✅ 文件验证通过`);
      return true;
    } else {
      console.error(`❌ 文件验证失败`);
      // 恢复备份
      if (backupPath) {
        fs.copyFileSync(backupPath, targetPath);
        console.log(`🔄 已恢复原文件`);
      }
      return false;
    }
  } catch (error) {
    console.error(`❌ 应用优化失败: ${error.message}`);
    // 恢复备份
    if (backupPath) {
      fs.copyFileSync(backupPath, targetPath);
      console.log(`🔄 已恢复原文件`);
    }
    return false;
  }
}

function generateSummaryReport() {
  console.log(`\n📊 SEO优化总结报告`);
  console.log(`==========================================`);
  
  const optimizations = [
    '✅ 标题优化 - 加入动词和使用场景',
    '✅ 描述优化 - 强调免费、快速、准确',
    '✅ 关键词优化 - 覆盖热门搜索词',
    '✅ 结构化数据 - 添加FAQ Schema',
    '✅ OpenGraph优化 - 提升社交分享效果',
    '✅ 内容优化 - 添加H1、H2标题优化',
    '✅ FAQ优化 - 更好的用户体验'
  ];
  
  optimizations.forEach(item => console.log(item));
  
  console.log(`\n🎯 预期效果:`);
  console.log(`- CTR 提升: 15-25%`);
  console.log(`- 搜索排名提升`);
  console.log(`- Rich Snippets 显示`);
  console.log(`- 用户体验改善`);
  
  console.log(`\n📋 后续步骤:`);
  console.log(`1. 重启开发服务器测试`);
  console.log(`2. 使用 Google Rich Results Test 验证`);
  console.log(`3. 监控 Search Console 数据`);
  console.log(`4. 跟踪 CTR 和排名变化`);
}

function main() {
  console.log(`🚀 开始应用SEO优化...`);
  console.log(`目标页面: ${PAGES_TO_OPTIMIZE.map(p => p.name).join(', ')}`);
  
  let successCount = 0;
  
  for (const pageConfig of PAGES_TO_OPTIMIZE) {
    if (applyOptimization(pageConfig)) {
      successCount++;
    }
  }
  
  console.log(`\n📈 优化完成统计:`);
  console.log(`成功: ${successCount}/${PAGES_TO_OPTIMIZE.length} 个页面`);
  
  if (successCount === PAGES_TO_OPTIMIZE.length) {
    console.log(`🎉 所有页面优化成功！`);
    generateSummaryReport();
  } else {
    console.log(`⚠️  部分页面优化失败，请检查错误信息`);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = {
  applyOptimization,
  PAGES_TO_OPTIMIZE
};
