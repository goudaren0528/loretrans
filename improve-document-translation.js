#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

console.log('🔧 改进文档翻译分块处理和重试机制...\n');

async function improveDocumentTranslation() {
    const translateAPIPath = path.join(__dirname, 'frontend/app/api/document/translate/route.ts');
    
    try {
        let content = await fs.readFile(translateAPIPath, 'utf8');
        
        // 1. 添加增强配置
        const enhancedConfig = `
// 增强的文档翻译配置 - 参考文本翻译的成功经验
const ENHANCED_DOC_CONFIG = {
  MAX_CHUNK_SIZE: 300,        // 减少到300字符提高成功率
  MAX_RETRIES: 3,             // 每个块最多重试3次
  RETRY_DELAY: 1000,          // 重试延迟1秒
  CHUNK_DELAY: 500,           // 块间延迟500ms
  REQUEST_TIMEOUT: 25000,     // 请求超时25秒
  CONCURRENT_CHUNKS: 1        // 顺序处理，避免限流
};
`;

        // 2. 改进的分块函数
        const improvedChunking = `
/**
 * 智能文档分块 - 参考文本翻译的300字符优化版本
 * 优先级: 段落边界 > 句子边界 > 逗号边界 > 词汇边界
 */
function smartDocumentChunking(text: string, maxChunkSize: number = ENHANCED_DOC_CONFIG.MAX_CHUNK_SIZE): string[] {
  if (text.length <= maxChunkSize) {
    return [text];
  }

  console.log(\`📝 智能文档分块: \${text.length}字符 -> \${maxChunkSize}字符/块\`);
  
  const chunks: string[] = [];
  
  // 策略1: 按段落分割（双换行）
  const paragraphs = text.split(/\\n\\s*\\n/);
  
  for (const paragraph of paragraphs) {
    if (paragraph.trim().length === 0) continue;
    
    if (paragraph.length <= maxChunkSize) {
      chunks.push(paragraph.trim());
    } else {
      // 策略2: 按句子分割
      const sentences = paragraph.split(/[.!?。！？]\\s+/);
      let currentChunk = '';
      
      for (let i = 0; i < sentences.length; i++) {
        const sentence = sentences[i].trim();
        if (!sentence) continue;
        
        const potentialChunk = currentChunk + (currentChunk ? '. ' : '') + sentence;
        
        if (potentialChunk.length <= maxChunkSize) {
          currentChunk = potentialChunk;
        } else {
          // 保存当前块
          if (currentChunk) {
            chunks.push(currentChunk + (currentChunk.endsWith('.') ? '' : '.'));
          }
          
          // 处理超长句子
          if (sentence.length > maxChunkSize) {
            const subChunks = forceChunkBySentence(sentence, maxChunkSize);
            chunks.push(...subChunks);
            currentChunk = '';
          } else {
            currentChunk = sentence;
          }
        }
      }
      
      // 添加最后一个块
      if (currentChunk) {
        chunks.push(currentChunk + (currentChunk.endsWith('.') ? '' : '.'));
      }
    }
  }
  
  const finalChunks = chunks.filter(chunk => chunk.trim().length > 0);
  console.log(\`✅ 文档分块完成: \${finalChunks.length}个块\`);
  
  return finalChunks;
}

/**
 * 强制分块处理超长句子
 */
function forceChunkBySentence(sentence: string, maxSize: number): string[] {
  const chunks: string[] = [];
  
  // 策略3: 按逗号分割
  const parts = sentence.split(/,\\s+/);
  let currentChunk = '';
  
  for (const part of parts) {
    const potentialChunk = currentChunk + (currentChunk ? ', ' : '') + part;
    
    if (potentialChunk.length <= maxSize) {
      currentChunk = potentialChunk;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      
      // 策略4: 按空格分割（词汇边界）
      if (part.length > maxSize) {
        const words = part.split(' ');
        let wordChunk = '';
        
        for (const word of words) {
          const potentialWordChunk = wordChunk + (wordChunk ? ' ' : '') + word;
          
          if (potentialWordChunk.length <= maxSize) {
            wordChunk = potentialWordChunk;
          } else {
            if (wordChunk) {
              chunks.push(wordChunk);
            }
            wordChunk = word.length > maxSize ? word.substring(0, maxSize) : word;
          }
        }
        
        if (wordChunk) {
          chunks.push(wordChunk);
        }
        currentChunk = '';
      } else {
        currentChunk = part;
      }
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}
`;

        // 3. 带重试机制的翻译函数
        const retryTranslation = `
/**
 * 带重试机制的文档块翻译函数
 */
async function translateChunkWithRetry(text: string, sourceLanguage: string, targetLanguage: string, retryCount: number = 0): Promise<{success: boolean, translatedText?: string, error?: string}> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ENHANCED_DOC_CONFIG.REQUEST_TIMEOUT);
  
  try {
    console.log(\`🔄 文档块翻译 (尝试 \${retryCount + 1}/\${ENHANCED_DOC_CONFIG.MAX_RETRIES + 1}): \${text.length}字符\`);
    
    const nllbServiceUrl = process.env.NLLB_SERVICE_URL || 'https://wane0528-my-nllb-api.hf.space/api/v4/translator'
    
    // 处理自动检测语言
    let actualSourceLanguage = sourceLanguage
    if (sourceLanguage === 'auto') {
      const hasChinese = /[\\u4e00-\\u9fff]/.test(text)
      const hasJapanese = /[\\u3040-\\u309f\\u30a0-\\u30ff]/.test(text)
      const hasKorean = /[\\uac00-\\ud7af]/.test(text)
      
      if (hasChinese) {
        actualSourceLanguage = 'zh'
      } else if (hasJapanese) {
        actualSourceLanguage = 'ja'
      } else if (hasKorean) {
        actualSourceLanguage = 'ko'
      } else {
        actualSourceLanguage = 'en'
      }
      
      console.log(\`[Language Detection] Auto detected: \${actualSourceLanguage} for text: \${text.substring(0, 50)}...\`)
    }
    
    // 映射到NLLB语言代码
    const nllbSourceLang = mapToNLLBLanguageCode(actualSourceLanguage)
    const nllbTargetLang = mapToNLLBLanguageCode(targetLanguage)
    
    console.log(\`[Language Mapping] \${actualSourceLanguage} -> \${nllbSourceLang}, \${targetLanguage} -> \${nllbTargetLang}\`)
    
    const response = await fetch(nllbServiceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        text,
        source: nllbSourceLang,
        target: nllbTargetLang,
        max_length: 1000
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(\`翻译服务错误: \${response.status} \${response.statusText}\`);
    }

    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error);
    }

    const translatedText = result.result || result.translated_text || result.translation || text;
    console.log(\`✅ 文档块翻译成功: \${translatedText.length}字符\`);
    
    return {
      success: true,
      translatedText: translatedText
    };

  } catch (error: any) {
    clearTimeout(timeoutId);
    console.log(\`❌ 文档块翻译失败 (尝试 \${retryCount + 1}): \${error.message}\`);
    
    // 检查是否需要重试
    if (retryCount < ENHANCED_DOC_CONFIG.MAX_RETRIES) {
      console.log(\`⏳ \${ENHANCED_DOC_CONFIG.RETRY_DELAY}ms后重试...\`);
      await new Promise(resolve => setTimeout(resolve, ENHANCED_DOC_CONFIG.RETRY_DELAY));
      return translateChunkWithRetry(text, sourceLanguage, targetLanguage, retryCount + 1);
    } else {
      console.log(\`💥 重试次数已用完，返回错误\`);
      return {
        success: false,
        error: error.message || '翻译失败'
      };
    }
  }
}
`;

        // 4. 查找并替换旧的分块和翻译逻辑
        if (content.includes('function splitTextIntoChunks')) {
            // 替换分块函数
            content = content.replace(
                /function splitTextIntoChunks[\s\S]*?(?=\/\/|async function|function|$)/,
                enhancedConfig + improvedChunking
            );
        } else {
            // 在导入后添加配置和函数
            const importEnd = content.lastIndexOf('import');
            const nextLineAfterImports = content.indexOf('\n', importEnd);
            content = content.slice(0, nextLineAfterImports + 1) + 
                     enhancedConfig + improvedChunking + 
                     content.slice(nextLineAfterImports + 1);
        }

        // 替换翻译函数
        if (content.includes('async function translateChunk')) {
            content = content.replace(
                /async function translateChunk[\s\S]*?(?=\/\/|async function|function|$)/,
                retryTranslation
            );
        }

        // 更新分块调用
        content = content.replace(
            /splitTextIntoChunks\(text, \d+\)/g,
            'smartDocumentChunking(text, ENHANCED_DOC_CONFIG.MAX_CHUNK_SIZE)'
        );

        // 更新翻译调用
        content = content.replace(
            /translateChunk\(/g,
            'translateChunkWithRetry('
        );

        // 添加块间延迟
        if (content.includes('for (const chunk of chunks)')) {
            content = content.replace(
                /for \(const chunk of chunks\) \{[\s\S]*?const chunkResult = await translateChunk/,
                `for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      // 添加块间延迟，避免请求过于频繁
      if (i > 0) {
        console.log(\`⏳ 块间延迟 \${ENHANCED_DOC_CONFIG.CHUNK_DELAY}ms...\`);
        await new Promise(resolve => setTimeout(resolve, ENHANCED_DOC_CONFIG.CHUNK_DELAY));
      }
      
      const chunkResult = await translateChunkWithRetry`
            );
        }

        await fs.writeFile(translateAPIPath, content, 'utf8');
        console.log('✅ 文档翻译改进完成');
        
    } catch (error) {
        console.error('❌ 改进文档翻译失败:', error.message);
    }
}

async function main() {
    console.log('🔍 问题分析:');
    console.log('- 文档翻译超时: "The operation was aborted due to timeout"');
    console.log('- 原因: 30秒超时 + 无重试机制 + 分块过大');
    console.log('- 解决方案: 参考文本翻译的成功经验\n');
    
    console.log('🛠️  改进内容:');
    console.log('1. 减少分块大小: 从默认大小到300字符');
    console.log('2. 添加重试机制: 每个块最多重试3次');
    console.log('3. 优化超时设置: 25秒超时 + 1秒重试延迟');
    console.log('4. 添加块间延迟: 500ms，避免请求过于频繁');
    console.log('5. 改进分块策略: 智能边界检测\n');
    
    await improveDocumentTranslation();
    
    console.log('\n✅ 改进完成！');
    console.log('\n🔄 需要重启服务以应用改进:');
    console.log('cd ~/translation-low-source');
    console.log('./start-dev.sh --stop');
    console.log('./start-dev.sh --background');
}

main().catch(console.error);
