#!/usr/bin/env node

/**
 * 诊断前端API问题
 */

console.log('🔍 诊断前端API问题...\n');

async function diagnoseFrontendAPI() {
  const userId = 'b7bee007-2a9f-4fb8-8020-10b707e2f4f4';
  const apiUrl = 'https://fdb2-38-98-191-33.ngrok-free.app/api/auth/get-user';
  
  try {
    console.log('📋 1. 直接测试API调用:');
    console.log(`   URL: ${apiUrl}`);
    console.log(`   用户ID: ${userId}`);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    
    console.log(`   响应状态: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ API调用成功');
      console.log('   📊 完整响应:', JSON.stringify(data, null, 2));
      
      if (data.success && data.user) {
        console.log('\n📋 2. 用户数据解析:');
        console.log(`   👤 用户ID: ${data.user.id}`);
        console.log(`   📧 邮箱: ${data.user.email}`);
        console.log(`   💰 积分: ${data.user.credits}`);
        console.log(`   👤 角色: ${data.user.role}`);
        console.log(`   ✅ 邮箱验证: ${data.user.emailVerified}`);
        
        if (data.user.credits === 45500) {
          console.log('   ✅ 积分数据正确！');
        } else {
          console.log(`   ❌ 积分数据错误，预期45500，实际${data.user.credits}`);
        }
      } else {
        console.log('   ❌ 响应格式错误');
      }
    } else {
      const errorText = await response.text();
      console.log('   ❌ API调用失败');
      console.log('   错误内容:', errorText);
    }
    
    // 3. 测试前端页面
    console.log('\n📋 3. 测试前端页面:');
    
    const pageResponse = await fetch('https://fdb2-38-98-191-33.ngrok-free.app/en');
    console.log(`   首页状态: ${pageResponse.status}`);
    
    if (pageResponse.ok) {
      const pageContent = await pageResponse.text();
      
      // 检查是否包含用户信息
      if (pageContent.includes('hongwane322@gmail.com')) {
        console.log('   ✅ 页面包含用户邮箱');
      } else {
        console.log('   ⚠️  页面不包含用户邮箱');
      }
      
      // 检查积分显示
      if (pageContent.includes('45500') || pageContent.includes('45,500')) {
        console.log('   ✅ 页面包含正确积分');
      } else {
        console.log('   ❌ 页面不包含正确积分');
        
        // 检查是否包含其他积分数值
        const creditMatches = pageContent.match(/\b\d{4,6}\b/g);
        if (creditMatches) {
          console.log('   🔍 页面中的数字:', creditMatches.slice(0, 10));
        }
      }
    }
    
    // 4. 生成解决方案
    console.log('\n📋 4. 问题诊断和解决方案:');
    
    console.log('\n🔍 可能的问题:');
    console.log('   1. 浏览器缓存了旧的用户数据');
    console.log('   2. 前端状态管理没有更新');
    console.log('   3. API调用时机不正确');
    console.log('   4. 认证状态有问题');
    
    console.log('\n🔧 立即解决方案:');
    console.log('   1. 清除浏览器所有数据 (设置 → 隐私 → 清除数据)');
    console.log('   2. 使用无痕模式重新登录');
    console.log('   3. 强制刷新页面 (Ctrl+Shift+R)');
    console.log('   4. 检查浏览器控制台错误');
    
    console.log('\n🚀 测试步骤:');
    console.log('   1. 打开无痕窗口');
    console.log('   2. 访问: https://fdb2-38-98-191-33.ngrok-free.app/en');
    console.log('   3. 重新登录账户');
    console.log('   4. 查看积分是否显示为45,500');
    
    console.log('\n💡 如果仍然不显示:');
    console.log('   1. 按F12打开开发者工具');
    console.log('   2. 查看Console标签的错误信息');
    console.log('   3. 查看Network标签的API请求');
    console.log('   4. 检查Application标签的LocalStorage');
    
  } catch (error) {
    console.error('❌ 诊断过程失败:', error);
  }
}

diagnoseFrontendAPI();
