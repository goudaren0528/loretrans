#!/bin/bash

echo "🚀 Vercel环境变量配置脚本"
echo "================================"
echo ""

# 检查是否安装了Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI未安装"
    echo "请先安装: npm i -g vercel"
    echo "然后运行: vercel login"
    exit 1
fi

echo "📋 即将配置以下环境变量到Vercel生产环境:"
echo ""
echo "1. NEXT_PUBLIC_SUPABASE_URL"
echo "2. NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "3. SUPABASE_SERVICE_ROLE_KEY"
echo ""

read -p "确认继续? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "操作已取消"
    exit 1
fi

echo ""
echo "🔧 开始配置环境变量..."
echo ""

# 配置NEXT_PUBLIC_SUPABASE_URL
echo "设置 NEXT_PUBLIC_SUPABASE_URL..."
vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "https://crhchsvaesipbifykbnp.supabase.co"

if [ $? -eq 0 ]; then
    echo "✅ NEXT_PUBLIC_SUPABASE_URL 设置成功"
else
    echo "❌ NEXT_PUBLIC_SUPABASE_URL 设置失败"
fi

echo ""

# 配置NEXT_PUBLIC_SUPABASE_ANON_KEY
echo "设置 NEXT_PUBLIC_SUPABASE_ANON_KEY..."
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyaGNoc3ZhZXNpcGJpZnlrYm5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2MjkxMjQsImV4cCI6MjA2NTIwNTEyNH0.Vi9DQkdTD9ZgjNfqYUN6Ngar1fPIIiycDsMDaGgaz0o"

if [ $? -eq 0 ]; then
    echo "✅ NEXT_PUBLIC_SUPABASE_ANON_KEY 设置成功"
else
    echo "❌ NEXT_PUBLIC_SUPABASE_ANON_KEY 设置失败"
fi

echo ""

# 配置SUPABASE_SERVICE_ROLE_KEY
echo "设置 SUPABASE_SERVICE_ROLE_KEY..."
vercel env add SUPABASE_SERVICE_ROLE_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyaGNoc3ZhZXNpcGJpZnlrYm5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTYyOTEyNCwiZXhwIjoyMDY1MjA1MTI0fQ.MzmkGXEe8vIrGaW9S0SqfbrUq3kmtu4Q9Piv2rlYK0I"

if [ $? -eq 0 ]; then
    echo "✅ SUPABASE_SERVICE_ROLE_KEY 设置成功"
else
    echo "❌ SUPABASE_SERVICE_ROLE_KEY 设置失败"
fi

echo ""
echo "📋 检查已配置的环境变量..."
vercel env ls

echo ""
echo "🚀 触发重新部署..."
vercel --prod

echo ""
echo "✅ 配置完成！"
echo ""
echo "📝 下一步:"
echo "1. 等待部署完成"
echo "2. 检查部署日志中的环境变量状态"
echo "3. 确认应用正常运行"
echo ""
echo "🔍 如果仍有问题:"
echo "- 检查 vercel env ls 的输出"
echo "- 确认项目链接正确"
echo "- 查看部署日志"
