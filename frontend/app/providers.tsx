'use client'

import { AuthContext, useAuthState } from '../lib/hooks/useAuth'
import { useState, useEffect } from 'react'

interface ProvidersProps {
  children: React.ReactNode
}

// 身份验证Provider组件
function AuthProvider({ children }: ProvidersProps) {
  const auth = useAuthState()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

// 全局Providers组件
export function Providers({ children }: ProvidersProps) {
  return <AuthProvider>{children}</AuthProvider>
} 