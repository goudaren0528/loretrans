# NLLB生产环境部署指南

## 🎯 生产部署概述

本指南详细说明如何将NLLB 600M本地翻译服务部署到生产环境，提供稳定、高性能的翻译API服务。

## 🏗️ 部署架构选择

### 架构1：单服务器部署（推荐用于中小规模）

```
Internet → Load Balancer → NLLB Service → Cache Layer
                        ↓
                   Monitoring & Logs
```

**适用场景**：
- 日翻译量 < 10万次
- 用户并发 < 100
- 成本优先考虑

**配置要求**：
```yaml
服务器配置:
  CPU: 8核 Intel/AMD (或4核高频)
  内存: 16GB DDR4 (推荐32GB)
  存储: 500GB SSD
  网络: 100Mbps+ 带宽
  操作系统: Ubuntu 22.04 LTS / CentOS 8

估算成本:
  云服务器: $200-400/月
  带宽费用: $50-100/月
  总计: $250-500/月
```

### 架构2：高可用集群部署

```
Internet → CDN → Load Balancer → [NLLB-1, NLLB-2, NLLB-3]
                                      ↓
                               Redis Cluster → Database
                                      ↓
                               Monitoring Stack
```

**适用场景**：
- 日翻译量 > 50万次
- 24/7高可用要求
- 企业级服务

**配置要求**：
```yaml
主节点 (3台):
  CPU: 16核
  内存: 32GB
  存储: 1TB SSD
  
缓存节点 (3台):
  CPU: 4核
  内存: 16GB
  存储: 200GB SSD

负载均衡:
  Nginx/HAProxy
  健康检查间隔: 10s

估算成本:
  主服务器: $1500-2500/月
  缓存服务器: $300-500/月
  负载均衡: $100-200/月
  总计: $1900-3200/月
```

## ⚙️ 生产环境配置

### 1. 系统优化配置

```bash
# /etc/sysctl.conf 系统参数优化
vm.max_map_count=262144
vm.swappiness=1
net.core.somaxconn=32768
net.ipv4.tcp_max_syn_backlog=32768
fs.file-max=1000000

# /etc/security/limits.conf 进程限制
* soft nofile 1000000
* hard nofile 1000000
* soft nproc 1000000
* hard nproc 1000000

# 应用生效
sysctl -p
ulimit -n 1000000
```

### 2. Docker生产环境配置

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  nllb-service:
    image: nllb-local:production
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - PORT=8080
      - DEVICE=cpu
      - BATCH_SIZE=8
      - MAX_CONCURRENT_REQUESTS=20
      - LOG_LEVEL=info
    volumes:
      - ./models:/app/models:ro
      - ./logs:/app/logs
    deploy:
      resources:
        limits:
          memory: 16G
          cpus: '8.0'
        reservations:
          memory: 8G
          cpus: '4.0'
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 120s

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
      - ./redis.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - nllb-service

volumes:
  redis_data:
```

### 3. Nginx负载均衡配置

```nginx
# nginx.conf
upstream nllb_backend {
    least_conn;
    server 127.0.0.1:8080 max_fails=3 fail_timeout=30s;
    # 多实例部署时添加更多服务器
    # server 127.0.0.1:8081 max_fails=3 fail_timeout=30s;
    # server 127.0.0.1:8082 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    server_name your-domain.com;
    
    # HTTPS重定向
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL配置
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    
    # 安全头
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    
    # 限流配置
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    
    location /api/translate {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://nllb_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 超时配置
        proxy_connect_timeout 10s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # 缓存配置
        proxy_cache nllb_cache;
        proxy_cache_valid 200 1h;
        proxy_cache_key "$scheme$request_method$host$request_uri$request_body";
    }
    
    location /health {
        proxy_pass http://nllb_backend;
        access_log off;
    }
}

# 缓存配置
proxy_cache_path /var/cache/nginx/nllb levels=1:2 keys_zone=nllb_cache:100m inactive=60m;
```

## 📊 监控与运维

### 1. Prometheus监控配置

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'nllb-service'
    static_configs:
      - targets: ['localhost:8080']
    metrics_path: '/metrics'
    
  - job_name: 'redis'
    static_configs:
      - targets: ['localhost:6379']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']
```

### 2. Grafana仪表盘指标

```yaml
关键监控指标:
  系统指标:
    - CPU使用率
    - 内存使用率  
    - 磁盘I/O
    - 网络带宽
    
  应用指标:
    - 翻译请求量 (req/s)
    - 响应时间 (P95, P99)
    - 错误率
    - 并发连接数
    
  业务指标:
    - 翻译成功率
    - 语言对使用分布
    - 缓存命中率
    - 队列长度
```

### 3. 日志管理

```yaml
# 日志配置
应用日志:
  路径: /app/logs/
  格式: JSON结构化日志
  轮转: 每日轮转，保留30天
  
访问日志:
  路径: /var/log/nginx/
  格式: 标准combined格式
  轮转: 每日轮转，保留7天
  
错误日志:
  路径: /app/logs/error.log
  级别: WARN以上
  告警: 自动发送到监控系统
```

## 🔒 安全配置

### 1. API安全

```javascript
// 生产环境安全中间件
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// 速率限制
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每IP最多100次请求
  message: 'Too many requests, please try again later.'
});

// 安全头
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// API Key验证（可选）
const authenticateAPI = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || !isValidApiKey(apiKey)) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  next();
};
```

### 2. 防火墙配置

```bash
# UFW防火墙配置
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow from 10.0.0.0/8 to any port 8080  # 仅内网访问
ufw enable
```

## 💾 备份与恢复

### 1. 数据备份策略

```bash
#!/bin/bash
# backup.sh

# 模型文件备份
tar -czf "nllb-model-$(date +%Y%m%d).tar.gz" /app/models/

# 配置文件备份  
cp -r /app/config/ "/backup/config-$(date +%Y%m%d)/"

# 日志备份（保留最近30天）
find /app/logs/ -name "*.log" -mtime +30 -delete
tar -czf "logs-$(date +%Y%m%d).tar.gz" /app/logs/

# 上传到云存储
aws s3 cp nllb-model-$(date +%Y%m%d).tar.gz s3://your-backup-bucket/
```

### 2. 灾难恢复流程

```yaml
恢复步骤:
  1. 服务器重建:
     - 安装Docker和依赖
     - 恢复配置文件
     - 下载模型文件
     
  2. 数据恢复:
     - 从备份恢复模型
     - 重启服务容器
     - 验证服务功能
     
  3. 流量切换:
     - 更新DNS记录
     - 测试负载均衡
     - 监控服务状态

预计恢复时间: 30-60分钟
```

## 📈 性能优化

### 1. 模型优化

```python
# 模型量化优化（减少内存使用）
from transformers import AutoModelForSeq2SeqLM
import torch

model = AutoModelForSeq2SeqLM.from_pretrained("./models/nllb-600m")

# 动态量化
quantized_model = torch.quantization.quantize_dynamic(
    model, {torch.nn.Linear}, dtype=torch.qint8
)

# 保存优化后的模型
quantized_model.save_pretrained("./models/nllb-600m-quantized")
```

### 2. 缓存策略

```javascript
// Redis缓存配置
const cacheConfig = {
  // 翻译结果缓存1小时
  translation: { ttl: 3600, prefix: 'trans:' },
  
  // 语言检测缓存24小时  
  detection: { ttl: 86400, prefix: 'detect:' },
  
  // 频繁查询永久缓存
  frequent: { ttl: -1, prefix: 'freq:' }
};

// 缓存键生成
const getCacheKey = (type, data) => {
  const hash = crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
  return `${cacheConfig[type].prefix}${hash}`;
};
```

## 💰 成本优化建议

### 1. 资源优化

```yaml
成本节约策略:
  服务器选择:
    - 选择CPU优化实例
    - 使用预留实例（节省30-50%）
    - 按实际使用量选择配置
    
  网络优化:
    - 使用CDN减少带宽费用
    - 压缩API响应
    - 启用缓存机制
    
  存储优化:
    - 使用SSD仅存储热数据
    - 日志自动清理
    - 模型文件压缩存储
```

### 2. 扩展策略

```yaml
水平扩展:
  触发条件:
    - CPU使用率 > 80%（持续5分钟）
    - 内存使用率 > 85%
    - 响应时间 > 5秒
    
  扩展步骤:
    1. 启动新实例
    2. 健康检查通过
    3. 加入负载均衡池
    4. 验证流量分发
    
  缩容策略:
    - 低峰期自动缩容
    - 保持最小2个实例
    - 渐进式流量迁移
```

## ✅ 部署检查清单

### 上线前检查
- [ ] 服务器配置符合要求
- [ ] 模型文件完整性验证
- [ ] SSL证书配置正确
- [ ] 监控系统正常运行
- [ ] 备份策略已实施
- [ ] 安全配置已应用
- [ ] 负载测试通过
- [ ] 域名DNS配置正确

### 上线后验证
- [ ] 服务健康检查正常
- [ ] 翻译功能准确性验证
- [ ] 性能指标达标
- [ ] 错误日志检查
- [ ] 监控告警测试
- [ ] 备份恢复测试
- [ ] 安全扫描通过
- [ ] 用户验收测试

## 📞 技术支持

### 7x24小时监控
- 自动告警系统
- 性能监控仪表盘
- 日志分析平台
- 故障自动恢复

### 维护窗口
- 每周日凌晨2-4点
- 系统更新和优化
- 备份验证
- 性能调优

---

**部署成功后，您将拥有企业级的NLLB翻译服务，可以稳定支撑大规模的翻译需求！** 