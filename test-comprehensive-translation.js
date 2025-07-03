#!/usr/bin/env node

/**
 * 全面的翻译流程和积分扣减测试脚本
 * 测试：真实NLLB服务、长文本翻译、积分扣减逻辑、积分不足场景
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// 配置
const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  },
  nllb: {
    url: process.env.NLLB_LOCAL_URL || 'http://localhost:8081',
    enabled: process.env.NLLB_LOCAL_ENABLED === 'true'
  },
  frontend: {
    url: 'http://localhost:3000'
  }
};

// 初始化Supabase客户端
const supabase = createClient(config.supabase.url, config.supabase.serviceKey);

// 测试数据 - 包含不同长度的文本
const testData = {
  testUser: {
    email: 'test-comprehensive-translation@example.com',
    password: 'TestPassword123!',
    credits: 50 // 设置较少的初始积分来测试扣减
  },
  translations: [
    {
      name: '短文本 (免费额度内)',
      text: 'Hello, how are you today?',
      sourceLanguage: 'en',
      targetLanguage: 'ht',
      expectedCredits: 0, // 应该在免费额度内
      category: 'free'
    },
    {
      name: '中等文本 (需要积分)',
      text: 'This is a longer text that should consume credits for translation testing purposes. We need to test the credit deduction logic with a text that exceeds the free character limit of 500 characters. This text is specifically designed to be longer than the free allowance so we can verify that credits are properly deducted from the user account when they perform translations that exceed their free quota.',
      sourceLanguage: 'en',
      targetLanguage: 'sw',
      expectedCredits: 5, // 预期扣减积分
      category: 'paid'
    },
    {
      name: '长文本 (消耗更多积分)',
      text: 'This is an even longer text designed to test the credit deduction system with substantial content that will definitely exceed the free character limit. The purpose of this extended text is to simulate real-world usage scenarios where users translate longer documents or passages that require significant computational resources. By testing with longer content, we can verify that the credit calculation algorithm works correctly and that users are charged appropriately based on the actual length and complexity of their translation requests. This comprehensive testing approach ensures that our billing system is fair, accurate, and transparent to users who rely on our translation services for their important communication needs across different languages and cultural contexts.',
      sourceLanguage: 'en',
      targetLanguage: 'my',
      expectedCredits: 15, // 预期扣减更多积分
      category: 'paid'
    },
    {
      name: '超长文本 (测试积分不足)',
      text: 'This is an extremely long text specifically designed to test the insufficient credits scenario in our translation system. The text needs to be long enough to require more credits than what we will set for the test user account. This comprehensive test will verify that our system properly handles cases where users attempt to translate content that would cost more credits than they currently have available in their account balance. The system should gracefully reject such requests with appropriate error messages and should not perform the translation or deduct any credits from the user account when insufficient funds are detected. This is a critical feature for maintaining the integrity of our billing system and ensuring that users cannot accidentally overdraw their credit balance. The error handling should be user-friendly and should provide clear guidance on how users can purchase additional credits to complete their desired translation tasks. Furthermore, this test will help us verify that our credit calculation logic is working correctly and that the system can accurately predict the cost of a translation before attempting to process it, which is essential for providing users with transparent pricing information.',
      sourceLanguage: 'en',
      targetLanguage: 'ht',
      expectedCredits: 50, // 需要很多积分，用于测试积分不足
      category: 'insufficient'
    }
  ]
};

class ComprehensiveTranslationTester {
  constructor() {
    this.testResults = {
      services: {},
      translations: [],
      credits: {},
      errors: []
    };
  }

  // 颜色输出函数
  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',    // 青色
      success: '\x1b[32m', // 绿色
      warning: '\x1b[33m', // 黄色
      error: '\x1b[31m',   // 红色
      reset: '\x1b[0m'     // 重置
    };
    console.log(`${colors[type]}${message}${colors.reset}`);
  }

  // 检查服务状态
  async checkServices() {
    this.log('\n🔍 检查服务状态...', 'info');
    
    // 检查NLLB本地服务
    try {
      const nllbResponse = await axios.get(`${config.nllb.url}/health`, { timeout: 5000 });
      this.testResults.services.nllb = {
        status: 'running',
        data: nllbResponse.data
      };
      this.log(`✅ NLLB服务运行正常 (${config.nllb.url})`, 'success');
      this.log(`   模型已加载: ${nllbResponse.data.model_loaded}`, 'info');
      this.log(`   服务模式: ${nllbResponse.data.mode}`, 'info');
    } catch (error) {
      this.testResults.services.nllb = {
        status: 'error',
        error: error.message
      };
      this.log(`❌ NLLB服务连接失败: ${error.message}`, 'error');
    }

    // 检查前端服务
    try {
      const frontendResponse = await axios.get(`${config.frontend.url}/api/health`, { timeout: 5000 });
      this.testResults.services.frontend = {
        status: 'running',
        data: frontendResponse.data
      };
      this.log(`✅ 前端API服务运行正常 (${config.frontend.url})`, 'success');
    } catch (error) {
      this.testResults.services.frontend = {
        status: 'error',
        error: error.message
      };
      this.log(`❌ 前端API服务连接失败: ${error.message}`, 'error');
    }

    // 检查数据库连接
    try {
      const { data, error } = await supabase.from('users').select('count').limit(1);
      if (error) throw error;
      this.testResults.services.database = { status: 'running' };
      this.log('✅ 数据库连接正常', 'success');
    } catch (error) {
      this.testResults.services.database = {
        status: 'error',
        error: error.message
      };
      this.log(`❌ 数据库连接失败: ${error.message}`, 'error');
    }
  }

  // 创建或获取测试用户
  async setupTestUser() {
    this.log('\n👤 设置测试用户...', 'info');
    
    try {
      // 检查用户是否存在
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', testData.testUser.email)
        .single();

      if (existingUser) {
        this.log('✅ 测试用户已存在', 'success');
        this.testUser = existingUser;
        
        // 重置积分到测试值
        const { error: updateError } = await supabase
          .from('users')
          .update({ credits: testData.testUser.credits })
          .eq('id', existingUser.id);
          
        if (updateError) throw updateError;
        this.log(`✅ 用户积分已重置为 ${testData.testUser.credits}`, 'success');
      } else {
        // 创建新用户
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: testData.testUser.email,
          password: testData.testUser.password,
          email_confirm: true
        });

        if (createError) throw createError;

        // 在users表中创建用户记录
        const { data: userRecord, error: insertError } = await supabase
          .from('users')
          .insert({
            id: newUser.user.id,
            email: testData.testUser.email,
            credits: testData.testUser.credits,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) throw insertError;
        
        this.testUser = userRecord;
        this.log('✅ 测试用户创建成功', 'success');
      }

      this.log(`   用户ID: ${this.testUser.id}`, 'info');
      this.log(`   邮箱: ${this.testUser.email}`, 'info');
      this.log(`   当前积分: ${this.testUser.credits}`, 'info');

    } catch (error) {
      this.log(`❌ 用户设置失败: ${error.message}`, 'error');
      this.testResults.errors.push(`User setup failed: ${error.message}`);
      throw error;
    }
  }

  // 测试直接NLLB翻译
  async testDirectNLLBTranslation() {
    this.log('\n🤖 测试直接NLLB翻译...', 'info');
    
    if (this.testResults.services.nllb?.status !== 'running') {
      this.log('⚠️ NLLB服务未运行，跳过直接翻译测试', 'warning');
      return;
    }

    // 测试不同长度的文本
    for (const testCase of testData.translations) {
      try {
        this.log(`\n📝 ${testCase.name}`, 'info');
        this.log(`   文本长度: ${testCase.text.length} 字符`, 'info');
        this.log(`   语言: ${testCase.sourceLanguage} → ${testCase.targetLanguage}`, 'info');
        
        const startTime = Date.now();
        const response = await axios.post(`${config.nllb.url}/translate`, {
          text: testCase.text,
          sourceLanguage: testCase.sourceLanguage,
          targetLanguage: testCase.targetLanguage
        }, { timeout: 60000 }); // 增加超时时间用于长文本

        const endTime = Date.now();
        const processingTime = endTime - startTime;

        this.log(`✅ 翻译成功 (${processingTime}ms)`, 'success');
        this.log(`   结果长度: ${response.data.translatedText.length} 字符`, 'success');
        this.log(`   结果预览: "${response.data.translatedText.substring(0, 100)}${response.data.translatedText.length > 100 ? '...' : ''}"`, 'success');
        
        if (response.data.stats) {
          this.log(`   预计积分: ${response.data.stats.creditsRequired}`, 'info');
        }
        
        this.testResults.translations.push({
          type: 'direct_nllb',
          input: testCase,
          output: response.data,
          processingTime,
          success: true
        });

      } catch (error) {
        this.log(`❌ 翻译失败: ${error.message}`, 'error');
        this.testResults.translations.push({
          type: 'direct_nllb',
          input: testCase,
          error: error.message,
          success: false
        });
      }
    }
  }

  // 测试完整的翻译和积分扣减流程
  async testFullTranslationFlow() {
    this.log('\n🔄 测试完整翻译和积分扣减流程...', 'info');
    
    if (this.testResults.services.frontend?.status !== 'running') {
      this.log('⚠️ 前端API服务未运行，跳过完整流程测试', 'warning');
      return;
    }

    // 获取认证token
    let authToken = null;
    try {
      this.log('🔐 进行用户认证...', 'info');
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: testData.testUser.email,
        password: testData.testUser.password
      });

      if (authError) {
        this.log(`❌ 用户认证失败: ${authError.message}`, 'error');
        return;
      }

      authToken = authData.session?.access_token;
      if (!authToken) {
        this.log('❌ 未获取到认证token', 'error');
        return;
      }

      this.log('✅ 用户认证成功', 'success');
      
    } catch (error) {
      this.log(`❌ 认证过程失败: ${error.message}`, 'error');
      return;
    }

    // 记录初始积分
    const initialCredits = this.testUser.credits;
    this.log(`📊 初始积分: ${initialCredits}`, 'info');

    // 测试不同类别的翻译
    for (let i = 0; i < testData.translations.length; i++) {
      const testCase = testData.translations[i];
      
      // 跳过积分不足测试，稍后单独处理
      if (testCase.category === 'insufficient') {
        continue;
      }
      
      try {
        this.log(`\n📝 测试 ${i + 1}: ${testCase.name}`, 'info');
        this.log(`   文本长度: ${testCase.text.length} 字符`, 'info');
        this.log(`   语言: ${testCase.sourceLanguage} → ${testCase.targetLanguage}`, 'info');
        this.log(`   预期积分扣减: ${testCase.expectedCredits}`, 'info');
        
        // 获取当前积分
        const { data: currentUser, error: fetchError } = await supabase
          .from('users')
          .select('credits')
          .eq('id', this.testUser.id)
          .single();
          
        if (fetchError) throw fetchError;
        
        const creditsBefore = currentUser.credits;
        this.log(`   翻译前积分: ${creditsBefore}`, 'info');

        // 调用翻译API
        const startTime = Date.now();
        const response = await axios.post(`${config.frontend.url}/api/translate`, {
          text: testCase.text,
          sourceLang: testCase.sourceLanguage,
          targetLang: testCase.targetLanguage
        }, {
          timeout: 60000,
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });

        const endTime = Date.now();
        const processingTime = endTime - startTime;

        // 获取翻译后积分
        const { data: updatedUser, error: fetchError2 } = await supabase
          .from('users')
          .select('credits')
          .eq('id', this.testUser.id)
          .single();
          
        if (fetchError2) throw fetchError2;
        
        const creditsAfter = updatedUser.credits;
        const creditsUsed = creditsBefore - creditsAfter;

        this.log(`✅ 翻译成功 (${processingTime}ms)`, 'success');
        this.log(`   结果长度: ${response.data.translatedText.length} 字符`, 'success');
        this.log(`   结果预览: "${response.data.translatedText.substring(0, 100)}${response.data.translatedText.length > 100 ? '...' : ''}"`, 'success');
        this.log(`   翻译后积分: ${creditsAfter}`, 'success');
        this.log(`   实际扣减积分: ${creditsUsed}`, 'success');
        
        // 验证积分扣减是否合理
        if (testCase.category === 'free' && creditsUsed === 0) {
          this.log(`✅ 免费翻译正常 - 未扣减积分`, 'success');
        } else if (testCase.category === 'paid' && creditsUsed > 0) {
          this.log(`✅ 付费翻译正常 - 扣减了 ${creditsUsed} 积分`, 'success');
        } else if (testCase.category === 'paid' && creditsUsed === 0) {
          this.log(`⚠️ 预期扣减积分但未扣减 - 可能仍在免费额度内`, 'warning');
        } else {
          this.log(`⚠️ 积分扣减与预期不符`, 'warning');
        }

        // 显示积分计算详情
        if (response.data.calculation) {
          const calc = response.data.calculation;
          this.log(`   积分计算详情:`, 'info');
          this.log(`     总字符数: ${calc.total_characters}`, 'info');
          this.log(`     免费字符数: ${calc.free_characters}`, 'info');
          this.log(`     计费字符数: ${calc.billable_characters}`, 'info');
          this.log(`     计算积分: ${calc.credits_required}`, 'info');
        }

        this.testResults.translations.push({
          type: 'full_flow',
          input: testCase,
          output: response.data,
          processingTime,
          credits: {
            before: creditsBefore,
            after: creditsAfter,
            used: creditsUsed,
            expected: testCase.expectedCredits
          },
          success: true
        });

      } catch (error) {
        this.log(`❌ 翻译流程失败: ${error.message}`, 'error');
        if (error.response) {
          this.log(`   HTTP状态: ${error.response.status}`, 'error');
          this.log(`   响应: ${JSON.stringify(error.response.data, null, 2)}`, 'error');
        }
        
        this.testResults.translations.push({
          type: 'full_flow',
          input: testCase,
          error: error.message,
          success: false
        });
      }
    }
  }

  // 测试积分不足的情况
  async testInsufficientCredits() {
    this.log('\n💳 测试积分不足情况...', 'info');
    
    try {
      // 将用户积分设置为很少
      const { error: updateError } = await supabase
        .from('users')
        .update({ credits: 5 }) // 设置很少的积分
        .eq('id', this.testUser.id);
        
      if (updateError) throw updateError;
      
      this.log('✅ 用户积分已设置为 5', 'info');

      // 获取认证token
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: testData.testUser.email,
        password: testData.testUser.password
      });

      if (authError) {
        this.log(`❌ 认证失败: ${authError.message}`, 'error');
        return;
      }

      const authToken = authData.session?.access_token;
      if (!authToken) {
        this.log('❌ 未获取到认证token', 'error');
        return;
      }

      // 找到需要大量积分的测试用例
      const insufficientTest = testData.translations.find(t => t.category === 'insufficient');
      if (!insufficientTest) {
        this.log('⚠️ 未找到积分不足测试用例', 'warning');
        return;
      }

      this.log(`📝 测试积分不足场景: ${insufficientTest.name}`, 'info');
      this.log(`   文本长度: ${insufficientTest.text.length} 字符`, 'info');
      this.log(`   预期需要积分: ${insufficientTest.expectedCredits}`, 'info');
      
      try {
        const response = await axios.post(`${config.frontend.url}/api/translate`, {
          text: insufficientTest.text,
          sourceLang: insufficientTest.sourceLanguage,
          targetLang: insufficientTest.targetLanguage
        }, {
          timeout: 60000,
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        this.log('⚠️ 翻译成功，但应该因积分不足而失败', 'warning');
        this.log(`   返回结果: ${response.data.translatedText.substring(0, 100)}...`, 'warning');
        
      } catch (error) {
        if (error.response && error.response.status === 402) {
          this.log('✅ 积分不足检查正常工作', 'success');
          this.log(`   错误信息: ${error.response.data.error}`, 'info');
          if (error.response.data.calculation) {
            const calc = error.response.data.calculation;
            this.log(`   需要积分: ${calc.credits_required}`, 'info');
            this.log(`   当前积分不足`, 'info');
          }
        } else {
          this.log(`❌ 意外错误: ${error.message}`, 'error');
          if (error.response) {
            this.log(`   HTTP状态: ${error.response.status}`, 'error');
            this.log(`   响应: ${JSON.stringify(error.response.data, null, 2)}`, 'error');
          }
        }
      }

      // 恢复积分
      const { error: restoreError } = await supabase
        .from('users')
        .update({ credits: testData.testUser.credits })
        .eq('id', this.testUser.id);
        
      if (restoreError) throw restoreError;
      this.log('✅ 用户积分已恢复', 'info');

    } catch (error) {
      this.log(`❌ 积分不足测试失败: ${error.message}`, 'error');
    }
  }

  // 生成测试报告
  generateReport() {
    this.log('\n📊 全面测试报告', 'info');
    this.log('='.repeat(60), 'info');
    
    // 服务状态报告
    this.log('\n🔧 服务状态:', 'info');
    Object.entries(this.testResults.services).forEach(([service, result]) => {
      const status = result.status === 'running' ? '✅' : '❌';
      this.log(`   ${status} ${service}: ${result.status}`, result.status === 'running' ? 'success' : 'error');
    });

    // 翻译测试报告
    this.log('\n🔄 翻译测试结果:', 'info');
    const successfulTranslations = this.testResults.translations.filter(t => t.success);
    const failedTranslations = this.testResults.translations.filter(t => !t.success);
    
    this.log(`   总测试数: ${this.testResults.translations.length}`, 'info');
    this.log(`   成功: ${successfulTranslations.length}`, 'success');
    this.log(`   失败: ${failedTranslations.length}`, failedTranslations.length > 0 ? 'error' : 'info');

    // 按类型分组统计
    const directNLLB = this.testResults.translations.filter(t => t.type === 'direct_nllb');
    const fullFlow = this.testResults.translations.filter(t => t.type === 'full_flow');
    
    this.log(`\n📈 测试类型统计:`, 'info');
    this.log(`   直接NLLB测试: ${directNLLB.filter(t => t.success).length}/${directNLLB.length}`, 'info');
    this.log(`   完整流程测试: ${fullFlow.filter(t => t.success).length}/${fullFlow.length}`, 'info');

    // 积分使用统计
    const fullFlowTests = this.testResults.translations.filter(t => t.type === 'full_flow' && t.success);
    if (fullFlowTests.length > 0) {
      this.log('\n💰 积分使用统计:', 'info');
      let totalCreditsUsed = 0;
      fullFlowTests.forEach((test, index) => {
        const credits = test.credits;
        totalCreditsUsed += credits.used;
        this.log(`   ${test.input.name}: ${credits.used} 积分 (${credits.before} → ${credits.after})`, 'info');
      });
      this.log(`   总计使用: ${totalCreditsUsed} 积分`, 'info');
    }

    // 性能统计
    const processingTimes = this.testResults.translations
      .filter(t => t.success && t.processingTime)
      .map(t => t.processingTime);
      
    if (processingTimes.length > 0) {
      const avgTime = processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length;
      const maxTime = Math.max(...processingTimes);
      const minTime = Math.min(...processingTimes);
      
      this.log('\n⏱️ 性能统计:', 'info');
      this.log(`   平均处理时间: ${avgTime.toFixed(0)}ms`, 'info');
      this.log(`   最快: ${minTime}ms`, 'info');
      this.log(`   最慢: ${maxTime}ms`, 'info');
    }

    // 文本长度统计
    this.log('\n📏 文本长度处理能力:', 'info');
    testData.translations.forEach(test => {
      const result = this.testResults.translations.find(r => 
        r.input && r.input.text === test.text && r.success
      );
      if (result) {
        this.log(`   ${test.name}: ${test.text.length} 字符 ✅`, 'success');
      } else {
        this.log(`   ${test.name}: ${test.text.length} 字符 ❌`, 'error');
      }
    });

    // 错误报告
    if (this.testResults.errors.length > 0) {
      this.log('\n❌ 错误列表:', 'error');
      this.testResults.errors.forEach((error, index) => {
        this.log(`   ${index + 1}. ${error}`, 'error');
      });
    }

    this.log('\n✅ 全面测试完成！', 'success');
    this.log('='.repeat(60), 'info');
  }

  // 运行所有测试
  async runAllTests() {
    try {
      this.log('🚀 开始全面翻译流程测试', 'info');
      this.log('='.repeat(60), 'info');
      
      await this.checkServices();
      await this.setupTestUser();
      await this.testDirectNLLBTranslation();
      await this.testFullTranslationFlow();
      await this.testInsufficientCredits();
      
      this.generateReport();
      
    } catch (error) {
      this.log(`❌ 测试过程中发生严重错误: ${error.message}`, 'error');
      console.error(error);
    }
  }
}

// 运行测试
async function main() {
  const tester = new ComprehensiveTranslationTester();
  await tester.runAllTests();
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = ComprehensiveTranslationTester;
