# 🛍️ Creem 商品配置 - 精简版

## ✅ 确认：商品完全通过配置文件管理

**是的！** 所有商品都通过 `config/pricing.config.ts` 配置文件管理，无需修改其他代码。

## 📋 精简后的商品结构 (4个套餐)

| 套餐 | 价格 | 积分 | 描述 | 需要在Creem创建 |
|------|------|------|------|----------------|
| **Free** | $0 | 0 | 免费试用 | ❌ 不需要 |
| **Basic** | $5 | 5,000 | 个人用户 | ✅ 需要创建 |
| **Pro** | $15 | 15,000 | 专业用户 | ✅ 需要创建 |
| **Business** | $35 | 35,000 | 团队企业 | ✅ 需要创建 |

## 🎯 在Creem控制台需要创建的商品

你只需要在 [Creem控制台](https://creem.io/dashboard/products) 创建 **3个商品**：

### 商品1: Basic Pack
```
Product Name: Basic Pack
Description: Great for personal use - 5,000 translation credits
Price: $5.00 USD
Currency: USD
```

### 商品2: Pro Pack
```
Product Name: Pro Pack  
Description: Perfect for professionals - 15,000 translation credits
Price: $15.00 USD
Currency: USD
```

### 商品3: Business Pack
```
Product Name: Business Pack
Description: Best for teams and heavy usage - 35,000 translation credits
Price: $35.00 USD
Currency: USD
```

## 🔧 配置更新流程

### 步骤1: 创建Creem商品
在Creem控制台创建上述3个商品

### 步骤2: 获取Product ID
每个商品创建后会得到一个Product ID，格式类似：`prod_1234567890abcdef`

### 步骤3: 更新配置文件
将真实的Product ID替换到 `config/pricing.config.ts`：

```typescript
{
  id: 'basic',
  name: 'Basic Pack',
  creemPriceId: 'prod_你的真实ID', // 替换这里
  // ... 其他配置保持不变
}
```

### 步骤4: 重启服务
```bash
npm run dev
```

## ✨ 配置文件的灵活性

### 可以随时修改的内容：
- ✅ **商品名称**: `name` 字段
- ✅ **商品描述**: `description` 字段  
- ✅ **积分数量**: `credits` 字段
- ✅ **价格显示**: `priceUSD` 字段
- ✅ **折扣信息**: `discount` 字段
- ✅ **推荐标记**: `popular` 字段

### 添加新商品：
```typescript
{
  id: 'new_plan',
  name: 'New Plan',
  description: 'Description here',
  credits: 10000,
  priceUSD: 25,
  creemPriceId: 'prod_new_plan_id', // 需要在Creem创建
  discount: 15,
  popular: false,
}
```

### 删除商品：
直接从 `PRICING_PLANS` 数组中移除对应对象即可。

## 🎨 当前精简配置预览

访问 http://localhost:3000/payments 可以看到新的精简商品配置：

- **Free Plan**: $0 (免费试用)
- **Basic Pack**: $5 (5,000积分) ⭐ 推荐
- **Pro Pack**: $15 (15,000积分，14%折扣)
- **Business Pack**: $35 (35,000积分，20%折扣)

## 🚀 下一步

1. **在Creem控制台创建3个商品**
2. **获取真实的Product ID**
3. **更新配置文件中的 `creemPriceId`**
4. **测试支付流程**

配置已经精简完成，现在只需要在Creem控制台创建对应的商品即可！
