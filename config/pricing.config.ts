import type { PricingPlan } from '../shared/types';

/**
 * 积分包规格（快速上线版 - 简化为3层）
 * 积分计费规则：
 * - 短文本翻译（≤1000字符）：免费，无需积分
 * - 长文本翻译（>1000字符）：付费，按字符数消耗积分
 * - 计费公式：超出部分字符数 × 0.1积分/字符
 * - 最小扣费：100积分（1000字符以上的最小扣费）
 * 
 * 注意：creemProductId 和支付URL现在从环境变量读取
 * 快速上线版本仅包含3个核心套餐，基于用户反馈后续扩展
 */

// 从环境变量获取支付配置
const getPaymentConfig = (planId: string) => {
  const productIdKey = `CREEM_PRODUCT_ID_${planId.toUpperCase()}`;
  const productId = process.env[productIdKey] || '';
  const baseUrl = process.env.CREEM_PAYMENT_BASE_URL || 'https://www.creem.io/test/payment';
  
  return {
    creemProductId: productId,
    creemPaymentUrl: productId ? `${baseUrl}/${productId}` : ''
  };
};

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free Tier',
    description: 'Perfect for light usage',
    credits: 0,
    priceUSD: 0,
    creemProductId: '',
    creemPaymentUrl: '',
    originalValue: 0,
    discount: 0,
    popular: false,
    features: [
      'free_text',
      'all_languages', 
      'unlimited_use'
    ]
  },
  {
    id: 'starter',
    name: 'Starter Package',
    description: 'Perfect for occasional users',
    credits: 1000,
    priceUSD: 5,
    ...getPaymentConfig('starter'),
    originalValue: 5,
    discount: 0,
    popular: false,
    features: [
      'credits',
      'languages',
      'documents',
      'validity'
    ],
    validityDays: 7
  },
  {
    id: 'basic',
    name: 'Basic Package', 
    description: 'Most popular choice',
    credits: 5000,
    priceUSD: 10,
    ...getPaymentConfig('basic'),
    originalValue: 12,
    discount: 20,
    popular: true,
    features: [
      'credits',
      'languages',
      'documents', 
      'validity',
      'support'
    ],
    validityDays: 30
  },
  {
    id: 'pro',
    name: 'Professional Package',
    description: 'Perfect for heavy users',
    credits: 10000,
    priceUSD: 25,
    ...getPaymentConfig('pro'),
    originalValue: 30,
    discount: 30,
    popular: false,
    features: [
      'credits',
      'languages',
      'documents',
      'validity', 
      'support',
      'batch'
    ],
    validityDays: 60
  },
  {
    id: 'business',
    name: 'Business Package',
    description: 'Perfect for teams and enterprises',
    credits: 25000,
    priceUSD: 50,
    ...getPaymentConfig('business'),
    originalValue: 65,
    discount: 35,
    popular: false,
    features: [
      'credits',
      'languages',
      'documents',
      'validity',
      'support',
      'batch',
      'api'
    ],
    validityDays: 90
  },
  {
    id: 'enterprise',
    name: 'Enterprise Package',
    description: 'Large enterprise solution',
    credits: 50000,
    priceUSD: 80,
    ...getPaymentConfig('enterprise'),
    originalValue: 180,
    discount: 40,
    popular: false,
    features: [
      'credits',
      'languages', 
      'documents',
      'validity',
      'support',
      'batch',
      'api',
      'integration'
    ],
    validityDays: 180
  }
];

export default PRICING_PLANS;
