#!/usr/bin/env node

/**
 * SEO 修复验证脚本
 * 验证 hreflang 和 HTML lang 属性是否正确实现
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 验证 SEO 修复...\n');

// 1. 验证 SEO 工具函数
function verifySEOUtils() {
  const seoUtilsPath = path.join(__dirname, 'frontend/lib/seo-utils.ts');
  
  if (!fs.existsSync(seoUtilsPath)) {
    console.log('❌ SEO 工具函数文件不存在');
    return false;
  }
  
  const content = fs.readFileSync(seoUtilsPath, 'utf8');
  
  const checks = [
    { name: 'generateHreflangAlternates 函数', pattern: /generateHreflangAlternates/ },
    { name: 'getOpenGraphLocale 函数', pattern: /getOpenGraphLocale/ },
    { name: '支持的语言列表', pattern: /SUPPORTED_LOCALES/ },
  ];
  
  let allPassed = true;
  checks.forEach(check => {
    if (check.pattern.test(content)) {
      console.log(`✅ ${check.name}`);
    } else {
      console.log(`❌ ${check.name}`);
      allPassed = false;
    }
  });
  
  return allPassed;
}

// 2. 验证 sindhi-to-english 页面
function verifySindhiPage() {
  const pagePath = path.join(__dirname, 'frontend/app/[locale]/sindhi-to-english/page.tsx');
  
  if (!fs.existsSync(pagePath)) {
    console.log('❌ sindhi-to-english 页面不存在');
    return false;
  }
  
  const content = fs.readFileSync(pagePath, 'utf8');
  
  const checks = [
    { name: 'hreflang alternates 导入', pattern: /generateHreflangAlternates/ },
    { name: 'OpenGraph locale 导入', pattern: /getOpenGraphLocale/ },
    { name: '本地化元数据', pattern: /metadata\s*=\s*{/ },
    { name: 'alternates 使用', pattern: /alternates[,:]/ },
  ];
  
  let allPassed = true;
  checks.forEach(check => {
    if (check.pattern.test(content)) {
      console.log(`✅ ${check.name}`);
    } else {
      console.log(`❌ ${check.name}`);
      allPassed = false;
    }
  });
  
  return allPassed;
}

// 3. 验证 HTML lang 属性
function verifyHTMLLang() {
  const rootLayoutPath = path.join(__dirname, 'frontend/app/layout.tsx');
  const localeLayoutPath = path.join(__dirname, 'frontend/app/[locale]/layout.tsx');
  
  let allPassed = true;
  
  // 检查根 layout
  if (fs.existsSync(rootLayoutPath)) {
    const rootContent = fs.readFileSync(rootLayoutPath, 'utf8');
    if (rootContent.includes('lang="en"')) {
      console.log('❌ 根 layout 仍有硬编码的 lang="en"');
      allPassed = false;
    } else {
      console.log('✅ 根 layout 已移除硬编码的 lang 属性');
    }
  }
  
  // 检查 locale layout
  if (fs.existsSync(localeLayoutPath)) {
    const localeContent = fs.readFileSync(localeLayoutPath, 'utf8');
    if (localeContent.includes('lang={locale}')) {
      console.log('✅ locale layout 已设置动态 lang 属性');
    } else {
      console.log('❌ locale layout 缺少动态 lang 属性');
      allPassed = false;
    }
  }
  
  return allPassed;
}

// 4. 生成测试 URLs
function generateTestURLs() {
  console.log('\n📋 测试 URLs:');
  const locales = ['en', 'fr', 'es', 'zh'];
  const baseUrl = 'https://loretrans.com';
  
  locales.forEach(locale => {
    console.log(`${baseUrl}/${locale}/sindhi-to-english`);
  });
  
  console.log('\n🔍 检查项目:');
  console.log('1. 每个 URL 的 <html lang="..."> 属性是否正确');
  console.log('2. 每个页面是否有完整的 hreflang 标记');
  console.log('3. canonical URL 是否正确');
  console.log('4. 元数据是否本地化');
}

// 执行验证
console.log('=== SEO 工具函数 ===');
const seoUtilsOK = verifySEOUtils();

console.log('\n=== sindhi-to-english 页面 ===');
const sindhiPageOK = verifySindhiPage();

console.log('\n=== HTML lang 属性 ===');
const htmlLangOK = verifyHTMLLang();

console.log('\n=== 总结 ===');
if (seoUtilsOK && sindhiPageOK && htmlLangOK) {
  console.log('🎉 所有 SEO 修复已完成！');
} else {
  console.log('⚠️  还有一些问题需要修复');
}

generateTestURLs();

console.log('\n📝 下一步:');
console.log('1. 重新构建并部署应用');
console.log('2. 使用浏览器开发者工具检查 HTML 源码');
console.log('3. 在 Google Search Console 中重新提交 sitemap');
console.log('4. 等待 Google 重新抓取页面（可能需要几天时间）');
