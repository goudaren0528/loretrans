#!/bin/bash

echo "🔍 检查开发服务器状态..."
echo ""

# 检查端口3000是否被占用
echo "📡 检查端口3000状态..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "✅ 端口3000正在被使用"
    
    # 显示占用端口的进程
    echo "🔍 端口3000被以下进程占用:"
    lsof -Pi :3000 -sTCP:LISTEN
    echo ""
    
    # 测试HTTP连接
    echo "🌐 测试HTTP连接..."
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
        echo "✅ HTTP连接正常 (200 OK)"
    else
        echo "⚠️  HTTP连接异常"
        echo "响应码: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)"
    fi
    
else
    echo "❌ 端口3000未被占用"
    echo ""
    echo "💡 启动开发服务器:"
    echo "   cd frontend"
    echo "   npm run dev"
    echo ""
    exit 1
fi

echo ""
echo "🧪 快速API测试..."

# 测试主要端点
endpoints=(
    "/"
    "/api/health"
    "/text-translate"
    "/document-translate"
    "/english-to-lao"
)

for endpoint in "${endpoints[@]}"; do
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$endpoint")
    if [ "$status_code" = "200" ]; then
        echo "✅ $endpoint - OK"
    else
        echo "❌ $endpoint - HTTP $status_code"
    fi
done

echo ""
echo "🎯 如果所有检查都通过，可以运行完整测试:"
echo "   ./test-apis-with-curl.sh"
