# 翻译API字段问题修复报告

## 问题描述
翻译时出现错误：
```
Missing required fields: jobType, sourceLanguage, targetLanguage
```

## 问题分析

### 根本原因
前端调用队列API (`/api/translate/queue`) 时，发送的字段格式不匹配：

**队列API期望的字段**:
- `jobType` (必需): 任务类型，如 "text", "document", "batch"
- `sourceLanguage` (必需): 源语言
- `targetLanguage` (必需): 目标语言
- `originalContent`: 原始内容
- `priority`: 优先级
- `metadata`: 元数据

**前端发送的字段**:
- `text`: 文本内容
- `sourceLang`: 源语言
- `targetLang`: 目标语言
- `sourceLanguage`: 源语言 (兼容性)
- `targetLanguage`: 目标语言 (兼容性)

### 问题影响
- 队列翻译功能完全无法使用
- 长文本翻译可能受影响
- 后台翻译任务无法创建

## 修复方案

### 1. 前端API调用修复
**文件**: `frontend/components/translation/unified-translator.tsx`

**修改内容**:
```typescript
// 构建请求体，根据不同的API端点使用不同的字段格式
let requestBody: any = {
  text: state.sourceText,
  sourceLang: state.sourceLanguage,
  targetLang: state.targetLanguage,
  sourceLanguage: state.sourceLanguage, // 保持兼容性
  targetLanguage: state.targetLanguage, // 保持兼容性
  processingMode, // 内部标识
}

// 如果是队列API，添加必需的jobType字段
if (endpoint === '/api/translate/queue') {
  requestBody = {
    jobType: 'text', // 文本翻译类型
    sourceLanguage: state.sourceLanguage,
    targetLanguage: state.targetLanguage,
    originalContent: state.sourceText,
    priority: 5, // 默认优先级
    metadata: {
      processingMode,
      characterCount: state.sourceText.length,
    }
  }
}
```

### 2. API端点字段格式规范

#### 公共API (`/api/translate/public`)
```json
{
  "text": "要翻译的文本",
  "sourceLang": "源语言代码",
  "targetLang": "目标语言代码"
}
```

#### 认证API (`/api/translate`)
```json
{
  "text": "要翻译的文本",
  "sourceLang": "源语言代码",
  "targetLang": "目标语言代码",
  "sourceLanguage": "源语言代码",
  "targetLanguage": "目标语言代码"
}
```

#### 队列API (`/api/translate/queue`)
```json
{
  "jobType": "text",
  "sourceLanguage": "源语言代码",
  "targetLanguage": "目标语言代码",
  "originalContent": "要翻译的文本",
  "priority": 5,
  "metadata": {
    "processingMode": "fast_queue",
    "characterCount": 100
  }
}
```

## 修复验证

### 自动验证结果
- ✅ 队列API字段要求已确认
- ✅ 前端已添加jobType字段
- ✅ 前端已添加originalContent字段
- ✅ 前端已区分队列API请求格式
- ✅ API端点选择逻辑正确

### 测试场景

#### 场景1: 短文本翻译 (≤300字符)
- **端点**: `/api/translate/public`
- **字段**: `text`, `sourceLang`, `targetLang`
- **预期**: 正常翻译，无需登录

#### 场景2: 中等文本翻译 (300-1000字符)
- **端点**: `/api/translate`
- **字段**: `text`, `sourceLang`, `targetLang`, `sourceLanguage`, `targetLanguage`
- **预期**: 需要登录，消耗积分

#### 场景3: 队列翻译
- **端点**: `/api/translate/queue`
- **字段**: `jobType`, `sourceLanguage`, `targetLanguage`, `originalContent`, `priority`, `metadata`
- **预期**: 创建后台任务，异步处理

## 相关修复

### 同时修复的问题
1. **700字符翻译问题**: 修复了API端点选择逻辑
2. **字段格式不一致**: 统一了不同API的字段格式
3. **队列API无法使用**: 添加了必需的字段

### 修复的文件
- `frontend/components/translation/unified-translator.tsx` - 主要修复
- `frontend/app/api/translate/queue/route.ts` - 字段验证 (无修改)
- `frontend/app/api/translate/route.ts` - 注释修复
- `frontend/app/api/translate/public/route.ts` - 公共API (无修改)

## 部署说明

### 需要重启的服务
1. 前端应用 (Next.js)
2. 无需重启后端API

### 验证步骤
1. 测试短文本翻译 (公共API)
2. 测试中等文本翻译 (认证API)
3. 测试队列翻译功能
4. 检查错误日志是否还有字段缺失错误

## 错误处理

### 常见错误及解决方案

#### 错误1: "Missing required fields"
- **原因**: API字段格式不匹配
- **解决**: 检查请求体字段是否符合对应API要求

#### 错误2: "Invalid job type"
- **原因**: jobType字段值不正确
- **解决**: 确保jobType为 "text", "document", 或 "batch"

#### 错误3: "Text jobs require originalContent"
- **原因**: 文本类型任务缺少内容
- **解决**: 确保originalContent字段包含要翻译的文本

## 监控建议

### 日志监控
- 监控API调用成功率
- 检查字段验证错误频率
- 跟踪不同端点的使用情况

### 性能监控
- 队列任务处理时间
- API响应时间
- 错误率变化

---

**修复完成时间**: 2025-07-09  
**修复人员**: Amazon Q  
**影响范围**: 所有翻译API调用，特别是队列翻译功能
