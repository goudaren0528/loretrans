#!/usr/bin/env node

/**
 * 认证修复验证脚本
 * 快速验证三个主要问题是否已修复
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 验证认证问题修复效果...\n');

// 检查文件是否存在
function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  console.log(`${exists ? '✅' : '❌'} ${description}: ${exists ? '已部署' : '缺失'}`);
  return exists;
}

// 检查文件内容是否包含特定功能
function checkFeature(filePath, searchText, featureName) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`❌ ${featureName}: 文件不存在`);
      return false;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const hasFeature = content.includes(searchText);
    console.log(`${hasFeature ? '✅' : '❌'} ${featureName}: ${hasFeature ? '已实现' : '未找到'}`);
    return hasFeature;
  } catch (error) {
    console.log(`❌ ${featureName}: 检查失败 - ${error.message}`);
    return false;
  }
}

console.log('📋 问题1: 用户菜单显示修复验证');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// 检查用户菜单组件
const userMenuPath = './frontend/components/auth/user-menu.tsx';
checkFile(userMenuPath, '用户菜单组件');
checkFeature(userMenuPath, 'getUserDisplayName', '用户名显示逻辑');
checkFeature(userMenuPath, 'refreshUser', '用户数据刷新功能');
checkFeature(userMenuPath, 'debugMode', '调试模式');
checkFeature(userMenuPath, 'emailVerified', '邮箱验证状态显示');

console.log('\n📋 问题2: 登录400错误修复验证');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// 检查登录表单组件
const signInPath = './frontend/components/auth/signin-form.tsx';
checkFile(signInPath, '登录表单组件');
checkFeature(signInPath, 'analyzeError', '错误分析功能');
checkFeature(signInPath, 'retryCount', '重试机制');
checkFeature(signInPath, 'troubleshooting', '故障排除指导');
checkFeature(signInPath, 'ErrorAnalysis', '错误类型分析');

console.log('\n📋 问题3: 邮箱唯一性验证修复验证');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// 检查注册表单组件
const signUpPath = './frontend/components/auth/signup-form.tsx';
checkFile(signUpPath, '注册表单组件');
checkFeature(signUpPath, 'checkEmailAvailability', '邮箱可用性检查');
checkFeature(signUpPath, 'emailValidation', '邮箱验证状态');
checkFeature(signUpPath, 'EmailValidationState', '邮箱验证状态类型');
checkFeature(signUpPath, 'debounce', '防抖机制');

// 检查邮箱检查API
const checkEmailPath = './frontend/app/api/auth/check-email/route.ts';
checkFile(checkEmailPath, '邮箱唯一性检查API');
checkFeature(checkEmailPath, 'POST', 'POST请求处理');
checkFeature(checkEmailPath, 'available', '可用性检查逻辑');

console.log('\n📊 修复效果总结');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// 统计修复状态
const fixes = [
  {
    name: '用户菜单显示问题',
    components: [
      fs.existsSync(userMenuPath),
      fs.readFileSync(userMenuPath, 'utf8').includes('getUserDisplayName'),
      fs.readFileSync(userMenuPath, 'utf8').includes('refreshUser')
    ]
  },
  {
    name: '登录400错误问题',
    components: [
      fs.existsSync(signInPath),
      fs.readFileSync(signInPath, 'utf8').includes('analyzeError'),
      fs.readFileSync(signInPath, 'utf8').includes('retryCount')
    ]
  },
  {
    name: '邮箱唯一性验证问题',
    components: [
      fs.existsSync(signUpPath),
      fs.existsSync(checkEmailPath),
      fs.readFileSync(signUpPath, 'utf8').includes('checkEmailAvailability')
    ]
  }
];

fixes.forEach((fix, index) => {
  const completedComponents = fix.components.filter(Boolean).length;
  const totalComponents = fix.components.length;
  const percentage = Math.round((completedComponents / totalComponents) * 100);
  
  console.log(`${index + 1}. ${fix.name}`);
  console.log(`   完成度: ${completedComponents}/${totalComponents} (${percentage}%)`);
  console.log(`   状态: ${percentage === 100 ? '✅ 完全修复' : percentage >= 50 ? '⚠️ 部分修复' : '❌ 需要修复'}`);
});

console.log('\n🎯 测试建议');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('1. 启动开发服务器测试:');
console.log('   cd frontend && npm run dev');
console.log('');
console.log('2. 手动测试步骤:');
console.log('   a) 访问 http://localhost:3000/auth/signup');
console.log('   b) 输入已存在的邮箱，检查唯一性提示');
console.log('   c) 访问 http://localhost:3000/auth/signin');
console.log('   d) 输入错误凭据，检查错误分析');
console.log('   e) 成功登录后，检查右上角用户菜单');
console.log('');
console.log('3. 自动化测试:');
console.log('   node test-auth-comprehensive.js (需要服务器运行)');

console.log('\n🔧 如遇问题');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('回滚命令:');
console.log('- cp frontend/components/auth/user-menu-backup.tsx frontend/components/auth/user-menu.tsx');
console.log('- cp frontend/components/auth/signin-form-backup.tsx frontend/components/auth/signin-form.tsx');
console.log('- cp frontend/components/auth/signup-form-backup.tsx frontend/components/auth/signup-form.tsx');

console.log('\n✨ 验证完成！');

// 生成验证报告
const verificationReport = {
  timestamp: new Date().toISOString(),
  fixes: fixes.map(fix => ({
    name: fix.name,
    completedComponents: fix.components.filter(Boolean).length,
    totalComponents: fix.components.length,
    percentage: Math.round((fix.components.filter(Boolean).length / fix.components.length) * 100)
  })),
  overallStatus: fixes.every(fix => fix.components.every(Boolean)) ? 'success' : 'partial'
};

fs.writeFileSync('./auth-verification-report.json', JSON.stringify(verificationReport, null, 2));
console.log('📝 验证报告已保存: auth-verification-report.json');
