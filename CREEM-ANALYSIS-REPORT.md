# Creem 集成方式分析报告

## 🔍 当前理解与实际情况对比

### 当前产品文档中的理解
根据 `product.md` 中的描述，我们将Creem理解为：
- 类似Stripe的支付处理服务
- 使用 `checkout.sessions.create()` 方式创建支付会话
- 支持一次性支付的积分购买模式

### 📋 Creem官方文档实际情况

基于官方文档 `https://docs.creem.io/checkout-flow` 的分析：

#### 1. **正确的集成流程**
```bash
# 正确的API调用方式
curl -X POST https://api.creem.io/v1/checkouts \
  -H "x-api-key: creem_123456789" \
  -D '{"product_id": "prod_6tW66i0oZM7w1qXReHJrwg"}'
```

#### 2. **关键差异点**

| 方面 | 当前理解 | 实际情况 |
|------|----------|----------|
| **API端点** | 假设类似Stripe的sessions | 实际是 `/v1/checkouts` |
| **参数结构** | 使用 `line_items` 数组 | 使用简单的 `product_id` |
| **产品管理** | 在代码中定义价格 | 需要在Creem控制台预先创建产品 |
| **认证方式** | 可能使用Bearer token | 使用 `x-api-key` header |

#### 3. **正确的集成步骤**

1. **在Creem控制台创建产品**
   - 访问 https://creem.io/dashboard/products
   - 设置产品名称、描述、价格
   - 获取产品ID (格式: `prod_xxxxx`)

2. **创建Checkout会话**
   ```javascript
   const response = await fetch('https://api.creem.io/v1/checkouts', {
     method: 'POST',
     headers: {
       'x-api-key': process.env.CREEM_API_KEY,
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({
       product_id: 'prod_6tW66i0oZM7w1qXReHJrwg',
       // 可选参数
       success_url: 'https://yoursite.com/success',
       cancel_url: 'https://yoursite.com/cancel',
       customer_email: user.email,
       request_id: 'unique_request_id' // 用于追踪
     })
   });
   ```

3. **处理返回URL参数**
   成功支付后，用户会被重定向到success_url，携带以下参数：
   - `checkout_id`: 支付会话ID
   - `order_id`: 订单ID
   - `customer_id`: 客户ID
   - `product_id`: 产品ID
   - `signature`: Creem签名（用于验证）

## 🚨 需要修正的问题

### 1. **API调用方式错误**
**当前代码问题**:
```javascript
// 错误的方式 (当前实现)
const session = await creemServer.checkout.sessions.create({
  customer_email: user.email,
  line_items: [{ price: plan.creemPriceId, quantity: 1 }],
  mode: 'payment'
});
```

**正确的方式**:
```javascript
// 正确的方式
const response = await fetch('https://api.creem.io/v1/checkouts', {
  method: 'POST',
  headers: {
    'x-api-key': process.env.CREEM_API_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    product_id: plan.creemProductId // 不是priceId，是productId
  })
});
```

### 2. **产品配置方式错误**
**当前配置**:
```javascript
// 错误：在代码中定义价格
const PRICING_PLANS = [
  {
    id: 'credits_1000',
    creemPriceId: 'price_xxx', // 这个概念不存在
    priceUSD: 1.99
  }
];
```

**正确配置**:
```javascript
// 正确：引用Creem控制台中创建的产品
const PRICING_PLANS = [
  {
    id: 'credits_1000',
    creemProductId: 'prod_6tW66i0oZM7w1qXReHJrwg', // 在Creem控制台创建
    credits: 1000,
    name: '1000 Credits Pack'
  }
];
```

### 3. **Webhook事件处理**
**当前理解**: 类似Stripe的 `checkout.session.completed`
**实际情况**: 需要根据Creem的实际webhook事件类型调整

## 📝 建议的修正方案

### 1. **立即修正**
- [ ] 修改API调用方式，使用正确的REST API
- [ ] 更新产品配置，使用productId而不是priceId
- [ ] 修正webhook事件处理逻辑

### 2. **产品文档更新**
- [ ] 更新支付集成部分的技术描述
- [ ] 修正API调用示例
- [ ] 更新环境变量配置说明

### 3. **代码重构优先级**
1. **高优先级**: 修正API调用方式
2. **中优先级**: 更新产品配置管理
3. **低优先级**: 优化错误处理和用户体验

## 🔧 具体修改建议

### 修改 `lib/services/creem.ts`
```javascript
// 移除Mock实现，使用真实的HTTP调用
export class CreemService {
  private apiKey: string;
  private baseUrl = 'https://api.creem.io/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async createCheckout(params: {
    product_id: string;
    customer_email?: string;
    success_url?: string;
    cancel_url?: string;
    request_id?: string;
  }) {
    const response = await fetch(`${this.baseUrl}/checkouts`, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      throw new Error(`Creem API error: ${response.statusText}`);
    }

    return response.json();
  }
}
```

### 修改 `config/pricing.config.ts`
```javascript
export const PRICING_PLANS = [
  {
    id: 'credits_1000',
    name: '1,000 Credits',
    credits: 1000,
    priceUSD: 1.99,
    creemProductId: 'prod_1000_credits', // 需要在Creem控制台创建
  },
  // ... 其他计划
];
```

## 🎯 总结

当前的Creem集成实现基于对Stripe API的理解，但Creem有自己独特的API设计。主要问题是：

1. **API调用方式完全不同** - Creem使用简单的REST API而不是SDK
2. **产品管理方式不同** - 需要在Creem控制台预先创建产品
3. **参数结构不同** - 使用product_id而不是line_items

建议优先修正API调用方式，然后逐步完善其他功能。这样可以确保支付功能的正常工作。
