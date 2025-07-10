#!/bin/bash

echo "🔧 700字符翻译修复验证"
echo "========================"

# 检查前端是否正在运行
if pgrep -f "next dev" > /dev/null; then
    echo "✅ 前端服务正在运行"
else
    echo "❌ 前端服务未运行，请先启动："
    echo "   cd frontend && npm run dev"
    exit 1
fi

echo ""
echo "📝 测试步骤："
echo "1. 打开浏览器访问应用"
echo "2. 登录用户账户"
echo "3. 进入翻译页面"
echo "4. 输入以下700字符测试文本："
echo ""
echo "---测试文本开始---"
cat << 'EOF'
This is a comprehensive test text designed to verify that the 700-character translation issue has been properly fixed. The previous problem was that logged-in users were unable to translate texts longer than 300 characters because the frontend was incorrectly routing all requests under 1000 characters to the public API endpoint, which has a hard limit of 300 characters. Now, with the fix implemented, texts over 300 characters should be routed to the authenticated API endpoint, which supports longer translations with the first 300 characters being free and additional characters consuming credits at a rate of 0.1 credits per character. This test text contains exactly 700 characters to validate the fix.
EOF
echo "---测试文本结束---"
echo ""
echo "5. 选择源语言和目标语言"
echo "6. 点击翻译按钮"
echo ""
echo "🎯 预期结果："
echo "- ✅ 翻译应该成功完成"
echo "- ✅ 前300字符免费"
echo "- ✅ 后400字符消耗40积分 (400 × 0.1)"
echo "- ✅ 积分余额应该相应减少"
echo ""
echo "❌ 如果仍然出现错误："
echo "   'Text too long for free translation. Please register to translate longer texts.'"
echo "   说明修复未生效，需要重启前端服务"
echo ""
echo "🔄 重启前端服务命令："
echo "   cd /home/hwt/translation-low-source/frontend"
echo "   npm run dev"
