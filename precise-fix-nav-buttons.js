#!/usr/bin/env node

const fs = require('fs');

console.log('🔧 精确修复按钮位置和容器问题...\n');

// 修复文本翻译页面的按钮位置
function fixTextTranslateButtonPosition() {
  const pagePath = '/home/hwt/translation-low-source/frontend/app/[locale]/text-translate/text-translate-client.tsx';
  
  try {
    let content = fs.readFileSync(pagePath, 'utf8');
    
    // 在EnhancedTextTranslator之前添加按钮
    const oldSection = `      {/* Enhanced Translation Interface */}
      <section className="relative py-8">
        <div className="container mx-auto px-4">
          <EnhancedTextTranslator className="mx-auto max-w-6xl" />`;
    
    const newSection = `      {/* Enhanced Translation Interface */}
      <section className="relative py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto mb-8">
            <TranslationNavButtons currentPage="text" locale={locale} />
          </div>
          <EnhancedTextTranslator className="mx-auto max-w-6xl" />`;
    
    if (content.includes(oldSection)) {
      content = content.replace(oldSection, newSection);
      fs.writeFileSync(pagePath, content, 'utf8');
      console.log('✅ 已修复文本翻译页面的按钮位置');
      return true;
    } else {
      console.log('⚠️  文本翻译页面的目标结构未找到');
      return false;
    }
  } catch (error) {
    console.log(`❌ 修复文本翻译页面失败: ${error.message}`);
    return false;
  }
}

// 修复文档翻译页面的按钮位置
function fixDocumentTranslateButtonPosition() {
  const pagePath = '/home/hwt/translation-low-source/frontend/app/[locale]/document-translate/page.tsx';
  
  try {
    let content = fs.readFileSync(pagePath, 'utf8');
    
    // 在DocumentTranslator之前添加按钮
    const oldSection = `      {/* 文档翻译器组件 - 包含未登录用户限制 */}
      <GuestLimitGuard showStatus={false}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <DocumentTranslator />
          </div>
        </div>
      </GuestLimitGuard>`;
    
    const newSection = `      {/* 跳转到文本翻译的按钮 */}
      <div className="container mx-auto px-4 mb-8">
        <div className="max-w-4xl mx-auto">
          <TranslationNavButtons currentPage="document" locale={locale} />
        </div>
      </div>

      {/* 文档翻译器组件 - 包含未登录用户限制 */}
      <GuestLimitGuard showStatus={false}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <DocumentTranslator />
          </div>
        </div>
      </GuestLimitGuard>`;
    
    if (content.includes(oldSection)) {
      content = content.replace(oldSection, newSection);
      fs.writeFileSync(pagePath, content, 'utf8');
      console.log('✅ 已修复文档翻译页面的按钮位置');
      return true;
    } else {
      console.log('⚠️  文档翻译页面的目标结构未找到，尝试其他方法');
      
      // 尝试另一种方法
      const altOldSection = `      {/* 文档翻译器组件 - 包含未登录用户限制 */}
      <GuestLimitGuard showStatus={false}>
        <DocumentTranslator />
      </GuestLimitGuard>`;
      
      const altNewSection = `      {/* 跳转到文本翻译的按钮 */}
      <div className="container mx-auto px-4 mb-8">
        <div className="max-w-4xl mx-auto">
          <TranslationNavButtons currentPage="document" locale={locale} />
        </div>
      </div>

      {/* 文档翻译器组件 - 包含未登录用户限制 */}
      <GuestLimitGuard showStatus={false}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <DocumentTranslator />
          </div>
        </div>
      </GuestLimitGuard>`;
      
      if (content.includes(altOldSection)) {
        content = content.replace(altOldSection, altNewSection);
        fs.writeFileSync(pagePath, content, 'utf8');
        console.log('✅ 已修复文档翻译页面的按钮位置（备选方法）');
        return true;
      }
      
      return false;
    }
  } catch (error) {
    console.log(`❌ 修复文档翻译页面失败: ${error.message}`);
    return false;
  }
}

// 修复DocumentTranslator组件的容器问题
function fixDocumentTranslatorContainer() {
  const componentPath = '/home/hwt/translation-low-source/frontend/components/document-translator.tsx';
  
  try {
    let content = fs.readFileSync(componentPath, 'utf8');
    
    // 替换有问题的flex-1样式
    content = content.replace(/className="flex-1"/g, 'className="flex-shrink-0"');
    
    // 替换有问题的w-full样式（在特定上下文中）
    content = content.replace(
      /className="w-full"/g, 
      'className="w-auto max-w-full"'
    );
    
    fs.writeFileSync(componentPath, content, 'utf8');
    console.log('✅ 已修复DocumentTranslator组件的容器样式');
    return true;
  } catch (error) {
    console.log(`❌ 修复DocumentTranslator组件失败: ${error.message}`);
    return false;
  }
}

// 验证修复结果
function verifyFixes() {
  const textPagePath = '/home/hwt/translation-low-source/frontend/app/[locale]/text-translate/text-translate-client.tsx';
  const documentPagePath = '/home/hwt/translation-low-source/frontend/app/[locale]/document-translate/page.tsx';
  const componentPath = '/home/hwt/translation-low-source/frontend/components/document-translator.tsx';
  
  try {
    const textContent = fs.readFileSync(textPagePath, 'utf8');
    const documentContent = fs.readFileSync(documentPagePath, 'utf8');
    const componentContent = fs.readFileSync(componentPath, 'utf8');
    
    const checks = [
      { 
        name: '文本翻译页面：按钮在EnhancedTextTranslator之前', 
        check: textContent.includes('<TranslationNavButtons currentPage="text"') &&
               textContent.indexOf('<TranslationNavButtons') < textContent.indexOf('<EnhancedTextTranslator')
      },
      { 
        name: '文档翻译页面：按钮在DocumentTranslator之前', 
        check: documentContent.includes('<TranslationNavButtons currentPage="document"') &&
               documentContent.indexOf('<TranslationNavButtons') < documentContent.indexOf('<DocumentTranslator')
      },
      { 
        name: '文档翻译页面：DocumentTranslator有容器', 
        check: documentContent.includes('container mx-auto px-4') && 
               documentContent.includes('max-w-4xl mx-auto')
      },
      { 
        name: 'DocumentTranslator组件：没有flex-1', 
        check: !componentContent.includes('flex-1')
      },
      { 
        name: 'DocumentTranslator组件：使用合理的宽度', 
        check: componentContent.includes('max-w-full') || !componentContent.includes('w-full')
      },
    ];
    
    console.log('\n📊 修复结果验证:');
    checks.forEach(check => {
      console.log(`   ${check.check ? '✅' : '❌'} ${check.name}`);
    });
    
    return checks.every(check => check.check);
  } catch (error) {
    console.log(`❌ 验证修复结果失败: ${error.message}`);
    return false;
  }
}

// 主函数
function main() {
  console.log('🎯 目标: 精确修复按钮位置和容器问题\n');
  
  const results = {
    fixTextButton: fixTextTranslateButtonPosition(),
    fixDocumentButton: fixDocumentTranslateButtonPosition(),
    fixContainer: fixDocumentTranslatorContainer(),
    verifyFixes: verifyFixes(),
  };
  
  console.log('\n📊 修复总结:');
  Object.entries(results).forEach(([key, success]) => {
    console.log(`   ${key}: ${success ? '✅ 成功' : '❌ 失败'}`);
  });
  
  const allSuccess = Object.values(results).every(r => r);
  
  if (allSuccess) {
    console.log('\n🎉 精确修复完成！');
    console.log('\n📝 修复内容:');
    console.log('✅ 文本翻译页面：按钮现在在EnhancedTextTranslator上方');
    console.log('✅ 文档翻译页面：按钮现在在DocumentTranslator上方');
    console.log('✅ DocumentTranslator组件：修复了容器拉伸问题');
    console.log('✅ 移除了导致拉伸的flex-1和w-full样式');
    console.log('✅ 为DocumentTranslator添加了正确的容器限制');
    
    console.log('\n📱 新的布局结构:');
    console.log('文本翻译页面:');
    console.log('  - Hero Section');
    console.log('  - [跳转按钮] → 文档翻译');
    console.log('  - EnhancedTextTranslator');
    console.log('  - FAQ Section');
    
    console.log('\n文档翻译页面:');
    console.log('  - Hero Section');
    console.log('  - [跳转按钮] → 文本翻译');
    console.log('  - DocumentTranslator (不再拉伸)');
    console.log('  - How It Works');
    console.log('  - 支持的语言');
    
    console.log('\n🚀 现在按钮位置合理，上传组件不会被拉伸！');
  } else {
    console.log('\n⚠️  部分修复失败，请检查上述错误');
  }
  
  console.log('\n✨ 修复完成!');
}

if (require.main === module) {
  main();
}
