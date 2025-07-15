#!/bin/bash

# 快速启动前端服务（用于测试积分修复）
echo "🚀 快速启动前端服务..."

# 停止可能存在的进程
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
sleep 2

# 进入前端目录
cd frontend

# 启动前端服务
echo "启动前端服务 (端口 3000)..."
npm run dev

echo "✅ 前端服务已启动: http://localhost:3000"
