#!/usr/bin/env node

const fs = require('fs');

console.log('🔍 比较配置文件差异...\n');

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ 文件不存在: ${filePath}`);
    return {};
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  
  content.split('\n').forEach((line, index) => {
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

function compareConfigs() {
  console.log('📋 读取配置文件...');
  
  const productionEnv = parseEnvFile('.env.production');
  const localEnv = parseEnvFile('.env.local');
  const backupEnv = parseEnvFile('.env.local.backup.1752235859559');
  
  console.log(`✅ .env.production: ${Object.keys(productionEnv).length} 个变量`);
  console.log(`✅ .env.local: ${Object.keys(localEnv).length} 个变量`);
  console.log(`✅ .env.local.backup: ${Object.keys(backupEnv).length} 个变量\n`);
  
  // 获取所有唯一的键
  const allKeys = new Set([
    ...Object.keys(productionEnv),
    ...Object.keys(localEnv),
    ...Object.keys(backupEnv)
  ]);
  
  console.log('📊 配置变量对比:\n');
  console.log('变量名'.padEnd(35) + ' | 生产环境'.padEnd(15) + ' | 当前本地'.padEnd(15) + ' | 原本地');
  console.log('-'.repeat(35) + ' | ' + '-'.repeat(13) + ' | ' + '-'.repeat(13) + ' | ' + '-'.repeat(13));
  
  const differences = [];
  const onlyInProduction = [];
  const onlyInLocal = [];
  const valueChanges = [];
  
  Array.from(allKeys).sort().forEach(key => {
    const prodValue = productionEnv[key] || '';
    const localValue = localEnv[key] || '';
    const backupValue = backupEnv[key] || '';
    
    const prodStatus = prodValue ? '✓' : '✗';
    const localStatus = localValue ? '✓' : '✗';
    const backupStatus = backupValue ? '✓' : '✗';
    
    console.log(
      key.padEnd(35) + ' | ' + 
      prodStatus.padEnd(13) + ' | ' + 
      localStatus.padEnd(13) + ' | ' + 
      backupStatus
    );
    
    // 分析差异
    if (prodValue && !localValue) {
      onlyInProduction.push(key);
    } else if (!prodValue && localValue) {
      onlyInLocal.push(key);
    } else if (prodValue && localValue && prodValue !== localValue) {
      valueChanges.push({
        key,
        production: prodValue,
        local: localValue
      });
    }
  });
  
  // 显示差异分析
  console.log('\n📈 差异分析:\n');
  
  if (onlyInProduction.length > 0) {
    console.log('🔴 仅在生产环境中存在的变量:');
    onlyInProduction.forEach(key => {
      console.log(`  - ${key}: ${productionEnv[key]}`);
    });
    console.log('');
  }
  
  if (onlyInLocal.length > 0) {
    console.log('🔵 仅在本地环境中存在的变量:');
    onlyInLocal.forEach(key => {
      console.log(`  - ${key}: ${localEnv[key]}`);
    });
    console.log('');
  }
  
  if (valueChanges.length > 0) {
    console.log('🟡 值不同的变量:');
    valueChanges.forEach(change => {
      console.log(`  - ${change.key}:`);
      console.log(`    生产环境: ${change.production}`);
      console.log(`    本地环境: ${change.local}`);
    });
    console.log('');
  }
  
  // 关键配置检查
  console.log('🔑 关键配置检查:\n');
  
  const criticalVars = [
    'NODE_ENV',
    'NEXT_PUBLIC_APP_URL',
    'NLLB_SERVICE_URL',
    'NLLB_SERVICE_TIMEOUT',
    'TRANSLATION_MAX_RETRIES',
    'LOG_LEVEL',
    'DEBUG'
  ];
  
  criticalVars.forEach(key => {
    const prodValue = productionEnv[key];
    const localValue = localEnv[key];
    
    if (prodValue || localValue) {
      console.log(`${key}:`);
      console.log(`  生产环境: ${prodValue || '未设置'}`);
      console.log(`  本地环境: ${localValue || '未设置'}`);
      
      if (prodValue && localValue && prodValue !== localValue) {
        console.log(`  ⚠️  值不同`);
      } else if (!localValue) {
        console.log(`  ❌ 本地环境缺失`);
      } else {
        console.log(`  ✅ 配置正常`);
      }
      console.log('');
    }
  });
  
  return {
    production: productionEnv,
    local: localEnv,
    backup: backupEnv,
    onlyInProduction,
    onlyInLocal,
    valueChanges
  };
}

function generateRecommendations(comparison) {
  console.log('💡 配置建议:\n');
  
  if (comparison.onlyInProduction.length > 0) {
    console.log('1. 建议添加到本地环境的变量:');
    comparison.onlyInProduction.forEach(key => {
      console.log(`   ${key}=${comparison.production[key]}`);
    });
    console.log('');
  }
  
  if (comparison.valueChanges.length > 0) {
    console.log('2. 需要注意的配置差异:');
    comparison.valueChanges.forEach(change => {
      if (change.key === 'NODE_ENV') {
        console.log(`   ✅ ${change.key}: 本地使用 development 是正确的`);
      } else if (change.key === 'NEXT_PUBLIC_APP_URL') {
        console.log(`   ✅ ${change.key}: 本地使用 localhost 是正确的`);
      } else if (change.key === 'DEBUG' || change.key === 'LOG_LEVEL') {
        console.log(`   ✅ ${change.key}: 本地使用调试配置是正确的`);
      } else {
        console.log(`   ⚠️  ${change.key}: 请确认是否需要使用生产环境的值`);
      }
    });
    console.log('');
  }
  
  console.log('3. 推荐的本地开发配置:');
  console.log('   - NODE_ENV=development (保持开发模式)');
  console.log('   - NEXT_PUBLIC_APP_URL=http://localhost:3000 (本地地址)');
  console.log('   - DEBUG=true (启用调试)');
  console.log('   - LOG_LEVEL=debug (详细日志)');
  console.log('   - 其他配置可以使用生产环境的值');
}

function main() {
  console.log('🚀 开始比较配置文件...\n');
  
  try {
    const comparison = compareConfigs();
    generateRecommendations(comparison);
    
    console.log('\n✅ 配置比较完成！');
    
  } catch (error) {
    console.error('💥 比较过程出错:', error.message);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  parseEnvFile,
  compareConfigs
};
