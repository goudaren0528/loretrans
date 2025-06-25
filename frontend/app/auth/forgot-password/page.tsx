'use client'

import Link from 'next/link'
import { ArrowLeft, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">密码重置</h1>
            <p className="text-muted-foreground">
              密码重置功能正在开发中
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              此功能将在后续版本中推出。如果您忘记了密码，请联系客服获得帮助。
            </p>
            
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                asChild
              >
                <Link href="/contact">
                  联系客服
                </Link>
              </Button>
              
              <Button
                variant="ghost"
                className="w-full"
                asChild
              >
                <Link href="/auth/signin" className="flex items-center justify-center">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回登录
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 