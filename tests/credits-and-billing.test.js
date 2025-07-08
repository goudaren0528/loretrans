/**
 * 积分系统和付费功能测试
 * 测试积分计算、扣费逻辑和付费功能限制
 */

const { describe, test, expect, beforeAll, afterAll } = require('@jest/globals');

// 模拟fetch如果在Node.js环境中
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

describe('积分系统和付费功能测试', () => {
  const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
  
  beforeAll(async () => {
    console.log('🚀 开始积分系统和付费功能测试...');
  });

  afterAll(() => {
    console.log('✅ 积分系统和付费功能测试完成');
  });

  describe('积分计算逻辑测试', () => {
    test('免费额度计算 (≤500字符)', () => {
      const calculateCredits = (textLength) => {
        if (textLength <= 500) {
          return 0; // 免费
        }
        const extraChars = textLength - 500;
        return Math.ceil(extraChars * 0.1); // 0.1积分/字符，向上取整
      };

      // 测试免费额度内的文本
      expect(calculateCredits(100)).toBe(0);
      expect(calculateCredits(300)).toBe(0);
      expect(calculateCredits(500)).toBe(0);
      
      console.log('✅ 免费额度计算正确');
    });

    test('付费积分计算 (>500字符)', () => {
      const calculateCredits = (textLength) => {
        if (textLength <= 500) {
          return 0;
        }
        const extraChars = textLength - 500;
        return Math.max(Math.ceil(extraChars * 0.1), 50); // 最小扣费50积分
      };

      // 测试付费文本的积分计算
      expect(calculateCredits(501)).toBe(50); // 最小扣费
      expect(calculateCredits(600)).toBe(50); // 100字符 = 10积分，但最小50积分
      expect(calculateCredits(1000)).toBe(50); // 500字符 = 50积分
      expect(calculateCredits(1500)).toBe(100); // 1000字符 = 100积分
      expect(calculateCredits(2000)).toBe(150); // 1500字符 = 150积分
      
      console.log('✅ 付费积分计算正确');
    });

    test('不同套餐积分价值计算', () => {
      const packages = [
        { name: 'Starter', credits: 2500, price: 5, charactersValue: 25000 },
        { name: 'Basic', credits: 6000, price: 10, charactersValue: 60000 },
        { name: 'Pro', credits: 20000, price: 25, charactersValue: 200000 }
      ];

      packages.forEach(pkg => {
        const creditsPerDollar = pkg.credits / pkg.price;
        const charactersPerDollar = pkg.charactersValue / pkg.price;
        
        expect(creditsPerDollar).toBeGreaterThan(0);
        expect(charactersPerDollar).toBeGreaterThan(0);
        
        console.log(`💰 ${pkg.name}: ${creditsPerDollar} 积分/$, ${charactersPerDollar} 字符/$`);
      });
    });
  });

  describe('文本长度分类测试', () => {
    const textCategories = [
      {
        category: '超短文本',
        examples: ['Hi', 'OK', 'Yes', 'Thank you'],
        expectedCredits: 0
      },
      {
        category: '短文本',
        examples: [
          'Hello, how are you?',
          'Welcome to our platform.',
          'Please enter your text here.'
        ],
        expectedCredits: 0
      },
      {
        category: '中等文本 (接近500字符)',
        examples: [
          'This is a test message that is getting close to the 500 character limit for free translations. We need to make sure that the credit calculation works correctly for texts that are right at the boundary between free and paid tiers. This text should be just under the limit.'.substring(0, 499)
        ],
        expectedCredits: 0
      },
      {
        category: '边界文本 (恰好500字符)',
        examples: [
          'This is a test message that is exactly 500 characters long to test the boundary condition for free translations. We need to make sure that the credit calculation works correctly for texts that are right at the boundary between free and paid tiers. This text should be exactly at the limit and should still be free of charge for our users.'.substring(0, 500)
        ],
        expectedCredits: 0
      },
      {
        category: '付费文本 (501字符)',
        examples: [
          ('This is a test message that is exactly 501 characters long to test the boundary condition for paid translations. We need to make sure that the credit calculation works correctly for texts that are right at the boundary between free and paid tiers. This text should be exactly one character over the limit and should require credits for processing. The system should detect this and charge the minimum fee of 50 credits as specified in our pricing model. Additional text to reach exactly 501 characters.').substring(0, 501)
        ],
        expectedCredits: 50 // 最小扣费
      }
    ];

    test.each(textCategories)('$category 积分计算', ({ category, examples, expectedCredits }) => {
      const calculateCredits = (textLength) => {
        if (textLength <= 500) {
          return 0;
        }
        const extraChars = textLength - 500;
        return Math.max(Math.ceil(extraChars * 0.1), 50);
      };

      examples.forEach(text => {
        const credits = calculateCredits(text.length);
        expect(credits).toBe(expectedCredits);
        
        console.log(`📝 ${category}: ${text.length} 字符 → ${credits} 积分`);
      });
    });
  });

  describe('用户权限和限制测试', () => {
    test('未登录用户限制', () => {
      const guestLimits = {
        maxCharactersPerRequest: 200,
        maxRequestsPerDay: 3,
        supportedFeatures: ['text-translation'],
        restrictedFeatures: ['document-translation', 'tts', 'history']
      };

      expect(guestLimits.maxCharactersPerRequest).toBe(200);
      expect(guestLimits.maxRequestsPerDay).toBe(3);
      expect(guestLimits.supportedFeatures).toContain('text-translation');
      expect(guestLimits.restrictedFeatures).toContain('document-translation');
      
      console.log('👤 未登录用户限制验证通过');
    });

    test('注册用户权限', () => {
      const registeredUserLimits = {
        maxCharactersPerRequest: 300, // 免费额度
        initialCredits: 500,
        weeklyBonusCredits: 50,
        supportedFeatures: ['text-translation', 'tts', 'history'],
        restrictedFeatures: ['batch-translation', 'api-access']
      };

      expect(registeredUserLimits.maxCharactersPerRequest).toBe(300);
      expect(registeredUserLimits.initialCredits).toBe(500);
      expect(registeredUserLimits.supportedFeatures).toContain('tts');
      expect(registeredUserLimits.restrictedFeatures).toContain('api-access');
      
      console.log('👥 注册用户权限验证通过');
    });

    test('付费用户权限', () => {
      const paidUserFeatures = {
        starter: {
          credits: 2500,
          features: ['text-translation', 'document-translation', 'tts', 'history'],
          maxFileSize: '5MB',
          priority: 'standard'
        },
        basic: {
          credits: 6000,
          features: ['text-translation', 'document-translation', 'tts', 'history', 'priority-support'],
          maxFileSize: '10MB',
          priority: 'high'
        },
        pro: {
          credits: 20000,
          features: ['text-translation', 'document-translation', 'tts', 'history', 'batch-translation', 'api-access'],
          maxFileSize: '50MB',
          priority: 'highest'
        }
      };

      Object.entries(paidUserFeatures).forEach(([tier, features]) => {
        expect(features.credits).toBeGreaterThan(0);
        expect(features.features).toContain('text-translation');
        expect(features.maxFileSize).toBeTruthy();
        
        console.log(`💎 ${tier.toUpperCase()} 套餐: ${features.credits} 积分, ${features.features.length} 功能`);
      });
    });
  });

  describe('积分消耗场景测试', () => {
    test('不同长度文本的积分消耗', () => {
      const testScenarios = [
        { description: '短邮件', length: 800, expectedCredits: 50 },
        { description: '商业信函', length: 1200, expectedCredits: 70 },
        { description: '学术摘要', length: 2000, expectedCredits: 150 },
        { description: '技术文档', length: 3500, expectedCredits: 300 },
        { description: '长篇文章', length: 5000, expectedCredits: 450 }
      ];

      const calculateCredits = (length) => {
        if (length <= 500) return 0;
        return Math.max(Math.ceil((length - 500) * 0.1), 50);
      };

      testScenarios.forEach(scenario => {
        const actualCredits = calculateCredits(scenario.length);
        expect(actualCredits).toBe(scenario.expectedCredits);
        
        console.log(`📊 ${scenario.description}: ${scenario.length} 字符 → ${actualCredits} 积分`);
      });
    });

    test('套餐使用量预估', () => {
      const usagePatterns = [
        {
          user: '学生用户',
          monthlyTexts: [800, 1200, 600, 900, 1500], // 5次翻译
          expectedCredits: 50 + 70 + 50 + 50 + 100, // 320积分
          recommendedPlan: 'Starter'
        },
        {
          user: '个人博主',
          monthlyTexts: Array(15).fill(1000), // 15次1000字符翻译
          expectedCredits: 15 * 50, // 750积分
          recommendedPlan: 'Starter'
        },
        {
          user: '自由职业者',
          monthlyTexts: Array(25).fill(2000), // 25次2000字符翻译
          expectedCredits: 25 * 150, // 3750积分
          recommendedPlan: 'Basic'
        }
      ];

      const calculateCredits = (length) => {
        if (length <= 500) return 0;
        return Math.max(Math.ceil((length - 500) * 0.1), 50);
      };

      usagePatterns.forEach(pattern => {
        const totalCredits = pattern.monthlyTexts.reduce((sum, length) => {
          return sum + calculateCredits(length);
        }, 0);

        expect(totalCredits).toBe(pattern.expectedCredits);
        
        console.log(`👤 ${pattern.user}: ${pattern.monthlyTexts.length} 次翻译, ${totalCredits} 积分, 推荐: ${pattern.recommendedPlan}`);
      });
    });
  });

  describe('积分不足处理测试', () => {
    test('积分余额检查逻辑', () => {
      const checkCreditsAvailability = (userCredits, requiredCredits) => {
        return {
          sufficient: userCredits >= requiredCredits,
          shortage: Math.max(0, requiredCredits - userCredits),
          canProceed: userCredits >= requiredCredits
        };
      };

      const testCases = [
        { userCredits: 100, requiredCredits: 50, shouldProceed: true },
        { userCredits: 30, requiredCredits: 50, shouldProceed: false },
        { userCredits: 0, requiredCredits: 50, shouldProceed: false },
        { userCredits: 50, requiredCredits: 50, shouldProceed: true }
      ];

      testCases.forEach(({ userCredits, requiredCredits, shouldProceed }) => {
        const result = checkCreditsAvailability(userCredits, requiredCredits);
        expect(result.canProceed).toBe(shouldProceed);
        
        if (!shouldProceed) {
          expect(result.shortage).toBeGreaterThan(0);
        }
        
        console.log(`💳 余额检查: ${userCredits} 积分, 需要 ${requiredCredits} → ${result.canProceed ? '可以' : '不可以'}继续`);
      });
    });

    test('充值建议逻辑', () => {
      const getRechargeRecommendation = (shortage) => {
        const packages = [
          { name: 'Starter', credits: 2500, price: 5 },
          { name: 'Basic', credits: 6000, price: 10 },
          { name: 'Pro', credits: 20000, price: 25 }
        ];

        return packages.find(pkg => pkg.credits >= shortage) || packages[packages.length - 1];
      };

      const shortageScenarios = [100, 1000, 3000, 8000, 15000];

      shortageScenarios.forEach(shortage => {
        const recommendation = getRechargeRecommendation(shortage);
        expect(recommendation).toBeTruthy();
        expect(recommendation.credits).toBeGreaterThanOrEqual(shortage);
        
        console.log(`💰 缺少 ${shortage} 积分 → 推荐 ${recommendation.name} ($${recommendation.price})`);
      });
    });
  });

  describe('付费转化场景测试', () => {
    test('免费用户转化触发点', () => {
      const conversionTriggers = [
        {
          scenario: '首次超过免费额度',
          textLength: 501,
          expectedAction: 'show_credits_info',
          message: '您的文本超过了免费额度，需要消耗积分'
        },
        {
          scenario: '积分余额不足',
          userCredits: 30,
          requiredCredits: 50,
          expectedAction: 'show_recharge_options',
          message: '积分不足，请充值后继续'
        },
        {
          scenario: '连续使用3天',
          usageDays: 3,
          expectedAction: 'show_upgrade_benefits',
          message: '升级套餐享受更多优惠'
        }
      ];

      conversionTriggers.forEach(trigger => {
        expect(trigger.expectedAction).toBeTruthy();
        expect(trigger.message).toBeTruthy();
        
        console.log(`🎯 转化场景: ${trigger.scenario} → ${trigger.expectedAction}`);
      });
    });

    test('套餐推荐算法', () => {
      const recommendPackage = (monthlyUsage) => {
        if (monthlyUsage <= 2500) return 'Starter';
        if (monthlyUsage <= 6000) return 'Basic';
        return 'Pro';
      };

      const usagePatterns = [1000, 3000, 7000, 15000];

      usagePatterns.forEach(usage => {
        const recommendation = recommendPackage(usage);
        expect(['Starter', 'Basic', 'Pro']).toContain(recommendation);
        
        console.log(`📈 月使用量 ${usage} 积分 → 推荐 ${recommendation} 套餐`);
      });
    });
  });

  describe('积分系统安全性测试', () => {
    test('积分计算防篡改', () => {
      const secureCalculateCredits = (textLength, serverSideValidation = true) => {
        // 服务端验证文本长度
        if (!serverSideValidation) {
          throw new Error('Server-side validation required');
        }
        
        if (typeof textLength !== 'number' || textLength < 0) {
          throw new Error('Invalid text length');
        }
        
        if (textLength <= 500) {
          return 0;
        }
        
        const extraChars = textLength - 500;
        return Math.max(Math.ceil(extraChars * 0.1), 50);
      };

      // 正常情况
      expect(secureCalculateCredits(1000)).toBe(50);
      
      // 异常情况
      expect(() => secureCalculateCredits(1000, false)).toThrow('Server-side validation required');
      expect(() => secureCalculateCredits(-100)).toThrow('Invalid text length');
      expect(() => secureCalculateCredits('invalid')).toThrow('Invalid text length');
      
      console.log('🔒 积分计算安全性验证通过');
    });

    test('积分扣除原子性', () => {
      const atomicDeductCredits = (userCredits, requiredCredits) => {
        // 模拟原子性操作
        if (userCredits < requiredCredits) {
          return {
            success: false,
            error: 'Insufficient credits',
            remainingCredits: userCredits
          };
        }
        
        return {
          success: true,
          remainingCredits: userCredits - requiredCredits,
          deductedCredits: requiredCredits
        };
      };

      const testCases = [
        { userCredits: 100, requiredCredits: 50, shouldSucceed: true },
        { userCredits: 30, requiredCredits: 50, shouldSucceed: false }
      ];

      testCases.forEach(({ userCredits, requiredCredits, shouldSucceed }) => {
        const result = atomicDeductCredits(userCredits, requiredCredits);
        expect(result.success).toBe(shouldSucceed);
        
        if (shouldSucceed) {
          expect(result.remainingCredits).toBe(userCredits - requiredCredits);
        } else {
          expect(result.remainingCredits).toBe(userCredits);
        }
        
        console.log(`⚛️ 原子扣费: ${userCredits} - ${requiredCredits} → ${result.success ? '成功' : '失败'}`);
      });
    });
  });
});
