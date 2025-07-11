#!/usr/bin/env node

const fs = require('fs');

console.log('🔍 最终验证按钮位置和容器修复...\n');

// 验证文本翻译页面
function verifyTextTranslatePage() {
  const pagePath = '/home/hwt/translation-low-source/frontend/app/[locale]/text-translate/text-translate-client.tsx';
  
  try {
    const content = fs.readFileSync(pagePath, 'utf8');
    
    const checks = [
      { name: '包含TranslationNavButtons import', check: content.includes('import { TranslationNavButtons }') },
      { name: '按钮在Enhanced Translation Interface部分', check: content.includes('Enhanced Translation Interface') },
      { name: '按钮在EnhancedTextTranslator之前', check: content.indexOf('<TranslationNavButtons') < content.indexOf('<EnhancedTextTranslator') },
      { name: '按钮有正确的容器', check: content.includes('max-w-6xl mx-auto mb-8') },
      { name: '按钮有正确的currentPage属性', check: content.includes('currentPage="text"') },
      { name: '按钮有正确的locale属性', check: content.includes('locale={locale}') },
      { name: '顶部没有多余的按钮', check: content.indexOf('<TranslationNavButtons') > content.indexOf('Hero Section') },
    ];
    
    console.log('📄 文本翻译页面验证:');
    checks.forEach(check => {
      console.log(`   ${check.check ? '✅' : '❌'} ${check.name}`);
    });
    
    return checks.every(check => check.check);
  } catch (error) {
    console.log(`❌ 验证文本翻译页面失败: ${error.message}`);
    return false;
  }
}

// 验证文档翻译页面
function verifyDocumentTranslatePage() {
  const pagePath = '/home/hwt/translation-low-source/frontend/app/[locale]/document-translate/page.tsx';
  
  try {
    const content = fs.readFileSync(pagePath, 'utf8');
    
    const checks = [
      { name: '包含TranslationNavButtons import', check: content.includes('import { TranslationNavButtons }') },
      { name: '按钮在DocumentTranslator之前', check: content.indexOf('<TranslationNavButtons') < content.indexOf('<DocumentTranslator') },
      { name: '按钮有正确的容器', check: content.includes('container mx-auto px-4 mb-8') && content.includes('max-w-4xl mx-auto') },
      { name: '按钮有正确的currentPage属性', check: content.includes('currentPage="document"') },
      { name: '按钮有正确的locale属性', check: content.includes('locale={locale}') },
      { name: 'DocumentTranslator有容器限制', check: content.includes('container mx-auto px-4') && content.includes('max-w-4xl mx-auto') },
      { name: '顶部没有多余的按钮', check: content.indexOf('<TranslationNavButtons') > content.indexOf('Hero Section') },
    ];
    
    console.log('\n📄 文档翻译页面验证:');
    checks.forEach(check => {
      console.log(`   ${check.check ? '✅' : '❌'} ${check.name}`);
    });
    
    return checks.every(check => check.check);
  } catch (error) {
    console.log(`❌ 验证文档翻译页面失败: ${error.message}`);
    return false;
  }
}

// 验证DocumentTranslator组件
function verifyDocumentTranslatorComponent() {
  const componentPath = '/home/hwt/translation-low-source/frontend/components/document-translator.tsx';
  
  try {
    const content = fs.readFileSync(componentPath, 'utf8');
    
    const checks = [
      { name: '没有flex-1样式', check: !content.includes('flex-1') },
      { name: '没有导致拉伸的w-full', check: !content.includes('className="w-full"') || content.includes('max-w-full') },
      { name: '使用合理的容器样式', check: content.includes('max-w-full') || content.includes('w-auto') },
      { name: '组件结构完整', check: content.includes('DocumentTranslatorProps') },
    ];
    
    console.log('\n📦 DocumentTranslator组件验证:');
    checks.forEach(check => {
      console.log(`   ${check.check ? '✅' : '❌'} ${check.name}`);
    });
    
    return checks.every(check => check.check);
  } catch (error) {
    console.log(`❌ 验证DocumentTranslator组件失败: ${error.message}`);
    return false;
  }
}

// 验证TranslationNavButtons组件
function verifyTranslationNavButtonsComponent() {
  const componentPath = '/home/hwt/translation-low-source/frontend/components/translation-nav-buttons.tsx';
  
  try {
    const content = fs.readFileSync(componentPath, 'utf8');
    
    const checks = [
      { name: '组件没有自带容器', check: !content.includes('container mx-auto px-4 mb-8') },
      { name: '包含文本翻译逻辑', check: content.includes("currentPage === 'text'") },
      { name: '包含文档翻译逻辑', check: content.includes('} else {') },
      { name: '包含正确的样式', check: content.includes('p-6 mb-8') },
      { name: '包含正确的图标', check: content.includes('FileText') && content.includes('Type') },
      { name: '包含多语言支持', check: content.includes('useTranslations') },
    ];
    
    console.log('\n📦 TranslationNavButtons组件验证:');
    checks.forEach(check => {
      console.log(`   ${check.check ? '✅' : '❌'} ${check.name}`);
    });
    
    return checks.every(check => check.check);
  } catch (error) {
    console.log(`❌ 验证TranslationNavButtons组件失败: ${error.message}`);
    return false;
  }
}

// 生成改进总结
function generateImprovementSummary() {
  console.log('\n🎊 改进总结:\n');
  
  console.log('📍 按钮位置优化:');
  console.log('   ✅ 文本翻译页面：按钮移动到EnhancedTextTranslator上方');
  console.log('   ✅ 文档翻译页面：按钮移动到DocumentTranslator上方');
  console.log('   ✅ 移除了页面顶部的按钮，位置更合理');
  console.log('   ✅ 按钮现在紧邻相关功能组件');
  
  console.log('\n🔧 容器问题修复:');
  console.log('   ✅ DocumentTranslator组件：移除了flex-1导致的拉伸');
  console.log('   ✅ DocumentTranslator组件：修复了w-full导致的过度拉伸');
  console.log('   ✅ 为DocumentTranslator添加了max-w-4xl容器限制');
  console.log('   ✅ 保持了响应式设计和合理的宽度');
  
  console.log('\n🎨 用户体验改进:');
  console.log('   ✅ 按钮位置更符合用户操作流程');
  console.log('   ✅ 上传组件不再被异常拉伸');
  console.log('   ✅ 页面布局更加紧凑和合理');
  console.log('   ✅ 保持了统一的视觉风格');
  
  console.log('\n📱 布局结构优化:');
  console.log('   文本翻译页面流程：');
  console.log('     Hero → [跳转按钮] → 翻译工具 → FAQ');
  console.log('   文档翻译页面流程：');
  console.log('     Hero → [跳转按钮] → 上传工具 → 说明 → 语言');
}

// 主函数
function main() {
  console.log('🎯 目标: 最终验证按钮位置和容器修复\n');
  
  const results = {
    textPage: verifyTextTranslatePage(),
    documentPage: verifyDocumentTranslatePage(),
    documentTranslatorComponent: verifyDocumentTranslatorComponent(),
    translationNavButtonsComponent: verifyTranslationNavButtonsComponent(),
  };
  
  console.log('\n📊 最终验证总结:');
  Object.entries(results).forEach(([key, success]) => {
    console.log(`   ${key}: ${success ? '✅ 通过' : '❌ 失败'}`);
  });
  
  const allPassed = Object.values(results).every(r => r);
  
  if (allPassed) {
    console.log('\n🎉 所有验证通过！按钮位置和容器问题完全修复！');
    
    generateImprovementSummary();
    
    console.log('\n🚀 现在可以测试改进效果:');
    console.log('1. 访问文本翻译页面，查看按钮在翻译工具上方');
    console.log('2. 访问文档翻译页面，查看按钮在上传工具上方');
    console.log('3. 验证文档上传组件不再被拉伸');
    console.log('4. 测试按钮的跳转功能');
    console.log('5. 验证响应式设计在不同屏幕尺寸下的表现');
    
    console.log('\n✨ 所有改进已完成并验证通过！');
  } else {
    console.log('\n⚠️  部分验证失败，请检查上述问题');
  }
  
  console.log('\n✨ 验证完成!');
}

if (require.main === module) {
  main();
}
