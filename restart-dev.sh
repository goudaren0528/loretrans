#!/bin/bash

echo "重启 Transly 开发环境..."

# 停止现有服务
./stop-dev.sh

# 等待服务完全停止
sleep 3

# 重新启动
./start-dev-enhanced.sh
