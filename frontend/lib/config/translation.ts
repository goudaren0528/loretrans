/**
 * 全局翻译配置
 * 
 * 统一管理所有翻译服务的配置参数
 */

// 翻译分块配置 - NLLB服务优化版本
export const TRANSLATION_CHUNK_CONFIG = {
  // NLLB服务分块大小：800字符（确保不超过NLLB token限制）
  MAX_CHUNK_SIZE: 600,        // 🔥 优化块大小到600字符，平衡稳定性和效率
  
  // 批处理配置 - 文本翻译使用顺序处理
  BATCH_SIZE: 1,                      // 批次大小：1个块/批次（顺序处理）
  
  // 并发处理配置 - 优化长文本处理
  CONCURRENT_BATCHES: 1,              // 🔥 并发批次数：1（避免NLLB服务过载）
  CONCURRENT_BATCH_DELAY: 2000,       // 🔥 批次间延迟：2秒（与文档翻译一致）
  MAX_CONCURRENT_REQUESTS: 2,         // 🔥 最大并发请求：2个（与文档翻译一致）
  
  // 重试配置 - 增强稳定性
  MAX_RETRIES: 4,             // 🔥 适度重试4次，平衡成功率和速度
  RETRY_DELAY: 1500,          // 🔥 重试延迟1.5秒，平衡恢复时间和速度
  
  // 延迟配置 - 避免NLLB服务限流，与文档翻译保持一致
  CHUNK_DELAY: 800,           // 块间延迟：800ms，减少NLLB服务压力
  BATCH_DELAY: 3000,          // 🔥 批次间延迟：3秒，给NLLB服务更多恢复时间
  
  // 超时配置
  REQUEST_TIMEOUT: 45000,     // 🔥 增加请求超时到45秒，适应NLLB服务不稳定情况
  
  // 并发控制
  CONCURRENT_CHUNKS: 1        // 顺序处理，避免限流
};

// 🔥 新增：文档翻译专用配置
export const DOCUMENT_TRANSLATION_CONFIG = {
  // 文档分块配置 - 700字符上限
  MAX_CHUNK_SIZE: 700,        // 🔥 调整为700字符上限
  
  // 并发处理配置 - 顺序处理
  BATCH_SIZE: 1,              // 🔥 每批次1个块（顺序处理）
  CONCURRENT_BATCHES: 1,      // 批次数量：1
  MAX_CONCURRENT_REQUESTS: 1, // 最大并发请求：1个（顺序处理）
  
  // 重试配置
  MAX_RETRIES: 3,             // 重试次数：3次
  RETRY_DELAY: 1500,          // 重试延迟：1.5秒
  
  // 延迟配置
  CHUNK_DELAY: 1000,          // 块间延迟：1秒
  BATCH_DELAY: 1500,          // 批次间延迟：1.5秒
  
  // 超时配置
  REQUEST_TIMEOUT: 25000,     // 请求超时：25秒
  
  // 并发控制
  CONCURRENT_CHUNKS: 2        // 🔥 并发处理2个块
};

// 不同场景的分块策略 - 考虑NLLB服务限制
export const CHUNK_STRATEGIES = {
  // 短文本：直接翻译，不分块
  SHORT_TEXT: {
    MAX_LENGTH: 500,
    CHUNK_SIZE: 500
  },
  
  // 中等文本：适中分块
  MEDIUM_TEXT: {
    MAX_LENGTH: 1500,
    CHUNK_SIZE: 600
  },
  
  // 长文本：较大分块
  LONG_TEXT: {
    MAX_LENGTH: 3000,
    CHUNK_SIZE: 800
  },
  
  // 超长文本：最大分块（不超过NLLB限制）
  EXTRA_LONG_TEXT: {
    CHUNK_SIZE: 800  // 保持800字符，确保NLLB服务稳定性
  }
};

// 根据文本长度选择最佳分块策略
export function getOptimalChunkSize(textLength: number): number {
  if (textLength <= CHUNK_STRATEGIES.SHORT_TEXT.MAX_LENGTH) {
    return CHUNK_STRATEGIES.SHORT_TEXT.CHUNK_SIZE;
  } else if (textLength <= CHUNK_STRATEGIES.MEDIUM_TEXT.MAX_LENGTH) {
    return CHUNK_STRATEGIES.MEDIUM_TEXT.CHUNK_SIZE;
  } else if (textLength <= CHUNK_STRATEGIES.LONG_TEXT.MAX_LENGTH) {
    return CHUNK_STRATEGIES.LONG_TEXT.CHUNK_SIZE;
  } else {
    return CHUNK_STRATEGIES.EXTRA_LONG_TEXT.CHUNK_SIZE;
  }
}

// 估算分块数量
export function estimateChunkCount(textLength: number, chunkSize?: number): number {
  const actualChunkSize = chunkSize || getOptimalChunkSize(textLength);
  return Math.ceil(textLength / actualChunkSize);
}

// 估算处理时间（秒）
export function estimateProcessingTime(textLength: number, chunkSize?: number): number {
  const chunkCount = estimateChunkCount(textLength, chunkSize);
  const baseTimePerChunk = 3; // 基础时间：每块3秒
  const networkDelay = chunkCount * 0.5; // 网络延迟：每块0.5秒
  const batchDelay = Math.max(0, Math.ceil(chunkCount / 3) - 1) * 2; // 批次间延迟
  
  return Math.ceil(baseTimePerChunk * chunkCount + networkDelay + batchDelay);
}

// 语言支持配置
export const SUPPORTED_LANGUAGES = {
  // 主要语言
  'zh': { name: '中文', nllb: 'zho_Hans' },
  'en': { name: 'English', nllb: 'eng_Latn' },
  'es': { name: 'Español', nllb: 'spa_Latn' },
  'fr': { name: 'Français', nllb: 'fra_Latn' },
  'pt': { name: 'Português', nllb: 'por_Latn' },
  'ar': { name: 'العربية', nllb: 'arb_Arab' },
  'hi': { name: 'हिन्दी', nllb: 'hin_Deva' },
  
  // 东南亚语言
  'th': { name: 'ไทย', nllb: 'tha_Thai' },
  'vi': { name: 'Tiếng Việt', nllb: 'vie_Latn' },
  'id': { name: 'Bahasa Indonesia', nllb: 'ind_Latn' },
  'ms': { name: 'Bahasa Melayu', nllb: 'zsm_Latn' },
  'tl': { name: 'Filipino', nllb: 'fil_Latn' },
  'km': { name: 'ខ្មែរ', nllb: 'khm_Khmr' },
  'lo': { name: 'ລາວ', nllb: 'lao_Laoo' },
  'my': { name: 'မြန်မာ', nllb: 'mya_Mymr' },
  'si': { name: 'සිංහල', nllb: 'sin_Sinh' },
  
  // 其他语言
  'ja': { name: '日本語', nllb: 'jpn_Jpan' },
  'ko': { name: '한국어', nllb: 'kor_Hang' },
  'ru': { name: 'Русский', nllb: 'rus_Cyrl' },
  'de': { name: 'Deutsch', nllb: 'deu_Latn' },
  'it': { name: 'Italiano', nllb: 'ita_Latn' },
  'nl': { name: 'Nederlands', nllb: 'nld_Latn' },
  'pl': { name: 'Polski', nllb: 'pol_Latn' },
  'tr': { name: 'Türkçe', nllb: 'tur_Latn' },
  'he': { name: 'עברית', nllb: 'heb_Hebr' },
  'fa': { name: 'فارسی', nllb: 'pes_Arab' },
  'ur': { name: 'اردو', nllb: 'urd_Arab' },
  'bn': { name: 'বাংলা', nllb: 'ben_Beng' },
  'ta': { name: 'தமிழ்', nllb: 'tam_Taml' },
  'te': { name: 'తెలుగు', nllb: 'tel_Telu' },
  'ml': { name: 'മലയാളം', nllb: 'mal_Mlym' },
  'kn': { name: 'ಕನ್ನಡ', nllb: 'kan_Knda' },
  'gu': { name: 'ગુજરાતી', nllb: 'guj_Gujr' },
  'pa': { name: 'ਪੰਜਾਬੀ', nllb: 'pan_Guru' },
  'ne': { name: 'नेपाली', nllb: 'npi_Deva' },
  'sw': { name: 'Kiswahili', nllb: 'swh_Latn' },
  'am': { name: 'አማርኛ', nllb: 'amh_Ethi' },
  'ha': { name: 'Hausa', nllb: 'hau_Latn' },
  'ig': { name: 'Igbo', nllb: 'ibo_Latn' },
  'yo': { name: 'Yorùbá', nllb: 'yor_Latn' },
  'zu': { name: 'isiZulu', nllb: 'zul_Latn' },
  'xh': { name: 'isiXhosa', nllb: 'xho_Latn' },
  'mg': { name: 'Malagasy', nllb: 'plt_Latn' },
  'ht': { name: 'Kreyòl Ayisyen', nllb: 'hat_Latn' },
  'ps': { name: 'پښتو', nllb: 'pbt_Arab' },
  'sd': { name: 'سنڌي', nllb: 'snd_Arab' },
  'ky': { name: 'Кыргызча', nllb: 'kir_Cyrl' },
  'tg': { name: 'Тоҷикӣ', nllb: 'tgk_Cyrl' },
  'mn': { name: 'Монгол', nllb: 'khk_Cyrl' }
};

// 获取NLLB语言代码
export function getNLLBLanguageCode(languageCode: string): string {
  return SUPPORTED_LANGUAGES[languageCode]?.nllb || languageCode;
}

// 验证语言支持
export function isLanguageSupported(languageCode: string): boolean {
  return languageCode in SUPPORTED_LANGUAGES;
}
