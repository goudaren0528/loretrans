#!/usr/bin/env node

const fs = require('fs');

console.log('🔍 分析Vercel环境变量生效性...\n');

function parseEnvFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  
  content.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  return env;
}

function analyzeVercelEnvBehavior() {
  console.log('📋 分析 .env.production 中的环境变量...\n');
  
  const envVars = parseEnvFile('.env.production');
  
  const categories = {
    nextPublic: [],      // NEXT_PUBLIC_ 开头的变量
    serverOnly: [],      // 服务端变量
    buildTime: [],       // 构建时需要的变量
    runtime: []          // 运行时变量
  };
  
  Object.keys(envVars).forEach(key => {
    if (key.startsWith('NEXT_PUBLIC_')) {
      categories.nextPublic.push(key);
    } else if (key.includes('URL') || key.includes('API_KEY') || key.includes('SECRET')) {
      categories.serverOnly.push(key);
    } else if (key.includes('PORT') || key.includes('LIMIT') || key.includes('SIZE')) {
      categories.buildTime.push(key);
    } else {
      categories.runtime.push(key);
    }
  });
  
  console.log('🔴 需要在Vercel Dashboard手动配置的变量:');
  console.log('   (这些变量在 .env.production 中可能不会生效)');
  categories.nextPublic.forEach(key => {
    console.log(`   ❌ ${key} - NEXT_PUBLIC_变量需要构建时确定`);
  });
  
  console.log('\n🟡 可能需要手动配置的变量:');
  console.log('   (敏感信息建议在Dashboard配置)');
  categories.serverOnly.forEach(key => {
    console.log(`   ⚠️  ${key} - 敏感信息，建议Dashboard配置`);
  });
  
  console.log('\n🟢 应该能从 .env.production 自动读取的变量:');
  console.log('   (这些变量通常能正常工作)');
  [...categories.buildTime, ...categories.runtime].forEach(key => {
    console.log(`   ✅ ${key} - 应该能自动读取`);
  });
  
  return categories;
}

function generateRecommendations(categories) {
  console.log('\n💡 配置建议:\n');
  
  console.log('### 方案1: 最小配置 (推荐)');
  console.log('只在Vercel Dashboard配置必需的变量:');
  categories.nextPublic.forEach(key => {
    console.log(`- ${key}`);
  });
  
  const sensitiveVars = categories.serverOnly.filter(key => 
    key.includes('SECRET') || key.includes('KEY') || key.includes('TOKEN')
  );
  
  if (sensitiveVars.length > 0) {
    console.log('\n敏感变量也建议在Dashboard配置:');
    sensitiveVars.forEach(key => {
      console.log(`- ${key}`);
    });
  }
  
  console.log('\n### 方案2: 完全配置');
  console.log('将所有变量都配置到Vercel Dashboard (更安全):');
  Object.keys(parseEnvFile('.env.production')).forEach(key => {
    console.log(`- ${key}`);
  });
  
  console.log('\n### 方案3: 混合配置 (当前推荐)');
  console.log('Dashboard配置: NEXT_PUBLIC_* 和敏感变量');
  console.log('.env.production: 其他配置变量');
}

function createVercelEnvScript(categories) {
  console.log('\n📝 生成Vercel环境变量配置脚本...');
  
  const envVars = parseEnvFile('.env.production');
  const essentialVars = [...categories.nextPublic];
  
  // 添加敏感变量
  categories.serverOnly.forEach(key => {
    if (key.includes('SECRET') || key.includes('KEY') || key.includes('TOKEN')) {
      essentialVars.push(key);
    }
  });
  
  let script = `#!/bin/bash
# Vercel环境变量配置脚本 - 必需变量
echo "🚀 配置Vercel必需环境变量..."
echo ""

`;

  essentialVars.forEach(key => {
    const value = envVars[key];
    script += `echo "设置 ${key}..."
vercel env add ${key} production <<< "${value}"
echo ""

`;
  });
  
  script += `echo "✅ 必需环境变量配置完成!"
echo ""
echo "📋 检查配置结果:"
vercel env ls
echo ""
echo "🚀 重新部署:"
vercel --prod
`;

  fs.writeFileSync('setup-essential-env.sh', script);
  fs.chmodSync('setup-essential-env.sh', '755');
  console.log('✅ 已创建 setup-essential-env.sh');
  
  // 创建完整配置脚本
  let fullScript = `#!/bin/bash
# Vercel环境变量完整配置脚本
echo "🚀 配置所有Vercel环境变量..."
echo ""

`;

  Object.entries(envVars).forEach(([key, value]) => {
    fullScript += `echo "设置 ${key}..."
vercel env add ${key} production <<< "${value}"
echo ""

`;
  });
  
  fullScript += `echo "✅ 所有环境变量配置完成!"
echo ""
echo "📋 检查配置结果:"
vercel env ls
echo ""
echo "🚀 重新部署:"
vercel --prod
`;

  fs.writeFileSync('setup-all-env.sh', fullScript);
  fs.chmodSync('setup-all-env.sh', '755');
  console.log('✅ 已创建 setup-all-env.sh');
}

function main() {
  console.log('🚀 开始分析Vercel环境变量处理...\n');
  
  try {
    const categories = analyzeVercelEnvBehavior();
    generateRecommendations(categories);
    createVercelEnvScript(categories);
    
    console.log('\n📊 总结:');
    console.log('✅ 大部分服务端变量应该能从 .env.production 自动读取');
    console.log('❌ NEXT_PUBLIC_ 变量需要在Vercel Dashboard手动配置');
    console.log('⚠️  敏感变量建议在Dashboard配置以提高安全性');
    
    console.log('\n🎯 推荐做法:');
    console.log('1. 先只配置 NEXT_PUBLIC_ 变量到Dashboard');
    console.log('2. 部署后测试其他变量是否正常工作');
    console.log('3. 如有问题，再逐步添加到Dashboard');
    
  } catch (error) {
    console.error('💥 分析过程出错:', error.message);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  analyzeVercelEnvBehavior,
  parseEnvFile
};
