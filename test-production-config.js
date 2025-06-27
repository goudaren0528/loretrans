// 生产环境翻译API测试脚本
// 部署后运行此脚本测试

const VERCEL_URL = 'https://your-app-name.vercel.app'; // 替换为你的Vercel域名

async function testProductionTranslation() {
  console.log('🧪 测试生产环境翻译API');
  console.log('========================\n');

  try {
    const response = await fetch(`${VERCEL_URL}/api/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'Hello world',
        sourceLanguage: 'en',
        targetLanguage: 'ht'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    console.log('✅ 翻译测试成功！');
    console.log(`📝 原文: ${result.data?.text || 'N/A'}`);
    console.log(`🔄 译文: ${result.data?.translatedText || 'N/A'}`);
    console.log(`⚙️  方法: ${result.data?.method || 'N/A'}`);
    console.log(`⏱️  耗时: ${result.data?.processingTime || 'N/A'}ms`);
    
    if (result.data?.method === 'huggingface') {
      console.log('\n🎉 成功使用Hugging Face API！');
    } else if (result.data?.method === 'mock') {
      console.log('\n⚠️  使用了Mock模式，请检查API Key配置');
    } else if (result.data?.method === 'nllb-local') {
      console.log('\n⚠️  意外使用了本地NLLB服务');
    }

  } catch (error) {
    console.log('❌ 翻译测试失败：');
    console.log(`   错误: ${error.message}`);
    console.log('\n🔧 可能的解决方案:');
    console.log('   1. 检查Vercel环境变量配置');
    console.log('   2. 验证Hugging Face API Key是否有效');
    console.log('   3. 确保NLLB_LOCAL_ENABLED=false');
  }
}

// 健康检查
async function testHealthCheck() {
  console.log('\n🏥 健康检查');
  console.log('============');
  
  try {
    const response = await fetch(`${VERCEL_URL}/api/health`);
    const result = await response.json();
    
    console.log(`✅ 服务状态: ${result.status || 'unknown'}`);
    console.log(`📊 环境: ${result.environment || 'unknown'}`);
    
  } catch (error) {
    console.log('❌ 健康检查失败');
  }
}

// 执行测试
if (require.main === module) {
  (async () => {
    await testHealthCheck();
    await testProductionTranslation();
  })();
}

module.exports = { testProductionTranslation, testHealthCheck }; 