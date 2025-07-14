#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 配置本地环境使用生产配置...\n');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ 文件不存在: ${filePath}`);
    return {};
  }
  
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

function createLocalProductionEnv() {
  console.log('📝 读取生产环境配置...');
  
  // 读取生产环境配置
  const productionEnv = loadEnvFile('.env.production');
  const currentLocalEnv = loadEnvFile('.env.local');
  
  console.log(`✅ 读取到 ${Object.keys(productionEnv).length} 个生产环境变量`);
  console.log(`📋 当前本地环境变量: ${Object.keys(currentLocalEnv).length} 个`);
  
  // 创建备份
  if (fs.existsSync('.env.local')) {
    const backupPath = `.env.local.backup.${Date.now()}`;
    fs.copyFileSync('.env.local', backupPath);
    console.log(`💾 创建备份: ${backupPath}`);
  }
  
  // 合并配置，优先使用生产环境配置
  const mergedEnv = {
    ...currentLocalEnv,
    ...productionEnv,
    // 强制设置本地开发必需的配置
    NODE_ENV: 'development',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    DEBUG: 'true',
    LOG_LEVEL: 'debug'
  };
  
  // 生成新的 .env.local 文件
  let envContent = '# 本地开发环境 - 使用生产配置\n';
  envContent += `# 生成时间: ${new Date().toISOString()}\n`;
  envContent += '# 基于 .env.production 文件生成\n\n';
  
  // 按类别组织环境变量
  const categories = {
    '基础配置': ['NODE_ENV', 'NEXT_PUBLIC_APP_URL', 'DEBUG', 'LOG_LEVEL'],
    'NLLB翻译服务': ['NLLB_SERVICE_URL', 'NLLB_SERVICE_TIMEOUT', 'NLLB_BACKUP_URL', 'NLLB_BACKUP_TIMEOUT'],
    '翻译配置': ['TRANSLATION_MAX_RETRIES', 'TRANSLATION_RETRY_DELAY', 'TRANSLATION_FREE_LIMIT'],
    '文件处理': ['FILE_MAX_SIZE', 'FILE_MAX_PAGES', 'FILE_PROCESSOR_PORT'],
    '性能配置': ['NLLB_BATCH_SIZE', 'NLLB_MAX_CONCURRENT', 'FILE_PROCESSOR_CONCURRENCY'],
    '监控配置': ['ENABLE_HEALTH_CHECK', 'HEALTH_CHECK_INTERVAL', 'ENABLE_DETAILED_LOGGING'],
    'AWS配置': ['ECR_REGISTRY', 'ECR_REPOSITORY', 'AWS_REGION'],
    '其他配置': []
  };
  
  // 添加分类的环境变量
  Object.entries(categories).forEach(([category, keys]) => {
    if (keys.length > 0) {
      envContent += `# ${category}\n`;
      keys.forEach(key => {
        if (mergedEnv[key]) {
          envContent += `${key}=${mergedEnv[key]}\n`;
          delete mergedEnv[key]; // 从剩余变量中移除
        }
      });
      envContent += '\n';
    }
  });
  
  // 添加剩余的环境变量
  const remainingKeys = Object.keys(mergedEnv);
  if (remainingKeys.length > 0) {
    envContent += '# 其他配置\n';
    remainingKeys.forEach(key => {
      envContent += `${key}=${mergedEnv[key]}\n`;
    });
  }
  
  // 写入新的配置文件
  fs.writeFileSync('.env.local', envContent);
  console.log('✅ 生成新的 .env.local 文件');
  
  return mergedEnv;
}

function validateConfiguration(env) {
  console.log('\n🔍 验证配置...');
  
  const requiredVars = [
    'NLLB_SERVICE_URL',
    'NODE_ENV',
    'NEXT_PUBLIC_APP_URL'
  ];
  
  const missing = requiredVars.filter(key => !env[key]);
  
  if (missing.length > 0) {
    console.log('❌ 缺少必需的环境变量:');
    missing.forEach(key => console.log(`  - ${key}`));
    return false;
  }
  
  console.log('✅ 配置验证通过');
  
  // 显示关键配置
  console.log('\n📋 关键配置信息:');
  console.log(`  - 环境模式: ${env.NODE_ENV}`);
  console.log(`  - 应用URL: ${env.NEXT_PUBLIC_APP_URL}`);
  console.log(`  - NLLB服务: ${env.NLLB_SERVICE_URL}`);
  console.log(`  - 调试模式: ${env.DEBUG}`);
  console.log(`  - 日志级别: ${env.LOG_LEVEL}`);
  
  if (env.TRANSLATION_MAX_RETRIES) {
    console.log(`  - 最大重试次数: ${env.TRANSLATION_MAX_RETRIES}`);
  }
  
  if (env.NLLB_MAX_CONCURRENT) {
    console.log(`  - 最大并发数: ${env.NLLB_MAX_CONCURRENT}`);
  }
  
  return true;
}

function main() {
  console.log('🚀 开始配置本地环境使用生产配置...\n');
  
  try {
    // 创建本地生产环境配置
    const env = createLocalProductionEnv();
    
    // 验证配置
    const isValid = validateConfiguration(env);
    
    if (isValid) {
      console.log('\n✅ 配置完成！');
      console.log('\n📝 下一步操作:');
      console.log('1. 重启开发服务器以应用新配置');
      console.log('   ./start-dev.sh --stop');
      console.log('   ./start-dev.sh --background');
      console.log('');
      console.log('2. 验证服务运行状态');
      console.log('   curl http://localhost:3000/api/health');
      console.log('');
      console.log('3. 测试翻译功能');
      console.log('   访问: http://localhost:3000/en/text-translate');
      
      console.log('\n🔧 如需恢复原配置:');
      console.log('   使用备份文件恢复 .env.local');
      
    } else {
      console.log('\n❌ 配置验证失败，请检查环境变量');
    }
    
  } catch (error) {
    console.error('💥 配置过程出错:', error.message);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  createLocalProductionEnv,
  validateConfiguration
};
