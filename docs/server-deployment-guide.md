# 服务器部署指南 - 使用 ECR 镜像

## 📋 概述

本指南将帮助你使用 GitHub Actions 构建的 ECR 镜像在服务器上部署 Transly 翻译服务。

## 🏗️ 架构概览

部署后的服务架构：

```
Internet
    ↓
Nginx (端口 80/443)
    ↓
┌─────────────┬─────────────┐
│ NLLB 服务   │ 文件处理服务  │
│ (端口 8080) │ (端口 8081)  │
└─────────────┴─────────────┘
         ↓
    Redis (端口 6379)
```

## 📦 部署的服务

1. **NLLB 翻译服务** - 提供AI翻译功能
2. **文件处理服务** - 处理文档上传和批量翻译
3. **Redis** - 缓存和队列服务
4. **Nginx** - 反向代理和负载均衡

## 🚀 快速部署

### 1. 准备工作

**服务器要求：**
- Ubuntu 20.04+ / CentOS 8+ / Amazon Linux 2
- 最低配置：4核 CPU, 8GB RAM, 50GB 磁盘
- 推荐配置：8核 CPU, 16GB RAM, 100GB SSD

**安装必要软件：**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y docker.io docker-compose awscli curl

# CentOS/RHEL
sudo yum install -y docker docker-compose awscli curl
sudo systemctl start docker
sudo systemctl enable docker

# Amazon Linux 2
sudo yum update -y
sudo amazon-linux-extras install docker
sudo yum install -y docker-compose awscli curl
sudo systemctl start docker
sudo systemctl enable docker

# 添加当前用户到 docker 组
sudo usermod -aG docker $USER
# 重新登录或运行
newgrp docker
```

### 2. 下载部署文件

```bash
# 克隆仓库（或下载部署文件）
git clone <your-repo-url>
cd translation-low-source/main

# 或者手动下载部署文件
# wget <your-repo-url>/docker-compose.production.yml
# wget <your-repo-url>/.env.production
# wget <your-repo-url>/deploy-server.sh
```

### 3. 配置环境变量

复制并编辑环境配置文件：

```bash
cp .env.production .env.production.local
```

编辑 `.env.production.local` 文件，填入你的实际值：

```bash
# 替换为你的 ECR 信息
ECR_REGISTRY=123456789012.dkr.ecr.us-west-2.amazonaws.com
ECR_REPOSITORY=looplay
AWS_REGION=us-west-2

# 其他配置保持默认即可
```

### 4. 配置 AWS 认证

```bash
# 方法 1: 使用 AWS CLI 配置
aws configure
# 输入: Access Key ID, Secret Access Key, Region

# 方法 2: 使用环境变量
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key
export AWS_DEFAULT_REGION=us-west-2

# 方法 3: 使用 IAM 角色 (推荐用于 EC2)
# 为 EC2 实例附加具有 ECR 访问权限的 IAM 角色
```

### 5. 运行部署脚本

```bash
# 使用自动化部署脚本
./deploy-server.sh

# 脚本会自动执行以下步骤：
# 1. 检查依赖工具
# 2. 验证环境配置
# 3. ECR 登录
# 4. 拉取最新镜像
# 5. 生成 Nginx 配置
# 6. 启动所有服务
# 7. 验证部署状态
```

### 6. 验证部署

部署完成后，检查服务状态：

```bash
# 检查容器状态
docker-compose -f docker-compose.production.yml ps

# 检查服务健康状态
curl http://localhost/health                    # 整体健康检查
curl http://localhost/api/nllb/health          # NLLB 服务
curl http://localhost/api/files/health         # 文件处理服务

# 测试翻译功能
curl -X POST http://localhost/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world","sourceLanguage":"en","targetLanguage":"ht"}'
```

## 🔧 手动部署

如果你偏好手动控制部署过程：

### 1. ECR 登录

```bash
# 获取 ECR 登录命令
aws ecr get-login-password --region us-west-2 | \
    docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-west-2.amazonaws.com
```

### 2. 拉取镜像

```bash
# 设置环境变量
export ECR_REGISTRY=123456789012.dkr.ecr.us-west-2.amazonaws.com
export ECR_REPOSITORY=looplay

# 拉取最新镜像
docker pull $ECR_REGISTRY/$ECR_REPOSITORY:nllb-service-latest
docker pull $ECR_REGISTRY/$ECR_REPOSITORY:file-processor-latest
```

### 3. 启动服务

```bash
# 使用环境变量文件启动
docker-compose -f docker-compose.production.yml --env-file .env.production.local up -d

# 查看启动日志
docker-compose -f docker-compose.production.yml logs -f
```

## 🛠️ 配置详解

### Docker Compose 配置

主要服务配置参数：

```yaml
# NLLB 服务环境变量
environment:
  - BATCH_SIZE=4              # 批处理大小，影响内存使用
  - MAX_CONCURRENT_REQUESTS=5 # 并发请求限制
  - DEVICE=cpu               # 计算设备：cpu 或 gpu
  - NODE_OPTIONS=--max-old-space-size=4096  # Node.js 内存限制

# 资源限制
deploy:
  resources:
    limits:
      memory: 6G           # 内存限制
      cpus: '4.0'         # CPU 限制
    reservations:
      memory: 3G          # 内存预留
      cpus: '2.0'        # CPU 预留
```

### Nginx 配置

主要配置特性：

- **反向代理**: 将请求路由到对应的后端服务
- **负载均衡**: 支持多实例部署
- **限流保护**: API 调用频率限制
- **CORS 支持**: 跨域请求处理
- **文件上传**: 支持最大 50MB 文件上传

### 监控配置

可选启用监控服务：

```bash
# 启动包含监控的完整服务
docker-compose -f docker-compose.production.yml --profile monitoring up -d

# 访问监控界面
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3001 (admin/admin123)
```

## 📊 服务管理

### 常用命令

```bash
# 查看服务状态
docker-compose -f docker-compose.production.yml ps

# 查看实时日志
docker-compose -f docker-compose.production.yml logs -f

# 查看特定服务日志
docker-compose -f docker-compose.production.yml logs -f nllb-service

# 重启服务
docker-compose -f docker-compose.production.yml restart

# 停止服务
docker-compose -f docker-compose.production.yml down

# 更新镜像并重启
./deploy-server.sh  # 重新运行部署脚本
```

### 扩容配置

**垂直扩容（增加资源）：**

编辑 `docker-compose.production.yml`：

```yaml
deploy:
  resources:
    limits:
      memory: 8G      # 增加内存
      cpus: '6.0'     # 增加 CPU
```

**水平扩容（增加实例）：**

```bash
# 启动多个 NLLB 服务实例
docker-compose -f docker-compose.production.yml up -d --scale nllb-service=3

# Nginx 会自动负载均衡到多个实例
```

## 🔒 安全配置

### 防火墙配置

```bash
# Ubuntu/Debian (ufw)
sudo ufw allow 22      # SSH
sudo ufw allow 80      # HTTP
sudo ufw allow 443     # HTTPS
sudo ufw enable

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-port=22/tcp
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --reload
```

### SSL/TLS 配置

为生产环境添加 HTTPS 支持：

```bash
# 使用 Let's Encrypt 获取证书
sudo apt install certbot
sudo certbot certonly --standalone -d your-domain.com

# 复制证书到 SSL 目录
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/

# 更新 Nginx 配置以支持 HTTPS
# (需要修改 nginx/nginx.conf 添加 SSL 配置)
```

### 环境变量安全

```bash
# 设置文件权限
chmod 600 .env.production.local

# 使用 Docker secrets (可选)
echo "your-secret-value" | docker secret create api_key -
```

## 📈 性能优化

### 系统优化

```bash
# 增加文件描述符限制
echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf

# 优化 TCP 参数
echo 'net.core.somaxconn = 65536' | sudo tee -a /etc/sysctl.conf
echo 'net.ipv4.tcp_max_syn_backlog = 65536' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### 应用优化

根据服务器配置调整参数：

```bash
# 高配置服务器 (16GB+ RAM)
NLLB_BATCH_SIZE=8
NLLB_MAX_CONCURRENT=10
NLLB_MEMORY_LIMIT=10G

# 中等配置服务器 (8GB RAM)
NLLB_BATCH_SIZE=4
NLLB_MAX_CONCURRENT=5
NLLB_MEMORY_LIMIT=6G

# 低配置服务器 (4GB RAM)
NLLB_BATCH_SIZE=2
NLLB_MAX_CONCURRENT=3
NLLB_MEMORY_LIMIT=3G
```

## 🆘 故障排除

### 常见问题

**1. ECR 登录失败**
```bash
# 检查 AWS 凭证
aws sts get-caller-identity

# 检查 ECR 仓库权限
aws ecr describe-repositories --repository-names looplay
```

**2. 镜像拉取失败**
```bash
# 检查网络连接
ping 123456789012.dkr.ecr.us-west-2.amazonaws.com

# 手动拉取镜像
docker pull 123456789012.dkr.ecr.us-west-2.amazonaws.com/looplay:nllb-service-latest
```

**3. 服务启动失败**
```bash
# 查看详细错误日志
docker-compose -f docker-compose.production.yml logs nllb-service

# 检查资源使用
docker stats

# 检查端口占用
netstat -tlnp | grep :8080
```

**4. 内存不足**
```bash
# 减少批处理大小
export NLLB_BATCH_SIZE=2

# 增加交换空间
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### 日志分析

```bash
# 查看系统资源使用
htop
df -h
free -h

# 查看 Docker 日志
docker system df
docker system prune  # 清理未使用的资源

# 查看服务特定日志
docker-compose -f docker-compose.production.yml logs --tail=100 nllb-service
```

## 🔄 更新部署

当有新的镜像版本时：

```bash
# 方法 1: 重新运行部署脚本
./deploy-server.sh

# 方法 2: 手动更新
docker-compose -f docker-compose.production.yml pull
docker-compose -f docker-compose.production.yml up -d

# 方法 3: 滚动更新 (零停机)
docker-compose -f docker-compose.production.yml up -d --no-deps nllb-service
```

## 📞 技术支持

如遇到部署问题，请提供以下信息：

1. 服务器配置和操作系统版本
2. Docker 和 Docker Compose 版本
3. 错误日志输出
4. 部署环境变量配置（隐藏敏感信息）

---

🎉 **部署成功后，你的翻译服务将通过以下地址提供服务：**

- **API 网关**: `http://your-server-ip/`
- **翻译服务**: `http://your-server-ip/api/translate`
- **文件处理**: `http://your-server-ip/api/file`
- **健康检查**: `http://your-server-ip/health`