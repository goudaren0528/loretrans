'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Eye, EyeOff, Mail, User, Lock, CheckCircle, XCircle, Loader2 } from 'lucide-react'
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
    haveAccount: 'Already have an account?',
    signIn: 'Sign in',
    namePlaceholder: 'John Doe',
    emailPlaceholder: 'name@example.com',
    passwordPlaceholder: '••••••••',
    confirmPasswordPlaceholder: '••••••••',
    passwordStrength: 'Password Strength',
    passwordRequirements: 'Password Requirements',
    passwordTips: {
      excellent: 'Excellent! Your password is very strong.',
      good: 'Good password strength.',
      fair: 'Consider making your password stronger.',
      weak: 'Your password could be stronger.',
      veryWeak: 'Please create a stronger password.'
    }
  },
  es: {
    title: 'Crear Cuenta',
    subtitle: 'Ingresa tu información para crear tu cuenta',
    name: 'Nombre Completo',
    email: 'Correo Electrónico',
    password: 'Contraseña',
    confirmPassword: 'Confirmar Contraseña',
    signUp: 'Registrarse',
    signingUp: 'Creando Cuenta...',
    signingUpProgress: 'Por favor espera, creando tu cuenta...',
    haveAccount: '¿Ya tienes una cuenta?',
    signIn: 'Iniciar sesión',
    namePlaceholder: 'Juan Pérez',
    emailPlaceholder: 'nombre@ejemplo.com',
    passwordPlaceholder: '••••••••',
    confirmPasswordPlaceholder: '••••••••',
    passwordStrength: 'Fortaleza de la Contraseña',
    passwordRequirements: 'Requisitos de la Contraseña',
    passwordTips: {
      excellent: 'Excelente! Tu contraseña es muy fuerte.',
      good: 'Buena fortaleza de contraseña.',
      fair: 'Considera hacer tu contraseña más fuerte.',
      weak: 'Tu contraseña podría ser más fuerte.',
      veryWeak: 'Por favor crea una contraseña más fuerte.'
    }
  },
  fr: {
    title: 'Créer un Compte',
    subtitle: 'Entrez vos informations pour créer votre compte',
    name: 'Nom Complet',
    email: 'Email',
    password: 'Mot de Passe',
    confirmPassword: 'Confirmer le Mot de Passe',
    signUp: "S'inscrire",
    signingUp: 'Création du Compte...',
    signingUpProgress: 'Veuillez patienter, création de votre compte...',
    haveAccount: 'Vous avez déjà un compte?',
    signIn: 'Se connecter',
    namePlaceholder: 'Jean Dupont',
    emailPlaceholder: 'nom@exemple.com',
    passwordPlaceholder: '••••••••',
    confirmPasswordPlaceholder: '••••••••',
    passwordStrength: 'Force du Mot de Passe',
    passwordRequirements: 'Exigences du Mot de Passe',
    passwordTips: {
      excellent: 'Excellent! Votre mot de passe est très fort.',
      good: 'Bonne force de mot de passe.',
      fair: 'Considérez renforcer votre mot de passe.',
      weak: 'Votre mot de passe pourrait être plus fort.',
      veryWeak: 'Veuillez créer un mot de passe plus fort.'
    }
  },
}

const signUpSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be less than 50 characters')
      .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
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

export function SignUpForm({ onSuccess, locale = 'en' }: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { signUp } = useAuth()

  const t = translations[locale as keyof typeof translations] || translations.en

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
  })

  const password = watch('password', '')
  
  // 获取密码强度和要求
  const passwordStrength = useMemo(() => {
    if (!password) return null
    return checkPasswordStrength(password, locale)
  }, [password, locale])

  const requirements = useMemo(() => {
    if (!password) return []
    return getPasswordRequirements(password, locale)
  }, [password, locale])

  // 获取简化的密码提示（不重复要求列表）
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
    setIsLoading(true)
    setAuthError(null)

    try {
      // 修复：传递正确的对象格式给signUp函数
      const result = await signUp({
        email: data.email,
        password: data.password,
        name: data.name
      })
      
      if (result.error) {
        setAuthError(result.error)
      } else if (result.success) {
        onSuccess?.()
      }
    } catch (error) {
      console.error('Signup form error:', error)
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
              className="pl-10"
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
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

        {/* Password Strength Indicator */}
        {password && passwordStrength && (
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t.passwordStrength}</span>
                <span className={cn("text-xs font-medium", getStrengthColor(passwordStrength.score))}>
                  {getStrengthText(passwordStrength.score, locale)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    getStrengthProgressColor(passwordStrength.score)
                  )}
                  style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                />
              </div>
            </div>

            {requirements.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">{t.passwordRequirements}</p>
                <div className="grid grid-cols-1 gap-1">
                  {requirements.map((requirement, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      {requirement.met ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 text-gray-400" />
                      )}
                      <span className={cn(
                        "text-xs",
                        requirement.met ? "text-green-600" : "text-gray-500"
                      )}>
                        {requirement.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 简化的密码提示，不重复要求 */}
            {passwordStrength.score >= 3 && (
              <div className="p-3 bg-green-50 rounded-md">
                <p className="text-xs text-green-700">{getPasswordTip(passwordStrength)}</p>
              </div>
            )}
          </div>
        )}

        {authError && (
          <div className="flex items-center space-x-2 rounded-md bg-red-50 p-4">
            <XCircle className="h-4 w-4 text-red-600" />
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
