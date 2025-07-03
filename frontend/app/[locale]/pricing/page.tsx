import { Metadata } from 'next'
import { PricingPageV2 } from '@/components/billing/pricing-page-v2'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'pricing' })
  
  return {
    title: '定价套餐 - 选择适合您的翻译方案 | Transly',
    description: '基于使用场景的智能定价推荐。学生$5起，个人用户$10，专业用户$25。支持海地克里奥尔语、老挝语等20+小语种翻译。',
    keywords: [
      'translation pricing',
      'AI translation cost',
      'credit packages',
      'translation credits',
      'low-resource languages',
      'NLLB pricing',
      '小语种翻译定价',
      '翻译套餐',
      '积分充值'
    ],
    openGraph: {
      title: '定价套餐 - 选择适合您的翻译方案 | Transly',
      description: '基于使用场景的智能定价推荐。学生$5起，个人用户$10，专业用户$25。',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: '定价套餐 - 选择适合您的翻译方案 | Transly',
      description: '基于使用场景的智能定价推荐。学生$5起，个人用户$10，专业用户$25。',
    },
  }
}

export default function Pricing({
  params: { locale }
}: {
  params: { locale: string }
}) {
  return <PricingPageV2 />
}
