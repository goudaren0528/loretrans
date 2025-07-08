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
