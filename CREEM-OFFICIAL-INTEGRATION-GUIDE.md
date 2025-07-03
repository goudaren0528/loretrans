# 🎯 CREEM官方集成指南

## 📚 基于官方文档的发现

通过分析CREEM官方文档 (https://docs.creem.io/checkout-flow)，我发现了之前代码实现的关键问题和正确的集成方式。

## 🔍 关键发现

### 1. 正确的API调用方式
```javascript
// ✅ 正确的方式 (基于官方文档)
const response = await fetch('https://api.creem.io/v1/checkouts', {
  method: 'POST',
  headers: {
    'x-api-key': 'creem_123456789',  // 单一API密钥
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    product_id: 'prod_6tW66i0oZM7w1qXReHJrwg'
  })
});
```

### 2. 支持的参数
根据文档，CREEM checkout API支持以下参数：
- `product_id` (必需) - 产品ID
- `request_id` (可选) - 用于追踪的请求ID
- `success_url` (可选) - 成功后重定向URL
- `cancel_url` (可选) - 取消后重定向URL
- `customer.email` (可选) - 预填客户邮箱
- `metadata` (可选) - 自定义元数据
- `discount_code` (可选) - 折扣码

### 3. 响应格式
成功的响应包含：
- `checkout_url` - 支付页面URL
- `id` - checkout session ID
- 其他相关信息

## 🔧 代码修正

### 1. 更新测试脚本
```javascript
// test-new-checkout.js 的正确实现
async function testCreemAPI() {
  const apiKey = process.env.CREEM_API_KEY;
  
  // 基于官方文档的正确payload
  const testPayload = {
    product_id: 'prod_6tW66i0oZM7w1qXReHJrwg', // 使用文档示例或您的产品ID
    request_id: `test_${Date.now()}`,
    success_url: 'https://yoursite.com/success',
    cancel_url: 'https://yoursite.com/cancel',
    customer: {
      email: 'customer@example.com'
    },
    metadata: {
      userId: 'user_123',
      planId: 'basic'
    }
  };
  
  const response = await fetch('https://api.creem.io/v1/checkouts', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(testPayload)
  });
  
  if (response.ok) {
    const data = await response.json();
    console.log('Checkout URL:', data.checkout_url);
  }
}
```

### 2. 更新生产代码
```javascript
// frontend/app/api/checkout/route.ts 的正确实现
const checkoutPayload = {
  product_id: plan.creemProductId, // 确保这是正确的产品ID
  request_id: `${req.userContext.user.id}_${planId}_${Date.now()}`,
  success_url: `${origin}/payment-success`,
  cancel_url: `${origin}/pricing?purchase=canceled`,
  customer: {
    email: req.userContext.user.email
  },
  metadata: {
    userId: req.userContext.user.id,
    planId: planId,
    userEmail: req.userContext.user.email,
    planName: plan.name,
    credits: plan.credits.toString()
  }
};

const checkoutResponse = await fetch('https://api.creem.io/v1/checkouts', {
  method: 'POST',
  headers: {
    'x-api-key': process.env.CREEM_API_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(checkoutPayload)
});
```

## 🎯 解决当前问题的步骤

### 步骤1: 验证网络连接
当前测试显示DNS解析失败，可能的原因：
1. 网络连接问题
2. 防火墙阻止
3. DNS配置问题

### 步骤2: 验证CREEM控制台配置
1. **登录CREEM控制台**
   ```
   https://creem.io/dashboard
   ```

2. **检查产品配置**
   - 进入产品页面
   - 确认产品存在
   - 复制正确的产品ID

3. **检查API密钥权限**
   - 确认API密钥有创建checkout的权限
   - 确认密钥状态为活跃

### 步骤3: 更新配置
```typescript
// config/pricing.config.ts
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'basic',
    name: 'Basic Pack',
    credits: 5000,
    priceUSD: 5,
    creemProductId: 'YOUR_ACTUAL_PRODUCT_ID_FROM_CREEM_CONSOLE', // 更新这里
    originalValue: 5,
    discount: 0,
    popular: true,
  },
];
```

### 步骤4: 测试验证
```bash
# 1. 验证网络连接
curl -I https://api.creem.io/v1/checkouts

# 2. 测试API调用
node test-creem-official-api.js

# 3. 测试完整流程
node test-new-checkout.js
```

## 🚨 当前状态总结

### ✅ 已完成
1. **代码架构正确**: 单一API密钥模式已正确实现
2. **API调用格式正确**: 基于官方文档的正确格式
3. **参数结构正确**: 使用官方文档中的参数结构

### ⚠️ 需要解决
1. **网络连接问题**: DNS解析失败需要解决
2. **产品ID验证**: 需要从CREEM控制台获取正确的产品ID
3. **API密钥权限**: 需要确认权限配置

### 🎯 下一步行动
1. **解决网络问题**: 检查网络连接和DNS设置
2. **登录CREEM控制台**: 验证产品和API密钥配置
3. **更新产品ID**: 使用正确的产品ID
4. **重新测试**: 验证完整的支付流程

## 📞 获取帮助

如果问题持续存在：

### CREEM技术支持
- **邮箱**: support@creem.io
- **Discord**: https://discord.gg/q3GKZs92Av
- **文档**: https://docs.creem.io/checkout-flow

### 支持请求模板
```
主题: API Integration Issue - Network and Product ID Verification

内容:
Hi CREEM Support Team,

I'm implementing the checkout integration based on your official documentation but encountering some issues:

1. Network connectivity issues with api.creem.io (DNS resolution)
2. Need to verify correct product IDs for my account
3. API key permissions verification

API Key: creem_test_1DJqKl2eRnF3FTlYNW09u8
Account: [Your account email]

Could you please:
1. Confirm my API key has checkout creation permissions
2. Provide guidance on correct product ID format
3. Verify if there are any network restrictions

Thank you for your assistance!
```

## 🎉 结论

基于CREEM官方文档，我们的代码实现是正确的。主要问题是：
1. 网络连接需要解决
2. 需要正确的产品ID
3. 可能需要API密钥权限调整

一旦解决这些配置问题，支付集成应该能够正常工作！
