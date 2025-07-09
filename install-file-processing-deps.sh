#!/bin/bash

echo "🔧 安装文件处理依赖..."

cd frontend

# 安装PDF处理库
echo "📄 安装PDF.js..."
npm install pdfjs-dist

# 安装Word文档处理库 (可选)
echo "📝 安装Word文档处理库..."
npm install mammoth

# 安装文件类型检测库
echo "🔍 安装文件类型检测库..."
npm install file-type

# 安装文本编码检测库
echo "🔤 安装文本编码检测库..."
npm install jschardet

echo "✅ 依赖安装完成！"

echo ""
echo "📋 已安装的文件处理依赖:"
echo "  - pdfjs-dist: PDF文档文本提取"
echo "  - mammoth: Word文档处理"
echo "  - file-type: 文件类型检测"
echo "  - jschardet: 文本编码检测"

echo ""
echo "🚀 下一步:"
echo "1. 重启开发服务器: npm run dev"
echo "2. 测试文档上传功能"
