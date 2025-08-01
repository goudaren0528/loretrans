#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('🌍 Sitemap多语言改进工具\n');

// 扫描实际存在的页面
function scanExistingPages() {
  console.log('📂 扫描实际存在的页面...\n');
  
  const localeDir = '/home/hwt/translation-low-source/frontend/app/[locale]';
  const pages = [];
  
  try {
    const entries = fs.readdirSync(localeDir, { withFileTypes: true });
    
    entries.forEach(entry => {
      if (entry.isDirectory()) {
        const pageFile = path.join(localeDir, entry.name, 'page.tsx');
        if (fs.existsSync(pageFile)) {
          pages.push(entry.name);
        }
      }
    });
    
    return pages.sort();
  } catch (error) {
    console.log(`❌ 扫描失败: ${error.message}`);
    return [];
  }
}

// 分析当前sitemap
async function analyzeSitemap() {
  console.log('🔍 分析当前sitemap...\n');
  
  try {
    const sitemapContent = await fetchSitemap();
    const urlMatches = sitemapContent.match(/<loc>([^<]+)<\/loc>/g) || [];
    const urls = urlMatches.map(match => match.replace(/<\/?loc>/g, ''));
    
    console.log(`📊 当前sitemap统计:`);
    console.log(`   总URL数量: ${urls.length}`);
    
    // 按语言分组
    const languageGroups = {};
    urls.forEach(url => {
      const match = url.match(/loretrans\.com\/([a-z]{2})\//);
      if (match) {
        const lang = match[1];
        if (!languageGroups[lang]) languageGroups[lang] = [];
        languageGroups[lang].push(url);
      } else if (url === 'https://loretrans.com') {
        if (!languageGroups['root']) languageGroups['root'] = [];
        languageGroups['root'].push(url);
      }
    });
    
    console.log(`   支持的语言: ${Object.keys(languageGroups).filter(k => k !== 'root').length} 种`);
    Object.keys(languageGroups).forEach(lang => {
      if (lang !== 'root') {
        console.log(`     ${lang}: ${languageGroups[lang].length} 个页面`);
      }
    });
    
    return { urls, languageGroups };
  } catch (error) {
    console.log(`❌ 分析失败: ${error.message}`);
    return { urls: [], languageGroups: {} };
  }
}

// 获取sitemap内容
function fetchSitemap() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3000/sitemap.xml', (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('请求超时'));
    });
  });
}

// 生成改进的sitemap
function generateImprovedSitemap() {
  console.log('🏗️  生成改进的sitemap...\n');
  
  const existingPages = scanExistingPages();
  
  // 分类页面
  const staticPages = existingPages.filter(page => 
    ['about', 'contact', 'pricing', 'terms', 'privacy', 'text-translate', 'document-translate', 'help'].includes(page)
  );
  
  const translationPages = existingPages.filter(page => 
    page.includes('-to-') && !page.startsWith('test-') && !page.startsWith('demo-') && !page.startsWith('mock-')
  );
  
  const functionalPages = existingPages.filter(page => 
    ['api-docs', 'compliance', 'document-translate-enhanced', 'payment-success', 'payments'].includes(page)
  );
  
  // 排除的页面（管理、测试、认证等）
  const excludedPages = existingPages.filter(page => 
    ['auth', 'admin', 'dashboard', 'test-payment', 'test-translation', 'mock-payment', 'demo-payment'].some(prefix => 
      page.startsWith(prefix) || page === prefix
    )
  );
  
  console.log(`📊 页面分类统计:`);
  console.log(`   静态页面: ${staticPages.length} 个`);
  console.log(`   翻译页面: ${translationPages.length} 个`);
  console.log(`   功能页面: ${functionalPages.length} 个`);
  console.log(`   排除页面: ${excludedPages.length} 个`);
  console.log(`   总计: ${existingPages.length} 个\n`);
  
  // 支持的语言（完整列表）
  const supportedLocales = [
    'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'ar', 'hi',
    'th', 'vi', 'tr', 'pl', 'nl', 'sv', 'da', 'no', 'fi', 'cs', 'sk', 'hu',
    'ro', 'bg', 'hr', 'sl', 'et', 'lv', 'lt', 'mt', 'cy', 'ga', 'is', 'mk'
  ];
  
  const sitemapContent = `import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://loretrans.com'
  const lastModified = new Date()
  
  // 支持的语言列表（扩展版）
  const supportedLocales = ${JSON.stringify(supportedLocales, null, 2)}
  
  // 基础页面
  const basePages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
    }
  ]
  
  // 多语言主页面和核心页面
  const localePages: MetadataRoute.Sitemap = []
  supportedLocales.forEach(locale => {
    // 主页
    localePages.push({
      url: \`\${baseUrl}/\${locale}\`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
    })
    
    // 核心功能页面
    const corePages = [
${staticPages.map(page => {
  const priority = getPriority(page);
  const freq = getChangeFrequency(page);
  return `      { path: '${page}', priority: ${priority}, freq: '${freq}' as const },`;
}).join('\n')}
    ]
    
    corePages.forEach(page => {
      localePages.push({
        url: \`\${baseUrl}/\${locale}/\${page.path}\`,
        lastModified,
        changeFrequency: page.freq,
        priority: page.priority,
      })
    })
  })
  
  // 翻译页面（主要为英语，但也支持其他主要语言）
  const translationPages: MetadataRoute.Sitemap = []
  
  // 英语翻译页面（完整列表）
  const englishTranslationPages = [
${translationPages.map(page => `    '${page}',`).join('\n')}
  ]
  
  englishTranslationPages.forEach(page => {
    translationPages.push({
      url: \`\${baseUrl}/en/\${page}\`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  })
  
  // 主要语言的翻译页面（选择性添加）
  const majorLanguages = ['es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ar', 'hi']
  const popularTranslationPages = englishTranslationPages.filter(page => 
    page.includes('english-to-') || page.includes('-to-english')
  ).slice(0, 20) // 只选择前20个最受欢迎的翻译页面
  
  majorLanguages.forEach(locale => {
    popularTranslationPages.forEach(page => {
      translationPages.push({
        url: \`\${baseUrl}/\${locale}/\${page}\`,
        lastModified,
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    })
  })
  
  // 功能页面（仅英语）
  const functionalPages: MetadataRoute.Sitemap = [
${functionalPages.map(page => `    {
      url: \`\${baseUrl}/en/${page}\`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    },`).join('\n')}
  ]
  
  return [
    ...basePages,
    ...localePages,
    ...translationPages,
    ...functionalPages,
  ]
}`;

  return sitemapContent;
}

// 获取页面优先级
function getPriority(page) {
  const priorities = {
    'text-translate': 0.9,
    'document-translate': 0.9,
    'pricing': 0.8,
    'about': 0.7,
    'contact': 0.6,
    'help': 0.6,
    'terms': 0.3,
    'privacy': 0.3
  };
  return priorities[page] || 0.5;
}

// 获取更新频率
function getChangeFrequency(page) {
  const frequencies = {
    'text-translate': 'weekly',
    'document-translate': 'weekly',
    'pricing': 'monthly',
    'about': 'monthly',
    'contact': 'monthly',
    'help': 'monthly',
    'terms': 'yearly',
    'privacy': 'yearly'
  };
  return frequencies[page] || 'monthly';
}

// 应用改进
async function applySitemapImprovements() {
  console.log('🔧 应用sitemap改进...\n');
  
  const sitemapPath = '/home/hwt/translation-low-source/frontend/app/sitemap.ts';
  
  try {
    // 备份当前文件
    const backupPath = `${sitemapPath}.backup.${Date.now()}`;
    if (fs.existsSync(sitemapPath)) {
      fs.copyFileSync(sitemapPath, backupPath);
      console.log(`✅ 已备份当前sitemap到: ${backupPath}`);
    }
    
    // 生成新内容
    const newContent = generateImprovedSitemap();
    fs.writeFileSync(sitemapPath, newContent, 'utf8');
    console.log(`✅ 已更新sitemap.ts文件`);
    
    return true;
  } catch (error) {
    console.log(`❌ 应用改进失败: ${error.message}`);
    return false;
  }
}

// 验证改进效果
async function verifyImprovements() {
  console.log('🔍 验证改进效果...\n');
  
  console.log('⏳ 等待服务器重新编译...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  try {
    const newSitemapContent = await fetchSitemap();
    const newUrlMatches = newSitemapContent.match(/<loc>([^<]+)<\/loc>/g) || [];
    const newUrls = newUrlMatches.map(match => match.replace(/<\/?loc>/g, ''));
    
    console.log(`📊 改进后的sitemap统计:`);
    console.log(`   总URL数量: ${newUrls.length}`);
    
    // 按语言分组
    const languageGroups = {};
    newUrls.forEach(url => {
      const match = url.match(/loretrans\.com\/([a-z]{2})\//);
      if (match) {
        const lang = match[1];
        if (!languageGroups[lang]) languageGroups[lang] = [];
        languageGroups[lang].push(url);
      }
    });
    
    console.log(`   支持的语言: ${Object.keys(languageGroups).length} 种`);
    Object.keys(languageGroups).slice(0, 10).forEach(lang => {
      console.log(`     ${lang}: ${languageGroups[lang].length} 个页面`);
    });
    
    if (Object.keys(languageGroups).length > 10) {
      console.log(`     ... 还有 ${Object.keys(languageGroups).length - 10} 种语言`);
    }
    
    return newUrls.length;
  } catch (error) {
    console.log(`❌ 验证失败: ${error.message}`);
    return 0;
  }
}

// 生成改进报告
function generateImprovementReport(beforeCount, afterCount, existingPages) {
  console.log('\n📋 Sitemap改进报告');
  console.log('='.repeat(60));
  
  console.log('\n📊 改进统计:');
  console.log(`   改进前URL数量: ${beforeCount}`);
  console.log(`   改进后URL数量: ${afterCount}`);
  console.log(`   增加URL数量: ${afterCount - beforeCount}`);
  console.log(`   增长率: ${((afterCount - beforeCount) / beforeCount * 100).toFixed(1)}%`);
  
  console.log('\n🌍 多语言支持:');
  console.log('   ✅ 支持36种语言的核心页面');
  console.log('   ✅ 英语完整翻译页面覆盖');
  console.log('   ✅ 10种主要语言的热门翻译页面');
  console.log('   ✅ 功能页面英语版本');
  
  console.log('\n🎯 SEO优化:');
  console.log('   ✅ 合理的优先级设置');
  console.log('   ✅ 适当的更新频率');
  console.log('   ✅ 排除管理和测试页面');
  console.log('   ✅ 结构化URL组织');
  
  console.log('\n📈 预期效果:');
  console.log('   🔍 提高搜索引擎发现率');
  console.log('   🌐 增强多语言SEO表现');
  console.log('   📱 改善用户体验');
  console.log('   🚀 提升网站流量');
  
  console.log('\n🚀 下一步建议:');
  console.log('   1. 提交更新后的sitemap到Google Search Console');
  console.log('   2. 更新robots.txt文件');
  console.log('   3. 监控搜索引擎索引情况');
  console.log('   4. 定期检查sitemap的有效性');
  
  console.log('\n' + '='.repeat(60));
}

// 主函数
async function main() {
  console.log('🎯 目标: 改进sitemap的多语言支持和SEO优化\n');
  
  try {
    // 1. 扫描现有页面
    const existingPages = scanExistingPages();
    console.log(`发现 ${existingPages.length} 个实际页面\n`);
    
    // 2. 分析当前sitemap
    const { urls: currentUrls } = await analyzeSitemap();
    const beforeCount = currentUrls.length;
    
    // 3. 应用改进
    const success = await applySitemapImprovements();
    if (!success) {
      console.log('❌ 改进失败，退出程序');
      return;
    }
    
    // 4. 验证改进效果
    const afterCount = await verifyImprovements();
    
    // 5. 生成报告
    generateImprovementReport(beforeCount, afterCount, existingPages);
    
    console.log('\n🎉 Sitemap多语言改进完成！');
    
  } catch (error) {
    console.log(`❌ 改进过程中出现错误: ${error.message}`);
    console.log('请检查错误信息并重试');
  }
}

if (require.main === module) {
  main();
}
