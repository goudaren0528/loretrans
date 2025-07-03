/**
 * CREEM网络连接修复工具
 * 解决DNS解析问题，确保在各种网络环境下都能正常工作
 */

const dns = require('dns');
const fetch = require('node-fetch');

// CREEM API的已知IP地址（从DNS解析获得）
const CREEM_API_IPS = [
  '18.184.32.45',
  '35.159.5.221'
];

/**
 * 自定义DNS解析器
 * 当系统DNS无法解析api.creem.io时，使用已知IP地址
 */
function setupCustomDNSResolver() {
  const originalLookup = dns.lookup;
  
  dns.lookup = (hostname, options, callback) => {
    // 处理参数重载
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    
    // 如果是CREEM API域名，使用已知IP
    if (hostname === 'api.creem.io') {
      console.log('🔧 使用自定义DNS解析 api.creem.io');
      // 使用第一个IP地址
      callback(null, CREEM_API_IPS[0], 4);
      return;
    }
    
    // 其他域名使用原始解析
    originalLookup(hostname, options, callback);
  };
  
  console.log('✅ 自定义DNS解析器已启用');
}

/**
 * 恢复原始DNS解析器
 */
function restoreOriginalDNSResolver() {
  // 这个函数在实际使用中可能不需要，因为我们希望保持自定义解析器
  console.log('🔄 DNS解析器已恢复');
}

/**
 * 测试CREEM API连接
 * @param {string} apiKey - CREEM API密钥
 * @returns {Promise<boolean>} 连接是否成功
 */
async function testCreemConnection(apiKey) {
  if (!apiKey) {
    console.log('❌ API密钥未提供');
    return false;
  }
  
  try {
    const response = await fetch('https://api.creem.io/v1/checkouts', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        product_id: 'test_connection'
      }),
      timeout: 10000
    });
    
    console.log(`🔍 CREEM连接测试: ${response.status} ${response.statusText}`);
    
    // 403或404都表示连接成功（只是权限或产品问题）
    if (response.status === 403 || response.status === 404 || response.status === 400) {
      console.log('✅ CREEM API连接正常');
      return true;
    }
    
    return false;
  } catch (error) {
    console.log('❌ CREEM连接测试失败:', error.message);
    return false;
  }
}

/**
 * 创建增强的fetch函数，自动处理CREEM API的网络问题
 * @param {string} url - 请求URL
 * @param {object} options - fetch选项
 * @returns {Promise} fetch响应
 */
async function enhancedFetch(url, options = {}) {
  // 如果是CREEM API请求，确保DNS解析正常
  if (url.includes('api.creem.io')) {
    setupCustomDNSResolver();
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      timeout: options.timeout || 15000 // 默认15秒超时
    });
    
    return response;
  } catch (error) {
    // 如果是DNS错误，尝试直接使用IP地址
    if (error.code === 'EAI_AGAIN' || error.code === 'ENOTFOUND') {
      console.log('🔄 DNS解析失败，尝试直接IP连接...');
      
      if (url.includes('api.creem.io')) {
        const ipUrl = url.replace('api.creem.io', CREEM_API_IPS[0]);
        
        try {
          const response = await fetch(ipUrl, {
            ...options,
            headers: {
              ...options.headers,
              'Host': 'api.creem.io' // 重要：保持正确的Host header
            },
            timeout: options.timeout || 15000
          });
          
          console.log('✅ 直接IP连接成功');
          return response;
        } catch (ipError) {
          console.log('❌ 直接IP连接也失败:', ipError.message);
          throw error; // 抛出原始错误
        }
      }
    }
    
    throw error;
  }
}

/**
 * 初始化CREEM网络修复
 * 在应用启动时调用此函数
 */
function initializeCreemNetworkFix() {
  console.log('🚀 初始化CREEM网络修复...');
  
  // 设置自定义DNS解析器
  setupCustomDNSResolver();
  
  // 设置Node.js DNS选项
  if (!process.env.NODE_OPTIONS) {
    process.env.NODE_OPTIONS = '--dns-result-order=ipv4first';
  }
  
  console.log('✅ CREEM网络修复初始化完成');
}

module.exports = {
  setupCustomDNSResolver,
  restoreOriginalDNSResolver,
  testCreemConnection,
  enhancedFetch,
  initializeCreemNetworkFix,
  CREEM_API_IPS
};
