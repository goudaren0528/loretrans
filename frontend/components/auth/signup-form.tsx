'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Eye, EyeOff, Mail, User, Lock, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/hooks/useAuth'
import { 
  checkPasswordStrength, 
  getPasswordRequirements,
  getStrengthColor,
  getStrengthProgressColor,
  getStrengthText,
  type PasswordStrengthResult 
} from '@/lib/utils/password-strength'
import { cn } from '@/lib/utils'

// 表单验证Schema
const signUpSchema = z.object({
  name: z.string().min(1, '请输入姓名').max(50, '姓名不能超过50个字符'),
  email: z.string()
    .min(1, '请输入邮箱')
    .email('邮箱格式不正确')
    .max(100, '邮箱不能超过100个字符'),
  password: z.string()
    .min(8, '密码至少需要8个字符')
    .max(128, '密码不能超过128个字符'),
  confirmPassword: z.string()
    .min(1, '请确认密码'),
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
})

type SignUpFormData = z.infer<typeof signUpSchema>

interface SignUpFormProps {
  onSuccess?: () => void
}

export function SignUpForm({ onSuccess }: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrengthResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const { signUp } = useAuth()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
  })

  const watchedPassword = watch('password', '')

  // 监听密码变化，实时检查强度
  useEffect(() => {
    if (watchedPassword) {
      const strength = checkPasswordStrength(watchedPassword)
      setPasswordStrength(strength)
    } else {
      setPasswordStrength(null)
    }
  }, [watchedPassword])

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true)
    setAuthError(null)

    try {
      // 最终密码强度检查
      const finalStrengthCheck = checkPasswordStrength(data.password)
      if (!finalStrengthCheck.isValid) {
        setAuthError('密码强度不符合要求，请改进密码')
        return
      }

      const result = await signUp({
        email: data.email,
        password: data.password,
        name: data.name,
      })

      if (result.success) {
        // 注册成功
        onSuccess?.()
      } else {
        setAuthError(result.error || '注册失败，请重试')
      }
    } catch (error) {
      console.error('Sign up form error:', error)
      setAuthError('注册过程中发生错误，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const requirements = passwordStrength ? getPasswordRequirements(watchedPassword) : []

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">注册 Transly 账户</h1>
        <p className="text-muted-foreground">
          创建账户即可获得 500 积分奖励
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* 姓名字段 */}
        <div className="space-y-2">
          <Label htmlFor="name">姓名</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              placeholder="请输入您的姓名"
              className="pl-10"
              {...register('name')}
            />
          </div>
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

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
          <Label htmlFor="password">密码</Label>
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

          {/* 密码强度指示器 */}
          {passwordStrength && watchedPassword && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">密码强度</span>
                <span className={cn(
                  'text-sm font-medium',
                  getStrengthColor(passwordStrength.strength)
                )}>
                  {getStrengthText(passwordStrength.strength)}
                </span>
              </div>
              
              {/* 强度进度条 */}
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full transition-all duration-300',
                    getStrengthProgressColor(passwordStrength.strength)
                  )}
                  style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                />
              </div>

              {/* 密码要求列表 */}
              <div className="space-y-1">
                {requirements.map((req, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    {req.met ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <XCircle className="h-3 w-3 text-gray-400" />
                    )}
                    <span className={req.met ? 'text-green-600' : 'text-gray-500'}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* 密码反馈 */}
              {passwordStrength.feedback.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  {passwordStrength.feedback.map((feedback, index) => (
                    <div key={index}>{feedback}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 确认密码字段 */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">确认密码</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="请再次输入密码"
              className="pl-10 pr-10"
              {...register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* 错误提示 */}
        {authError && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-600">{authError}</p>
          </div>
        )}

        {/* 提交按钮 */}
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !isValid || (passwordStrength ? !passwordStrength.isValid : false)}
        >
          {isLoading ? '注册中...' : '注册账户'}
        </Button>
      </form>

      {/* 登录链接 */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          已有账户？{' '}
          <Link 
            href="/auth/signin" 
            className="font-medium text-primary hover:underline"
          >
            立即登录
          </Link>
        </p>
      </div>

      {/* 服务条款 */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          注册即表示您同意我们的{' '}
          <Link href="/terms" className="underline hover:text-foreground">
            服务条款
          </Link>
          {' '}和{' '}
          <Link href="/privacy" className="underline hover:text-foreground">
            隐私政策
          </Link>
        </p>
      </div>
    </div>
  )
} 