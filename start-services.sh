#!/bin/bash

echo "🚀 启动翻译服务..."
echo "===================="

cd /home/hwt/translation-low-source

# 启动所有服务
./manage-services.sh start

echo ""
echo "🎯 服务访问地址:"
echo "📱 前端应用: http://localhost:3000"
echo "📄 文档翻译: http://localhost:3000/en/document-translate"
echo "🔧 文件处理器API: http://localhost:3010"

echo ""
echo "📋 管理命令:"
echo "查看状态: ./manage-services.sh status"
echo "查看日志: ./manage-services.sh logs"
echo "停止服务: ./manage-services.sh stop"
echo "重启服务: ./manage-services.sh restart"

echo ""
echo "✅ 所有服务已启动完成！"
