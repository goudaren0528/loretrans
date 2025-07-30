#!/bin/bash

echo "🔍 本地开发环境验证测试"
echo "=========================="

# 检查开发服务器是否运行
echo "1. 检查开发服务器状态..."
if pgrep -f "npm run dev" > /dev/null; then
    echo "   ✅ 开发服务器正在运行"
else
    echo "   ❌ 开发服务器未运行"
    echo "   请运行: cd frontend && npm run dev"
    exit 1
fi

# 等待服务器完全启动
echo "2. 等待服务器完全启动..."
sleep 5

# 测试主页访问
echo "3. 测试主页访问..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|302"; then
    echo "   ✅ 主页可以访问"
else
    echo "   ❌ 主页无法访问"
fi

# 测试GSC验证文件
echo "4. 测试Google Search Console验证文件..."
GSC_RESPONSE=$(curl -s http://localhost:3000/google9879f9edb25bbe5e.html)
if echo "$GSC_RESPONSE" | grep -q "google-site-verification"; then
    echo "   ✅ GSC验证文件可以访问"
    echo "   内容: $GSC_RESPONSE"
else
    echo "   ⚠️  GSC验证文件响应: $GSC_RESPONSE"
    echo "   这可能是由于Next.js路由重定向导致的"
fi

# 检查生成的HTML中是否包含GA代码
echo "5. 检查页面是否包含Google Analytics代码..."
PAGE_CONTENT=$(curl -s http://localhost:3000)
if echo "$PAGE_CONTENT" | grep -q "G-64VSPS9SNV"; then
    echo "   ✅ 页面包含Google Analytics跟踪代码"
else
    echo "   ❌ 页面不包含Google Analytics跟踪代码"
fi

if echo "$PAGE_CONTENT" | grep -q "google9879f9edb25bbe5e"; then
    echo "   ✅ 页面包含Google Search Console验证码"
else
    echo "   ❌ 页面不包含Google Search Console验证码"
fi

echo ""
echo "📋 手动验证步骤:"
echo "1. 在浏览器中访问: http://localhost:3000"
echo "2. 打开开发者工具 (F12)"
echo "3. 查看Network标签页，寻找对googletagmanager.com的请求"
echo "4. 在Console中输入: typeof gtag (应该返回 'function')"
echo "5. 查看页面源代码，确认包含GA脚本和GSC meta标签"
echo ""
echo "🔗 测试链接:"
echo "- 主页: http://localhost:3000"
echo "- GSC验证: http://localhost:3000/google9879f9edb25bbe5e.html"
