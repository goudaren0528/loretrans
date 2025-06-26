#!/bin/bash

# MVP功能测试启动脚本
# 用于启动前端应用并进行功能验证

echo "🚀 启动Transly MVP功能测试..."

# 检查Node.js版本
echo "📋 检查环境..."
node --version
npm --version

# 进入前端目录
cd frontend

# 检查环境变量
echo "🔧 检查环境配置..."
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local文件不存在，请先配置环境变量"
    echo "请参考 ../.env.local 文件配置以下变量："
    echo "- NEXT_PUBLIC_SUPABASE_URL"
    echo "- NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "- SUPABASE_SERVICE_ROLE_KEY"
    echo "- NEXT_PUBLIC_CREEM_PUBLISHABLE_KEY"
    echo "- CREEM_SECRET_KEY"
    exit 1
fi

# 安装依赖（如果需要）
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 启动开发服务器
echo "🌟 启动开发服务器..."
echo ""
echo "MVP功能测试页面："
echo "- 主页: http://localhost:3000"
echo "- 测试页面: http://localhost:3000/test-auth"
echo "- 登录页面: http://localhost:3000/auth/signin"
echo "- 注册页面: http://localhost:3000/auth/signup"
echo "- 定价页面: http://localhost:3000/pricing"
echo ""
echo "测试功能清单："
echo "✅ 用户注册和登录"
echo "✅ 积分余额显示"
echo "✅ 积分消耗预估"
echo "✅ 免费额度进度条"
echo "✅ 积分购买流程（模拟）"
echo "✅ 翻译功能积分集成"
echo "✅ 用户权限控制"
echo ""

npm run dev
