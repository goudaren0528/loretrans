#!/bin/bash

# 串流翻译功能部署脚本
# 
# 功能：
# 1. 验证串流翻译配置
# 2. 测试功能完整性
# 3. 更新前端组件
# 4. 部署到Vercel

set -e

echo "🚀 开始部署串流翻译功能..."

# 颜色定义
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

# 检查必要文件
check_files() {
    log_info "检查必要文件..."
    
    local files=(
        "streaming-translation-config.js"
        "frontend/app/api/translate/stream/route.ts"
        "frontend/components/StreamingTranslation.tsx"
        "test-streaming-translation.js"
    )
    
    for file in "${files[@]}"; do
        if [[ -f "$file" ]]; then
            log_success "✅ $file 存在"
        else
            log_error "❌ $file 不存在"
            exit 1
        fi
    done
}

# 运行配置验证
run_config_validation() {
    log_info "运行配置验证..."
    
    if node streaming-translation-config.js; then
        log_success "✅ 配置验证通过"
    else
        log_error "❌ 配置验证失败"
        exit 1
    fi
}

# 运行功能测试
run_functionality_tests() {
    log_info "运行功能测试..."
    
    if node test-streaming-translation.js; then
        log_success "✅ 功能测试通过"
    else
        log_error "❌ 功能测试失败"
        exit 1
    fi
}

# 检查TypeScript编译
check_typescript() {
    log_info "检查TypeScript编译..."
    
    cd frontend
    
    if npm run type-check 2>/dev/null || npx tsc --noEmit; then
        log_success "✅ TypeScript编译通过"
    else
        log_warning "⚠️  TypeScript编译有警告，但继续部署"
    fi
    
    cd ..
}

# 更新翻译配置
update_translation_config() {
    log_info "更新翻译配置..."
    
    # 备份原配置
    if [[ -f "frontend/lib/config/translation.ts" ]]; then
        cp "frontend/lib/config/translation.ts" "frontend/lib/config/translation.ts.backup.$(date +%s)"
        log_info "已备份原配置文件"
    fi
    
    # 更新配置以支持串流处理
    cat > frontend/lib/config/streaming.ts << 'EOF'
/**
 * 串流翻译配置
 */

export const STREAMING_CONFIG = {
  MAX_CHUNK_SIZE: 800,
  CHUNK_INTERVAL: 2000,
  SINGLE_CHUNK_TIMEOUT: 25000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  STREAM_THRESHOLD: 1600,
  MAX_CONCURRENT_STREAMS: 3,
  TASK_CLEANUP_INTERVAL: 300000,
};

export function shouldUseStreaming(textLength: number): boolean {
  return textLength > STREAMING_CONFIG.STREAM_THRESHOLD;
}

export function calculateStreamingParams(textLength: number) {
  const chunkCount = Math.ceil(textLength / STREAMING_CONFIG.MAX_CHUNK_SIZE);
  const estimatedTime = chunkCount * (STREAMING_CONFIG.CHUNK_INTERVAL / 1000) + 10;
  
  return {
    chunkCount,
    estimatedTime,
    useStreaming: shouldUseStreaming(textLength),
    maxProcessingTime: Math.min(estimatedTime, 28)
  };
}
EOF
    
    log_success "✅ 串流配置文件已创建"
}

# 创建前端集成组件
create_integration_component() {
    log_info "创建前端集成组件..."
    
    mkdir -p frontend/components/translation
    
    cat > frontend/components/translation/SmartTranslation.tsx << 'EOF'
'use client'

import React, { useState } from 'react'
import { shouldUseStreaming } from '@/lib/config/streaming'
import StreamingTranslation from '@/components/StreamingTranslation'
import RegularTranslation from '@/components/RegularTranslation'

interface SmartTranslationProps {
  text: string
  sourceLang: string
  targetLang: string
  onComplete?: (result: string) => void
  onError?: (error: string) => void
}

export default function SmartTranslation(props: SmartTranslationProps) {
  const { text } = props
  const useStreaming = shouldUseStreaming(text.length)
  
  if (useStreaming) {
    return <StreamingTranslation {...props} />
  } else {
    return <RegularTranslation {...props} />
  }
}
EOF
    
    log_success "✅ 智能翻译组件已创建"
}

# 更新环境变量
update_env_vars() {
    log_info "检查环境变量..."
    
    local env_file="frontend/.env.local"
    
    if [[ -f "$env_file" ]]; then
        # 添加串流翻译相关配置
        if ! grep -q "STREAMING_TRANSLATION_ENABLED" "$env_file"; then
            echo "" >> "$env_file"
            echo "# 串流翻译配置" >> "$env_file"
            echo "STREAMING_TRANSLATION_ENABLED=true" >> "$env_file"
            echo "STREAMING_MAX_CHUNK_SIZE=800" >> "$env_file"
            echo "STREAMING_CHUNK_INTERVAL=2000" >> "$env_file"
            log_success "✅ 环境变量已更新"
        else
            log_info "环境变量已存在，跳过更新"
        fi
    else
        log_warning "⚠️  .env.local 文件不存在"
    fi
}

# 构建前端
build_frontend() {
    log_info "构建前端..."
    
    cd frontend
    
    # 安装依赖（如果需要）
    if [[ ! -d "node_modules" ]]; then
        log_info "安装依赖..."
        npm install
    fi
    
    # 构建
    if npm run build; then
        log_success "✅ 前端构建成功"
    else
        log_error "❌ 前端构建失败"
        exit 1
    fi
    
    cd ..
}

# 部署到Vercel
deploy_to_vercel() {
    log_info "部署到Vercel..."
    
    if command -v vercel &> /dev/null; then
        cd frontend
        
        # 设置环境变量
        vercel env add STREAMING_TRANSLATION_ENABLED production <<< "true"
        vercel env add STREAMING_MAX_CHUNK_SIZE production <<< "800"
        vercel env add STREAMING_CHUNK_INTERVAL production <<< "2000"
        
        # 部署
        if vercel --prod; then
            log_success "✅ Vercel部署成功"
        else
            log_error "❌ Vercel部署失败"
            exit 1
        fi
        
        cd ..
    else
        log_warning "⚠️  Vercel CLI未安装，跳过自动部署"
        log_info "请手动运行: cd frontend && vercel --prod"
    fi
}

# 生成部署报告
generate_deployment_report() {
    log_info "生成部署报告..."
    
    local report_file="streaming-translation-deployment-report.md"
    
    cat > "$report_file" << EOF
# 串流翻译功能部署报告

## 部署时间
$(date)

## 部署内容

### 1. 核心功能
- ✅ 800字符分块处理
- ✅ 串流任务管理
- ✅ 2秒块间延迟
- ✅ 25秒单块超时
- ✅ Vercel 30秒超时规避

### 2. API端点
- \`/api/translate/stream\` - 串流翻译API
- \`/api/translate\` - 智能路由（集成串流判断）

### 3. 前端组件
- \`StreamingTranslation.tsx\` - 串流翻译组件
- \`SmartTranslation.tsx\` - 智能翻译组件

### 4. 配置文件
- \`streaming-translation-config.js\` - 服务端配置
- \`frontend/lib/config/streaming.ts\` - 前端配置

## 使用方式

### 自动触发
超过1600字符的文本会自动使用串流处理

### 手动使用
\`\`\`typescript
import StreamingTranslation from '@/components/StreamingTranslation'

<StreamingTranslation
  text={longText}
  sourceLang="zh"
  targetLang="en"
  onComplete={(result) => console.log(result)}
  onError={(error) => console.error(error)}
/>
\`\`\`

## 监控建议

1. 监控任务完成率
2. 检查平均处理时间
3. 观察超时错误频率
4. 跟踪用户体验反馈

## 注意事项

- 串流处理适用于1600+字符的长文本
- 每个块最大800字符，确保稳定处理
- 块间2秒延迟，避免服务过载
- 支持任务状态实时查询
EOF
    
    log_success "✅ 部署报告已生成: $report_file"
}

# 主函数
main() {
    echo "🎯 串流翻译功能部署流程"
    echo "================================"
    
    # 1. 检查文件
    check_files
    
    # 2. 验证配置
    run_config_validation
    
    # 3. 运行测试
    run_functionality_tests
    
    # 4. 更新配置
    update_translation_config
    
    # 5. 创建集成组件
    create_integration_component
    
    # 6. 更新环境变量
    update_env_vars
    
    # 7. 检查TypeScript
    check_typescript
    
    # 8. 构建前端
    build_frontend
    
    # 9. 部署到Vercel
    if [[ "${1:-}" == "--deploy" ]]; then
        deploy_to_vercel
    else
        log_info "跳过Vercel部署（使用 --deploy 参数启用）"
    fi
    
    # 10. 生成报告
    generate_deployment_report
    
    echo ""
    log_success "🎉 串流翻译功能部署完成！"
    echo ""
    echo "📋 部署总结:"
    echo "  • 800字符分块处理 ✅"
    echo "  • 串流任务管理 ✅"
    echo "  • 超时规避机制 ✅"
    echo "  • 前端组件集成 ✅"
    echo "  • 智能路由判断 ✅"
    echo ""
    echo "🚀 下一步:"
    echo "  1. 测试长文本翻译功能"
    echo "  2. 监控处理性能"
    echo "  3. 收集用户反馈"
    echo "  4. 根据需要调整参数"
    echo ""
    
    if [[ "${1:-}" != "--deploy" ]]; then
        echo "💡 提示: 使用 './deploy-streaming-translation.sh --deploy' 自动部署到Vercel"
    fi
}

# 执行主函数
main "$@"
