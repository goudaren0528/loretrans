#!/usr/bin/env node

/**
 * 验证长文本翻译修复效果
 */

async function validateFix() {
  console.log('🧪 验证长文本翻译修复效果...')
  
  // 检查关键文件是否存在修复
  const fs = require('fs')
  const path = require('path')
  
  console.log('\n1. 检查状态API修复...')
  const statusApi = fs.readFileSync(path.join(__dirname, 'frontend/app/api/translate/status/route.ts'), 'utf8')
  if (statusApi.includes('INVALID_JOB_ID')) {
    console.log('✅ 状态API jobId验证已修复')
  } else {
    console.log('❌ 状态API修复可能不完整')
  }
  
  console.log('\n2. 检查翻译组件修复...')
  const widget = fs.readFileSync(path.join(__dirname, 'frontend/components/translator-widget.tsx'), 'utf8')
  if (widget.includes('pollTranslationStatus') && widget.includes('翻译进度:')) {
    console.log('✅ 翻译组件进度显示已修复')
  } else {
    console.log('❌ 翻译组件修复可能不完整')
  }
  
  console.log('\n3. 检查API响应格式...')
  const translateApi = fs.readFileSync(path.join(__dirname, 'frontend/app/api/translate/route.ts'), 'utf8')
  if (translateApi.includes('jobId: streamResult.taskId')) {
    console.log('✅ API响应格式已统一')
  } else {
    console.log('❌ API响应格式可能需要进一步检查')
  }
  
  console.log('\n🎯 修复验证完成！')
  console.log('\n📋 下一步测试建议:')
  console.log('1. 重启前端服务')
  console.log('2. 提交一个10000字符的长文本翻译')
  console.log('3. 观察进度是否正常显示')
  console.log('4. 确认翻译完成后结果是否正确显示')
}

if (require.main === module) {
  validateFix()
}
