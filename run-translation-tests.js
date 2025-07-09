#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 开始执行翻译功能测试...\n');

// 测试结果记录
const testResults = {
  passed: [],
  failed: [],
  warnings: [],
  startTime: new Date(),
  endTime: null
};

// 测试用例定义
const testCases = [
  {
    id: 'ENV-001',
    title: '环境检查',
    category: '环境准备',
    priority: 'high',
    test: checkEnvironment
  },
  {
    id: 'TXT-001',
    title: '基础文本翻译功能',
    category: '文本翻译',
    priority: 'high',
    test: checkTextTranslationBasics
  },
  {
    id: 'TXT-002',
    title: '语言切换功能',
    category: '文本翻译',
    priority: 'high',
    test: checkLanguageSwitching
  },
  {
    id: 'DOC-001',
    title: '文档翻译页面',
    category: '文档翻译',
    priority: 'high',
    test: checkDocumentTranslationPage
  },
  {
    id: 'API-001',
    title: 'API端点检查',
    category: 'API',
    priority: 'high',
    test: checkAPIEndpoints
  },
  {
    id: 'COMP-001',
    title: '组件完整性',
    category: '组件',
    priority: 'medium',
    test: checkComponentIntegrity
  }
];

// 环境检查
async function checkEnvironment() {
  const checks = [];
  
  // 检查必要的页面文件
  const requiredPages = [
    'frontend/app/[locale]/text-translate/page.tsx',
    'frontend/app/[locale]/document-translate/page.tsx'
  ];
  
  requiredPages.forEach(pagePath => {
    const fullPath = path.join(__dirname, pagePath);
    if (fs.existsSync(fullPath)) {
      checks.push({ name: `页面文件: ${pagePath}`, status: 'pass' });
    } else {
      checks.push({ name: `页面文件: ${pagePath}`, status: 'fail', error: '文件不存在' });
    }
  });
  
  // 检查核心组件
  const requiredComponents = [
    'frontend/components/translation/unified-translator.tsx',
    'frontend/components/document-translator.tsx',
    'frontend/components/bidirectional-translator.tsx'
  ];
  
  requiredComponents.forEach(componentPath => {
    const fullPath = path.join(__dirname, componentPath);
    if (fs.existsSync(fullPath)) {
      checks.push({ name: `组件文件: ${componentPath}`, status: 'pass' });
    } else {
      checks.push({ name: `组件文件: ${componentPath}`, status: 'fail', error: '文件不存在' });
    }
  });
  
  // 检查API路由
  const requiredAPIs = [
    'frontend/app/api/translate/route.ts',
    'frontend/app/api/document',
    'frontend/app/api/detect'
  ];
  
  requiredAPIs.forEach(apiPath => {
    const fullPath = path.join(__dirname, apiPath);
    if (fs.existsSync(fullPath)) {
      checks.push({ name: `API路由: ${apiPath}`, status: 'pass' });
    } else {
      checks.push({ name: `API路由: ${apiPath}`, status: 'fail', error: '路由不存在' });
    }
  });
  
  return checks;
}

// 检查文本翻译基础功能
async function checkTextTranslationBasics() {
  const checks = [];
  
  // 检查文本翻译页面组件
  const textTranslatePage = path.join(__dirname, 'frontend/app/[locale]/text-translate/page.tsx');
  
  if (fs.existsSync(textTranslatePage)) {
    const content = fs.readFileSync(textTranslatePage, 'utf8');
    
    // 检查关键组件引用
    if (content.includes('UnifiedTranslator')) {
      checks.push({ name: '引用 UnifiedTranslator 组件', status: 'pass' });
    } else {
      checks.push({ name: '引用 UnifiedTranslator 组件', status: 'fail', error: '未找到组件引用' });
    }
    
    // 检查国际化支持
    if (content.includes('useTranslations')) {
      checks.push({ name: '国际化支持', status: 'pass' });
    } else {
      checks.push({ name: '国际化支持', status: 'fail', error: '未使用国际化' });
    }
    
    // 检查响应式设计
    if (content.includes('isMobile') || content.includes('responsive')) {
      checks.push({ name: '响应式设计', status: 'pass' });
    } else {
      checks.push({ name: '响应式设计', status: 'warning', error: '可能缺少响应式支持' });
    }
  }
  
  // 检查 UnifiedTranslator 组件
  const unifiedTranslator = path.join(__dirname, 'frontend/components/translation/unified-translator.tsx');
  
  if (fs.existsSync(unifiedTranslator)) {
    const content = fs.readFileSync(unifiedTranslator, 'utf8');
    
    // 检查核心功能
    const features = [
      { name: '语言选择', pattern: /Select.*Language|sourceLanguage|targetLanguage/ },
      { name: '文本输入', pattern: /Textarea|sourceText/ },
      { name: '翻译按钮', pattern: /translate.*button|handleTranslate/ },
      { name: '字符计数', pattern: /character.*count|getCharacterCount/ },
      { name: '积分系统', pattern: /credit|useCredits/ },
      { name: '错误处理', pattern: /error|catch|try/ },
      { name: '加载状态', pattern: /loading|isLoading/ }
    ];
    
    features.forEach(feature => {
      if (feature.pattern.test(content)) {
        checks.push({ name: `功能: ${feature.name}`, status: 'pass' });
      } else {
        checks.push({ name: `功能: ${feature.name}`, status: 'fail', error: '功能实现缺失' });
      }
    });
  }
  
  return checks;
}

// 检查语言切换功能
async function checkLanguageSwitching() {
  const checks = [];
  
  // 检查 BidirectionalTranslator 组件
  const bidirectionalTranslator = path.join(__dirname, 'frontend/components/bidirectional-translator.tsx');
  
  if (fs.existsSync(bidirectionalTranslator)) {
    const content = fs.readFileSync(bidirectionalTranslator, 'utf8');
    
    // 检查语言切换相关功能
    const switchFeatures = [
      { name: '语言切换按钮', pattern: /ArrowLeftRight|switch.*language/i },
      { name: '重置功能', pattern: /reset|clear|RotateCcw/i },
      { name: '翻译键支持', pattern: /useTranslations|t\(/i },
      { name: '事件处理', pattern: /onClick|handleSwitch/i }
    ];
    
    switchFeatures.forEach(feature => {
      if (feature.pattern.test(content)) {
        checks.push({ name: `切换功能: ${feature.name}`, status: 'pass' });
      } else {
        checks.push({ name: `切换功能: ${feature.name}`, status: 'fail', error: '功能缺失' });
      }
    });
  }
  
  // 检查 LanguageSwitch 组件
  const languageSwitch = path.join(__dirname, 'frontend/components/language-switch.tsx');
  
  if (fs.existsSync(languageSwitch)) {
    const content = fs.readFileSync(languageSwitch, 'utf8');
    
    if (content.includes('useTranslations')) {
      checks.push({ name: 'LanguageSwitch 国际化', status: 'pass' });
    } else {
      checks.push({ name: 'LanguageSwitch 国际化', status: 'fail', error: '缺少国际化支持' });
    }
  }
  
  return checks;
}

// 检查文档翻译页面
async function checkDocumentTranslationPage() {
  const checks = [];
  
  const documentTranslatePage = path.join(__dirname, 'frontend/app/[locale]/document-translate/page.tsx');
  
  if (fs.existsSync(documentTranslatePage)) {
    const content = fs.readFileSync(documentTranslatePage, 'utf8');
    
    // 检查核心组件
    const components = [
      { name: 'DocumentTranslator 组件', pattern: /DocumentTranslator/ },
      { name: '文件上传UI', pattern: /Upload|FileText/ },
      { name: '进度显示', pattern: /Progress|CheckCircle/ },
      { name: '用户限制保护', pattern: /GuestLimitGuard/ },
      { name: '语言支持显示', pattern: /AVAILABLE_LANGUAGES/ }
    ];
    
    components.forEach(component => {
      if (component.pattern.test(content)) {
        checks.push({ name: component.name, status: 'pass' });
      } else {
        checks.push({ name: component.name, status: 'fail', error: '组件缺失' });
      }
    });
  }
  
  // 检查 DocumentTranslator 组件
  const documentTranslator = path.join(__dirname, 'frontend/components/document-translator.tsx');
  
  if (fs.existsExists(documentTranslator)) {
    const content = fs.readFileSync(documentTranslator, 'utf8');
    
    // 检查文档翻译功能
    const docFeatures = [
      { name: '文件上传', pattern: /upload|file/i },
      { name: '进度跟踪', pattern: /progress|status/i },
      { name: '积分计算', pattern: /credit.*calculation|billing/i },
      { name: '结果下载', pattern: /download|result/i },
      { name: '错误处理', pattern: /error|alert|toast/i }
    ];
    
    docFeatures.forEach(feature => {
      if (feature.pattern.test(content)) {
        checks.push({ name: `文档功能: ${feature.name}`, status: 'pass' });
      } else {
        checks.push({ name: `文档功能: ${feature.name}`, status: 'warning', error: '可能缺少实现' });
      }
    });
  }
  
  return checks;
}

// 检查API端点
async function checkAPIEndpoints() {
  const checks = [];
  
  // 检查翻译API
  const translateAPI = path.join(__dirname, 'frontend/app/api/translate/route.ts');
  
  if (fs.existsExists(translateAPI)) {
    const content = fs.readFileSync(translateAPI, 'utf8');
    
    // 检查API功能
    const apiFeatures = [
      { name: 'POST 方法支持', pattern: /export.*POST|async.*POST/ },
      { name: '请求验证', pattern: /validate|schema|zod/ },
      { name: '错误处理', pattern: /try.*catch|error.*handling/ },
      { name: '响应格式', pattern: /Response|json|status/ },
      { name: 'NLLB 集成', pattern: /nllb|translation.*service/ }
    ];
    
    apiFeatures.forEach(feature => {
      if (feature.pattern.test(content)) {
        checks.push({ name: `翻译API: ${feature.name}`, status: 'pass' });
      } else {
        checks.push({ name: `翻译API: ${feature.name}`, status: 'warning', error: '可能缺少实现' });
      }
    });
  }
  
  // 检查文档API
  const documentAPIDir = path.join(__dirname, 'frontend/app/api/document');
  
  if (fs.existsSync(documentAPIDir)) {
    const files = fs.readdirSync(documentAPIDir);
    checks.push({ name: '文档API目录', status: 'pass', details: `包含 ${files.length} 个文件` });
  } else {
    checks.push({ name: '文档API目录', status: 'fail', error: 'API目录不存在' });
  }
  
  return checks;
}

// 检查组件完整性
async function checkComponentIntegrity() {
  const checks = [];
  
  // 检查翻译文件
  const messagesDir = path.join(__dirname, 'frontend/messages');
  
  if (fs.existsSync(messagesDir)) {
    const messageFiles = fs.readdirSync(messagesDir).filter(file => file.endsWith('.json'));
    
    // 检查关键翻译键
    const requiredKeys = [
      'Common.select_language',
      'Common.translation_placeholder',
      'Common.switch_languages',
      'Common.reset_translation'
    ];
    
    messageFiles.forEach(file => {
      const filePath = path.join(messagesDir, file);
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      const missingKeys = requiredKeys.filter(key => {
        const [section, subkey] = key.split('.');
        return !content[section] || !content[section][subkey];
      });
      
      if (missingKeys.length === 0) {
        checks.push({ name: `翻译文件: ${file}`, status: 'pass' });
      } else {
        checks.push({ 
          name: `翻译文件: ${file}`, 
          status: 'fail', 
          error: `缺少键: ${missingKeys.join(', ')}` 
        });
      }
    });
  }
  
  return checks;
}

// 修复 fs.existsExists 错误
function checkExists(filePath) {
  return fs.existsSync(filePath);
}

// 执行测试用例
async function runTestCase(testCase) {
  console.log(`🧪 执行测试: ${testCase.id} - ${testCase.title}`);
  
  try {
    const results = await testCase.test();
    
    const passed = results.filter(r => r.status === 'pass');
    const failed = results.filter(r => r.status === 'fail');
    const warnings = results.filter(r => r.status === 'warning');
    
    console.log(`   ✅ 通过: ${passed.length}`);
    console.log(`   ❌ 失败: ${failed.length}`);
    console.log(`   ⚠️  警告: ${warnings.length}`);
    
    // 显示详细结果
    results.forEach(result => {
      const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
      console.log(`     ${icon} ${result.name}`);
      if (result.error) {
        console.log(`        ${result.error}`);
      }
      if (result.details) {
        console.log(`        ${result.details}`);
      }
    });
    
    // 记录测试结果
    if (failed.length === 0) {
      testResults.passed.push({
        id: testCase.id,
        title: testCase.title,
        category: testCase.category,
        results: results
      });
    } else {
      testResults.failed.push({
        id: testCase.id,
        title: testCase.title,
        category: testCase.category,
        results: results,
        failedCount: failed.length
      });
    }
    
    if (warnings.length > 0) {
      testResults.warnings.push({
        id: testCase.id,
        title: testCase.title,
        warnings: warnings
      });
    }
    
  } catch (error) {
    console.log(`   ❌ 测试执行失败: ${error.message}`);
    testResults.failed.push({
      id: testCase.id,
      title: testCase.title,
      category: testCase.category,
      error: error.message
    });
  }
  
  console.log('');
}

// 生成测试报告
function generateTestReport() {
  testResults.endTime = new Date();
  const duration = Math.round((testResults.endTime - testResults.startTime) / 1000);
  
  console.log('📊 测试报告');
  console.log('=' .repeat(50));
  console.log(`测试开始时间: ${testResults.startTime.toLocaleString()}`);
  console.log(`测试结束时间: ${testResults.endTime.toLocaleString()}`);
  console.log(`测试持续时间: ${duration} 秒`);
  console.log('');
  
  console.log(`📈 测试统计:`);
  console.log(`  ✅ 通过的测试: ${testResults.passed.length}`);
  console.log(`  ❌ 失败的测试: ${testResults.failed.length}`);
  console.log(`  ⚠️  有警告的测试: ${testResults.warnings.length}`);
  console.log('');
  
  if (testResults.failed.length > 0) {
    console.log('❌ 失败的测试:');
    testResults.failed.forEach(test => {
      console.log(`  - ${test.id}: ${test.title}`);
      if (test.error) {
        console.log(`    错误: ${test.error}`);
      }
      if (test.failedCount) {
        console.log(`    失败项目数: ${test.failedCount}`);
      }
    });
    console.log('');
  }
  
  if (testResults.warnings.length > 0) {
    console.log('⚠️  警告信息:');
    testResults.warnings.forEach(test => {
      console.log(`  - ${test.id}: ${test.title}`);
      test.warnings.forEach(warning => {
        console.log(`    ⚠️  ${warning.name}: ${warning.error}`);
      });
    });
    console.log('');
  }
  
  // 生成HTML报告
  generateHTMLReport();
  
  // 总体评估
  const totalTests = testResults.passed.length + testResults.failed.length;
  const passRate = Math.round((testResults.passed.length / totalTests) * 100);
  
  console.log(`🎯 总体评估:`);
  console.log(`  测试通过率: ${passRate}%`);
  
  if (passRate >= 90) {
    console.log(`  🎉 优秀! 系统功能基本完整`);
  } else if (passRate >= 70) {
    console.log(`  👍 良好! 大部分功能正常，需要修复一些问题`);
  } else if (passRate >= 50) {
    console.log(`  ⚠️  一般! 存在较多问题，需要重点修复`);
  } else {
    console.log(`  🚨 需要改进! 存在严重问题，建议全面检查`);
  }
}

// 生成HTML报告
function generateHTMLReport() {
  const reportHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>翻译功能测试报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .stat-card { padding: 20px; background: white; border-radius: 8px; text-align: center; border-left: 4px solid #007bff; }
        .stat-number { font-size: 2em; font-weight: bold; color: #007bff; }
        .test-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
        .pass { border-left-color: #28a745; background-color: #d4edda; }
        .fail { border-left-color: #dc3545; background-color: #f8d7da; }
        .warning { border-left-color: #ffc107; background-color: #fff3cd; }
        .test-item { margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧪 翻译功能测试报告</h1>
        <p>测试时间: ${testResults.startTime.toLocaleString()} - ${testResults.endTime.toLocaleString()}</p>
    </div>

    <div class="summary">
        <div class="stat-card">
            <div class="stat-number">${testResults.passed.length}</div>
            <div>通过测试</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${testResults.failed.length}</div>
            <div>失败测试</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${testResults.warnings.length}</div>
            <div>警告测试</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${Math.round((testResults.passed.length / (testResults.passed.length + testResults.failed.length)) * 100)}%</div>
            <div>通过率</div>
        </div>
    </div>

    ${testResults.passed.map(test => `
    <div class="test-section pass">
        <h3>✅ ${test.id}: ${test.title}</h3>
        <p><strong>分类:</strong> ${test.category}</p>
        ${test.results.map(result => `
        <div class="test-item">
            ${result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️'} ${result.name}
            ${result.details ? `<br><small>${result.details}</small>` : ''}
        </div>
        `).join('')}
    </div>
    `).join('')}

    ${testResults.failed.map(test => `
    <div class="test-section fail">
        <h3>❌ ${test.id}: ${test.title}</h3>
        <p><strong>分类:</strong> ${test.category}</p>
        ${test.error ? `<p><strong>错误:</strong> ${test.error}</p>` : ''}
        ${test.results ? test.results.map(result => `
        <div class="test-item">
            ${result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️'} ${result.name}
            ${result.error ? `<br><small style="color: #dc3545;">${result.error}</small>` : ''}
        </div>
        `).join('') : ''}
    </div>
    `).join('')}

    <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; text-align: center;">
        <p>测试报告生成时间: ${new Date().toLocaleString()}</p>
    </footer>
</body>
</html>`;

  fs.writeFileSync(path.join(__dirname, 'translation-test-report.html'), reportHTML, 'utf8');
  console.log('📄 HTML报告已生成: translation-test-report.html');
}

// 主函数
async function main() {
  console.log('🚀 开始翻译功能测试...\n');
  
  // 执行所有测试用例
  for (const testCase of testCases) {
    await runTestCase(testCase);
  }
  
  // 生成测试报告
  generateTestReport();
  
  console.log('\n🎉 测试完成!');
  console.log('📄 查看详细报告: open translation-test-report.html');
}

// 修复函数名错误
function checkExists(filePath) {
  return fs.existsSync(filePath);
}

// 在相关函数中替换 fs.existsExists 为 checkExists
async function checkDocumentTranslationPage() {
  const checks = [];
  
  const documentTranslatePage = path.join(__dirname, 'frontend/app/[locale]/document-translate/page.tsx');
  
  if (fs.existsSync(documentTranslatePage)) {
    const content = fs.readFileSync(documentTranslatePage, 'utf8');
    
    // 检查核心组件
    const components = [
      { name: 'DocumentTranslator 组件', pattern: /DocumentTranslator/ },
      { name: '文件上传UI', pattern: /Upload|FileText/ },
      { name: '进度显示', pattern: /Progress|CheckCircle/ },
      { name: '用户限制保护', pattern: /GuestLimitGuard/ },
      { name: '语言支持显示', pattern: /AVAILABLE_LANGUAGES/ }
    ];
    
    components.forEach(component => {
      if (component.pattern.test(content)) {
        checks.push({ name: component.name, status: 'pass' });
      } else {
        checks.push({ name: component.name, status: 'fail', error: '组件缺失' });
      }
    });
  }
  
  // 检查 DocumentTranslator 组件
  const documentTranslator = path.join(__dirname, 'frontend/components/document-translator.tsx');
  
  if (checkExists(documentTranslator)) {
    const content = fs.readFileSync(documentTranslator, 'utf8');
    
    // 检查文档翻译功能
    const docFeatures = [
      { name: '文件上传', pattern: /upload|file/i },
      { name: '进度跟踪', pattern: /progress|status/i },
      { name: '积分计算', pattern: /credit.*calculation|billing/i },
      { name: '结果下载', pattern: /download|result/i },
      { name: '错误处理', pattern: /error|alert|toast/i }
    ];
    
    docFeatures.forEach(feature => {
      if (feature.pattern.test(content)) {
        checks.push({ name: `文档功能: ${feature.name}`, status: 'pass' });
      } else {
        checks.push({ name: `文档功能: ${feature.name}`, status: 'warning', error: '可能缺少实现' });
      }
    });
  }
  
  return checks;
}

async function checkAPIEndpoints() {
  const checks = [];
  
  // 检查翻译API
  const translateAPI = path.join(__dirname, 'frontend/app/api/translate/route.ts');
  
  if (checkExists(translateAPI)) {
    const content = fs.readFileSync(translateAPI, 'utf8');
    
    // 检查API功能
    const apiFeatures = [
      { name: 'POST 方法支持', pattern: /export.*POST|async.*POST/ },
      { name: '请求验证', pattern: /validate|schema|zod/ },
      { name: '错误处理', pattern: /try.*catch|error.*handling/ },
      { name: '响应格式', pattern: /Response|json|status/ },
      { name: 'NLLB 集成', pattern: /nllb|translation.*service/ }
    ];
    
    apiFeatures.forEach(feature => {
      if (feature.pattern.test(content)) {
        checks.push({ name: `翻译API: ${feature.name}`, status: 'pass' });
      } else {
        checks.push({ name: `翻译API: ${feature.name}`, status: 'warning', error: '可能缺少实现' });
      }
    });
  }
  
  // 检查文档API
  const documentAPIDir = path.join(__dirname, 'frontend/app/api/document');
  
  if (fs.existsSync(documentAPIDir)) {
    const files = fs.readdirSync(documentAPIDir);
    checks.push({ name: '文档API目录', status: 'pass', details: `包含 ${files.length} 个文件` });
  } else {
    checks.push({ name: '文档API目录', status: 'fail', error: 'API目录不存在' });
  }
  
  return checks;
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testCases,
  runTestCase,
  generateTestReport
};
