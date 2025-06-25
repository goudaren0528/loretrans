'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/hooks/useAuth'
import { cn } from '@/lib/utils'

// 表单验证Schema
const signInSchema = z.object({
  email: z.string()
    .min(1, '请输入邮箱')
    .email('邮箱格式不正确')
    .max(100, '邮箱不能超过100个字符'),
  password: z.string()
    .min(1, '请输入密码')
    .max(128, '密码不能超过128个字符'),
  rememberMe: z.boolean().optional(),
})

type SignInFormData = z.infer<typeof signInSchema>

interface SignInFormProps {
  onSuccess?: () => void
  redirectTo?: string
}

export function SignInForm({ onSuccess, redirectTo }: SignInFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const { signIn } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    mode: 'onChange',
    defaultValues: {
      rememberMe: false,
    },
  })

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true)
    setAuthError(null)

    try {
      const result = await signIn({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      })

      if (result.success) {
        // 登录成功
        onSuccess?.()
      } else {
        setAuthError(result.error || '登录失败，请重试')
      }
    } catch (error) {
      console.error('Sign in form error:', error)
      setAuthError('登录过程中发生错误，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">登录 Transly</h1>
        <p className="text-muted-foreground">
          欢迎回来！请登录您的账户
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* 邮箱字段 */}
        <div className="space-y-2">
          <Label htmlFor="email">邮箱</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="请输入您的邮箱"
              className="pl-10"
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* 密码字段 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">密码</Label>
            <Link
              href="/auth/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              忘记密码？
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="请输入密码"
              className="pl-10 pr-10"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        {/* 记住我选项 */}
        <div className="flex items-center space-x-2">
          <input
            id="rememberMe"
            type="checkbox"
            className="h-4 w-4 rounded border border-input bg-background text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
            {...register('rememberMe')}
          />
          <Label
            htmlFor="rememberMe"
            className="text-sm font-normal cursor-pointer"
          >
            记住我30天
          </Label>
        </div>

        {/* 错误提示 */}
        {authError && (
          <div className="flex items-center space-x-2 rounded-md bg-red-50 p-4">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <p className="text-sm text-red-600">{authError}</p>
          </div>
        )}

        {/* 提交按钮 */}
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !isValid}
        >
          {isLoading ? '登录中...' : '登录'}
        </Button>
      </form>

      {/* 注册链接 */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          还没有账户？{' '}
          <Link 
            href="/auth/signup" 
            className="font-medium text-primary hover:underline"
          >
            立即注册
          </Link>
        </p>
      </div>

      {/* 社交登录分隔线 */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            或者
          </span>
        </div>
      </div>

      {/* 社交登录按钮（预留，暂时禁用） */}
      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          使用 Google 登录（即将推出）
        </Button>
      </div>

      {/* 注册提示 */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          注册新账户即可获得{' '}
          <span className="font-medium text-primary">500 积分</span>
          {' '}奖励
        </p>
      </div>
    </div>
  )
} 