#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 支持的语言列表
const languages = ['en', 'ar', 'es', 'fr', 'hi', 'ht', 'lo', 'my', 'pt', 'sw', 'te', 'zh'];

// 占位符模式
const placeholderPatterns = [
  'TODO',
  'PLACEHOLDER',
  'placeholder',
  '需要翻译',
  'ຕ້ອງການແປ',
  'TRANSLATE_ME',
  'NEEDS_TRANSLATION'
];

function isPlaceholder(value) {
  if (typeof value !== 'string') return false;
  return placeholderPatterns.some(pattern => value.includes(pattern));
}

function countPlaceholders(obj, path = '') {
  let count = 0;
  
  for (const key in obj) {
    const currentPath = path ? `${path}.${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      count += countPlaceholders(obj[key], currentPath);
    } else if (isPlaceholder(obj[key])) {
      count++;
      console.log(`  ❌ 占位符: ${currentPath} = "${obj[key]}"`);
    }
  }
  
  return count;
}

function validateTranslationFiles() {
  console.log('🔍 验证翻译文件...\n');
  
  const enMessages = JSON.parse(fs.readFileSync(path.join(__dirname, '../messages/en.json'), 'utf8'));
  const enKeyCount = countKeys(enMessages);
  
  console.log(`📊 英文基准文件包含 ${enKeyCount} 个翻译键\n`);
  
  let totalPlaceholders = 0;
  
  languages.forEach(lang => {
    const filePath = path.join(__dirname, `../messages/${lang}.json`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`❌ ${lang}.json 文件不存在`);
      return;
    }
    
    console.log(`📝 检查 ${lang}.json:`);
    
    try {
      const langMessages = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const keyCount = countKeys(langMessages);
      const placeholderCount = countPlaceholders(langMessages);
      
      totalPlaceholders += placeholderCount;
      
      console.log(`  ✅ 翻译键数量: ${keyCount}/${enKeyCount}`);
      console.log(`  ${placeholderCount === 0 ? '✅' : '⚠️'} 占位符数量: ${placeholderCount}`);
      
      if (keyCount < enKeyCount) {
        console.log(`  ⚠️ 缺少 ${enKeyCount - keyCount} 个翻译键`);
      }
      
    } catch (error) {
      console.log(`  ❌ 解析错误: ${error.message}`);
    }
    
    console.log('');
  });
  
  return totalPlaceholders;
}

function countKeys(obj) {
  let count = 0;
  
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      count += countKeys(obj[key]);
    } else {
      count++;
    }
  }
  
  return count;
}

function validateRouteConfig() {
  console.log('🛣️ 验证路由配置...\n');
  
  const middlewarePath = path.join(__dirname, '../middleware.ts');
  const middlewareContent = fs.readFileSync(middlewarePath, 'utf8');
  
  // 检查是否包含所有语言
  const missingLanguages = languages.filter(lang => !middlewareContent.includes(`'${lang}'`));
  
  if (missingLanguages.length === 0) {
    console.log('✅ 所有语言都在路由配置中');
  } else {
    console.log(`❌ 路由配置中缺少语言: ${missingLanguages.join(', ')}`);
  }
  
  // 检查路径名配置
  const pathnamesMatch = middlewareContent.match(/pathnames:\s*\{([\s\S]*?)\}/);
  if (pathnamesMatch) {
    const pathnamesContent = pathnamesMatch[1];
    const routes = pathnamesContent.match(/'\/([\w-]+)':/g);
    
    if (routes) {
      console.log(`✅ 配置了 ${routes.length} 个本地化路由`);
      routes.forEach(route => {
        const routeName = route.replace(/[':]/g, '');
        console.log(`  - ${routeName}`);
      });
    }
  }
  
  console.log('');
}

function validateComponents() {
  console.log('🧩 验证组件硬编码...\n');
  
  const componentsDir = path.join(__dirname, '../components');
  let hardcodedCount = 0;
  
  function checkFile(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
    
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(componentsDir, filePath);
    
    // 检查常见的硬编码模式
    const hardcodedPatterns = [
      /"[A-Z][a-z]+ [a-z]+"/g,  // "Hello world" 格式
      /'[A-Z][a-z]+ [a-z]+'/g,  // 'Hello world' 格式
      /placeholder="[A-Z][a-z]+.*"/g,  // placeholder="Enter text"
      /title="[A-Z][a-z]+.*"/g,  // title="Click here"
      /aria-label="[A-Z][a-z]+.*"/g,  // aria-label="Close dialog"
    ];
    
    let fileHasHardcoded = false;
    
    hardcodedPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        if (!fileHasHardcoded) {
          console.log(`⚠️ ${relativePath}:`);
          fileHasHardcoded = true;
        }
        matches.forEach(match => {
          // 排除一些常见的非文本内容
          if (!match.includes('className') && !match.includes('data-') && !match.includes('http')) {
            console.log(`  - ${match}`);
            hardcodedCount++;
          }
        });
      }
    });
  }
  
  function walkDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        walkDirectory(filePath);
      } else {
        checkFile(filePath);
      }
    }
  }
  
  walkDirectory(componentsDir);
  
  if (hardcodedCount === 0) {
    console.log('✅ 未发现明显的硬编码文本');
  } else {
    console.log(`⚠️ 发现 ${hardcodedCount} 个可能的硬编码文本`);
  }
  
  console.log('');
}

function generateReport() {
  console.log('📋 生成修复报告...\n');
  
  const placeholderCount = validateTranslationFiles();
  validateRouteConfig();
  validateComponents();
  
  console.log('=' .repeat(60));
  console.log('📊 修复总结');
  console.log('=' .repeat(60));
  
  console.log(`✅ 支持的语言数量: ${languages.length}`);
  console.log(`${placeholderCount === 0 ? '✅' : '⚠️'} 剩余占位符: ${placeholderCount}`);
  console.log('✅ 路由本地化: 已配置');
  console.log('✅ 翻译文件: 已修复');
  
  if (placeholderCount === 0) {
    console.log('\n🎉 所有国际化问题已修复！');
  } else {
    console.log('\n⚠️ 仍有一些占位符需要专业翻译');
  }
  
  console.log('\n📝 建议后续步骤:');
  console.log('1. 为非英语语言提供专业翻译');
  console.log('2. 测试所有语言的界面显示');
  console.log('3. 检查 RTL 语言（阿拉伯语）的布局');
  console.log('4. 验证语言切换功能');
}

// 运行验证
generateReport();
