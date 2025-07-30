#!/bin/bash

echo "🧪 测试翻译历史记录功能..."

# 1. 测试翻译API
echo "1. 测试文本翻译API..."
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "text": "Hello, this is a test translation for history.",
    "sourceLang": "en",
    "targetLang": "zh"
  }'

echo -e "\n\n2. 等待翻译完成..."
sleep 5

# 2. 测试翻译历史API
echo "3. 测试翻译历史API..."
curl -X GET "http://localhost:3000/api/translate/history?page=1&limit=10&debug=true" \
  -H "Cookie: $(cat cookies.txt)"

echo -e "\n\n测试完成！"
