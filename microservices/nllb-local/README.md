# NLLB Local Translation Service

本服务提供基于Meta NLLB 600M模型的本地化翻译API，专为Loretrans项目设计。

## 🚀 快速开始

### 1. 环境要求

- Node.js 18+
- 内存: 最低4GB，推荐8GB+
- 存储: 模型文件约2-3GB

### 2. 安装依赖

```bash
cd microservices/nllb-local
npm install
```

### 3. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件配置参数
```

### 4. 下载模型

```bash
# 下载NLLB 600M模型
npm run download-model

# 查看模型信息
npm run download-model info
```

### 5. 启动服务

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

服务将在 `http://localhost:8080` 启动

## 📡 API 接口

### 健康检查
```http
GET /health
```

### 单文本翻译
```http
POST /translate
Content-Type: application/json

{
  "text": "Hello world",
  "sourceLanguage": "en",
  "targetLanguage": "ht"
}
```

### 批量翻译
```http
POST /translate/batch
Content-Type: application/json

{
  "texts": ["Hello", "World"],
  "sourceLanguage": "en", 
  "targetLanguage": "ht"
}
```

### 支持的语言
```http
GET /languages
```

### 模型信息
```http
GET /model/info
```

## 🐳 Docker 部署

### 构建镜像
```bash
cd microservices/nllb-local
docker build -f docker/Dockerfile -t nllb-local .
```

### 使用Docker Compose
```bash
cd microservices/nllb-local/docker
docker-compose up -d
```

## ⚡ 性能优化

### 1. 硬件优化
- **CPU**: 使用多核CPU可提升批量翻译性能
- **内存**: 8GB+内存确保模型运行流畅
- **GPU**: 如有GPU，设置 `DEVICE=gpu` 可大幅提升速度

### 2. 配置优化
```env
# 增加批处理大小（需更多内存）
BATCH_SIZE=8

# 使用FP16精度（GPU推荐）
DTYPE=fp16

# 并发请求限制
MAX_CONCURRENT_REQUESTS=5
```

### 3. 缓存优化
服务支持Redis缓存重复翻译请求:
```env
REDIS_URL=redis://localhost:6379
CACHE_TTL=3600
```

## 🔧 配置参数

| 参数 | 默认值 | 说明 |
|------|--------|------|
| PORT | 8080 | 服务端口 |
| HOST | 0.0.0.0 | 绑定地址 |
| DEVICE | cpu | 计算设备 (cpu/gpu) |
| DTYPE | fp32 | 数据精度 (fp32/fp16) |
| BATCH_SIZE | 4 | 批处理大小 |
| MODEL_PATH | ./models/nllb-600m | 模型路径 |

## 🌍 支持语言

服务支持以下语言互译:

- **ht** - Haitian Creole (海地克里奥尔语)
- **lo** - Lao (老挝语)  
- **sw** - Swahili (斯瓦希里语)
- **my** - Burmese (缅甸语)
- **te** - Telugu (泰卢固语)
- **si** - Sinhala (僧伽罗语)
- **am** - Amharic (阿姆哈拉语)
- **km** - Khmer (高棉语)
- **ne** - Nepali (尼泊尔语)
- **mg** - Malagasy (马拉加斯语)
- **en** - English (英语)

## 🔍 监控与日志

### 健康检查
```bash
curl http://localhost:8080/health
```

### 日志查看
```bash
# Docker日志
docker logs nllb-local-service

# 本地日志
tail -f logs/app.log
```

### 性能监控
服务提供Prometheus兼容的指标:
```bash
curl http://localhost:9090/metrics
```

## 🛠️ 开发调试

### 测试服务
```bash
# 运行测试
npm test

# 手动测试翻译
curl -X POST http://localhost:8080/translate \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello","sourceLanguage":"en","targetLanguage":"ht"}'
```

### 模型管理
```bash
# 验证模型
npm run download-model verify

# 清理缓存
npm run download-model cleanup

# 查看模型信息
npm run download-model info
```

## 🔒 安全配置

### API密钥验证
```env
API_KEY=your-secret-key
```

### CORS配置
```env
ALLOWED_ORIGINS=https://yourdomain.com,http://localhost:3000
```

## 📊 性能基准

基于不同硬件配置的性能参考:

| 硬件配置 | 单次翻译 | 批量翻译(10条) | 内存使用 |
|----------|----------|----------------|----------|
| 4核CPU + 8GB RAM | ~500ms | ~2s | ~3GB |
| 8核CPU + 16GB RAM | ~300ms | ~1s | ~3GB |  
| GPU + 16GB RAM | ~100ms | ~300ms | ~4GB |

## 🆘 故障排除

### 常见问题

1. **内存不足**
   ```
   Error: Cannot allocate memory
   ```
   解决: 增加系统内存或减少BATCH_SIZE

2. **模型下载失败**
   ```
   Error: Failed to download model
   ```
   解决: 检查网络连接或使用代理

3. **端口占用**
   ```
   Error: Port 8080 already in use
   ```
   解决: 修改PORT环境变量

### 日志级别
```env
LOG_LEVEL=debug  # 详细调试信息
LOG_LEVEL=info   # 标准信息
LOG_LEVEL=error  # 仅错误信息
```

## 📚 集成指南

### 与Loretrans主服务集成

1. 更新主服务配置:
```typescript
// config/app.config.ts
nllb: {
  localService: {
    url: 'http://localhost:8080',
    enabled: true,
    fallbackToHuggingFace: true
  }
}
```

2. 修改翻译服务:
```typescript
// 在translation.ts中添加本地服务调用
async function callLocalNLLBAPI(text, sourceLanguage, targetLanguage) {
  const response = await fetch(`${localServiceUrl}/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, sourceLanguage, targetLanguage })
  })
  return response.json()
}
```

## 📄 许可证

MIT License - 详见 LICENSE 文件 