#!/bin/bash

# =============================================
# Loretrans 增强版开发启动脚本
# 用途: 启动所有开发服务并进行健康检查
# 版本: 2.0
# 更新时间: 2025-01-03
# =============================================

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

# 检查依赖
check_dependencies() {
    log_step "检查系统依赖..."
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装，请先安装 Node.js"
        exit 1
    fi
    
    # 检查 Python
    if ! command -v python3 &> /dev/null; then
        log_error "Python3 未安装，请先安装 Python3"
        exit 1
    fi
    
    # 检查 Docker (可选)
    if command -v docker &> /dev/null; then
        log_success "Docker 已安装"
    else
        log_warning "Docker 未安装，将跳过容器化服务"
    fi
    
    log_success "依赖检查完成"
}

# 检查环境变量
check_environment() {
    log_step "检查环境变量..."
    
    # 检查前端环境变量
    if [ ! -f "frontend/.env.local" ]; then
        log_warning "frontend/.env.local 不存在，正在创建..."
        cp frontend/.env.example frontend/.env.local 2>/dev/null || log_warning "无法创建 .env.local"
    fi
    
    # 检查关键环境变量
    if [ -f "frontend/.env.local" ]; then
        source frontend/.env.local
        
        if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
            log_error "NEXT_PUBLIC_SUPABASE_URL 未设置"
            exit 1
        fi
        
        if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
            log_error "NEXT_PUBLIC_SUPABASE_ANON_KEY 未设置"
            exit 1
        fi
        
        log_success "环境变量检查完成"
    else
        log_error "无法读取环境变量文件"
        exit 1
    fi
}

# 安装依赖
install_dependencies() {
    log_step "安装项目依赖..."
    
    # 前端依赖
    if [ -d "frontend" ]; then
        log_info "安装前端依赖..."
        cd frontend
        if [ -f "package-lock.json" ]; then
            npm ci
        else
            npm install
        fi
        cd ..
        log_success "前端依赖安装完成"
    fi
    
    # NLLB 服务依赖
    if [ -d "microservices/nllb-local" ]; then
        log_info "安装 NLLB 服务依赖..."
        cd microservices/nllb-local
        if [ -f "requirements.txt" ]; then
            python3 -m pip install -r requirements.txt
        fi
        cd ../..
        log_success "NLLB 服务依赖安装完成"
    fi
    
    # 文件处理服务依赖
    if [ -d "microservices/file-processor" ]; then
        log_info "安装文件处理服务依赖..."
        cd microservices/file-processor
        if [ -f "requirements.txt" ]; then
            python3 -m pip install -r requirements.txt
        fi
        cd ../..
        log_success "文件处理服务依赖安装完成"
    fi
}

# 数据库迁移
run_migrations() {
    log_step "运行数据库迁移..."
    
    if [ -d "supabase/migrations" ]; then
        log_info "发现数据库迁移文件"
        # 这里可以添加 Supabase CLI 迁移命令
        # supabase db push
        log_warning "请手动运行数据库迁移: supabase db push"
    fi
}

# 启动服务
start_services() {
    log_step "启动开发服务..."
    
    # 创建日志目录
    mkdir -p logs
    
    # 启动 NLLB 服务
    if [ -d "microservices/nllb-local" ]; then
        log_info "启动 NLLB 翻译服务..."
        cd microservices/nllb-local
        python3 app.py > ../../logs/nllb.log 2>&1 &
        NLLB_PID=$!
        echo $NLLB_PID > ../../logs/nllb.pid
        cd ../..
        log_success "NLLB 服务已启动 (PID: $NLLB_PID)"
    fi
    
    # 启动文件处理服务
    if [ -d "microservices/file-processor" ]; then
        log_info "启动文件处理服务..."
        cd microservices/file-processor
        python3 app.py > ../../logs/file-processor.log 2>&1 &
        FILE_PROCESSOR_PID=$!
        echo $FILE_PROCESSOR_PID > ../../logs/file-processor.pid
        cd ../..
        log_success "文件处理服务已启动 (PID: $FILE_PROCESSOR_PID)"
    fi
    
    # 等待后端服务启动
    log_info "等待后端服务启动..."
    sleep 5
    
    # 启动前端服务
    if [ -d "frontend" ]; then
        log_info "启动前端开发服务..."
        cd frontend
        npm run dev > ../logs/frontend.log 2>&1 &
        FRONTEND_PID=$!
        echo $FRONTEND_PID > ../logs/frontend.pid
        cd ..
        log_success "前端服务已启动 (PID: $FRONTEND_PID)"
    fi
}

# 健康检查
health_check() {
    log_step "执行服务健康检查..."
    
    # 等待服务完全启动
    sleep 10
    
    # 检查 NLLB 服务
    if curl -s http://localhost:8081/health > /dev/null 2>&1; then
        log_success "NLLB 服务健康检查通过"
    else
        log_warning "NLLB 服务健康检查失败"
    fi
    
    # 检查文件处理服务
    if curl -s http://localhost:8082/health > /dev/null 2>&1; then
        log_success "文件处理服务健康检查通过"
    else
        log_warning "文件处理服务健康检查失败"
    fi
    
    # 检查前端服务
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        log_success "前端服务健康检查通过"
    else
        log_warning "前端服务健康检查失败"
    fi
}

# 显示服务状态
show_status() {
    log_step "服务状态总览"
    
    echo -e "${CYAN}================================${NC}"
    echo -e "${CYAN}    Loretrans 开发环境已启动    ${NC}"
    echo -e "${CYAN}================================${NC}"
    echo ""
    echo -e "${GREEN}🌐 前端服务:${NC}     http://localhost:3000"
    echo -e "${GREEN}🤖 NLLB服务:${NC}     http://localhost:8081"
    echo -e "${GREEN}📄 文件处理:${NC}     http://localhost:8082"
    echo ""
    echo -e "${YELLOW}📋 管理命令:${NC}"
    echo -e "  查看日志: tail -f logs/frontend.log"
    echo -e "  停止服务: ./stop-dev.sh"
    echo -e "  重启服务: ./restart-dev.sh"
    echo ""
    echo -e "${BLUE}🔧 开发工具:${NC}"
    echo -e "  数据库: Supabase Dashboard"
    echo -e "  API测试: http://localhost:3000/api/health"
    echo -e "  翻译测试: http://localhost:3000/text-translate"
    echo ""
    echo -e "${PURPLE}📊 监控信息:${NC}"
    echo -e "  日志目录: ./logs/"
    echo -e "  PID文件: ./logs/*.pid"
    echo ""
}

# 创建停止脚本
create_stop_script() {
    cat > stop-dev.sh << 'EOF'
#!/bin/bash

# 停止所有开发服务

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_info "停止 Loretrans 开发服务..."

# 停止前端服务
if [ -f "logs/frontend.pid" ]; then
    PID=$(cat logs/frontend.pid)
    if kill -0 $PID 2>/dev/null; then
        kill $PID
        log_info "前端服务已停止 (PID: $PID)"
    fi
    rm -f logs/frontend.pid
fi

# 停止 NLLB 服务
if [ -f "logs/nllb.pid" ]; then
    PID=$(cat logs/nllb.pid)
    if kill -0 $PID 2>/dev/null; then
        kill $PID
        log_info "NLLB 服务已停止 (PID: $PID)"
    fi
    rm -f logs/nllb.pid
fi

# 停止文件处理服务
if [ -f "logs/file-processor.pid" ]; then
    PID=$(cat logs/file-processor.pid)
    if kill -0 $PID 2>/dev/null; then
        kill $PID
        log_info "文件处理服务已停止 (PID: $PID)"
    fi
    rm -f logs/file-processor.pid
fi

# 清理端口
log_info "清理端口占用..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:8081 | xargs kill -9 2>/dev/null || true
lsof -ti:8082 | xargs kill -9 2>/dev/null || true

log_info "所有服务已停止"
EOF

    chmod +x stop-dev.sh
}

# 创建重启脚本
create_restart_script() {
    cat > restart-dev.sh << 'EOF'
#!/bin/bash

echo "重启 Loretrans 开发环境..."

# 停止现有服务
./stop-dev.sh

# 等待服务完全停止
sleep 3

# 重新启动
./start-dev-enhanced.sh
EOF

    chmod +x restart-dev.sh
}

# 主函数
main() {
    echo -e "${CYAN}"
    echo "========================================"
    echo "    Loretrans 开发环境启动脚本 v2.0"
    echo "========================================"
    echo -e "${NC}"
    
    # 检查是否在项目根目录
    if [ ! -f "package.json" ] && [ ! -d "frontend" ]; then
        log_error "请在项目根目录运行此脚本"
        exit 1
    fi
    
    # 执行启动流程
    check_dependencies
    check_environment
    install_dependencies
    run_migrations
    start_services
    health_check
    show_status
    
    # 创建管理脚本
    create_stop_script
    create_restart_script
    
    log_success "开发环境启动完成！"
    
    # 保持脚本运行，监听 Ctrl+C
    trap 'log_info "正在停止服务..."; ./stop-dev.sh; exit 0' INT
    
    log_info "按 Ctrl+C 停止所有服务"
    
    # 持续监控服务状态
    while true; do
        sleep 30
        
        # 检查服务是否还在运行
        if [ -f "logs/frontend.pid" ]; then
            PID=$(cat logs/frontend.pid)
            if ! kill -0 $PID 2>/dev/null; then
                log_warning "前端服务意外停止，正在重启..."
                cd frontend && npm run dev > ../logs/frontend.log 2>&1 &
                echo $! > ../logs/frontend.pid
                cd ..
            fi
        fi
    done
}

# 运行主函数
main "$@"
