# Supabase环境变量部署指南

## 问题诊断
您遇到的 "Missing Supabase environment variables" 错误通常是因为部署平台没有正确读取环境变量。

## 解决方案

### 1. Vercel部署
如果您使用Vercel部署：

1. 登录Vercel Dashboard
2. 选择您的项目
3. 进入 Settings -> Environment Variables
4. 添加以下环境变量：

```
NEXT_PUBLIC_SUPABASE_URL=https://crhchsvaesipbifykbnp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyaGNoc3ZhZXNpcGJpZnlrYm5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2MjkxMjQsImV4cCI6MjA2NTIwNTEyNH0.Vi9DQkdTD9ZgjNfqYUN6Ngar1fPIIiycDsMDaGgaz0o
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyaGNoc3ZhZXNpcGJpZnlrYm5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTYyOTEyNCwiZXhwIjoyMDY1MjA1MTI0fQ.MzmkGXEe8vIrGaW9S0SqfbrUq3kmtu4Q9Piv2rlYK0I
```

5. 确保选择 "Production" 环境
6. 重新部署项目

### 2. Netlify部署
如果您使用Netlify：

1. 进入Site settings -> Environment variables
2. 添加上述环境变量
3. 重新部署

### 3. 其他平台
确保您的部署平台能够：
- 读取 .env.production 文件，或
- 支持手动设置环境变量

## 验证步骤

1. 部署后检查构建日志
2. 查找 "🔍 Supabase环境变量检查:" 输出
3. 确认所有变量都显示为 "SET"

## 常见问题

### Q: 为什么本地运行正常但部署失败？
A: 本地使用 .env.local 文件，部署时需要平台配置环境变量

### Q: 环境变量设置了但还是报错？
A: 检查变量名是否完全匹配，注意大小写和拼写

### Q: 如何调试环境变量问题？
A: 查看部署日志中的环境变量检查输出

## 联系支持
如果问题仍然存在，请提供：
1. 部署平台名称
2. 构建日志
3. 环境变量配置截图
