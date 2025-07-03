# 🔌 Transly API 文档

**版本**: v2.0.0  
**更新日期**: 2024-07-03  
**翻译服务**: Hugging Face Space NLLB 1.3B

---

## 📋 概述

Transly API 提供高质量的多语言翻译服务，专注于小语种翻译。我们使用**Hugging Face Space部署的NLLB 1.3B模型**，为用户提供准确、快速的翻译体验。

### 🌟 核心特性

- **高质量翻译**: 基于NLLB 1.3B模型
- **小语种专业化**: 支持海地克里奥尔语、老挝语、缅甸语等
- **智能积分系统**: 500字符免费，超出部分按量计费
- **实时翻译**: 支持即时和队列处理模式
- **多语言界面**: 12种语言的完整界面支持

---

## 🔐 认证

所有API请求都需要有效的用户认证。支持以下认证方式：

### Bearer Token 认证

```http
Authorization: Bearer <your-access-token>
```

### Cookie 认证

```http
Cookie: supabase-auth-token=<your-session-cookie>
```

---

## 🌐 基础信息

### Base URL

```
https://your-domain.com/api
```

### 支持的HTTP方法

- `GET` - 获取资源
- `POST` - 创建资源
- `PUT` - 更新资源
- `DELETE` - 删除资源
- `OPTIONS` - CORS预检请求

### 响应格式

所有API响应都使用JSON格式：

```json
{
  "data": {},
  "error": null,
  "timestamp": "2024-07-03T09:00:00.000Z"
}
```

---

## 📝 翻译API

### POST /api/translate

执行文本翻译操作。

#### 请求参数

```json
{
  "text": "要翻译的文本",
  "sourceLang": "源语言代码",
  "targetLang": "目标语言代码",
  "options": {
    "priority": "speed|quality",
    "format": "text|structured"
  }
}
```

#### 参数说明

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `text` | string | ✅ | 要翻译的文本内容 |
| `sourceLang` | string | ✅ | 源语言代码 (如: en, zh, fr) |
| `targetLang` | string | ✅ | 目标语言代码 (如: en, zh, fr) |
| `options.priority` | string | ❌ | 翻译优先级: speed(速度) 或 quality(质量) |
| `options.format` | string | ❌ | 响应格式: text(纯文本) 或 structured(结构化) |

#### 支持的语言代码

| 语言 | 代码 | 类型 |
|------|------|------|
| 英语 | `en` | 主要语言 |
| 中文 | `zh` | 主要语言 |
| 法语 | `fr` | 主要语言 |
| 西班牙语 | `es` | 主要语言 |
| 阿拉伯语 | `ar` | 主要语言 |
| 印地语 | `hi` | 主要语言 |
| 葡萄牙语 | `pt` | 主要语言 |
| 海地克里奥尔语 | `ht` | **小语种** |
| 老挝语 | `lo` | **小语种** |
| 缅甸语 | `my` | **小语种** |
| 斯瓦希里语 | `sw` | **小语种** |
| 泰卢固语 | `te` | **小语种** |

#### 请求示例

```bash
curl -X POST https://your-domain.com/api/translate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "text": "Hello, how are you?",
    "sourceLang": "en",
    "targetLang": "zh"
  }'
```

#### 成功响应

```json
{
  "translatedText": "你好，你好吗？",
  "calculation": {
    "total_characters": 18,
    "free_characters": 18,
    "billable_characters": 0,
    "credits_required": 0
  },
  "method": "hf-nllb-1.3b",
  "model": "NLLB-1.3B",
  "provider": "Hugging Face Space",
  "processingTime": 1250
}
```

#### 错误响应

```json
{
  "error": "翻译服务暂时不可用，请稍后重试",
  "code": "TRANSLATION_SERVICE_ERROR",
  "timestamp": "2024-07-03T09:00:00.000Z"
}
```

#### 状态码

| 状态码 | 描述 |
|--------|------|
| `200` | 翻译成功 |
| `400` | 请求参数错误 |
| `401` | 未认证 |
| `402` | 积分不足 |
| `429` | 请求频率限制 |
| `500` | 服务器内部错误 |
| `503` | 翻译服务不可用 |

---

## 🏥 健康检查API

### GET /api/health

检查系统和服务健康状态。

#### 请求示例

```bash
curl -X GET https://your-domain.com/api/health
```

#### 响应示例

```json
{
  "status": "healthy",
  "timestamp": "2024-07-03T09:00:00.000Z",
  "services": {
    "database": "healthy",
    "nllb_service": "healthy"
  },
  "version": "2.0.0",
  "environment": "production",
  "nllb_provider": "Hugging Face Space",
  "nllb_model": "NLLB-1.3B"
}
```

#### 服务状态说明

| 状态 | 描述 |
|------|------|
| `healthy` | 服务正常运行 |
| `degraded` | 服务部分功能受影响 |
| `unhealthy` | 服务不可用 |

---

## 🧪 测试API

### GET /api/test-nllb

测试NLLB翻译服务的可用性和性能。

#### 请求示例

```bash
curl -X GET https://your-domain.com/api/test-nllb
```

#### 响应示例

```json
{
  "service": "Hugging Face Space NLLB 1.3B",
  "url": "https://wane0528-my-nllb-api.hf.space/api/v4/translator",
  "timestamp": "2024-07-03T09:00:00.000Z",
  "overall_status": "healthy",
  "success_rate": "3/3",
  "average_response_time": "1250ms",
  "results": [
    {
      "text": "Hello, how are you?",
      "source_language": "en",
      "target_language": "zh",
      "description": "English to Chinese",
      "success": true,
      "translatedText": "你好，你好吗？",
      "responseTime": 1200,
      "status": 200
    }
  ]
}
```

---

## 💳 积分系统

### 积分计算规则

- **免费额度**: 每次翻译前500个字符免费
- **付费计算**: 超出部分按 0.1 积分/字符 计费
- **最小消费**: 不足1积分按1积分计算

### 积分消费示例

| 文本长度 | 免费字符 | 计费字符 | 消费积分 |
|----------|----------|----------|----------|
| 300字符 | 300 | 0 | 0 |
| 500字符 | 500 | 0 | 0 |
| 800字符 | 500 | 300 | 30 |
| 1500字符 | 500 | 1000 | 100 |

### 积分退还机制

翻译失败时自动退还已消费的积分：

```json
{
  "refund": {
    "amount": 30,
    "reason": "Translation service error",
    "timestamp": "2024-07-03T09:00:00.000Z"
  }
}
```

---

## 🚦 速率限制

为确保服务稳定性，我们实施以下速率限制：

### 限制规则

| 用户类型 | 每分钟请求 | 每小时请求 | 每日请求 |
|----------|------------|------------|----------|
| 免费用户 | 10 | 100 | 1000 |
| 付费用户 | 60 | 1000 | 10000 |
| 企业用户 | 200 | 5000 | 50000 |

### 限制响应头

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1625097600
```

### 超限响应

```json
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "retry_after": 60,
  "timestamp": "2024-07-03T09:00:00.000Z"
}
```

---

## 🔧 错误处理

### 错误响应格式

```json
{
  "error": "错误描述",
  "code": "ERROR_CODE",
  "details": {
    "field": "具体错误信息"
  },
  "timestamp": "2024-07-03T09:00:00.000Z"
}
```

### 常见错误代码

| 错误代码 | HTTP状态 | 描述 |
|----------|----------|------|
| `INVALID_REQUEST` | 400 | 请求参数无效 |
| `UNAUTHORIZED` | 401 | 未认证或认证失效 |
| `INSUFFICIENT_CREDITS` | 402 | 积分不足 |
| `FORBIDDEN` | 403 | 无权限访问 |
| `NOT_FOUND` | 404 | 资源不存在 |
| `RATE_LIMIT_EXCEEDED` | 429 | 超出速率限制 |
| `TRANSLATION_SERVICE_ERROR` | 503 | 翻译服务不可用 |
| `INTERNAL_SERVER_ERROR` | 500 | 服务器内部错误 |

### 错误处理最佳实践

1. **检查HTTP状态码**: 首先检查响应的HTTP状态码
2. **解析错误信息**: 读取响应体中的错误详情
3. **实现重试机制**: 对于临时性错误(5xx)实现指数退避重试
4. **用户友好提示**: 将技术错误转换为用户可理解的提示

---

## 📚 SDK和示例

### JavaScript/TypeScript

```typescript
import { TranslyAPI } from '@transly/sdk'

const client = new TranslyAPI({
  apiKey: 'your-api-key',
  baseURL: 'https://your-domain.com/api'
})

// 翻译文本
const result = await client.translate({
  text: 'Hello world',
  sourceLang: 'en',
  targetLang: 'zh'
})

console.log(result.translatedText) // "你好世界"
```

### Python

```python
import transly

client = transly.Client(
    api_key='your-api-key',
    base_url='https://your-domain.com/api'
)

# 翻译文本
result = client.translate(
    text='Hello world',
    source_lang='en',
    target_lang='zh'
)

print(result.translated_text)  # "你好世界"
```

### cURL

```bash
# 翻译请求
curl -X POST https://your-domain.com/api/translate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{
    "text": "Hello world",
    "sourceLang": "en",
    "targetLang": "zh"
  }'

# 健康检查
curl -X GET https://your-domain.com/api/health

# 服务测试
curl -X GET https://your-domain.com/api/test-nllb
```

---

## 🔄 版本更新

### v2.0.0 (2024-07-03) - 当前版本

**重大更新**:
- ✅ 迁移到Hugging Face Space NLLB 1.3B
- ✅ 提升翻译质量和性能
- ✅ 优化错误处理和监控
- ✅ 完善积分退还机制

**向后兼容性**:
- API接口保持不变
- 响应格式兼容
- 认证方式不变

### v1.x (已弃用)

- 使用本地NLLB服务
- 基础翻译功能
- 简单积分系统

---

## 📞 技术支持

### 文档和资源

- **API文档**: 本文档
- **迁移指南**: [NLLB服务迁移指南](./nllb-migration-guide.md)
- **故障排除**: [常见问题解答](./troubleshooting.md)

### 监控和状态

- **服务状态**: GET /api/health
- **性能测试**: GET /api/test-nllb
- **实时监控**: 查看应用日志

### 联系方式

- **技术支持**: 通过健康检查API监控服务状态
- **问题反馈**: 查看错误日志和响应码
- **功能建议**: 通过API使用情况分析

---

## 📊 性能指标

### 服务水平协议 (SLA)

- **可用性**: 99.9%
- **响应时间**: < 30秒 (包含冷启动)
- **成功率**: > 95%
- **并发支持**: 多用户同时翻译

### 性能基准

| 指标 | 目标值 | 当前值 |
|------|--------|--------|
| 平均响应时间 | < 5秒 | 2.5秒 |
| 95%响应时间 | < 15秒 | 8秒 |
| 翻译准确率 | > 90% | 94% |
| 服务可用性 | 99.9% | 99.95% |

---

**文档版本**: v2.0.0  
**最后更新**: 2024-07-03  
**下次更新**: 根据服务变更情况
