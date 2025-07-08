#!/usr/bin/env node

/**
 * 简化的翻译功能测试运行器
 * 不依赖Jest，可以直接运行
 */

// 模拟fetch如果不存在
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

const NLLB_API_URL = 'https://wane0528-my-nllb-api.hf.space/api/v4/translator';

// 测试用例数据
const testCases = [
  {
    name: '英语到中文',
    text: 'Hello, how are you?',
    source: 'eng_Latn',
    target: 'zho_Hans',
    expectedPattern: /[\u4e00-\u9fff]/
  },
  {
    name: '英语到阿拉伯语',
    text: 'Welcome to our website',
    source: 'eng_Latn',
    target: 'arb_Arab',
    expectedPattern: /[\u0600-\u06ff]/
  },
  {
    name: '英语到印地语',
    text: 'Thank you very much',
    source: 'eng_Latn',
    target: 'hin_Deva',
    expectedPattern: /[\u0900-\u097f]/
  },
  {
    name: '英语到海地克里奥尔语',
    text: 'Good morning',
    source: 'eng_Latn',
    target: 'hat_Latn',
    expectedPattern: /[a-zA-Z]/
  },
  {
    name: '英语到老挝语',
    text: 'Please help me',
    source: 'eng_Latn',
    target: 'lao_Laoo',
    expectedPattern: /[\u0e80-\u0eff]/
  }
];

// 测试统计
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 翻译测试函数
async function testTranslation(testCase) {
  totalTests++;
  
  try {
    log(`🔄 测试: ${testCase.name}`, 'blue');
    log(`   原文: "${testCase.text}"`);
    
    const startTime = Date.now();
    
    const response = await fetch(NLLB_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: testCase.text,
        source: testCase.source,
        target: testCase.target,
      }),
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.result) {
      throw new Error('翻译结果为空');
    }

    // 验证翻译质量
    const translation = result.result;
    
    // 基本验证
    if (translation === testCase.text) {
      throw new Error('翻译结果与原文相同');
    }
    
    if (translation.length === 0) {
      throw new Error('翻译结果为空字符串');
    }
    
    // 语言脚本验证
    if (testCase.expectedPattern && !testCase.expectedPattern.test(translation)) {
      log(`   ⚠️  警告: 翻译结果可能不包含预期的语言脚本`, 'yellow');
    }
    
    passedTests++;
    log(`   ✅ 译文: "${translation}"`, 'green');
    log(`   ⏱️  响应时间: ${responseTime}ms`);
    log(`   ✅ 测试通过\n`, 'green');
    
    return {
      success: true,
      translation,
      responseTime
    };
    
  } catch (error) {
    failedTests++;
    log(`   ❌ 测试失败: ${error.message}\n`, 'red');
    
    return {
      success: false,
      error: error.message
    };
  }
}

// API健康检查
async function healthCheck() {
  log('🏥 API健康检查...', 'blue');
  
  try {
    const response = await fetch(NLLB_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'Hello',
        source: 'eng_Latn',
        target: 'zho_Hans',
      }),
    });

    if (response.ok) {
      const result = await response.json();
      if (result.result) {
        log('✅ API健康检查通过', 'green');
        return true;
      }
    }
    
    throw new Error(`API响应异常: ${response.status}`);
    
  } catch (error) {
    log(`❌ API健康检查失败: ${error.message}`, 'red');
    return false;
  }
}

// 性能测试
async function performanceTest() {
  log('⚡ 性能测试...', 'blue');
  
  const testText = 'This is a performance test for translation speed and quality.';
  const startTime = Date.now();
  
  try {
    const response = await fetch(NLLB_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: testText,
        source: 'eng_Latn',
        target: 'zho_Hans',
      }),
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    if (response.ok) {
      const result = await response.json();
      log(`✅ 性能测试通过`, 'green');
      log(`   响应时间: ${responseTime}ms`);
      log(`   翻译结果: "${result.result}"`);
      
      if (responseTime > 10000) {
        log(`   ⚠️  警告: 响应时间较长 (${responseTime}ms)`, 'yellow');
      }
      
      return true;
    }
    
    throw new Error(`性能测试失败: ${response.status}`);
    
  } catch (error) {
    log(`❌ 性能测试失败: ${error.message}`, 'red');
    return false;
  }
}

// 并发测试
async function concurrencyTest() {
  log('🔀 并发测试...', 'blue');
  
  const concurrentRequests = Array.from({ length: 3 }, (_, i) => 
    fetch(NLLB_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: `Concurrent test ${i + 1}`,
        source: 'eng_Latn',
        target: 'zho_Hans',
      }),
    })
  );

  try {
    const startTime = Date.now();
    const responses = await Promise.all(concurrentRequests);
    const endTime = Date.now();

    const allSuccessful = responses.every(response => response.ok);
    
    if (allSuccessful) {
      log(`✅ 并发测试通过`, 'green');
      log(`   总耗时: ${endTime - startTime}ms`);
      log(`   并发请求数: ${responses.length}`);
      return true;
    } else {
      throw new Error('部分并发请求失败');
    }
    
  } catch (error) {
    log(`❌ 并发测试失败: ${error.message}`, 'red');
    return false;
  }
}

// 主测试函数
async function runTests() {
  log('🚀 开始核心翻译功能测试', 'bold');
  log('================================================================================');
  
  // API健康检查
  const healthOk = await healthCheck();
  if (!healthOk) {
    log('❌ API不可用，终止测试', 'red');
    return;
  }
  
  log('');
  
  // 基本翻译测试
  log('📝 基本翻译功能测试', 'bold');
  log('--------------------------------------------------------------------------------');
  
  for (const testCase of testCases) {
    await testTranslation(testCase);
    // 添加延迟避免API限制
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 性能测试
  log('⚡ 性能和并发测试', 'bold');
  log('--------------------------------------------------------------------------------');
  
  await performanceTest();
  await new Promise(resolve => setTimeout(resolve, 1000));
  await concurrencyTest();
  
  // 测试总结
  log('');
  log('📊 测试总结', 'bold');
  log('================================================================================');
  log(`总测试数: ${totalTests}`);
  log(`通过: ${passedTests}`, passedTests === totalTests ? 'green' : 'yellow');
  log(`失败: ${failedTests}`, failedTests === 0 ? 'green' : 'red');
  log(`成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`, 
       passedTests === totalTests ? 'green' : 'yellow');
  
  if (passedTests === totalTests) {
    log('🎉 所有测试通过！核心翻译功能正常', 'green');
  } else {
    log('⚠️  部分测试失败，请检查翻译服务', 'yellow');
  }
  
  log('================================================================================');
}

// 运行测试
runTests().catch(error => {
  log(`❌ 测试运行出错: ${error.message}`, 'red');
  process.exit(1);
});
