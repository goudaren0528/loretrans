#!/usr/bin/env node

/**
 * 网络问题诊断和解决方案
 * 解决Node.js中的DNS解析问题
 */

const fetch = require('node-fetch');
const https = require('https');
const dns = require('dns');
require('dotenv').config({ path: '.env.local' });

async function diagnoseNetworkIssues() {
  console.log('🔍 网络问题诊断\n');
  
  // 1. 测试DNS解析
  await testDNSResolution();
  
  // 2. 测试不同的DNS服务器
  await testDifferentDNS();
  
  // 3. 测试直接IP连接
  await testDirectIPConnection();
  
  // 4. 测试使用自定义DNS的fetch
  await testCustomDNSFetch();
  
  // 5. 提供解决方案
  provideSolutions();
}

async function testDNSResolution() {
  console.log('🌐 测试DNS解析');
  
  return new Promise((resolve) => {
    dns.lookup('api.creem.io', (err, address, family) => {
      if (err) {
        console.log('   ❌ DNS解析失败:', err.message);
        console.log('   错误代码:', err.code);
      } else {
        console.log(`   ✅ DNS解析成功: ${address} (IPv${family})`);
      }
      resolve();
    });
  });
}

async function testDifferentDNS() {
  console.log('\n🔄 测试不同的DNS服务器');
  
  const dnsServers = [
    '8.8.8.8',      // Google DNS
    '1.1.1.1',      // Cloudflare DNS
    '208.67.222.222' // OpenDNS
  ];
  
  for (const dnsServer of dnsServers) {
    console.log(`   测试DNS服务器: ${dnsServer}`);
    
    const resolver = new dns.Resolver();
    resolver.setServers([dnsServer]);
    
    await new Promise((resolve) => {
      resolver.resolve4('api.creem.io', (err, addresses) => {
        if (err) {
          console.log(`     ❌ 失败: ${err.message}`);
        } else {
          console.log(`     ✅ 成功: ${addresses.join(', ')}`);
        }
        resolve();
      });
    });
  }
}

async function testDirectIPConnection() {
  console.log('\n🎯 测试直接IP连接');
  
  // 从之前的ping结果我们知道IP是 18.184.32.45
  const ip = '18.184.32.45';
  const apiKey = process.env.CREEM_API_KEY;
  
  console.log(`   使用IP地址: ${ip}`);
  
  try {
    const response = await fetch(`https://${ip}/v1/checkouts`, {
      method: 'POST',
      headers: {
        'Host': 'api.creem.io', // 重要：设置正确的Host header
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        product_id: 'prod_6tW66i0oZM7w1qXReHJrwg'
      }),
      timeout: 10000,
      // 忽略SSL证书问题（仅用于测试）
      agent: new https.Agent({
        rejectUnauthorized: false
      })
    });
    
    console.log(`   📊 响应状态: ${response.status} ${response.statusText}`);
    
    if (response.status === 403) {
      console.log('   ✅ 直接IP连接成功 (403是权限问题，不是网络问题)');
    } else {
      const responseText = await response.text();
      console.log('   📋 响应内容:', responseText);
    }
    
  } catch (error) {
    console.log('   ❌ 直接IP连接失败:', error.message);
  }
}

async function testCustomDNSFetch() {
  console.log('\n🔧 测试自定义DNS的fetch');
  
  const apiKey = process.env.CREEM_API_KEY;
  
  // 创建自定义的fetch函数，使用Google DNS
  const customFetch = async (url, options = {}) => {
    // 设置自定义DNS
    const originalLookup = dns.lookup;
    dns.lookup = (hostname, opts, callback) => {
      if (typeof opts === 'function') {
        callback = opts;
        opts = {};
      }
      
      if (hostname === 'api.creem.io') {
        // 使用已知的IP地址
        callback(null, '18.184.32.45', 4);
      } else {
        originalLookup(hostname, opts, callback);
      }
    };
    
    try {
      const result = await fetch(url, options);
      dns.lookup = originalLookup; // 恢复原始lookup
      return result;
    } catch (error) {
      dns.lookup = originalLookup; // 恢复原始lookup
      throw error;
    }
  };
  
  try {
    const response = await customFetch('https://api.creem.io/v1/checkouts', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        product_id: 'prod_6tW66i0oZM7w1qXReHJrwg'
      }),
      timeout: 10000
    });
    
    console.log(`   📊 响应状态: ${response.status} ${response.statusText}`);
    
    if (response.status === 403) {
      console.log('   ✅ 自定义DNS fetch成功!');
      const responseText = await response.text();
      console.log('   📋 响应内容:', responseText);
    }
    
  } catch (error) {
    console.log('   ❌ 自定义DNS fetch失败:', error.message);
  }
}

function provideSolutions() {
  console.log('\n💡 解决方案建议');
  console.log('');
  
  console.log('🔧 方案1: 修改系统DNS设置');
  console.log('   sudo nano /etc/resolv.conf');
  console.log('   添加以下行:');
  console.log('   nameserver 8.8.8.8');
  console.log('   nameserver 1.1.1.1');
  console.log('');
  
  console.log('🔧 方案2: 使用环境变量设置DNS');
  console.log('   export NODE_OPTIONS="--dns-result-order=ipv4first"');
  console.log('   或在代码中设置: process.env.NODE_OPTIONS = "--dns-result-order=ipv4first"');
  console.log('');
  
  console.log('🔧 方案3: 在代码中使用IP地址');
  console.log('   创建一个DNS映射，将api.creem.io映射到18.184.32.45');
  console.log('');
  
  console.log('🔧 方案4: 使用代理或VPN');
  console.log('   如果是网络环境限制，考虑使用代理服务');
  console.log('');
  
  console.log('🚀 推荐的临时解决方案:');
  console.log('   创建一个自定义的fetch包装器，自动处理DNS解析问题');
}

// 运行诊断
diagnoseNetworkIssues().then(() => {
  console.log('='.repeat(60));
  console.log('🎯 网络诊断完成');
  console.log('='.repeat(60));
}).catch(error => {
  console.error('❌ 诊断过程中发生错误:', error);
});
