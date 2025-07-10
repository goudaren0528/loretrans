#!/bin/bash

echo "🚀 部署到现有的 Vercel 项目..."

# 检查是否在正确的目录
if [ ! -d "frontend" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 进入 frontend 目录
cd frontend

echo "📦 检查 frontend 目录的 package.json..."
if [ ! -f "package.json" ]; then
    echo "❌ 错误: frontend/package.json 不存在"
    exit 1
fi

echo "🔧 安装依赖..."
npm install

echo "🏗️ 测试构建..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败，请检查错误"
    exit 1
fi

echo "✅ 构建成功！"

echo "🚀 部署到 Vercel..."
# 使用现有项目的部署
vercel --prod --yes

echo "🎉 部署完成！"
echo ""
echo "📋 如果部署失败，请尝试："
echo "1. 在 Vercel 仪表板中设置根目录为 'frontend'"
echo "2. 或者手动从 frontend 目录部署: cd frontend && vercel --prod"
