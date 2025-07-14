#!/bin/bash
# Vercel环境变量配置脚本 - 必需变量
echo "🚀 配置Vercel必需环境变量..."
echo ""

echo "设置 NEXT_PUBLIC_SUPABASE_URL..."
vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "https://crhchsvaesipbifykbnp.supabase.co"
echo ""

echo "设置 NEXT_PUBLIC_SUPABASE_ANON_KEY..."
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyaGNoc3ZhZXNpcGJpZnlrYm5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2MjkxMjQsImV4cCI6MjA2NTIwNTEyNH0.Vi9DQkdTD9ZgjNfqYUN6Ngar1fPIIiycDsMDaGgaz0o"
echo ""

echo "设置 CREEM_API_KEY..."
vercel env add CREEM_API_KEY production <<< "creem_1dgd7XA8MmfIo7aqLeO13S"
echo ""

echo "设置 CREEM_WEBHOOK_SECRET..."
vercel env add CREEM_WEBHOOK_SECRET production <<< "whsec_5U9Hb72vZdb3t2s8DtETmK"
echo ""

echo "✅ 必需环境变量配置完成!"
echo ""
echo "📋 检查配置结果:"
vercel env ls
echo ""
echo "🚀 重新部署:"
vercel --prod
