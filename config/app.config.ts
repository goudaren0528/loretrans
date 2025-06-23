export const APP_CONFIG = {
  // 应用基本信息
  app: {
    name: 'Transly',
    description: 'Translate Low-Resource Languages to English',
    version: '1.0.0',
    author: 'Transly Team',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://transly.app',
  },

  // 支持的语言配置
  languages: {
    // 小语种到英文的主要支持语言
    supported: [
      { 
        code: 'ht', 
        name: 'Haitian Creole', 
        nativeName: 'Kreyòl Ayisyen', 
        slug: 'creole',
        available: true, // 完全可用
        bidirectional: true, // 支持双向翻译
      },
      { 
        code: 'lo', 
        name: 'Lao', 
        nativeName: 'ລາວ', 
        slug: 'lao',
        available: true,
        bidirectional: true,
      },
      { 
        code: 'sw', 
        name: 'Swahili', 
        nativeName: 'Kiswahili', 
        slug: 'swahili',
        available: true,
        bidirectional: true,
      },
      { 
        code: 'my', 
        name: 'Burmese', 
        nativeName: 'မြန်မာ', 
        slug: 'burmese',
        available: true,
        bidirectional: true,
      },
      { 
        code: 'te', 
        name: 'Telugu', 
        nativeName: 'తెలుగు', 
        slug: 'telugu',
        available: true,
        bidirectional: true,
      },
      { 
        code: 'si', 
        name: 'Sinhala', 
        nativeName: 'සිංහල', 
        slug: 'sinhala',
        available: false, // 即将支持
        bidirectional: false,
      },
      { 
        code: 'am', 
        name: 'Amharic', 
        nativeName: 'አማርኛ', 
        slug: 'amharic',
        available: false,
        bidirectional: false,
      },
      { 
        code: 'km', 
        name: 'Khmer', 
        nativeName: 'ខ្មែរ', 
        slug: 'khmer',
        available: false,
        bidirectional: false,
      },
      { 
        code: 'ne', 
        name: 'Nepali', 
        nativeName: 'नेपाली', 
        slug: 'nepali',
        available: false,
        bidirectional: false,
      },
      { 
        code: 'mg', 
        name: 'Malagasy', 
        nativeName: 'Malagasy', 
        slug: 'malagasy',
        available: false,
        bidirectional: false,
      },
    ],
    // 目标语言（主要是英文）
    target: { code: 'en', name: 'English', nativeName: 'English', slug: 'english' },
  },

  // NLLB模型配置
  nllb: {
    model: process.env.NLLB_MODEL || 'facebook/nllb-200-distilled-600M',
    apiUrl: process.env.HUGGINGFACE_API_URL || 'https://api-inference.huggingface.co/models',
    maxLength: parseInt(process.env.NLLB_MAX_LENGTH || '1000'),
    temperature: parseFloat(process.env.NLLB_TEMPERATURE || '0.3'),
    timeout: parseInt(process.env.NLLB_TIMEOUT || '30000'),
    // 本地服务配置
    localService: {
      enabled: process.env.NLLB_LOCAL_ENABLED === 'true',
      url: process.env.NLLB_LOCAL_URL || 'http://localhost:8081',
      fallbackToHuggingFace: process.env.NLLB_LOCAL_FALLBACK === 'true',
      timeout: parseInt(process.env.NLLB_LOCAL_TIMEOUT || '30000'),
    },
  },

  // 文件处理配置
  files: {
    maxSize: parseInt(process.env.FILE_MAX_SIZE || '52428800'), // 50MB
    maxPages: parseInt(process.env.FILE_MAX_PAGES || '100'),
    supportedFormats: ['pdf', 'docx', 'doc', 'pptx', 'ppt', 'txt'],
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
      dbName: process.env.MONGODB_DB_NAME || 'transly',
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
    from: process.env.EMAIL_FROM || 'noreply@transly.app',
  },

  // 支付配置
  payment: {
    creem: {
      apiKey: process.env.CREEM_API_KEY || '',
      webhookSecret: process.env.CREEM_WEBHOOK_SECRET || '',
    },
  },

  // SEO配置
  seo: {
    defaultTitle: 'Transly - Translate Low-Resource Languages to English',
    defaultDescription: 'Free AI-powered translation tool for 20+ low-resource languages. Translate Creole, Lao, Swahili, Burmese and more to English instantly.',
    defaultKeywords: 'translation, AI, low-resource languages, English, NLLB, creole translator',
    twitterHandle: '@TranslyApp',
    ogImage: '/images/og-image.png',
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