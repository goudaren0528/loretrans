/**
 * 核心翻译功能测试用例
 * 测试项目的核心翻译API和功能支持
 */

const { describe, test, expect, beforeAll, afterAll } = require('@jest/globals');

// 模拟fetch如果在Node.js环境中
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

describe('核心翻译功能测试', () => {
  const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
  const NLLB_API_URL = 'https://wane0528-my-nllb-api.hf.space/api/v4/translator';
  
  // 测试用例数据
  const testCases = [
    {
      name: '英语到中文',
      text: 'Hello, how are you?',
      source: 'eng_Latn',
      target: 'zho_Hans',
      expectedPattern: /你好|您好/
    },
    {
      name: '英语到阿拉伯语',
      text: 'Welcome to our website',
      source: 'eng_Latn',
      target: 'arb_Arab',
      expectedPattern: /مرحبا|أهلا/
    },
    {
      name: '英语到印地语',
      text: 'Thank you very much',
      source: 'eng_Latn',
      target: 'hin_Deva',
      expectedPattern: /धन्यवाद|शुक्रिया/
    },
    {
      name: '英语到海地克里奥尔语',
      text: 'Good morning',
      source: 'eng_Latn',
      target: 'hat_Latn',
      expectedPattern: /bonjou|bon/i
    },
    {
      name: '英语到老挝语',
      text: 'Please help me',
      source: 'eng_Latn',
      target: 'lao_Laoo',
      expectedPattern: /ກະລຸນາ|ຊ່ວຍ/
    },
    {
      name: '英语到斯瓦希里语',
      text: 'I love you',
      source: 'eng_Latn',
      target: 'swh_Latn',
      expectedPattern: /nakupenda|nina/i
    },
    {
      name: '英语到缅甸语',
      text: 'See you later',
      source: 'eng_Latn',
      target: 'mya_Mymr',
      expectedPattern: /နောက်မှ|တွေ့မယ်/
    },
    {
      name: '英语到泰卢固语',
      text: 'How much does it cost?',
      source: 'eng_Latn',
      target: 'tel_Telu',
      expectedPattern: /ఎంత|ధర/
    }
  ];

  beforeAll(async () => {
    console.log('🚀 开始核心翻译功能测试...');
    console.log(`📡 测试API端点: ${NLLB_API_URL}`);
    console.log(`🌐 应用基础URL: ${BASE_URL}`);
  });

  afterAll(() => {
    console.log('✅ 核心翻译功能测试完成');
  });

  describe('NLLB API 直接测试', () => {
    test('API健康检查', async () => {
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

      expect(response.ok).toBe(true);
      const result = await response.json();
      expect(result).toHaveProperty('result');
      expect(typeof result.result).toBe('string');
      expect(result.result.length).toBeGreaterThan(0);
    }, 10000);

    test.each(testCases)('$name - NLLB API直接调用', async ({ text, source, target, expectedPattern }) => {
      const response = await fetch(NLLB_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          source,
          target,
        }),
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      
      expect(result).toHaveProperty('result');
      expect(typeof result.result).toBe('string');
      expect(result.result.length).toBeGreaterThan(0);
      expect(result.result).not.toBe(text); // 确保有翻译
      
      // 如果有期望的模式，进行模式匹配
      if (expectedPattern) {
        expect(result.result).toMatch(expectedPattern);
      }
      
      console.log(`✅ ${text} → ${result.result}`);
    }, 15000);
  });

  describe('应用翻译API测试', () => {
    test('翻译API端点存在性检查', async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/translate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: 'Hello',
            source_language: 'en',
            target_language: 'zh',
          }),
        });

        // 即使返回错误，也说明端点存在
        expect([200, 400, 401, 403, 500].includes(response.status)).toBe(true);
      } catch (error) {
        // 如果是网络错误，可能是因为服务未运行
        console.warn('⚠️ 应用翻译API不可用，可能服务未启动');
      }
    });

    test('语言检测API测试', async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/detect`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: 'Hello world, how are you today?',
          }),
        });

        if (response.ok) {
          const result = await response.json();
          expect(result).toHaveProperty('language');
          expect(typeof result.language).toBe('string');
        }
      } catch (error) {
        console.warn('⚠️ 语言检测API不可用');
      }
    });
  });

  describe('翻译质量测试', () => {
    test('短文本翻译质量', async () => {
      const shortTexts = [
        'Hello',
        'Thank you',
        'Good morning',
        'How are you?',
        'I love you'
      ];

      for (const text of shortTexts) {
        const response = await fetch(NLLB_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            source: 'eng_Latn',
            target: 'zho_Hans',
          }),
        });

        expect(response.ok).toBe(true);
        const result = await response.json();
        
        // 基本质量检查
        expect(result.result).toBeTruthy();
        expect(result.result.length).toBeGreaterThan(0);
        expect(result.result).not.toBe(text);
        
        // 检查是否包含中文字符
        expect(/[\u4e00-\u9fff]/.test(result.result)).toBe(true);
      }
    }, 30000);

    test('长文本翻译测试', async () => {
      const longText = `
        Welcome to our advanced translation platform. 
        We provide high-quality AI-powered translation services 
        for low-resource languages that are often underserved 
        by mainstream translation tools. Our mission is to break 
        down language barriers and make communication accessible 
        to everyone, regardless of the language they speak.
      `.trim();

      const response = await fetch(NLLB_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: longText,
          source: 'eng_Latn',
          target: 'zho_Hans',
        }),
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      
      expect(result.result).toBeTruthy();
      expect(result.result.length).toBeGreaterThan(longText.length * 0.5); // 至少是原文的一半长度
      expect(/[\u4e00-\u9fff]/.test(result.result)).toBe(true);
    }, 20000);
  });

  describe('错误处理测试', () => {
    test('空文本处理', async () => {
      const response = await fetch(NLLB_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: '',
          source: 'eng_Latn',
          target: 'zho_Hans',
        }),
      });

      // API应该处理空文本，可能返回错误或空结果
      expect([200, 400].includes(response.status)).toBe(true);
    });

    test('无效语言代码处理', async () => {
      const response = await fetch(NLLB_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: 'Hello',
          source: 'invalid_lang',
          target: 'zho_Hans',
        }),
      });

      // 应该返回错误状态
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    test('缺少必需参数', async () => {
      const response = await fetch(NLLB_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: 'Hello',
          // 缺少 source 和 target
        }),
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('性能测试', () => {
    test('翻译响应时间测试', async () => {
      const startTime = Date.now();
      
      const response = await fetch(NLLB_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: 'This is a performance test for translation speed.',
          source: 'eng_Latn',
          target: 'zho_Hans',
        }),
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.ok).toBe(true);
      expect(responseTime).toBeLessThan(10000); // 应该在10秒内完成
      
      console.log(`⏱️ 翻译响应时间: ${responseTime}ms`);
    }, 15000);

    test('并发翻译测试', async () => {
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

      const startTime = Date.now();
      const responses = await Promise.all(concurrentRequests);
      const endTime = Date.now();

      // 所有请求都应该成功
      responses.forEach(response => {
        expect(response.ok).toBe(true);
      });

      console.log(`⏱️ 并发翻译完成时间: ${endTime - startTime}ms`);
    }, 20000);
  });

  describe('语言支持覆盖测试', () => {
    const supportedLanguages = [
      { code: 'zho_Hans', name: '中文' },
      { code: 'arb_Arab', name: '阿拉伯语' },
      { code: 'hin_Deva', name: '印地语' },
      { code: 'hat_Latn', name: '海地克里奥尔语' },
      { code: 'lao_Laoo', name: '老挝语' },
      { code: 'swh_Latn', name: '斯瓦希里语' },
      { code: 'mya_Mymr', name: '缅甸语' },
      { code: 'tel_Telu', name: '泰卢固语' },
      { code: 'spa_Latn', name: '西班牙语' },
      { code: 'fra_Latn', name: '法语' },
      { code: 'por_Latn', name: '葡萄牙语' }
    ];

    test.each(supportedLanguages)('$name ($code) 翻译支持测试', async ({ code, name }) => {
      const response = await fetch(NLLB_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: 'Hello world',
          source: 'eng_Latn',
          target: code,
        }),
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      
      expect(result).toHaveProperty('result');
      expect(result.result).toBeTruthy();
      expect(result.result).not.toBe('Hello world');
      
      console.log(`✅ ${name}: "Hello world" → "${result.result}"`);
    }, 15000);
  });

  describe('特殊字符和格式测试', () => {
    test('包含特殊字符的文本翻译', async () => {
      const specialTexts = [
        'Hello! How are you? I\'m fine.',
        'Price: $19.99 (including tax)',
        'Email: user@example.com',
        'Date: 2024-01-01',
        'Percentage: 85%'
      ];

      for (const text of specialTexts) {
        const response = await fetch(NLLB_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            source: 'eng_Latn',
            target: 'zho_Hans',
          }),
        });

        expect(response.ok).toBe(true);
        const result = await response.json();
        expect(result.result).toBeTruthy();
        
        console.log(`📝 特殊字符测试: "${text}" → "${result.result}"`);
      }
    }, 30000);

    test('多行文本翻译', async () => {
      const multilineText = `Line 1: Welcome to our service
Line 2: Please follow the instructions
Line 3: Contact us if you need help`;

      const response = await fetch(NLLB_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: multilineText,
          source: 'eng_Latn',
          target: 'zho_Hans',
        }),
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      expect(result.result).toBeTruthy();
      
      console.log(`📄 多行文本测试:\n原文:\n${multilineText}\n译文:\n${result.result}`);
    }, 15000);
  });
});
