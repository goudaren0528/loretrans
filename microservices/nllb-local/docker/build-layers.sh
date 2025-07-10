#!/bin/bash

# NLLB分层镜像构建脚本
# 支持构建base、model、app层或全部层

set -e

# 配置
ECR_REGISTRY="034986963036.dkr.ecr.ap-southeast-1.amazonaws.com"
ECR_REPOSITORY="looplay"
DOCKERFILE_DIR="$(dirname "$0")"
CONTEXT_DIR="$(dirname "$DOCKERFILE_DIR")"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
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
    echo "NLLB分层镜像构建脚本"
    echo ""
    echo "用法: $0 [选项] <层级>"
    echo ""
    echo "层级:"
    echo "  base     构建基础环境镜像"
    echo "  model    构建模型镜像（需要base镜像）"
    echo "  app      构建应用镜像（需要model镜像）"
    echo "  all      构建所有层级"
    echo ""
    echo "选项:"
    echo "  -p, --push     构建后推送到ECR"
    echo "  -f, --force    强制重新构建（忽略缓存）"
    echo "  -h, --help     显示帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 app                # 只构建应用层"
    echo "  $0 --push all         # 构建所有层并推送到ECR"
    echo "  $0 --force model      # 强制重新构建模型层"
}

# 检查Docker是否运行
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker未运行或无权限访问"
        exit 1
    fi
}

# 检查ECR登录状态
check_ecr_login() {
    log_info "检查ECR登录状态..."
    if ! aws ecr describe-repositories --region ap-southeast-1 >/dev/null 2>&1; then
        log_warning "ECR登录已过期，正在重新登录..."
        aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin ${ECR_REGISTRY}
    fi
}

# 构建基础镜像
build_base() {
    local image_name="${ECR_REGISTRY}/${ECR_REPOSITORY}:nllb-base-latest"
    
    log_info "构建基础环境镜像..."
    
    docker build \
        ${FORCE_FLAG} \
        -f "${DOCKERFILE_DIR}/Dockerfile.base" \
        -t "${image_name}" \
        "${CONTEXT_DIR}"
    
    log_success "基础环境镜像构建完成: ${image_name}"
    
    if [ "$PUSH" = true ]; then
        log_info "推送基础镜像到ECR..."
        docker push "${image_name}"
        log_success "基础镜像推送完成"
    fi
}

# 构建模型镜像
build_model() {
    local image_name="${ECR_REGISTRY}/${ECR_REPOSITORY}:nllb-model-latest"
    
    log_info "构建模型镜像..."
    log_warning "注意：模型下载可能需要较长时间（首次构建）"
    
    docker build \
        ${FORCE_FLAG} \
        -f "${DOCKERFILE_DIR}/Dockerfile.model" \
        -t "${image_name}" \
        --build-arg ECR_REGISTRY="${ECR_REGISTRY}" \
        --build-arg ECR_REPOSITORY="${ECR_REPOSITORY}" \
        "${CONTEXT_DIR}"
    
    log_success "模型镜像构建完成: ${image_name}"
    
    if [ "$PUSH" = true ]; then
        log_info "推送模型镜像到ECR..."
        docker push "${image_name}"
        log_success "模型镜像推送完成"
    fi
}

# 构建应用镜像
build_app() {
    local image_name="${ECR_REGISTRY}/${ECR_REPOSITORY}:nllb-service-latest"
    
    log_info "构建应用镜像..."
    
    docker build \
        ${FORCE_FLAG} \
        -f "${DOCKERFILE_DIR}/Dockerfile.app" \
        -t "${image_name}" \
        --build-arg ECR_REGISTRY="${ECR_REGISTRY}" \
        --build-arg ECR_REPOSITORY="${ECR_REPOSITORY}" \
        "${CONTEXT_DIR}"
    
    log_success "应用镜像构建完成: ${image_name}"
    
    if [ "$PUSH" = true ]; then
        log_info "推送应用镜像到ECR..."
        docker push "${image_name}"
        log_success "应用镜像推送完成"
    fi
}

# 解析命令行参数
PUSH=false
FORCE_FLAG=""
LAYER=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--push)
            PUSH=true
            shift
            ;;
        -f|--force)
            FORCE_FLAG="--no-cache"
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        base|model|app|all)
            LAYER="$1"
            shift
            ;;
        *)
            log_error "未知参数: $1"
            show_help
            exit 1
            ;;
    esac
done

# 检查必要参数
if [ -z "$LAYER" ]; then
    log_error "请指定要构建的层级"
    show_help
    exit 1
fi

# 主执行流程
main() {
    log_info "开始NLLB分层镜像构建..."
    log_info "目标层级: $LAYER"
    log_info "推送到ECR: $PUSH"
    log_info "强制重建: $([ -n "$FORCE_FLAG" ] && echo "是" || echo "否")"
    
    check_docker
    
    if [ "$PUSH" = true ]; then
        check_ecr_login
    fi
    
    case $LAYER in
        base)
            build_base
            ;;
        model)
            build_model
            ;;
        app)
            build_app
            ;;
        all)
            build_base
            build_model
            build_app
            ;;
    esac
    
    log_success "构建完成！"
    
    # 显示镜像信息
    echo ""
    log_info "本地镜像列表："
    docker images | grep "${ECR_REPOSITORY}" | grep nllb
}

# 错误处理
trap 'log_error "构建过程中发生错误，退出码: $?"' ERR

# 执行主函数
main "$@"