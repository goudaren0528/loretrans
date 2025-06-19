// 语言相关类型
export interface Language {
  code: string;
  name: string;
  nativeName: string;
  slug: string;
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

// 用户相关类型
export interface User {
  id: string;
  email?: string;
  plan: UserPlan;
  usage: UserUsage;
  createdAt: string;
  updatedAt: string;
}

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