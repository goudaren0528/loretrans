'use client'

import React from 'react'
import nextDynamic from 'next/dynamic'

// 动态导入组件，避免SSR问题
const ForgotPasswordForm = nextDynamic(
  () => import('@/components/auth/forgot-password-form'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
)

export const dynamic = 'force-dynamic'

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />
} 