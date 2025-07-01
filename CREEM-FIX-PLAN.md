# Creem 集成修复计划

## 🎯 修复目标
将当前基于Stripe SDK模式的Creem集成，修正为符合Creem官方API规范的REST API集成。

## 📋 修复清单

### 阶段1: 核心API修复 (高优先级)

#### 1.1 修改 Creem 服务类
**文件**: `lib/services/creem.ts`
**当前问题**: 使用Mock SDK模式
**修复方案**: 
```javascript
export class CreemService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, testMode = false) {
    this.apiKey = apiKey;
    this.baseUrl = testMode 
      ? 'https://api.creem.io/test/v1' 
      : 'https://api.creem.io/v1';
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
      const error = await response.json();
      throw new Error(`Creem API error: ${error.message || response.statusText}`);
    }

    return response.json();
  }
}
```

#### 1.2 修改产品配置
**文件**: `config/pricing.config.ts`
**当前问题**: 使用 `creemPriceId`
**修复方案**: 
```javascript
export const PRICING_PLANS = [
  {
    id: 'credits_1000',
    name: '1,000 Credits',
    credits: 1000,
    priceUSD: 1.99,
    creemProductId: 'prod_1000_credits', // 需要在Creem控制台创建
    description: 'Perfect for light usage'
  },
  {
    id: 'credits_5000',
    name: '5,000 Credits',
    credits: 5000,
    priceUSD: 8.99,
    creemProductId: 'prod_5000_credits',
    description: 'Great value for regular users',
    discount: '10%'
  }
  // ... 其他计划
];
```

#### 1.3 修改支付API端点
**文件**: `app/api/checkout/route.ts`
**当前问题**: 使用SDK方式调用
**修复方案**:
```javascript
async function createCheckoutSession(req: NextRequestWithUser) {
  try {
    const { planId } = await req.json();
    const plan = PRICING_PLANS.find(p => p.id === planId);
    
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const origin = req.nextUrl.origin;
    const creemService = new CreemService(process.env.CREEM_API_KEY!);
    
    const checkout = await creemService.createCheckout({
      product_id: plan.creemProductId,
      customer_email: req.userContext.user.email,
      success_url: `${origin}/dashboard?purchase=success&plan=${planId}`,
      cancel_url: `${origin}/pricing?purchase=canceled`,
      request_id: `${req.userContext.user.id}_${Date.now()}`
    });

    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    console.error('Checkout creation error:', error);
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
  }
}
```

### 阶段2: Return URL处理 (中优先级)

#### 2.1 创建Return URL处理端点
**新文件**: `app/api/payment/success/route.ts`
```javascript
import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase-server';
import { PRICING_PLANS } from '@/config/pricing.config';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const checkout_id = searchParams.get('checkout_id');
  const order_id = searchParams.get('order_id');
  const customer_id = searchParams.get('customer_id');
  const product_id = searchParams.get('product_id');
  const signature = searchParams.get('signature');
  const request_id = searchParams.get('request_id');

  // 验证签名
  if (!verifyCreemSignature(searchParams, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // 处理积分充值
  const plan = PRICING_PLANS.find(p => p.creemProductId === product_id);
  if (!plan) {
    return NextResponse.json({ error: 'Unknown product' }, { status: 400 });
  }

  // 从request_id提取用户ID
  const userId = request_id?.split('_')[0];
  if (!userId) {
    return NextResponse.json({ error: 'Invalid request ID' }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase.rpc('add_credits_on_purchase', {
    p_user_id: userId,
    p_credits_to_add: plan.credits,
    p_amount_paid_usd: plan.priceUSD,
    p_creem_order_id: order_id,
    p_payment_metadata: { checkout_id, customer_id, product_id }
  });

  if (error) {
    console.error('Failed to add credits:', error);
    return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 });
  }

  // 重定向到成功页面
  return NextResponse.redirect(new URL('/dashboard?purchase=success', request.url));
}

function verifyCreemSignature(params: URLSearchParams, signature: string | null): boolean {
  // 实现Creem签名验证逻辑
  // 需要根据Creem文档实现具体的签名验证算法
  return true; // 临时返回true，需要实现真实验证
}
```

#### 2.2 更新成功页面处理
**文件**: `app/[locale]/dashboard/page.tsx`
添加支付成功状态处理和用户反馈。

### 阶段3: 配置和环境 (低优先级)

#### 3.1 环境变量更新
**文件**: `.env.local`
```bash
# Creem Configuration
CREEM_API_KEY=creem_live_xxxxx
CREEM_TEST_API_KEY=creem_test_xxxxx
CREEM_WEBHOOK_SECRET=whsec_xxxxx
```

#### 3.2 Creem控制台配置
需要在 https://creem.io/dashboard 完成：
1. 创建对应的产品 (获取product_id)
2. 配置webhook端点 (如果需要)
3. 设置Return URL
4. 获取API密钥

## 🚀 实施步骤

### 第1步: 备份当前实现
```bash
cp lib/services/creem.ts lib/services/creem.ts.backup
cp app/api/checkout/route.ts app/api/checkout/route.ts.backup
```

### 第2步: 实施核心修复
1. 修改 `lib/services/creem.ts`
2. 更新 `config/pricing.config.ts`
3. 修改 `app/api/checkout/route.ts`

### 第3步: 测试基本功能
1. 测试支付会话创建
2. 验证重定向到Creem支付页面
3. 测试取消流程

### 第4步: 实施Return URL处理
1. 创建 `app/api/payment/success/route.ts`
2. 实现签名验证
3. 测试完整支付流程

### 第5步: 生产环境配置
1. 在Creem控制台创建真实产品
2. 配置生产环境API密钥
3. 设置正确的Return URL

## ⚠️ 注意事项

1. **测试模式**: 先在Creem测试模式下验证所有功能
2. **签名验证**: 必须实现正确的签名验证以确保安全
3. **错误处理**: 添加完善的错误处理和日志记录
4. **幂等性**: 确保支付处理的幂等性，避免重复充值
5. **用户体验**: 提供清晰的支付状态反馈

## 📊 验收标准

- [ ] 支付会话创建成功
- [ ] 用户能正常跳转到Creem支付页面
- [ ] 支付成功后正确处理Return URL
- [ ] 积分正确充值到用户账户
- [ ] 支付失败或取消的正确处理
- [ ] 所有支付操作有完整日志记录
- [ ] 签名验证正常工作
- [ ] 测试模式和生产模式都能正常工作

## 🔄 回滚计划

如果修复过程中出现问题：
1. 恢复备份文件
2. 重启服务
3. 验证原有Mock功能正常
4. 分析问题并重新规划修复方案
