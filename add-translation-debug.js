#!/usr/bin/env node

const fs = require('fs-extra')
const path = require('path')

async function addTranslationDebug() {
  const routePath = path.join(__dirname, 'frontend/app/api/document/translate/route.ts')
  
  try {
    console.log('🔧 正在为翻译API添加调试信息...')
    
    // 读取现有文件
    let content = await fs.readFile(routePath, 'utf8')
    
    // 检查是否已经有调试信息
    if (content.includes('[Translation Debug]')) {
      console.log('✅ 调试信息已存在')
      return
    }
    
    // 在获取文档数据的部分添加调试信息
    content = content.replace(
      '// 获取文档数据\n    const documentResponse = await fetch(`http://localhost:3010/api/documents/${fileId}`)',
      `// 获取文档数据
    console.log('[Translation Debug] 开始获取文档:', {
      fileId,
      sourceLanguage,
      targetLanguage,
      timestamp: new Date().toISOString()
    })
    
    const documentResponse = await fetch(\`http://localhost:3010/api/documents/\${fileId}\`)
    
    console.log('[Translation Debug] 文档响应状态:', {
      status: documentResponse.status,
      statusText: documentResponse.statusText,
      ok: documentResponse.ok
    })`
    )
    
    // 在错误处理部分添加调试信息
    content = content.replace(
      'if (!documentResponse.ok) {',
      `if (!documentResponse.ok) {
      const errorText = await documentResponse.text()
      console.log('[Translation Debug] 文档获取失败:', {
        status: documentResponse.status,
        statusText: documentResponse.statusText,
        errorText: errorText.substring(0, 200)
      })`
    )
    
    // 在成功获取文档后添加调试信息
    content = content.replace(
      'const documentData = await documentResponse.json()',
      `const documentData = await documentResponse.json()
    
    console.log('[Translation Debug] 文档数据获取成功:', {
      hasData: !!documentData,
      success: documentData?.success,
      contentLength: documentData?.data?.content?.length || 0,
      fileName: documentData?.data?.fileName
    })`
    )
    
    // 写入文件
    await fs.writeFile(routePath, content, 'utf8')
    
    console.log('✅ 翻译API调试信息已添加')
    
    return true
    
  } catch (error) {
    console.error('❌ 添加调试信息失败:', error.message)
    throw error
  }
}

// 运行修复
addTranslationDebug()
  .then(() => {
    console.log('🎉 调试信息添加完成！')
  })
  .catch(error => {
    console.error('💥 添加失败:', error.message)
    process.exit(1)
  })
