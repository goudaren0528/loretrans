#!/usr/bin/env node

const fs = require('fs');

console.log('🚀 创建增强的翻译服务 - 300字符分块 + 重试机制...\n');

// 增强的翻译服务配置
const ENHANCED_CONFIG = {
  MAX_CHUNK_SIZE: 300,        // 减少到300字符
  MAX_RETRIES: 3,             // 每个块最多重试3次
  RETRY_DELAY: 1000,          // 重试延迟1秒
  CHUNK_DELAY: 500,           // 块间延迟500ms
  REQUEST_TIMEOUT: 25000,     // 请求超时25秒
  CONCURRENT_CHUNKS: 1        // 顺序处理，避免限流
};

// NLLB语言代码映射
const NLLB_LANGUAGE_MAP = {
  'am': 'amh_Ethi', 'ar': 'arb_Arab', 'en': 'eng_Latn', 'es': 'spa_Latn',
  'fr': 'fra_Latn', 'ha': 'hau_Latn', 'hi': 'hin_Deva', 'ht': 'hat_Latn',
  'ig': 'ibo_Latn', 'km': 'khm_Khmr', 'ky': 'kir_Cyrl', 'lo': 'lao_Laoo',
  'mg': 'plt_Latn', 'mn': 'khk_Cyrl', 'my': 'mya_Mymr', 'ne': 'npi_Deva',
  'ps': 'pbt_Arab', 'pt': 'por_Latn', 'sd': 'snd_Arab', 'si': 'sin_Sinh',
  'sw': 'swh_Latn', 'te': 'tel_Telu', 'tg': 'tgk_Cyrl', 'xh': 'xho_Latn',
  'yo': 'yor_Latn', 'zh': 'zho_Hans', 'zu': 'zul_Latn'
};

// 主要翻译服务端点
const NLLB_SERVICE_URL = 'https://wane0528-my-nllb-api.hf.space/api/v4/translator';

/**
 * 智能文本分块 - 300字符优化版本
 */
function smartTextChunking(text, maxChunkSize = ENHANCED_CONFIG.MAX_CHUNK_SIZE) {
  if (text.length <= maxChunkSize) {
    return [text];
  }

  console.log(`📝 开始智能分块: ${text.length}字符 -> ${maxChunkSize}字符/块`);
  
  const chunks = [];
  
  // 策略1: 按段落分割（双换行）
  const paragraphs = text.split(/\n\s*\n/);
  
  for (const paragraph of paragraphs) {
    if (paragraph.length <= maxChunkSize) {
      chunks.push(paragraph.trim());
    } else {
      // 策略2: 按句子分割
      const sentences = paragraph.split(/[.!?。！？]\s+/);
      let currentChunk = '';
      
      for (let i = 0; i < sentences.length; i++) {
        const sentence = sentences[i];
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
  console.log(`✅ 分块完成: ${finalChunks.length}个块`);
  
  return finalChunks;
}

/**
 * 强制按句子结构分块（处理超长句子）
 */
function forceChunkBySentence(sentence, maxSize) {
  const chunks = [];
  
  // 按逗号分割
  const parts = sentence.split(/,\s+/);
  let currentChunk = '';
  
  for (const part of parts) {
    const potentialChunk = currentChunk + (currentChunk ? ', ' : '') + part;
    
    if (potentialChunk.length <= maxSize) {
      currentChunk = potentialChunk;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      
      // 如果单个部分仍然太长，按空格分割
      if (part.length > maxSize) {
        const words = part.split(' ');
        let wordChunk = '';
        
        for (const word of words) {
          if ((wordChunk + ' ' + word).length <= maxSize) {
            wordChunk += (wordChunk ? ' ' : '') + word;
          } else {
            if (wordChunk) chunks.push(wordChunk);
            wordChunk = word;
          }
        }
        
        if (wordChunk) currentChunk = wordChunk;
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

module.exports = {
  smartTextChunking,
  forceChunkBySentence,
  ENHANCED_CONFIG,
  NLLB_LANGUAGE_MAP,
  NLLB_SERVICE_URL
};

console.log('✅ 增强翻译服务模块创建完成！');
