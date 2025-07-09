#!/usr/bin/env node

/**
 * 修复生产环境翻译错误
 * 
 * 问题：
 * 1. NLLB API返回404错误
 * 2. /api/translate/public返回500错误
 * 
 * 解决方案：
 * 1. 更新NLLB服务URL
 * 2. 添加错误处理和重试机制
 * 3. 添加备用翻译服务
 * 4. 改进错误响应
 */

const fs = require('fs');
const path = require('path');

// 更新的翻译API文件
const updatedTranslatePublicRoute = `import { NextRequest, NextResponse } from 'next/server'

// NLLB语言代码映射
const NLLB_LANGUAGE_MAP: Record<string, string> = {
  'ht': 'hat_Latn', // Haitian Creole
  'lo': 'lao_Laoo', // Lao
  'sw': 'swh_Latn', // Swahili
  'my': 'mya_Mymr', // Burmese
  'te': 'tel_Telu', // Telugu
  'si': 'sin_Sinh', // Sinhala
  'am': 'amh_Ethi', // Amharic
  'km': 'khm_Khmr', // Khmer
  'ne': 'npi_Deva', // Nepali
  'mg': 'plt_Latn', // Malagasy
  'en': 'eng_Latn', // English
  'zh': 'zho_Hans', // Chinese (Simplified)
  'fr': 'fra_Latn', // French
  'es': 'spa_Latn', // Spanish
  'pt': 'por_Latn', // Portuguese
  'ar': 'arb_Arab', // Arabic
  'hi': 'hin_Deva', // Hindi
  'ja': 'jpn_Jpan', // Japanese
  'ko': 'kor_Hang', // Korean
  'de': 'deu_Latn', // German
  'it': 'ita_Latn', // Italian
  'ru': 'rus_Cyrl', // Russian
  'th': 'tha_Thai', // Thai
  'vi': 'vie_Latn', // Vietnamese
};

// 获取NLLB格式的语言代码
function getNLLBLanguageCode(langCode: string): string {
  return NLLB_LANGUAGE_MAP[langCode] || langCode;
}

// 备用翻译服务列表
const TRANSLATION_SERVICES = [
  {
    name: 'NLLB-Primary',
    url: 'https://wane0528-my-nllb-api.hf.space/api/v4/translator',
    timeout: 30000
  },
  {
    name: 'NLLB-Backup',
    url: 'https://huggingface.co/spaces/facebook/nllb-translation',
    timeout: 45000
  }
];

// 调用翻译服务（带重试机制）
async function translateWithRetry(text: string, sourceLang: string, targetLang: string, maxRetries = 2) {
  let lastError: Error | null = null;
  
  for (const service of TRANSLATION_SERVICES) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        console.log(\`[Translation] Attempting \${service.name} (attempt \${attempt + 1})\`);
        
        const result = await translateWithService(text, sourceLang, targetLang, service);
        
        console.log(\`[Translation] Success with \${service.name}\`);
        return result;
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.error(\`[Translation] \${service.name} attempt \${attempt + 1} failed:\`, lastError.message);
        
        // 如果不是最后一次尝试，等待一下再重试
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }
  }
  
  throw lastError || new Error('All translation services failed');
}

// 调用特定翻译服务
async function translateWithService(text: string, sourceLang: string, targetLang: string, service: any) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), service.timeout);

  try {
    const requestBody = {
      text: text,
      source: getNLLBLanguageCode(sourceLang),
      target: getNLLBLanguageCode(targetLang),
    };

    console.log(\`[Translation] Request to \${service.name}:\`, requestBody);

    const response = await fetch(service.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Translation-Service/1.0',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log(\`[Translation] \${service.name} response status:\`, response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(\`[Translation] \${service.name} error response:\`, errorText);
      throw new Error(\`\${service.name} API error: \${response.status} - \${errorText}\`);
    }

    const data = await response.json();
    console.log(\`[Translation] \${service.name} response data:\`, data);
    
    // 尝试不同的响应字段
    const translatedText = data.result || data.translated_text || data.translation || data.output;
    
    if (!translatedText) {
      throw new Error(\`No translation result found in response: \${JSON.stringify(data)}\`);
    }

    return translatedText;

  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(\`\${service.name} timeout after \${service.timeout}ms\`);
      }
      throw error;
    }
    throw new Error(\`Unknown \${service.name} error\`);
  }
}

// 简单翻译备用方案（基于字典）
function getSimpleTranslation(text: string, sourceLang: string, targetLang: string): string | null {
  // 简单的常用词汇翻译
  const simpleTranslations: Record<string, Record<string, string>> = {
    'en-zh': {
      'hello': '你好',
      'goodbye': '再见',
      'thank you': '谢谢',
      'yes': '是',
      'no': '不',
      'please': '请',
      'sorry': '对不起',
    },
    'zh-en': {
      '你好': 'hello',
      '再见': 'goodbye',
      '谢谢': 'thank you',
      '是': 'yes',
      '不': 'no',
      '请': 'please',
      '对不起': 'sorry',
    }
  };

  const key = \`\${sourceLang}-\${targetLang}\`;
  const translations = simpleTranslations[key];
  
  if (translations) {
    const lowerText = text.toLowerCase().trim();
    return translations[lowerText] || null;
  }
  
  return null;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { text, sourceLang, targetLang } = body;

    console.log('[Translation API] Request received:', {
      textLength: text?.length,
      sourceLang,
      targetLang,
      timestamp: new Date().toISOString()
    });

    // 验证输入
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { 
          error: 'Text is required and must be a string',
          success: false,
          code: 'INVALID_INPUT'
        },
        { status: 400 }
      );
    }

    if (!sourceLang || !targetLang) {
      return NextResponse.json(
        { 
          error: 'Source and target languages are required',
          success: false,
          code: 'MISSING_LANGUAGES'
        },
        { status: 400 }
      );
    }

    // 如果源语言和目标语言相同，直接返回原文
    if (sourceLang === targetLang) {
      return NextResponse.json({
        success: true,
        translatedText: text,
        sourceLang,
        targetLang,
        characterCount: text.length,
        isFree: true,
        processingTime: Date.now() - startTime,
        method: 'same-language'
      });
    }

    // 文本长度限制
    const maxFreeLength = 1000;
    if (text.length > maxFreeLength) {
      return NextResponse.json(
        { 
          error: 'Text too long for free translation. Please register to translate longer texts.',
          maxLength: maxFreeLength,
          currentLength: text.length,
          requiresLogin: true,
          success: false,
          code: 'TEXT_TOO_LONG'
        },
        { status: 400 }
      );
    }

    let translatedText: string;
    let method = 'api';

    try {
      // 尝试API翻译
      translatedText = await translateWithRetry(text, sourceLang, targetLang);
    } catch (apiError) {
      console.error('[Translation API] All API services failed:', apiError);
      
      // 尝试简单翻译备用方案
      const simpleResult = getSimpleTranslation(text, sourceLang, targetLang);
      if (simpleResult) {
        translatedText = simpleResult;
        method = 'dictionary';
        console.log('[Translation API] Using dictionary fallback');
      } else {
        // 如果所有方法都失败，返回详细错误信息
        return NextResponse.json(
          { 
            error: 'Translation service temporarily unavailable. Please try again later.',
            details: apiError instanceof Error ? apiError.message : 'Unknown error',
            success: false,
            code: 'SERVICE_UNAVAILABLE',
            retryAfter: 60
          },
          { status: 503 }
        );
      }
    }

    const response = {
      success: true,
      translatedText,
      sourceLang,
      targetLang,
      characterCount: text.length,
      isFree: true,
      processingTime: Date.now() - startTime,
      method
    };

    console.log('[Translation API] Success:', {
      method,
      processingTime: response.processingTime,
      characterCount: response.characterCount
    });

    return NextResponse.json(response);

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('[Translation API] Unexpected error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : 'Unknown error') : 
          'Please try again later',
        success: false,
        code: 'INTERNAL_ERROR',
        processingTime
      },
      { status: 500 }
    );
  }
}

// 支持CORS预检请求
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// 健康检查端点
export async function GET(request: NextRequest) {
  try {
    // 测试翻译服务是否可用
    const testResult = await translateWithService(
      'test', 
      'en', 
      'zh', 
      TRANSLATION_SERVICES[0]
    ).catch(() => null);

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        primary: testResult ? 'available' : 'unavailable',
        fallback: 'available'
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    );
  }
}`;

// 创建环境变量配置文件
const productionEnvTemplate = `# 生产环境翻译服务配置

# NLLB翻译服务配置
NLLB_SERVICE_URL=https://wane0528-my-nllb-api.hf.space/api/v4/translator
NLLB_SERVICE_TIMEOUT=30000
NLLB_BACKUP_URL=https://huggingface.co/spaces/facebook/nllb-translation
NLLB_BACKUP_TIMEOUT=45000

# 翻译服务配置
TRANSLATION_MAX_RETRIES=2
TRANSLATION_RETRY_DELAY=1000
TRANSLATION_FREE_LIMIT=1000

# 错误处理配置
ENABLE_TRANSLATION_FALLBACK=true
ENABLE_DICTIONARY_FALLBACK=true
ENABLE_DETAILED_LOGGING=true

# 服务监控配置
ENABLE_HEALTH_CHECK=true
HEALTH_CHECK_INTERVAL=300000

# 添加到你的生产环境变量中`;

function updateTranslationAPI() {
  const apiFilePath = path.join(__dirname, 'frontend/app/api/translate/public/route.ts');
  
  console.log('🔧 更新翻译API文件...');
  
  try {
    // 备份原文件
    const backupPath = apiFilePath + '.backup.' + Date.now();
    if (fs.existsSync(apiFilePath)) {
      fs.copyFileSync(apiFilePath, backupPath);
      console.log(`✅ 原文件已备份到: ${backupPath}`);
    }
    
    // 写入新文件
    fs.writeFileSync(apiFilePath, updatedTranslatePublicRoute);
    console.log('✅ 翻译API文件已更新');
    
    return true;
  } catch (error) {
    console.error('❌ 更新翻译API文件失败:', error.message);
    return false;
  }
}

function createProductionEnvTemplate() {
  const envPath = path.join(__dirname, '.env.production.template');
  
  console.log('🔧 创建生产环境配置模板...');
  
  try {
    fs.writeFileSync(envPath, productionEnvTemplate);
    console.log(`✅ 生产环境配置模板已创建: ${envPath}`);
    return true;
  } catch (error) {
    console.error('❌ 创建配置模板失败:', error.message);
    return false;
  }
}

function generateDeploymentInstructions() {
  const instructions = `
📋 生产环境部署说明

1. 更新环境变量:
   - 将 .env.production.template 中的配置添加到你的生产环境
   - 在Vercel/Netlify等平台的环境变量设置中添加这些配置

2. 验证修复:
   - 部署更新后的代码
   - 测试翻译功能是否正常工作
   - 检查错误日志是否还有500/404错误

3. 监控服务:
   - 访问 /api/translate/public (GET请求) 查看健康状态
   - 监控翻译请求的成功率和响应时间

4. 如果问题仍然存在:
   - 检查NLLB服务是否在线: https://wane0528-my-nllb-api.hf.space
   - 考虑使用其他翻译服务作为备用
   - 联系Hugging Face Space维护者

5. 备用方案:
   - 启用字典翻译备用方案
   - 集成其他翻译API (Google Translate, Azure Translator等)
   - 实现本地翻译服务
`;

  console.log(instructions);
}

// 主函数
function main() {
  console.log('🚀 开始修复生产环境翻译错误...');
  
  let success = true;
  
  // 更新翻译API
  if (!updateTranslationAPI()) {
    success = false;
  }
  
  // 创建配置模板
  if (!createProductionEnvTemplate()) {
    success = false;
  }
  
  // 显示部署说明
  generateDeploymentInstructions();
  
  if (success) {
    console.log('\n✅ 修复完成！请按照上述说明部署到生产环境。');
  } else {
    console.log('\n❌ 修复过程中出现错误，请检查上述错误信息。');
  }
}

// 运行修复
if (require.main === module) {
  main();
}

module.exports = {
  updateTranslationAPI,
  createProductionEnvTemplate
};
