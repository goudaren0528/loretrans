/**
 * 多语言Toast消息Hook
 */

import { usePathname } from 'next/navigation'
import { toast } from './use-toast'
import { 
  getToastMessage, 
  createErrorToastMessage,
  signUpMessages,
  signUpErrorMessages,
  signInMessages,
  signInErrorMessages,
  signOutMessages,
  genericErrorMessages,
  type ToastMessages 
} from '@/lib/utils/toast-messages'

/**
 * 从路径中检测语言
 */
function detectLocaleFromPath(pathname: string): string {
  const segments = pathname.split('/')
  const locale = segments[1]
  
  // 支持的语言列表
  const supportedLocales = ['en', 'zh', 'es', 'fr']
  
  return supportedLocales.includes(locale) ? locale : 'en'
}

/**
 * 多语言Toast Hook
 */
export function useToastMessages() {
  const pathname = usePathname()
  const locale = detectLocaleFromPath(pathname)

  const showToast = (messages: ToastMessages, variant: 'default' | 'destructive' = 'default') => {
    const message = getToastMessage(messages, locale)
    toast({
      title: message.title,
      description: message.description,
      variant,
    })
  }

  const showErrorToast = (error: string) => {
    const message = createErrorToastMessage(error, locale)
    toast({
      title: message.title,
      description: message.description,
      variant: 'destructive',
    })
  }

  return {
    // 成功消息
    showSignUpSuccess: () => showToast(signUpMessages),
    showSignInSuccess: () => showToast(signInMessages),
    showSignOutSuccess: () => showToast(signOutMessages),
    
    // 错误消息
    showSignUpError: (error?: string) => {
      if (error) {
        showErrorToast(error)
      } else {
        showToast(signUpErrorMessages, 'destructive')
      }
    },
    showSignInError: (error?: string) => {
      if (error) {
        showErrorToast(error)
      } else {
        showToast(signInErrorMessages, 'destructive')
      }
    },
    showGenericError: (error?: string) => {
      if (error) {
        showErrorToast(error)
      } else {
        showToast(genericErrorMessages, 'destructive')
      }
    },
    
    // 通用方法
    showCustomToast: showToast,
    showCustomError: showErrorToast,
    
    // 当前语言
    locale,
  }
}
