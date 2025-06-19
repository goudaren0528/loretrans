# Transly API 文档

## 概述

Transly提供了三个核心的API端点，用于翻译、语言检测和文本转语音功能。所有API都使用JSON格式进行数据交换，并遵循RESTful设计原则。

## 基础信息

- **Base URL**: `https://your-domain.com/api`
- **Content-Type**: `application/json`
- **Response Format**: 统一的JSON响应格式

### 标准响应格式

```json
{
  "success": true,
  "data": { /* 实际数据 */ },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "req_1234567890_abcdefghi",
    "version": "1.0.0"
  }
}
```

### 错误响应格式

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": { /* 错误详情 */ }
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "req_1234567890_abcdefghi",
    "version": "1.0.0"
  }
}
```

## API 端点

### 1. 文本翻译 API

**POST** `/api/translate`

将小语种文本翻译为英文，或英文翻译为小语种。

#### 请求参数

```json
{
  "text": "Bonjou, kijan ou ye?",
  "sourceLanguage": "ht",
  "targetLanguage": "en"
}
```

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| text | string | 是 | 要翻译的文本（最大1000字符） |
| sourceLanguage | string | 是 | 源语言代码（如：ht, sw, my） |
| targetLanguage | string | 是 | 目标语言代码（如：en） |

#### 响应示例

```json
{
  "success": true,
  "data": {
    "translatedText": "Hello, how are you?",
    "sourceLanguage": "ht",
    "targetLanguage": "en",
    "processingTime": 1250
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "req_1234567890_abcdefghi",
    "version": "1.0.0"
  }
}
```

#### 支持的语言

| 代码 | 语言名称 | Native Name |
|------|----------|-------------|
| ht | Haitian Creole | Kreyòl Ayisyen |
| sw | Swahili | Kiswahili |
| my | Burmese | မြန်မာ |
| lo | Lao | ລາວ |
| km | Khmer | ខ្មែរ |
| te | Telugu | తెలుగు |
| si | Sinhala | සිංහල |
| am | Amharic | አማርኛ |
| ne | Nepali | नेपाली |
| mg | Malagasy | Malagasy |
| en | English | English |

### 2. 语言检测 API

**POST** `/api/detect`

自动检测文本的语言。

#### 请求参数

```json
{
  "text": "Bonjou, kijan ou ye?",
  "multiple": false,
  "limit": 3
}
```

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| text | string | 是 | 要检测的文本（最大2000字符） |
| multiple | boolean | 否 | 是否返回多个候选语言 |
| limit | number | 否 | 返回候选语言的数量（1-10） |

#### 单语言检测响应

```json
{
  "success": true,
  "data": {
    "language": "ht",
    "confidence": 0.95,
    "languageName": "Haitian Creole",
    "textLength": 18
  }
}
```

#### 多语言检测响应

```json
{
  "success": true,
  "data": {
    "candidates": [
      {
        "language": "ht",
        "confidence": 0.95,
        "languageName": "Haitian Creole"
      },
      {
        "language": "fr",
        "confidence": 0.12,
        "languageName": "French"
      }
    ],
    "primary": {
      "language": "ht",
      "confidence": 0.95,
      "languageName": "Haitian Creole"
    },
    "textLength": 18
  }
}
```

### 3. 文本转语音 API

**POST** `/api/tts`

将文本转换为语音音频。

#### 请求参数

```json
{
  "text": "Hello, this is a test message.",
  "language": "en",
  "voice": "en-US-AriaNeural",
  "rate": 1.0,
  "pitch": 1.0
}
```

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| text | string | 是 | 要转换的文本（最大500字符） |
| language | string | 是 | 语言代码 |
| voice | string | 否 | 语音代码（自动选择如果未指定） |
| rate | number | 否 | 语速（0.5-2.0，默认1.0） |
| pitch | number | 否 | 音调（0.5-2.0，默认1.0） |

#### 响应示例

```json
{
  "success": true,
  "data": {
    "audioUrl": "data:audio/mp3;base64,//uQZAA...",
    "format": "mp3",
    "language": "en",
    "voice": "en-US-AriaNeural",
    "processingTime": 850
  }
}
```

**GET** `/api/tts?language=en`

获取支持的语音选项。

#### 响应示例

```json
{
  "success": true,
  "data": {
    "language": "en",
    "voices": [
      {
        "code": "en-US-AriaNeural",
        "name": "Aria (US Female)",
        "gender": "female",
        "language": "en-US"
      }
    ],
    "supported": true
  }
}
```

### 4. 健康检查 API

**GET** `/api/health`

检查服务状态和健康信息。

#### 响应示例

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "version": "1.0.0",
    "services": {
      "translation": {
        "status": "available",
        "responseTime": 45
      },
      "tts": {
        "status": "available",
        "responseTime": 23
      },
      "languageDetection": {
        "status": "available",
        "responseTime": 12
      }
    },
    "uptime": 3600000,
    "memory": {
      "used": 128,
      "total": 512,
      "percentage": 25
    }
  }
}
```

## 错误代码

| 代码 | 描述 |
|------|------|
| INVALID_REQUEST | 请求格式无效 |
| MISSING_FIELDS | 缺少必需字段 |
| INVALID_JSON | JSON格式错误 |
| METHOD_NOT_ALLOWED | HTTP方法不允许 |
| RATE_LIMIT_EXCEEDED | 超出速率限制 |
| TEXT_TOO_LONG | 文本过长 |
| UNSUPPORTED_LANGUAGE | 不支持的语言 |
| TRANSLATION_FAILED | 翻译失败 |
| TTS_FAILED | 语音合成失败 |
| INTERNAL_ERROR | 内部服务器错误 |

## 使用示例

### JavaScript/TypeScript

```javascript
// 翻译文本
async function translateText(text, fromLang, toLang) {
  const response = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      sourceLanguage: fromLang,
      targetLanguage: toLang
    })
  })
  
  const data = await response.json()
  return data.success ? data.data : null
}

// 检测语言
async function detectLanguage(text) {
  const response = await fetch('/api/detect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  })
  
  const data = await response.json()
  return data.success ? data.data : null
}

// 文本转语音
async function textToSpeech(text, language) {
  const response = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, language })
  })
  
  const data = await response.json()
  if (data.success) {
    const audio = new Audio(data.data.audioUrl)
    audio.play()
  }
}
```

### cURL

```bash
# 翻译文本
curl -X POST https://your-domain.com/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text":"Bonjou","sourceLanguage":"ht","targetLanguage":"en"}'

# 检测语言
curl -X POST https://your-domain.com/api/detect \
  -H "Content-Type: application/json" \
  -d '{"text":"Bonjou, kijan ou ye?"}'

# 文本转语音
curl -X POST https://your-domain.com/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world","language":"en"}'

# 健康检查
curl https://your-domain.com/api/health
```

## 限制和配额

- **文本翻译**: 最大1000字符/请求
- **语言检测**: 最大2000字符/请求
- **文本转语音**: 最大500字符/请求
- **速率限制**: 100请求/15分钟（可配置）

## 版本历史

- **v1.0.0**: 初始版本，支持基础翻译、语言检测和TTS功能 