#!/usr/bin/env node

const fs = require('fs');

console.log('🔧 调整跳转按钮位置并修复容器问题...\n');

// 调整文本翻译页面的按钮位置
function adjustTextTranslateButtonPosition() {
  const pagePath = '/home/hwt/translation-low-source/frontend/app/[locale]/text-translate/text-translate-client.tsx';
  
  try {
    let content = fs.readFileSync(pagePath, 'utf8');
    
    // 移除顶部的TranslationNavButtons
    content = content.replace(
      /\s*<TranslationNavButtons currentPage="text" locale=\{locale\} \/>/g,
      ''
    );
    
    // 在EnhancedTextTranslator之前添加TranslationNavButtons
    content = content.replace(
      /(\s*)(\/\* Enhanced Translation Interface \*\/\s*<section[^>]*>\s*<div[^>]*>\s*)(<EnhancedTextTranslator)/,
      `$1$2<TranslationNavButtons currentPage="text" locale={locale} />
        $3`
    );
    
    fs.writeFileSync(pagePath, content, 'utf8');
    console.log('✅ 已调整文本翻译页面的按钮位置');
    return true;
  } catch (error) {
    console.log(`❌ 调整文本翻译页面失败: ${error.message}`);
    return false;
  }
}

// 调整文档翻译页面的按钮位置并修复容器问题
function adjustDocumentTranslateButtonPosition() {
  const pagePath = '/home/hwt/translation-low-source/frontend/app/[locale]/document-translate/page.tsx';
  
  try {
    let content = fs.readFileSync(pagePath, 'utf8');
    
    // 移除顶部的TranslationNavButtons
    content = content.replace(
      /\s*{\/\* 跳转到文本翻译的按钮 \*\/}\s*<TranslationNavButtons[^>]*\/>/g,
      ''
    );
    
    // 在DocumentTranslator之前添加TranslationNavButtons，并修复容器问题
    content = content.replace(
      /(\s*)(\/\* 文档翻译器组件 - 包含未登录用户限制 \*\/\s*<GuestLimitGuard[^>]*>\s*)(<DocumentTranslator)/,
      `$1{/* 跳转到文本翻译的按钮 */}
      <div className="container mx-auto px-4 mb-8">
        <div className="max-w-4xl mx-auto">
          <TranslationNavButtons currentPage="document" locale={locale} />
        </div>
      </div>

      $1$2$3`
    );
    
    // 确保DocumentTranslator有正确的容器
    content = content.replace(
      /(<GuestLimitGuard[^>]*>\s*)(<DocumentTranslator[^>]*\/>)(\s*<\/GuestLimitGuard>)/,
      `$1<div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            $2
          </div>
        </div>$3`
    );
    
    fs.writeFileSync(pagePath, content, 'utf8');
    console.log('✅ 已调整文档翻译页面的按钮位置并修复容器问题');
    return true;
  } catch (error) {
    console.log(`❌ 调整文档翻译页面失败: ${error.message}`);
    return false;
  }
}

// 更新TranslationNavButtons组件，移除自带的容器样式
function updateTranslationNavButtonsComponent() {
  const componentPath = '/home/hwt/translation-low-source/frontend/components/translation-nav-buttons.tsx';
  
  const updatedComponentContent = `import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { FileText, Type, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface TranslationNavButtonsProps {
  currentPage: 'text' | 'document';
  locale: string;
}

export function TranslationNavButtons({ currentPage, locale }: TranslationNavButtonsProps) {
  const t = useTranslations('Layout.Navigation');
  
  if (currentPage === 'text') {
    // 在文本翻译页面显示跳转到文档翻译的按钮
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('document_translation')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t('document_translation_desc')}
              </p>
            </div>
          </div>
          <Link href={\`/\${locale}/document-translate\`}>
            <Button 
              variant="outline" 
              size="lg"
              className="flex items-center space-x-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-700 min-w-[160px]"
            >
              <span>{t('document_translation')}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  } else {
    // 在文档翻译页面显示跳转到文本翻译的按钮
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 dark:bg-green-800 rounded-lg">
              <Type className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('text_translation')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t('text_translation_desc')}
              </p>
            </div>
          </div>
          <Link href={\`/\${locale}/text-translate\`}>
            <Button 
              variant="outline" 
              size="lg"
              className="flex items-center space-x-2 hover:bg-green-50 dark:hover:bg-green-900/30 border-green-200 dark:border-green-700 min-w-[160px]"
            >
              <span>{t('text_translation')}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }
}`;

  try {
    fs.writeFileSync(componentPath, updatedComponentContent, 'utf8');
    console.log('✅ 已更新TranslationNavButtons组件，移除自带容器');
    return true;
  } catch (error) {
    console.log(`❌ 更新TranslationNavButtons组件失败: ${error.message}`);
    return false;
  }
}

// 检查DocumentTranslator组件是否有容器问题
function checkDocumentTranslatorContainer() {
  const componentPath = '/home/hwt/translation-low-source/frontend/components/document-translator.tsx';
  
  try {
    const content = fs.readFileSync(componentPath, 'utf8');
    
    // 检查是否有过度的容器或宽度设置
    const hasFullWidth = content.includes('w-full');
    const hasContainer = content.includes('container');
    const hasMaxWidth = content.includes('max-w-');
    const hasFlexGrow = content.includes('flex-grow') || content.includes('flex-1');
    
    console.log('\n📊 DocumentTranslator容器检查:');
    console.log(`   包含w-full: ${hasFullWidth ? '⚠️' : '✅'}`);
    console.log(`   包含container: ${hasContainer ? '⚠️' : '✅'}`);
    console.log(`   包含max-w-: ${hasMaxWidth ? '✅' : '⚠️'}`);
    console.log(`   包含flex-grow: ${hasFlexGrow ? '⚠️' : '✅'}`);
    
    // 如果有问题的样式，建议修复
    if (hasFullWidth || hasFlexGrow) {
      console.log('\n💡 建议修复DocumentTranslator组件中的容器样式');
      return false;
    }
    
    return true;
  } catch (error) {
    console.log(`❌ 检查DocumentTranslator容器失败: ${error.message}`);
    return false;
  }
}

// 验证调整结果
function verifyAdjustments() {
  const textPagePath = '/home/hwt/translation-low-source/frontend/app/[locale]/text-translate/text-translate-client.tsx';
  const documentPagePath = '/home/hwt/translation-low-source/frontend/app/[locale]/document-translate/page.tsx';
  
  try {
    const textContent = fs.readFileSync(textPagePath, 'utf8');
    const documentContent = fs.readFileSync(documentPagePath, 'utf8');
    
    const checks = [
      { 
        name: '文本翻译页面：按钮在EnhancedTextTranslator之前', 
        check: textContent.indexOf('<TranslationNavButtons') > textContent.indexOf('Enhanced Translation Interface') &&
               textContent.indexOf('<TranslationNavButtons') < textContent.indexOf('<EnhancedTextTranslator')
      },
      { 
        name: '文档翻译页面：按钮在DocumentTranslator之前', 
        check: documentContent.indexOf('<TranslationNavButtons') > documentContent.indexOf('Hero Section') &&
               documentContent.indexOf('<TranslationNavButtons') < documentContent.indexOf('<DocumentTranslator')
      },
      { 
        name: '文本翻译页面：顶部没有按钮', 
        check: textContent.indexOf('<TranslationNavButtons') > textContent.indexOf('Hero Section')
      },
      { 
        name: '文档翻译页面：顶部没有按钮', 
        check: documentContent.indexOf('<TranslationNavButtons') > documentContent.indexOf('Hero Section')
      },
      { 
        name: '文档翻译页面：DocumentTranslator有容器', 
        check: documentContent.includes('container mx-auto px-4') && documentContent.includes('max-w-4xl mx-auto')
      },
    ];
    
    console.log('\n📊 调整结果验证:');
    checks.forEach(check => {
      console.log(`   ${check.check ? '✅' : '❌'} ${check.name}`);
    });
    
    return checks.every(check => check.check);
  } catch (error) {
    console.log(`❌ 验证调整结果失败: ${error.message}`);
    return false;
  }
}

// 主函数
function main() {
  console.log('🎯 目标: 调整跳转按钮位置到翻译组件上方并修复容器问题\n');
  
  const results = {
    updateComponent: updateTranslationNavButtonsComponent(),
    adjustTextPage: adjustTextTranslateButtonPosition(),
    adjustDocumentPage: adjustDocumentTranslateButtonPosition(),
    checkContainer: checkDocumentTranslatorContainer(),
    verifyAdjustments: verifyAdjustments(),
  };
  
  console.log('\n📊 调整总结:');
  Object.entries(results).forEach(([key, success]) => {
    console.log(`   ${key}: ${success ? '✅ 成功' : '❌ 失败'}`);
  });
  
  const allSuccess = Object.values(results).every(r => r);
  
  if (allSuccess) {
    console.log('\n🎉 按钮位置调整和容器修复完成！');
    console.log('\n📝 调整内容:');
    console.log('✅ 将文本翻译页面的按钮移动到EnhancedTextTranslator上方');
    console.log('✅ 将文档翻译页面的按钮移动到DocumentTranslator上方');
    console.log('✅ 移除了页面顶部的按钮');
    console.log('✅ 为DocumentTranslator添加了正确的容器');
    console.log('✅ 更新了TranslationNavButtons组件，移除自带容器');
    
    console.log('\n📱 新的页面结构:');
    console.log('文本翻译页面:');
    console.log('  1. Hero Section');
    console.log('  2. TranslationNavButtons (跳转到文档翻译)');
    console.log('  3. EnhancedTextTranslator');
    console.log('  4. FAQ Section');
    
    console.log('\n文档翻译页面:');
    console.log('  1. Hero Section');
    console.log('  2. TranslationNavButtons (跳转到文本翻译)');
    console.log('  3. DocumentTranslator');
    console.log('  4. How It Works');
    console.log('  5. 支持的语言');
    console.log('  6. CTA Section');
    
    console.log('\n🔧 容器修复:');
    console.log('- DocumentTranslator现在有正确的容器限制');
    console.log('- 使用max-w-4xl防止过度拉伸');
    console.log('- 保持响应式设计');
    
    console.log('\n🚀 现在按钮位置更合理，上传组件不会被拉伸！');
  } else {
    console.log('\n⚠️  部分调整失败，请检查上述错误');
  }
  
  console.log('\n✨ 调整完成!');
}

if (require.main === module) {
  main();
}
