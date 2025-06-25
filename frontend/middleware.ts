import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getUserRole } from './lib/auth-utils'
import { permissionsConfig, REDIRECT_MAP } from '../config/permissions.config'

const locales = ['en', 'es', 'fr']; // Add supported locales here
const defaultLocale = 'en';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
});

export default async function middleware(request: NextRequest) {
  // Apply i18n handling
  const i18nResponse = intlMiddleware(request);
  if (i18nResponse.status !== 200) {
    return i18nResponse;
  }
  
  const { pathname } = request.nextUrl
  const response = NextResponse.next()
  
  // 创建一个能在中间件中工作的Supabase客户端
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options) {
          request.cookies.set({ name, value, ...options })
        },
        remove(name: string, options) {
          request.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const user = session?.user
  const userRole = user ? (await getUserRole(user.id)) || 'free_user' : 'guest'

  // 如果用户已登录并访问登录/注册页面，则重定向
  if (user && (pathname.startsWith('/auth/signin') || pathname.startsWith('/auth/signup'))) {
    return NextResponse.redirect(new URL(REDIRECT_MAP.auth, request.url))
  }

  // 检查路径权限
  const requiredRoles =
    permissionsConfig.find((config) => {
      if (typeof config.path === 'string') {
        return pathname === config.path
      }
      return config.path.test(pathname)
    })?.roles || []

  if (requiredRoles.length > 0 && !requiredRoles.includes(userRole as any)) {
    // 根据用户登录状态决定重定向地址
    const redirectUrl = user ? REDIRECT_MAP.unauthorized : REDIRECT_MAP.default
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  return i18nResponse
}

export const config = {
  matcher: [
    /*
     * 匹配除了以下路径之外的所有请求路径:
     * - api (API 路由)
     * - _next/static (静态文件)
     * - _next/image (图片优化文件)
     * - favicon.ico (网站图标)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/',
    '/(en|es|fr)/:path*'
  ],
} 