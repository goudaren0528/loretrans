#!/bin/bash

# 翻译调度优化测试脚本

echo "🧪 开始测试翻译调度优化..."

# 测试用例1: 5000字符文本
echo "📝 测试1: 5000字符文本"
TEST_TEXT_5K="$(head -c 5000 /dev/urandom | base64 | tr -d '\n')"
curl -X POST http://localhost:3000/api/translate/queue \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"$TEST_TEXT_5K\",\"sourceLanguage\":\"en\",\"targetLanguage\":\"zh\"}" \
  -w "\n响应时间: %{time_total}秒\n"

echo "\n⏱️ 等待5秒..."
sleep 5

# 测试用例2: 10000字符文本
echo "📝 测试2: 10000字符文本"
TEST_TEXT_10K="$(head -c 10000 /dev/urandom | base64 | tr -d '\n')"
curl -X POST http://localhost:3000/api/translate/queue \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"$TEST_TEXT_10K\",\"sourceLanguage\":\"en\",\"targetLanguage\":\"zh\"}" \
  -w "\n响应时间: %{time_total}秒\n"

echo "\n✅ 测试完成！请查看日志中的处理时间和并发信息。"
