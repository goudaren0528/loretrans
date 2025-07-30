#!/bin/bash

# 翻译服务停止脚本
# Translation Services Stop Script

echo "🛑 Stopping Translation Services..."
echo "===================================="
echo ""

STOPPED_COUNT=0

# 停止前端服务
if [ -f ".frontend.pid" ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    if kill -0 "$FRONTEND_PID" 2>/dev/null; then
        echo "🌐 Stopping Frontend (PID: $FRONTEND_PID)..."
        kill "$FRONTEND_PID"
        sleep 2
        if kill -0 "$FRONTEND_PID" 2>/dev/null; then
            echo "   ⚠️  Force stopping Frontend..."
            kill -9 "$FRONTEND_PID" 2>/dev/null
        fi
        echo "   ✅ Frontend stopped"
        STOPPED_COUNT=$((STOPPED_COUNT + 1))
    else
        echo "   ℹ️  Frontend was not running"
    fi
    rm -f .frontend.pid
else
    echo "   ℹ️  Frontend PID file not found"
fi

# 停止文件处理服务
if [ -f ".file-processor.pid" ]; then
    FILE_PROCESSOR_PID=$(cat .file-processor.pid)
    if kill -0 "$FILE_PROCESSOR_PID" 2>/dev/null; then
        echo "📄 Stopping File Processor (PID: $FILE_PROCESSOR_PID)..."
        kill "$FILE_PROCESSOR_PID"
        sleep 2
        if kill -0 "$FILE_PROCESSOR_PID" 2>/dev/null; then
            echo "   ⚠️  Force stopping File Processor..."
            kill -9 "$FILE_PROCESSOR_PID" 2>/dev/null
        fi
        echo "   ✅ File Processor stopped"
        STOPPED_COUNT=$((STOPPED_COUNT + 1))
    else
        echo "   ℹ️  File Processor was not running"
    fi
    rm -f .file-processor.pid
else
    echo "   ℹ️  File Processor PID file not found"
fi

# 清理其他可能的进程
echo ""
echo "🧹 Cleaning up any remaining processes..."

# 查找并停止可能遗留的Next.js进程
NEXT_PIDS=$(ps aux | grep "next dev" | grep -v grep | awk '{print $2}')
if [ -n "$NEXT_PIDS" ]; then
    echo "   🔍 Found remaining Next.js processes: $NEXT_PIDS"
    for pid in $NEXT_PIDS; do
        kill "$pid" 2>/dev/null
        echo "   ✅ Stopped process $pid"
    done
fi

# 查找并停止可能遗留的文件处理进程
FILE_PROC_PIDS=$(ps aux | grep "file-processor" | grep -v grep | awk '{print $2}')
if [ -n "$FILE_PROC_PIDS" ]; then
    echo "   🔍 Found remaining file-processor processes: $FILE_PROC_PIDS"
    for pid in $FILE_PROC_PIDS; do
        kill "$pid" 2>/dev/null
        echo "   ✅ Stopped process $pid"
    done
fi

echo ""

# 验证停止状态
echo "🔍 Verifying services are stopped..."
sleep 2

FRONTEND_CHECK=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 2 http://localhost:3000 2>/dev/null)
FILE_PROC_CHECK=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 2 http://localhost:3010/health 2>/dev/null)

if [ "$FRONTEND_CHECK" = "000" ] || [ -z "$FRONTEND_CHECK" ]; then
    echo "   ✅ Frontend: Stopped"
else
    echo "   ⚠️  Frontend: May still be running"
fi

if [ "$FILE_PROC_CHECK" = "000" ] || [ -z "$FILE_PROC_CHECK" ]; then
    echo "   ✅ File Processor: Stopped"
else
    echo "   ⚠️  File Processor: May still be running"
fi

echo ""

if [ $STOPPED_COUNT -gt 0 ]; then
    echo "✅ Successfully stopped $STOPPED_COUNT service(s)"
else
    echo "ℹ️  No services were running"
fi

echo ""
echo "💡 Tips:"
echo "   • Use './start-services.sh' to start services again"
echo "   • Use './check-services.sh' to verify status"
echo "   • Logs are preserved in './logs/' directory"
echo ""
echo "👋 All services stopped!"
