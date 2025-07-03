#!/usr/bin/env node

/**
 * 真实翻译流程和积分扣减测试脚本
 * 测试本地NLLB模型翻译和完整的积分扣减逻辑
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
    url: 'http://localhost:3000' // 强制使用本地URL进行测试
  }
};

// 初始化Supabase客户端
const supabase = createClient(config.supabase.url, config.supabase.serviceKey);

// 测试数据
const testData = {
  // 测试用户信息
  testUser: {
    email: 'test-real-translation@example.com',
    password: 'TestPassword123!',
    credits: 100
  },
  // 测试翻译文本
  translations: [
    {
      text: 'Hello, how are you today?',
      sourceLanguage: 'en',
      targetLanguage: 'ht', // 海地克里奥尔语
      expectedCredits: 5 // 预期扣减积分
    },
    {
      text: 'This is a longer text that should consume more credits for translation testing purposes.',
      sourceLanguage: 'en',
      targetLanguage: 'sw', // 斯瓦希里语
      expectedCredits: 15
    },
    {
      text: 'Good morning! Welcome to our translation service.',
      sourceLanguage: 'en',
      targetLanguage: 'my', // 缅甸语
      expectedCredits: 8
    }
  ]
};

class RealTranslationTester {
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
    } catch (error) {
      this.testResults.services.nllb = {
        status: 'error',
        error: error.message
      };
      this.log(`❌ NLLB服务连接失败: ${error.message}`, 'error');
      this.log(`   请确保NLLB服务在 ${config.nllb.url} 运行`, 'warning');
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

    for (const testCase of testData.translations) {
      try {
        this.log(`\n📝 翻译: "${testCase.text}"`, 'info');
        this.log(`   ${testCase.sourceLanguage} → ${testCase.targetLanguage}`, 'info');
        
        const startTime = Date.now();
        const response = await axios.post(`${config.nllb.url}/translate`, {
          text: testCase.text,
          sourceLanguage: testCase.sourceLanguage,
          targetLanguage: testCase.targetLanguage
        }, { timeout: 30000 });

        const endTime = Date.now();
        const processingTime = endTime - startTime;

        this.log(`✅ 翻译成功 (${processingTime}ms)`, 'success');
        this.log(`   结果: "${response.data.translatedText}"`, 'success');
        
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

    // 记录初始积分
    const initialCredits = this.testUser.credits;
    this.log(`📊 初始积分: ${initialCredits}`, 'info');

    // 首先进行用户登录获取认证token
    let authToken = null;
    try {
      this.log('🔐 进行用户认证...', 'info');
      
      // 使用Supabase客户端进行认证
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

    for (let i = 0; i < testData.translations.length; i++) {
      const testCase = testData.translations[i];
      
      try {
        this.log(`\n📝 测试翻译 ${i + 1}/${testData.translations.length}`, 'info');
        this.log(`   文本: "${testCase.text}"`, 'info');
        this.log(`   语言: ${testCase.sourceLanguage} → ${testCase.targetLanguage}`, 'info');
        
        // 获取当前积分
        const { data: currentUser, error: fetchError } = await supabase
          .from('users')
          .select('credits')
          .eq('id', this.testUser.id)
          .single();
          
        if (fetchError) throw fetchError;
        
        const creditsBefore = currentUser.credits;
        this.log(`   翻译前积分: ${creditsBefore}`, 'info');

        // 调用翻译API - 使用正确的认证
        const startTime = Date.now();
        const response = await axios.post(`${config.frontend.url}/api/translate`, {
          text: testCase.text,
          sourceLang: testCase.sourceLanguage,
          targetLang: testCase.targetLanguage
        }, {
          timeout: 30000,
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
        this.log(`   结果: "${response.data.translatedText}"`, 'success');
        this.log(`   翻译后积分: ${creditsAfter}`, 'success');
        this.log(`   扣减积分: ${creditsUsed}`, 'success');
        
        // 验证积分扣减是否合理
        if (creditsUsed > 0) {
          this.log(`✅ 积分扣减正常`, 'success');
        } else {
          this.log(`⚠️ 积分未扣减，可能在免费额度内`, 'warning');
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
        .update({ credits: 1 })
        .eq('id', this.testUser.id);
        
      if (updateError) throw updateError;
      
      this.log('✅ 用户积分已设置为 1', 'info');

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

      // 尝试翻译一个需要更多积分的文本
      const longText = 'This is a very long text that should require more than 1 credit to translate, so it should fail with insufficient credits error message.';
      
      try {
        const response = await axios.post(`${config.frontend.url}/api/translate`, {
          text: longText,
          sourceLang: 'en',
          targetLang: 'ht'
        }, {
          timeout: 30000,
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        this.log('⚠️ 翻译成功，但应该因积分不足而失败', 'warning');
        
      } catch (error) {
        if (error.response && error.response.status === 402) {
          this.log('✅ 积分不足检查正常工作', 'success');
          this.log(`   错误信息: ${error.response.data.error}`, 'info');
        } else {
          this.log(`❌ 意外错误: ${error.message}`, 'error');
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
    this.log('\n📊 测试报告', 'info');
    this.log('='.repeat(50), 'info');
    
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

    // 积分使用统计
    const fullFlowTests = this.testResults.translations.filter(t => t.type === 'full_flow' && t.success);
    if (fullFlowTests.length > 0) {
      this.log('\n💰 积分使用统计:', 'info');
      let totalCreditsUsed = 0;
      fullFlowTests.forEach((test, index) => {
        const credits = test.credits;
        totalCreditsUsed += credits.used;
        this.log(`   测试 ${index + 1}: ${credits.used} 积分 (${credits.before} → ${credits.after})`, 'info');
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

    // 错误报告
    if (this.testResults.errors.length > 0) {
      this.log('\n❌ 错误列表:', 'error');
      this.testResults.errors.forEach((error, index) => {
        this.log(`   ${index + 1}. ${error}`, 'error');
      });
    }

    this.log('\n✅ 测试完成！', 'success');
  }

  // 运行所有测试
  async runAllTests() {
    try {
      this.log('🚀 开始真实翻译流程测试', 'info');
      this.log('='.repeat(50), 'info');
      
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
  const tester = new RealTranslationTester();
  await tester.runAllTests();
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = RealTranslationTester;
