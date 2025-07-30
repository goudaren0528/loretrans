#!/bin/bash

echo "🧪 测试翻译历史修复..."

# 1. 测试API
echo "1. 测试翻译历史API..."
curl -s -X GET "http://localhost:3000/api/translate/history?debug=true" \
  -H "Cookie: $(cat cookies.txt)" | head -20

echo -e "\n\n2. 进行测试翻译..."
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -H "Cookie: $(cat cookies.txt)" \
  -d '{
    "text": "This is a test translation to verify history updates.",
    "sourceLang": "en",
    "targetLang": "zh"
  }'

echo -e "\n\n3. 等待翻译完成..."
sleep 8

echo -e "\n\n4. 再次检查历史记录..."
curl -s -X GET "http://localhost:3000/api/translate/history?limit=5" \
  -H "Cookie: $(cat cookies.txt)" | head -20

echo -e "\n\n✅ 测试完成！请检查："
echo "- 语言显示是否正确（不再是 Unknown → Unknown）"
echo "- 时间显示是否正确（不再都是 Just now）"
echo "- 新翻译是否正确显示为 completed 状态"
echo "- 下载功能是否只包含翻译结果"
