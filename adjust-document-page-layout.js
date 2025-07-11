#!/usr/bin/env node

const fs = require('fs');

console.log('📝 精确调整文档翻译页面布局...\n');

function adjustDocumentPageLayout() {
  const pagePath = '/home/hwt/translation-low-source/frontend/app/[locale]/document-translate/page.tsx';
  
  try {
    let content = fs.readFileSync(pagePath, 'utf8');
    
    // 找到当前的steps部分（从grid开始到</div>结束）
    const stepsPattern = /(\s*)(\/\* 步骤说明 \*\/[\s\S]*?<\/div>\s*<\/div>)/;
    const stepsMatch = content.match(stepsPattern);
    
    if (stepsMatch) {
      console.log('✅ 找到现有的步骤说明部分');
      
      // 移除现有的steps部分
      content = content.replace(stepsPattern, '');
      
      // 在支持的语言之前添加改进的steps部分
      const improvedStepsSection = `
      {/* 步骤说明 - How It Works */}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{t('steps.step1.title')}</h3>
              <p className="text-muted-foreground">{t('steps.step1.description')}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{t('steps.step2.title')}</h3>
              <p className="text-muted-foreground">{t('steps.step2.description')}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{t('steps.step3.title')}</h3>
              <p className="text-muted-foreground">{t('steps.step3.description')}</p>
            </div>
          </div>
        </div>
      </div>
`;
      
      // 在支持的语言部分之前插入
      content = content.replace(
        /(\s*)(\/\* 支持的语言 \*\/)/,
        `${improvedStepsSection}
$1$2`
      );
      
    } else {
      console.log('⚠️  未找到现有的步骤说明部分，尝试查找其他模式');
      
      // 尝试查找grid部分
      const gridPattern = /(\s*)<div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">[\s\S]*?<\/div>\s*<\/div>/;
      const gridMatch = content.match(gridPattern);
      
      if (gridMatch) {
        console.log('✅ 找到grid部分，进行替换');
        
        const improvedStepsSection = `
      {/* 步骤说明 - How It Works */}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{t('steps.step1.title')}</h3>
              <p className="text-muted-foreground">{t('steps.step1.description')}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{t('steps.step2.title')}</h3>
              <p className="text-muted-foreground">{t('steps.step2.description')}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{t('steps.step3.title')}</h3>
              <p className="text-muted-foreground">{t('steps.step3.description')}</p>
            </div>
          </div>
        </div>
      </div>
`;
        
        // 移除现有的grid部分
        content = content.replace(gridPattern, '');
        
        // 在支持的语言之前添加改进的部分
        content = content.replace(
          /(\s*)(\/\* 支持的语言 \*\/)/,
          `${improvedStepsSection}
$1$2`
        );
      }
    }
    
    fs.writeFileSync(pagePath, content, 'utf8');
    console.log('✅ 已调整文档翻译页面布局');
    return true;
  } catch (error) {
    console.log(`❌ 调整布局失败: ${error.message}`);
    return false;
  }
}

// 验证调整结果
function verifyLayoutAdjustment() {
  const pagePath = '/home/hwt/translation-low-source/frontend/app/[locale]/document-translate/page.tsx';
  
  try {
    const content = fs.readFileSync(pagePath, 'utf8');
    
    const checks = [
      { name: '包含How It Works标题', check: content.includes('How It Works') },
      { name: '包含步骤描述', check: content.includes('Simple three-step process') },
      { name: '包含支持的语言部分', check: content.includes('支持的语言') },
      { name: 'How It Works在支持语言之前', check: content.indexOf('How It Works') < content.indexOf('支持的语言') },
      { name: '包含改进的容器样式', check: content.includes('max-w-4xl mx-auto') },
      { name: '包含文本居中样式', check: content.includes('text-center mb-12') },
    ];
    
    console.log('\n📊 布局调整验证:');
    checks.forEach(check => {
      console.log(`   ${check.check ? '✅' : '❌'} ${check.name}`);
    });
    
    return checks.every(check => check.check);
  } catch (error) {
    console.log(`❌ 验证布局调整失败: ${error.message}`);
    return false;
  }
}

// 主函数
function main() {
  console.log('🎯 目标: 精确调整文档翻译页面布局\n');
  
  const adjustResult = adjustDocumentPageLayout();
  const verifyResult = verifyLayoutAdjustment();
  
  console.log('\n📊 调整总结:');
  console.log(`   布局调整: ${adjustResult ? '✅ 成功' : '❌ 失败'}`);
  console.log(`   验证结果: ${verifyResult ? '✅ 通过' : '❌ 失败'}`);
  
  if (adjustResult && verifyResult) {
    console.log('\n🎉 文档翻译页面布局调整完成！');
    console.log('\n📝 调整内容:');
    console.log('✅ 添加了"How It Works"标题');
    console.log('✅ 添加了步骤说明的描述文本');
    console.log('✅ 将feature介绍移动到支持语言之前');
    console.log('✅ 改进了视觉层次和间距');
    console.log('✅ 统一了容器样式和最大宽度');
    
    console.log('\n🎨 布局改进:');
    console.log('- 更清晰的标题层次');
    console.log('- 更好的内容组织');
    console.log('- 统一的容器宽度');
    console.log('- 改进的视觉间距');
    
    console.log('\n🚀 现在文档翻译页面的布局更加合理！');
  } else {
    console.log('\n⚠️  调整可能不完整，请检查上述错误');
  }
  
  console.log('\n✨ 调整完成!');
}

if (require.main === module) {
  main();
}
