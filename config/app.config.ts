export const APP_CONFIG = {
  // 应用基本信息
  app: {
    name: 'Loretrans',
    description: 'Translate Low-Resource Languages to English',
    version: '1.0.0',
    author: 'Loretrans Team',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://loretrans.com',
  },

  // 支持的语言配置
  languages: {
    // 小语种到英文的主要支持语言
    supported: [
      // 英语 - 作为源语言和目标语言
      { 
        code: 'en', 
        name: 'English', 
        nativeName: 'English', 
        slug: 'english',
        available: true,
        bidirectional: true,
        priority: 0, // 最高优先级
        region: 'Global',
        speakers: '1.5B',
      },
      // 第一批 - 已完全支持的核心小语种
      { 
        code: 'ht', 
        name: 'Haitian Creole', 
        nativeName: 'Kreyòl Ayisyen', 
        slug: 'creole',
        available: true,
        bidirectional: true,
        priority: 1, // 优先级
        region: 'Caribbean',
        speakers: '12M', // 使用人数
      },
      { 
        code: 'lo', 
        name: 'Lao', 
        nativeName: 'ລາວ', 
        slug: 'lao',
        available: true,
        bidirectional: true,
        priority: 1,
        region: 'Southeast Asia',
        speakers: '7M',
      },
      { 
        code: 'sw', 
        name: 'Swahili', 
        nativeName: 'Kiswahili', 
        slug: 'swahili',
        available: true,
        bidirectional: true,
        priority: 1,
        region: 'East Africa',
        speakers: '200M',
      },
      { 
        code: 'my', 
        name: 'Burmese', 
        nativeName: 'မြန်မာ', 
        slug: 'burmese',
        available: true,
        bidirectional: true,
        priority: 1,
        region: 'Southeast Asia',
        speakers: '33M',
      },
      { 
        code: 'te', 
        name: 'Telugu', 
        nativeName: 'తెలుగు', 
        slug: 'telugu',
        available: true,
        bidirectional: true,
        priority: 1,
        region: 'South Asia',
        speakers: '95M',
      },
      
      // 第二批 - 新增支持的小语种
      { 
        code: 'si', 
        name: 'Sinhala', 
        nativeName: 'සිංහල', 
        slug: 'sinhala',
        available: true, // 新启用
        bidirectional: true,
        priority: 2,
        region: 'South Asia',
        speakers: '17M',
      },
      { 
        code: 'am', 
        name: 'Amharic', 
        nativeName: 'አማርኛ', 
        slug: 'amharic',
        available: true, // 新启用
        bidirectional: true,
        priority: 2,
        region: 'East Africa',
        speakers: '57M',
      },
      { 
        code: 'km', 
        name: 'Khmer', 
        nativeName: 'ខ្មែរ', 
        slug: 'khmer',
        available: true, // 新启用
        bidirectional: true,
        priority: 2,
        region: 'Southeast Asia',
        speakers: '16M',
      },
      { 
        code: 'ne', 
        name: 'Nepali', 
        nativeName: 'नेपाली', 
        slug: 'nepali',
        available: true, // 新启用
        bidirectional: true,
        priority: 2,
        region: 'South Asia',
        speakers: '16M',
      },
      { 
        code: 'mg', 
        name: 'Malagasy', 
        nativeName: 'Malagasy', 
        slug: 'malagasy',
        available: true, // 新启用
        bidirectional: true,
        priority: 2,
        region: 'Africa',
        speakers: '25M',
      },
      
      // 第三批 - 扩展的小语种
      { 
        code: 'yo', 
        name: 'Yoruba', 
        nativeName: 'Yorùbá', 
        slug: 'yoruba',
        available: true, // 新启用
        bidirectional: true,
        priority: 2,
        region: 'West Africa',
        speakers: '45M',
      },
      { 
        code: 'ig', 
        name: 'Igbo', 
        nativeName: 'Igbo', 
        slug: 'igbo',
        available: true, // 新启用
        bidirectional: true,
        priority: 2,
        region: 'West Africa',
        speakers: '27M',
      },
      { 
        code: 'ha', 
        name: 'Hausa', 
        nativeName: 'Hausa', 
        slug: 'hausa',
        available: true, // 新启用
        bidirectional: true,
        priority: 2,
        region: 'West Africa',
        speakers: '70M',
      },
      { 
        code: 'zu', 
        name: 'Zulu', 
        nativeName: 'isiZulu', 
        slug: 'zulu',
        available: true, // 新启用
        bidirectional: true,
        priority: 2,
        region: 'Southern Africa',
        speakers: '12M',
      },
      { 
        code: 'xh', 
        name: 'Xhosa', 
        nativeName: 'isiXhosa', 
        slug: 'xhosa',
        available: true, // 新启用
        bidirectional: true,
        priority: 2,
        region: 'Southern Africa',
        speakers: '8M',
      },
      
      // 第四批 - 亚洲小语种
      { 
        code: 'mn', 
        name: 'Mongolian', 
        nativeName: 'Монгол', 
        slug: 'mongolian',
        available: true, // 新启用
        bidirectional: true,
        priority: 3,
        region: 'Central Asia',
        speakers: '5M',
      },
      { 
        code: 'ky', 
        name: 'Kyrgyz', 
        nativeName: 'Кыргызча', 
        slug: 'kyrgyz',
        available: true, // 新启用
        bidirectional: true,
        priority: 3,
        region: 'Central Asia',
        speakers: '4M',
      },
      { 
        code: 'tg', 
        name: 'Tajik', 
        nativeName: 'Тоҷикӣ', 
        slug: 'tajik',
        available: true, // 新启用
        bidirectional: true,
        priority: 3,
        region: 'Central Asia',
        speakers: '8M',
      },
      
      // 主要语言支持
      { 
        code: 'zh', 
        name: 'Chinese', 
        nativeName: '中文', 
        slug: 'chinese',
        available: true,
        bidirectional: true,
        priority: 1,
        region: 'East Asia',
        speakers: '1.1B',
      },
      { 
        code: 'ar', 
        name: 'Arabic', 
        nativeName: 'العربية', 
        slug: 'arabic',
        available: true,
        bidirectional: true,
        priority: 1,
        region: 'Middle East',
        speakers: '422M',
      },
      { 
        code: 'hi', 
        name: 'Hindi', 
        nativeName: 'हिन्दी', 
        slug: 'hindi',
        available: true,
        bidirectional: true,
        priority: 1,
        region: 'South Asia',
        speakers: '600M',
      },
      { 
        code: 'fr', 
        name: 'French', 
        nativeName: 'Français', 
        slug: 'french',
        available: true,
        bidirectional: true,
        priority: 1,
        region: 'Europe',
        speakers: '280M',
      },
      { 
        code: 'es', 
        name: 'Spanish', 
        nativeName: 'Español', 
        slug: 'spanish',
        available: true,
        bidirectional: true,
        priority: 1,
        region: 'Europe/Americas',
        speakers: '500M',
      },
      { 
        code: 'pt', 
        name: 'Portuguese', 
        nativeName: 'Português', 
        slug: 'portuguese',
        available: true,
        bidirectional: true,
        priority: 1,
        region: 'Europe/Americas',
        speakers: '260M',
      },
      
      // 即将支持的语言
      { 
        code: 'ps', 
        name: 'Pashto', 
        nativeName: 'پښتو', 
        slug: 'pashto',
        available: true, // 即将支持
        bidirectional: false,
        priority: 4,
        region: 'South Asia',
        speakers: '60M',
      },
      { 
        code: 'sd', 
        name: 'Sindhi', 
        nativeName: 'سنڌي', 
        slug: 'sindhi',
        available: true,
        bidirectional: false,
        priority: 4,
        region: 'South Asia',
        speakers: '25M',
      },
    ],
    // 目标语言（主要是英文）
    target: { code: 'en', name: 'English', nativeName: 'English', slug: 'english' },
  },

  // 翻译配置
  translation: {
    freeCharacterLimit: 5000, // 免费翻译字符限制 (从1000提升到5000)
    maxTextInputLimit: 10000, // 文本输入上限 (提升以支持更长文本)
    queueThreshold: 5000, // 队列模式阈值 - 与免费字符限制保持一致
    creditRatePerCharacter: 0.1, // 超出免费额度后每字符积分数
    registrationBonus: 500, // 注册奖励积分
    // 队列处理配置
    queue: {
      enabled: true, // 启用队列模式
      maxConcurrentTasks: 3, // 最大并发任务数
      taskTimeout: 300000, // 任务超时时间 (5分钟)
      retryAttempts: 2, // 重试次数
      retryDelay: 5000, // 重试延迟 (5秒)
    },
  },

  // NLLB模型配置
  nllb: {
    model: process.env.NLLB_MODEL || 'facebook/nllb-200-distilled-600M',
    apiUrl: process.env.HUGGINGFACE_API_URL || 'https://api-inference.huggingface.co/models',
    maxLength: parseInt(process.env.NLLB_MAX_LENGTH || '5000'),
    temperature: parseFloat(process.env.NLLB_TEMPERATURE || '0.3'),
    timeout: parseInt(process.env.NLLB_TIMEOUT || '30000'),
    // 本地服务配置
    localService: {
      enabled: process.env.NODE_ENV === 'development' && process.env.NLLB_LOCAL_ENABLED === 'true',
      url: process.env.NLLB_LOCAL_URL || 'http://localhost:8081',
      fallbackToHuggingFace: process.env.NLLB_LOCAL_FALLBACK !== 'false', // 默认启用fallback
      timeout: parseInt(process.env.NLLB_LOCAL_TIMEOUT || '30000'),
    },
  },

  // 文件处理配置
  files: {
    maxSize: parseInt(process.env.FILE_MAX_SIZE || '10485760'), // 10MB
    maxPages: parseInt(process.env.FILE_MAX_PAGES || '100'),
    supportedFormats: ['txt'], // Currently only TXT supported, others coming soon
    uploadPath: process.env.FILE_UPLOAD_PATH || '/tmp/uploads',
  },

  // TTS配置
  tts: {
    provider: process.env.TTS_PROVIDER || 'edge-speech',
    voice: process.env.TTS_VOICE || 'en-US-AriaNeural',
    rate: process.env.TTS_RATE || '1.0',
    pitch: process.env.TTS_PITCH || '1.0',
  },

  // 缓存配置
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '3600'), // 1小时
    maxSize: parseInt(process.env.CACHE_MAX_SIZE || '1000'),
  },

  // 限流配置
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15分钟
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'), // 100次请求
    message: 'Too many requests, please try again later.',
  },

  // 微服务配置
  services: {
    fileProcessor: {
      url: process.env.FILE_SERVICE_URL || 'http://localhost:8000',
      secret: process.env.FILE_SERVICE_SECRET || 'dev-secret-key',
      timeout: parseInt(process.env.FILE_SERVICE_TIMEOUT || '60000'),
    },
  },

  // 数据库配置
  database: {
    mongodb: {
      uri: process.env.MONGODB_URI || '',
      dbName: process.env.MONGODB_DB_NAME || 'loretrans',
    },
    redis: {
      url: process.env.KV_REST_API_URL || '',
      token: process.env.KV_REST_API_TOKEN || '',
    },
  },

  // 邮件服务配置
  email: {
    provider: process.env.EMAIL_PROVIDER || 'resend',
    apiKey: process.env.RESEND_API_KEY || '',
    from: process.env.EMAIL_FROM || 'noreply@loretrans.com',
  },

  // Creem支付配置 - 简化为单一API密钥模式
  creem: {
    // 单一API密钥，仅在后端使用
    apiKey: process.env.CREEM_API_KEY || '',
    // Webhook验证密钥
    webhookSecret: process.env.CREEM_WEBHOOK_SECRET || '',
    // 测试模式标识
    testMode: process.env.NODE_ENV === 'development',
  },

  // SEO配置
  seo: {
    defaultTitle: 'Loretrans - Translate Low-Resource Languages to English',
    defaultDescription: 'Free AI-powered translation tool for 20+ low-resource languages. Translate Creole, Lao, Swahili, Burmese and more to English instantly.',
    defaultKeywords: 'translation, AI, low-resource languages, English, NLLB, creole translator',
    twitterHandle: '@LoretransApp',
    ogImage: '/images/og-image.png',
  },

  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
} as const;

// 环境相关配置
export const ENV_CONFIG = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
};

// API端点配置
export const API_ENDPOINTS = {
  translate: '/api/translate',
  detect: '/api/detect',
  tts: '/api/tts',
  fileUpload: '/api/files/upload',
  fileStatus: '/api/files/status',
  fileDownload: '/api/files/download',
} as const;

// 类型定义
export type Language = {
  code: string;
  name: string;
  nativeName: string;
  slug: string;
  available: boolean;
  bidirectional: boolean;
  priority?: number;
  region?: string;
  speakers?: string;
};

// 语言到英文页面映射
export const LANG_TO_ENGLISH_PAGES = {
  // 第一批 - 核心小语种
  'creole': '/creole-to-english',
  'lao': '/lao-to-english', 
  'swahili': '/swahili-to-english',
  'burmese': '/burmese-to-english',
  'telugu': '/telugu-to-english',
  
  // 第二批 - 新增小语种
  'sinhala': '/sinhala-to-english',
  'amharic': '/amharic-to-english',
  'khmer': '/khmer-to-english',
  'nepali': '/nepali-to-english',
  'malagasy': '/malagasy-to-english',
  
  // 第三批 - 非洲语言
  'yoruba': '/yoruba-to-english',
  'igbo': '/igbo-to-english',
  'hausa': '/hausa-to-english',
  'zulu': '/zulu-to-english',
  'xhosa': '/xhosa-to-english',
  
  // 第四批 - 中亚语言
  'mongolian': '/mongolian-to-english',
  'kyrgyz': '/kyrgyz-to-english',
  'tajik': '/tajik-to-english',
  
  // 主要语言
  'chinese': '/chinese-to-english',
  'arabic': '/arabic-to-english',
  'hindi': '/hindi-to-english',
  
  // 即将支持
  'pashto': '/pashto-to-english',
  'sindhi': '/sindhi-to-english',
} as const;

// Export available languages for UI components
export const AVAILABLE_LANGUAGES: Language[] = APP_CONFIG.languages.supported.filter(lang => lang.available);

// 按地区分组的语言
export const LANGUAGES_BY_REGION = {
  'Southeast Asia': APP_CONFIG.languages.supported.filter(lang => lang.region === 'Southeast Asia'),
  'South Asia': APP_CONFIG.languages.supported.filter(lang => lang.region === 'South Asia'),
  'East Africa': APP_CONFIG.languages.supported.filter(lang => lang.region === 'East Africa'),
  'West Africa': APP_CONFIG.languages.supported.filter(lang => lang.region === 'West Africa'),
  'Southern Africa': APP_CONFIG.languages.supported.filter(lang => lang.region === 'Southern Africa'),
  'Central Asia': APP_CONFIG.languages.supported.filter(lang => lang.region === 'Central Asia'),
  'Caribbean': APP_CONFIG.languages.supported.filter(lang => lang.region === 'Caribbean'),
  'East Asia': APP_CONFIG.languages.supported.filter(lang => lang.region === 'East Asia'),
  'Middle East': APP_CONFIG.languages.supported.filter(lang => lang.region === 'Middle East'),
} as const; 