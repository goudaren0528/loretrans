// Application Configuration
export const APP_CONFIG = {
  // Application Info
  name: 'Loretrans',
  version: '2.0.0',
  description: 'Professional small language translation platform',
  
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    timeout: 30000,
  },
  
  // Translation Service Configuration
  translation: {
    nllb: {
      serviceUrl: process.env.NLLB_SERVICE_URL || 'https://wane0528-my-nllb-api.hf.space/api/v4/translator',
      timeout: parseInt(process.env.NLLB_SERVICE_TIMEOUT || '60000'),
      enabled: process.env.NLLB_SERVICE_ENABLED === 'true',
    },
    credits: {
      freeCharacterLimit: 500,
      costPerCharacter: 0.1,
    },
  },
  
  // NLLB Configuration
  nllb: {
    maxLength: 10000,
    serviceUrl: process.env.NLLB_SERVICE_URL || 'https://wane0528-my-nllb-api.hf.space/api/v4/translator',
    timeout: parseInt(process.env.NLLB_SERVICE_TIMEOUT || '60000'),
    enabled: process.env.NLLB_SERVICE_ENABLED === 'true',
  },
  
  // Supported Languages
  languages: {
    target: { code: 'en', name: 'English', nativeName: 'English', slug: 'english', available: true },
    supported: [
      { code: 'en', name: 'English', nativeName: 'English', slug: 'english', available: true },
      { code: 'zh', name: 'Chinese', nativeName: '中文', slug: 'chinese', available: true },
      { code: 'es', name: 'Spanish', nativeName: 'Español', slug: 'spanish', available: true },
      { code: 'fr', name: 'French', nativeName: 'Français', slug: 'french', available: true },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية', slug: 'arabic', available: true },
      { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', slug: 'hindi', available: true },
      { code: 'pt', name: 'Portuguese', nativeName: 'Português', slug: 'portuguese', available: true },
      { code: 'ht', name: 'Haitian Creole', nativeName: 'Kreyòl Ayisyen', slug: 'creole', available: true },
      { code: 'lo', name: 'Lao', nativeName: 'ລາວ', slug: 'lao', available: true },
      { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', slug: 'swahili', available: true },
      { code: 'my', name: 'Burmese', nativeName: 'မြန်မာ', slug: 'burmese', available: true },
      { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', slug: 'telugu', available: true },
    ],
    defaultLocale: 'en',
  },
  
  // Feature Flags
  features: {
    enableBatchTranslation: true,
    enableDocumentTranslation: true,
    enableRealTimeTranslation: true,
    enableDarkMode: true,
    enableMobileApp: true,
    enableOfflineMode: false,
  },
  
  // Performance Configuration
  performance: {
    enableTranslationCache: true,
    cacheTTL: 3600, // 1 hour
    maxConcurrentRequests: 5,
  },
  
  // Rate Limiting
  rateLimits: {
    requestsPerMinute: 60,
    requestsPerHour: 1000,
  },
  
  // UI Configuration
  ui: {
    maxTextLength: 10000,
    autoSaveInterval: 30000, // 30 seconds
    animationDuration: 300,
  },
  
  // Analytics
  analytics: {
    enabled: process.env.NODE_ENV === 'production',
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID,
  },
  
  // Environment
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
}

export default APP_CONFIG
