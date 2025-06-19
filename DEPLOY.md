# 🚀 快速部署到Vercel

## 方法一：使用Vercel Dashboard (推荐)

### 1. 准备GitHub仓库

确保代码已推送到GitHub：

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. 连接Vercel

1. 访问 [vercel.com](https://vercel.com) 并登录
2. 点击 "New Project"
3. 选择你的GitHub仓库 "low-source-translate"
4. 点击 "Import"

### 3. 配置项目设置

Vercel会自动检测到Next.js项目，但请确认：

- **Framework Preset:** Next.js
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

### 4. 设置环境变量

在Vercel项目设置中添加以下环境变量：

#### 🔑 必需变量
```
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
NODE_ENV=production
HUGGINGFACE_API_KEY=hf_your_token_here
JWT_SECRET=your-secure-jwt-secret-32-chars-minimum
ENCRYPTION_KEY=your-secure-encryption-key-32-chars
FILE_SERVICE_SECRET=your-file-service-secret
```

#### 📚 获取Hugging Face API Key
1. 注册 [huggingface.co](https://huggingface.co)
2. 去到 Settings → Access Tokens
3. 创建新token (Read权限)
4. 复制到环境变量

### 5. 部署

点击 "Deploy" - Vercel会自动：
- 安装依赖
- 构建项目
- 部署到CDN

## 方法二：使用命令行

### 1. 安装Vercel CLI

```bash
npm install -g vercel
```

### 2. 登录Vercel

```bash
vercel login
```

### 3. 部署

```bash
# Windows
.\scripts\deploy.ps1

# Linux/Mac
./scripts/deploy.sh

# 或者直接使用
vercel --prod
```

## 🔧 验证部署

部署成功后，测试以下URL：

- `https://your-app.vercel.app/` - 首页
- `https://your-app.vercel.app/text-translate` - 文本翻译
- `https://your-app.vercel.app/api/health` - API健康检查
- `https://your-app.vercel.app/creole-to-english` - 语言页面

## ⚡ 优化建议

### 1. 设置缓存 (可选)

添加Upstash Redis用于缓存：
```
KV_REST_API_URL=https://your-endpoint.upstash.io
KV_REST_API_TOKEN=your_token
```

### 2. 设置邮件服务 (可选)

添加Resend邮件服务：
```
RESEND_API_KEY=re_your_key
EMAIL_FROM=noreply@your-domain.com
```

### 3. 自定义域名

在Vercel Dashboard中：
1. 点击项目 → Settings → Domains
2. 添加你的域名
3. 按照DNS配置指引设置

## 🐛 常见问题

**构建失败？**
- 检查环境变量是否正确设置
- 确保所有依赖都在package.json中
- 查看Vercel构建日志

**API不工作？**
- 验证HUGGINGFACE_API_KEY是否有效
- 检查函数超时设置
- 查看函数执行日志

**性能问题？**
- 启用缓存配置
- 检查Core Web Vitals
- 优化图片和资源

## 📞 需要帮助？

- Vercel文档: [vercel.com/docs](https://vercel.com/docs)
- 项目Issues: GitHub Issues
- 邮件: 项目维护者邮箱

---

**成本估算：**
- Vercel Hobby (免费): 适合测试
- Vercel Pro ($20/月): 适合生产
- 总计: $0-50/月 (含第三方服务) 