# 🚀 Transly - 小语种翻译平台

## 📋 项目概览
- **定位**: 专注小语种翻译的AI平台，覆盖Google翻译不支持的语言
- **团队**: 5人小团队（前端2人 + 后端2人 + 全栈1人）
- **技术**: Next.js + Supabase + NLLB + Creem + Vercel
- **周期**: 3个月（MVP 2周 + 完善4周 + 扩展8周）

## ✨ 核心功能
- 🌍 支持20+小语种与英文双向翻译
- 📄 文档翻译（PDF/Word/PPT）
- 🔊 语音播放（TTS）
- 💰 积分制付费系统
- 📱 完美移动端适配
- 🎯 SEO优化的语言落地页

## 🛠️ 技术栈（简化版）
```
前端: Next.js 14 + TypeScript + Tailwind CSS
后端: Next.js API Routes + Supabase
翻译: Meta NLLB + Hugging Face API
支付: Creem
部署: Vercel
监控: 简单日志 + 基础告警
```

## 📋 开发指南

### 🎯 核心文档（只需关注这些）
- **[📋 统一开发清单](./todo_list.md)** - 包含所有任务、分工、时间线、风险管理
- **[📖 产品文档](./product.md)** - 完整的产品规格和商业化策略
- **[🚀 快速上线指南](./QUICK-LAUNCH-GUIDE.md)** - 上线前检查清单

### 🏃‍♂️ 快速开始
```bash
# 1. 克隆项目
git clone <repository-url>
cd translation-low-source

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入必要的API密钥

# 4. 启动开发服务器
npm run dev

# 5. 访问应用
open http://localhost:3000
```

### 📊 当前进度
```
✅ 已完成:
- 基础项目架构
- 5个核心语言页面
- 设计系统基础
- 产品文档完善

🔄 进行中:
- MVP核心功能开发
- 数据库设计
- 翻译服务集成
- 支付系统集成

📋 待开始:
- 用户系统完善
- 移动端优化
- 性能优化
- 上线部署
```

## 👥 团队协作

### 每日工作流程
1. **9:30 每日站会** (15分钟) - 同步进度和问题
2. **开发工作** - 按照todo_list.md中的任务分工
3. **代码审查** - 每个PR必须经过审查
4. **周五回顾** - 总结本周进展，规划下周任务

### 沟通渠道
- **即时沟通**: 微信群/Slack
- **代码协作**: GitHub PR + Issues
- **任务管理**: GitHub Projects
- **文档共享**: 当前仓库

## 🎯 里程碑目标

### Week 2: MVP上线
- 核心翻译功能可用
- 用户注册登录系统
- 基础支付流程
- 5个语言页面集成

### Week 6: 产品完善
- 用户体验优化
- 性能稳定性提升
- 商业化功能完善
- 数据分析系统

### Week 12: 规模化准备
- 高级功能开发
- 技术架构优化
- 运营体系建立
- 收入目标达成

## 🔧 开发规范

### 代码规范
- **TypeScript**: 严格类型检查
- **ESLint + Prettier**: 代码格式统一
- **Git提交**: 使用conventional commits
- **分支策略**: feature/* → develop → main

### 测试策略
- **单元测试**: 核心功能必须覆盖
- **集成测试**: API接口完整测试
- **端到端测试**: 关键用户流程
- **性能测试**: 定期执行

## 📈 监控指标

### 技术指标
- 系统可用性: >99%
- API响应时间: <2秒
- 页面加载速度: <3秒
- 错误率: <1%

### 业务指标
- 日活用户: 目标1000+
- 注册转化率: 目标15%+
- 付费转化率: 目标8%+
- 月收入: 目标$5000+

## 🆘 问题和支持

### 常见问题
1. **环境配置问题** → 查看 .env.example
2. **API集成问题** → 查看 product.md 技术架构部分
3. **部署问题** → 查看 QUICK-LAUNCH-GUIDE.md

### 获取帮助
- **技术问题**: 在GitHub Issues中提问
- **紧急问题**: 联系技术负责人
- **产品问题**: 查看product.md文档

---

**项目状态**: 🚀 MVP开发中  
**最后更新**: 2025-01-03  
**维护者**: 技术负责人
# 克隆项目
git clone <repository-url>
cd low-source-translate

# 安装所有依赖
npm install
```

### 2. 环境配置

#### 选项A: Mock模式（推荐新手开发）
创建 `.env.local` 文件：
```bash
cp env.local.example .env.local
```

在 `.env.local` 中设置：
```env
# 开发模式设置
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 翻译服务配置 - Mock模式（无需API key）
USE_MOCK_TRANSLATION=true
USE_MOCK_TTS=true

# 文件处理服务配置
FILE_SERVICE_URL=http://localhost:3010
```

**Mock模式优势**: 无需任何外部API key，立即可用，适合功能开发和测试。

#### 选项B: 生产模式（真实API）
```env
# 翻译服务配置 - 真实API
USE_MOCK_TRANSLATION=false
HUGGINGFACE_API_KEY=your_hf_api_key

# TTS服务配置
USE_MOCK_TTS=false
GOOGLE_TTS_API_KEY=your_google_key

# 缓存配置
KV_REST_API_URL=your_kv_url
KV_REST_API_TOKEN=your_kv_token

# 其他服务
MONGODB_URI=your_mongodb_uri
RESEND_API_KEY=your_resend_api_key
CREEM_API_KEY=your_creem_api_key
```

### 3. 启动开发服务器
```bash
# 启动全部服务（前端 + 微服务）
npm run dev

# 或者分别启动
npm run dev:frontend      # http://localhost:3000
npm run dev:file-service  # http://localhost:3010
```

### 4. 功能测试

#### 基础功能
1. **访问主页**: http://localhost:3000
2. **文本翻译测试**: http://localhost:3000/text-translate
   - 输入: `Hello world`
   - 源语言: `en` → 目标语言: `sw`
   - 在Mock模式下会看到格式化的演示翻译

3. **文档翻译**: http://localhost:3000/document-translate
   - 上传文本文件测试完整流程

4. **语言落地页**: http://localhost:3000/creole-to-english
   - 测试海地克里奥尔语翻译页面

#### API健康检查
```bash
# 前端API
curl http://localhost:3000/api/health

# 微服务
curl http://localhost:3010/health

# 翻译API测试
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world","sourceLanguage":"en","targetLanguage":"sw"}'
```

## 📁 项目结构
```
transly/
├── frontend/                    # Next.js 全栈应用
│   ├── app/                    # App Router (Next.js 14+)
│   │   ├── api/               # API Routes (核心后端)
│   │   │   ├── translate/     # 翻译API
│   │   │   ├── detect/        # 语言检测API
│   │   │   ├── tts/          # 语音合成API
│   │   │   └── auth/         # 认证API
│   │   ├── [lang]-to-english/ # 动态语种页面
│   │   ├── text-translate/    # 文本翻译独立页面
│   │   ├── document-translate/ # 文档翻译页面
│   │   └── globals.css        # 全局样式
│   ├── components/            # React 组件
│   ├── lib/                   # 工具库 & 类型定义
│   ├── locales/              # 多语言翻译文件
│   └── public/               # 静态资源
├── microservices/            # Node.js 微服务
│   └── file-processor/       # 文件处理服务
│       ├── src/
│       │   ├── routes/       # Fastify 路由
│       │   ├── services/     # 业务逻辑
│       │   └── utils/        # 工具函数
│       └── package.json
├── shared/                   # 共享类型定义
│   └── types/               # TypeScript 类型
├── docs/                    # 项目文档
├── tests/                   # 测试文件
└── config/                  # 配置文件
```

## 🛠️ 开发模式说明

### Mock模式 vs 生产模式

| 功能 | Mock模式 | 生产模式 |
|------|---------|----------|
| 翻译服务 | 返回格式化演示结果 | Hugging Face NLLB API |
| TTS服务 | 生成测试音频波形 | Google TTS / Edge Speech |
| 缓存 | 内存缓存 | Vercel KV / Redis |
| 配置要求 | 无需外部API | 需要API密钥 |
| 开发速度 | 快速启动 | 需要配置 |

### 故障排除

#### 问题: 翻译失败 "Hugging Face API key not configured"
**解决方案**: 
1. 确认 `.env.local` 文件存在
2. 设置 `USE_MOCK_TRANSLATION=true` 启用Mock模式
3. 重启开发服务器

#### 问题: 微服务连接失败
**解决方案**:
1. 确认微服务运行: `curl http://localhost:3010/health`
2. 检查端口3010是否被占用
3. 重启: `npm run dev:file-service`

#### 问题: 文件上传目录错误
**解决方案**: 微服务会自动创建必要目录，如仍有问题：
```bash
mkdir -p microservices/file-processor/{uploads,temp,results}
```

## 🔄 当前开发重点

### 即将开发的功能
1. **首页功能重构** - 展示多种翻译形式概览
2. **文本翻译独立页面** - `/text-translate` 路由
3. **语言落地页系统** - 支持更多小语种
4. **多语言界面支持** - i18n国际化系统
5. **Footer页面完善** - Contact、API文档等页面

### 开发优先级
```
高优先级:
├── 首页重构 (用户体验提升)
├── 文本翻译独立页面 (功能分离)
└── 语言落地页系统 (SEO流量)

中优先级:
├── 多语言界面支持 (国际化)
└── Footer页面完善 (内容完整性)

低优先级:
└── 图片翻译功能 (V2功能)
```

## 🚀 部署说明
- **前端 + 核心API**: Vercel（一键部署）
- **文件处理微服务**: Railway/Fly.io（自动扩缩容）
- **缓存**: Vercel KV / Upstash Redis
- **数据库**: MongoDB Atlas 免费层（可选）
- **文件存储**: Vercel Blob / Cloudflare R2
- **CDN**: Cloudflare（加速全球访问）

### 部署命令
```bash
# 部署前端到 Vercel
cd frontend && vercel --prod

# 部署文件微服务到 Railway
cd microservices/file-processor && railway up
```

## 📖 开发文档
- [产品文档](./product.md)
- [开发规则](./rules.md)
- [任务清单](./todo_list.md)
- [API 文档](./docs/api.md)

## 🤝 贡献指南
1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证
MIT License

## 📞 联系方式
- 项目维护者: [Your Name]
- 邮箱: your.email@example.com
- 项目地址: https://github.com/yourusername/transly 