'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'

export default function ForgotPasswordPage() {
  const t = useTranslations('Auth.ForgotPassword');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground">
              {t('description')}
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('info')}
            </p>
            
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                asChild
              >
                <Link href="/contact">
                  {t('contact_support')}
                </Link>
              </Button>
              
              <Button
                variant="ghost"
                className="w-full"
                asChild
              >
                <Link href="/auth/signin" className="flex items-center justify-center">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t('return_to_login')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 