'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
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
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const { signIn } = useAuth()
  const { showToast } = useToastMessages()

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
      const result = await signIn(data.email, data.password)
      
      if (result.error) {
        setError(result.error.message)
        showToast({
          title: tCommon('error'),
          description: result.error.message,
          variant: 'destructive',
        })
      } else {
        setSuccess(true)
        showToast({
          title: tCommon('success'),
          description: '登录成功！',
          variant: 'default',
        })
        
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
      showToast({
        title: tCommon('error'),
        description: errorMessage,
        variant: 'destructive',
      })
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
          输入您的凭据以访问您的账户
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
            <Link
              href="/auth/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              {t('forgot_password')}
            </Link>
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
            记住我
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
          注册
        </Link>
      </div>
    </div>
  )
}

const translations = {
  zh: {
    signIn: '登录',
    signingIn: '正在登录...',
    signingInProgress: '请稍候，正在为您登录...',
    noAccount: '没有账户？',
    signUp: '注册',
    emailPlaceholder: 'name@example.com',
    passwordPlaceholder: '••••••••',
    troubleshooting: '登录遇到问题？',
    commonIssues: '常见问题：',
    checkEmail: '检查邮箱拼写',
    checkPassword: '验证密码',
    accountNotFound: '账户不存在 - 请尝试注册',
    serverError: '服务器连接问题 - 请重试',
  }
}

// 错误类型分析
type ErrorType = 'credentials' | 'network' | 'server' | 'validation' | 'unknown'

interface ErrorAnalysis {
  type: ErrorType
  message: string
  suggestions: string[]
  canRetry: boolean
}

export function SignInForm({ onSuccess, redirectTo, locale = 'en' }: SignInFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [errorAnalysis, setErrorAnalysis] = useState<ErrorAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [showTroubleshooting, setShowTroubleshooting] = useState(false)
  const { signIn } = useAuth()
  const { showSignInSuccess, showSignInError } = useToastMessages()

  const t = translations[locale as keyof typeof translations] || translations.en

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    getValues,
  } = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    mode: 'onChange',
  })

  // 分析错误类型和提供建议
  const analyzeError = (error: string): ErrorAnalysis => {
    const errorLower = error.toLowerCase()
    
    if (errorLower.includes('invalid login credentials') || 
        errorLower.includes('invalid credentials') ||
        errorLower.includes('wrong password') ||
        errorLower.includes('user not found')) {
      return {
        type: 'credentials',
        message: '邮箱或密码错误',
        suggestions: [
          '检查邮箱地址是否正确',
          '确认密码大小写',
          '尝试重置密码',
          '确认是否已注册账户'
        ],
        canRetry: true
      }
    }
    
    if (errorLower.includes('network') || 
        errorLower.includes('fetch') ||
        errorLower.includes('connection')) {
      return {
        type: 'network',
        message: '网络连接问题',
        suggestions: [
          '检查网络连接',
          '刷新页面重试',
          '稍后再试'
        ],
        canRetry: true
      }
    }
    
    if (errorLower.includes('400') || 
        errorLower.includes('bad request') ||
        errorLower.includes('server error')) {
      return {
        type: 'server',
        message: '服务器错误',
        suggestions: [
          '服务器暂时不可用',
          '请稍后重试',
          '如果问题持续，请联系支持'
        ],
        canRetry: true
      }
    }
    
    if (errorLower.includes('email') && errorLower.includes('format')) {
      return {
        type: 'validation',
        message: '邮箱格式错误',
        suggestions: [
          '检查邮箱格式',
          '确保包含@符号',
          '检查域名拼写'
        ],
        canRetry: false
      }
    }
    
    return {
      type: 'unknown',
      message: error,
      suggestions: [
        '请重试',
        '检查输入信息',
        '如果问题持续，请联系支持'
      ],
      canRetry: true
    }
  }

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    setIsLoading(true)
    setAuthError(null)
    setErrorAnalysis(null)
    setShowTroubleshooting(false)

    try {
      console.log('🔐 开始登录流程...', { email: data.email })
      
      // 添加详细的请求日志
      const signInData = {
        email: data.email.trim().toLowerCase(),
        password: data.password,
        rememberMe: data.rememberMe || false
      }
      
      console.log('📤 发送登录请求:', { 
        email: signInData.email, 
        rememberMe: signInData.rememberMe,
        passwordLength: signInData.password.length 
      })
      
      const result = await signIn(signInData)
      
      console.log('📥 登录响应:', { 
        success: result.success, 
        hasError: !!result.error 
      })
      
      if (result.error) {
        console.error('❌ 登录错误:', result.error)
        setAuthError(result.error)
        showSignInError(result.error)
        setErrorAnalysis(analyzeError(result.error))
        setRetryCount(prev => prev + 1)
        
        // 如果是凭据错误且重试次数较多，显示故障排除
        if (retryCount >= 2) {
          setShowTroubleshooting(true)
        }
      } else if (result.success) {
        console.log('✅ 登录成功')
        setRetryCount(0)
        showSignInSuccess()
        onSuccess?.()
      }
    } catch (error) {
      console.error('💥 登录异常:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      setAuthError(errorMessage)
      showSignInError(errorMessage)
      setErrorAnalysis(analyzeError(errorMessage))
      setRetryCount(prev => prev + 1)
    } finally {
      setIsLoading(false)
    }
  }

  // 快速重试功能
  const handleQuickRetry = () => {
    const formData = getValues()
    onSubmit(formData)
  }

  // 获取错误图标
  const getErrorIcon = (type: ErrorType) => {
    switch (type) {
      case 'credentials':
        return <Lock className="h-4 w-4 text-red-600" />
      case 'network':
        return <AlertCircle className="h-4 w-4 text-orange-600" />
      case 'server':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-red-600" />
    }
  }

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
          <Label htmlFor="email">{t.email}</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder={t.emailPlaceholder}
              className="pl-10"
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t.password}</Label>
            <Link
              href="/auth/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              {t.forgotPassword}
            </Link>
          </div>
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
        </div>

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
            {t.rememberMe}
          </Label>
        </div>

        {/* 错误显示和分析 */}
        {authError && errorAnalysis && (
          <div className="space-y-3">
            <div className="flex items-start space-x-2 rounded-md bg-red-50 p-4">
              {getErrorIcon(errorAnalysis.type)}
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">{errorAnalysis.message}</p>
                {errorAnalysis.suggestions.length > 0 && (
                  <ul className="mt-2 text-xs text-red-700 space-y-1">
                    {errorAnalysis.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-center space-x-1">
                        <span>•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            
            {/* 快速重试按钮 */}
            {errorAnalysis.canRetry && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleQuickRetry}
                disabled={isLoading}
                className="w-full"
              >
                <Loader2 className={cn("h-4 w-4 mr-2", isLoading ? "animate-spin" : "hidden")} />
                重试登录
              </Button>
            )}
          </div>
        )}

        {/* 故障排除提示 */}
        {showTroubleshooting && (
          <div className="rounded-md bg-blue-50 p-4">
            <div className="flex items-start space-x-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800">{t.troubleshooting}</p>
                <div className="mt-2 text-xs text-blue-700">
                  <p className="font-medium">{t.commonIssues}</p>
                  <ul className="mt-1 space-y-1">
                    <li>• {t.checkEmail}</li>
                    <li>• {t.checkPassword}</li>
                    <li>• {t.accountNotFound}</li>
                  </ul>
                </div>
                <div className="mt-3 flex space-x-2">
                  <Link href="/auth/signup">
                    <Button variant="outline" size="sm" className="text-xs">
                      创建新账户
                    </Button>
                  </Link>
                  <Link href="/auth/forgot-password">
                    <Button variant="outline" size="sm" className="text-xs">
                      重置密码
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !isValid}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{t.signingIn}</span>
            </div>
          ) : (
            t.signIn
          )}
        </Button>

        {/* 登录进度提示 */}
        {isLoading && (
          <div className="text-center">
            <p className="text-xs text-muted-foreground animate-pulse">
              {t.signingInProgress}
            </p>
          </div>
        )}

        {/* 重试计数显示 */}
        {retryCount > 0 && (
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              尝试次数: {retryCount}
            </p>
          </div>
        )}
      </form>

      <div className="text-center text-sm text-muted-foreground">
        {t.noAccount}{' '}
        <Link
          href="/auth/signup"
          className="font-medium text-primary hover:underline"
        >
          {t.signUp}
        </Link>
      </div>
    </div>
  )
}
