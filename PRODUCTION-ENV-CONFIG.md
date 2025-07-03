# 生产环境配置指南

## 🚀 翻译服务配置

### 生产环境推荐配置：

```bash
# 禁用本地NLLB服务
NLLB_LOCAL_ENABLED=false

# Hugging Face API配置（主要翻译服务）
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
HUGGINGFACE_API_URL=https://api-inference.huggingface.co/models
NLLB_MODEL=facebook/nllb-200-distilled-600M

# 翻译参数
NLLB_MAX_LENGTH=1000
NLLB_TEMPERATURE=0.3
NLLB_TIMEOUT=30000

# 环境标识
NODE_ENV=production
```

### 开发环境配置：

```bash
# 启用本地NLLB服务（开发测试用）
NLLB_LOCAL_ENABLED=true
NLLB_LOCAL_URL=http://localhost:8081
NLLB_LOCAL_FALLBACK=true

# Hugging Face API作为fallback
HUGGINGFACE_API_KEY=your_huggingface_api_key_here

# 环境标识
NODE_ENV=development
```

## 🔄 翻译服务优先级

### 开发环境：
1. 本地NLLB服务 (如果启用且可用)
2. Hugging Face API (fallback)
3. Mock/Fallback翻译

### 生产环境：
1. Hugging Face API (主要服务)
2. Fallback翻译 (紧急情况)

## 💰 成本考虑

### Hugging Face API优势：
- ✅ 无需维护本地服务器
- ✅ 自动扩展和负载均衡
- ✅ 高可用性和稳定性
- ✅ 按使用量付费
- ✅ 支持更多语言模型

### 本地服务优势：
- ✅ 完全控制和隐私
- ✅ 无API调用限制
- ✅ 低延迟（如果部署得当）
- ❌ 需要维护服务器资源
- ❌ 需要处理扩展和可用性

## 🛠️ 部署建议

### 生产环境部署：
1. 设置 `NLLB_LOCAL_ENABLED=false`
2. 配置有效的 `HUGGINGFACE_API_KEY`
3. 监控API使用量和成本
4. 设置适当的超时和重试机制

### 监控指标：
- API响应时间
- 成功率
- 错误率
- 使用量和成本
- 用户满意度
