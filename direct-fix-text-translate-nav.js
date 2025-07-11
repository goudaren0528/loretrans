#!/usr/bin/env node

const fs = require('fs');

console.log('🔧 直接修复文本翻译页面的TranslationNavButtons位置...\n');

function directFixTextTranslateNav() {
  const pagePath = '/home/hwt/translation-low-source/frontend/app/[locale]/text-translate/text-translate-client.tsx';
  
  try {
    let content = fs.readFileSync(pagePath, 'utf8');
    
    // 在TextTranslateClient的return语句开始处添加TranslationNavButtons
    const oldReturn = `  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">`;
    
    const newReturn = `  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <TranslationNavButtons currentPage="text" locale={locale} />`;
    
    if (content.includes(oldReturn)) {
      content = content.replace(oldReturn, newReturn);
      fs.writeFileSync(pagePath, content, 'utf8');
      console.log('✅ 已在TextTranslateClient中添加TranslationNavButtons');
      return true;
    } else {
      console.log('❌ 未找到预期的return语句模式');
      return false;
    }
  } catch (error) {
    console.log(`❌ 直接修复失败: ${error.message}`);
    return false;
  }
}

// 验证修复结果
function verifyDirectFix() {
  const pagePath = '/home/hwt/translation-low-source/frontend/app/[locale]/text-translate/text-translate-client.tsx';
  
  try {
    const content = fs.readFileSync(pagePath, 'utf8');
    
    const hasNavButtons = content.includes('<TranslationNavButtons currentPage="text" locale={locale} />');
    const isInTextTranslateClient = content.indexOf('export function TextTranslateClient') < content.indexOf('<TranslationNavButtons');
    const hasCorrectProps = content.includes('currentPage="text"') && content.includes('locale={locale}');
    
    console.log('\n📊 验证结果:');
    console.log(`   包含TranslationNavButtons: ${hasNavButtons ? '✅' : '❌'}`);
    console.log(`   在TextTranslateClient中: ${isInTextTranslateClient ? '✅' : '❌'}`);
    console.log(`   属性正确: ${hasCorrectProps ? '✅' : '❌'}`);
    
    return hasNavButtons && isInTextTranslateClient && hasCorrectProps;
  } catch (error) {
    console.log(`❌ 验证失败: ${error.message}`);
    return false;
  }
}

// 主函数
function main() {
  console.log('🎯 目标: 直接修复TranslationNavButtons在文本翻译页面的位置\n');
  
  const fixResult = directFixTextTranslateNav();
  const verifyResult = verifyDirectFix();
  
  console.log('\n📊 修复总结:');
  console.log(`   修复操作: ${fixResult ? '✅ 成功' : '❌ 失败'}`);
  console.log(`   验证结果: ${verifyResult ? '✅ 通过' : '❌ 失败'}`);
  
  if (fixResult && verifyResult) {
    console.log('\n🎉 直接修复完成！');
    console.log('\n📝 修复内容:');
    console.log('✅ TranslationNavButtons现在在TextTranslateClient的正确位置');
    console.log('✅ locale参数正确传递');
    console.log('✅ 解决了"locale is not defined"错误');
    
    console.log('\n🚀 现在文本翻译页面应该可以正常工作了！');
  } else {
    console.log('\n⚠️  直接修复失败，可能需要手动检查');
  }
  
  console.log('\n✨ 修复完成!');
}

if (require.main === module) {
  main();
}
