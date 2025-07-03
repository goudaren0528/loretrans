# 🔧 CREEM API密钥问题解决指南

## 🚨 当前状态

✅ **配置已正确简化**: 成功从公私钥分离模式迁移到单一API密钥模式
❌ **API调用返回403**: 需要解决API密钥权限问题

## 📊 测试结果分析

### 配置验证 ✅
```
CREEM_API_KEY: ✅ 已设置 (creem_test_1DJqKl2eRnF3FTlYNW09u8)
CREEM_WEBHOOK_SECRET: ✅ 已设置 (whsec_65jSbiU6yfhC9NDVdbAIpf)
API密钥格式: ✅ 正确 (以creem_test_开头)
```

### API调用问题 ❌
```
响应: 403 Forbidden
错误: {"trace_id":"xxx","status":403,"error":"Forbidden"}
```

## 🔍 问题诊断

### 可能的原因

1. **API密钥权限不足**
   - 密钥可能只有读取权限，缺少创建checkout的权限
   - 需要在CREEM控制台中升级API密钥权限

2. **产品ID不存在或无权访问**
   - `prod_7ghOSJ2klCjPTjnURPbMoh` 可能不存在
   - API密钥可能无权访问此产品

3. **测试环境限制**
   - 测试API密钥可能有特定的限制
   - 需要使用正确的测试产品ID

## 🛠️ 解决步骤

### 步骤1: 验证CREEM控制台配置

1. **登录CREEM控制台**
   ```
   访问: https://creem.io/dashboard
   ```

2. **检查API密钥权限**
   - 进入 API Keys 页面
   - 确认当前密钥有以下权限：
     - ✅ Read products
     - ✅ Create checkouts
     - ✅ Read orders

3. **验证产品存在**
   - 进入 Products 页面
   - 查找产品ID: `prod_7ghOSJ2klCjPTjnURPbMoh`
   - 如果不存在，创建新产品或使用现有产品ID

### 步骤2: 获取正确的产品ID

如果当前产品ID不正确，需要：

1. **在CREEM控制台创建产品**
   ```
   名称: Basic Pack (5000 Credits)
   价格: $5.00
   描述: Great for personal use
   ```

2. **获取新的产品ID**
   ```
   格式: prod_xxxxxxxxxxxxxxxxxx
   ```

3. **更新配置文件**
   ```typescript
   // config/pricing.config.ts
   {
     id: 'basic',
     name: 'Basic Pack',
     creemProductId: 'YOUR_ACTUAL_PRODUCT_ID_HERE', // 更新这里
     // ...
   }
   ```

### 步骤3: 测试API密钥权限

创建简单的测试脚本：

```javascript
// test-creem-permissions.js
const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

async function testPermissions() {
  const apiKey = process.env.CREEM_API_KEY;
  
  // 测试1: 获取产品列表
  console.log('🧪 测试获取产品列表...');
  try {
    const response = await fetch('https://api.creem.io/v1/products', {
      headers: { 'x-api-key': apiKey }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ 产品列表获取成功');
      console.log('📦 可用产品:');
      data.products?.forEach(p => {
        console.log(`   - ${p.name} (${p.id}) - $${p.price/100}`);
      });
    } else {
      console.log('❌ 产品列表获取失败:', response.status);
    }
  } catch (error) {
    console.log('❌ 网络错误:', error.message);
  }
}

testPermissions();
```

### 步骤4: 联系CREEM支持

如果问题持续存在：

1. **收集信息**
   ```
   API密钥: creem_test_1DJqKl2eRnF3FTlYNW09u8
   错误代码: 403 Forbidden
   Trace ID: 从错误响应中获取
   ```

2. **联系支持**
   ```
   邮箱: support@creem.io
   Discord: https://discord.gg/q3GKZs92Av
   ```

3. **说明问题**
   ```
   主题: API Key 403 Forbidden Error
   内容: 
   - 使用测试API密钥创建checkout时收到403错误
   - 已确认密钥格式正确
   - 请帮助检查密钥权限和产品访问权限
   ```

## 🔄 临时解决方案

在等待CREEM支持回复期间，可以：

### 1. 使用Mock模式
```bash
# .env.local 添加
USE_MOCK_CREEM=true
```

### 2. 启用直接支付URL回退
确保 `creemPaymentUrl` 配置正确：
```typescript
{
  id: 'basic',
  creemProductId: 'prod_7ghOSJ2klCjPTjnURPbMoh',
  creemPaymentUrl: 'https://www.creem.io/test/payment/prod_7ghOSJ2klCjPTjnURPbMoh'
}
```

## 📝 下一步行动

### 立即执行
- [ ] 登录CREEM控制台验证API密钥权限
- [ ] 检查产品ID是否存在
- [ ] 如需要，创建测试权限脚本

### 如果问题持续
- [ ] 联系CREEM技术支持
- [ ] 考虑重新生成API密钥
- [ ] 使用Mock模式继续开发

## 🎯 成功标准

当以下测试通过时，问题解决：
```bash
node verify-api-keys.js  # API访问测试通过
node test-new-checkout.js  # Checkout创建成功
```

期望看到：
```
✅ API访问正常！
✅ Checkout创建API调用成功！
🔗 Checkout URL: https://checkout.creem.io/...
```

## 📞 需要帮助？

如果需要进一步协助：
1. 提供CREEM控制台的截图
2. 分享完整的错误日志
3. 确认产品配置详情

记住：**代码修改已经正确完成**，现在只是API密钥权限的问题！
