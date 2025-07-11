#!/usr/bin/env node

const fs = require('fs');

console.log('🔧 最终修复sitemap.xml问题...\n');

// 创建静态sitemap.xml文件作为备选方案
function createStaticSitemap() {
  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://loretrans.com</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://loretrans.com/en</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://loretrans.com/en/text-translate</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://loretrans.com/en/document-translate</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://loretrans.com/en/about</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://loretrans.com/en/pricing</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://loretrans.com/en/contact</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://loretrans.com/en/igbo-to-english</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://loretrans.com/en/pashto-to-english</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://loretrans.com/en/sindhi-to-english</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://loretrans.com/en/sinhala-to-english</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://loretrans.com/en/amharic-to-english</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://loretrans.com/en/hausa-to-english</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://loretrans.com/en/yoruba-to-english</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://loretrans.com/en/swahili-to-english</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://loretrans.com/en/creole-to-english</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://loretrans.com/en/lao-to-english</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://loretrans.com/en/burmese-to-english</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://loretrans.com/en/telugu-to-english</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://loretrans.com/en/khmer-to-english</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://loretrans.com/en/nepali-to-english</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;

  const sitemapPath = '/home/hwt/translation-low-source/frontend/public/sitemap.xml';
  
  try {
    fs.writeFileSync(sitemapPath, sitemapContent, 'utf8');
    console.log('✅ 已创建静态sitemap.xml文件');
    return true;
  } catch (error) {
    console.log(`❌ 创建静态sitemap.xml失败: ${error.message}`);
    return false;
  }
}

// 删除有问题的动态sitemap.ts
function removeProblematicSitemap() {
  const sitemapTsPath = '/home/hwt/translation-low-source/frontend/app/sitemap.ts';
  
  try {
    if (fs.existsSync(sitemapTsPath)) {
      fs.unlinkSync(sitemapTsPath);
      console.log('✅ 已删除有问题的app/sitemap.ts');
      return true;
    } else {
      console.log('⚠️  app/sitemap.ts不存在');
      return true;
    }
  } catch (error) {
    console.log(`❌ 删除sitemap.ts失败: ${error.message}`);
    return false;
  }
}

// 创建sitemap API路由
function createSitemapAPI() {
  const sitemapApiContent = `import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = 'https://loretrans.com'
  const lastmod = new Date().toISOString()
  
  const urls = [
    { url: baseUrl, priority: '1.0', changefreq: 'weekly' },
    { url: \`\${baseUrl}/en\`, priority: '1.0', changefreq: 'weekly' },
    { url: \`\${baseUrl}/en/text-translate\`, priority: '0.9', changefreq: 'weekly' },
    { url: \`\${baseUrl}/en/document-translate\`, priority: '0.9', changefreq: 'weekly' },
    { url: \`\${baseUrl}/en/about\`, priority: '0.7', changefreq: 'monthly' },
    { url: \`\${baseUrl}/en/pricing\`, priority: '0.8', changefreq: 'monthly' },
    { url: \`\${baseUrl}/en/contact\`, priority: '0.6', changefreq: 'monthly' },
    // 主要翻译页面
    { url: \`\${baseUrl}/en/igbo-to-english\`, priority: '0.8', changefreq: 'weekly' },
    { url: \`\${baseUrl}/en/pashto-to-english\`, priority: '0.8', changefreq: 'weekly' },
    { url: \`\${baseUrl}/en/sindhi-to-english\`, priority: '0.8', changefreq: 'weekly' },
    { url: \`\${baseUrl}/en/sinhala-to-english\`, priority: '0.8', changefreq: 'weekly' },
    { url: \`\${baseUrl}/en/amharic-to-english\`, priority: '0.8', changefreq: 'weekly' },
    { url: \`\${baseUrl}/en/hausa-to-english\`, priority: '0.8', changefreq: 'weekly' },
    { url: \`\${baseUrl}/en/yoruba-to-english\`, priority: '0.8', changefreq: 'weekly' },
    { url: \`\${baseUrl}/en/swahili-to-english\`, priority: '0.8', changefreq: 'weekly' },
    { url: \`\${baseUrl}/en/creole-to-english\`, priority: '0.8', changefreq: 'weekly' },
    { url: \`\${baseUrl}/en/lao-to-english\`, priority: '0.8', changefreq: 'weekly' },
    { url: \`\${baseUrl}/en/burmese-to-english\`, priority: '0.8', changefreq: 'weekly' },
    { url: \`\${baseUrl}/en/telugu-to-english\`, priority: '0.8', changefreq: 'weekly' },
    { url: \`\${baseUrl}/en/khmer-to-english\`, priority: '0.8', changefreq: 'weekly' },
    { url: \`\${baseUrl}/en/nepali-to-english\`, priority: '0.8', changefreq: 'weekly' },
  ]
  
  const sitemap = \`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
\${urls.map(item => \`  <url>
    <loc>\${item.url}</loc>
    <lastmod>\${lastmod}</lastmod>
    <changefreq>\${item.changefreq}</changefreq>
    <priority>\${item.priority}</priority>
  </url>\`).join('\\n')}
</urlset>\`

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}`;

  const apiDir = '/home/hwt/translation-low-source/frontend/app/api';
  const sitemapApiDir = `${apiDir}/sitemap`;
  
  try {
    if (!fs.existsSync(sitemapApiDir)) {
      fs.mkdirSync(sitemapApiDir, { recursive: true });
    }
    
    fs.writeFileSync(`${sitemapApiDir}/route.ts`, sitemapApiContent, 'utf8');
    console.log('✅ 已创建sitemap API路由');
    return true;
  } catch (error) {
    console.log(`❌ 创建sitemap API路由失败: ${error.message}`);
    return false;
  }
}

// 主函数
async function main() {
  console.log('🎯 目标: 使用静态文件和API路由解决sitemap问题\n');
  
  const results = {
    removeTs: removeProblematicSitemap(),
    createStatic: createStaticSitemap(),
    createAPI: createSitemapAPI(),
  };
  
  console.log('\n📊 修复总结:');
  Object.entries(results).forEach(([key, success]) => {
    console.log(`   ${key}: ${success ? '✅ 成功' : '❌ 失败'}`);
  });
  
  const allSuccess = Object.values(results).every(r => r);
  
  if (allSuccess) {
    console.log('\n🎉 最终修复完成！');
    console.log('\n📝 修复方案:');
    console.log('✅ 删除了有问题的动态sitemap.ts');
    console.log('✅ 创建了静态sitemap.xml文件（主要方案）');
    console.log('✅ 创建了sitemap API路由（备选方案）');
    
    console.log('\n🌐 现在可以通过以下方式访问:');
    console.log('- 静态文件: http://localhost:3000/sitemap.xml');
    console.log('- API路由: http://localhost:3000/api/sitemap');
    
    console.log('\n🚀 下一步:');
    console.log('1. 重新启动服务（如果需要）');
    console.log('2. 测试sitemap.xml访问');
    console.log('3. 验证XML格式和内容');
    console.log('4. 提交到Google Search Console');
  } else {
    console.log('\n⚠️  部分修复失败，请检查上述错误');
  }
  
  console.log('\n✨ 修复完成!');
}

if (require.main === module) {
  main();
}
