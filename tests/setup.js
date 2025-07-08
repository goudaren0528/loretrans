/**
 * Jest 测试设置文件
 */

// 设置测试超时
jest.setTimeout(30000);

// 模拟fetch如果不存在
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

// 全局测试配置
global.testConfig = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
  nllbApiUrl: 'https://wane0528-my-nllb-api.hf.space/api/v4/translator',
  timeout: 15000
};

// 测试前的全局设置
beforeAll(() => {
  console.log('🧪 测试环境初始化...');
  console.log(`📡 NLLB API: ${global.testConfig.nllbApiUrl}`);
  console.log(`🌐 应用URL: ${global.testConfig.baseUrl}`);
});

// 测试后的清理
afterAll(() => {
  console.log('🧹 测试环境清理完成');
});

// 错误处理
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
});

// 自定义匹配器
expect.extend({
  toBeValidTranslation(received, original) {
    const pass = received && 
                 typeof received === 'string' && 
                 received.length > 0 && 
                 received !== original;
    
    if (pass) {
      return {
        message: () => `期望 "${received}" 不是有效的翻译`,
        pass: true,
      };
    } else {
      return {
        message: () => `期望 "${received}" 是有效的翻译`,
        pass: false,
      };
    }
  },
  
  toContainLanguageScript(received, scriptPattern) {
    const pass = scriptPattern.test(received);
    
    if (pass) {
      return {
        message: () => `期望 "${received}" 不包含指定语言脚本`,
        pass: true,
      };
    } else {
      return {
        message: () => `期望 "${received}" 包含指定语言脚本`,
        pass: false,
      };
    }
  }
});
