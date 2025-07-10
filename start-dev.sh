#!/bin/bash

# Loretrans 开发环境启动脚本
# 统一启动前端和微服务的脚本

set -e  # 遇到错误时退出

echo "🚀 启动Loretrans开发环境..."

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 帮助信息
show_help() {
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help     显示帮助信息"
    echo "  -b, --background  后台运行服务"
    echo "  -f, --foreground  前台运行服务 (默认)"
    echo "  -s, --stop     停止所有服务"
    echo ""
    echo "示例:"
    echo "  $0              # 前台启动服务"
    echo "  $0 -b           # 后台启动服务"
    echo "  $0 --stop       # 停止所有服务"
}

# 停止服务函数
stop_services() {
    echo -e "${YELLOW}🛑 停止Loretrans开发环境...${NC}"
    
    # 从PID文件读取进程ID并停止
    if [ -f ".frontend.pid" ]; then
        FRONTEND_PID=$(cat .frontend.pid)
        if kill -0 $FRONTEND_PID 2>/dev/null; then
            echo "停止前端应用 (PID: $FRONTEND_PID)..."
            kill $FRONTEND_PID
        fi
        rm -f .frontend.pid
    fi

    if [ -f ".file-processor.pid" ]; then
        FILE_PROCESSOR_PID=$(cat .file-processor.pid)
        if kill -0 $FILE_PROCESSOR_PID 2>/dev/null; then
            echo "停止文件处理微服务 (PID: $FILE_PROCESSOR_PID)..."
            kill $FILE_PROCESSOR_PID
        fi
        rm -f .file-processor.pid
    fi

    # 强制停止相关进程
    echo "清理残留进程..."
    pkill -f "npm run dev" 2>/dev/null || true
    pkill -f "next dev" 2>/dev/null || true
    pkill -f "nodemon" 2>/dev/null || true

    sleep 2
    echo -e "${GREEN}✅ 所有服务已停止${NC}"
    exit 0
}

# 检查环境
check_environment() {
    echo -e "${YELLOW}📋 检查环境...${NC}"
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js 未安装${NC}"
        exit 1
    fi
    
    # 检查npm
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm 未安装${NC}"
        exit 1
    fi
    
    echo "Node.js: $(node --version)"
    echo "npm: $(npm --version)"
    
    # 检查环境配置
    if [ ! -f ".env.local" ]; then
        echo -e "${YELLOW}⚠️  环境配置文件 .env.local 不存在${NC}"
        echo "请确保已正确配置环境变量"
    else
        echo -e "${GREEN}✅ 环境配置文件存在${NC}"
    fi
}

# 启动服务函数
start_services() {
    local background_mode=$1
    
    # 创建日志目录
    mkdir -p logs
    
    # 停止可能存在的旧进程
    pkill -f "npm run dev" 2>/dev/null || true
    pkill -f "next dev" 2>/dev/null || true
    pkill -f "nodemon" 2>/dev/null || true
    sleep 2
    
    echo -e "${GREEN}🌟 启动服务...${NC}"
    
    # 启动文件处理微服务
    echo -e "${YELLOW}启动文件处理微服务 (端口 3010)...${NC}"
    cd microservices/file-processor
    if [ "$background_mode" = true ]; then
        PORT=3010 nohup npm run dev > ../../logs/file-processor.log 2>&1 &
    else
        PORT=3010 npm run dev > ../../logs/file-processor.log 2>&1 &
    fi
    FILE_PROCESSOR_PID=$!
    echo $FILE_PROCESSOR_PID > ../../.file-processor.pid
    cd ../..
    
    # 等待微服务启动
    sleep 3
    
    # 检查文件处理微服务状态
    echo -e "${YELLOW}检查文件处理微服务状态...${NC}"
    for i in {1..10}; do
        if curl -s http://localhost:3010/health > /dev/null 2>&1; then
            echo -e "${GREEN}✅ 文件处理微服务已启动${NC}"
            break
        else
            echo -e "${YELLOW}等待文件处理微服务启动... ($i/10)${NC}"
            sleep 2
        fi
        if [ $i -eq 10 ]; then
            echo -e "${RED}❌ 文件处理微服务启动失败${NC}"
            echo "检查日志: tail -f logs/file-processor.log"
            exit 1
        fi
    done
    
    # 启动前端应用
    echo -e "${YELLOW}启动前端应用 (端口 3000)...${NC}"
    cd frontend
    if [ "$background_mode" = true ]; then
        nohup npm run dev > ../logs/frontend.log 2>&1 &
    else
        npm run dev > ../logs/frontend.log 2>&1 &
    fi
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../.frontend.pid
    cd ..
    
    # 等待前端应用启动
    sleep 5
    
    # 检查前端应用状态
    echo -e "${YELLOW}检查前端应用状态...${NC}"
    for i in {1..15}; do
        if curl -s http://localhost:3000 > /dev/null 2>&1; then
            echo -e "${GREEN}✅ 前端应用已启动${NC}"
            break
        else
            echo -e "${YELLOW}等待前端应用启动... ($i/15)${NC}"
            sleep 2
        fi
        if [ $i -eq 15 ]; then
            echo -e "${RED}❌ 前端应用启动失败${NC}"
            echo "检查日志: tail -f logs/frontend.log"
            exit 1
        fi
    done
    
    # 显示服务状态
    show_status
    
    # 根据模式决定是否等待
    if [ "$background_mode" = true ]; then
        echo -e "${CYAN}服务已在后台启动${NC}"
        echo -e "${YELLOW}停止服务: $0 --stop${NC}"
    else
        echo -e "${CYAN}按 Ctrl+C 停止所有服务...${NC}"
        # 捕获中断信号
        trap 'echo -e "\n${YELLOW}正在停止服务...${NC}"; kill $FRONTEND_PID $FILE_PROCESSOR_PID 2>/dev/null; rm -f .frontend.pid .file-processor.pid; echo -e "${GREEN}服务已停止${NC}"; exit 0' INT
        # 保持脚本运行
        wait
    fi
}

# 显示服务状态
show_status() {
    echo ""
    echo -e "${GREEN}=== 服务状态 ===${NC}"
    echo ""
    
    # 检查服务状态
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}前端应用: 运行中 (http://localhost:3000)${NC}"
    else
        echo -e "${RED}前端应用: 失败${NC}"
    fi
    
    if curl -s http://localhost:3010/health > /dev/null 2>&1; then
        echo -e "${GREEN}文件处理微服务: 运行中 (http://localhost:3010)${NC}"
    else
        echo -e "${RED}文件处理微服务: 失败${NC}"
    fi
    
    echo ""
    echo -e "${CYAN}=== 访问链接 ===${NC}"
    echo -e "${CYAN}主页: http://localhost:3000${NC}"
    echo -e "${CYAN}文本翻译: http://localhost:3000/en/text-translate${NC}"
    echo -e "${CYAN}文档翻译: http://localhost:3000/en/document-translate${NC}"
    echo ""
    echo -e "${CYAN}=== API端点 ===${NC}"
    echo -e "${CYAN}前端API健康检查: http://localhost:3000/api/health${NC}"
    echo -e "${CYAN}文件处理微服务健康检查: http://localhost:3010/health${NC}"
    echo ""
    echo -e "${YELLOW}=== 管理命令 ===${NC}"
    echo "查看前端日志: tail -f logs/frontend.log"
    echo "查看微服务日志: tail -f logs/file-processor.log"
    echo "停止所有服务: $0 --stop"
    echo ""
}

# 解析命令行参数
BACKGROUND_MODE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -b|--background)
            BACKGROUND_MODE=true
            shift
            ;;
        -f|--foreground)
            BACKGROUND_MODE=false
            shift
            ;;
        -s|--stop)
            stop_services
            ;;
        *)
            echo "未知选项: $1"
            show_help
            exit 1
            ;;
    esac
done

# 主执行流程
check_environment
start_services $BACKGROUND_MODE
