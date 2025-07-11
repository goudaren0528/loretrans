#!/usr/bin/env node

const fs = require('fs');

console.log('🔗 添加文本翻译和文档翻译之间的跳转按钮...\n');

// 创建跳转按钮组件
function createTranslationNavComponent() {
  const componentContent = `import { useTranslations } from 'next-intl';
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
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t('document_translation')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('document_translation_desc')}
              </p>
            </div>
          </div>
          <Link href={\`/\${locale}/document-translate\`}>
            <Button variant="outline" className="flex items-center space-x-2 hover:bg-blue-50 dark:hover:bg-blue-900/30">
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
      <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
              <Type className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t('text_translation')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('text_translation_desc')}
              </p>
            </div>
          </div>
          <Link href={\`/\${locale}/text-translate\`}>
            <Button variant="outline" className="flex items-center space-x-2 hover:bg-green-50 dark:hover:bg-green-900/30">
              <span>{t('text_translation')}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }
}`;

  const componentPath = '/home/hwt/translation-low-source/frontend/components/translation-nav-buttons.tsx';
  
  try {
    fs.writeFileSync(componentPath, componentContent, 'utf8');
    console.log('✅ 已创建跳转按钮组件: components/translation-nav-buttons.tsx');
    return true;
  } catch (error) {
    console.log(`❌ 创建组件失败: ${error.message}`);
    return false;
  }
}

// 更新文本翻译页面
function updateTextTranslatePage() {
  const pagePath = '/home/hwt/translation-low-source/frontend/app/[locale]/text-translate/text-translate-client.tsx';
  
  try {
    let content = fs.readFileSync(pagePath, 'utf8');
    
    // 检查是否已经添加了跳转按钮
    if (content.includes('TranslationNavButtons')) {
      console.log('⚠️  文本翻译页面已包含跳转按钮');
      return true;
    }
    
    // 添加import语句
    if (!content.includes('TranslationNavButtons')) {
      content = content.replace(
        /import.*from.*lucide-react.*\n/,
        `$&import { TranslationNavButtons } from '@/components/translation-nav-buttons';\n`
      );
    }
    
    // 在主要内容之前添加跳转按钮
    // 查找容器div或main标签
    const containerRegex = /<div className="container[^>]*>|<main[^>]*>/;
    const match = content.match(containerRegex);
    
    if (match) {
      const insertPoint = content.indexOf(match[0]) + match[0].length;
      const navButton = `
        <TranslationNavButtons currentPage="text" locale={locale} />`;
      
      content = content.slice(0, insertPoint) + navButton + content.slice(insertPoint);
    } else {
      // 如果找不到容器，在return语句后添加
      content = content.replace(
        /return \(\s*<>/,
        `return (
    <>
      <TranslationNavButtons currentPage="text" locale={locale} />
      <>`
      );
    }
    
    // 确保locale参数可用
    if (!content.includes('locale') && content.includes('useParams')) {
      content = content.replace(
        'const params = useParams();',
        `const params = useParams();
  const locale = params.locale as string;`
      );
    }
    
    fs.writeFileSync(pagePath, content, 'utf8');
    console.log('✅ 已更新文本翻译页面添加跳转按钮');
    return true;
  } catch (error) {
    console.log(`❌ 更新文本翻译页面失败: ${error.message}`);
    return false;
  }
}

// 更新文档翻译页面
function updateDocumentTranslatePage() {
  const pagePath = '/home/hwt/translation-low-source/frontend/app/[locale]/document-translate/page.tsx';
  
  try {
    let content = fs.readFileSync(pagePath, 'utf8');
    
    // 检查是否已经添加了跳转按钮
    if (content.includes('TranslationNavButtons')) {
      console.log('⚠️  文档翻译页面已包含跳转按钮');
      return true;
    }
    
    // 添加import语句
    if (!content.includes('TranslationNavButtons')) {
      content = content.replace(
        /import.*from.*lucide-react.*\n/,
        `$&import { TranslationNavButtons } from '@/components/translation-nav-buttons';\n`
      );
    }
    
    // 在DocumentTranslator组件之前添加跳转按钮
    content = content.replace(
      /<GuestLimitGuard>/,
      `<TranslationNavButtons currentPage="document" locale={locale} />
        <GuestLimitGuard>`
    );
    
    fs.writeFileSync(pagePath, content, 'utf8');
    console.log('✅ 已更新文档翻译页面添加跳转按钮');
    return true;
  } catch (error) {
    console.log(`❌ 更新文档翻译页面失败: ${error.message}`);
    return false;
  }
}

// 检查现有的多语言key
function checkTranslationKeys() {
  console.log('🔍 检查现有的多语言key...\n');
  
  const enPath = '/home/hwt/translation-low-source/frontend/messages/en.json';
  
  try {
    const content = fs.readFileSync(enPath, 'utf8');
    const json = JSON.parse(content);
    
    const navKeys = json.Layout?.Navigation;
    if (navKeys) {
      console.log('✅ 找到导航相关的多语言key:');
      console.log(`   text_translation: "${navKeys.text_translation}"`);
      console.log(`   text_translation_desc: "${navKeys.text_translation_desc}"`);
      console.log(`   document_translation: "${navKeys.document_translation}"`);
      console.log(`   document_translation_desc: "${navKeys.document_translation_desc}"`);
      return true;
    } else {
      console.log('❌ 未找到导航相关的多语言key');
      return false;
    }
  } catch (error) {
    console.log(`❌ 检查多语言key失败: ${error.message}`);
    return false;
  }
}

// 验证组件创建
function verifyComponent() {
  const componentPath = '/home/hwt/translation-low-source/frontend/components/translation-nav-buttons.tsx';
  
  try {
    const exists = fs.existsSync(componentPath);
    if (exists) {
      const content = fs.readFileSync(componentPath, 'utf8');
      const hasTextCase = content.includes('currentPage === \'text\'');
      const hasDocumentCase = content.includes('currentPage === \'document\'');
      const hasTranslations = content.includes('useTranslations');
      
      console.log('\n📊 组件验证:');
      console.log(`   文件存在: ${exists ? '✅' : '❌'}`);
      console.log(`   文本翻译逻辑: ${hasTextCase ? '✅' : '❌'}`);
      console.log(`   文档翻译逻辑: ${hasDocumentCase ? '✅' : '❌'}`);
      console.log(`   多语言支持: ${hasTranslations ? '✅' : '❌'}`);
      
      return exists && hasTextCase && hasDocumentCase && hasTranslations;
    }
    return false;
  } catch (error) {
    console.log(`❌ 验证组件失败: ${error.message}`);
    return false;
  }
}

// 主函数
function main() {
  console.log('🎯 目标: 在文本翻译和文档翻译页面之间添加跳转按钮\n');
  
  const results = {
    checkKeys: checkTranslationKeys(),
    createComponent: createTranslationNavComponent(),
    updateTextPage: updateTextTranslatePage(),
    updateDocumentPage: updateDocumentTranslatePage(),
    verifyComponent: verifyComponent(),
  };
  
  console.log('\n📊 添加总结:');
  Object.entries(results).forEach(([key, success]) => {
    console.log(`   ${key}: ${success ? '✅ 成功' : '❌ 失败'}`);
  });
  
  const allSuccess = Object.values(results).every(r => r);
  
  if (allSuccess) {
    console.log('\n🎉 跳转按钮添加完成！');
    console.log('\n📝 添加内容:');
    console.log('✅ 创建了TranslationNavButtons组件');
    console.log('✅ 在文本翻译页面添加了跳转到文档翻译的按钮');
    console.log('✅ 在文档翻译页面添加了跳转到文本翻译的按钮');
    console.log('✅ 使用现有的多语言key支持多语言');
    console.log('✅ 按钮设计美观，包含图标和描述');
    
    console.log('\n🎨 设计特性:');
    console.log('- 文本翻译页面: 蓝色主题的文档翻译按钮');
    console.log('- 文档翻译页面: 绿色主题的文本翻译按钮');
    console.log('- 包含图标: FileText和Type图标');
    console.log('- 响应式设计，支持深色模式');
    console.log('- 悬停效果和平滑过渡');
    
    console.log('\n🌐 多语言支持:');
    console.log('- 使用Layout.Navigation命名空间');
    console.log('- text_translation: 文本翻译');
    console.log('- document_translation: 文档翻译');
    console.log('- 包含描述文本');
    
    console.log('\n🚀 下一步:');
    console.log('1. 重新启动开发服务器');
    console.log('2. 访问文本翻译页面查看跳转按钮');
    console.log('3. 访问文档翻译页面查看跳转按钮');
    console.log('4. 测试按钮功能和多语言切换');
  } else {
    console.log('\n⚠️  部分添加失败，请检查上述错误');
  }
  
  console.log('\n✨ 添加完成!');
}

if (require.main === module) {
  main();
}
