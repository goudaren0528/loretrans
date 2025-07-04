#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🏥 项目健康检查工具');
console.log('================================================================================\n');

const frontendDir = path.join(__dirname, '../frontend');
const rootDir = path.join(__dirname, '..');

let issues = [];
let warnings = [];
let suggestions = [];

// 检查package.json依赖
function checkDependencies() {
  console.log('📦 检查依赖配置...');
  
  const packageJsonPath = path.join(frontendDir, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    issues.push('❌ 缺少 package.json');
    return;
  }
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // 检查关键依赖
    const requiredDeps = [
      'next',
      'react',
      'react-dom',
      'next-intl',
      '@supabase/supabase-js'
    ];
    
    const missingDeps = requiredDeps.filter(dep => 
      !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]
    );
    
    if (missingDeps.length > 0) {
      issues.push(`❌ 缺少关键依赖: ${missingDeps.join(', ')}`);
    }
    
    // 检查脚本
    const requiredScripts = ['dev', 'build', 'start'];
    const missingScripts = requiredScripts.filter(script => !packageJson.scripts?.[script]);
    
    if (missingScripts.length > 0) {
      warnings.push(`⚠️  缺少脚本: ${missingScripts.join(', ')}`);
    }
    
  } catch (error) {
    issues.push(`❌ package.json 格式错误: ${error.message}`);
  }
}

// 检查环境变量
function checkEnvironmentVariables() {
  console.log('🔐 检查环境变量配置...');
  
  const envLocalPath = path.join(frontendDir, '.env.local');
  const envExamplePath = path.join(frontendDir, '.env.example');
  
  if (!fs.existsSync(envLocalPath)) {
    warnings.push('⚠️  缺少 .env.local 文件');
  } else {
    try {
      const envContent = fs.readFileSync(envLocalPath, 'utf8');
      
      // 检查关键环境变量
      const requiredEnvVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
        'NLLB_SERVICE_URL'
      ];
      
      const missingEnvVars = requiredEnvVars.filter(envVar => 
        !envContent.includes(envVar)
      );
      
      if (missingEnvVars.length > 0) {
        warnings.push(`⚠️  可能缺少环境变量: ${missingEnvVars.join(', ')}`);
      }
      
    } catch (error) {
      issues.push(`❌ 无法读取 .env.local: ${error.message}`);
    }
  }
  
  if (!fs.existsSync(envExamplePath)) {
    suggestions.push('💡 建议添加 .env.example 文件作为环境变量模板');
  }
}

// 检查TypeScript配置
function checkTypeScriptConfig() {
  console.log('📝 检查TypeScript配置...');
  
  const tsconfigPath = path.join(frontendDir, 'tsconfig.json');
  if (!fs.existsSync(tsconfigPath)) {
    warnings.push('⚠️  缺少 tsconfig.json');
    return;
  }
  
  try {
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    
    // 检查关键配置
    if (!tsconfig.compilerOptions?.strict) {
      suggestions.push('💡 建议启用 TypeScript strict 模式');
    }
    
    if (!tsconfig.compilerOptions?.baseUrl) {
      suggestions.push('💡 建议配置 baseUrl 以支持绝对导入');
    }
    
  } catch (error) {
    issues.push(`❌ tsconfig.json 格式错误: ${error.message}`);
  }
}

// 检查Next.js配置
function checkNextConfig() {
  console.log('⚙️  检查Next.js配置...');
  
  const nextConfigPath = path.join(frontendDir, 'next.config.js');
  if (!fs.existsSync(nextConfigPath)) {
    warnings.push('⚠️  缺少 next.config.js');
    return;
  }
  
  try {
    const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');
    
    // 检查国际化配置
    if (!nextConfigContent.includes('i18n') && !nextConfigContent.includes('next-intl')) {
      warnings.push('⚠️  Next.js配置可能缺少国际化设置');
    }
    
    // 检查图片优化配置
    if (!nextConfigContent.includes('images')) {
      suggestions.push('💡 建议配置图片优化设置');
    }
    
  } catch (error) {
    issues.push(`❌ 无法读取 next.config.js: ${error.message}`);
  }
}

// 检查Git配置
function checkGitConfig() {
  console.log('📚 检查Git配置...');
  
  const gitignorePath = path.join(rootDir, '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    warnings.push('⚠️  缺少 .gitignore 文件');
    return;
  }
  
  try {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    
    const requiredIgnores = ['.env.local', 'node_modules', '.next'];
    const missingIgnores = requiredIgnores.filter(ignore => 
      !gitignoreContent.includes(ignore)
    );
    
    if (missingIgnores.length > 0) {
      warnings.push(`⚠️  .gitignore 可能缺少: ${missingIgnores.join(', ')}`);
    }
    
  } catch (error) {
    issues.push(`❌ 无法读取 .gitignore: ${error.message}`);
  }
}

// 检查构建输出
function checkBuildOutput() {
  console.log('🏗️  检查构建配置...');
  
  const nextDir = path.join(frontendDir, '.next');
  if (fs.existsSync(nextDir)) {
    suggestions.push('💡 发现 .next 目录，项目已构建过');
  }
  
  const nodeModulesDir = path.join(frontendDir, 'node_modules');
  if (!fs.existsSync(nodeModulesDir)) {
    warnings.push('⚠️  缺少 node_modules，需要运行 npm install');
  }
}

// 检查安全配置
function checkSecurity() {
  console.log('🔒 检查安全配置...');
  
  // 检查是否有敏感文件被意外提交
  const sensitiveFiles = ['.env', '.env.local', '.env.production'];
  const gitDir = path.join(rootDir, '.git');
  
  if (fs.existsSync(gitDir)) {
    sensitiveFiles.forEach(file => {
      const filePath = path.join(frontendDir, file);
      if (fs.existsSync(filePath)) {
        // 这里应该检查文件是否在git中被跟踪，简化处理
        suggestions.push(`💡 确保 ${file} 不被Git跟踪`);
      }
    });
  }
  
  // 检查package.json中的安全配置
  const packageJsonPath = path.join(frontendDir, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      if (!packageJson.scripts?.audit) {
        suggestions.push('💡 建议添加 npm audit 脚本进行安全检查');
      }
      
    } catch (error) {
      // 已在其他地方处理
    }
  }
}

// 检查性能配置
function checkPerformance() {
  console.log('⚡ 检查性能配置...');
  
  // 检查是否有性能监控配置
  const nextConfigPath = path.join(frontendDir, 'next.config.js');
  if (fs.existsSync(nextConfigPath)) {
    try {
      const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');
      
      if (!nextConfigContent.includes('experimental')) {
        suggestions.push('💡 考虑启用Next.js实验性功能以提升性能');
      }
      
      if (!nextConfigContent.includes('compress')) {
        suggestions.push('💡 建议启用gzip压缩');
      }
      
    } catch (error) {
      // 已在其他地方处理
    }
  }
  
  // 检查是否有bundle分析配置
  const packageJsonPath = path.join(frontendDir, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      if (!packageJson.devDependencies?.['@next/bundle-analyzer']) {
        suggestions.push('💡 建议安装bundle分析器监控包大小');
      }
      
    } catch (error) {
      // 已在其他地方处理
    }
  }
}

// 检查测试配置
function checkTesting() {
  console.log('🧪 检查测试配置...');
  
  const jestConfigPath = path.join(frontendDir, 'jest.config.js');
  const testDir = path.join(frontendDir, '__tests__');
  
  if (!fs.existsSync(jestConfigPath) && !fs.existsSync(testDir)) {
    suggestions.push('💡 建议添加测试配置和测试用例');
  }
  
  const packageJsonPath = path.join(frontendDir, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      if (!packageJson.scripts?.test) {
        suggestions.push('💡 建议添加测试脚本');
      }
      
    } catch (error) {
      // 已在其他地方处理
    }
  }
}

// 主检查函数
function runHealthCheck() {
  checkDependencies();
  checkEnvironmentVariables();
  checkTypeScriptConfig();
  checkNextConfig();
  checkGitConfig();
  checkBuildOutput();
  checkSecurity();
  checkPerformance();
  checkTesting();
  
  console.log('\n📊 健康检查结果:');
  console.log('================================================================================');
  
  const totalIssues = issues.length + warnings.length + suggestions.length;
  
  if (totalIssues === 0) {
    console.log('✅ 项目健康状况良好！没有发现问题。');
  } else {
    console.log(`发现 ${totalIssues} 个项目健康相关的项目:\n`);
    
    if (issues.length > 0) {
      console.log('🚨 关键问题 (需要立即修复):');
      issues.forEach(issue => console.log(issue));
      console.log('');
    }
    
    if (warnings.length > 0) {
      console.log('⚠️  警告 (建议修复):');
      warnings.forEach(warning => console.log(warning));
      console.log('');
    }
    
    if (suggestions.length > 0) {
      console.log('💡 建议 (可选优化):');
      suggestions.forEach(suggestion => console.log(suggestion));
      console.log('');
    }
  }
  
  console.log('📋 健康检查摘要:');
  console.log(`- 关键问题: ${issues.length}`);
  console.log(`- 警告: ${warnings.length}`);
  console.log(`- 建议: ${suggestions.length}`);
  console.log('================================================================================');
  
  // 返回适当的退出码
  process.exit(issues.length > 0 ? 1 : 0);
}

// 运行健康检查
runHealthCheck();
