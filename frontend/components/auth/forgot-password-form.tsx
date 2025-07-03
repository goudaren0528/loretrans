'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl';
import Link from 'next/link'
import { ArrowLeft, Mail, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ForgotPasswordFormProps {
  locale?: string
}

// 多语言文本
const translations = {
  en: {
    title: 'Forgot Password',
    subtitle: 'Enter your email address and we\'ll send you a link to reset your password.',
    email: 'Email',
    emailPlaceholder: 'name@example.com',
    sendReset: 'Send Reset Link',
    sending: 'Sending...',
    backToSignIn: 'Back to Sign In',
    success: 'Reset link sent! Check your email.',
    error: 'Failed to send reset link. Please try again.'
  },
  es: {
    title: 'Olvidé mi Contraseña',
    subtitle: 'Ingresa tu dirección de correo electrónico y te enviaremos un enlace para restablecer tu contraseña.',
    email: 'Correo Electrónico',
    emailPlaceholder: 'nombre@ejemplo.com',
    sendReset: 'Enviar Enlace de Restablecimiento',
    sending: 'Enviando...',
    backToSignIn: 'Volver a Iniciar Sesión',
    success: '¡Enlace de restablecimiento enviado! Revisa tu correo.',
    error: 'Error al enviar el enlace. Por favor intenta de nuevo.'
  },
  fr: {
    title: 'Mot de Passe Oublié',
    subtitle: 'Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.',
    email: 'Email',
    emailPlaceholder: 'nom@exemple.com',
    sendReset: 'Envoyer le Lien de Réinitialisation',
    sending: 'Envoi...',
    backToSignIn: 'Retour à la Connexion',
    success: 'Lien de réinitialisation envoyé! Vérifiez votre email.',
    error: 'Échec de l\'envoi du lien. Veuillez réessayer.'
  }
}

export default function ForgotPasswordForm({ locale = 'en' }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const t = translations[locale as keyof typeof translations] || translations.en

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      // TODO: 实现密码重置功能
      // 这里应该调用Supabase的密码重置API
      await new Promise(resolve => setTimeout(resolve, 2000)) // 模拟API调用
      
      setMessage({ type: 'success', text: t.success })
    } catch (error) {
      setMessage({ type: 'error', text: t.error })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
            <p className="text-sm text-gray-600">
              {t.subtitle}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">{t.email}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="pl-10"
                required
              />
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-md ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !email}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t.sending}</span>
              </div>
            ) : (
              t.sendReset
            )}
          </Button>
        </form>

        <div className="text-center">
          <Link
            href="/auth/signin"
            className="inline-flex items-center text-sm text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            {t.backToSignIn}
          </Link>
        </div>
      </div>
    </div>
  )
}
