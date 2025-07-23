import { NextRequest, NextResponse } from 'next/server'

/**
 * 文档缓存状态检查API
 * 用于诊断文档缓存问题
 */
export async function GET(request: NextRequest) {
  try {
    // 获取全局文档缓存
    const documentCache = (global as any).documentCache || new Map()
    
    // 收集缓存统计信息
    const cacheStats = {
      totalDocuments: documentCache.size,
      currentTime: new Date().toISOString(),
      documents: []
    }
    
    // 遍历缓存中的文档
    for (const [fileId, documentData] of documentCache.entries()) {
      const isExpired = documentData.expiresAt && new Date() > new Date(documentData.expiresAt)
      
      cacheStats.documents.push({
        fileId,
        userId: documentData.userId,
        characterCount: documentData.characterCount,
        fileName: documentData.metadata?.originalFileName,
        uploadTime: documentData.uploadTime,
        expiresAt: documentData.expiresAt,
        isExpired,
        timeUntilExpiry: documentData.expiresAt ? 
          Math.max(0, new Date(documentData.expiresAt).getTime() - Date.now()) : null
      })
    }
    
    // 按上传时间排序
    cacheStats.documents.sort((a, b) => 
      new Date(b.uploadTime || 0).getTime() - new Date(a.uploadTime || 0).getTime()
    )
    
    return NextResponse.json({
      success: true,
      cache: cacheStats,
      message: `找到 ${cacheStats.totalDocuments} 个缓存文档`
    })
    
  } catch (error) {
    console.error('[Cache Status] 获取缓存状态失败:', error)
    
    return NextResponse.json({
      success: false,
      error: '获取缓存状态失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

/**
 * 清理过期缓存API
 */
export async function DELETE(request: NextRequest) {
  try {
    const documentCache = (global as any).documentCache || new Map()
    const originalSize = documentCache.size
    let cleanedCount = 0
    
    // 清理过期文档
    for (const [fileId, documentData] of documentCache.entries()) {
      if (documentData.expiresAt && new Date() > new Date(documentData.expiresAt)) {
        documentCache.delete(fileId)
        cleanedCount++
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `清理完成`,
      stats: {
        originalSize,
        cleanedCount,
        remainingSize: documentCache.size
      }
    })
    
  } catch (error) {
    console.error('[Cache Cleanup] 清理缓存失败:', error)
    
    return NextResponse.json({
      success: false,
      error: '清理缓存失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}
