#!/bin/bash

# 批量更新语言页面脚本
# 将所有 XXX to English 页面更新为使用 EnhancedTextTranslator

echo "🚀 开始批量更新语言页面..."

# 定义需要更新的页面列表
PAGES=(
    "lao-to-english:lo:en:Lao:老挝语:🇱🇦"
    "burmese-to-english:my:en:Burmese:缅甸语:🇲🇲"
    "swahili-to-english:sw:en:Swahili:斯瓦希里语:🇰🇪"
    "telugu-to-english:te:en:Telugu:泰卢固语:🇮🇳"
    "hindi-to-english:hi:en:Hindi:印地语:🇮🇳"
    "arabic-to-english:ar:en:Arabic:阿拉伯语:🇸🇦"
    "chinese-to-english:zh:en:Chinese:中文:🇨🇳"
    "french-to-english:fr:en:French:法语:🇫🇷"
    "spanish-to-english:es:en:Spanish:西班牙语:🇪🇸"
    "portuguese-to-english:pt:en:Portuguese:葡萄牙语:🇵🇹"
)

# 遍历每个页面
for page_info in "${PAGES[@]}"; do
    IFS=':' read -r page_dir source_lang target_lang lang_name lang_name_zh flag <<< "$page_info"
    
    echo "📝 更新 $page_dir 页面..."
    
    # 检查页面目录是否存在
    if [ -d "/home/hwt/translation-low-source/frontend/app/[locale]/$page_dir" ]; then
        echo "✅ 找到页面目录: $page_dir"
        
        # 备份原文件
        if [ -f "/home/hwt/translation-low-source/frontend/app/[locale]/$page_dir/page.tsx" ]; then
            cp "/home/hwt/translation-low-source/frontend/app/[locale]/$page_dir/page.tsx" "/home/hwt/translation-low-source/frontend/app/[locale]/$page_dir/page.tsx.backup"
            echo "📋 已备份原文件"
        fi
        
        echo "🔄 页面 $page_dir 需要手动更新"
    else
        echo "❌ 页面目录不存在: $page_dir"
    fi
done

echo "✅ 批量更新脚本执行完成！"
echo "📌 请手动检查并更新各个页面文件"
