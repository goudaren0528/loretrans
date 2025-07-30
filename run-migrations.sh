#!/bin/bash

echo "🗄️ 运行数据库迁移"
echo "=================="

# 检查环境变量
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ 错误: SUPABASE_SERVICE_ROLE_KEY 环境变量未设置"
    echo "请在 .env.local 文件中设置 SUPABASE_SERVICE_ROLE_KEY"
    exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ 错误: NEXT_PUBLIC_SUPABASE_URL 环境变量未设置"
    echo "请在 .env.local 文件中设置 NEXT_PUBLIC_SUPABASE_URL"
    exit 1
fi

# 加载环境变量
if [ -f .env.local ]; then
    echo "📄 加载环境变量..."
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# 运行翻译队列迁移
echo "1. 运行翻译队列迁移..."
MIGRATION_FILE="supabase/migrations/20240703_translation_queue.sql"

if [ -f "$MIGRATION_FILE" ]; then
    echo "   执行: $MIGRATION_FILE"
    
    # 使用 psql 连接到 Supabase 数据库
    # 注意：这需要从 Supabase URL 中提取数据库连接信息
    DB_URL=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed 's/https:\/\///')
    
    echo "   连接到数据库: $DB_URL"
    
    # 创建临时的 SQL 执行脚本
    cat > temp_migration.sql << EOF
-- 设置角色为 service_role
SET ROLE service_role;

-- 执行迁移
$(cat $MIGRATION_FILE)
EOF
    
    echo "   ✅ 迁移文件准备完成"
    echo "   📝 请手动在 Supabase Dashboard 的 SQL Editor 中执行以下文件："
    echo "      $PWD/temp_migration.sql"
    echo ""
    echo "   或者使用以下 API 调用："
    echo ""
    echo "   curl -X POST '$NEXT_PUBLIC_SUPABASE_URL/rest/v1/rpc/exec_sql' \\"
    echo "        -H 'apikey: $SUPABASE_SERVICE_ROLE_KEY' \\"
    echo "        -H 'Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY' \\"
    echo "        -H 'Content-Type: application/json' \\"
    echo "        -d '{\"sql\": \"$(cat temp_migration.sql | tr '\n' ' ' | sed 's/"/\\"/g')\"}'"
    
else
    echo "   ❌ 迁移文件不存在: $MIGRATION_FILE"
fi

echo ""
echo "2. 测试数据库连接..."

# 测试数据库连接
curl -s -X GET "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/translation_jobs?select=count" \
     -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
     -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" > /dev/null

if [ $? -eq 0 ]; then
    echo "   ✅ translation_jobs 表已存在"
else
    echo "   ❌ translation_jobs 表不存在，需要运行迁移"
fi

echo ""
echo "✅ 迁移检查完成！"
echo ""
echo "📝 下一步："
echo "   1. 如果表不存在，请在 Supabase Dashboard 中运行 temp_migration.sql"
echo "   2. 然后重新测试认证和历史记录功能"
