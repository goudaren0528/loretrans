#!/bin/bash

# 分层镜像快速部署脚本
# 使用预构建的分层镜像快速部署NLLB服务

set -e

# 配置
ECR_REGISTRY="034986963036.dkr.ecr.ap-southeast-1.amazonaws.com"
ECR_REPOSITORY="looplay"
COMPOSE_FILE="docker-compose.production.yml"

# 颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 帮助信息
show_help() {
    echo "分层镜像快速部署脚本"
    echo ""
    echo "用法: $0 [选项] [服务名]"
    echo ""
    echo "服务名:"
    echo "  nllb       仅部署NLLB翻译服务（默认）"
    echo "  all        部署所有服务"
    echo ""
    echo "选项:"
    echo "  -u, --update   更新镜像后部署"
    echo "  -r, --restart  重启服务"
    echo "  -l, --logs     部署后显示日志"
    echo "  -h, --help     显示帮助信息"
    echo ""
    echo "示例:"
    echo "  $0                    # 快速部署NLLB服务"
    echo "  $0 --update nllb      # 拉取最新镜像并部署NLLB"
    echo "  $0 --logs all         # 部署所有服务并显示日志"
}

# 检查环境
check_environment() {
    # 检查Docker
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker未运行或无权限访问"
        exit 1
    fi
    
    # 检查docker-compose文件
    if [ ! -f "$COMPOSE_FILE" ]; then
        log_error "找不到 $COMPOSE_FILE 文件"
        exit 1
    fi
    
    # 检查.env.production文件
    if [ ! -f ".env.production" ]; then
        log_error "找不到 .env.production 文件"
        exit 1
    fi
}

# ECR登录
login_ecr() {
    log_info "检查ECR登录状态..."
    if ! aws ecr describe-repositories --region ap-southeast-1 >/dev/null 2>&1; then
        log_warning "ECR登录已过期，正在重新登录..."
        aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin ${ECR_REGISTRY}
        log_success "ECR登录成功"
    else
        log_info "ECR已登录"
    fi
}

# 拉取最新镜像
pull_images() {
    local service=$1
    log_info "拉取最新镜像: $service"
    
    docker-compose -f "$COMPOSE_FILE" --env-file .env.production pull $service
    log_success "镜像拉取完成"
}

# 部署服务
deploy_service() {
    local service=$1
    log_info "部署服务: $service"
    
    docker-compose -f "$COMPOSE_FILE" --env-file .env.production up -d $service
    log_success "服务部署完成"
}

# 检查服务状态
check_service_status() {
    local service=$1
    log_info "检查服务状态..."
    
    sleep 5
    
    # 检查容器状态
    if docker-compose -f "$COMPOSE_FILE" --env-file .env.production ps $service | grep -q "Up"; then
        log_success "服务运行正常"
        
        # 如果是NLLB服务，检查健康状态
        if [ "$service" = "nllb-service" ] || [ "$service" = "" ]; then
            log_info "等待NLLB服务启动..."
            sleep 10
            
            container_name=$(docker-compose -f "$COMPOSE_FILE" --env-file .env.production ps -q nllb-service)
            if [ -n "$container_name" ]; then
                health_status=$(docker inspect --format='{{.State.Health.Status}}' $container_name 2>/dev/null || echo "no-health-check")
                log_info "健康状态: $health_status"
            fi
        fi
    else
        log_error "服务启动失败"
        return 1
    fi
}

# 显示日志
show_logs() {
    local service=$1
    log_info "显示服务日志 (Ctrl+C 退出)..."
    docker-compose -f "$COMPOSE_FILE" --env-file .env.production logs -f --tail=50 $service
}

# 解析命令行参数
UPDATE=false
RESTART=false
SHOW_LOGS=false
SERVICE=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -u|--update)
            UPDATE=true
            shift
            ;;
        -r|--restart)
            RESTART=true
            shift
            ;;
        -l|--logs)
            SHOW_LOGS=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        nllb|all)
            SERVICE="$1"
            shift
            ;;
        *)
            log_error "未知参数: $1"
            show_help
            exit 1
            ;;
    esac
done

# 默认服务
if [ -z "$SERVICE" ]; then
    SERVICE="nllb-service"
elif [ "$SERVICE" = "nllb" ]; then
    SERVICE="nllb-service"
elif [ "$SERVICE" = "all" ]; then
    SERVICE=""
fi

# 主执行流程
main() {
    echo "🚀 NLLB分层镜像快速部署"
    echo "========================"
    echo "目标服务: ${SERVICE:-所有服务}"
    echo "更新镜像: $([ "$UPDATE" = true ] && echo "是" || echo "否")"
    echo "重启服务: $([ "$RESTART" = true ] && echo "是" || echo "否")"
    echo "显示日志: $([ "$SHOW_LOGS" = true ] && echo "是" || echo "否")"
    echo ""
    
    check_environment
    
    if [ "$UPDATE" = true ]; then
        login_ecr
        pull_images "$SERVICE"
    fi
    
    if [ "$RESTART" = true ]; then
        log_info "重启服务..."
        docker-compose -f "$COMPOSE_FILE" --env-file .env.production restart $SERVICE
    else
        deploy_service "$SERVICE"
    fi
    
    check_service_status "$SERVICE"
    
    log_success "🎉 部署完成！"
    
    # 显示访问信息
    if [ "$SERVICE" = "nllb-service" ] || [ "$SERVICE" = "" ]; then
        echo ""
        log_info "📡 NLLB服务访问信息："
        echo "  健康检查: http://100.91.195.13:8082/health"
        echo "  翻译接口: http://100.91.195.13:8082/translate"
        echo "  支持语言: http://100.91.195.13:8082/languages"
    fi
    
    if [ "$SHOW_LOGS" = true ]; then
        echo ""
        show_logs "$SERVICE"
    fi
}

# 错误处理
trap 'log_error "部署过程中发生错误，退出码: $?"' ERR

# 执行主函数
main "$@"