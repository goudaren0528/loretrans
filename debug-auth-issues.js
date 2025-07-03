#!/usr/bin/env node

/**
 * 认证问题调试脚本
 * 用于系统性地检查和修复三个主要认证问题
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 开始调试认证问题...\n');

// 问题1: 检查用户菜单组件
console.log('📋 问题1: 用户菜单显示问题');
console.log('- 检查 user-menu.tsx 组件');
console.log('- 检查 useAuth hook');
console.log('- 检查 authService.getUserData()');
console.log('- 检查 /api/auth/get-user 端点\n');

// 问题2: 检查登录400错误
console.log('📋 问题2: 登录400错误');
console.log('- 检查 signin-form.tsx');
console.log('- 检查 authService.signIn()');
console.log('- 检查 Supabase 配置');
console.log('- 检查数据库权限和触发器\n');

// 问题3: 检查唯一性验证
console.log('📋 问题3: 账号唯一性验证');
console.log('- 实现邮箱唯一性检查API');
console.log('- 在注册表单添加实时验证');
console.log('- 优化错误提示显示\n');

// 创建测试计划
const testPlan = {
  timestamp: new Date().toISOString(),
  issues: [
    {
      id: 1,
      title: '用户菜单显示问题',
      status: 'pending',
      priority: 'high',
      components: ['user-menu.tsx', 'useAuth.ts', 'auth.ts'],
      tests: [
        '检查用户数据获取',
        '验证API端点响应',
        '测试认证状态监听'
      ]
    },
    {
      id: 2,
      title: '登录400错误',
      status: 'pending', 
      priority: 'critical',
      components: ['signin-form.tsx', 'auth.ts'],
      tests: [
        '测试登录API调用',
        '检查请求参数格式',
        '验证Supabase配置'
      ]
    },
    {
      id: 3,
      title: '账号唯一性验证',
      status: 'pending',
      priority: 'medium',
      components: ['signup-form.tsx'],
      tests: [
        '实现唯一性检查API',
        '添加实时验证',
        '优化错误提示'
      ]
    }
  ]
};

console.log('📝 生成测试计划...');
fs.writeFileSync(
  path.join(__dirname, 'auth-debug-plan.json'),
  JSON.stringify(testPlan, null, 2)
);

console.log('✅ 调试计划已生成: auth-debug-plan.json');
console.log('\n🚀 准备开始修复...');
