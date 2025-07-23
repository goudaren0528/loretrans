#!/bin/bash

echo "=== 翻译功能测试 ==="
echo ""

echo "1. 测试短文本翻译（未登录）"
RESPONSE1=$(curl -s -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello", "sourceLang": "en", "targetLang": "zh"}')
echo "响应: $RESPONSE1"
JOB_ID1=$(echo $RESPONSE1 | grep -o '"jobId":"[^"]*"' | cut -d'"' -f4)
echo "任务ID: $JOB_ID1"
echo ""

echo "2. 等待短文本翻译完成..."
sleep 3
STATUS1=$(curl -s -X POST http://localhost:3000/api/translate/status \
  -H "Content-Type: application/json" \
  -d "{\"jobId\": \"$JOB_ID1\"}")
echo "状态: $STATUS1"
echo ""

echo "3. 测试长文本翻译（未登录）"
RESPONSE2=$(curl -s -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "This is a much longer text that should be processed correctly by the translation system. It contains multiple sentences and should demonstrate that the system can handle longer content without errors. The translation should work smoothly for both authenticated and unauthenticated users.", "sourceLang": "en", "targetLang": "zh"}')
echo "响应: $RESPONSE2"
JOB_ID2=$(echo $RESPONSE2 | grep -o '"jobId":"[^"]*"' | cut -d'"' -f4)
echo "任务ID: $JOB_ID2"
echo ""

echo "4. 等待长文本翻译完成..."
sleep 5
STATUS2=$(curl -s -X POST http://localhost:3000/api/translate/status \
  -H "Content-Type: application/json" \
  -d "{\"jobId\": \"$JOB_ID2\"}")
echo "状态: $STATUS2"
echo ""

echo "=== 测试完成 ==="
