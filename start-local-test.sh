#!/bin/bash

# Loretrans 本地测试启动脚本 (使用 Hugging Face Space API)
# 无需Docker，无需本地AI模型，使用远程翻译服务

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${CYAN}🚀 启动Loretrans本地测试环境${NC}"
echo -e "${CYAN}使用 Hugging Face Space API${NC}"
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

echo -e "${GREEN}✅ Node.js: $(node --version)${NC}"
echo -e "${GREEN}✅ npm: $(npm --version)${NC}"

# 检查环境配置
echo -e "${YELLOW}🔍 检查环境配置...${NC}"
if [ ! -f ".env.local" ]; then
    echo -e "${RED}❌ 错误: .env.local 文件不存在${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 环境配置文件存在${NC}"
echo -e "${GREEN}✅ 使用 Hugging Face Space API: https://wane0528-my-nllb-api.hf.space${NC}"

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
    
    # 杀死前端服务
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    # 杀死文件处理服务
    if [ ! -z "$FILE_SERVICE_PID" ]; then
        kill $FILE_SERVICE_PID 2>/dev/null || true
    fi
    
    # 清理PID文件
    rm -f .frontend.pid .file-service.pid
    
    exit 0
}

# 设置信号处理
trap cleanup SIGINT SIGTERM

# 检查端口占用
echo -e "${YELLOW}🔍 检查端口占用...${NC}"
ports=(3000 8000)
for port in "${ports[@]}"; do
    if check_port $port; then
        echo -e "${YELLOW}⚠️ 端口 $port 已被占用，尝试杀死占用进程...${NC}"
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
done

echo -e "${CYAN}🎯 启动服务...${NC}"
echo -e "${CYAN}=================${NC}"

# 1. 启动文件处理服务
echo -e "${BLUE}📁 启动文件处理服务 (端口 8000)...${NC}"
cd microservices/file-processor
nohup npm start > ../../logs/file-service.log 2>&1 &
FILE_SERVICE_PID=$!
cd ../..

echo -e "${GREEN}   文件服务 PID: $FILE_SERVICE_PID${NC}"
echo "$FILE_SERVICE_PID" > .file-service.pid

# 等待文件处理服务启动
if ! wait_for_service "http://localhost:8000/health" "文件处理服务"; then
    echo -e "${YELLOW}⚠️ 文件处理服务启动失败，但继续启动前端服务${NC}"
fi

# 2. 启动前端服务
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
echo -e "${GREEN}✅ 本地测试环境启动成功！${NC}"
echo -e "${GREEN}================================${NC}"
echo -e "${CYAN}📊 服务状态:${NC}"
echo -e "${GREEN}   🌐 前端服务:     http://localhost:3000 (PID: $FRONTEND_PID)${NC}"
echo -e "${GREEN}   📁 文件服务:     http://localhost:8000 (PID: $FILE_SERVICE_PID)${NC}"
echo -e "${GREEN}   🤖 翻译服务:     Hugging Face Space API (远程)${NC}"
echo ""
echo -e "${CYAN}📋 日志文件:${NC}"
echo -e "${CYAN}   前端服务:       logs/frontend.log${NC}"
echo -e "${CYAN}   文件服务:       logs/file-service.log${NC}"
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
echo -e "${CYAN}   文件服务健康:   http://localhost:8000/health${NC}"
echo -e "${CYAN}   翻译API:        http://localhost:3000/api/translate${NC}"
echo ""

# 等待一下确保服务完全启动
echo -e "${YELLOW}⏳ 等待服务完全启动...${NC}"
sleep 5

# 运行基础测试
echo -e "${BLUE}🧪 运行基础服务测试...${NC}"
echo -e "${BLUE}================================${NC}"

# 测试前端API
echo -e "${YELLOW}测试前端API...${NC}"
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 前端API正常${NC}"
else
    echo -e "${RED}❌ 前端API测试失败${NC}"
fi

# 测试文件服务
echo -e "${YELLOW}测试文件处理服务...${NC}"
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 文件处理服务正常${NC}"
else
    echo -e "${RED}❌ 文件处理服务测试失败${NC}"
fi

# 测试Hugging Face Space API连接
echo -e "${YELLOW}测试Hugging Face Space翻译服务...${NC}"
if curl -s -m 10 https://wane0528-my-nllb-api.hf.space > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Hugging Face Space API连接正常${NC}"
else
    echo -e "${YELLOW}⚠️ Hugging Face Space API连接测试超时（正常现象）${NC}"
fi

echo ""
echo -e "${GREEN}🎯 本地测试环境启动完成！${NC}"
echo -e "${GREEN}================================${NC}"

# 询问是否运行完整测试
echo -e "${YELLOW}选择操作:${NC}"
echo -e "${YELLOW}1. 开始手动测试验收 (按 Enter)${NC}"
echo -e "${YELLOW}2. 停止所有服务 (输入 'stop')${NC}"
echo -e "${YELLOW}3. 查看服务日志 (输入 'logs')${NC}"

read -p "请选择: " choice

case $choice in
    "stop")
        cleanup
        ;;
    "logs")
        echo -e "${CYAN}📋 查看服务日志...${NC}"
        echo -e "${CYAN}================================${NC}"
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
        echo -e "${GREEN}✅ 服务继续运行中，开始手动测试验收...${NC}"
        echo -e "${CYAN}   要停止服务，请按 Ctrl+C${NC}"
        echo ""
        echo -e "${YELLOW}💡 测试验收清单:${NC}"
        echo -e "${YELLOW}   ✓ 访问主页: http://localhost:3000${NC}"
        echo -e "${YELLOW}   ✓ 用户注册和登录流程${NC}"
        echo -e "${YELLOW}   ✓ 文本翻译功能测试${NC}"
        echo -e "${YELLOW}   ✓ 文档上传翻译测试${NC}"
        echo -e "${YELLOW}   ✓ 积分系统和扣减机制${NC}"
        echo -e "${YELLOW}   ✓ 翻译历史查看${NC}"
        echo -e "${YELLOW}   ✓ 移动端响应式测试${NC}"
        echo -e "${YELLOW}   ✓ 错误处理和恢复机制${NC}"
        echo ""
        
        # 保持脚本运行
        while true; do
            sleep 10
            # 检查服务是否还在运行
            if ! kill -0 $FRONTEND_PID 2>/dev/null; then
                echo -e "${RED}⚠️ 前端服务已停止${NC}"
                break
            fi
            if ! kill -0 $FILE_SERVICE_PID 2>/dev/null; then
                echo -e "${RED}⚠️ 文件服务已停止${NC}"
                break
            fi
        done
        
        cleanup
        ;;
esac
