#!/bin/bash

# 翻译功能测试运行脚本
# 用于运行所有翻译相关的测试套件

set -e

echo "🚀 开始运行翻译功能测试套件..."
echo "=================================="

# 检查Node.js和npm是否可用
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装或不在PATH中"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装或不在PATH中"
    exit 1
fi

# 检查依赖是否已安装
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 设置测试环境变量
export NODE_ENV=test
export TEST_BASE_URL=${TEST_BASE_URL:-"http://localhost:3000"}

echo "🌐 测试环境: $NODE_ENV"
echo "🔗 测试URL: $TEST_BASE_URL"
echo ""

# 运行不同的测试套件
echo "1️⃣ 运行核心翻译功能测试..."
npm test -- --testNamePattern="核心翻译功能测试" --verbose

echo ""
echo "2️⃣ 运行长文本翻译测试..."
npm test -- tests/long-text-translation.test.js --verbose

echo ""
echo "3️⃣ 运行文档翻译测试..."
npm test -- tests/document-translation.test.js --verbose

echo ""
echo "4️⃣ 运行综合翻译测试..."
npm test -- tests/comprehensive-translation.test.js --verbose

echo ""
echo "5️⃣ 运行积分系统测试..."
npm test -- tests/credits-and-billing.test.js --verbose

echo ""
echo "6️⃣ 运行端到端测试..."
npm test -- tests/e2e-translation.test.js --verbose

echo ""
echo "✅ 所有翻译功能测试完成！"
echo "=================================="

# 生成测试报告
if [ "$1" = "--coverage" ]; then
    echo "📊 生成测试覆盖率报告..."
    npm test -- --coverage
    echo "📁 覆盖率报告已生成到 coverage/ 目录"
fi

echo ""
echo "🎯 测试总结:"
echo "   - 核心翻译功能: API调用和基本翻译质量"
echo "   - 长文本翻译: 1000-5000+ 字符的翻译性能"
echo "   - 文档翻译: 各种文档格式和结构的处理"
echo "   - 综合测试: 所有语言对和使用场景"
echo "   - 积分系统: 计费逻辑和付费功能"
echo "   - 端到端测试: 完整用户流程"
echo ""
echo "💡 如需运行特定测试，使用:"
echo "   npm test -- tests/[测试文件名].test.js"
echo ""
echo "📈 如需生成覆盖率报告，使用:"
echo "   ./scripts/run-translation-tests.sh --coverage"
