# NLLB核心翻译功能实现指南

## 📋 概述

本文档详细说明如何实现NLLB 600M模型的核心翻译功能，包括服务启动、集成测试和性能优化。

## 🎯 实施目标

- ✅ 启用本地NLLB翻译服务（优先级最高）
- ✅ 实现服务降级机制：本地NLLB → Hugging Face API → Mock → Fallback
- ✅ 优化翻译性能和用户体验
- ✅ 完成端到端功能测试

## 📋 任务清单

### 阶段1：服务配置与启动（优先级：🔥高）

#### 任务3.6.1：NLLB本地服务环境配置与依赖安装
```bash
# 1. 进入NLLB服务目录
cd microservices/nllb-local

# 2. 安装Node.js依赖
npm install

# 3. 验证Python环境和AI依赖
python --version  # 需要Python 3.8+
pip list | grep transformers  # 验证transformers已安装
pip list | grep torch  # 验证torch已安装

# 4. 创建环境配置
cp .env.example .env  # 如果存在
# 或手动创建.env文件
```

**环境配置示例(.env)：**
```env
PORT=8080
HOST=0.0.0.0
NODE_ENV=production
MODEL_PATH=./models/nllb-600m
DEVICE=cpu
BATCH_SIZE=4
LOG_LEVEL=info
```

#### 任务3.6.2：NLLB本地服务启动与健康检查验证
```bash
# 1. 启动服务
npm start

# 2. 健康检查（新开终端）
curl http://localhost:8080/health
# 或使用PowerShell（Windows）
Invoke-RestMethod -Uri http://localhost:8080/health

# 3. 测试翻译功能
curl -X POST http://localhost:8080/translate \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world","sourceLanguage":"en","targetLanguage":"ht"}'

# 4. 运行完整测试套件
npm test
```

#### 任务3.6.3：主服务翻译接口切换到本地NLLB优先模式

**更新根目录.env配置：**
```env
# 启用本地NLLB服务
NLLB_LOCAL_ENABLED=true
NLLB_LOCAL_URL=http://localhost:8080
NLLB_LOCAL_FALLBACK=true
NLLB_LOCAL_TIMEOUT=30000

# 关闭Mock模式，使用真实翻译
USE_MOCK_TRANSLATION=false
```

**验证主服务集成：**
```bash
# 1. 启动主服务（新终端）
cd ../../  # 回到项目根目录
npm run dev

# 2. 测试翻译API
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world","sourceLanguage":"en","targetLanguage":"ht"}'

# 3. 测试前端界面
# 打开 http://localhost:3000/text-translate
# 输入文本进行翻译测试
```

### 阶段2：功能集成测试（优先级：🔥高）

#### 任务3.6.4：翻译服务负载均衡机制验证

**测试序列：**
1. **本地NLLB正常** → 应使用本地服务
2. **本地NLLB故障** → 应切换到Hugging Face API
3. **云端API故障** → 应使用Mock/Fallback

**测试脚本示例：**
```javascript
// 可以在前端控制台执行
async function testTranslationFallback() {
  // 正常翻译测试
  const response1 = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: 'Hello world',
      sourceLanguage: 'en',
      targetLanguage: 'ht'
    })
  });
  const result1 = await response1.json();
  console.log('Translation method:', result1.method);
  
  // 检查使用的翻译方法
  // 期望: 'nllb-local' > 'huggingface' > 'mock' > 'fallback'
}
```

#### 任务3.6.5：前端翻译功能端到端测试

**测试用例：**
```markdown
# 语言对测试矩阵
| 源语言 | 目标语言 | 测试文本 | 期望结果 |
|--------|----------|----------|----------|
| en | ht | Hello world | Bonjou monn |
| en | sw | Good morning | Habari za asubuhi |
| en | lo | Thank you | ຂອບໃຈ |
| en | my | How are you? | နေကောင်းလား? |
| en | te | Goodbye | వీడ్కోలు |

# 界面功能测试
1. 语言选择器功能
2. 文本输入/输出框
3. 翻译按钮响应
4. 结果复制功能
5. TTS语音播放
6. 错误状态显示
```

#### 任务3.6.6：文档翻译服务与本地NLLB集成测试
```bash
# 1. 启动文件处理服务
cd microservices/file-processor
npm start

# 2. 测试文档翻译流程
# 上传测试文件 → 文本提取 → NLLB翻译 → 结果下载

# 3. 验证翻译质量和性能
```

### 阶段3：性能优化（优先级：🟡中）

#### 任务3.6.7：翻译缓存机制优化
- Redis缓存配置
- 缓存键设计：`translate:${sourceLanguage}:${targetLanguage}:${textHash}`
- 缓存过期策略
- 内存缓存fallback

#### 任务3.6.8：翻译性能优化
```env
# 性能调优参数
BATCH_SIZE=8          # 批处理大小
MAX_CONCURRENT_REQUESTS=10  # 最大并发
REQUEST_TIMEOUT=30000      # 超时时间
```

#### 任务3.6.9：错误处理与降级策略完善
- 网络超时处理
- 内存不足恢复
- 模型加载失败处理
- 用户友好错误信息

#### 任务3.6.10：本地翻译服务监控与日志系统
- 服务健康监控
- 翻译请求日志
- 性能指标收集
- 错误告警机制

## 🚀 快速启动指南

### 1分钟快速测试
```bash
# 终端1：启动NLLB服务
cd microservices/nllb-local
npm install
npm start

# 终端2：启动主服务
cd ../../
npm run dev

# 终端3：快速测试
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello","sourceLanguage":"en","targetLanguage":"ht"}'
```

### 完整功能验证
1. **打开前端界面**：http://localhost:3000/text-translate
2. **选择语言对**：English → Haitian Creole
3. **输入测试文本**："Hello world"
4. **点击翻译**，检查结果
5. **验证TTS功能**（如果可用）
6. **测试其他语言对**

## 📊 成功标准

### 功能标准
- [x] 本地NLLB服务正常启动（端口8080）
- [x] 主服务翻译API正常工作（优先使用本地服务）
- [x] 前端翻译界面功能完整
- [x] 支持的语言对翻译准确
- [x] 降级机制正常工作

### 性能标准
- [x] 单次翻译响应时间 < 3秒
- [x] 并发10个请求处理正常
- [x] 内存使用 < 4GB
- [x] CPU使用率 < 80%（正常负载）

### 质量标准
- [x] 翻译准确率 > 85%
- [x] 错误处理完善
- [x] 用户体验流畅
- [x] 日志信息完整

## 🛠️ 故障排除

### 常见问题

#### 1. NLLB服务启动失败
```bash
# 检查依赖安装
npm list --depth=0

# 检查Python环境
python --version
pip list | grep transformers

# 检查模型文件
ls -la models/nllb-600m/
```

#### 2. 翻译请求超时
```bash
# 检查服务状态
curl http://localhost:8080/health

# 调整超时参数
# 在.env中设置 REQUEST_TIMEOUT=60000
```

#### 3. 内存不足错误
```bash
# 减少批处理大小
BATCH_SIZE=2

# 监控内存使用
top -p $(pgrep -f "node.*nllb")
```

## 📈 监控指标

### 服务健康指标
- 服务可用性（uptime）
- 响应时间（response time）
- 错误率（error rate）
- 内存使用率（memory usage）

### 业务指标
- 翻译请求量（request volume）
- 语言对使用分布（language pair distribution）
- 用户会话时长（session duration）
- 翻译准确性反馈（accuracy feedback）

## 🔄 持续改进

### 短期优化（1周内）
- [ ] GPU支持（如有硬件）
- [ ] 缓存命中率优化
- [ ] 并发处理能力提升

### 中期优化（1月内）
- [ ] 更大模型部署（NLLB 1.3B）
- [ ] 边缘缓存部署
- [ ] A/B测试框架

### 长期规划（3月内）
- [ ] 多模型集成
- [ ] 自动扩展机制
- [ ] 智能负载均衡

---

## ✅ 验收清单

完成以下所有项目后，NLLB核心翻译功能实现完毕：

- [ ] 本地NLLB服务稳定运行
- [ ] 主服务集成测试通过
- [ ] 前端界面功能正常
- [ ] 所有支持语言对测试通过
- [ ] 性能指标达标
- [ ] 错误处理机制完善
- [ ] 监控和日志系统就位
- [ ] 用户使用体验验收通过

**预计完成时间：2-3个工作日**
**优先级：🔥 最高（核心功能）** 