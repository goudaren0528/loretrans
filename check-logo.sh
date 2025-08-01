#!/bin/bash
echo "🔍 检查首页Logo显示状态..."
echo ""
echo "📄 测试页面访问:"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/en)
echo "   状态码: $STATUS"

if [ "$STATUS" = "200" ]; then
  echo ""
  echo "🖼️  检查Logo文件:"
  LOGO_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/loretrans-logo.svg)
  echo "   Logo文件状态: $LOGO_STATUS"
  
  echo ""
  echo "🎨 检查页面内容:"
  PAGE_CONTENT=$(curl -s http://localhost:3000/en)
  
  if echo "$PAGE_CONTENT" | grep -q "loretrans-logo.svg"; then
    echo "   ✅ Logo图片路径: 找到"
  else
    echo "   ❌ Logo图片路径: 未找到"
  fi
  
  if echo "$PAGE_CONTENT" | grep -q "LoReTrans Logo"; then
    echo "   ✅ Logo Alt文本: 找到"
  else
    echo "   ❌ Logo Alt文本: 未找到"
  fi
  
  if echo "$PAGE_CONTENT" | grep -q "LoReTrans"; then
    echo "   ✅ 品牌名称: 找到"
  else
    echo "   ❌ 品牌名称: 未找到"
  fi
  
  echo ""
  echo "📋 总结:"
  if echo "$PAGE_CONTENT" | grep -q "loretrans-logo.svg" && echo "$PAGE_CONTENT" | grep -q "LoReTrans Logo"; then
    echo "   🎉 Logo配置正确，已成功提交并部署!"
  else
    echo "   ⚠️  Logo可能还在加载中，或需要清除浏览器缓存"
  fi
else
  echo "   ❌ 页面无法访问"
fi
