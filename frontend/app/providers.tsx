'use client'

import { AuthContext, useAuthState } from '../lib/hooks/useAuth'

interface ProvidersProps {
  children: React.ReactNode
}

// 身份验证Provider组件
function AuthProvider({ children }: ProvidersProps) {
  const auth = useAuthState()
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

// 全局Providers组件
export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
} 