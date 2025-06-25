import type { PricingPlan } from '../shared/types';

/**
 * Defines the available credit packages for purchase.
 * The `creemPriceId` is a placeholder and must be replaced with the actual
 * Price ID from the Creem dashboard once the products are configured there.
 */
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: '入门包',
    description: '适合偶尔使用的个人用户',
    credits: 1000,
    priceUSD: 10,
    creemPriceId: 'price_starter_placeholder',
  },
  {
    id: 'professional',
    name: '专业包',
    description: '为需要更高翻译量的专业人士和小型团队设计',
    credits: 5500,
    priceUSD: 50,
    creemPriceId: 'price_professional_placeholder',
    discount: '节省 10%',
  },
  {
    id: 'business',
    name: '商业包',
    description: '满足企业级需求，提供最优惠的单价',
    credits: 12000,
    priceUSD: 100,
    creemPriceId: 'price_business_placeholder',
    discount: '节省 20%',
  },
]; 