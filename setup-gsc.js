#!/usr/bin/env node

const fs = require('fs');

console.log('🔍 设置Google Search Console验证...\n');

// 检查GSC验证文件
function checkGSCFile() {
  const gscFile = '/home/hwt/translation-low-source/frontend/public/google9879f9edb25bbe5e.html';
  
  try {
    if (fs.existsSync(gscFile)) {
      const content = fs.readFileSync(gscFile, 'utf8');
      console.log('✅ GSC验证文件存在');
      console.log(`   位置: frontend/public/google9879f9edb25bbe5e.html`);
      console.log(`   内容: ${content.trim()}`);
      console.log(`   大小: ${content.length} 字节`);
      return true;
    } else {
      console.log('❌ GSC验证文件不存在');
      return false;
    }
  } catch (error) {
    console.log(`❌ 检查GSC文件失败: ${error.message}`);
    return false;
  }
}

// 更新robots.ts以允许GSC文件
function updateRobotsForGSC() {
  const robotsPath = '/home/hwt/translation-low-source/frontend/app/robots.ts';
  
  try {
    let content = fs.readFileSync(robotsPath, 'utf8');
    
    // 检查是否已经允许google验证文件
    if (!content.includes('Allow: /google')) {
      // 在Allow: /之后添加google文件的允许规则
      content = content.replace(
        "allow: '/',",
        "allow: ['/', '/google*.html'],"
      );
      
      fs.writeFileSync(robotsPath, content, 'utf8');
      console.log('✅ 已更新robots.ts允许GSC验证文件');
      return true;
    } else {
      console.log('⚠️  robots.ts已配置GSC文件访问');
      return true;
    }
  } catch (error) {
    console.log(`❌ 更新robots.ts失败: ${error.message}`);
    return false;
  }
}

// 创建Next.js配置以处理GSC文件
function updateNextConfigForGSC() {
  const configPath = '/home/hwt/translation-low-source/frontend/next.config.js';
  
  try {
    let content = fs.readFileSync(configPath, 'utf8');
    
    // 检查是否已经有GSC重写规则
    if (!content.includes('google*.html')) {
      // 查找rewrites函数并添加GSC规则
      if (content.includes('async rewrites()')) {
        // 在现有rewrites中添加
        const rewriteRule = `      // Google Search Console verification
      {
        source: '/google:verification*.html',
        destination: '/google:verification*.html',
      },`;
        
        content = content.replace(
          'return [',
          `return [\n${rewriteRule}`
        );
      } else {
        // 添加新的rewrites函数
        const rewritesConfig = `
  async rewrites() {
    return [
      // Google Search Console verification
      {
        source: '/google:verification*.html',
        destination: '/google:verification*.html',
      },
    ];
  },`;
        
        content = content.replace(
          'const nextConfig = {',
          `const nextConfig = {${rewritesConfig}`
        );
      }
      
      fs.writeFileSync(configPath, content, 'utf8');
      console.log('✅ 已更新next.config.js支持GSC文件');
      return true;
    } else {
      console.log('⚠️  next.config.js已配置GSC支持');
      return true;
    }
  } catch (error) {
    console.log(`❌ 更新next.config.js失败: ${error.message}`);
    return false;
  }
}

// 更新HTML meta标签
function updateMetaTags() {
  const layoutPath = '/home/hwt/translation-low-source/frontend/app/[locale]/layout.tsx';
  
  try {
    let content = fs.readFileSync(layoutPath, 'utf8');
    
    // 检查是否已经有GSC meta标签
    if (!content.includes('google9879f9edb25bbe5e')) {
      // 查找现有的google-site-verification并替换
      if (content.includes('google-site-verification')) {
        content = content.replace(
          /content="[^"]*"/,
          'content="google9879f9edb25bbe5e"'
        );
      } else {
        // 添加新的meta标签
        const metaTag = '        <meta name="google-site-verification" content="google9879f9edb25bbe5e" />';
        
        // 在head部分添加
        content = content.replace(
          '<head>',
          `<head>\n${metaTag}`
        );
      }
      
      fs.writeFileSync(layoutPath, content, 'utf8');
      console.log('✅ 已更新layout.tsx添加GSC meta标签');
      return true;
    } else {
      console.log('⚠️  layout.tsx已包含GSC meta标签');
      return true;
    }
  } catch (error) {
    console.log(`❌ 更新layout.tsx失败: ${error.message}`);
    return false;
  }
}

// 测试GSC文件访问
async function testGSCAccess() {
  const http = require('http');
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/google9879f9edb25bbe5e.html',
      method: 'GET',
      timeout: 10000
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          success: res.statusCode === 200,
          content: data.trim(),
          contentType: res.headers['content-type']
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        success: false,
        error: err.message
      });
    });

    req.on('timeout', () => {
      resolve({
        success: false,
        error: '请求超时'
      });
    });

    req.end();
  });
}

// 生成GSC设置报告
function generateGSCReport() {
  console.log('\n📊 Google Search Console设置报告:\n');
  
  const files = [
    { path: '/home/hwt/translation-low-source/frontend/public/google9879f9edb25bbe5e.html', name: 'GSC验证文件' },
    { path: '/home/hwt/translation-low-source/frontend/public/sitemap.xml', name: 'Sitemap文件' },
    { path: '/home/hwt/translation-low-source/frontend/app/robots.ts', name: 'Robots配置' },
  ];
  
  files.forEach(file => {
    const exists = fs.existsSync(file.path);
    console.log(`   ${exists ? '✅' : '❌'} ${file.name}`);
  });
  
  console.log('\n🔗 GSC验证方法:');
  console.log('   方法1: HTML文件验证 - https://loretrans.com/google9879f9edb25bbe5e.html');
  console.log('   方法2: Meta标签验证 - <meta name="google-site-verification" content="google9879f9edb25bbe5e" />');
  
  console.log('\n📋 提交到GSC的资源:');
  console.log('   - Sitemap: https://loretrans.com/sitemap.xml');
  console.log('   - 主域名: https://loretrans.com');
  console.log('   - 主要页面: https://loretrans.com/en');
}

// 主函数
async function main() {
  console.log('🎯 目标: 完整设置Google Search Console验证\n');
  
  const results = {
    checkFile: checkGSCFile(),
    updateRobots: updateRobotsForGSC(),
    updateNextConfig: updateNextConfigForGSC(),
    updateMeta: updateMetaTags(),
  };
  
  console.log('\n⏳ 测试GSC文件访问...');
  const accessTest = await testGSCAccess();
  
  console.log('\n📊 设置总结:');
  Object.entries(results).forEach(([key, success]) => {
    console.log(`   ${key}: ${success ? '✅ 成功' : '❌ 失败'}`);
  });
  
  console.log(`   文件访问测试: ${accessTest.success ? '✅ 成功' : '❌ 失败'}`);
  
  if (accessTest.success) {
    console.log(`   访问状态: ${accessTest.statusCode}`);
    console.log(`   返回内容: ${accessTest.content}`);
  } else {
    console.log(`   访问错误: ${accessTest.error || '未知错误'}`);
  }
  
  generateGSCReport();
  
  const allSuccess = Object.values(results).every(r => r) && accessTest.success;
  
  if (allSuccess) {
    console.log('\n🎉 GSC设置完成！');
    console.log('\n📝 设置内容:');
    console.log('✅ GSC验证文件已正确放置在public目录');
    console.log('✅ robots.ts已配置允许GSC文件访问');
    console.log('✅ next.config.js已配置GSC文件路由');
    console.log('✅ layout.tsx已添加GSC meta标签');
    console.log('✅ 文件可以正常访问');
    
    console.log('\n🚀 下一步操作:');
    console.log('1. 在GSC中验证网站所有权');
    console.log('2. 提交sitemap: https://loretrans.com/sitemap.xml');
    console.log('3. 监控索引状态和搜索性能');
    console.log('4. 检查移动设备友好性');
    console.log('5. 设置数据监控和报告');
  } else {
    console.log('\n⚠️  部分设置可能不完整，请检查上述错误');
    
    console.log('\n💡 故障排除建议:');
    console.log('- 确保开发服务器正在运行');
    console.log('- 检查文件权限和路径');
    console.log('- 重新启动开发服务器');
    console.log('- 验证Next.js配置语法');
  }
  
  console.log('\n✨ 设置完成!');
}

if (require.main === module) {
  main();
}
