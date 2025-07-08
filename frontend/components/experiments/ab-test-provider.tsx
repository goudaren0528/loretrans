'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

// A/B测试实验配置
interface Experiment {
  id: string
  name: string
  variants: {
    [key: string]: {
      name: string
      weight: number // 权重，用于分配流量
    }
  }
  active: boolean
}

// 当前活跃的实验
const ACTIVE_EXPERIMENTS: Experiment[] = [
  {
    id: 'pricing_entry_point',
    name: '定价页面入门套餐优化',
    variants: {
      control: { name: 'Control - $5 Starter', weight: 50 },
      variant_a: { name: 'Variant A - $5 Super Value', weight: 25 },
      variant_b: { name: 'Variant B - $4.99 Starter', weight: 25 }
    },
    active: true
  },
  {
    id: 'homepage_cta',
    name: '首页CTA按钮优化',
    variants: {
      control: { name: 'Control - 立即免费试用', weight: 50 },
      variant_a: { name: 'Variant A - 免费翻译500字符', weight: 50 }
    },
    active: true
  },
  {
    id: 'credit_warning',
    name: '积分不足提醒优化',
    variants: {
      control: { name: 'Control - 简单提醒', weight: 50 },
      variant_a: { name: 'Variant A - 紧急感提醒', weight: 50 }
    },
    active: true
  }
]

interface ABTestContextType {
  getVariant: (experimentId: string) => string
  trackEvent: (event: string, properties?: Record<string, any>) => void
  isVariant: (experimentId: string, variantId: string) => boolean
}

const ABTestContext = createContext<ABTestContextType | null>(null)

export function ABTestProvider({ children }: { children: ReactNode }) {
  const [userVariants, setUserVariants] = useState<Record<string, string>>({})

  useEffect(() => {
    // 从localStorage获取用户的实验分组
    const savedVariants = localStorage.getItem('ab_test_variants')
    if (savedVariants) {
      setUserVariants(JSON.parse(savedVariants))
    } else {
      // 为新用户分配实验分组
      const newVariants: Record<string, string> = {}
      
      ACTIVE_EXPERIMENTS.forEach(experiment => {
        if (experiment.active) {
          newVariants[experiment.id] = assignVariant(experiment)
        }
      })
      
      setUserVariants(newVariants)
      localStorage.setItem('ab_test_variants', JSON.stringify(newVariants))
    }
  }, [])

  // 分配实验变体
  const assignVariant = (experiment: Experiment): string => {
    const random = Math.random() * 100
    let cumulative = 0
    
    for (const [variantId, variant] of Object.entries(experiment.variants)) {
      cumulative += variant.weight
      if (random <= cumulative) {
        return variantId
      }
    }
    
    // 默认返回第一个变体
    return Object.keys(experiment.variants)[0]
  }

  const getVariant = (experimentId: string): string => {
    return userVariants[experimentId] || 'control'
  }

  const isVariant = (experimentId: string, variantId: string): boolean => {
    return getVariant(experimentId) === variantId
  }

  const trackEvent = (event: string, properties: Record<string, any> = {}) => {
    // 记录事件到分析系统
    const eventData = {
      event,
      properties: {
        ...properties,
        variants: userVariants,
        timestamp: new Date().toISOString(),
        userId: properties.userId || 'anonymous'
      }
    }

    // 发送到分析服务
    if (typeof window !== 'undefined') {
      // 简单的事件记录，可以替换为Google Analytics、Mixpanel等
      console.log('AB Test Event:', eventData)
      
      // 存储到localStorage用于后续分析
      const events = JSON.parse(localStorage.getItem('ab_test_events') || '[]')
      events.push(eventData)
      
      // 只保留最近1000个事件
      if (events.length > 1000) {
        events.splice(0, events.length - 1000)
      }
      
      localStorage.setItem('ab_test_events', JSON.stringify(events))
    }
  }

  return (
    <ABTestContext.Provider value={{ getVariant, trackEvent, isVariant }}>
      {children}
    </ABTestContext.Provider>
  )
}

export function useABTest() {
  const context = useContext(ABTestContext)
  if (!context) {
    throw new Error('useABTest must be used within ABTestProvider')
  }
  return context
}

// 便捷的Hook用于特定实验
export function usePricingExperiment() {
  const { getVariant, isVariant, trackEvent } = useABTest()
  
  const variant = getVariant('pricing_entry_point')
  
  const getPricingConfig = () => {
    switch (variant) {
      case 'variant_a':
        return {
          name: 'Super Value',
          price: 5,
          credits: 3000, // 增加积分数量
          highlight: '超值推荐'
        }
      case 'variant_b':
        return {
          name: 'Starter',
          price: 4.99, // 心理价位
          credits: 2500,
          highlight: '限时特价'
        }
      default:
        return {
          name: 'Starter',
          price: 5,
          credits: 2500,
          highlight: '入门首选'
        }
    }
  }

  const trackPricingEvent = (action: string, properties?: Record<string, any>) => {
    trackEvent(`pricing_${action}`, {
      ...properties,
      experiment: 'pricing_entry_point',
      variant
    })
  }

  return {
    variant,
    isVariant: (variantId: string) => isVariant('pricing_entry_point', variantId),
    config: getPricingConfig(),
    trackEvent: trackPricingEvent
  }
}

export function useHomepageCTAExperiment() {
  const { getVariant, isVariant, trackEvent } = useABTest()
  
  const variant = getVariant('homepage_cta')
  
  const getCTAText = () => {
    switch (variant) {
      case 'variant_a':
        return '免费翻译500字符'
      default:
        return '立即免费试用'
    }
  }

  const trackCTAEvent = (action: string, properties?: Record<string, any>) => {
    trackEvent(`homepage_cta_${action}`, {
      ...properties,
      experiment: 'homepage_cta',
      variant
    })
  }

  return {
    variant,
    isVariant: (variantId: string) => isVariant('homepage_cta', variantId),
    ctaText: getCTAText(),
    trackEvent: trackCTAEvent
  }
}

export function useCreditWarningExperiment() {
  const { getVariant, isVariant, trackEvent } = useABTest()
  
  const variant = getVariant('credit_warning')
  
  const getWarningConfig = () => {
    switch (variant) {
      case 'variant_a':
        return {
          title: '⚠️ 积分即将用完！',
          message: '您的积分余额不足，可能影响翻译服务。立即充值享受不间断翻译！',
          urgency: 'high',
          buttonText: '立即充值'
        }
      default:
        return {
          title: '积分不足提醒',
          message: '您的积分余额较低，建议及时充值以继续使用翻译服务。',
          urgency: 'normal',
          buttonText: '去充值'
        }
    }
  }

  const trackWarningEvent = (action: string, properties?: Record<string, any>) => {
    trackEvent(`credit_warning_${action}`, {
      ...properties,
      experiment: 'credit_warning',
      variant
    })
  }

  return {
    variant,
    isVariant: (variantId: string) => isVariant('credit_warning', variantId),
    config: getWarningConfig(),
    trackEvent: trackWarningEvent
  }
}
