# Vercel 部署指南

## 🚀 快速部署

### 方法 1: 使用部署脚本（推荐）
```bash
./deploy-vercel.sh
```

### 方法 2: 手动部署
```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录 Vercel
vercel login

# 3. 部署
vercel --prod
```

## 📋 环境变量配置

在 Vercel 仪表板中配置以下环境变量：

### 🔑 必需的环境变量

#### Supabase 配置
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

#### 认证配置
```
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
```

#### 翻译服务配置
```
NLLB_SERVICE_URL=https://wane0528-my-nllb-api.hf.space
HUGGINGFACE_API_TOKEN=your_huggingface_token (可选)
```

#### 支付服务配置
```
CREEM_API_KEY=your_creem_api_key
CREEM_WEBHOOK_SECRET=your_creem_webhook_secret
```

### 🔧 可选的环境变量

```
# 文件处理服务
FILE_PROCESSOR_URL=https://your-file-processor-url

# 开发模式
NODE_ENV=production

# 数据库配置
DATABASE_URL=your_database_connection_string

# 邮件服务
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password

# 分析服务
GOOGLE_ANALYTICS_ID=your_ga_id
```

## 🛠️ 部署后配置

### 1. 域名设置
- 在 Vercel 仪表板中添加自定义域名
- 更新 `NEXTAUTH_URL` 环境变量为你的域名

### 2. 数据库设置
- 确保 Supabase 项目已正确配置
- 运行数据库迁移（如果需要）
- 设置 RLS（行级安全）策略

### 3. 第三方服务配置
- 配置 Hugging Face API 访问
- 设置支付服务 webhook URL
- 配置邮件服务

### 4. 性能优化
- 启用 Vercel Analytics
- 配置 CDN 缓存策略
- 设置图片优化

## 🔍 部署验证

部署完成后，请验证以下功能：

### ✅ 基本功能检查
- [ ] 网站可以正常访问
- [ ] 多语言切换正常
- [ ] 用户注册/登录功能
- [ ] 翻译功能正常工作

### ✅ API 端点检查
- [ ] `/api/health` - 健康检查
- [ ] `/api/translate` - 翻译服务
- [ ] `/api/auth/*` - 认证服务
- [ ] `/api/credits/*` - 积分系统

### ✅ 数据库连接检查
- [ ] 用户数据存储
- [ ] 翻译历史记录
- [ ] 支付记录

## 🐛 常见问题解决

### 构建错误
```bash
# 本地测试构建
npm run build

# 检查 TypeScript 错误
npm run type-check

# 检查 ESLint 错误
npm run lint
```

### 环境变量问题
- 确保所有必需的环境变量都已设置
- 检查变量名称拼写
- 验证变量值的格式

### API 路由问题
- 检查 API 路由是否正确导出
- 验证动态路由配置
- 检查中间件配置

### 数据库连接问题
- 验证 Supabase 连接字符串
- 检查数据库权限设置
- 确认 RLS 策略配置

## 📊 监控和分析

### Vercel Analytics
```bash
# 启用 Vercel Analytics
npm install @vercel/analytics
```

### 错误监控
- 配置 Sentry 或其他错误监控服务
- 设置日志记录
- 监控 API 响应时间

### 性能监控
- 使用 Vercel Speed Insights
- 监控 Core Web Vitals
- 优化图片和资源加载

## 🔄 持续部署

### GitHub 集成
1. 连接 GitHub 仓库到 Vercel
2. 配置自动部署分支
3. 设置预览部署

### 部署钩子
```bash
# 设置部署钩子
curl -X POST "https://api.vercel.com/v1/integrations/deploy/your-hook-id"
```

## 📞 支持

如果遇到部署问题：
1. 检查 Vercel 部署日志
2. 查看浏览器控制台错误
3. 验证环境变量配置
4. 检查 API 端点响应

---

🎉 **部署成功后，你的翻译应用就可以在全球范围内访问了！**
