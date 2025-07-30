#!/bin/bash

echo "🧪 创建测试用户"
echo "================"

# 测试用户信息
TEST_EMAIL="test@example.com"
TEST_PASSWORD="testpassword123"
TEST_NAME="Test User"

echo "📧 邮箱: $TEST_EMAIL"
echo "🔑 密码: $TEST_PASSWORD"
echo "👤 姓名: $TEST_NAME"
echo ""

# 尝试注册用户
echo "1. 尝试注册用户..."
SIGNUP_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"name\": \"$TEST_NAME\"
  }")

echo "注册响应: $SIGNUP_RESPONSE"
echo ""

# 等待一下让数据库处理
echo "⏳ 等待数据库处理..."
sleep 2

# 尝试登录
echo "2. 尝试登录..."
LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/auth/signin" \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

echo "登录响应: $LOGIN_RESPONSE"
echo ""

# 检查cookies
echo "3. 检查cookies..."
if [ -f cookies.txt ]; then
  echo "Cookies文件内容:"
  cat cookies.txt
  echo ""
else
  echo "❌ 没有找到cookies文件"
fi

# 使用cookies测试认证状态
echo "4. 测试认证状态..."
AUTH_CHECK=$(curl -s -X GET "http://localhost:3000/api/debug/auth" \
  -b cookies.txt)

echo "认证检查响应: $AUTH_CHECK"
echo ""

# 测试历史记录API
echo "5. 测试历史记录API..."
HISTORY_RESPONSE=$(curl -s -X GET "http://localhost:3000/api/translate/history" \
  -b cookies.txt)

echo "历史记录响应: $HISTORY_RESPONSE"
echo ""

echo "✅ 测试完成！"
echo ""
echo "📝 如果看到认证成功，请在浏览器中访问："
echo "   • http://localhost:3000/en/test-auth-history"
echo "   • http://localhost:3000/en/text-translate"
echo ""
echo "🔧 如果需要手动登录，请使用："
echo "   邮箱: $TEST_EMAIL"
echo "   密码: $TEST_PASSWORD"
