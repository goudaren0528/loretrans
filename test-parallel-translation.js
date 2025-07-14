#!/usr/bin/env node

/**
 * 并行翻译API测试脚本
 * 测试长文本的并行分块处理和重试机制
 */

const fetch = require('node-fetch');

// 测试配置
const TEST_CONFIG = {
  API_URL: 'http://localhost:3000/api/translate-parallel',
  TEST_CASES: [
    {
      name: '短文本测试 (单块)',
      text: 'Hello world! This is a simple test.',
      sourceLang: 'en',
      targetLang: 'zh',
      expectedChunks: 1
    },
    {
      name: '中等文本测试 (2-3块)',
      text: `
        Artificial intelligence (AI) is intelligence demonstrated by machines, in contrast to the natural intelligence displayed by humans and animals. 
        Leading AI textbooks define the field as the study of "intelligent agents": any device that perceives its environment and takes actions that maximize its chance of successfully achieving its goals. 
        Colloquially, the term "artificial intelligence" is often used to describe machines that mimic "cognitive" functions that humans associate with the human mind, such as "learning" and "problem solving".
      `.trim(),
      sourceLang: 'en',
      targetLang: 'zh',
      expectedChunks: 3
    },
    {
      name: '长文本测试 (5+块)',
      text: `
        Machine learning (ML) is a type of artificial intelligence (AI) that allows software applications to become more accurate at predicting outcomes without being explicitly programmed to do so. Machine learning algorithms use historical data as input to predict new output values.

        The process of machine learning is similar to that of data mining. Both systems search through data to look for patterns. However, instead of extracting data for human comprehension — as is the case in data mining applications — machine learning uses that data to detect patterns in data and adjust program actions accordingly.

        Machine learning algorithms are typically created using frameworks that accelerate solution development, such as TensorFlow and PyTorch. The amount of data generated today, by both humans and machines, far outpaces humans' ability to absorb, interpret, and make complex decisions based on that data.

        Machine learning, which is a subset of artificial intelligence (AI), is the area of computational science that focuses on analyzing and interpreting patterns and structures in data to enable learning, reasoning, and decision making outside of human interaction.

        In simple terms, machine learning is a method of teaching computers to make predictions or take actions based on data. Instead of being explicitly programmed with rules, the computer learns patterns from examples and uses those patterns to make decisions about new, unseen data.
      `.trim(),
      sourceLang: 'en',
      targetLang: 'zh',
      expectedChunks: 6
    }
  ]
};

/**
 * 执行翻译测试
 */
async function testTranslation(testCase) {
  console.log(`\n🧪 测试: ${testCase.name}`);
  console.log(`📝 文本长度: ${testCase.text.length}字符`);
  console.log(`🌍 翻译: ${testCase.sourceLang} -> ${testCase.targetLang}`);
  
  const startTime = Date.now();
  
  try {
    const response = await fetch(TEST_CONFIG.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: testCase.text,
        sourceLang: testCase.sourceLang,
        targetLang: testCase.targetLang
      })
    });
    
    const result = await response.json();
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (!response.ok) {
      console.log(`❌ 测试失败: ${result.error}`);
      return false;
    }
    
    console.log(`✅ 测试成功!`);
    console.log(`⏱️  总耗时: ${duration}ms (API报告: ${result.processingTime}ms)`);
    console.log(`📊 处理块数: ${result.chunksProcessed} (预期: ${testCase.expectedChunks})`);
    console.log(`📏 原文长度: ${result.characterCount}字符`);
    console.log(`📏 译文长度: ${result.translatedText.length}字符`);
    console.log(`🔧 服务: ${result.service}`);
    
    if (result.chunkResults) {
      const successCount = result.chunkResults.filter(r => r.status === 'success').length;
      const failedCount = result.chunkResults.filter(r => r.status === 'failed').length;
      console.log(`📈 成功块: ${successCount}, 失败块: ${failedCount}`);
      
      // 显示每个块的详细信息
      result.chunkResults.forEach(chunk => {
        const status = chunk.status === 'success' ? '✅' : '❌';
        console.log(`   ${status} 块${chunk.index}: ${chunk.originalLength}字符 -> ${chunk.translatedLength}字符 (${chunk.attempts}次尝试)`);
        if (chunk.error) {
          console.log(`      错误: ${chunk.error}`);
        }
      });
    }
    
    console.log(`📄 译文预览: ${result.translatedText.substring(0, 200)}${result.translatedText.length > 200 ? '...' : ''}`);
    
    return true;
    
  } catch (error) {
    console.log(`💥 测试异常: ${error.message}`);
    return false;
  }
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('🚀 开始并行翻译API测试');
  console.log(`🔗 API地址: ${TEST_CONFIG.API_URL}`);
  console.log(`📋 测试用例: ${TEST_CONFIG.TEST_CASES.length}个`);
  
  let passedTests = 0;
  let totalTests = TEST_CONFIG.TEST_CASES.length;
  
  for (const testCase of TEST_CONFIG.TEST_CASES) {
    const success = await testTranslation(testCase);
    if (success) {
      passedTests++;
    }
    
    // 测试间隔
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`\n📊 测试总结:`);
  console.log(`✅ 通过: ${passedTests}/${totalTests}`);
  console.log(`❌ 失败: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log(`🎉 所有测试通过!`);
  } else {
    console.log(`⚠️  有测试失败，请检查API服务`);
  }
}

/**
 * 压力测试 - 测试并发处理能力
 */
async function stressTest() {
  console.log('\n🔥 开始压力测试');
  
  const longText = `
    The field of artificial intelligence has experienced remarkable growth and transformation over the past decade. From simple rule-based systems to sophisticated neural networks, AI has evolved to tackle increasingly complex problems across various domains.

    Machine learning, a subset of AI, has been particularly revolutionary. It enables computers to learn and improve from experience without being explicitly programmed for every scenario. This capability has opened up new possibilities in areas such as natural language processing, computer vision, and predictive analytics.

    Deep learning, which uses neural networks with multiple layers, has achieved breakthrough results in image recognition, speech processing, and game playing. The success of deep learning models like GPT, BERT, and ResNet has demonstrated the power of large-scale neural architectures trained on massive datasets.

    However, with great power comes great responsibility. As AI systems become more capable and widespread, concerns about ethics, bias, privacy, and job displacement have become increasingly important. The AI community is actively working on developing responsible AI practices and ensuring that these technologies benefit humanity as a whole.

    Looking forward, the future of AI holds immense promise. Emerging areas like quantum machine learning, neuromorphic computing, and artificial general intelligence represent the next frontiers in this rapidly evolving field. The integration of AI with other technologies such as robotics, IoT, and blockchain will likely create new paradigms and applications we can barely imagine today.
  `.trim();
  
  console.log(`📝 压力测试文本: ${longText.length}字符`);
  
  // 并发发送多个请求
  const concurrentRequests = 3;
  const promises = [];
  
  for (let i = 0; i < concurrentRequests; i++) {
    promises.push(testTranslation({
      name: `并发请求 ${i + 1}`,
      text: longText,
      sourceLang: 'en',
      targetLang: 'zh',
      expectedChunks: 8
    }));
  }
  
  console.log(`🚀 发送${concurrentRequests}个并发请求...`);
  const results = await Promise.all(promises);
  const successCount = results.filter(r => r).length;
  
  console.log(`📊 压力测试结果: ${successCount}/${concurrentRequests}个请求成功`);
}

// 主函数
async function main() {
  try {
    await runAllTests();
    await stressTest();
  } catch (error) {
    console.error('测试执行失败:', error);
  }
}

// 检查是否直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { testTranslation, runAllTests, stressTest };
