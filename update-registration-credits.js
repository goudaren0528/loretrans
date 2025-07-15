#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🔧 修改新用户注册积分数量为 3000...')

// 1. 修改注册API的积分数量
const createUserPath = path.join(__dirname, 'frontend/app/api/auth/create-user/route.ts')

if (fs.existsSync(createUserPath)) {
  let content = fs.readFileSync(createUserPath, 'utf8')
  
  // 修改用户表中的积分数量
  const oldCredits = 'credits: 5500'
  const newCredits = 'credits: 3000'
  
  if (content.includes(oldCredits)) {
    content = content.replace(new RegExp(oldCredits, 'g'), newCredits)
    console.log('✅ 修复了注册API的用户积分数量 (5500 → 3000)')
  }
  
  // 修改积分交易记录
  const oldAmount = 'amount: 5500'
  const newAmount = 'amount: 3000'
  const oldBalance = 'balance: 5500'
  const newBalance = 'balance: 3000'
  
  if (content.includes(oldAmount)) {
    content = content.replace(oldAmount, newAmount)
    console.log('✅ 修复了积分交易记录金额 (5500 → 3000)')
  }
  
  if (content.includes(oldBalance)) {
    content = content.replace(oldBalance, newBalance)
    console.log('✅ 修复了积分交易记录余额 (5500 → 3000)')
  }
  
  fs.writeFileSync(createUserPath, content)
  console.log('✅ 注册API积分修改完成')
} else {
  console.log('❌ 找不到注册API文件')
}

// 2. 检查并更新其他可能引用5500积分的地方
const filesToCheck = [
  'frontend/app/api/document/upload/route.ts',
  'frontend/app/api/document/translate/route.ts'
]

filesToCheck.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath)
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8')
    let modified = false
    
    // 查找并替换5500积分的引用
    if (content.includes('credits: 5500')) {
      content = content.replace(/credits: 5500/g, 'credits: 3000')
      modified = true
      console.log(`✅ 更新了 ${filePath} 中的积分数量`)
    }
    
    if (modified) {
      fs.writeFileSync(fullPath, content)
    }
  }
})

console.log('')
console.log('📋 修改总结:')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('✅ 新用户注册积分: 5500 → 3000')
console.log('✅ 欢迎奖励积分: 5500 → 3000')
console.log('✅ 初始余额: 5500 → 3000')
console.log('')
console.log('🎯 现在的注册流程:')
console.log('1. 用户注册 → 创建用户记录')
console.log('2. 初始积分 → 3000 credits')
console.log('3. 积分交易记录 → Welcome bonus: 3000')
console.log('4. 用户余额 → 3000 credits')
console.log('')
console.log('🧪 测试建议:')
console.log('• 重新注册一个新用户')
console.log('• 检查积分显示是否为 3000')
console.log('• 测试文档翻译功能')
console.log('')
console.log('✅ 积分数量修改完成！')
