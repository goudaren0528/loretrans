'use client'

import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/hooks/useAuth'

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
  locale?: string
}

// 多语言文本
const translations = {
  en: {
    title: 'Sign In',
    subtitle: 'Enter your credentials to access your account',
    email: 'Email',
    password: 'Password',
    forgotPassword: 'Forgot your password?',
    rememberMe: 'Remember me',
    signIn: 'Sign In',
    signingIn: 'Signing In...',
    signingInProgress: 'Please wait, signing you in...',
    noAccount: "Don't have an account?",
    signUp: 'Sign up',
    emailPlaceholder: 'name@example.com',
    passwordPlaceholder: '••••••••',
  },
  es: {
    title: 'Iniciar Sesión',
    subtitle: 'Ingresa tus credenciales para acceder a tu cuenta',
    email: 'Correo Electrónico',
    password: 'Contraseña',
    forgotPassword: '¿Olvidaste tu contraseña?',
    rememberMe: 'Recordarme',
    signIn: 'Iniciar Sesión',
    signingIn: 'Iniciando Sesión...',
    signingInProgress: 'Por favor espera, iniciando sesión...',
    noAccount: '¿No tienes una cuenta?',
    signUp: 'Registrarse',
    emailPlaceholder: 'nombre@ejemplo.com',
    passwordPlaceholder: '••••••••',
  },
  fr: {
    title: 'Se Connecter',
    subtitle: 'Entrez vos identifiants pour accéder à votre compte',
    email: 'Email',
    password: 'Mot de Passe',
    forgotPassword: 'Mot de passe oublié?',
    rememberMe: 'Se souvenir de moi',
    signIn: 'Se Connecter',
    signingIn: 'Connexion...',
    signingInProgress: 'Veuillez patienter, connexion en cours...',
    noAccount: "Vous n'avez pas de compte?",
    signUp: "S'inscrire",
    emailPlaceholder: 'nom@exemple.com',
    passwordPlaceholder: '••••••••',
  },
}

export function SignInForm({ onSuccess, redirectTo, locale = 'en' }: SignInFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()

  const t = translations[locale as keyof typeof translations] || translations.en

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    mode: 'onChange',
  })

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    setIsLoading(true)
    setAuthError(null)

    try {
      // 修复：传递正确的对象格式给signIn函数
      const result = await signIn({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe
      })
      
      if (result.error) {
        setAuthError(result.error)
      } else if (result.success) {
        onSuccess?.()
      }
    } catch (error) {
      console.error('Signin form error:', error)
      setAuthError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
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

        {authError && (
          <div className="flex items-center space-x-2 rounded-md bg-red-50 p-4">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <p className="text-sm text-red-600">{authError}</p>
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
