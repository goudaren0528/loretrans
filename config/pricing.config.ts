import type { PricingPlan } from '../shared/types';

/**
 * 积分包规格（快速上线版 - 简化为3层）
 * 积分计费规则：
 * - 短文本翻译（≤300字符）：免费，无需积分
 * - 长文本翻译（>300字符）：付费，按字符数消耗积分
 * - 计费公式：超出部分字符数 × 0.1积分/字符
 * - 最小扣费：30积分（300字符以上的最小扣费）
 * 
 * 注意：creemProductId 需要在 Creem 控制台中预先创建对应的产品
 * 快速上线版本仅包含3个核心套餐，基于用户反馈后续扩展
 */
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free Plan',
    description: 'Perfect for trying out our service',
    credits: 0, // 免费计划，仅300字符以下免费翻译
    priceUSD: 0,
    creemProductId: '', // 免费计划不需要Creem产品ID
    creemPaymentUrl: '', // 免费计划不需要支付URL
    originalValue: 0,
    discount: 0,
    popular: false,
  },
  {
    id: 'starter',
    name: 'Starter Pack',
    description: 'Perfect for light users and students',
    credits: 2500, // 约25万字符的翻译量
    priceUSD: 5,
    creemProductId: 'prod_starter_2500', // 需要在CREEM控制台创建
    creemPaymentUrl: '', // 需要从CREEM获取
    originalValue: 5,
    discount: 0,
    popular: false,
  },
  {
    id: 'basic',
    name: 'Basic Pack',
    description: 'Great for regular users - Most Popular',
    credits: 6000, // 约60万字符的翻译量
    priceUSD: 10,
    creemProductId: 'prod_7ghOSJ2klCjPTjnURPbMoh', // 从CREEM控制台获取的产品ID
    creemPaymentUrl: 'https://www.creem.io/test/payment/prod_7ghOSJ2klCjPTjnURPbMoh', // 您提供的支付URL
    originalValue: 12,
    discount: 17, // 17%折扣
    popular: true, // 推荐套餐
  },
  {
    id: 'professional',
    name: 'Professional Pack',
    description: 'Ideal for professionals and small businesses',
    credits: 20000, // 约200万字符的翻译量
    priceUSD: 25,
    creemProductId: 'prod_professional_20k', // 需要在CREEM控制台创建
    creemPaymentUrl: '', // 需要从CREEM获取
    originalValue: 30,
    discount: 17, // 17%折扣
    popular: false,
  },
];

// 快速上线后可扩展的套餐（基于用户反馈决定是否添加）
export const FUTURE_PLANS: PricingPlan[] = [
  {
    id: 'business',
    name: 'Business Pack',
    description: 'Perfect for businesses and agencies',
    credits: 50000,
    priceUSD: 50,
    creemProductId: 'prod_business_50k',
    creemPaymentUrl: '',
    originalValue: 65,
    discount: 23,
    popular: false,
  },
  {
    id: 'enterprise',
    name: 'Enterprise Pack',
    description: 'For large organizations with high volume needs',
    credits: 150000,
    priceUSD: 120,
    creemProductId: 'prod_enterprise_150k',
    creemPaymentUrl: '',
    originalValue: 180,
    discount: 33,
    popular: false,
  },
];
