/**
 * 通用数据库类型
 */
export type bytea = string;

/**
 * 用户角色枚举
 */
export type UserRole = 'admin' | 'pro_user' | 'free_user' | 'guest';

/**
 * 用户核心数据模型
 */
// 语言相关类型
export interface Language {
  code: string;
  name: string;
  nativeName: string;
  slug: string;
  available?: boolean;
  bidirectional?: boolean;
}

export interface LanguagePair {
  source: Language;
  target: Language;
}

// 翻译相关类型
export interface TranslationRequest {
  text: string;
  sourceLanguage?: string; // 可选，支持自动检测
  targetLanguage: string;
  options?: TranslationOptions;
}

export interface TranslationOptions {
  temperature?: number;
  maxLength?: number;
  preserveFormatting?: boolean;
}

export interface TranslationResponse {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence?: number;
  processingTime?: number;
}

export interface LanguageDetectionRequest {
  text: string;
}

export interface LanguageDetectionResponse {
  language: string;
  confidence: number;
  alternatives?: Array<{
    language: string;
    confidence: number;
  }>;
}

// 文件相关类型
export interface FileUploadRequest {
  file: File;
  targetLanguage: string;
  sourceLanguage?: string;
  email?: string;
  options?: FileProcessingOptions;
}

export interface FileProcessingOptions {
  preserveFormatting?: boolean;
  extractImages?: boolean;
  pageRange?: {
    start: number;
    end: number;
  };
}

export interface FileUploadResponse {
  jobId: string;
  status: FileProcessingStatus;
  estimatedTime?: number;
  message?: string;
}

export interface FileStatusResponse {
  jobId: string;
  status: FileProcessingStatus;
  progress: number;
  result?: FileProcessingResult;
  error?: string;
}

export interface FileProcessingResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  pageCount: number;
  downloadUrl?: string;
  expiresAt?: string;
}

export enum FileProcessingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  EXPIRED = 'expired',
}

export type SupportedFileFormat = 'pdf' | 'docx' | 'doc' | 'pptx' | 'ppt' | 'txt';

// TTS相关类型
export interface TTSRequest {
  text: string;
  language: string;
  voice?: string;
  speed?: number;
  pitch?: number;
}

export interface TTSResponse {
  audioUrl: string;
  audioFormat: string;
  duration?: number;
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// 用户相关类型（基于Supabase数据模型）
export interface User {
  id: string;
  email: string;
  email_verified: boolean;
  credits: number;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  name: string | null;
  avatar_url: string | null;
  language: string | null;
  timezone: string | null;
  notification_preferences: NotificationPreferences;
  metadata: Record<string, any> | null;
  encrypted_metadata?: bytea | null;
  sensitive_metadata?: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  translation_complete?: boolean;
  credit_low?: boolean;
  promotional?: boolean;
}

// 积分交易类型
export type TransactionType = 'purchase' | 'consume' | 'reward' | 'refund';

export interface CreditTransaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  balance: number;
  description: string;
  metadata: Record<string, any> | null;
  created_at: string;
}

// 支付状态类型
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';

export interface Payment {
  id: string;
  user_id: string;
  creem_payment_id: string;
  creem_session_id: string | null;
  amount: number;
  credits: number;
  status: PaymentStatus;
  payment_method: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  completed_at: string | null;
}

// 用户统计数据（基于数据库视图）
export interface UserStats {
  id: string;
  email: string;
  credits: number;
  created_at: string;
  name: string | null;
  language: string;
  total_consumed: number;
  total_purchased: number;
  total_payments: number;
  total_spent: number;
}

// 用户计划（保留兼容性）
export enum UserPlan {
  FREE = 'free',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

export interface UserUsage {
  textTranslations: number;
  fileTranslations: number;
  charactersTranslated: number;
  lastResetDate: string;
}

// 用户数据操作相关类型
export interface CreateUserData {
  email: string;
  name?: string;
  language?: string;
  timezone?: string;
}

export interface UpdateUserProfileData extends Partial<Omit<UserProfile, 'user_id' | 'created_at' | 'updated_at' | 'encrypted_metadata'>> {}

export interface CreditConsumptionRequest {
  amount: number;
  description: string;
  metadata?: Record<string, any>;
}

export interface CreditPurchaseRequest {
  amount: number;
  payment_id: string;
  description?: string;
}

// 积分计费相关
export interface CreditCalculation {
  total_characters: number;
  free_characters: number;
  billable_characters: number;
  credits_required: number;
  cost_breakdown: {
    free_allowance: number;
    chargeable_portion: number;
    rate_per_character: number;
  };
}

// SEO相关类型
export interface PageSEO {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  canonical?: string;
  hreflang?: Array<{
    lang: string;
    href: string;
  }>;
}

export interface LanguagePageProps {
  sourceLanguage: Language;
  targetLanguage: Language;
  seo: PageSEO;
}

// 配置相关类型
export interface AppConfig {
  app: {
    name: string;
    description: string;
    version: string;
    url: string;
  };
  languages: {
    supported: Language[];
    target: Language;
  };
  nllb: {
    model: string;
    apiUrl: string;
    maxLength: number;
    temperature: number;
    timeout: number;
  };
  files: {
    maxSize: number;
    maxPages: number;
    supportedFormats: SupportedFileFormat[];
    uploadPath: string;
  };
}

// 统计相关类型
export interface UsageStats {
  translations: number;
  files: number;
  characters: number;
  period: 'day' | 'week' | 'month' | 'year';
}

// 缓存相关类型
export interface CacheEntry<T = any> {
  key: string;
  value: T;
  expiresAt: number;
  createdAt: number;
}

// 微服务通信类型
export interface ServiceRequest<T = any> {
  method: string;
  data: T;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// 事件类型
export interface TranslationEvent {
  type: 'translation_started' | 'translation_completed' | 'translation_failed';
  data: {
    requestId: string;
    sourceLanguage: string;
    targetLanguage: string;
    textLength: number;
    processingTime?: number;
    error?: string;
  };
}

export interface FileProcessingEvent {
  type: 'file_uploaded' | 'file_processing' | 'file_completed' | 'file_failed';
  data: {
    jobId: string;
    fileName: string;
    fileSize: number;
    status: FileProcessingStatus;
    progress?: number;
    error?: string;
  };
}

// 工具类型
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Creem Payment Integration Types (Placeholders)
export namespace Creem {
  export interface Price {
    id: string;
    object: 'price';
    amount: number;
    currency: string;
    product: string;
  }

  export interface CheckoutSession {
    id: string;
    object: 'checkout.session';
    url: string;
    metadata?: {
      [key: string]: string | number | null;
    };
    // other properties
  }
}

// Pricing and Plans
export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  credits: number;
  priceUSD: number;
  creemPriceId: string; // 实际上是 Creem 产品ID，需要在 Creem 控制台创建
  creemPaymentUrl?: string; // Creem 为此商品生成的直接支付URL
  originalValue?: number; // 原价，用于计算折扣
  discount?: number; // 折扣百分比
  popular?: boolean; // 是否为推荐套餐
}