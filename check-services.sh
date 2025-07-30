#!/bin/bash

# 翻译服务状态检查脚本
# Translation Services Status Checker

echo "🔍 Translation Services Status Check"
echo "===================================="
echo ""

# 检查PID文件
FRONTEND_PID=""
FILE_PROCESSOR_PID=""

if [ -f ".frontend.pid" ]; then
    FRONTEND_PID=$(cat .frontend.pid)
fi

if [ -f ".file-processor.pid" ]; then
    FILE_PROCESSOR_PID=$(cat .file-processor.pid)
fi

# 检查进程状态
echo "📋 Process Status:"
echo "-------------------"

if [ -n "$FRONTEND_PID" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
    echo "✅ Frontend (Next.js): Running (PID: $FRONTEND_PID)"
    FRONTEND_RUNNING=true
else
    echo "❌ Frontend (Next.js): Not running"
    FRONTEND_RUNNING=false
fi

if [ -n "$FILE_PROCESSOR_PID" ] && kill -0 "$FILE_PROCESSOR_PID" 2>/dev/null; then
    echo "✅ File Processor: Running (PID: $FILE_PROCESSOR_PID)"
    FILE_PROCESSOR_RUNNING=true
else
    echo "❌ File Processor: Not running"
    FILE_PROCESSOR_RUNNING=false
fi

echo ""

# 检查端口连接
echo "🌐 Service Endpoints:"
echo "---------------------"

# 检查前端服务
if curl -s -o /dev/null -w "" --connect-timeout 2 http://localhost:3000; then
    echo "✅ Frontend: http://localhost:3000 (Accessible)"
else
    echo "❌ Frontend: http://localhost:3000 (Not accessible)"
fi

# 检查文件处理服务
if curl -s -o /dev/null -w "" --connect-timeout 2 http://localhost:3010/health; then
    echo "✅ File Processor: http://localhost:3010 (Accessible)"
else
    echo "❌ File Processor: http://localhost:3010 (Not accessible)"
fi

echo ""

# 检查日志文件
echo "📝 Recent Logs:"
echo "---------------"

if [ -f "logs/frontend.log" ]; then
    echo "Frontend (last 3 lines):"
    tail -3 logs/frontend.log | sed 's/^/  /'
    echo ""
fi

if [ -f "logs/file-processor.log" ]; then
    echo "File Processor (last 3 lines):"
    tail -3 logs/file-processor.log | sed 's/^/  /'
    echo ""
fi

# 总结
echo "📊 Summary:"
echo "-----------"

if [ "$FRONTEND_RUNNING" = true ] && [ "$FILE_PROCESSOR_RUNNING" = true ]; then
    echo "🎉 All services are running normally!"
    echo ""
    echo "🔗 Access URLs:"
    echo "   • Frontend: http://localhost:3000"
    echo "   • File Processor Health: http://localhost:3010/health"
    echo ""
    echo "📁 New Features Available:"
    echo "   • Translation History (with login)"
    echo "   • Download Translation Results"
    echo "   • Background Task Processing"
    echo "   • Enhanced Document Translation"
elif [ "$FRONTEND_RUNNING" = true ]; then
    echo "⚠️  Frontend is running, but File Processor needs to be started"
    echo "   Run: cd microservices/file-processor && npm start"
elif [ "$FILE_PROCESSOR_RUNNING" = true ]; then
    echo "⚠️  File Processor is running, but Frontend needs to be started"
    echo "   Run: cd frontend && npm run dev"
else
    echo "🚨 No services are running. Start them with:"
    echo "   Frontend: cd frontend && npm run dev"
    echo "   File Processor: cd microservices/file-processor && npm start"
fi

echo ""
echo "💡 Tip: Use './start-services.sh' to start all services at once"
echo "💡 Tip: Use './stop-services.sh' to stop all services"
