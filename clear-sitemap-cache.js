#!/usr/bin/env node

const fs = require('fs');
const http = require('http');
const path = require('path');

console.log('🧹 Sitemap缓存清理和验证工具\n');

// 清理所有可能的sitemap缓存
async function clearAllSitemapCache() {
  console.log('🔧 清理所有sitemap相关缓存...\n');
  
  const cleanupTasks = [];
  
  // 1. 删除静态sitemap文件
  const staticSitemapPath = '/home/hwt/translation-low-source/frontend/public/sitemap.xml';
  if (fs.existsSync(staticSitemapPath)) {
    try {
      fs.unlinkSync(staticSitemapPath);
      cleanupTasks.push('✅ 删除静态sitemap.xml文件');
    } catch (error) {
      cleanupTasks.push(`❌ 删除静态sitemap.xml失败: ${error.message}`);
    }
  } else {
    cleanupTasks.push('ℹ️  静态sitemap.xml文件不存在');
  }
  
  // 2. 清理Next.js缓存
  const nextCacheDir = '/home/hwt/translation-low-source/frontend/.next';
  if (fs.existsSync(nextCacheDir)) {
    try {
      // 删除.next目录
      fs.rmSync(nextCacheDir, { recursive: true, force: true });
      cleanupTasks.push('✅ 清理Next.js缓存目录');
    } catch (error) {
      cleanupTasks.push(`❌ 清理Next.js缓存失败: ${error.message}`);
    }
  }
  
  // 3. 检查是否有其他sitemap文件
  const publicDir = '/home/hwt/translation-low-source/frontend/public';
  try {
    const files = fs.readdirSync(publicDir);
    const sitemapFiles = files.filter(file => file.includes('sitemap'));
    if (sitemapFiles.length > 0) {
      cleanupTasks.push(`⚠️  发现其他sitemap文件: ${sitemapFiles.join(', ')}`);
    }
  } catch (error) {
    cleanupTasks.push(`❌ 检查public目录失败: ${error.message}`);
  }
  
  return cleanupTasks;
}

// 重新构建项目
async function rebuildProject() {
  console.log('🏗️  重新构建项目...\n');
  
  return new Promise((resolve) => {
    const { spawn } = require('child_process');
    
    const buildProcess = spawn('npm', ['run', 'build'], {
      cwd: '/home/hwt/translation-low-source/frontend',
      stdio: 'pipe'
    });
    
    let output = '';
    let errorOutput = '';
    
    buildProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    buildProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    buildProcess.on('close', (code) => {
      if (code === 0) {
        resolve({
          success: true,
          message: '✅ 项目重新构建成功'
        });
      } else {
        resolve({
          success: false,
          message: `❌ 构建失败 (退出码: ${code})`,
          error: errorOutput
        });
      }
    });
    
    // 超时处理
    setTimeout(() => {
      buildProcess.kill();
      resolve({
        success: false,
        message: '❌ 构建超时'
      });
    }, 120000); // 2分钟超时
  });
}

// 重启开发服务器
async function restartDevServer() {
  console.log('🔄 重启开发服务器...\n');
  
  const { spawn } = require('child_process');
  
  // 停止现有服务器
  try {
    const { execSync } = require('child_process');
    execSync('pkill -f "next dev"', { stdio: 'ignore' });
    console.log('✅ 停止现有开发服务器');
    
    // 等待进程完全停止
    await new Promise(resolve => setTimeout(resolve, 2000));
  } catch (error) {
    console.log('ℹ️  没有运行中的开发服务器');
  }
  
  // 启动新的服务器
  return new Promise((resolve) => {
    const devProcess = spawn('npm', ['run', 'dev'], {
      cwd: '/home/hwt/translation-low-source/frontend',
      stdio: 'pipe',
      detached: true
    });
    
    let startupOutput = '';
    
    devProcess.stdout.on('data', (data) => {
      startupOutput += data.toString();
      if (startupOutput.includes('Ready') || startupOutput.includes('started server')) {
        resolve({
          success: true,
          message: '✅ 开发服务器启动成功',
          pid: devProcess.pid
        });
      }
    });
    
    devProcess.stderr.on('data', (data) => {
      startupOutput += data.toString();
    });
    
    devProcess.on('error', (error) => {
      resolve({
        success: false,
        message: `❌ 启动开发服务器失败: ${error.message}`
      });
    });
    
    // 超时处理
    setTimeout(() => {
      resolve({
        success: true,
        message: '⏰ 服务器启动中...',
        pid: devProcess.pid
      });
    }, 10000);
  });
}

// 验证新的sitemap
async function verifySitemap() {
  console.log('🔍 验证新的sitemap...\n');
  
  // 等待服务器完全启动
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000/sitemap.xml', (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const results = {
          status: res.statusCode,
          size: data.length,
          urlCount: (data.match(/<url>/g) || []).length,
          hasCssContent: data.includes('brand_color') || data.includes('miniApp') || data.includes('html,body'),
          hasMultiLanguage: data.includes('/es/') || data.includes('/fr/') || data.includes('/de/'),
          isValidXml: data.startsWith('<?xml') && data.includes('<urlset'),
          lastModified: new Date().toISOString(),
          sample: data.substring(0, 500) + (data.length > 500 ? '...' : '')
        };
        
        resolve(results);
      });
    });
    
    req.on('error', (error) => {
      resolve({
        status: 'ERROR',
        error: error.message
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        status: 'TIMEOUT',
        error: '请求超时'
      });
    });
  });
}

// 生成详细报告
function generateDetailedReport(cleanupResults, buildResult, serverResult, verificationResult) {
  console.log('📋 详细诊断报告');
  console.log('='.repeat(60));
  
  console.log('\n🧹 缓存清理结果:');
  cleanupResults.forEach(result => {
    console.log(`   ${result}`);
  });
  
  console.log('\n🏗️  项目构建结果:');
  console.log(`   ${buildResult.message}`);
  if (!buildResult.success && buildResult.error) {
    console.log(`   错误详情: ${buildResult.error.substring(0, 200)}...`);
  }
  
  console.log('\n🔄 服务器重启结果:');
  console.log(`   ${serverResult.message}`);
  if (serverResult.pid) {
    console.log(`   进程ID: ${serverResult.pid}`);
  }
  
  console.log('\n🔍 Sitemap验证结果:');
  if (verificationResult.status === 200) {
    console.log(`   ✅ HTTP状态: ${verificationResult.status}`);
    console.log(`   📊 文件大小: ${verificationResult.size} 字节`);
    console.log(`   🔗 URL数量: ${verificationResult.urlCount}`);
    console.log(`   🌍 多语言支持: ${verificationResult.hasMultiLanguage ? '✅ 是' : '❌ 否'}`);
    console.log(`   🎨 CSS污染: ${verificationResult.hasCssContent ? '❌ 存在' : '✅ 无'}`);
    console.log(`   📝 XML格式: ${verificationResult.isValidXml ? '✅ 有效' : '❌ 无效'}`);
    
    console.log('\n📄 Sitemap内容预览:');
    console.log(verificationResult.sample);
    
  } else {
    console.log(`   ❌ 验证失败: ${verificationResult.error || verificationResult.status}`);
  }
  
  console.log('\n💡 问题解决建议:');
  
  if (verificationResult.hasCssContent) {
    console.log('   🚨 仍有CSS污染 - 可能的原因:');
    console.log('      1. 浏览器缓存 - 请强制刷新 (Ctrl+F5)');
    console.log('      2. CDN缓存 - 等待缓存过期');
    console.log('      3. 代理缓存 - 检查网络代理设置');
    console.log('      4. 其他静态文件干扰');
  } else {
    console.log('   ✅ CSS污染已解决');
  }
  
  if (!verificationResult.hasMultiLanguage) {
    console.log('   ⚠️  多语言支持可能需要进一步配置');
  } else {
    console.log('   ✅ 多语言支持正常');
  }
  
  console.log('\n🔗 验证链接:');
  console.log('   • 本地sitemap: http://localhost:3000/sitemap.xml');
  console.log('   • 强制刷新: Ctrl+F5 或 Cmd+Shift+R');
  console.log('   • 无缓存访问: 在浏览器中打开隐私/无痕模式');
  
  console.log('\n' + '='.repeat(60));
}

// 主函数
async function main() {
  console.log('🎯 目标: 彻底解决sitemap的CSS污染问题\n');
  
  try {
    // 1. 清理缓存
    const cleanupResults = await clearAllSitemapCache();
    
    // 2. 重新构建项目
    const buildResult = await rebuildProject();
    
    // 3. 重启开发服务器
    const serverResult = await restartDevServer();
    
    // 4. 验证sitemap
    const verificationResult = await verifySitemap();
    
    // 5. 生成报告
    generateDetailedReport(cleanupResults, buildResult, serverResult, verificationResult);
    
    // 最终状态
    if (verificationResult.status === 200 && !verificationResult.hasCssContent) {
      console.log('\n🎉 问题已解决！Sitemap现在是干净的，没有CSS污染。');
    } else {
      console.log('\n⚠️  问题可能仍然存在，请检查上述建议。');
    }
    
  } catch (error) {
    console.log(`❌ 执行过程中出现错误: ${error.message}`);
  }
}

if (require.main === module) {
  main();
}
