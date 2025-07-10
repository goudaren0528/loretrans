#!/bin/bash

echo "🚀 启动测试服务器..."
echo ""

# 检查是否在正确的目录
if [ ! -d "frontend" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 进入前端目录
cd frontend

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

echo "🔧 启动开发服务器..."
echo ""
echo "📋 测试清单:"
echo "1. 访问 http://localhost:3000/english-to-lao"
echo "2. 检查语言选择器是否显示正确的文本 (不是 t('Common.select_language'))"
echo "3. 确认 'Translation Mode:' 选择器已隐藏"
echo "4. 测试翻译功能是否正常"
echo "5. 切换语言界面测试多语言支持"
echo ""
echo "🌍 其他测试页面:"
echo "- http://localhost:3000/english-to-swahili"
echo "- http://localhost:3000/english-to-burmese"
echo "- http://localhost:3000/english-to-telugu"
echo "- http://localhost:3000/english-to-creole"
echo ""
echo "按 Ctrl+C 停止服务器"
echo "=" * 50

# 启动开发服务器
npm run dev
