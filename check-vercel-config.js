// Vercel环境变量配置检查脚本
// 运行: node check-vercel-config.js

console.log('🔍 Vercel环境变量配置检查\n');

// 模拟生产环境变量
const requiredVars = {
  // 基础配置
  'NODE_ENV': 'production',
  'NEXT_PUBLIC_APP_URL': 'https://your-app.vercel.app',
  
  // 关键：翻译服务配置
  'NLLB_LOCAL_ENABLED': 'false',  // 🔑 必须是false
  'USE_MOCK_TRANSLATION': 'false', // 🔑 必须是false
  'HUGGINGFACE_API_KEY': 'hf_your_token_here', // 🔑 必须提供
  
  // Hugging Face API配置
  'HUGGINGFACE_API_URL': 'https://api-inference.huggingface.co/models',
  'NLLB_MODEL': 'facebook/nllb-200-distilled-600M',
  'NLLB_MAX_LENGTH': '1000',
  'NLLB_TEMPERATURE': '0.3',
  'NLLB_TIMEOUT': '30000',
  
  // 安全配置
  'JWT_SECRET': 'your-secure-jwt-secret-32-chars-minimum',
  'ENCRYPTION_KEY': 'your-secure-encryption-key-32-chars',
  'FILE_SERVICE_SECRET': 'your-file-service-secret'
};

console.log('✅ 必需的环境变量配置:');
console.log('================================\n');

Object.entries(requiredVars).forEach(([key, value]) => {
  const priority = ['NLLB_LOCAL_ENABLED', 'USE_MOCK_TRANSLATION', 'HUGGINGFACE_API_KEY'].includes(key) ? '🔑 ' : '   ';
  console.log(`${priority}${key}=${value}`);
});

console.log('\n🎯 关键配置说明:');
console.log('================================');
console.log('1. NLLB_LOCAL_ENABLED=false  ← 禁用本地服务');
console.log('2. USE_MOCK_TRANSLATION=false ← 禁用Mock模式');
console.log('3. HUGGINGFACE_API_KEY=hf_... ← 提供有效API Key');

console.log('\n📋 部署检查清单:');
console.log('================================');
console.log('□ 1. 获取Hugging Face API Key:');
console.log('     https://huggingface.co/settings/tokens');
console.log('□ 2. 在Vercel Dashboard设置环境变量');
console.log('□ 3. 确保NLLB_LOCAL_ENABLED=false');
console.log('□ 4. 确保USE_MOCK_TRANSLATION=false');
console.log('□ 5. 部署并测试翻译功能');

console.log('\n🧪 测试翻译逻辑:');
console.log('================================');

// 模拟翻译服务的决策逻辑
function simulateTranslationDecision(envVars) {
  console.log('环境变量:');
  console.log(`  USE_MOCK_TRANSLATION: ${envVars.USE_MOCK_TRANSLATION}`);
  console.log(`  NLLB_LOCAL_ENABLED: ${envVars.NLLB_LOCAL_ENABLED}`);
  console.log(`  HUGGINGFACE_API_KEY: ${envVars.HUGGINGFACE_API_KEY ? '已设置' : '未设置'}`);
  
  if (envVars.USE_MOCK_TRANSLATION === 'true') {
    return '❌ 使用Mock模式';
  }
  
  if (envVars.NLLB_LOCAL_ENABLED === 'true') {
    return '⚠️  尝试本地NLLB服务 (生产环境不可用)';
  }
  
  if (envVars.HUGGINGFACE_API_KEY) {
    return '✅ 使用Hugging Face API';
  }
  
  return '❌ 降级到Mock模式';
}

// 测试当前配置
console.log('\n当前配置的决策结果:');
const result = simulateTranslationDecision({
  USE_MOCK_TRANSLATION: 'false',
  NLLB_LOCAL_ENABLED: 'false', 
  HUGGINGFACE_API_KEY: 'hf_test'
});
console.log(`  → ${result}`);

console.log('\n🚀 快速部署命令:');
console.log('================================');
console.log('1. git add . && git commit -m "配置生产环境" && git push');
console.log('2. 在Vercel Dashboard设置环境变量');
console.log('3. 重新部署项目');
console.log('4. 测试: https://your-app.vercel.app/api/translate'); 