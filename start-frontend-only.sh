#!/bin/bash

# 简单的前端启动脚本 - 用于测试积分修复

echo "🚀 启动前端服务 (仅前端，用于测试积分修复)..."

# 检查环境
if [ ! -f "frontend/package.json" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 进入前端目录
cd frontend

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装前端依赖..."
    npm install
fi

echo "🌐 启动前端开发服务器..."
echo "📋 测试积分修复:"
echo "   1. 打开 http://localhost:3000"
echo "   2. 登录用户账户"
echo "   3. 打开浏览器开发者工具"
echo "   4. 上传文档进行翻译"
echo "   5. 观察控制台日志"
echo ""
echo "🔍 预期看到的日志:"
echo "   [useCredits] 查询到用户积分: 5500"
echo "   [Document Translator] Component mounted, refreshing credits"
echo "   [Document Translation] Real-time credit check: { currentCredits: 5500 }"
echo ""
echo "按 Ctrl+C 停止服务"
echo ""

# 启动开发服务器
npm run dev
