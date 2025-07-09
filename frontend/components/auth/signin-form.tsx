'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader2, CheckCircle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/hooks/useAuth'
import { useToastMessages } from '@/lib/hooks/use-toast-messages'
import { cn } from '@/lib/utils'

const signInSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .max(100, 'Email must be less than 100 characters'),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(128, 'Password must be less than 128 characters'),
  rememberMe: z.boolean().optional(),
})

interface SignInFormProps {
  onSuccess?: () => void
  redirectTo?: string
}

export function SignInForm({ onSuccess, redirectTo }: SignInFormProps) {
  const t = useTranslations('AuthPage.signin')
  const tCommon = useTranslations('Common')
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const { signIn } = useAuth()
  const { showSignInSuccess, showSignInError } = useToastMessages()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await signIn(data)
      
      if (result.error) {
        setError(result.error)
        showSignInError(result.error)
      } else {
        setSuccess(true)
        showSignInSuccess()
        
        // 重置表单
        reset()
        
        // 调用成功回调
        if (onSuccess) {
          onSuccess()
        }
        
        // 重定向
        if (redirectTo) {
          window.location.href = redirectTo
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '登录失败，请重试'
      setError(errorMessage)
      showSignInError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t('title')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('credentials_prompt')}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* 邮箱字段 */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            {t('email')}
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              className={cn(
                "pl-10",
                errors.email && "border-red-500 focus-visible:ring-red-500"
              )}
              {...register('email')}
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.email.message}</span>
            </div>
          )}
        </div>

        {/* 密码字段 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium">
              {t('password')}
            </Label>
            {/* Forgot password link hidden for now */}
            {/* <Link
              href="/auth/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              {t('forgot_password')}
            </Link> */}
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={cn(
                "pl-10 pr-10",
                errors.password && "border-red-500 focus-visible:ring-red-500"
              )}
              {...register('password')}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.password.message}</span>
            </div>
          )}
        </div>

        {/* 记住我 */}
        <div className="flex items-center space-x-2">
          <input
            id="rememberMe"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            {...register('rememberMe')}
            disabled={isLoading}
          />
          <Label htmlFor="rememberMe" className="text-sm">
            {t('remember_me')}
          </Label>
        </div>

        {/* 错误信息 */}
        {error && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 成功信息 */}
        {success && (
          <div className="flex items-center gap-2 p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            <span>登录成功！正在跳转...</span>
          </div>
        )}

        {/* 提交按钮 */}
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || isSubmitting}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('signin_button')}中...
            </>
          ) : (
            t('signin_button')
          )}
        </Button>
      </form>

      {/* 注册链接 */}
      <div className="text-center text-sm">
        <span className="text-muted-foreground">
          {t('signup_link').split('?')[0]}?{' '}
        </span>
        <Link
          href="/auth/signup"
          className="text-primary hover:underline font-medium"
        >
          {t('signup_text')}
        </Link>
      </div>
    </div>
  )
}

