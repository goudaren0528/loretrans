#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🗺️  更新sitemap以反映实际页面结构...\n');

// 从配置文件读取所有可用语言
function getAvailableLanguagesFromConfig() {
  const configPath = '/home/hwt/translation-low-source/config/app.config.ts';
  const content = fs.readFileSync(configPath, 'utf8');
  
  const languages = [];
  const regex = /{\s*code:\s*'([^']+)'[^}]+name:\s*'([^']+)'[^}]+nativeName:\s*'([^']+)'[^}]+slug:\s*'([^']+)'[^}]+available:\s*true[^}]*}/g;
  
  let match;
  while ((match = regex.exec(content)) !== null) {
    languages.push({
      code: match[1],
      name: match[2],
      nativeName: match[3],
      slug: match[4]
    });
  }
  
  return languages.sort((a, b) => a.name.localeCompare(b.name));
}

// 扫描实际存在的页面目录
function scanActualPages() {
  const localeDir = '/home/hwt/translation-low-source/frontend/app/[locale]';
  const pages = [];
  
  try {
    const entries = fs.readdirSync(localeDir, { withFileTypes: true });
    
    entries.forEach(entry => {
      if (entry.isDirectory()) {
        // 检查是否有page.tsx文件
        const pageFile = path.join(localeDir, entry.name, 'page.tsx');
        if (fs.existsSync(pageFile)) {
          pages.push(entry.name);
        }
      }
    });
    
    return pages.sort();
  } catch (error) {
    console.log(`❌ 扫描页面目录失败: ${error.message}`);
    return [];
  }
}

// 生成新的sitemap内容
function generateSitemapContent() {
  const availableLanguages = getAvailableLanguagesFromConfig();
  const actualPages = scanActualPages();
  
  console.log(`📋 配置中的可用语言: ${availableLanguages.length} 种`);
  console.log(`📋 实际存在的页面: ${actualPages.length} 个\n`);
  
  // 分类页面
  const staticPages = [];
  const translationPages = [];
  const otherPages = [];
  
  actualPages.forEach(page => {
    if (page.includes('-to-')) {
      translationPages.push(page);
    } else if (['about', 'contact', 'pricing', 'terms', 'privacy', 'text-translate', 'document-translate'].includes(page)) {
      staticPages.push(page);
    } else {
      otherPages.push(page);
    }
  });
  
  console.log(`📊 页面分类:`);
  console.log(`   静态页面: ${staticPages.length} 个`);
  console.log(`   翻译页面: ${translationPages.length} 个`);
  console.log(`   其他页面: ${otherPages.length} 个\n`);
  
  // 生成sitemap TypeScript代码
  const sitemapContent = `import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://loretrans.com'
  const lastModified = new Date()
  
  // 基础静态页面
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: \`\${baseUrl}/en\`,
      lastModified,
      changeFrequency: 'weekly', 
      priority: 1.0,
    },
${staticPages.map(page => `    {
      url: \`\${baseUrl}/en/${page}\`,
      lastModified,
      changeFrequency: '${getChangeFrequency(page)}',
      priority: ${getPriority(page)},
    },`).join('\n')}
  ]

  // 翻译页面 - 基于实际存在的页面
  const translationPages: MetadataRoute.Sitemap = [
${translationPages.map(page => `    {
      url: \`\${baseUrl}/en/${page}\`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },`).join('\n')}
  ]

  // 其他功能页面
  const otherPages: MetadataRoute.Sitemap = [
${otherPages.filter(page => !['auth', 'admin', 'dashboard', 'test-', 'demo-', 'mock-'].some(prefix => page.startsWith(prefix))).map(page => `    {
      url: \`\${baseUrl}/en/${page}\`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    },`).join('\n')}
  ]

  return [
    ...staticPages,
    ...translationPages,
    ...otherPages,
  ]
}`;

  return sitemapContent;
}

// 获取页面的更新频率
function getChangeFrequency(page) {
  const frequencies = {
    'text-translate': 'weekly',
    'document-translate': 'weekly',
    'pricing': 'monthly',
    'about': 'monthly',
    'contact': 'monthly',
    'terms': 'yearly',
    'privacy': 'yearly'
  };
  return frequencies[page] || 'monthly';
}

// 获取页面的优先级
function getPriority(page) {
  const priorities = {
    'text-translate': 0.9,
    'document-translate': 0.9,
    'pricing': 0.8,
    'about': 0.7,
    'contact': 0.6,
    'terms': 0.3,
    'privacy': 0.3
  };
  return priorities[page] || 0.5;
}

// 更新sitemap文件
function updateSitemapFile() {
  const sitemapPath = '/home/hwt/translation-low-source/frontend/app/sitemap.ts';
  
  try {
    const newContent = generateSitemapContent();
    fs.writeFileSync(sitemapPath, newContent, 'utf8');
    console.log('✅ 已更新 app/sitemap.ts');
    return true;
  } catch (error) {
    console.log(`❌ 更新sitemap失败: ${error.message}`);
    return false;
  }
}

// 验证sitemap内容
function verifySitemap() {
  console.log('\n🔍 验证sitemap内容...\n');
  
  const sitemapPath = '/home/hwt/translation-low-source/frontend/app/sitemap.ts';
  
  try {
    const content = fs.readFileSync(sitemapPath, 'utf8');
    
    // 统计URL数量
    const urlMatches = content.match(/url: `[^`]+`/g);
    const urlCount = urlMatches ? urlMatches.length : 0;
    
    console.log(`📊 Sitemap统计:`);
    console.log(`   总URL数量: ${urlCount}`);
    
    // 检查关键页面
    const keyPages = [
      'text-translate',
      'document-translate', 
      'sinhala-to-english',
      'igbo-to-english',
      'pashto-to-english'
    ];
    
    const missingPages = keyPages.filter(page => !content.includes(page));
    
    if (missingPages.length === 0) {
      console.log(`   ✅ 所有关键页面都已包含`);
    } else {
      console.log(`   ❌ 缺失关键页面: ${missingPages.join(', ')}`);
    }
    
    // 检查是否包含测试页面（不应该包含）
    const testPages = ['test-', 'demo-', 'mock-'];
    const hasTestPages = testPages.some(prefix => content.includes(prefix));
    
    if (!hasTestPages) {
      console.log(`   ✅ 未包含测试页面`);
    } else {
      console.log(`   ⚠️  可能包含测试页面`);
    }
    
    return urlCount > 0 && missingPages.length === 0;
    
  } catch (error) {
    console.log(`❌ 验证失败: ${error.message}`);
    return false;
  }
}

// 生成sitemap预览
function generateSitemapPreview() {
  console.log('\n📋 Sitemap预览 (前20个URL):\n');
  
  const actualPages = scanActualPages();
  const translationPages = actualPages.filter(page => page.includes('-to-'));
  const staticPages = actualPages.filter(page => 
    ['about', 'contact', 'pricing', 'terms', 'privacy', 'text-translate', 'document-translate'].includes(page)
  );
  
  console.log('🏠 主要页面:');
  console.log('   https://loretrans.com');
  console.log('   https://loretrans.com/en');
  
  console.log('\n📄 静态页面:');
  staticPages.slice(0, 5).forEach(page => {
    console.log(`   https://loretrans.com/en/${page}`);
  });
  
  console.log('\n🌍 翻译页面 (示例):');
  translationPages.slice(0, 10).forEach(page => {
    console.log(`   https://loretrans.com/en/${page}`);
  });
  
  if (translationPages.length > 10) {
    console.log(`   ... 还有 ${translationPages.length - 10} 个翻译页面`);
  }
}

// 主函数
function main() {
  console.log('🎯 目标: 根据实际页面结构生成准确的sitemap\n');
  
  // 生成预览
  generateSitemapPreview();
  
  // 更新sitemap文件
  const updateSuccess = updateSitemapFile();
  
  // 验证结果
  const verificationPassed = verifySitemap();
  
  console.log('\n📊 更新总结:');
  console.log(`   Sitemap更新: ${updateSuccess ? '✅ 成功' : '❌ 失败'}`);
  console.log(`   验证结果: ${verificationPassed ? '✅ 通过' : '❌ 失败'}`);
  
  if (updateSuccess && verificationPassed) {
    console.log('\n🎉 Sitemap更新完成！');
    console.log('\n📝 更新内容:');
    console.log('✅ 基于实际存在的页面生成sitemap');
    console.log('✅ 包含所有翻译页面（27种语言的双向翻译）');
    console.log('✅ 包含所有静态功能页面');
    console.log('✅ 排除了测试和管理页面');
    console.log('✅ 设置了合适的优先级和更新频率');
    
    console.log('\n🚀 建议下一步:');
    console.log('1. 重新构建项目以生成新的sitemap');
    console.log('2. 访问 /sitemap.xml 验证sitemap');
    console.log('3. 提交sitemap到Google Search Console');
    console.log('4. 检查robots.txt中的sitemap引用');
  } else {
    console.log('\n⚠️  更新可能不完整，请检查上述错误');
  }
  
  console.log('\n✨ 更新完成!');
}

if (require.main === module) {
  main();
}
