#!/bin/bash

echo "🔍 Google Analytics & Search Console 快速验证"
echo "============================================"

# 检查文件是否存在
echo "1. 检查文件配置..."
if [ -f "frontend/public/google9879f9edb25bbe5e.html" ]; then
    echo "   ✅ GSC验证文件存在"
else
    echo "   ❌ GSC验证文件不存在"
fi

if [ -f "frontend/app/api/google-verification/route.ts" ]; then
    echo "   ✅ API备用路由已创建"
else
    echo "   ❌ API备用路由不存在"
fi

# 检查配置文件
echo "2. 检查配置..."
if grep -q "G-64VSPS9SNV" frontend/components/analytics/google-analytics.tsx; then
    echo "   ✅ Google Analytics ID配置正确"
else
    echo "   ❌ Google Analytics ID配置错误"
fi

if grep -q "google.*\\.html" frontend/middleware.ts; then
    echo "   ✅ 中间件已排除Google验证文件"
else
    echo "   ❌ 中间件未正确配置"
fi

echo ""
echo "📋 手动验证步骤："
echo "1. 运行: cd frontend && npm run dev"
echo "2. 访问: http://localhost:3000/google9879f9edb25bbe5e.html"
echo "3. 或访问: http://localhost:3000/api/google-verification"
echo "4. 应该看到: google-site-verification: google9879f9edb25bbe5e.html"
echo ""
echo "🎯 Google Analytics验证："
echo "1. 访问: http://localhost:3000"
echo "2. 开发者工具 → Network → 查找googletagmanager.com请求"
echo "3. Console中输入: typeof gtag (应返回 'function')"
