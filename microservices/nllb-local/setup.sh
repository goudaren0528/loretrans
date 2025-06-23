#!/bin/bash

# NLLB Local Service Setup Script
# 用于快速设置和启动NLLB本地翻译服务

set -e

echo "🚀 NLLB Local Service Setup"
echo "=========================="

# 检查Node.js版本
echo "Checking Node.js version..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'.' -f1 | sed 's/v//')
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# 检查内存
echo "Checking system memory..."
MEMORY_GB=$(free -g | awk '/^Mem:/{print $2}')
if [ "$MEMORY_GB" -lt 4 ]; then
    echo "⚠️  Warning: System has only ${MEMORY_GB}GB RAM. 4GB+ recommended for stable operation."
else
    echo "✅ System memory: ${MEMORY_GB}GB"
fi

# 进入项目目录
cd "$(dirname "$0")"
echo "Working directory: $(pwd)"

# 安装依赖
echo "Installing dependencies..."
npm install

# 设置环境变量
if [ ! -f .env ]; then
    echo "Setting up environment variables..."
    cp .env.example .env
    echo "✅ Created .env file. Please review and update as needed."
fi

# 创建必要目录
echo "Creating directories..."
mkdir -p models downloads temp logs
echo "✅ Directories created"

# 询问是否下载模型
echo ""
read -p "Do you want to download the NLLB 600M model now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Downloading NLLB model... (This may take a while)"
    npm run download-model
    echo "✅ Model downloaded successfully"
else
    echo "⏭️  Model download skipped. Run 'npm run download-model' later."
fi

# 运行测试
echo ""
read -p "Do you want to run tests to verify the setup? (Y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    echo "Starting service for testing..."
    npm run dev &
    SERVICE_PID=$!
    
    echo "Waiting for service to start..."
    sleep 10
    
    echo "Running tests..."
    npm test
    
    echo "Stopping test service..."
    kill $SERVICE_PID
    wait $SERVICE_PID 2>/dev/null || true
else
    echo "⏭️  Tests skipped"
fi

echo ""
echo "🎉 Setup complete!"
echo "=========================="
echo "To start the service:"
echo "  Development: npm run dev"
echo "  Production:  npm start"
echo ""
echo "Service will be available at: http://localhost:8080"
echo "Health check: curl http://localhost:8080/health"
echo ""
echo "Docker deployment:"
echo "  cd docker && docker-compose up -d"
echo ""
echo "For more information, see README.md" 