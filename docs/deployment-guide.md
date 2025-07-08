# Vercel 部署指南

## 前置条件

1. **GitHub 账户** - 代码需要托管在GitHub上
2. **Vercel 账户** - 登录 https://vercel.com
3. **Hugging Face Token** - 获取API密钥用于翻译服务
4. **Upstash Redis** - 用于缓存（可选但推荐）

## 快速部署步骤

### 1. 准备代码仓库

确保你的代码已推送到GitHub：

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2. 连接Vercel

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "New Project"
3. 选择你的GitHub仓库
4. 导入项目

### 3. 配置项目设置

在Vercel项目设置中配置：

**Framework Preset:** Next.js

**Build Settings:**
- Build Command: `cd frontend && npm run build`
- Output Directory: `frontend/.next`
- Install Command: `npm install && cd frontend && npm install`

### 4. 配置环境变量

在Vercel Dashboard中添加以下环境变量：

#### 🔑 必需变量

```bash
# 应用基础配置
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
NODE_ENV=production

# Hugging Face API (必需)
HUGGINGFACE_API_KEY=hf_your_token_here
HUGGINGFACE_API_URL=https://api-inference.huggingface.co/models
NLLB_MODEL=facebook/nllb-200-distilled-600M

# 安全配置 (必需)
JWT_SECRET=your-very-secure-jwt-secret-at-least-32-characters
ENCRYPTION_KEY=your-very-secure-encryption-key-32-chars
FILE_SERVICE_SECRET=your-production-secret-key
```

#### 🔧 缓存配置 (推荐)

```bash
# Vercel KV Redis
KV_REST_API_URL=https://your-endpoint.upstash.io
KV_REST_API_TOKEN=your_token_here
CACHE_TTL=3600
CACHE_MAX_SIZE=1000
```

#### 📧 可选服务

```bash
# 邮件服务 (可选)
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your_key_here
EMAIL_FROM=noreply@your-domain.com

# 数据库 (可选)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/loretrans
```

## 获取必需服务

### Hugging Face API Token

1. 访问 [Hugging Face](https://huggingface.co/)
2. 注册/登录账户
3. 去到 Settings → Access Tokens
4. 创建新的 token (Read权限即可)
5. 复制token到 `HUGGINGFACE_API_KEY`

### Upstash Redis (缓存)

1. 访问 [Upstash](https://upstash.com/)
2. 创建免费账户
3. 创建新的Redis数据库
4. 复制REST API URL和Token

### Resend邮件服务 (可选)

1. 访问 [Resend](https://resend.com/)
2. 创建账户并获取API密钥
3. 验证发送域名

## 部署流程

### 自动部署

每次推送到main分支会自动触发部署：

```bash
git add .
git commit -m "Update: feature description"
git push origin main
```

### 手动部署

在Vercel Dashboard中点击 "Deploy" 按钮重新部署。

## 验证部署

部署完成后，验证以下功能：

- [ ] 首页加载正常
- [ ] 翻译功能工作
- [ ] 各语言页面访问正常
- [ ] API endpoints响应正常
- [ ] 文档上传功能
- [ ] 联系表单

## 测试URL示例

```
https://your-app.vercel.app/
https://your-app.vercel.app/text-translate
https://your-app.vercel.app/creole-to-english
https://your-app.vercel.app/api/translate
https://your-app.vercel.app/api/health
```

## 域名配置

### 使用自定义域名

1. 在Vercel Dashboard中点击 "Domains"
2. 添加你的域名
3. 按照DNS配置指引设置
4. 更新 `NEXT_PUBLIC_APP_URL` 环境变量

## 监控和维护

### 性能监控

- Vercel Analytics 自动开启
- 查看 Core Web Vitals
- 监控API响应时间

### 日志查看

在Vercel Dashboard的 "Functions" 选项卡中查看：
- API 调用日志
- 错误日志
- 性能指标

### 扩容配置

根据使用量调整：
- 函数超时时间
- 内存分配
- 并发限制

## 故障排查

### 常见问题

**构建失败:**
- 检查包依赖是否正确
- 确认TypeScript编译无错误
- 查看构建日志详情

**API错误:**
- 验证环境变量设置
- 检查API密钥有效性
- 查看函数执行日志

**性能问题:**
- 启用缓存配置
- 优化图片和静态资源
- 检查数据库查询效率

### 联系支持

如遇问题，可通过以下方式获取帮助：
- Vercel Support: support@vercel.com
- GitHub Issues: [项目仓库](https://github.com/your-repo)
- 项目维护者: [联系信息]

## 成本估算

### Vercel计费

- **Hobby Plan (免费):**
  - 100GB带宽/月
  - 1000函数调用/天
  - 适合测试和轻量使用

- **Pro Plan ($20/月):**
  - 1TB带宽/月
  - 无限函数调用
  - 适合生产环境

### 第三方服务

- **Hugging Face:** 免费额度通常足够
- **Upstash Redis:** 免费10,000请求/天
- **Resend:** 免费100邮件/天

总体月成本: $0-50 (取决于使用量) 