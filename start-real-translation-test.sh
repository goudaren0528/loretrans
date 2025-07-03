#!/bin/bash

# 真实翻译测试启动脚本
# 启动NLLB本地服务和前端服务，然后运行测试

set -e

echo "🚀 启动真实翻译测试环境"
echo "================================"

# 检查当前目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 检查Node.js和npm
if ! command -v node &> /dev/null; then
    echo "❌ 错误: Node.js 未安装"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ 错误: npm 未安装"
    exit 1
fi

# 检查环境配置
echo "🔍 检查环境配置..."
if [ ! -f ".env.local" ]; then
    echo "❌ 错误: .env.local 文件不存在"
    exit 1
fi

# 检查NLLB服务目录
if [ ! -d "microservices/nllb-local" ]; then
    echo "❌ 错误: NLLB服务目录不存在"
    exit 1
fi

# 安装依赖
echo "📦 检查和安装依赖..."

# 安装根目录依赖
if [ ! -d "node_modules" ]; then
    echo "⚙️ 安装根目录依赖..."
    npm install
fi

# 安装NLLB服务依赖
if [ ! -d "microservices/nllb-local/node_modules" ]; then
    echo "⚙️ 安装NLLB服务依赖..."
    cd microservices/nllb-local
    npm install
    cd ../..
fi

# 安装前端依赖
if [ ! -d "frontend/node_modules" ]; then
    echo "⚙️ 安装前端依赖..."
    cd frontend
    npm install
    cd ..
fi

# 创建日志目录
mkdir -p logs

# 函数：检查端口是否被占用
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # 端口被占用
    else
        return 1  # 端口空闲
    fi
}

# 函数：等待服务启动
wait_for_service() {
    local url=$1
    local name=$2
    local max_attempts=30
    local attempt=1
    
    echo "⏳ 等待 $name 启动..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            echo "✅ $name 启动成功"
            return 0
        fi
        
        echo "   尝试 $attempt/$max_attempts..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "❌ $name 启动超时"
    return 1
}

# 函数：清理进程
cleanup() {
    echo "🧹 清理进程..."
    
    # 杀死NLLB服务
    if [ ! -z "$NLLB_PID" ]; then
        kill $NLLB_PID 2>/dev/null || true
    fi
    
    # 杀死前端服务
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    # 杀死文件处理服务
    if [ ! -z "$FILE_SERVICE_PID" ]; then
        kill $FILE_SERVICE_PID 2>/dev/null || true
    fi
    
    exit 0
}

# 设置信号处理
trap cleanup SIGINT SIGTERM

# 检查端口占用
echo "🔍 检查端口占用..."
if check_port 8081; then
    echo "⚠️ 端口 8081 已被占用，尝试杀死占用进程..."
    lsof -ti:8081 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

if check_port 3000; then
    echo "⚠️ 端口 3000 已被占用，尝试杀死占用进程..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

if check_port 8000; then
    echo "⚠️ 端口 8000 已被占用，尝试杀死占用进程..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# 启动NLLB本地服务
echo "🤖 启动NLLB本地服务..."
cd microservices/nllb-local
nohup npm start > ../../logs/nllb-service.log 2>&1 &
NLLB_PID=$!
cd ../..

echo "   NLLB服务 PID: $NLLB_PID"

# 等待NLLB服务启动
if ! wait_for_service "http://localhost:8081/health" "NLLB服务"; then
    echo "❌ NLLB服务启动失败，查看日志: logs/nllb-service.log"
    cleanup
    exit 1
fi

# 启动文件处理服务
echo "📁 启动文件处理服务..."
cd microservices/file-processor
nohup npm start > ../../logs/file-service.log 2>&1 &
FILE_SERVICE_PID=$!
cd ../..

echo "   文件服务 PID: $FILE_SERVICE_PID"

# 启动前端服务
echo "🌐 启动前端服务..."
cd frontend
nohup npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo "   前端服务 PID: $FRONTEND_PID"

# 等待前端服务启动
if ! wait_for_service "http://localhost:3000" "前端服务"; then
    echo "❌ 前端服务启动失败，查看日志: logs/frontend.log"
    cleanup
    exit 1
fi

# 显示服务状态
echo ""
echo "✅ 所有服务启动成功！"
echo "================================"
echo "📊 服务状态:"
echo "   🤖 NLLB服务:     http://localhost:8081 (PID: $NLLB_PID)"
echo "   📁 文件服务:     http://localhost:8000 (PID: $FILE_SERVICE_PID)"
echo "   🌐 前端服务:     http://localhost:3000 (PID: $FRONTEND_PID)"
echo ""
echo "📋 日志文件:"
echo "   NLLB服务:       logs/nllb-service.log"
echo "   文件服务:       logs/file-service.log"
echo "   前端服务:       logs/frontend.log"
echo ""

# 等待一下确保服务完全启动
echo "⏳ 等待服务完全启动..."
sleep 5

# 运行测试
echo "🧪 开始运行真实翻译测试..."
echo "================================"

# 检查测试脚本是否存在
if [ ! -f "test-real-translation-flow.js" ]; then
    echo "❌ 错误: 测试脚本 test-real-translation-flow.js 不存在"
    cleanup
    exit 1
fi

# 运行测试
node test-real-translation-flow.js

# 测试完成后的选择
echo ""
echo "🎯 测试完成！"
echo "================================"
echo "选择操作:"
echo "1. 保持服务运行 (按 Enter)"
echo "2. 停止所有服务 (输入 'stop')"
echo "3. 查看服务日志 (输入 'logs')"

read -p "请选择: " choice

case $choice in
    "stop")
        cleanup
        ;;
    "logs")
        echo "📋 查看日志文件..."
        echo "================================"
        echo "NLLB服务日志 (最后20行):"
        tail -20 logs/nllb-service.log 2>/dev/null || echo "日志文件不存在"
        echo ""
        echo "前端服务日志 (最后20行):"
        tail -20 logs/frontend.log 2>/dev/null || echo "日志文件不存在"
        echo ""
        echo "文件服务日志 (最后20行):"
        tail -20 logs/file-service.log 2>/dev/null || echo "日志文件不存在"
        echo ""
        echo "按 Enter 继续..."
        read
        cleanup
        ;;
    *)
        echo "✅ 服务继续运行中..."
        echo "   要停止服务，请按 Ctrl+C"
        echo "   或运行: kill $NLLB_PID $FRONTEND_PID $FILE_SERVICE_PID"
        
        # 保持脚本运行
        while true; do
            sleep 10
            # 检查服务是否还在运行
            if ! kill -0 $NLLB_PID 2>/dev/null; then
                echo "⚠️ NLLB服务已停止"
                break
            fi
            if ! kill -0 $FRONTEND_PID 2>/dev/null; then
                echo "⚠️ 前端服务已停止"
                break
            fi
        done
        
        cleanup
        ;;
esac
