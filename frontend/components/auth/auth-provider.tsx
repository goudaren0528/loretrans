'use client'

import { ReactNode } from 'react'
import { AuthContext, useAuthState } from '@/lib/hooks/useAuth'

interface AuthProviderProps {
  children: ReactNode
}

/**
 * 身份验证提供者组件
 * 为整个应用提供身份验证状态管理
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const authState = useAuthState()

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  )
}
