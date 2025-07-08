#!/bin/bash

# Loretrans Vercel 部署脚本

echo "🚀 开始部署Loretrans到Vercel..."

# 检查必要文件
if [ ! -f "vercel.json" ]; then
    echo "❌ 缺少vercel.json配置文件"
    exit 1
fi

if [ ! -f "frontend/package.json" ]; then
    echo "❌ 缺少frontend/package.json"
    exit 1
fi

# 检查Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 安装Vercel CLI..."
    npm install -g vercel
fi

# 清理和构建
echo "🧹 清理构建缓存..."
rm -rf frontend/.next
rm -rf frontend/node_modules/.cache

# 安装依赖
echo "📦 安装依赖..."
cd frontend
npm install

# 运行linting (警告)
echo "🔍 代码检查..."
npm run lint || echo "⚠️ 发现lint警告，继续部署..."

# 本地构建测试
echo "🔨 本地构建测试..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 本地构建失败，停止部署"
    exit 1
fi

echo "✅ 本地构建成功"

# 返回根目录
cd ..

# 部署到Vercel
echo "🚀 部署到Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo "🎉 部署成功！"
    echo "📍 请检查Vercel Dashboard查看部署URL"
else
    echo "❌ 部署失败，请检查错误信息"
    exit 1
fi 