#!/bin/bash

echo "🧪 测试登录状态下的短文本翻译"
echo "=================================="

# 1. 发送翻译请求
echo "📤 发送翻译请求..."
RESPONSE=$(curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-token" \
  -d '{"text": "Hello world, this is a test", "sourceLang": "en", "targetLang": "zh"}' \
  -s)

echo "📋 翻译请求响应:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"

# 提取jobId
JOB_ID=$(echo "$RESPONSE" | grep -o '"jobId":"[^"]*"' | cut -d'"' -f4)

if [ -z "$JOB_ID" ]; then
  echo "❌ 未获取到jobId，测试失败"
  exit 1
fi

echo ""
echo "🔄 开始轮询任务状态: $JOB_ID"
echo "=================================="

# 2. 轮询任务状态
for i in {1..10}; do
  echo "📊 轮询尝试 $i/10..."
  
  STATUS_RESPONSE=$(curl -s "http://localhost:3000/api/translate/status?jobId=$JOB_ID")
  
  echo "状态响应:"
  echo "$STATUS_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$STATUS_RESPONSE"
  
  # 检查是否完成
  STATUS=$(echo "$STATUS_RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
  RESULT=$(echo "$STATUS_RESPONSE" | grep -o '"result":"[^"]*"' | cut -d'"' -f4)
  
  echo "当前状态: $STATUS"
  
  if [ "$STATUS" = "completed" ]; then
    echo "✅ 翻译完成！"
    echo "📄 翻译结果: $RESULT"
    break
  elif [ "$STATUS" = "failed" ]; then
    echo "❌ 翻译失败"
    break
  fi
  
  echo "⏳ 等待2秒后继续轮询..."
  sleep 2
  echo ""
done

echo ""
echo "🏁 测试完成"
