# Creem 商品配置模板

## 🛍️ 需要在Creem控制台创建的商品

### 商品1: Starter Pack
```
Product Name: Starter Pack
Description: Perfect for occasional personal use - 1,000 translation credits
Price: $1.99
Currency: USD
Features: Basic translation, Email support
```
**获得的Product ID**: `prod_xxxxxxxxxx` → 更新到配置文件的 `creemPriceId`

### 商品2: Value Pack (推荐)
```
Product Name: Value Pack
Description: Great value for regular users - 5,000 translation credits with 10% bonus
Price: $8.99
Currency: USD
Features: All translation features, Priority support
```
**获得的Product ID**: `prod_xxxxxxxxxx` → 更新到配置文件的 `creemPriceId`

### 商品3: Premium Pack
```
Product Name: Premium Pack
Description: Best value for heavy users - 10,000 translation credits with 20% bonus
Price: $15.99
Currency: USD
Features: All premium features, Priority support, Custom integrations
```
**获得的Product ID**: `prod_xxxxxxxxxx` → 更新到配置文件的 `creemPriceId`

### 商品4: Professional Pack
```
Product Name: Professional Pack
Description: For professionals and small teams - 25,000 translation credits with 30% bonus
Price: $34.99
Currency: USD
Features: Team collaboration, Dedicated support, Advanced analytics
```
**获得的Product ID**: `prod_xxxxxxxxxx` → 更新到配置文件的 `creemPriceId`

### 商品5: Business Pack
```
Product Name: Business Pack
Description: Enterprise solution - 50,000 translation credits with 40% bonus
Price: $59.99
Currency: USD
Features: Enterprise features, Dedicated account manager, SLA guarantee
```
**获得的Product ID**: `prod_xxxxxxxxxx` → 更新到配置文件的 `creemPriceId`

## 📝 配置文件更新示例

创建商品后，将真实的Product ID更新到 `config/pricing.config.ts`:

```typescript
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    description: 'Perfect for occasional personal use',
    credits: 1000,
    priceUSD: 1.99,
    creemPriceId: 'prod_1234567890abcdef', // 替换为真实的Product ID
    originalValue: 1.99,
    discount: 0,
    popular: false,
  },
  {
    id: 'value',
    name: 'Value Pack',
    description: 'Great value for regular users',
    credits: 5000,
    priceUSD: 8.99,
    creemPriceId: 'prod_abcdef1234567890', // 替换为真实的Product ID
    originalValue: 9.95,
    discount: 10,
    popular: true,
  },
  // ... 其他商品
];
```

## 🔗 其他必要配置

### Return URL配置
在Creem控制台设置Return URL:
```
Success URL: https://yourdomain.com/api/payment/success
Cancel URL: https://yourdomain.com/pricing?purchase=canceled
```

### Webhook配置 (可选)
```
Webhook URL: https://yourdomain.com/api/webhooks/creem
Events: payment.succeeded, payment.failed, charge.dispute.created
```

### API密钥配置
在 `.env.local` 中配置:
```bash
CREEM_SECRET_KEY=creem_sk_live_your_secret_key
CREEM_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## ✅ 验证清单

- [ ] 在Creem控制台创建了5个商品
- [ ] 复制了所有Product ID
- [ ] 更新了 `config/pricing.config.ts` 中的 `creemPriceId`
- [ ] 配置了Return URL
- [ ] 设置了API密钥
- [ ] 测试了支付流程

## 💡 商品数量建议

**推荐5个商品** (当前配置):
- ✅ 覆盖不同用户需求 (个人 → 企业)
- ✅ 价格梯度合理 ($1.99 → $59.99)
- ✅ 积分数量递增 (1K → 50K)
- ✅ 折扣激励明确 (0% → 40%)

**可选扩展到7-8个商品**:
- 添加更小的入门包 (500积分, $0.99)
- 添加超大企业包 (100K积分, $99.99)
- 添加季度/年度订阅选项

**不建议超过10个商品**:
- 避免选择困难
- 保持界面简洁
- 便于管理和维护
