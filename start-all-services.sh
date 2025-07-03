#!/bin/bash

# Transly 完整服务启动脚本
# 启动所有必要的服务：前端、文件处理、NLLB翻译服务

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${CYAN}🚀 启动Transly完整服务环境${NC}"
echo -e "${CYAN}================================${NC}"

# 检查当前目录
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ 错误: 请在项目根目录运行此脚本${NC}"
    exit 1
fi

# 检查Node.js和npm
echo -e "${YELLOW}🔍 检查环境...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ 错误: Node.js 未安装${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ 错误: npm 未安装${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js: $(node --version)${NC}"
echo -e "${GREEN}✅ npm: $(npm --version)${NC}"

# 检查环境配置
echo -e "${YELLOW}🔍 检查环境配置...${NC}"
if [ ! -f ".env.local" ]; then
    echo -e "${RED}❌ 错误: .env.local 文件不存在${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 环境配置文件存在${NC}"

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
    
    echo -e "${YELLOW}⏳ 等待 $name 启动...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ $name 启动成功${NC}"
            return 0
        fi
        
        echo -e "${YELLOW}   尝试 $attempt/$max_attempts...${NC}"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}❌ $name 启动超时${NC}"
    return 1
}

# 函数：清理进程
cleanup() {
    echo -e "${YELLOW}🧹 清理进程...${NC}"
    
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
    
    # 清理PID文件
    rm -f .nllb.pid .frontend.pid .file-service.pid
    
    exit 0
}

# 设置信号处理
trap cleanup SIGINT SIGTERM

# 安装依赖
echo -e "${YELLOW}📦 检查和安装依赖...${NC}"

# 安装根目录依赖
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚙️ 安装根目录依赖...${NC}"
    npm install
fi

# 安装NLLB服务依赖
if [ ! -d "microservices/nllb-local/node_modules" ]; then
    echo -e "${YELLOW}⚙️ 安装NLLB服务依赖...${NC}"
    cd microservices/nllb-local
    npm install
    cd ../..
fi

# 安装前端依赖
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}⚙️ 安装前端依赖...${NC}"
    cd frontend
    npm install
    cd ..
fi

# 安装文件处理服务依赖
if [ ! -d "microservices/file-processor/node_modules" ]; then
    echo -e "${YELLOW}⚙️ 安装文件处理服务依赖...${NC}"
    cd microservices/file-processor
    npm install
    cd ../..
fi

# 检查端口占用
echo -e "${YELLOW}🔍 检查端口占用...${NC}"
ports=(8081 3000 8000)
for port in "${ports[@]}"; do
    if check_port $port; then
        echo -e "${YELLOW}⚠️ 端口 $port 已被占用，尝试杀死占用进程...${NC}"
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
done

echo -e "${CYAN}🎯 启动服务...${NC}"
echo -e "${CYAN}=================${NC}"

# 1. 启动NLLB本地服务
echo -e "${BLUE}🤖 启动NLLB本地服务 (端口 8081)...${NC}"
cd microservices/nllb-local
nohup npm start > ../../logs/nllb-service.log 2>&1 &
NLLB_PID=$!
cd ../..

echo -e "${GREEN}   NLLB服务 PID: $NLLB_PID${NC}"
echo "$NLLB_PID" > .nllb.pid

# 等待NLLB服务启动
if ! wait_for_service "http://localhost:8081/health" "NLLB服务"; then
    echo -e "${RED}❌ NLLB服务启动失败，查看日志: logs/nllb-service.log${NC}"
    cleanup
    exit 1
fi

# 2. 启动文件处理服务
echo -e "${BLUE}📁 启动文件处理服务 (端口 8000)...${NC}"
cd microservices/file-processor
nohup npm start > ../../logs/file-service.log 2>&1 &
FILE_SERVICE_PID=$!
cd ../..

echo -e "${GREEN}   文件服务 PID: $FILE_SERVICE_PID${NC}"
echo "$FILE_SERVICE_PID" > .file-service.pid

# 等待文件处理服务启动
if ! wait_for_service "http://localhost:8000/health" "文件处理服务"; then
    echo -e "${YELLOW}⚠️ 文件处理服务启动失败，但继续启动其他服务${NC}"
fi

# 3. 启动前端服务
echo -e "${BLUE}🌐 启动前端服务 (端口 3000)...${NC}"
cd frontend
nohup npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo -e "${GREEN}   前端服务 PID: $FRONTEND_PID${NC}"
echo "$FRONTEND_PID" > .frontend.pid

# 等待前端服务启动
if ! wait_for_service "http://localhost:3000" "前端服务"; then
    echo -e "${RED}❌ 前端服务启动失败，查看日志: logs/frontend.log${NC}"
    cleanup
    exit 1
fi

# 显示服务状态
echo ""
echo -e "${GREEN}✅ 所有服务启动成功！${NC}"
echo -e "${GREEN}================================${NC}"
echo -e "${CYAN}📊 服务状态:${NC}"
echo -e "${GREEN}   🤖 NLLB服务:     http://localhost:8081 (PID: $NLLB_PID)${NC}"
echo -e "${GREEN}   📁 文件服务:     http://localhost:8000 (PID: $FILE_SERVICE_PID)${NC}"
echo -e "${GREEN}   🌐 前端服务:     http://localhost:3000 (PID: $FRONTEND_PID)${NC}"
echo ""
echo -e "${CYAN}📋 日志文件:${NC}"
echo -e "${CYAN}   NLLB服务:       logs/nllb-service.log${NC}"
echo -e "${CYAN}   文件服务:       logs/file-service.log${NC}"
echo -e "${CYAN}   前端服务:       logs/frontend.log${NC}"
echo ""
echo -e "${CYAN}🌟 快速访问链接:${NC}"
echo -e "${CYAN}   主页:           http://localhost:3000${NC}"
echo -e "${CYAN}   文本翻译:       http://localhost:3000/en/text-translate${NC}"
echo -e "${CYAN}   文档翻译:       http://localhost:3000/en/document-translate${NC}"
echo -e "${CYAN}   用户登录:       http://localhost:3000/auth/signin${NC}"
echo -e "${CYAN}   用户注册:       http://localhost:3000/auth/signup${NC}"
echo -e "${CYAN}   定价页面:       http://localhost:3000/en/pricing${NC}"
echo ""
echo -e "${CYAN}🔧 API端点:${NC}"
echo -e "${CYAN}   前端API健康:    http://localhost:3000/api/health${NC}"
echo -e "${CYAN}   NLLB健康检查:   http://localhost:8081/health${NC}"
echo -e "${CYAN}   文件服务健康:   http://localhost:8000/health${NC}"
echo ""

# 等待一下确保服务完全启动
echo -e "${YELLOW}⏳ 等待服务完全启动...${NC}"
sleep 5

# 运行基础测试
echo -e "${BLUE}🧪 运行基础服务测试...${NC}"
echo -e "${BLUE}================================${NC}"

# 测试NLLB服务
echo -e "${YELLOW}测试NLLB翻译服务...${NC}"
if curl -s -X POST http://localhost:8081/translate \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world","sourceLanguage":"en","targetLanguage":"ht"}' > /tmp/nllb_test.json 2>/dev/null; then
    echo -e "${GREEN}✅ NLLB翻译服务正常${NC}"
    if command -v jq &> /dev/null; then
        echo -e "${CYAN}   翻译结果: $(cat /tmp/nllb_test.json | jq -r '.translatedText')${NC}"
    fi
else
    echo -e "${RED}❌ NLLB翻译服务测试失败${NC}"
fi

# 测试前端API
echo -e "${YELLOW}测试前端API...${NC}"
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 前端API正常${NC}"
else
    echo -e "${RED}❌ 前端API测试失败${NC}"
fi

echo ""
echo -e "${GREEN}🎯 服务启动完成！${NC}"
echo -e "${GREEN}================================${NC}"

# 询问是否运行完整测试
echo -e "${YELLOW}选择操作:${NC}"
echo -e "${YELLOW}1. 运行完整翻译和积分测试 (输入 'test')${NC}"
echo -e "${YELLOW}2. 保持服务运行 (按 Enter)${NC}"
echo -e "${YELLOW}3. 停止所有服务 (输入 'stop')${NC}"
echo -e "${YELLOW}4. 查看服务日志 (输入 'logs')${NC}"

read -p "请选择: " choice

case $choice in
    "test")
        echo -e "${BLUE}🧪 开始运行完整翻译和积分测试...${NC}"
        echo -e "${BLUE}================================${NC}"
        
        # 检查测试脚本是否存在
        if [ -f "test-real-translation-flow.js" ]; then
            node test-real-translation-flow.js
        else
            echo -e "${RED}❌ 测试脚本不存在: test-real-translation-flow.js${NC}"
        fi
        ;;
    "stop")
        cleanup
        ;;
    "logs")
        echo -e "${CYAN}📋 查看服务日志...${NC}"
        echo -e "${CYAN}================================${NC}"
        echo -e "${YELLOW}NLLB服务日志 (最后20行):${NC}"
        tail -20 logs/nllb-service.log 2>/dev/null || echo "日志文件不存在"
        echo ""
        echo -e "${YELLOW}前端服务日志 (最后20行):${NC}"
        tail -20 logs/frontend.log 2>/dev/null || echo "日志文件不存在"
        echo ""
        echo -e "${YELLOW}文件服务日志 (最后20行):${NC}"
        tail -20 logs/file-service.log 2>/dev/null || echo "日志文件不存在"
        echo ""
        echo -e "${YELLOW}按 Enter 继续...${NC}"
        read
        cleanup
        ;;
    *)
        echo -e "${GREEN}✅ 服务继续运行中...${NC}"
        echo -e "${CYAN}   要停止服务，请按 Ctrl+C${NC}"
        echo -e "${CYAN}   或运行: kill $NLLB_PID $FRONTEND_PID $FILE_SERVICE_PID${NC}"
        echo ""
        echo -e "${YELLOW}💡 使用提示:${NC}"
        echo -e "${YELLOW}   - 访问 http://localhost:3000 开始使用${NC}"
        echo -e "${YELLOW}   - 注册账户测试完整流程${NC}"
        echo -e "${YELLOW}   - 测试翻译和积分扣减功能${NC}"
        echo ""
        
        # 保持脚本运行
        while true; do
            sleep 10
            # 检查服务是否还在运行
            if ! kill -0 $NLLB_PID 2>/dev/null; then
                echo -e "${RED}⚠️ NLLB服务已停止${NC}"
                break
            fi
            if ! kill -0 $FRONTEND_PID 2>/dev/null; then
                echo -e "${RED}⚠️ 前端服务已停止${NC}"
                break
            fi
        done
        
        cleanup
        ;;
esac
