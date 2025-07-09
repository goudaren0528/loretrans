// 增强版文件处理器 - 使用更好的库支持
import { NextRequest } from 'next/server';

// 支持的文件类型 (移除解析质量差的格式)
export const SUPPORTED_FILE_TYPES = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'text/plain': 'txt',
  'text/html': 'html'
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

// PDF文本提取 (简化版本，不依赖外部库)
export async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
  try {
    // 简化的PDF文本提取
    // 在生产环境中，建议使用 pdf-parse 或 pdfjs-dist
    const uint8Array = new Uint8Array(buffer);
    const text = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array);
    
    // 简单的PDF文本提取 - 查找文本对象
    const textMatches = text.match(/\(([^)]+)\)/g);
    if (textMatches) {
      return textMatches
        .map(match => match.slice(1, -1))
        .filter(text => text.length > 1)
        .join(' ')
        .replace(/\\[rn]/g, '\n')
        .trim();
    }
    
    // 如果没有找到文本，尝试其他方法
    const streamMatches = text.match(/stream\s*(.*?)\s*endstream/gs);
    if (streamMatches) {
      return streamMatches
        .map(match => match.replace(/^stream\s*|\s*endstream$/g, ''))
        .join(' ')
        .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
    
    throw new Error('无法从PDF中提取文本');
  } catch (error) {
    console.error('PDF text extraction error:', error);
    throw new Error('PDF文本提取失败，请确保PDF包含可选择的文本内容');
  }
}

// 纯文本文件处理
export async function extractTextFromPlainText(buffer: ArrayBuffer): Promise<string> {
  try {
    // 尝试不同的编码
    const encodings = ['utf-8', 'utf-16', 'iso-8859-1', 'windows-1252'];
    
    for (const encoding of encodings) {
      try {
        const decoder = new TextDecoder(encoding, { fatal: true });
        const text = decoder.decode(buffer);
        if (text && text.trim().length > 0) {
          return text.trim();
        }
      } catch (e) {
        // 尝试下一个编码
        continue;
      }
    }
    
    // 如果所有编码都失败，使用默认编码
    const decoder = new TextDecoder('utf-8', { fatal: false });
    return decoder.decode(buffer).trim();
  } catch (error) {
    console.error('Plain text extraction error:', error);
    throw new Error('文本文件读取失败');
  }
}

// Word文档处理 (简化版本)
export async function extractTextFromWord(buffer: ArrayBuffer): Promise<string> {
  try {
    // 简化的Word文档处理
    // 对于.docx文件，它实际上是一个ZIP文件
    const uint8Array = new Uint8Array(buffer);
    const text = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array);
    
    // 尝试提取XML中的文本内容
    const xmlMatches = text.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
    if (xmlMatches) {
      return xmlMatches
        .map(match => match.replace(/<[^>]+>/g, ''))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
    
    // 如果是老版本的.doc文件，尝试其他方法
    const cleanText = text
      .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ') // 移除控制字符
      .replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, ' ') // 保留可打印字符和Unicode
      .replace(/\s+/g, ' ')
      .trim();
    
    if (cleanText.length > 50) { // 如果提取的文本足够长
      return cleanText;
    }
    
    throw new Error('无法从Word文档中提取文本');
  } catch (error) {
    console.error('Word document extraction error:', error);
    throw new Error('Word文档处理失败，请尝试将文档另存为PDF或纯文本格式');
  }
}

// PowerPoint文档处理 (简化版本)
export async function extractTextFromPowerPoint(buffer: ArrayBuffer): Promise<string> {
  try {
    const uint8Array = new Uint8Array(buffer);
    const text = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array);
    
    // 尝试提取PowerPoint中的文本
    const textMatches = text.match(/<a:t[^>]*>([^<]+)<\/a:t>/g);
    if (textMatches) {
      return textMatches
        .map(match => match.replace(/<[^>]+>/g, ''))
        .join('\n')
        .replace(/\s+/g, ' ')
        .trim();
    }
    
    // 备用方法
    const cleanText = text
      .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ')
      .replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (cleanText.length > 50) {
      return cleanText;
    }
    
    throw new Error('无法从PowerPoint中提取文本');
  } catch (error) {
    console.error('PowerPoint extraction error:', error);
    throw new Error('PowerPoint文档处理失败，请尝试将文档另存为PDF或纯文本格式');
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
        error: `不支持的文件格式: ${file.type}。支持的格式: 文本文件 (.txt), HTML (.html), PDF (.pdf), Word (.docx), PowerPoint (.pptx)`
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
        extractedText = await extractTextFromWord(buffer);
        break;
      
      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
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
        error: '无法从文档中提取文本内容。请确保文档包含可读取的文本，或尝试将文档另存为PDF格式。'
      };
    }

    // 清理和优化文本
    extractedText = cleanExtractedText(extractedText);

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

// 清理提取的文本
function cleanExtractedText(text: string): string {
  return text
    .replace(/\r\n/g, '\n') // 统一换行符
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n') // 合并多个换行符
    .replace(/[ \t]+/g, ' ') // 合并多个空格
    .replace(/^\s+|\s+$/gm, '') // 移除行首行尾空格
    .trim();
}

// 验证文件
export function validateFile(file: File, userRole: string = 'free_user'): { valid: boolean; error?: string } {
  // 检查文件类型
  if (!SUPPORTED_FILE_TYPES[file.type as keyof typeof SUPPORTED_FILE_TYPES]) {
    return {
      valid: false,
      error: `不支持的文件格式。支持的格式: 文本文件 (.txt), HTML (.html), PDF (.pdf), Word (.docx), PowerPoint (.pptx)`
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

  // 检查文件是否为空
  if (file.size === 0) {
    return {
      valid: false,
      error: '文件为空，请选择有内容的文件'
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
