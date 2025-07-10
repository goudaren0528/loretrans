#!/bin/bash

echo "🧹 整理项目文件，准备合并到主分支..."

# 创建必要的目录
mkdir -p docs/summary
mkdir -p temp-scripts

echo "📁 移动总结报告到 docs/summary/"

# 移动总结报告文件
summary_files=(
    "BRAND_REPLACEMENT_REPORT.md"
    "SMART-API-ENDPOINT-LOGIC.md"
    "VERCEL_DEPLOYMENT_GUIDE.md"
    "BUILD-ERROR-FIX-SUMMARY.md"
    "RUNTIME-ERROR-FIX-SUMMARY.md"
    "TEXT-TRANSLATE-COMPREHENSIVE-FIX-SUMMARY.md"
    "TRANSLATION-INTERFACE-COMPREHENSIVE-FIX-SUMMARY.md"
    "SIGNIN-MULTILINGUAL-TRANSLATION-SUMMARY.md"
    "CONTACT-REMOVAL-SUMMARY.md"
    "AUTH-REDIRECT-FIX-SUMMARY.md"
    "MIDDLEWARE-FIX-SUMMARY.md"
    "TEXT-TRANSLATE-FIXES-SUMMARY.md"
    "ERROR-FIXES-SUMMARY.md"
    "API-AUTH-FIX-SUMMARY.md"
    "FINAL-PLACEHOLDER-FIX-SUMMARY.md"
    "SIGNIN-TOAST-FIX-SUMMARY.md"
    "TRANSLATOR-FIXES-SUMMARY.md"
    "TRANSLATION_COMPLETION_REPORT.md"
    "PROJECT_HEALTH_REPORT.md"
)

for file in "${summary_files[@]}"; do
    if [ -f "$file" ]; then
        mv "$file" "docs/summary/"
        echo "✅ 移动 $file 到 docs/summary/"
    fi
done

echo "🗂️ 移动临时脚本到 temp-scripts/"

# 移动临时测试脚本
temp_scripts=(
    "add-missing-translation-keys.js"
    "analyze-errors.sh"
    "assess-impact.sh"
    "batch-fix-errors.sh"
    "comprehensive-fix.sh"
    "debug-credits.mjs"
    "final-zod-fix.sh"
    "fix-build-errors.sh"
    "fix-compilation-errors.sh"
    "fix-imports.sh"
    "fix-remaining-errors.sh"
    "fix-syntax.sh"
    "fix-translation-keys.sh"
    "precise-fix.sh"
    "safe-fix.sh"
    "temp-zod-fix.sh"
    "test-800-chars.mjs"
    "test-async-credits.mjs"
    "test-auth-translation.mjs"
    "test-final-flow.mjs"
    "test-frontend-api.mjs"
    "test-processing-mode.mjs"
    "test-translation.mjs"
    "translate-with-correct-api.js"
    "translate-with-hf-api.js"
)

for script in "${temp_scripts[@]}"; do
    if [ -f "$script" ]; then
        mv "$script" "temp-scripts/"
        echo "✅ 移动 $script 到 temp-scripts/"
    fi
done

echo "🗑️ 清理备份目录"
# 移动备份目录
if [ -d "brand-replacement-backup-20250707_100840" ]; then
    mv "brand-replacement-backup-20250707_100840" "temp-scripts/"
    echo "✅ 移动备份目录到 temp-scripts/"
fi

echo "📝 更新 .gitignore"
# 添加临时文件到 .gitignore
cat >> .gitignore << 'EOF'

# 临时脚本和测试文件
temp-scripts/
*.mjs
*-fix.sh
*-test.js
debug-*.html

# 构建和部署临时文件
*.backup
*.disabled
.temp/

EOF

echo "🎯 创建项目结构说明"
cat > PROJECT_STRUCTURE.md << 'EOF'
# 项目结构说明

## 📁 目录结构

```
translation-low-source/
├── docs/                          # 文档目录
│   ├── summary/                   # 项目总结报告
│   └── ...                        # 其他文档
├── frontend/                      # 前端应用
├── microservices/                 # 微服务
├── shared/                        # 共享代码
├── temp-scripts/                  # 临时脚本（不提交到主分支）
└── ...
```

## 📋 文件分类

### 保留文件
- 核心应用代码
- 配置文件
- 文档
- 部署脚本

### 临时文件（已移动到 temp-scripts/）
- 测试脚本
- 修复脚本
- 调试文件
- 备份文件

## 🚀 部署相关
- `deploy-vercel.sh` - Vercel 部署脚本
- `vercel.json` - Vercel 配置
- `VERCEL_DEPLOYMENT_GUIDE.md` - 部署指南（已移动到 docs/summary/）
EOF

echo "✅ 文件整理完成！"
echo ""
echo "📋 整理结果："
echo "- 总结报告已移动到 docs/summary/"
echo "- 临时脚本已移动到 temp-scripts/"
echo "- 已更新 .gitignore"
echo "- 已创建 PROJECT_STRUCTURE.md"
echo ""
echo "🔄 现在可以安全地提交更改并合并到主分支"
