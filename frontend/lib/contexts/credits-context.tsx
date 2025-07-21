'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'

interface CreditsContextType {
  credits: number
  isLoading: boolean
  refreshCredits: () => Promise<number | null>
  updateCredits: (newCredits: number) => void
  hasCredits: boolean
  hasEnoughCredits: (required: number) => boolean
  estimateCredits: (textLength: number) => number
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined)

export function CreditsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [credits, setCredits] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // 从数据库获取积分
  const fetchCredits = useCallback(async () => {
    if (!user?.id) {
      setCredits(0)
      return 0
    }
    
    setIsLoading(true)
    try {
      const { createSupabaseBrowserClient } = await import('@/lib/supabase')
      const supabase = createSupabaseBrowserClient()
      
      console.log('[CreditsContext] Fetching credits for user:', { userId: user.id, email: user.email })
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('credits')
        .eq('id', user.id)
        .single()
      
      if (userError) {
        console.error('[CreditsContext] 查询用户积分失败:', userError)
        setCredits(0)
        return 0
      } else if (userData) {
        setCredits(userData.credits)
        console.log('[CreditsContext] 查询到用户积分:', userData.credits)
        return userData.credits
      } else {
        setCredits(0)
        return 0
      }
    } catch (error) {
      console.error('[CreditsContext] 积分查询异常:', error)
      setCredits(0)
      return 0
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  // 直接更新积分状态
  const updateCredits = useCallback((newCredits: number) => {
    console.log('[CreditsContext] 直接更新积分状态:', { from: credits, to: newCredits })
    setCredits(newCredits)
    
    // 更新调试信息
    if (typeof window !== 'undefined') {
      window.__CREDITS_DEBUG__ = {
        credits: newCredits,
        isLoading: false,
        lastUpdate: new Date().toISOString(),
        updateType: 'context'
      }
    }
  }, [credits])

  // 用户变化时重新获取积分
  useEffect(() => {
    fetchCredits()
  }, [fetchCredits])

  const hasCredits = credits > 0

  const hasEnoughCredits = useCallback((required: number) => {
    return credits >= required
  }, [credits])

  const estimateCredits = useCallback((textLength: number) => {
    const freeLimit = 1000 // 免费字符限制
    const creditRate = 0.1 // 积分费率
    
    if (textLength <= freeLimit) {
      return 0
    }
    return Math.ceil((textLength - freeLimit) * creditRate)
  }, [])

  const value: CreditsContextType = {
    credits,
    isLoading,
    refreshCredits: fetchCredits,
    updateCredits,
    hasCredits,
    hasEnoughCredits,
    estimateCredits
  }

  return (
    <CreditsContext.Provider value={value}>
      {children}
    </CreditsContext.Provider>
  )
}

export function useGlobalCredits() {
  const context = useContext(CreditsContext)
  if (context === undefined) {
    throw new Error('useGlobalCredits must be used within a CreditsProvider')
  }
  return context
}
