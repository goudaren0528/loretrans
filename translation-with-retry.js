#!/usr/bin/env node

const { ENHANCED_CONFIG, NLLB_LANGUAGE_MAP, NLLB_SERVICE_URL } = require('./enhanced-translation-service');

/**
 * 带重试机制的翻译函数
 * @param {string} text - 要翻译的文本
 * @param {string} sourceNLLB - 源语言NLLB代码
 * @param {string} targetNLLB - 目标语言NLLB代码
 * @param {number} retryCount - 当前重试次数
 * @returns {Promise<string>} - 翻译结果
 */
async function translateWithRetry(text, sourceNLLB, targetNLLB, retryCount = 0) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ENHANCED_CONFIG.REQUEST_TIMEOUT);
  
  try {
    console.log(`🔄 翻译请求 (尝试 ${retryCount + 1}/${ENHANCED_CONFIG.MAX_RETRIES + 1}): ${text.length}字符`);
    
    const response = await fetch(NLLB_SERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        source: sourceNLLB,
        target: targetNLLB,
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`NLLB service error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    // 处理不同的响应格式
    let translatedText = '';
    if (result.result) {
      translatedText = result.result;
    } else if (result.translated_text) {
      translatedText = result.translated_text;
    } else if (result.translation) {
      translatedText = result.translation;
    } else if (typeof result === 'string') {
      translatedText = result;
    } else {
      throw new Error('No translation returned from NLLB service');
    }
    
    console.log(`✅ 翻译成功: ${translatedText.length}字符`);
    return translatedText;
    
  } catch (error) {
    clearTimeout(timeoutId);
    console.log(`❌ 翻译失败 (尝试 ${retryCount + 1}): ${error.message}`);
    
    // 检查是否需要重试
    if (retryCount < ENHANCED_CONFIG.MAX_RETRIES) {
      console.log(`⏳ ${ENHANCED_CONFIG.RETRY_DELAY}ms后重试...`);
      await new Promise(resolve => setTimeout(resolve, ENHANCED_CONFIG.RETRY_DELAY));
      return translateWithRetry(text, sourceNLLB, targetNLLB, retryCount + 1);
    } else {
      console.log(`💥 重试次数已用完，抛出错误`);
      throw error;
    }
  }
}

/**
 * 备用翻译（当主服务完全失败时）
 */
function getFallbackTranslation(text, sourceLang, targetLang) {
  const langNames = {
    'en': 'English', 'es': 'Spanish', 'fr': 'French', 'ar': 'Arabic',
    'zh': 'Chinese', 'hi': 'Hindi', 'pt': 'Portuguese', 'sw': 'Swahili',
    'te': 'Telugu', 'my': 'Burmese', 'lo': 'Lao', 'ht': 'Haitian Creole'
  };
  
  const sourceLanguage = langNames[sourceLang] || sourceLang;
  const targetLanguage = langNames[targetLang] || targetLang;
  
  return `[${targetLanguage} Translation] ${text.substring(0, 100)}${text.length > 100 ? '...' : ''} (from ${sourceLanguage})`;
}

/**
 * 主翻译函数 - 处理完整的翻译流程
 */
async function enhancedTranslate(text, sourceLang, targetLang) {
  console.log(`\n🌍 开始增强翻译: ${text.length}字符, ${sourceLang} -> ${targetLang}`);
  
  try {
    // 获取NLLB语言代码
    const sourceNLLB = NLLB_LANGUAGE_MAP[sourceLang];
    const targetNLLB = NLLB_LANGUAGE_MAP[targetLang];
    
    if (!sourceNLLB || !targetNLLB) {
      throw new Error(`不支持的语言: ${sourceLang} 或 ${targetLang}`);
    }
    
    console.log(`🔄 语言代码转换: ${sourceLang} -> ${sourceNLLB}, ${targetLang} -> ${targetNLLB}`);
    
    // 智能分块
    const { smartTextChunking } = require('./enhanced-translation-service');
    const chunks = smartTextChunking(text, ENHANCED_CONFIG.MAX_CHUNK_SIZE);
    
    if (chunks.length === 1) {
      // 单块处理
      console.log(`📄 单块翻译模式`);
      const translatedText = await translateWithRetry(chunks[0], sourceNLLB, targetNLLB);
      
      return {
        translatedText: translatedText,
        sourceLang: sourceLang,
        targetLang: targetLang,
        characterCount: text.length,
        chunksProcessed: 1,
        service: 'nllb-enhanced',
        processingTime: Date.now()
      };
    } else {
      // 多块处理
      console.log(`📚 多块翻译模式: ${chunks.length}个块`);
      const translatedChunks = [];
      const chunkResults = [];
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(`\n📖 处理块 ${i + 1}/${chunks.length}: ${chunk.length}字符`);
        
        try {
          const chunkResult = await translateWithRetry(chunk, sourceNLLB, targetNLLB);
          translatedChunks.push(chunkResult);
          chunkResults.push({ index: i + 1, status: 'success', length: chunkResult.length });
        } catch (chunkError) {
          console.log(`⚠️ 块 ${i + 1} 翻译失败，使用备用翻译`);
          const fallbackChunk = getFallbackTranslation(chunk, sourceLang, targetLang);
          translatedChunks.push(fallbackChunk);
          chunkResults.push({ index: i + 1, status: 'fallback', error: chunkError.message });
        }
        
        // 块间延迟
        if (i < chunks.length - 1) {
          console.log(`⏳ 块间延迟 ${ENHANCED_CONFIG.CHUNK_DELAY}ms...`);
          await new Promise(resolve => setTimeout(resolve, ENHANCED_CONFIG.CHUNK_DELAY));
        }
      }
      
      const finalTranslation = translatedChunks.join(' ');
      
      console.log(`\n✅ 多块翻译完成: ${finalTranslation.length}字符`);
      
      return {
        translatedText: finalTranslation,
        sourceLang: sourceLang,
        targetLang: targetLang,
        characterCount: text.length,
        chunksProcessed: chunks.length,
        chunkResults: chunkResults,
        service: 'nllb-enhanced',
        processingTime: Date.now()
      };
    }
    
  } catch (error) {
    console.error(`💥 翻译过程失败:`, error);
    throw error;
  }
}

module.exports = {
  translateWithRetry,
  getFallbackTranslation,
  enhancedTranslate
};

console.log('✅ 带重试机制的翻译函数创建完成！');
