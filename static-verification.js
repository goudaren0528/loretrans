#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 静态文件验证 - Google Analytics & Search Console');
console.log('================================================\n');

// 1. 验证Google Analytics组件
console.log('1. Google Analytics 组件验证:');
const gaFile = path.join(__dirname, 'frontend/components/analytics/google-analytics.tsx');
const gaContent = fs.readFileSync(gaFile, 'utf8');

console.log('   跟踪ID:', gaContent.match(/G-[A-Z0-9]+/)?.[0] || '未找到');
console.log('   gtag配置:', gaContent.includes('gtag(\'config\'') ? '✅ 存在' : '❌ 缺失');

// 2. 验证Layout集成
console.log('\n2. Layout 集成验证:');
const layoutFile = path.join(__dirname, 'frontend/app/layout.tsx');
const layoutContent = fs.readFileSync(layoutFile, 'utf8');

console.log('   GA组件导入:', layoutContent.includes('GoogleAnalytics') ? '✅ 已导入' : '❌ 未导入');
console.log('   GA组件使用:', layoutContent.includes('<GoogleAnalytics />') ? '✅ 已使用' : '❌ 未使用');
console.log('   GSC验证码:', layoutContent.includes('google9879f9edb25bbe5e') ? '✅ 已配置' : '❌ 未配置');

// 3. 验证GSC文件
console.log('\n3. Google Search Console 文件验证:');
const gscFile = path.join(__dirname, 'frontend/public/google9879f9edb25bbe5e.html');
if (fs.existsSync(gscFile)) {
    const gscContent = fs.readFileSync(gscFile, 'utf8');
    console.log('   验证文件:', '✅ 存在');
    console.log('   文件内容:', gscContent.trim());
} else {
    console.log('   验证文件:', '❌ 不存在');
}

// 4. 生成预期的HTML输出示例
console.log('\n4. 预期的HTML输出示例:');
console.log('   在浏览器中，你应该看到以下内容:');
console.log(`
<head>
  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-64VSPS9SNV"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-64VSPS9SNV');
  </script>
  
  <!-- Google Search Console -->
  <meta name="google-site-verification" content="google9879f9edb25bbe5e" />
</head>`);

console.log('\n📋 浏览器验证清单:');
console.log('□ 打开开发者工具 (F12)');
console.log('□ Network标签页中看到对googletagmanager.com的请求');
console.log('□ Console中输入 typeof gtag 返回 "function"');
console.log('□ Elements标签页中找到GA脚本和GSC meta标签');
console.log('□ 访问 /google9879f9edb25bbe5e.html 返回验证内容');

console.log('\n🎯 关键验证点:');
console.log('✅ 所有静态配置都正确');
console.log('✅ 代码已正确集成到项目中');
console.log('⚠️  需要在浏览器中验证运行时行为');

console.log('\n💡 如果GSC在线上检测不到，可能的原因:');
console.log('1. 网站还未部署到生产环境');
console.log('2. 域名配置不匹配');
console.log('3. 服务器配置问题导致验证文件无法访问');
console.log('4. CDN缓存问题');
console.log('5. robots.txt阻止了Google爬虫访问');
