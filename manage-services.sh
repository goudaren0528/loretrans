#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="/home/hwt/translation-low-source"
LOGS_DIR="$PROJECT_ROOT/logs"

# 确保日志目录存在
mkdir -p "$LOGS_DIR"

# 函数：显示服务状态
show_status() {
    echo -e "${BLUE}🔍 检查服务状态...${NC}\n"
    
    # 检查前端服务 (端口 3000)
    if ss -tulpn | grep -q ":3000"; then
        echo -e "${GREEN}✅ 前端服务 (Next.js) - 运行中 (端口 3000)${NC}"
    else
        echo -e "${RED}❌ 前端服务 (Next.js) - 未运行${NC}"
    fi
    
    # 检查文件处理器服务 (端口 3010)
    if ss -tulpn | grep -q ":3010"; then
        echo -e "${GREEN}✅ 文件处理器服务 - 运行中 (端口 3010)${NC}"
    else
        echo -e "${RED}❌ 文件处理器服务 - 未运行${NC}"
    fi
    
    echo ""
}

# 函数：启动前端服务
start_frontend() {
    echo -e "${YELLOW}🚀 启动前端服务...${NC}"
    cd "$PROJECT_ROOT/frontend"
    nohup npm run dev > "$LOGS_DIR/frontend.log" 2>&1 &
    echo $! > "$LOGS_DIR/frontend.pid"
    sleep 3
    if ss -tulpn | grep -q ":3000"; then
        echo -e "${GREEN}✅ 前端服务启动成功${NC}"
    else
        echo -e "${RED}❌ 前端服务启动失败，请检查日志${NC}"
    fi
}

# 函数：启动文件处理器服务
start_file_processor() {
    echo -e "${YELLOW}🚀 启动文件处理器服务...${NC}"
    cd "$PROJECT_ROOT/microservices/file-processor"
    nohup node src/index.js > "$LOGS_DIR/file-processor.log" 2>&1 &
    echo $! > "$LOGS_DIR/file-processor.pid"
    sleep 3
    if ss -tulpn | grep -q ":3010"; then
        echo -e "${GREEN}✅ 文件处理器服务启动成功${NC}"
    else
        echo -e "${RED}❌ 文件处理器服务启动失败，请检查日志${NC}"
    fi
}

# 函数：停止所有服务
stop_services() {
    echo -e "${YELLOW}🛑 停止所有服务...${NC}"
    
    # 停止前端服务
    if [ -f "$LOGS_DIR/frontend.pid" ]; then
        PID=$(cat "$LOGS_DIR/frontend.pid")
        if kill -0 "$PID" 2>/dev/null; then
            kill "$PID"
            echo -e "${GREEN}✅ 前端服务已停止${NC}"
        fi
        rm -f "$LOGS_DIR/frontend.pid"
    fi
    
    # 停止文件处理器服务
    if [ -f "$LOGS_DIR/file-processor.pid" ]; then
        PID=$(cat "$LOGS_DIR/file-processor.pid")
        if kill -0 "$PID" 2>/dev/null; then
            kill "$PID"
            echo -e "${GREEN}✅ 文件处理器服务已停止${NC}"
        fi
        rm -f "$LOGS_DIR/file-processor.pid"
    fi
    
    # 强制杀死相关进程
    pkill -f "next-server" 2>/dev/null || true
    pkill -f "node src/index.js" 2>/dev/null || true
    
    sleep 2
}

# 函数：重启所有服务
restart_services() {
    echo -e "${BLUE}🔄 重启所有服务...${NC}\n"
    stop_services
    sleep 2
    start_all_services
}

# 函数：启动所有服务
start_all_services() {
    echo -e "${BLUE}🚀 启动所有服务...${NC}\n"
    
    # 检查并启动前端服务
    if ! ss -tulpn | grep -q ":3000"; then
        start_frontend
    else
        echo -e "${GREEN}✅ 前端服务已在运行${NC}"
    fi
    
    echo ""
    
    # 检查并启动文件处理器服务
    if ! ss -tulpn | grep -q ":3010"; then
        start_file_processor
    else
        echo -e "${GREEN}✅ 文件处理器服务已在运行${NC}"
    fi
    
    echo ""
    show_status
}

# 函数：查看日志
show_logs() {
    echo -e "${BLUE}📋 最近的日志信息:${NC}\n"
    
    echo -e "${YELLOW}前端服务日志:${NC}"
    if [ -f "$LOGS_DIR/frontend.log" ]; then
        tail -10 "$LOGS_DIR/frontend.log"
    else
        echo "日志文件不存在"
    fi
    
    echo -e "\n${YELLOW}文件处理器服务日志:${NC}"
    if [ -f "$LOGS_DIR/file-processor.log" ]; then
        tail -10 "$LOGS_DIR/file-processor.log"
    else
        echo "日志文件不存在"
    fi
}

# 函数：测试服务
test_services() {
    echo -e "${BLUE}🧪 测试服务连接...${NC}\n"
    
    # 测试前端服务
    echo -e "${YELLOW}测试前端服务...${NC}"
    if curl -s -f "http://localhost:3000/api/detect" -X POST -H "Content-Type: application/json" -d '{"text":"test"}' > /dev/null; then
        echo -e "${GREEN}✅ 前端服务响应正常${NC}"
    else
        echo -e "${RED}❌ 前端服务响应异常${NC}"
    fi
    
    # 测试文件处理器服务
    echo -e "${YELLOW}测试文件处理器服务...${NC}"
    if curl -s -f "http://localhost:3010/health" > /dev/null; then
        echo -e "${GREEN}✅ 文件处理器服务响应正常${NC}"
    else
        echo -e "${RED}❌ 文件处理器服务响应异常${NC}"
    fi
}

# 主菜单
show_menu() {
    echo -e "${BLUE}📋 翻译服务管理器${NC}"
    echo -e "${BLUE}==================${NC}"
    echo "1. 查看服务状态"
    echo "2. 启动所有服务"
    echo "3. 停止所有服务"
    echo "4. 重启所有服务"
    echo "5. 查看日志"
    echo "6. 测试服务"
    echo "7. 退出"
    echo ""
}

# 主程序
case "$1" in
    "status")
        show_status
        ;;
    "start")
        start_all_services
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        restart_services
        ;;
    "logs")
        show_logs
        ;;
    "test")
        test_services
        ;;
    *)
        show_menu
        read -p "请选择操作 (1-7): " choice
        case $choice in
            1) show_status ;;
            2) start_all_services ;;
            3) stop_services ;;
            4) restart_services ;;
            5) show_logs ;;
            6) test_services ;;
            7) echo "退出"; exit 0 ;;
            *) echo "无效选择" ;;
        esac
        ;;
esac
