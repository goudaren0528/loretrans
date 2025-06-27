import type { PricingPlan } from '../shared/types';

/**
 * 积分包规格（基于产品文档设计）
 * 积分计费规则：
 * - 短文本翻译（≤500字符）：免费，无需积分
 * - 长文本翻译（>500字符）：付费，按字符数消耗积分
 * - 计费公式：超出部分字符数 × 0.1积分/字符
 * - 最小扣费：50积分（500字符以上的最小扣费）
 */
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    description: 'Perfect for occasional personal use',
    credits: 1000,
    priceUSD: 1.99,
    creemPriceId: 'price_starter_placeholder',
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
    creemPriceId: 'price_value_placeholder',
    originalValue: 9.95,
    discount: 10,
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium Pack',
    description: 'Best value for heavy users',
    credits: 10000,
    priceUSD: 15.99,
    creemPriceId: 'price_premium_placeholder',
    originalValue: 19.90,
    discount: 20,
    popular: false,
  },
  {
    id: 'professional',
    name: 'Professional Pack',
    description: 'For professionals and small teams',
    credits: 25000,
    priceUSD: 34.99,
    creemPriceId: 'price_professional_placeholder',
    originalValue: 49.75,
    discount: 30,
    popular: false,
  },
  {
    id: 'business',
    name: 'Business Pack',
    description: 'Enterprise-level solution with maximum savings',
    credits: 50000,
    priceUSD: 59.99,
    creemPriceId: 'price_business_placeholder',
    originalValue: 99.50,
    discount: 40,
    popular: false,
  },
]; 