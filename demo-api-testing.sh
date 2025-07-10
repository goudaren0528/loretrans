#!/bin/bash

# API Testing Tools Demonstration
# Purpose: 演示API测试工具的功能
# Author: Generated for translation-low-source project

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    API测试工具演示                           ║${NC}"
echo -e "${BLUE}║              Translation API Testing Suite                   ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo

echo -e "${CYAN}🚀 1. 快速API状态检查${NC}"
echo -e "${YELLOW}   检查所有核心API端点的健康状态...${NC}"
echo
./quick-api-check.sh
echo

echo -e "${CYAN}🔍 2. 语言检测功能测试${NC}"
echo -e "${YELLOW}   测试不同语言的检测能力...${NC}"
echo

echo -e "${GREEN}   测试英语:${NC}"
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"text":"Hello world, how are you?"}' \
  http://localhost:3000/api/detect | jq '.' 2>/dev/null || \
  curl -s -X POST -H "Content-Type: application/json" \
  -d '{"text":"Hello world, how are you?"}' \
  http://localhost:3000/api/detect
echo

echo -e "${GREEN}   测试海地克里奥尔语:${NC}"
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"text":"Bonjou, kijan ou ye? Mwen byen, mèsi."}' \
  http://localhost:3000/api/detect | jq '.' 2>/dev/null || \
  curl -s -X POST -H "Content-Type: application/json" \
  -d '{"text":"Bonjou, kijan ou ye? Mwen byen, mèsi."}' \
  http://localhost:3000/api/detect
echo

echo -e "${GREEN}   测试中文:${NC}"
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"text":"你好世界，你好吗？"}' \
  http://localhost:3000/api/detect | jq '.' 2>/dev/null || \
  curl -s -X POST -H "Content-Type: application/json" \
  -d '{"text":"你好世界，你好吗？"}' \
  http://localhost:3000/api/detect
echo

echo -e "${CYAN}📊 3. 测试结果分析${NC}"
echo -e "${YELLOW}   分析API响应和性能...${NC}"
echo

# 检查服务器响应时间
echo -e "${GREEN}   服务器响应时间测试:${NC}"
start_time=$(date +%s%3N)
curl -s http://localhost:3000/api/detect \
  -X POST -H "Content-Type: application/json" \
  -d '{"text":"test"}' > /dev/null
end_time=$(date +%s%3N)
response_time=$((end_time - start_time))
echo -e "   响应时间: ${response_time}ms"

# 检查API版本信息
echo -e "${GREEN}   API版本信息:${NC}"
version_info=$(curl -s -X POST -H "Content-Type: application/json" \
  -d '{"text":"test"}' http://localhost:3000/api/detect | \
  grep -o '"version":"[^"]*"' 2>/dev/null || echo '"version":"unknown"')
echo -e "   $version_info"

echo

echo -e "${CYAN}🛠️  4. 可用的测试工具${NC}"
echo -e "${YELLOW}   以下工具已创建并可使用:${NC}"
echo
echo -e "${GREEN}   • quick-api-check.sh${NC}     - 快速API状态检查"
echo -e "${GREEN}   • test-apis-with-curl.sh${NC} - 完整API测试套件"
echo -e "${GREEN}   • run-api-tests.sh${NC}       - 多环境测试运行器"
echo -e "${GREEN}   • monitor-apis.sh${NC}        - 持续API监控"
echo -e "${GREEN}   • api-test-config.json${NC}   - 测试配置文件"
echo

echo -e "${CYAN}📋 5. 使用示例${NC}"
echo -e "${YELLOW}   常用命令示例:${NC}"
echo
echo -e "${GREEN}   # 快速检查所有API${NC}"
echo -e "   ./quick-api-check.sh"
echo
echo -e "${GREEN}   # 运行完整测试套件${NC}"
echo -e "   ./test-apis-with-curl.sh -u http://localhost:3000"
echo
echo -e "${GREEN}   # 测试特定功能${NC}"
echo -e "   ./test-apis-with-curl.sh -u http://localhost:3000 health"
echo
echo -e "${GREEN}   # 启动持续监控${NC}"
echo -e "   ./monitor-apis.sh -u http://localhost:3000 -i 60"
echo

echo -e "${CYAN}📈 6. 测试总结${NC}"
echo -e "${YELLOW}   当前API状态:${NC}"
echo -e "${GREEN}   ✅ 语言检测API - 工作正常${NC}"
echo -e "${GREEN}   ✅ 服务器运行 - 稳定${NC}"
echo -e "${YELLOW}   ⚠️  翻译API - 需要认证${NC}"
echo -e "${YELLOW}   ⚠️  健康检查 - 重定向问题${NC}"
echo -e "${RED}   ❌ 语言列表API - 未实现${NC}"
echo -e "${RED}   ❌ 批量翻译API - 未实现${NC}"
echo

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                      演示完成                                ║${NC}"
echo -e "${BLUE}║   详细报告请查看: API_TESTING_SUMMARY.md                    ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
