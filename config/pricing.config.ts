import type { PricingPlan } from '../shared/types';

/**
 * 积分包规格（精简版设计）
 * 积分计费规则：
 * - 短文本翻译（≤500字符）：免费，无需积分
 * - 长文本翻译（>500字符）：付费，按字符数消耗积分
 * - 计费公式：超出部分字符数 × 0.1积分/字符
 * - 最小扣费：50积分（500字符以上的最小扣费）
 * 
 * 注意：creemPriceId 和 creemPaymentUrl 需要在 Creem 控制台中预先创建对应的产品
 */
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free Plan',
    description: 'Perfect for trying out our service',
    credits: 0, // 免费计划，仅500字符以下免费翻译
    priceUSD: 0,
    creemPriceId: '', // 免费计划不需要Creem产品ID
    creemPaymentUrl: '', // 免费计划不需要支付URL
    originalValue: 0,
    discount: 0,
    popular: false,
  },
  {
    id: 'basic',
    name: 'Basic Pack',
    description: 'Great for personal use',
    credits: 5000, // 约5万字符的翻译量
    priceUSD: 5,
    creemPriceId: 'prod_7ghOSJ2klCjPTjnURPbMoh', // 从Creem控制台获取
    creemPaymentUrl: 'https://www.creem.io/test/payment/prod_7ghOSJ2klCjPTjnURPbMoh', // 请提供Creem为此商品生成的payment URL
    originalValue: 5,
    discount: 0,
    popular: true, // 推荐套餐
  },
];
