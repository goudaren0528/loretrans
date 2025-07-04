# NLLB 分层镜像架构

## 🏗️ 架构概述

为了优化构建时间和镜像管理，NLLB服务采用了三层镜像架构：

```
📦 Base Layer (nllb-base)
├── Node.js 18 + Python 3
├── 系统依赖 (build-essential, curl等)
└── Python ML库 (transformers, torch, sentencepiece)

📦 Model Layer (nllb-model) 
├── 基于 Base Layer
├── 预下载的 NLLB-600M 模型
└── 模型验证脚本

📦 App Layer (nllb-service)
├── 基于 Model Layer  
├── Node.js 应用代码
└── 生产环境配置
```

## 🚀 优势

- ⚡ **构建速度**：代码变更时只需重建App层（~30秒）
- 💾 **存储优化**：分层缓存，避免重复下载模型
- 🔄 **版本控制**：每层独立版本管理
- 📈 **扩展性**：可复用Base和Model层

## 🛠️ 本地构建

### 使用构建脚本

```bash
# 构建所有层级（首次）
./docker/build-layers.sh --push all

# 只构建应用层（日常开发）
./docker/build-layers.sh --push app

# 强制重建模型层
./docker/build-layers.sh --force --push model
```

### 手动构建

```bash
# 1. 基础环境层
docker build -f docker/Dockerfile.base -t nllb-base .

# 2. 模型层
docker build -f docker/Dockerfile.model -t nllb-model .

# 3. 应用层
docker build -f docker/Dockerfile.app -t nllb-service .
```

## ☁️ CI/CD 构建

项目配置了GitHub Actions自动化构建：

### 自动触发

- **代码变更**：推送到main分支时自动检测变更层级
- **智能构建**：只构建必要的层级
- **缓存优化**：利用GitHub Actions缓存加速构建

### 手动触发

1. **完整构建**：
   - 进入 GitHub → Actions → "Build NLLB Layered Images"
   - 选择 "Run workflow" → 选择层级 → 运行

2. **快速应用构建**：
   - 进入 GitHub → Actions → "Quick Build NLLB App"
   - 点击 "Run workflow" → 运行

## 📦 镜像标签

```bash
# ECR镜像仓库标签
034986963036.dkr.ecr.ap-southeast-1.amazonaws.com/looplay:

├── nllb-base-latest      # 基础环境（稳定）
├── nllb-model-latest     # 模型层（稳定）
├── nllb-service-latest   # 应用层（频繁更新）
├── nllb-base-{sha}       # 特定版本
├── nllb-model-{sha}      # 特定版本
└── nllb-service-{sha}    # 特定版本
```

## 🚀 部署

### 快速部署

```bash
# 使用预构建镜像快速部署
./deploy-layered.sh

# 更新并部署
./deploy-layered.sh --update

# 部署后查看日志
./deploy-layered.sh --logs
```

### 传统部署

```bash
# 拉取最新镜像
docker-compose -f docker-compose.production.yml pull nllb-service

# 启动服务
docker-compose -f docker-compose.production.yml up -d nllb-service
```

## 📋 开发工作流

### 1. 首次设置（一次性）

```bash
# 在GitHub Actions中构建基础层和模型层
# 或者本地构建并推送
./docker/build-layers.sh --push all
```

### 2. 日常开发（高频）

```bash
# 1. 修改代码
vim src/index.js

# 2. 推送代码（自动触发CI构建应用层）
git add . && git commit -m "update: 修改翻译逻辑" && git push

# 3. CI完成后，快速部署
./deploy-layered.sh --update
```

### 3. 模型更新（低频）

```bash
# 手动触发GitHub Actions构建模型层
# 或者本地构建
./docker/build-layers.sh --force --push model
```

## 🔧 配置文件

- **Dockerfile.base**：基础环境定义
- **Dockerfile.model**：模型层定义  
- **Dockerfile.app**：应用层定义
- **build-layers.sh**：本地构建脚本
- **deploy-layered.sh**：快速部署脚本

## 📊 构建时间对比

| 操作 | 传统单层 | 分层架构 |
|------|----------|----------|
| 首次构建 | 10-15分钟 | 10-15分钟 |
| 代码变更 | 10-15分钟 | 30秒-2分钟 |
| 模型更新 | 10-15分钟 | 5-8分钟 |
| 环境更新 | 10-15分钟 | 8-12分钟 |

## 🎯 最佳实践

1. **基础层更新**：仅在添加新依赖时更新
2. **模型层更新**：仅在模型版本变更时更新  
3. **应用层更新**：代码变更时频繁更新
4. **标签管理**：生产环境使用特定SHA标签
5. **缓存利用**：充分利用Docker层缓存和CI缓存

## 🐛 故障排除

### 构建失败

```bash
# 检查基础层是否存在
docker images | grep nllb-base

# 清理缓存重新构建
./docker/build-layers.sh --force app
```

### 部署失败

```bash
# 检查镜像是否存在
docker images | grep nllb-service

# 检查服务状态
docker-compose -f docker-compose.production.yml ps

# 查看服务日志
docker-compose -f docker-compose.production.yml logs nllb-service
```