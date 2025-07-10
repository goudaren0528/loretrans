#!/bin/bash

echo "🚀 准备部署到 Vercel..."

# 检查是否安装了 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 安装 Vercel CLI..."
    npm install -g vercel
fi

# 检查是否已登录
echo "🔐 检查 Vercel 登录状态..."
if ! vercel whoami &> /dev/null; then
    echo "请先登录 Vercel:"
    vercel login
fi

# 确保构建成功
echo "🔨 运行构建检查..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败，请先修复构建错误"
    exit 1
fi

echo "✅ 构建成功！"

# 部署到 Vercel
echo "🚀 开始部署..."
vercel --prod

echo "🎉 部署完成！"
echo ""
echo "📋 后续步骤："
echo "1. 在 Vercel 仪表板中配置环境变量"
echo "2. 设置自定义域名（可选）"
echo "3. 配置数据库连接"
echo "4. 测试所有功能"
