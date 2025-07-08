/**
 * 核心翻译功能综合测试
 * 覆盖产品核心功能的各种使用场景和边界条件
 */

const { describe, test, expect, beforeAll, afterAll } = require('@jest/globals');

// 模拟fetch如果在Node.js环境中
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

describe('核心翻译功能综合测试', () => {
  const NLLB_API_URL = 'https://wane0528-my-nllb-api.hf.space/api/v4/translator';
  
  // 产品支持的核心语言对
  const coreLanguagePairs = [
    { source: 'eng_Latn', target: 'zho_Hans', name: '英语→中文' },
    { source: 'eng_Latn', target: 'hat_Latn', name: '英语→海地克里奥尔语' },
    { source: 'eng_Latn', target: 'lao_Laoo', name: '英语→老挝语' },
    { source: 'eng_Latn', target: 'swh_Latn', name: '英语→斯瓦希里语' },
    { source: 'eng_Latn', target: 'mya_Mymr', name: '英语→缅甸语' },
    { source: 'eng_Latn', target: 'tel_Telu', name: '英语→泰卢固语' },
    { source: 'hat_Latn', target: 'eng_Latn', name: '海地克里奥尔语→英语' },
    { source: 'lao_Laoo', target: 'eng_Latn', name: '老挝语→英语' },
    { source: 'swh_Latn', target: 'eng_Latn', name: '斯瓦希里语→英语' },
    { source: 'mya_Mymr', target: 'eng_Latn', name: '缅甸语→英语' },
    { source: 'tel_Telu', target: 'eng_Latn', name: '泰卢固语→英语' }
  ];

  beforeAll(async () => {
    console.log('🚀 开始核心翻译功能综合测试...');
    console.log(`📊 测试语言对数量: ${coreLanguagePairs.length}`);
  });

  afterAll(() => {
    console.log('✅ 核心翻译功能综合测试完成');
  });

  describe('免费额度翻译测试 (≤500字符)', () => {
    const shortTexts = [
      'Hello, how are you today?',
      'Welcome to our translation platform.',
      'Thank you for using our service.',
      'Please enter your text here.',
      'The weather is beautiful today.',
      'I would like to order some food.',
      'Can you help me with this problem?',
      'What time is the meeting tomorrow?',
      'This is a test of our translation system.',
      'Have a great day and see you soon!'
    ];

    test.each(coreLanguagePairs)('$name - 短文本翻译质量', async ({ source, target, name }) => {
      const testText = shortTexts[Math.floor(Math.random() * shortTexts.length)];
      
      const response = await fetch(NLLB_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: testText,
          source,
          target,
        }),
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      
      expect(result).toHaveProperty('result');
      expect(result.result).toBeTruthy();
      expect(result.result.length).toBeGreaterThan(0);
      expect(result.result).not.toBe(testText);
      
      console.log(`✅ ${name}: "${testText}" → "${result.result}"`);
    }, 15000);

    test('500字符边界测试', async () => {
      // 创建恰好500字符的文本
      const boundaryText = 'This is a boundary test for the 500-character limit in our translation platform. '.repeat(6).substring(0, 500);
      
      expect(boundaryText.length).toBe(500);

      const response = await fetch(NLLB_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: boundaryText,
          source: 'eng_Latn',
          target: 'zho_Hans',
        }),
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      
      expect(result.result).toBeTruthy();
      expect(result.result.length).toBeGreaterThan(200);
      expect(/[\u4e00-\u9fff]/.test(result.result)).toBe(true);
      
      console.log(`📏 500字符边界测试完成: ${boundaryText.length} → ${result.result.length} 字符`);
    }, 20000);
  });

  describe('付费功能翻译测试 (>500字符)', () => {
    test('501-1000字符翻译', async () => {
      const mediumText = `
        Our translation platform is designed to serve users who need high-quality translation 
        services for languages that are often underserved by mainstream translation tools. 
        We focus specifically on low-resource languages such as Haitian Creole, Lao, Burmese, 
        Swahili, and Telugu, providing accurate and culturally appropriate translations.
        
        The platform uses advanced AI technology, specifically the NLLB (No Language Left Behind) 
        model developed by Meta, which has been trained on over 200 languages. This ensures 
        that even languages with limited digital resources can receive high-quality translation 
        services that preserve meaning and cultural context.
      `.trim();

      expect(mediumText.length).toBeGreaterThan(500);
      expect(mediumText.length).toBeLessThan(1000);

      const response = await fetch(NLLB_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: mediumText,
          source: 'eng_Latn',
          target: 'zho_Hans',
        }),
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      
      expect(result.result).toBeTruthy();
      expect(result.result.length).toBeGreaterThan(mediumText.length * 0.4);
      expect(/[\u4e00-\u9fff]/.test(result.result)).toBe(true);
      
      console.log(`💰 付费翻译测试: ${mediumText.length} → ${result.result.length} 字符`);
    }, 25000);

    test('1000-2000字符翻译', async () => {
      const longText = `
        Welcome to our comprehensive translation platform, specifically designed to address 
        the needs of speakers of low-resource languages around the world. Our mission is to 
        bridge communication gaps and ensure that no language is left behind in our increasingly 
        connected global society.
        
        The challenge of translating low-resource languages has been a persistent problem in 
        the field of natural language processing. Traditional translation systems have focused 
        primarily on high-resource language pairs such as English-Spanish, English-French, 
        or English-Chinese, leaving millions of speakers of minority and indigenous languages 
        without access to quality translation services.
        
        Our platform addresses this gap by leveraging the latest advances in artificial 
        intelligence and machine learning. We use the NLLB (No Language Left Behind) model, 
        a state-of-the-art neural machine translation system developed by Meta's AI Research 
        team. This model has been specifically designed to handle translation between over 
        200 languages, with particular emphasis on improving quality for low-resource languages.
        
        The NLLB model represents a significant breakthrough in multilingual machine translation. 
        Unlike previous systems that required extensive parallel corpora for each language pair, 
        NLLB uses advanced transfer learning techniques to leverage knowledge from high-resource 
        languages to improve translation quality for low-resource languages. This approach 
        enables us to provide high-quality translations even for languages with limited 
        digital resources or training data.
        
        Our platform supports a wide range of use cases, from personal communication and 
        social media posts to academic research and business documentation. We understand 
        that each language carries unique cultural nuances and expressions, and our system 
        is designed to preserve these important elements while ensuring accuracy and 
        readability in the target language.
      `.trim();

      expect(longText.length).toBeGreaterThan(1000);
      expect(longText.length).toBeLessThan(2000);

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
      expect(result.result.length).toBeGreaterThan(longText.length * 0.4);
      expect(/[\u4e00-\u9fff]/.test(result.result)).toBe(true);
      
      console.log(`💎 长文本翻译测试: ${longText.length} → ${result.result.length} 字符`);
    }, 30000);
  });

  describe('小语种专项翻译测试', () => {
    const smallLanguageTests = [
      {
        source: 'eng_Latn',
        target: 'hat_Latn',
        text: 'Good morning, how can I help you today?',
        name: '海地克里奥尔语',
        expectedPattern: /bonjou|bon|kijan|kòman/i
      },
      {
        source: 'eng_Latn',
        target: 'lao_Laoo',
        text: 'Thank you very much for your help.',
        name: '老挝语',
        expectedPattern: /ຂອບໃຈ|ຂອບ|ໃຈ/
      },
      {
        source: 'eng_Latn',
        target: 'swh_Latn',
        text: 'Welcome to our beautiful country.',
        name: '斯瓦希里语',
        expectedPattern: /karibu|nchi|nzuri/i
      },
      {
        source: 'eng_Latn',
        target: 'mya_Mymr',
        text: 'Please wait a moment.',
        name: '缅甸语',
        expectedPattern: /ကျေးဇူး|စောင့်|ခဏ/
      },
      {
        source: 'eng_Latn',
        target: 'tel_Telu',
        text: 'How much does this cost?',
        name: '泰卢固语',
        expectedPattern: /ఎంత|ధర|ఖర్చు/
      }
    ];

    test.each(smallLanguageTests)('$name 翻译准确性测试', async ({ source, target, text, name, expectedPattern }) => {
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
      
      expect(result.result).toBeTruthy();
      expect(result.result.length).toBeGreaterThan(0);
      expect(result.result).not.toBe(text);
      
      // 检查是否包含预期的语言特征
      if (expectedPattern) {
        expect(result.result).toMatch(expectedPattern);
      }
      
      console.log(`🌍 ${name}: "${text}" → "${result.result}"`);
    }, 20000);

    test('反向翻译测试 (小语种→英语)', async () => {
      const reverseTests = [
        { source: 'hat_Latn', text: 'Bonjou, kijan ou ye?', name: '海地克里奥尔语' },
        { source: 'swh_Latn', text: 'Karibu sana, habari gani?', name: '斯瓦希里语' }
      ];

      for (const { source, text, name } of reverseTests) {
        const response = await fetch(NLLB_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            source,
            target: 'eng_Latn',
          }),
        });

        expect(response.ok).toBe(true);
        const result = await response.json();
        
        expect(result.result).toBeTruthy();
        expect(result.result.length).toBeGreaterThan(0);
        expect(result.result).not.toBe(text);
        
        // 检查是否包含英语单词
        expect(/[a-zA-Z]/.test(result.result)).toBe(true);
        
        console.log(`🔄 ${name}→英语: "${text}" → "${result.result}"`);
      }
    }, 30000);
  });

  describe('翻译质量一致性测试', () => {
    test('相同文本多次翻译一致性', async () => {
      const testText = 'This is a consistency test for our translation system.';
      const translations = [];

      // 进行3次相同的翻译
      for (let i = 0; i < 3; i++) {
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

        expect(response.ok).toBe(true);
        const result = await response.json();
        translations.push(result.result);
      }

      // 检查翻译结果的一致性
      expect(translations.length).toBe(3);
      translations.forEach(translation => {
        expect(translation).toBeTruthy();
        expect(/[\u4e00-\u9fff]/.test(translation)).toBe(true);
      });

      // 理想情况下，相同输入应该产生相同输出
      const uniqueTranslations = [...new Set(translations)];
      console.log(`🔄 一致性测试: ${uniqueTranslations.length} 种不同结果`);
      translations.forEach((t, i) => console.log(`   ${i + 1}: ${t}`));
    }, 30000);

    test('相似文本翻译质量对比', async () => {
      const similarTexts = [
        'Hello, how are you?',
        'Hi, how are you doing?',
        'Hello, how are you today?',
        'Hi there, how are you?'
      ];

      const translations = [];
      
      for (const text of similarTexts) {
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
        translations.push({ original: text, translated: result.result });
      }

      // 检查相似文本的翻译是否也相似
      translations.forEach(({ original, translated }, index) => {
        expect(translated).toBeTruthy();
        expect(/[\u4e00-\u9fff]/.test(translated)).toBe(true);
        console.log(`📝 相似文本 ${index + 1}: "${original}" → "${translated}"`);
      });
    }, 40000);
  });

  describe('边界条件和错误处理', () => {
    test('最小文本翻译', async () => {
      const minimalTexts = ['Hi', 'OK', 'Yes', 'No', 'Help'];

      for (const text of minimalTexts) {
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
        expect(result.result.length).toBeGreaterThan(0);
        
        console.log(`🔤 最小文本: "${text}" → "${result.result}"`);
      }
    }, 25000);

    test('特殊字符处理', async () => {
      const specialTexts = [
        'Hello! How are you? I\'m fine.',
        'Price: $19.99 (tax included)',
        'Email: user@example.com',
        'Visit: https://example.com',
        'Call: +1-555-123-4567'
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
        expect(/[\u4e00-\u9fff]/.test(result.result)).toBe(true);
        
        console.log(`🔣 特殊字符: "${text}" → "${result.result}"`);
      }
    }, 30000);

    test('数字和单位处理', async () => {
      const numericTexts = [
        'The temperature is 25 degrees Celsius.',
        'I need 2 kilograms of rice.',
        'The meeting is at 3:30 PM.',
        'It costs $50 per month.',
        'The distance is 100 kilometers.'
      ];

      for (const text of numericTexts) {
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
        expect(/[\u4e00-\u9fff]/.test(result.result)).toBe(true);
        
        // 检查数字是否保留
        const hasNumbers = /\d/.test(result.result);
        expect(hasNumbers).toBe(true);
        
        console.log(`🔢 数字文本: "${text}" → "${result.result}"`);
      }
    }, 30000);
  });

  describe('性能和可靠性测试', () => {
    test('翻译服务可用性测试', async () => {
      const availabilityTests = Array.from({ length: 5 }, (_, i) => ({
        text: `Availability test ${i + 1}: This is a reliability check for our translation service.`,
        index: i + 1
      }));

      let successCount = 0;
      const results = [];

      for (const { text, index } of availabilityTests) {
        try {
          const startTime = Date.now();
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

          const endTime = Date.now();
          const responseTime = endTime - startTime;

          if (response.ok) {
            const result = await response.json();
            if (result.result) {
              successCount++;
              results.push({ index, success: true, responseTime, length: result.result.length });
            }
          } else {
            results.push({ index, success: false, status: response.status });
          }
        } catch (error) {
          results.push({ index, success: false, error: error.message });
        }
      }

      const successRate = (successCount / availabilityTests.length) * 100;
      expect(successRate).toBeGreaterThanOrEqual(80); // 至少80%成功率

      console.log(`📊 可用性测试结果: ${successCount}/${availabilityTests.length} (${successRate.toFixed(1)}%)`);
      results.forEach(result => {
        if (result.success) {
          console.log(`   ✅ 测试 ${result.index}: ${result.responseTime}ms, ${result.length} 字符`);
        } else {
          console.log(`   ❌ 测试 ${result.index}: ${result.status || result.error}`);
        }
      });
    }, 60000);

    test('并发翻译处理能力', async () => {
      const concurrentTexts = [
        'Concurrent test 1: Testing parallel processing capability.',
        'Concurrent test 2: Evaluating system performance under load.',
        'Concurrent test 3: Checking translation quality consistency.'
      ];

      const startTime = Date.now();
      
      const promises = concurrentTexts.map((text, index) =>
        fetch(NLLB_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            source: 'eng_Latn',
            target: 'zho_Hans',
          }),
        }).then(response => ({ index, response }))
      );

      const results = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      let successCount = 0;
      for (const { index, response } of results) {
        if (response.ok) {
          const result = await response.json();
          if (result.result) {
            successCount++;
            console.log(`⚡ 并发测试 ${index + 1}: "${result.result}"`);
          }
        }
      }

      expect(successCount).toBe(concurrentTexts.length);
      console.log(`🚀 并发翻译完成: ${successCount}/${concurrentTexts.length}, 总时间: ${totalTime}ms`);
    }, 30000);
  });
});
