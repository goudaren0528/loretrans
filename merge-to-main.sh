#!/bin/bash

echo "🔄 准备将 refactor01 分支合并到主分支..."

# 检查当前分支
current_branch=$(git branch --show-current)
echo "📍 当前分支: $current_branch"

if [ "$current_branch" != "refactor01" ]; then
    echo "❌ 错误: 当前不在 refactor01 分支"
    echo "请先切换到 refactor01 分支: git checkout refactor01"
    exit 1
fi

# 检查是否有未提交的更改
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "📝 发现未提交的更改，正在提交..."
    
    # 添加所有更改
    git add .
    
    # 提交更改
    commit_message="feat: 项目重构完成 - 修复构建错误，整理项目结构，准备部署

- 修复所有构建错误和 TypeScript 问题
- 添加 Suspense 边界修复 useSearchParams 问题
- 为动态 API 路由添加 force-dynamic 导出
- 整理项目文件结构，移动总结报告到 docs/summary/
- 移动临时脚本到 temp-scripts/ 目录
- 更新 .gitignore 和项目文档
- 准备 Vercel 部署配置
- 构建测试通过，准备生产部署"

    git commit -m "$commit_message"
    echo "✅ 更改已提交"
else
    echo "✅ 工作目录干净，无需提交"
fi

# 推送当前分支到远程
echo "📤 推送 refactor01 分支到远程..."
git push origin refactor01

# 获取最新的远程更改
echo "🔄 获取远程更新..."
git fetch origin

# 检查主分支名称（可能是 main 或 master）
main_branch="main"
if git show-ref --verify --quiet refs/remotes/origin/master; then
    main_branch="master"
fi

echo "🎯 目标主分支: $main_branch"

# 切换到主分支
echo "🔄 切换到 $main_branch 分支..."
git checkout $main_branch

# 拉取最新的主分支
echo "📥 拉取最新的 $main_branch 分支..."
git pull origin $main_branch

# 合并 refactor01 分支
echo "🔀 合并 refactor01 分支到 $main_branch..."
git merge refactor01 --no-ff -m "Merge refactor01: 完成项目重构和构建修复

合并内容:
- 修复所有构建错误和 Next.js 部署问题
- 完成项目文件结构整理
- 添加 Vercel 部署配置
- 更新文档和总结报告
- 准备生产环境部署

测试状态: ✅ 构建通过
部署准备: ✅ 已完成"

if [ $? -eq 0 ]; then
    echo "✅ 合并成功！"
    
    # 推送合并后的主分支
    echo "📤 推送合并后的 $main_branch 分支..."
    git push origin $main_branch
    
    echo "🎉 分支合并完成！"
    echo ""
    echo "📋 后续步骤:"
    echo "1. 验证主分支状态: git log --oneline -5"
    echo "2. 删除本地 refactor01 分支: git branch -d refactor01"
    echo "3. 删除远程 refactor01 分支: git push origin --delete refactor01"
    echo "4. 开始 Vercel 部署: ./deploy-vercel.sh"
    echo ""
    echo "🚀 项目现在可以部署到生产环境了！"
else
    echo "❌ 合并失败，请检查冲突"
    echo "解决冲突后运行: git commit"
    exit 1
fi
