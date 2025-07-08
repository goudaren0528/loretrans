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
