#!/bin/bash

echo "🔍 验证 Vercel 部署状态..."

# 检查 Vercel 项目状态
echo "📊 检查 Vercel 项目状态..."
vercel ls

echo ""
echo "🌐 你的 Vercel 项目链接:"
echo "https://vercel.com/goudaren0528s-projects/translation-low-source-frontend-yuup"

echo ""
echo "📋 部署验证清单:"
echo "✅ 本地构建成功"
echo "✅ 代码已推送到 GitHub"
echo "✅ Vercel 配置已更新"

echo ""
echo "🔧 如果部署仍然失败，请检查:"
echo "1. Vercel 项目设置中的 Root Directory 是否设置为 'frontend'"
echo "2. Build Command 是否为 'npm run build'"
echo "3. Output Directory 是否为 '.next'"
echo "4. Install Command 是否为 'npm install'"

echo ""
echo "⚙️ 环境变量检查:"
echo "请确保在 Vercel 项目中设置了以下环境变量:"
echo "- NEXT_PUBLIC_SUPABASE_URL"
echo "- NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "- SUPABASE_SERVICE_ROLE_KEY"
echo "- NEXTAUTH_SECRET"
echo "- NEXTAUTH_URL"

echo ""
echo "🚀 如果一切正常，Vercel 应该会自动重新部署项目"
echo "📱 部署完成后，请测试以下功能:"
echo "- 网站首页加载"
echo "- 语言切换"
echo "- 翻译功能"
echo "- 用户注册/登录"
