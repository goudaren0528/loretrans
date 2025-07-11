#!/usr/bin/env node

const fs = require('fs');

console.log('🔧 直接修复文档翻译页面添加跳转按钮...\n');

function directFixDocumentPage() {
  const pagePath = '/home/hwt/translation-low-source/frontend/app/[locale]/document-translate/page.tsx';
  
  try {
    let content = fs.readFileSync(pagePath, 'utf8');
    
    // 直接替换特定的内容
    const oldContent = `      </div>

      {/* 文档翻译器组件 - 包含未登录用户限制 */}
      <GuestLimitGuard showStatus={false}>`;
    
    const newContent = `      </div>

      {/* 跳转到文本翻译的按钮 */}
      <TranslationNavButtons currentPage="document" locale={locale} />

      {/* 文档翻译器组件 - 包含未登录用户限制 */}
      <GuestLimitGuard showStatus={false}>`;
    
    if (content.includes(oldContent)) {
      content = content.replace(oldContent, newContent);
      fs.writeFileSync(pagePath, content, 'utf8');
      console.log('✅ 已直接修复文档翻译页面');
      return true;
    } else {
      console.log('❌ 未找到预期的内容模式');
      return false;
    }
  } catch (error) {
    console.log(`❌ 直接修复失败: ${error.message}`);
    return false;
  }
}

// 验证修复
function verifyDirectFix() {
  const pagePath = '/home/hwt/translation-low-source/frontend/app/[locale]/document-translate/page.tsx';
  
  try {
    const content = fs.readFileSync(pagePath, 'utf8');
    
    const hasTranslationNavButtons = content.includes('<TranslationNavButtons');
    const hasCorrectProps = content.includes('currentPage="document"') && content.includes('locale={locale}');
    const isBeforeGuestLimit = content.indexOf('<TranslationNavButtons') < content.indexOf('<GuestLimitGuard');
    
    console.log('\n📊 验证结果:');
    console.log(`   包含TranslationNavButtons: ${hasTranslationNavButtons ? '✅' : '❌'}`);
    console.log(`   属性正确: ${hasCorrectProps ? '✅' : '❌'}`);
    console.log(`   位置正确（在GuestLimitGuard之前）: ${isBeforeGuestLimit ? '✅' : '❌'}`);
    
    return hasTranslationNavButtons && hasCorrectProps && isBeforeGuestLimit;
  } catch (error) {
    console.log(`❌ 验证失败: ${error.message}`);
    return false;
  }
}

// 主函数
function main() {
  console.log('🎯 目标: 直接修复文档翻译页面的跳转按钮\n');
  
  const fixResult = directFixDocumentPage();
  const verifyResult = verifyDirectFix();
  
  console.log('\n📊 修复总结:');
  console.log(`   修复操作: ${fixResult ? '✅ 成功' : '❌ 失败'}`);
  console.log(`   验证结果: ${verifyResult ? '✅ 通过' : '❌ 失败'}`);
  
  if (fixResult && verifyResult) {
    console.log('\n🎉 直接修复完成！');
    console.log('\n📝 修复内容:');
    console.log('✅ 在文档翻译页面正确位置添加了TranslationNavButtons');
    console.log('✅ 组件在GuestLimitGuard之前，用户可以看到');
    console.log('✅ 传递了正确的props');
    
    console.log('\n🎨 现在两个页面的跳转按钮都已完成:');
    console.log('- 文本翻译页面: 蓝色主题，跳转到文档翻译');
    console.log('- 文档翻译页面: 绿色主题，跳转到文本翻译');
  } else {
    console.log('\n⚠️  直接修复失败，可能需要手动检查');
  }
  
  console.log('\n✨ 修复完成!');
}

if (require.main === module) {
  main();
}
