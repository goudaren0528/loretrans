'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Eye, EyeOff, Mail, User, Lock, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useToastMessages } from '@/lib/hooks/use-toast-messages'
import { 
  checkPasswordStrength, 
  getPasswordRequirements,
  getStrengthColor,
  getStrengthProgressColor,
  getStrengthText,
  type PasswordStrengthResult,
  type PasswordRequirement
} from '@/lib/utils/password-strength'
import { cn } from '@/lib/utils'

interface SignUpFormProps {
  onSuccess?: () => void
  locale?: string
}

// 多语言文本
const translations = {
  en: {
    title: 'Create Account',
    subtitle: 'Enter your information to create your account',
    name: 'Full Name',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    signUp: 'Sign Up',
    signingUp: 'Creating Account...',
    signingUpProgress: 'Please wait, creating your account...',
    signUpSuccess: 'Registration Successful!',
    signUpSuccessMessage: 'Your account has been created successfully. Redirecting...',
    haveAccount: 'Already have an account?',
    signIn: 'Sign in',
    namePlaceholder: 'John Doe',
    emailPlaceholder: 'name@example.com',
    passwordPlaceholder: '••••••••',
    confirmPasswordPlaceholder: '••••••••',
    passwordStrength: 'Password Strength',
    passwordRequirements: 'Password Requirements',
    emailChecking: 'Checking email availability...',
    emailAvailable: 'Email is available',
    emailTaken: 'This email is already registered',
    emailInvalid: 'Please enter a valid email address',
    passwordTips: {
      excellent: 'Excellent! Your password is very strong.',
      good: 'Good password strength.',
      fair: 'Consider making your password stronger.',
      weak: 'Your password could be stronger.',
      veryWeak: 'Please create a stronger password.'
    }
  },
  zh: {
    title: '创建账户',
    subtitle: '输入您的信息来创建账户',
    name: '姓名',
    email: '邮箱',
    password: '密码',
    confirmPassword: '确认密码',
    signUp: '注册',
    signingUp: '正在创建账户...',
    signingUpProgress: '请稍候，正在创建您的账户...',
    signUpSuccess: '注册成功！',
    signUpSuccessMessage: '您的账户已成功创建，正在跳转...',
    haveAccount: '已有账户？',
    signIn: '登录',
    namePlaceholder: '张三',
    emailPlaceholder: 'name@example.com',
    passwordPlaceholder: '••••••••',
    confirmPasswordPlaceholder: '••••••••',
    passwordStrength: '密码强度',
    passwordRequirements: '密码要求',
    emailChecking: '正在检查邮箱可用性...',
    emailAvailable: '邮箱可以使用',
    emailTaken: '该邮箱已被注册',
    emailInvalid: '请输入有效的邮箱地址',
    passwordTips: {
      excellent: '优秀！您的密码非常强。',
      good: '密码强度良好。',
      fair: '考虑让您的密码更强一些。',
      weak: '您的密码可以更强一些。',
      veryWeak: '请创建一个更强的密码。'
    }
  }
}

const signUpSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be less than 50 characters')
      .regex(/^[a-zA-Z\u4e00-\u9fa5\s]+$/, 'Name can only contain letters and spaces'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Invalid email address')
      .max(100, 'Email must be less than 100 characters'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be less than 128 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "t('Auth.SignUpForm.password_mismatch')",
    path: ['confirmPassword'],
  })

// 邮箱验证状态
type EmailValidationState = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'

export function SignUpForm({ onSuccess, locale = 'en' }: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [emailValidation, setEmailValidation] = useState<EmailValidationState>('idle')
  const [emailCheckTimeout, setEmailCheckTimeout] = useState<NodeJS.Timeout | null>(null)
  const { signUp } = useAuth()
  const { showSignUpSuccess, showSignUpError } = useToastMessages()
  const tAuth = useTranslations('Auth.SignUpForm')
  const router = useRouter()

  const t = translations[locale as keyof typeof translations] || translations.en

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    setError,
    clearErrors,
  } = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
  })

  const password = watch('password', '')
  const email = watch('email', '')
  
  // 获取密码强度和要求
  const passwordStrength = useMemo(() => {
    if (!password) return null
    return checkPasswordStrength(password, locale)
  }, [password, locale])

  const requirements = useMemo(() => {
    if (!password) return []
    return getPasswordRequirements(password, locale)
  }, [password, locale])

  // 邮箱唯一性检查
  const checkEmailAvailability = useCallback(async (emailToCheck: string) => {
    console.log('🔍 Checking email:', emailToCheck)
    
    if (!emailToCheck || !emailToCheck.includes('@')) {
      console.log('❌ Email validation: empty or no @ symbol')
      setEmailValidation('idle')
      return
    }

    // 更强大的邮箱格式验证
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    const regexResult = emailRegex.test(emailToCheck)
    console.log('📧 Email regex test result:', regexResult)
    
    if (!regexResult) {
      console.log('❌ Email validation: invalid format')
      setEmailValidation('invalid')
      return
    }

    console.log('⏳ Starting server validation...')
    setEmailValidation('checking')

    try {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailToCheck }),
      })

      const result = await response.json()
      console.log('🌐 Server response:', result)

      if (response.ok) {
        if (result.available) {
          console.log('✅ Email is available')
          setEmailValidation('available')
          clearErrors('email')
        } else {
          console.log('❌ Email is taken')
          setEmailValidation('taken')
          setError('email', {
            type: 'manual',
            message: result.message || t.emailTaken
          })
        }
      } else {
        console.log('❌ Server error:', result)
        setEmailValidation('invalid')
        setError('email', {
          type: 'manual',
          message: result.message || t.emailInvalid
        })
      }
    } catch (error) {
      console.error('💥 Email check error:', error)
      setEmailValidation('idle')
    }
  }, [setError, clearErrors, t])

  // 监听邮箱输入变化，实现防抖检查
  useEffect(() => {
    if (emailCheckTimeout) {
      clearTimeout(emailCheckTimeout)
    }

    if (email && email.length > 0) {
      const timeout = setTimeout(() => {
        checkEmailAvailability(email)
      }, 800) // 800ms 防抖

      setEmailCheckTimeout(timeout)
    } else {
      setEmailValidation('idle')
    }

    return () => {
      if (emailCheckTimeout) {
        clearTimeout(emailCheckTimeout)
      }
    }
  }, [email, checkEmailAvailability])

  // 获取邮箱验证图标和样式
  const getEmailValidationIcon = () => {
    switch (emailValidation) {
      case 'checking':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case 'available':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'taken':
      case 'invalid':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getEmailValidationMessage = () => {
    switch (emailValidation) {
      case 'checking':
        return <span className="text-blue-600 text-xs">{t.emailChecking}</span>
      case 'available':
        return <span className="text-green-600 text-xs">{t.emailAvailable}</span>
      case 'taken':
        return <span className="text-red-600 text-xs">{t.emailTaken}</span>
      case 'invalid':
        return <span className="text-red-600 text-xs">{t.emailInvalid}</span>
      default:
        return null
    }
  }

  // 获取简化的密码提示
  const getPasswordTip = (strength: PasswordStrengthResult | null) => {
    if (!strength) return null
    
    switch (strength.strength) {
      case 'strong':
        return t.passwordTips.excellent
      case 'good':
        return t.passwordTips.good
      case 'fair':
        return t.passwordTips.fair
      case 'weak':
        return t.passwordTips.weak
      case 'very-weak':
        return t.passwordTips.veryWeak
      default:
        return null
    }
  }

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    // 检查邮箱是否可用
    if (emailValidation === 'taken') {
      setAuthError(t.emailTaken)
      return
    }

    if (emailValidation === 'checking') {
      setAuthError('Please wait for email validation to complete')
      return
    }

    setIsLoading(true)
    setAuthError(null)

    try {
      const result = await signUp({
        email: data.email,
        password: data.password,
        name: data.name
      })
      
      if (result.error) {
        setAuthError(result.error)
        showSignUpError(result.error)
      } else if (result.success) {
        setIsSuccess(true)
        showSignUpSuccess()
        setTimeout(() => {
          if (onSuccess) {
            onSuccess()
          } else {
            // 默认跳转到首页
            router.push('/')
          }
        }, 2000) // 2秒后跳转，让用户看到成功消息
      }
    } catch (error) {
      console.error('Signup form error:', error)
      const errorMessage = 'An unexpected error occurred. Please try again.'
      setAuthError(errorMessage)
      showSignUpError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // 检查表单是否可以提交
  const canSubmit = isValid && emailValidation === 'available' && !isLoading

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <p className="text-muted-foreground">
          {t.subtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t.name}</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              placeholder={t.namePlaceholder}
              className="pl-10"
              {...register('name')}
            />
          </div>
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t.email}</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder={t.emailPlaceholder}
              className={cn(
                "pl-10 pr-10",
                emailValidation === 'available' && "border-green-500",
                emailValidation === 'taken' && "border-red-500"
              )}
              {...register('email')}
            />
            <div className="absolute right-3 top-3">
              {getEmailValidationIcon()}
            </div>
          </div>
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
          {getEmailValidationMessage()}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t.password}</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder={t.passwordPlaceholder}
              className="pl-10 pr-10"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}

          {/* 密码强度指示器 */}
          {password && passwordStrength && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{t.passwordStrength}</span>
                <span className={cn("text-xs font-medium", getStrengthColor(passwordStrength.strength))}>
                  {getStrengthText(passwordStrength.strength, locale)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={cn("h-2 rounded-full transition-all duration-300", getStrengthProgressColor(passwordStrength.strength))}
                  style={{ width: `${passwordStrength.score * 20}%` }}
                />
              </div>
              {getPasswordTip(passwordStrength) && (
                <p className={cn("text-xs", getStrengthColor(passwordStrength.strength))}>
                  {getPasswordTip(passwordStrength)}
                </p>
              )}
            </div>
          )}

          {/* 密码要求列表 */}
          {password && requirements.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">{tAuth('password_requirements')}:</p>
              <ul className="space-y-1">
                {requirements.map((req, index) => (
                  <li key={index} className="flex items-center space-x-2 text-xs">
                    {req.met ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-500" />
                    )}
                    <span className={req.met ? 'text-green-600' : 'text-red-600'}>
                      {req.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder={t.confirmPasswordPlaceholder}
              className="pl-10 pr-10"
              {...register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        {authError && (
          <div className="flex items-center space-x-2 rounded-md bg-red-50 p-4">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <p className="text-sm text-red-600">{authError}</p>
          </div>
        )}

        {isSuccess && (
          <div className="flex items-center space-x-2 rounded-md bg-green-50 p-4">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">{t.signUpSuccess}</p>
              <p className="text-xs text-green-600">{t.signUpSuccessMessage}</p>
            </div>
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={!canSubmit || isSuccess}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{t.signingUp}</span>
            </div>
          ) : (
            t.signUp
          )}
        </Button>

        {/* 注册进度提示 */}
        {isLoading && (
          <div className="text-center">
            <p className="text-xs text-muted-foreground animate-pulse">
              {t.signingUpProgress}
            </p>
          </div>
        )}
      </form>

      <div className="text-center text-sm text-muted-foreground">
        {t.haveAccount}{' '}
        <Link
          href="/auth/signin"
          className="font-medium text-primary hover:underline"
        >
          {t.signIn}
        </Link>
      </div>
    </div>
  )
}
