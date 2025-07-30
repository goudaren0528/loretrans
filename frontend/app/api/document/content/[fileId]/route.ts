import { NextRequest, NextResponse } from 'next/server'

/**
 * 获取完整文档内容API
 * 通过fileId从缓存中获取完整的文档文本内容
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const { fileId } = params
    
    console.log(`[Document Content API] 请求获取文档内容: ${fileId}`)
    
    if (!fileId) {
      return NextResponse.json({
        error: '缺少文档ID',
        code: 'MISSING_FILE_ID'
      }, { status: 400 })
    }
    
    // 从全局缓存获取文档数据
    const documentCache = (global as any).documentCache || new Map()
    const documentData = documentCache.get(fileId)
    
    if (!documentData) {
      console.log(`[Document Content API] 文档不存在: ${fileId}`)
      return NextResponse.json({
        error: '文档不存在或已过期',
        code: 'DOCUMENT_NOT_FOUND',
        details: {
          fileId,
          cacheSize: documentCache.size,
          availableFiles: Array.from(documentCache.keys()).slice(0, 5) // 显示前5个可用文件ID
        }
      }, { status: 404 })
    }
    
    // 检查文档是否过期
    if (documentData.expiresAt && new Date() > new Date(documentData.expiresAt)) {
      console.log(`[Document Content API] 文档已过期: ${fileId}`)
      // 清理过期文档
      documentCache.delete(fileId)
      
      return NextResponse.json({
        error: '文档已过期',
        code: 'DOCUMENT_EXPIRED',
        details: {
          fileId,
          expiresAt: documentData.expiresAt,
          currentTime: new Date().toISOString()
        }
      }, { status: 410 })
    }
    
    // 简单的权限检查 - 可以根据需要扩展
    // TODO: 添加用户权限验证
    
    console.log(`[Document Content API] 成功获取文档内容: ${fileId}, 长度: ${documentData.text?.length || 0}`)
    
    return NextResponse.json({
      success: true,
      fileId,
      text: documentData.text,
      characterCount: documentData.characterCount,
      metadata: {
        originalFileName: documentData.metadata?.originalFileName,
        fileType: documentData.metadata?.fileType,
        uploadTime: documentData.metadata?.uploadTime,
        processingTime: documentData.metadata?.processingTime
      },
      cacheInfo: {
        createdAt: documentData.createdAt,
        expiresAt: documentData.expiresAt,
        userId: documentData.userId
      }
    })
    
  } catch (error) {
    console.error('[Document Content API] 获取文档内容失败:', error)
    
    return NextResponse.json({
      error: '获取文档内容失败',
      code: 'INTERNAL_ERROR',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

/**
 * 清理过期的缓存文档
 */
function cleanupExpiredDocuments() {
  try {
    const documentCache = (global as any).documentCache || new Map()
    const now = new Date()
    let cleanedCount = 0
    
    for (const [fileId, documentData] of documentCache.entries()) {
      if (documentData.expiresAt && now > new Date(documentData.expiresAt)) {
        documentCache.delete(fileId)
        cleanedCount++
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`[Document Content API] 清理了 ${cleanedCount} 个过期文档`)
    }
  } catch (error) {
    console.error('[Document Content API] 清理过期文档失败:', error)
  }
}

// 定期清理过期文档
setInterval(cleanupExpiredDocuments, 5 * 60 * 1000) // 每5分钟清理一次
