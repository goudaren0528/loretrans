#!/bin/bash

echo "🔍 Testing Authentication Debug APIs"
echo "===================================="
echo ""

# 测试认证调试API
echo "1. Testing Auth Debug API..."
echo "----------------------------"
curl -s "http://localhost:3000/api/debug/auth" | jq '.' || echo "Failed to parse JSON response"

echo ""
echo ""

# 测试历史记录API（带调试）
echo "2. Testing History API with Debug..."
echo "------------------------------------"
curl -s "http://localhost:3000/api/translate/history?debug=true&limit=5" | jq '.' || echo "Failed to parse JSON response"

echo ""
echo ""

# 测试统计API
echo "3. Testing Statistics API..."
echo "----------------------------"
curl -s -X POST "http://localhost:3000/api/translate/history?debug=true" | jq '.' || echo "Failed to parse JSON response"

echo ""
echo ""

echo "💡 Tips:"
echo "- If you see 'Unauthorized' errors, you need to login first"
echo "- Check the browser console for additional debug information"
echo "- Look at the debug info in the API responses"
echo ""
echo "🌐 Open http://localhost:3000/auth/login to login first"
