# Creem Payment URL 配置指南

## 概述
现在系统已经配置为使用Creem提供的直接payment URL，而不是通过API动态创建checkout session。这种方式更简单、更可靠。

## 配置步骤

### 1. 在Creem控制台创建商品
1. 登录 [Creem控制台](https://creem.io/dashboard)
2. 创建以下商品：
   - **Basic Pack**: 5000积分，$5
   - **Pro Pack**: 15000积分，$15  
   - **Business Pack**: 35000积分，$35

### 2. 获取Payment URL
为每个商品，Creem会提供一个直接的payment URL，类似于：
```
https://checkout.creem.io/pay/prod_xxxxxxxxxxxxx
```

### 3. 更新配置文件
在 `/config/pricing.config.ts` 中更新每个商品的 `creemPaymentUrl` 字段：

```typescript
export const PRICING_PLANS: PricingPlan[] = [
  // ... 免费计划保持不变
  {
    id: 'basic',
    name: 'Basic Pack',
    description: 'Great for personal use',
    credits: 5000,
    priceUSD: 5,
    creemPriceId: 'prod_7ghOSJ2klCjPTjnURPbMoh', // 你已有的产品ID
    creemPaymentUrl: 'https://checkout.creem.io/pay/prod_7ghOSJ2klCjPTjnURPbMoh', // 请替换为实际URL
    originalValue: 5,
    discount: 0,
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    description: 'Perfect for professionals',
    credits: 15000,
    priceUSD: 15,
    creemPriceId: 'prod_pro_15000', // 需要创建
    creemPaymentUrl: 'https://checkout.creem.io/pay/prod_pro_15000', // 请替换为实际URL
    originalValue: 17.5,
    discount: 14,
    popular: false,
  },
  {
    id: 'business',
    name: 'Business Pack',
    description: 'Best for teams and heavy usage',
    credits: 35000,
    priceUSD: 35,
    creemPriceId: 'prod_business_35000', // 需要创建
    creemPaymentUrl: 'https://checkout.creem.io/pay/prod_business_35000', // 请替换为实际URL
    originalValue: 43.75,
    discount: 20,
    popular: false,
  },
];
```

## 支付流程

### 当前流程：
1. 用户点击"购买"按钮
2. 系统调用 `/api/checkout` API
3. API返回商品配置中的 `creemPaymentUrl`
4. 前端直接跳转到Creem支付页面
5. 用户完成支付后，Creem会处理后续流程

### 优势：
- ✅ 简单可靠，不依赖复杂的API调用
- ✅ 减少了API错误的可能性
- ✅ Creem直接处理支付流程
- ✅ 更好的用户体验

## 测试步骤

1. **添加Payment URL**: 将Creem提供的payment URL添加到配置文件
2. **重启服务**: 重新启动开发服务器
3. **测试支付**: 点击商品的"购买"按钮
4. **验证跳转**: 确认能正确跳转到Creem支付页面

## 需要提供的信息

请提供以下信息以完成配置：

### Basic Pack (已有产品ID: prod_7ghOSJ2klCjPTjnURPbMoh)
- Payment URL: `待提供`

### Pro Pack (需要创建)
- 产品ID: `待创建`
- Payment URL: `待提供`

### Business Pack (需要创建)  
- 产品ID: `待创建`
- Payment URL: `待提供`

## 注意事项

1. **Success/Cancel URL**: Creem支付页面完成后的跳转URL需要在Creem控制台配置
2. **Webhook**: 如果需要服务器端处理支付结果，需要配置webhook
3. **测试模式**: 确保在测试环境使用测试模式的payment URL

---

**下一步**: 请提供各商品的payment URL，我将更新配置文件完成设置。
