import type { PricingPlan } from '../shared/types';

/**
 * 积分包规格（精简版设计）
 * 积分计费规则：
 * - 短文本翻译（≤500字符）：免费，无需积分
 * - 长文本翻译（>500字符）：付费，按字符数消耗积分
 * - 计费公式：超出部分字符数 × 0.1积分/字符
 * - 最小扣费：50积分（500字符以上的最小扣费）
 * 
 * 注意：creemProductId 需要在 Creem 控制台中预先创建对应的产品
 * 使用单一API密钥模式，不再区分公私钥
 */
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free Plan',
    description: 'Perfect for trying out our service',
    credits: 0, // 免费计划，仅500字符以下免费翻译
    priceUSD: 0,
    creemProductId: '', // 免费计划不需要Creem产品ID
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
    creemProductId: 'prod_7ghOSJ2klCjPTjnURPbMoh', // 从CREEM控制台获取的产品ID
    creemPaymentUrl: 'https://www.creem.io/test/payment/prod_7ghOSJ2klCjPTjnURPbMoh', // 您提供的支付URL
    originalValue: 5,
    discount: 0,
    popular: true, // 推荐套餐
  },
];
