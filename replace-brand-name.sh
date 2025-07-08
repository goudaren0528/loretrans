#!/bin/bash

# =============================================
# 品牌名称替换脚本
# 将 Loretrans 替换为 Loretrans
# =============================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# 创建备份目录
BACKUP_DIR="./brand-replacement-backup-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

log_info "开始品牌名称替换: Loretrans -> Loretrans"
log_info "备份目录: $BACKUP_DIR"

# 需要替换的文件类型
FILE_EXTENSIONS=("*.js" "*.jsx" "*.ts" "*.tsx" "*.json" "*.md" "*.html" "*.sh" "*.txt")

# 替换映射
declare -A REPLACEMENTS=(
    ["Loretrans"]="Loretrans"
    ["loretrans"]="loretrans"
    ["LORETRANS"]="LORETRANS"
    ["Loretrans'"]="Loretrans'"
    ["loretrans'"]="loretrans'"
)

# 统计变量
total_files=0
modified_files=0

# 查找所有需要处理的文件
log_info "搜索需要处理的文件..."

# 创建临时文件列表
temp_file_list=$(mktemp)

for ext in "${FILE_EXTENSIONS[@]}"; do
    find . -name "$ext" -type f \
        ! -path "./node_modules/*" \
        ! -path "./.next/*" \
        ! -path "./coverage/*" \
        ! -path "./.git/*" \
        ! -path "./logs/*" \
        ! -path "$BACKUP_DIR/*" >> "$temp_file_list"
done

# 处理每个文件
while IFS= read -r file; do
    if [[ -f "$file" ]]; then
        total_files=$((total_files + 1))
        
        # 检查文件是否包含需要替换的内容
        needs_replacement=false
        for old_text in "${!REPLACEMENTS[@]}"; do
            if grep -q "$old_text" "$file" 2>/dev/null; then
                needs_replacement=true
                break
            fi
        done
        
        if [[ "$needs_replacement" == true ]]; then
            # 创建备份
            backup_file="$BACKUP_DIR${file#.}"
            mkdir -p "$(dirname "$backup_file")"
            cp "$file" "$backup_file"
            
            # 执行替换
            temp_file=$(mktemp)
            cp "$file" "$temp_file"
            
            for old_text in "${!REPLACEMENTS[@]}"; do
                new_text="${REPLACEMENTS[$old_text]}"
                sed -i "s/$old_text/$new_text/g" "$temp_file"
            done
            
            # 检查是否有实际变化
            if ! cmp -s "$file" "$temp_file"; then
                mv "$temp_file" "$file"
                modified_files=$((modified_files + 1))
                log_success "已处理: $file"
            else
                rm "$temp_file"
            fi
        fi
    fi
done < "$temp_file_list"

# 清理临时文件
rm "$temp_file_list"

# 特殊处理一些重要文件
log_info "处理特殊配置文件..."

# 处理 package.json 文件
for package_file in "./package.json" "./frontend/package.json" "./microservices/*/package.json" "./shared/package.json"; do
    if [[ -f "$package_file" ]]; then
        log_info "处理 $package_file"
        # 备份
        backup_file="$BACKUP_DIR${package_file#.}"
        mkdir -p "$(dirname "$backup_file")"
        cp "$package_file" "$backup_file"
        
        # 替换
        sed -i 's/"name": "loretrans"/"name": "loretrans"/g' "$package_file"
        sed -i 's/"name": "loretrans-/"name": "loretrans-/g' "$package_file"
        sed -i 's/"description": ".*Loretrans.*"/"description": "Loretrans - Advanced Translation Platform"/g' "$package_file"
    fi
done

# 处理 manifest.json
manifest_file="./frontend/public/manifest.json"
if [[ -f "$manifest_file" ]]; then
    log_info "处理 $manifest_file"
    backup_file="$BACKUP_DIR${manifest_file#.}"
    mkdir -p "$(dirname "$backup_file")"
    cp "$manifest_file" "$backup_file"
    
    sed -i 's/"name": "Loretrans"/"name": "Loretrans"/g' "$manifest_file"
    sed -i 's/"short_name": "Loretrans"/"short_name": "Loretrans"/g' "$manifest_file"
fi

# 处理 vercel.json
vercel_file="./vercel.json"
if [[ -f "$vercel_file" ]]; then
    log_info "处理 $vercel_file"
    backup_file="$BACKUP_DIR${vercel_file#.}"
    mkdir -p "$(dirname "$backup_file")"
    cp "$vercel_file" "$backup_file"
    
    sed -i 's/"name": "loretrans"/"name": "loretrans"/g' "$vercel_file"
fi

log_success "品牌名称替换完成!"
log_info "统计信息:"
log_info "  - 扫描文件总数: $total_files"
log_info "  - 修改文件数量: $modified_files"
log_info "  - 备份目录: $BACKUP_DIR"

log_warning "请注意:"
log_warning "1. 所有原始文件已备份到 $BACKUP_DIR"
log_warning "2. 请检查关键文件的替换结果"
log_warning "3. 建议运行测试确保应用正常工作"
log_warning "4. 如需回滚，可以从备份目录恢复文件"

echo ""
log_info "建议的后续步骤:"
echo "1. 检查重要配置文件: package.json, manifest.json, vercel.json"
echo "2. 更新数据库中的相关配置"
echo "3. 重新构建和测试应用"
echo "4. 更新域名和部署配置"
echo "5. 更新文档和README文件"

echo ""
log_success "品牌替换脚本执行完成!"
