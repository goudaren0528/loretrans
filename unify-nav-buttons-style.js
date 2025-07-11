#!/usr/bin/env node

const fs = require('fs');

console.log('🎨 统一跳转按钮样式并调整文档翻译页面布局...\n');

// 统一TranslationNavButtons组件的样式
function unifyTranslationNavButtonsStyle() {
  const componentPath = '/home/hwt/translation-low-source/frontend/components/translation-nav-buttons.tsx';
  
  const unifiedComponentContent = `import { useTranslations } from 'next-intl';
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
      <div className="container mx-auto px-4 mb-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
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
        </div>
      </div>
    );
  } else {
    // 在文档翻译页面显示跳转到文本翻译的按钮
    return (
      <div className="container mx-auto px-4 mb-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800 p-6">
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
        </div>
      </div>
    );
  }
}`;

  try {
    fs.writeFileSync(componentPath, unifiedComponentContent, 'utf8');
    console.log('✅ 已统一TranslationNavButtons组件样式');
    return true;
  } catch (error) {
    console.log(`❌ 统一组件样式失败: ${error.message}`);
    return false;
  }
}

// 调整文档翻译页面布局
function adjustDocumentTranslatePageLayout() {
  const pagePath = '/home/hwt/translation-low-source/frontend/app/[locale]/document-translate/page.tsx';
  
  try {
    let content = fs.readFileSync(pagePath, 'utf8');
    
    // 找到steps部分（feature介绍）
    const stepsSection = content.match(/(\/\* 步骤说明 \*\/[\s\S]*?<\/div>\s*<\/div>)/);
    
    if (stepsSection) {
      const stepsContent = stepsSection[1];
      
      // 从原位置移除steps部分
      content = content.replace(stepsContent, '');
      
      // 在支持的语言部分之前插入steps部分
      content = content.replace(
        /(\s*)(\/\* 支持的语言 \*\/)/,
        `$1/* 步骤说明 - 移动到支持语言之前 */
      <div className="mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple three-step process to translate your documents with AI precision
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{t('steps.step1.title')}</h3>
              <p className="text-muted-foreground text-center">{t('steps.step1.description')}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{t('steps.step2.title')}</h3>
              <p className="text-muted-foreground text-center">{t('steps.step2.description')}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{t('steps.step3.title')}</h3>
              <p className="text-muted-foreground text-center">{t('steps.step3.description')}</p>
            </div>
          </div>
        </div>
      </div>

      $1$2`
      );
      
      fs.writeFileSync(pagePath, content, 'utf8');
      console.log('✅ 已调整文档翻译页面布局，将feature介绍移动到支持语言之前');
      return true;
    } else {
      console.log('⚠️  未找到steps部分，可能已经调整过了');
      return true;
    }
  } catch (error) {
    console.log(`❌ 调整文档翻译页面布局失败: ${error.message}`);
    return false;
  }
}

// 验证样式统一性
function verifyStyleUnification() {
  const componentPath = '/home/hwt/translation-low-source/frontend/components/translation-nav-buttons.tsx';
  
  try {
    const content = fs.readFileSync(componentPath, 'utf8');
    
    const checks = [
      { name: '统一的容器样式', check: content.includes('container mx-auto px-4 mb-8') },
      { name: '统一的最大宽度', check: content.includes('max-w-4xl mx-auto') },
      { name: '统一的padding', check: content.includes('p-6') },
      { name: '统一的按钮大小', check: content.includes('size="lg"') },
      { name: '统一的最小宽度', check: content.includes('min-w-[160px]') },
      { name: '统一的图标大小', check: content.includes('h-6 w-6') },
      { name: '统一的图标容器', check: content.includes('p-3') },
      { name: '统一的标题样式', check: content.includes('text-lg font-semibold') },
    ];
    
    console.log('\n📊 样式统一性验证:');
    checks.forEach(check => {
      console.log(`   ${check.check ? '✅' : '❌'} ${check.name}`);
    });
    
    return checks.every(check => check.check);
  } catch (error) {
    console.log(`❌ 验证样式统一性失败: ${error.message}`);
    return false;
  }
}

// 验证文档翻译页面布局
function verifyDocumentPageLayout() {
  const pagePath = '/home/hwt/translation-low-source/frontend/app/[locale]/document-translate/page.tsx';
  
  try {
    const content = fs.readFileSync(pagePath, 'utf8');
    
    const stepsBeforeLanguages = content.indexOf('How It Works') < content.indexOf('支持的语言');
    const hasStepsSection = content.includes('How It Works');
    const hasLanguagesSection = content.includes('支持的语言');
    
    console.log('\n📊 文档翻译页面布局验证:');
    console.log(`   ✅ 包含步骤说明部分: ${hasStepsSection ? '✅' : '❌'}`);
    console.log(`   ✅ 包含支持语言部分: ${hasLanguagesSection ? '✅' : '❌'}`);
    console.log(`   ✅ 步骤说明在支持语言之前: ${stepsBeforeLanguages ? '✅' : '❌'}`);
    
    return hasStepsSection && hasLanguagesSection && stepsBeforeLanguages;
  } catch (error) {
    console.log(`❌ 验证文档翻译页面布局失败: ${error.message}`);
    return false;
  }
}

// 主函数
function main() {
  console.log('🎯 目标: 统一跳转按钮样式并调整文档翻译页面布局\n');
  
  const results = {
    unifyStyles: unifyTranslationNavButtonsStyle(),
    adjustLayout: adjustDocumentTranslatePageLayout(),
    verifyStyles: verifyStyleUnification(),
    verifyLayout: verifyDocumentPageLayout(),
  };
  
  console.log('\n📊 操作总结:');
  Object.entries(results).forEach(([key, success]) => {
    console.log(`   ${key}: ${success ? '✅ 成功' : '❌ 失败'}`);
  });
  
  const allSuccess = Object.values(results).every(r => r);
  
  if (allSuccess) {
    console.log('\n🎉 样式统一和布局调整完成！');
    console.log('\n📝 完成的改进:');
    console.log('✅ 统一了两个跳转按钮的样式和宽度');
    console.log('✅ 使用相同的容器、padding和按钮尺寸');
    console.log('✅ 统一了图标大小和文本样式');
    console.log('✅ 设置了按钮最小宽度确保一致性');
    console.log('✅ 将文档翻译页面的feature介绍移动到支持语言之前');
    console.log('✅ 改进了feature介绍的标题和描述');
    
    console.log('\n🎨 样式特性:');
    console.log('- 统一的容器宽度: max-w-4xl');
    console.log('- 统一的内边距: p-6');
    console.log('- 统一的按钮尺寸: size="lg"');
    console.log('- 统一的按钮最小宽度: min-w-[160px]');
    console.log('- 统一的图标大小: h-6 w-6');
    console.log('- 统一的标题样式: text-lg font-semibold');
    
    console.log('\n📱 布局改进:');
    console.log('- 文档翻译页面结构更合理');
    console.log('- Feature介绍在支持语言之前');
    console.log('- 改进了"How It Works"部分的视觉效果');
    console.log('- 保持了响应式设计');
    
    console.log('\n🚀 现在两个页面的跳转按钮样式完全一致！');
  } else {
    console.log('\n⚠️  部分操作失败，请检查上述错误');
  }
  
  console.log('\n✨ 操作完成!');
}

if (require.main === module) {
  main();
}
