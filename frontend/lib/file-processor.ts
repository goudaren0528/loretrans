// PDF.js类型定义
interface PDFTextItem {
  str: string;
  dir?: string;
  width?: number;
  height?: number;
  transform?: number[];
  fontName?: string;
}

interface PDFTextContent {
  items: PDFTextItem[];
}

interface PDFPageProxy {
  getTextContent(): Promise<PDFTextContent>;
}

interface PDFDocumentProxy {
  numPages: number;
  getPage(pageNumber: number): Promise<PDFPageProxy>;
}

// 动态导入pdfjs-dist以避免类型错误
let pdfjsLib: {
  getDocument: (options: { data: ArrayBuffer }) => { promise: Promise<PDFDocumentProxy> };
  GlobalWorkerOptions?: { workerSrc: string };
} | null = null;

// 配置PDF.js worker
if (typeof window === 'undefined') {
  // 服务器端配置
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    pdfjsLib = require('pdfjs-dist');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const path = require('path');
    
    // 确保pdfjsLib不为null后再设置worker路径
    if (pdfjsLib && pdfjsLib.GlobalWorkerOptions) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = path.join(process.cwd(), 'node_modules/pdfjs-dist/build/pdf.worker.js');
    }
  } catch (error) {
    console.warn('Failed to load pdfjs-dist:', error);
  }
}

// 支持的文件类型
export const SUPPORTED_FILE_TYPES = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/vnd.ms-powerpoint': 'ppt',
  'text/plain': 'txt',
  'text/html': 'html',
  'application/rtf': 'rtf'
};

// 文件大小限制 (字节)
export const FILE_SIZE_LIMITS = {
  guest: 0, // 未登录用户不支持文档翻译
  free_user: 5 * 1024 * 1024, // 5MB
  pro_user: 50 * 1024 * 1024, // 50MB
  admin: 100 * 1024 * 1024, // 100MB
};

// 文件处理结果接口
export interface FileProcessResult {
  success: boolean;
  text?: string;
  characterCount?: number;
  pageCount?: number;
  error?: string;
  metadata?: {
    fileName: string;
    fileSize: number;
    fileType: string;
    processingTime: number;
  };
}

// PDF文本提取
export async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
  try {
    if (!pdfjsLib) {
      throw new Error('PDF.js library not loaded');
    }

    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    const numPages = pdf.numPages;
    let fullText = '';

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: PDFTextItem) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    return fullText.trim();
  } catch (error) {
    console.error('PDF text extraction error:', error);
    throw new Error('PDF文本提取失败');
  }
}

// 纯文本文件处理
export async function extractTextFromPlainText(buffer: ArrayBuffer): Promise<string> {
  try {
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(buffer);
  } catch (error) {
    console.error('Plain text extraction error:', error);
    throw new Error('文本文件读取失败');
  }
}

// Word文档处理 (简化版本)
export async function extractTextFromWord(buffer: ArrayBuffer): Promise<string> {
  try {
    // 这里使用简化的Word文档处理
    // 在生产环境中，建议使用专门的库如 mammoth.js
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(buffer);
    
    // 简单的文本清理
    return text
      .replace(/<[^>]*>/g, '') // 移除HTML标签
      .replace(/\s+/g, ' ') // 合并多个空格
      .trim();
  } catch (error) {
    console.error('Word document extraction error:', error);
    throw new Error('Word文档处理失败，请尝试将文档另存为PDF格式');
  }
}

// PowerPoint文档处理 (简化版本)
export async function extractTextFromPowerPoint(buffer: ArrayBuffer): Promise<string> {
  try {
    // 简化的PowerPoint处理
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(buffer);
    
    return text
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  } catch (error) {
    console.error('PowerPoint extraction error:', error);
    throw new Error('PowerPoint文档处理失败，请尝试将文档另存为PDF格式');
  }
}

// 主文件处理函数
export async function processFile(file: File): Promise<FileProcessResult> {
  const startTime = Date.now();
  
  try {
    // 验证文件类型
    if (!SUPPORTED_FILE_TYPES[file.type as keyof typeof SUPPORTED_FILE_TYPES]) {
      return {
        success: false,
        error: `不支持的文件格式: ${file.type}。支持的格式: PDF, Word, PowerPoint, 纯文本`
      };
    }

    // 读取文件内容
    const buffer = await file.arrayBuffer();
    let extractedText = '';

    // 根据文件类型处理
    switch (file.type) {
      case 'application/pdf':
        extractedText = await extractTextFromPDF(buffer);
        break;
      
      case 'text/plain':
      case 'text/html':
        extractedText = await extractTextFromPlainText(buffer);
        break;
      
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      case 'application/msword':
        extractedText = await extractTextFromWord(buffer);
        break;
      
      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      case 'application/vnd.ms-powerpoint':
        extractedText = await extractTextFromPowerPoint(buffer);
        break;
      
      default:
        return {
          success: false,
          error: '不支持的文件格式'
        };
    }

    // 验证提取的文本
    if (!extractedText || extractedText.trim().length === 0) {
      return {
        success: false,
        error: '无法从文档中提取文本内容，请确保文档包含可读取的文本'
      };
    }

    const processingTime = Date.now() - startTime;
    const characterCount = extractedText.length;

    return {
      success: true,
      text: extractedText,
      characterCount,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        fileType: SUPPORTED_FILE_TYPES[file.type as keyof typeof SUPPORTED_FILE_TYPES],
        processingTime
      }
    };

  } catch (error) {
    console.error('File processing error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '文件处理失败'
    };
  }
}

// 验证文件
export function validateFile(file: File, userRole: string = 'free_user'): { valid: boolean; error?: string } {
  // 检查文件类型
  if (!SUPPORTED_FILE_TYPES[file.type as keyof typeof SUPPORTED_FILE_TYPES]) {
    return {
      valid: false,
      error: `不支持的文件格式。支持的格式: ${Object.keys(SUPPORTED_FILE_TYPES).join(', ')}`
    };
  }

  // 检查文件大小
  const sizeLimit = FILE_SIZE_LIMITS[userRole as keyof typeof FILE_SIZE_LIMITS] || FILE_SIZE_LIMITS.free_user;
  if (file.size > sizeLimit) {
    const limitMB = Math.round(sizeLimit / (1024 * 1024));
    return {
      valid: false,
      error: `文件大小超出限制。${userRole === 'free_user' ? '免费用户' : '付费用户'}最大支持 ${limitMB}MB`
    };
  }

  // 检查文件名
  if (file.name.length > 255) {
    return {
      valid: false,
      error: '文件名过长，请重命名后重试'
    };
  }

  return { valid: true };
}

// 获取文件信息
export function getFileInfo(file: File) {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    sizeFormatted: formatFileSize(file.size),
    typeFormatted: SUPPORTED_FILE_TYPES[file.type as keyof typeof SUPPORTED_FILE_TYPES] || 'unknown'
  };
}

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
