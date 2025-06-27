// 部署验证脚本
// 使用方法: node verify-deployment.js https://your-app.vercel.app

const VERCEL_URL = process.argv[2] || 'https://your-app.vercel.app';

console.log(`🔍 验证部署: ${VERCEL_URL}\n`);

async function verifyDeployment() {
  try {
    // 1. 测试主页
    console.log('1. 测试主页访问...');
    const homeResponse = await fetch(VERCEL_URL);
    console.log(`   主页状态: ${homeResponse.status} ${homeResponse.ok ? '✅' : '❌'}`);

    // 2. 测试翻译API
    console.log('\n2. 测试翻译API...');
    const translateResponse = await fetch(`${VERCEL_URL}/api/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Hello world',
        sourceLanguage: 'en',
        targetLanguage: 'ht'
      })
    });

    if (translateResponse.ok) {
      const result = await translateResponse.json();
      console.log(`   API状态: ${translateResponse.status} ✅`);
      console.log(`   翻译方法: ${result.data?.method || 'unknown'}`);
      console.log(`   翻译结果: ${result.data?.translatedText || 'N/A'}`);
      
      if (result.data?.method === 'huggingface') {
        console.log('\n🎉 配置成功！正在使用Hugging Face API');
      } else if (result.data?.method === 'mock') {
        console.log('\n⚠️  仍在使用Mock模式，请检查API Key配置');
      }
    } else {
      console.log(`   API状态: ${translateResponse.status} ❌`);
      const error = await translateResponse.text();
      console.log(`   错误: ${error}`);
    }

  } catch (error) {
    console.log(`❌ 验证失败: ${error.message}`);
  }
}

verifyDeployment(); 