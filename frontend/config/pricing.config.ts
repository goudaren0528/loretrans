export interface PricingPlan {
  id: string
  name: string
  description: string
  credits: number
  priceUSD: number
  popular?: boolean
  discount?: number
  features: string[]
  validityDays?: number
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free Tier',
    description: 'Perfect for light usage',
    credits: 0,
    priceUSD: 0,
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
    popular: true,
    discount: 20,
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
    discount: 30,
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
    discount: 35,
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
    discount: 40,
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
]

export default PRICING_PLANS
