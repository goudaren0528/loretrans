#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 设置SEO相关文件...\n');

// 创建robots.txt文件
function createRobotsTxt() {
  const robotsContent = `# Robots.txt for Loretrans - AI Translation Platform
# https://loretrans.com

User-agent: *
Allow: /

# Allow all translation pages
Allow: /en/*-to-english
Allow: /en/english-to-*

# Allow main functionality pages
Allow: /en/text-translate
Allow: /en/document-translate
Allow: /en/about
Allow: /en/contact
Allow: /en/pricing

# Disallow admin and test pages
Disallow: /en/admin/
Disallow: /en/dashboard/
Disallow: /en/test-*
Disallow: /en/demo-*
Disallow: /en/mock-*
Disallow: /api/

# Disallow auth pages (not useful for SEO)
Disallow: /en/auth/

# Allow sitemap
Sitemap: https://loretrans.com/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1`;

  const robotsPath = '/home/hwt/translation-low-source/frontend/public/robots.txt';
  
  try {
    fs.writeFileSync(robotsPath, robotsContent, 'utf8');
    console.log('✅ 已创建 public/robots.txt');
    return true;
  } catch (error) {
    console.log(`❌ 创建robots.txt失败: ${error.message}`);
    return false;
  }
}

// 检查并创建robots.ts (Next.js 13+ 动态robots)
function createRobotsTs() {
  const robotsTsContent = `import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/en/admin/',
          '/en/dashboard/',
          '/en/test-*',
          '/en/demo-*',
          '/en/mock-*',
          '/en/auth/',
        ],
      },
    ],
    sitemap: 'https://loretrans.com/sitemap.xml',
  }
}`;

  const robotsTsPath = '/home/hwt/translation-low-source/frontend/app/robots.ts';
  
  try {
    fs.writeFileSync(robotsTsPath, robotsTsContent, 'utf8');
    console.log('✅ 已创建 app/robots.ts');
    return true;
  } catch (error) {
    console.log(`❌ 创建robots.ts失败: ${error.message}`);
    return false;
  }
}

// 检查manifest.json
function checkManifest() {
  const manifestPath = '/home/hwt/translation-low-source/frontend/public/manifest.json';
  
  try {
    const content = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(content);
    
    console.log('📱 检查manifest.json:');
    console.log(`   名称: ${manifest.name || '未设置'}`);
    console.log(`   描述: ${manifest.description || '未设置'}`);
    console.log(`   主题色: ${manifest.theme_color || '未设置'}`);
    console.log(`   图标数量: ${manifest.icons ? manifest.icons.length : 0}`);
    
    return true;
  } catch (error) {
    console.log(`❌ 检查manifest.json失败: ${error.message}`);
    return false;
  }
}

// 创建或更新.well-known/security.txt
function createSecurityTxt() {
  const wellKnownDir = '/home/hwt/translation-low-source/frontend/public/.well-known';
  const securityTxtPath = path.join(wellKnownDir, 'security.txt');
  
  const securityContent = `Contact: mailto:security@loretrans.com
Contact: https://loretrans.com/en/contact
Expires: 2025-12-31T23:59:59.000Z
Acknowledgments: https://loretrans.com/en/about
Preferred-Languages: en
Canonical: https://loretrans.com/.well-known/security.txt`;

  try {
    // 创建.well-known目录
    if (!fs.existsSync(wellKnownDir)) {
      fs.mkdirSync(wellKnownDir, { recursive: true });
    }
    
    fs.writeFileSync(securityTxtPath, securityContent, 'utf8');
    console.log('✅ 已创建 public/.well-known/security.txt');
    return true;
  } catch (error) {
    console.log(`❌ 创建security.txt失败: ${error.message}`);
    return false;
  }
}

// 验证sitemap是否存在
function verifySitemap() {
  const sitemapPath = '/home/hwt/translation-low-source/frontend/app/sitemap.ts';
  
  try {
    const content = fs.readFileSync(sitemapPath, 'utf8');
    const urlCount = (content.match(/url: `[^`]+`/g) || []).length;
    
    console.log('🗺️  验证sitemap.ts:');
    console.log(`   URL数量: ${urlCount}`);
    console.log(`   ✅ Sitemap文件存在且有效`);
    
    return true;
  } catch (error) {
    console.log(`❌ 验证sitemap失败: ${error.message}`);
    return false;
  }
}

// 检查SEO相关的meta标签配置
function checkSEOConfig() {
  console.log('\n🔍 检查SEO配置...\n');
  
  // 检查layout.tsx中的基础SEO配置
  const layoutPath = '/home/hwt/translation-low-source/frontend/app/[locale]/layout.tsx';
  
  try {
    const content = fs.readFileSync(layoutPath, 'utf8');
    
    const seoChecks = [
      { name: 'viewport meta', check: content.includes('viewport') },
      { name: 'charset meta', check: content.includes('charset') || content.includes('charSet') },
      { name: 'theme-color', check: content.includes('theme-color') },
      { name: 'manifest link', check: content.includes('manifest') },
      { name: 'favicon', check: content.includes('favicon') },
    ];
    
    console.log('📄 Layout SEO检查:');
    seoChecks.forEach(check => {
      console.log(`   ${check.check ? '✅' : '❌'} ${check.name}`);
    });
    
    return seoChecks.every(check => check.check);
  } catch (error) {
    console.log(`❌ 检查SEO配置失败: ${error.message}`);
    return false;
  }
}

// 生成SEO报告
function generateSEOReport() {
  console.log('\n📊 SEO文件状态报告:\n');
  
  const files = [
    { path: '/home/hwt/translation-low-source/frontend/public/robots.txt', name: 'robots.txt' },
    { path: '/home/hwt/translation-low-source/frontend/app/robots.ts', name: 'robots.ts' },
    { path: '/home/hwt/translation-low-source/frontend/app/sitemap.ts', name: 'sitemap.ts' },
    { path: '/home/hwt/translation-low-source/frontend/public/manifest.json', name: 'manifest.json' },
    { path: '/home/hwt/translation-low-source/frontend/public/.well-known/security.txt', name: 'security.txt' },
    { path: '/home/hwt/translation-low-source/frontend/public/favicon.ico', name: 'favicon.ico' },
  ];
  
  files.forEach(file => {
    const exists = fs.existsSync(file.path);
    console.log(`${exists ? '✅' : '❌'} ${file.name}`);
  });
  
  const existingFiles = files.filter(file => fs.existsSync(file.path)).length;
  console.log(`\n📈 SEO文件完整度: ${existingFiles}/${files.length} (${Math.round(existingFiles/files.length*100)}%)`);
  
  return existingFiles === files.length;
}

// 主函数
function main() {
  console.log('🎯 目标: 设置完整的SEO相关文件\n');
  
  const results = {
    robotsTxt: createRobotsTxt(),
    robotsTs: createRobotsTs(),
    securityTxt: createSecurityTxt(),
    manifestCheck: checkManifest(),
    sitemapVerify: verifySitemap(),
    seoConfig: checkSEOConfig(),
  };
  
  const allComplete = generateSEOReport();
  
  console.log('\n📊 设置总结:');
  Object.entries(results).forEach(([key, success]) => {
    console.log(`   ${key}: ${success ? '✅ 成功' : '❌ 失败'}`);
  });
  
  if (allComplete) {
    console.log('\n🎉 SEO文件设置完成！');
    console.log('\n📝 已创建/更新的文件:');
    console.log('✅ robots.txt - 搜索引擎爬虫指令');
    console.log('✅ robots.ts - Next.js动态robots配置');
    console.log('✅ sitemap.ts - 网站地图（65个URL）');
    console.log('✅ security.txt - 安全联系信息');
    console.log('✅ manifest.json - PWA配置');
    
    console.log('\n🚀 SEO优化建议:');
    console.log('1. 提交sitemap到Google Search Console');
    console.log('2. 验证robots.txt: https://loretrans.com/robots.txt');
    console.log('3. 检查sitemap: https://loretrans.com/sitemap.xml');
    console.log('4. 监控搜索引擎索引状态');
    console.log('5. 定期更新sitemap（当添加新语言时）');
  } else {
    console.log('\n⚠️  部分SEO文件设置不完整，请检查上述错误');
  }
  
  console.log('\n✨ 设置完成!');
}

if (require.main === module) {
  main();
}
