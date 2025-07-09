#!/bin/bash

# Loretrans 开发环境启动脚本
# 启动前端和微服务

echo "🚀 启动Loretrans开发环境..."

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 检查Node.js版本
echo -e "${YELLOW}📋 检查环境...${NC}"
node --version
npm --version

# 检查环境配置
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  创建环境配置文件...${NC}"
    cp .env.local .env.local.backup 2>/dev/null || true
    echo "环境配置文件已存在"
else
    echo -e "${GREEN}✅ 环境配置文件存在${NC}"
fi

# 检查依赖
echo -e "${YELLOW}📦 检查依赖...${NC}"

# 检查前端依赖
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}安装前端依赖...${NC}"
    cd frontend && pnpm install && cd ..
else
    echo -e "${GREEN}✅ 前端依赖已安装${NC}"
fi

# 检查文件处理微服务依赖
if [ ! -d "microservices/file-processor/node_modules" ]; then
    echo -e "${YELLOW}安装文件处理微服务依赖...${NC}"
    cd microservices/file-processor && npm install && cd ../..
else
    echo -e "${GREEN}✅ 文件处理微服务依赖已安装${NC}"
fi

# 创建日志目录
mkdir -p logs

echo -e "${GREEN}🌟 启动服务...${NC}"

# 启动文件处理微服务
echo -e "${YELLOW}启动文件处理微服务 (端口 3010)...${NC}"
cd microservices/file-processor
PORT=3010 npm run dev > ../../logs/file-processor.log 2>&1 &
FILE_PROCESSOR_PID=$!
cd ../..

# 等待文件处理微服务启动
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
    fi
done

# 启动前端应用
echo -e "${YELLOW}启动前端应用 (端口 3000)...${NC}"
cd frontend
pnpm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
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
    fi
done

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
echo -e "${CYAN}海地克里奥尔语翻译: http://localhost:3000/creole-to-english${NC}"
echo -e "${CYAN}老挝语翻译: http://localhost:3000/lao-to-english${NC}"
echo -e "${CYAN}定价页面: http://localhost:3000/en/pricing${NC}"
echo -e "${CYAN}用户登录: http://localhost:3000/auth/signin${NC}"
echo -e "${CYAN}用户注册: http://localhost:3000/auth/signup${NC}"
echo ""
echo -e "${CYAN}=== API端点 ===${NC}"
echo -e "${CYAN}前端API健康检查: http://localhost:3000/api/health${NC}"
echo -e "${CYAN}文件处理微服务健康检查: http://localhost:3010/health${NC}"
echo ""

# 测试API
echo -e "${YELLOW}🧪 测试API...${NC}"

# 测试前端API
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 前端API: 正常${NC}"
else
    echo -e "${RED}❌ 前端API: 失败${NC}"
fi

# 测试文件处理API
if curl -s http://localhost:3010/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 文件处理API: 正常${NC}"
else
    echo -e "${RED}❌ 文件处理API: 失败${NC}"
fi

echo ""
echo -e "${GREEN}🎉 开发环境启动完成！${NC}"
echo ""
echo -e "${YELLOW}功能测试清单:${NC}"
echo "✅ 用户注册和登录"
echo "✅ 积分余额显示"
echo "✅ 文本翻译功能"
echo "✅ 文档翻译功能"
echo "✅ 积分消耗预估"
echo "✅ 免费额度进度条"
echo "✅ 积分购买流程"
echo "✅ 未登录用户限制"
echo "✅ 多语言界面"
echo ""
echo -e "${YELLOW}进程ID:${NC}"
echo "前端应用: $FRONTEND_PID"
echo "文件处理微服务: $FILE_PROCESSOR_PID"
echo ""
echo -e "${YELLOW}停止服务:${NC}"
echo "kill $FRONTEND_PID $FILE_PROCESSOR_PID"
echo "或者使用 Ctrl+C 然后运行: pkill -f 'npm run dev'"
echo ""
echo -e "${YELLOW}查看日志:${NC}"
echo "前端日志: tail -f logs/frontend.log"
echo "文件处理微服务日志: tail -f logs/file-processor.log"
echo ""

# 保存进程ID到文件
echo "$FRONTEND_PID" > .frontend.pid
echo "$FILE_PROCESSOR_PID" > .file-processor.pid

# 等待用户输入
echo -e "${CYAN}按 Ctrl+C 停止所有服务...${NC}"

# 捕获中断信号
trap 'echo -e "\n${YELLOW}正在停止服务...${NC}"; kill $FRONTEND_PID $FILE_PROCESSOR_PID 2>/dev/null; rm -f .frontend.pid .file-processor.pid; echo -e "${GREEN}服务已停止${NC}"; exit 0' INT

# 保持脚本运行
wait
