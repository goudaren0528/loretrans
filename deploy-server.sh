#!/bin/bash

# 服务器部署脚本 - 使用 ECR 镜像部署 Transly 翻译服务

set -e

echo "🚀 开始部署 Transly 翻译服务到服务器..."

# 检查必要工具
check_dependencies() {
    echo "📋 检查依赖工具..."
    
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    
    if ! command -v aws &> /dev/null; then
        echo "❌ AWS CLI 未安装，请先安装 AWS CLI"
        exit 1
    fi
    
    echo "✅ 所有依赖工具已安装"
}

# 检查环境变量
check_environment() {
    echo "🔧 检查环境配置..."
    
    if [ ! -f ".env.production" ]; then
        echo "❌ 缺少 .env.production 文件，请先配置环境变量"
        echo "📝 请复制 .env.production.example 并填入正确的值"
        exit 1
    fi
    
    source .env.production
    
    if [ -z "$ECR_REGISTRY" ] || [ -z "$ECR_REPOSITORY" ] || [ -z "$AWS_REGION" ]; then
        echo "❌ 环境变量配置不完整，请检查 .env.production 文件"
        echo "需要配置: ECR_REGISTRY, ECR_REPOSITORY, AWS_REGION"
        exit 1
    fi
    
    echo "✅ 环境配置检查完成"
}

# AWS 认证
setup_aws_auth() {
    echo "🔐 配置 AWS 认证..."
    
    # 检查 AWS 凭证
    if ! aws sts get-caller-identity &> /dev/null; then
        echo "❌ AWS 认证失败，请配置 AWS 凭证"
        echo "运行: aws configure"
        echo "或设置环境变量: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY"
        exit 1
    fi
    
    echo "✅ AWS 认证成功"
}

# ECR 登录
ecr_login() {
    echo "🔑 登录到 ECR..."
    
    aws ecr get-login-password --region $AWS_REGION | \
        docker login --username AWS --password-stdin $ECR_REGISTRY
    
    if [ $? -eq 0 ]; then
        echo "✅ ECR 登录成功"
    else
        echo "❌ ECR 登录失败"
        exit 1
    fi
}

# 拉取最新镜像
pull_images() {
    echo "📦 拉取最新的 Docker 镜像..."
    
    echo "拉取 NLLB 服务镜像..."
    docker pull $ECR_REGISTRY/$ECR_REPOSITORY:nllb-service-latest
    
    echo "拉取文件处理服务镜像..."
    docker pull $ECR_REGISTRY/$ECR_REPOSITORY:file-processor-latest
    
    echo "✅ 镜像拉取完成"
}

# 创建必要目录
setup_directories() {
    echo "📁 创建必要目录..."
    
    mkdir -p nginx/ssl
    mkdir -p monitoring
    
    echo "✅ 目录创建完成"
}

# 生成 Nginx 配置
generate_nginx_config() {
    echo "⚙️ 生成 Nginx 配置..."
    
    mkdir -p nginx
    
    cat > nginx/nginx.conf << 'EOF'
events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;
    
    # 性能优化
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    
    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # 上游服务定义
    upstream nllb_service {
        server nllb-service:8080;
        keepalive 32;
    }
    
    upstream file_processor {
        server file-processor:8081;
        keepalive 32;
    }
    
    # 限流配置
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=translate:10m rate=5r/s;
    
    server {
        listen 80;
        server_name _;
        
        # 客户端最大请求体大小 (用于文件上传)
        client_max_body_size 50M;
        
        # 超时配置
        proxy_connect_timeout 30s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # 健康检查端点
        location /health {
            access_log off;
            return 200 'OK';
            add_header Content-Type text/plain;
        }
        
        # NLLB 翻译服务 API
        location /api/translate {
            limit_req zone=translate burst=20 nodelay;
            
            proxy_pass http://nllb_service;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # CORS 头
            add_header Access-Control-Allow-Origin * always;
            add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS' always;
            add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range' always;
            
            if ($request_method = 'OPTIONS') {
                add_header Access-Control-Allow-Origin * always;
                add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS' always;
                add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range' always;
                add_header Access-Control-Max-Age 1728000;
                add_header Content-Type 'text/plain; charset=utf-8';
                add_header Content-Length 0;
                return 204;
            }
        }
        
        # 文件处理服务 API
        location /api/file {
            limit_req zone=api burst=10 nodelay;
            
            proxy_pass http://file_processor;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # 文件上传超时配置
            proxy_connect_timeout 30s;
            proxy_send_timeout 120s;
            proxy_read_timeout 120s;
        }
        
        # 服务健康检查
        location /api/nllb/health {
            proxy_pass http://nllb_service/health;
            access_log off;
        }
        
        location /api/files/health {
            proxy_pass http://file_processor/health;
            access_log off;
        }
        
        # 默认返回 API 信息
        location / {
            return 200 '{"service":"Transly Translation API","version":"1.0.0","status":"running"}';
            add_header Content-Type application/json;
        }
    }
}
EOF
    
    echo "✅ Nginx 配置生成完成"
}

# 启动服务
start_services() {
    echo "🚀 启动服务..."
    
    # 停止现有服务
    docker-compose -f docker-compose.production.yml down 2>/dev/null || true
    
    # 启动服务
    docker-compose -f docker-compose.production.yml up -d
    
    echo "✅ 服务启动完成"
}

# 验证部署
verify_deployment() {
    echo "🔍 验证部署状态..."
    
    sleep 10  # 等待服务启动
    
    echo "检查服务状态..."
    docker-compose -f docker-compose.production.yml ps
    
    echo "检查服务健康状态..."
    
    # 检查 Redis
    if curl -s http://localhost:6379 &> /dev/null; then
        echo "✅ Redis 服务正常"
    else
        echo "⚠️ Redis 服务检查失败"
    fi
    
    # 检查 NLLB 服务
    if curl -s http://localhost:8080/health | grep -q "ok\|OK\|healthy"; then
        echo "✅ NLLB 服务正常"
    else
        echo "⚠️ NLLB 服务检查失败"
    fi
    
    # 检查文件处理服务
    if curl -s http://localhost:8081/health | grep -q "ok\|OK\|healthy"; then
        echo "✅ 文件处理服务正常"
    else
        echo "⚠️ 文件处理服务检查失败"
    fi
    
    # 检查 Nginx
    if curl -s http://localhost/health | grep -q "OK"; then
        echo "✅ Nginx 代理正常"
    else
        echo "⚠️ Nginx 代理检查失败"
    fi
    
    echo "📋 部署完成！服务访问地址："
    echo "  🌐 API 网关: http://localhost/"
    echo "  🔤 翻译服务: http://localhost/api/translate"
    echo "  📄 文件服务: http://localhost/api/file"
    echo "  ❤️ 健康检查: http://localhost/health"
}

# 显示日志
show_logs() {
    echo "📊 显示服务日志..."
    docker-compose -f docker-compose.production.yml logs --tail=50
}

# 主函数
main() {
    echo "=================================================="
    echo "🚀 Transly 翻译服务部署脚本"
    echo "=================================================="
    
    check_dependencies
    check_environment
    setup_aws_auth
    ecr_login
    pull_images
    setup_directories
    generate_nginx_config
    start_services
    verify_deployment
    
    echo ""
    echo "🎉 部署完成！"
    echo ""
    echo "📌 管理命令："
    echo "  查看状态: docker-compose -f docker-compose.production.yml ps"
    echo "  查看日志: docker-compose -f docker-compose.production.yml logs -f"
    echo "  停止服务: docker-compose -f docker-compose.production.yml down"
    echo "  重启服务: docker-compose -f docker-compose.production.yml restart"
    echo ""
    echo "如需显示日志，请运行: $0 logs"
}

# 检查参数
if [ "$1" = "logs" ]; then
    show_logs
    exit 0
fi

# 运行主函数
main "$@"