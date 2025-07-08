import { usePathname } from 'next/navigation'
import { detectLocaleFromPath } from '@/lib/navigation'

export function useAuthRedirect() {
  const pathname = usePathname()
  const { locale } = detectLocaleFromPath(pathname)
  
  const getLocalizedAuthUrl = (authPath: string, redirectTo?: string) => {
    const baseUrl = `/${locale}${authPath}`
    if (redirectTo) {
      const localizedRedirect = redirectTo.startsWith('/') ? `/${locale}${redirectTo}` : redirectTo
      return `${baseUrl}?redirect=${encodeURIComponent(localizedRedirect)}`
    }
    return baseUrl
  }
  
  return {
    getSignInUrl: (redirectTo?: string) => getLocalizedAuthUrl('/auth/signin', redirectTo),
    getSignUpUrl: (redirectTo?: string) => getLocalizedAuthUrl('/auth/signup', redirectTo),
    getForgotPasswordUrl: () => getLocalizedAuthUrl('/auth/forgot-password'),
    locale
  }
}