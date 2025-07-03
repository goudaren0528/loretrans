// Application Configuration
export const APP_CONFIG = {
  // Application Info
  name: 'Transly',
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
  
  // Supported Languages
  languages: {
    supported: [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'zh', name: 'Chinese', nativeName: '中文' },
      { code: 'es', name: 'Spanish', nativeName: 'Español' },
      { code: 'fr', name: 'French', nativeName: 'Français' },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
      { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
      { code: 'ht', name: 'Haitian Creole', nativeName: 'Kreyòl Ayisyen' },
      { code: 'lo', name: 'Lao', nativeName: 'ລາວ' },
      { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
      { code: 'my', name: 'Burmese', nativeName: 'မြန်မာ' },
      { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
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
