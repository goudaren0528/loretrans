# 🔧 文档翻译内容截断问题修复方案

**问题确认**: 文档上传返回的`extractedText`只有500字符预览，导致翻译时内容被截断

---

## 🔍 问题根源

### 1. 文档上传API (upload/route.ts:159)
```typescript
extractedText: text!.substring(0, 500) + (text!.length > 500 ? '...' : ''), // 只返回前500字符预览
```

### 2. 前端翻译逻辑 (document-translator.tsx:415)
```typescript
const extractedText = uploadState.uploadResult.extractedText  // 截断的内容
// ...
body: JSON.stringify({
  originalContent: extractedText,  // 传递截断的内容到翻译API
  sourceLang: sourceLanguage,
  targetLang: targetLanguage,
  fileName: fileName
}),
```

### 3. 数据流程
```
完整文档(10,420字符) → 服务器缓存 → 前端预览(500字符) → 翻译API(503字符)
```

---

## 🛠️ 修复方案

### 方案1: 修改前端逻辑使用fileId获取完整内容 (推荐)

#### 1.1 创建获取完整文档内容的API
```typescript
// /app/api/document/content/[fileId]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  const { fileId } = params
  
  // 从缓存获取完整内容
  const documentCache = (global as any).documentCache || new Map()
  const documentData = documentCache.get(fileId)
  
  if (!documentData) {
    return NextResponse.json({
      error: '文档不存在或已过期',
      code: 'DOCUMENT_NOT_FOUND'
    }, { status: 404 })
  }
  
  return NextResponse.json({
    success: true,
    fileId,
    text: documentData.text,  // 完整内容
    characterCount: documentData.characterCount,
    metadata: documentData.metadata
  })
}
```

#### 1.2 修改前端翻译逻辑
```typescript
// components/document-translator.tsx
const handleTranslate = useCallback(async (sourceLanguage: string, targetLanguage: string) => {
  // ... 现有验证逻辑 ...
  
  const { fileId, fileName } = uploadState.uploadResult
  
  // 🎯 获取完整文档内容
  const contentResponse = await fetch(`/api/document/content/${fileId}`)
  const contentData = await contentResponse.json()
  
  if (!contentResponse.ok || !contentData.success) {
    throw new Error('无法获取文档内容')
  }
  
  const fullContent = contentData.text  // 完整内容
  
  // 🎯 使用完整内容进行翻译
  const response = await fetch('/api/document/translate/queue', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    },
    body: JSON.stringify({
      originalContent: fullContent,  // 完整内容
      sourceLang: sourceLanguage,
      targetLang: targetLanguage,
      fileName: fileName
    }),
  })
  
  // ... 其余逻辑 ...
}, [/* deps */])
```

### 方案2: 修改文档翻译队列API直接从缓存获取

#### 2.1 修改文档翻译队列API
```typescript
// /app/api/document/translate/queue/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { fileId, sourceLang, targetLang, fileName } = body  // 使用fileId而不是originalContent
  
  // 从缓存获取完整内容
  const documentCache = (global as any).documentCache || new Map()
  const documentData = documentCache.get(fileId)
  
  if (!documentData) {
    return NextResponse.json({
      error: '文档不存在或已过期',
      code: 'DOCUMENT_NOT_FOUND'
    }, { status: 404 })
  }
  
  const originalContent = documentData.text  // 完整内容
  
  // ... 其余翻译逻辑 ...
}
```

#### 2.2 修改前端调用
```typescript
// components/document-translator.tsx
body: JSON.stringify({
  fileId: fileId,  // 传递fileId而不是内容
  sourceLang: sourceLanguage,
  targetLang: targetLanguage,
  fileName: fileName
}),
```

---

## 🚀 推荐实施方案1

### 优势
1. **向后兼容**: 不破坏现有API结构
2. **清晰分离**: 内容获取和翻译逻辑分离
3. **易于调试**: 可以单独测试内容获取
4. **安全性**: 可以添加权限验证

### 实施步骤

#### 步骤1: 创建内容获取API
#### 步骤2: 修改前端翻译逻辑
#### 步骤3: 测试验证
#### 步骤4: 清理和优化

---

## 🧪 测试验证

### 1. 单元测试
```bash
# 测试内容获取API
curl "http://localhost:3000/api/document/content/doc_1753759076418_ysilk9lid"

# 验证返回完整内容
```

### 2. 集成测试
```bash
# 上传大文档
# 验证翻译使用完整内容
# 检查翻译结果长度
```

### 3. 用户测试
```bash
# 上传thai.txt文件
# 验证翻译结果包含完整内容
# 确认字符数匹配
```

---

## 📋 修复检查清单

### API开发
- [ ] 创建 `/api/document/content/[fileId]/route.ts`
- [ ] 添加权限验证
- [ ] 添加错误处理
- [ ] 添加缓存过期检查

### 前端修改
- [ ] 修改 `handleTranslate` 函数
- [ ] 添加内容获取逻辑
- [ ] 添加错误处理
- [ ] 更新类型定义

### 测试验证
- [ ] 单元测试通过
- [ ] 集成测试通过
- [ ] 用户验收测试通过
- [ ] 性能测试通过

### 部署准备
- [ ] 代码审查完成
- [ ] 文档更新完成
- [ ] 监控告警配置
- [ ] 回滚方案准备

---

## 🎯 预期结果

修复完成后：
1. **完整翻译**: 长文档能够完整翻译，不会被截断
2. **正确字符数**: 翻译的字符数与上传的字符数一致
3. **用户体验**: 用户能获得完整的翻译结果

**优先级**: 🔥 最高优先级 - 核心功能缺陷
