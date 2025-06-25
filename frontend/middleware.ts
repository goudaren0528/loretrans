import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { getUserRole } from './lib/auth-utils'
import { permissionsConfig, REDIRECT_MAP } from '../config/permissions.config'
import createMiddleware from 'next-intl/middleware';

// 国际化中间件配置
const intlMiddleware = createMiddleware({
  locales: ['en', 'es', 'fr'],
  defaultLocale: 'en',
  localeDetection: true,
  localePrefix: 'as-needed'
});

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 跳过API路由、静态文件等的国际化处理
  const isApiRoute = pathname.startsWith('/api');
  const isStaticFile = pathname.includes('.');
  const isNextInternal = pathname.startsWith('/_next');
  
  // 对于非国际化路径直接处理
  if (isApiRoute || isStaticFile || isNextInternal) {
    const response = NextResponse.next({
      request: {
        headers: new Headers(request.headers),
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({ name, value, ...options })
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({ name, value: '', ...options })
            response.cookies.set({ name, value: '', ...options })
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    const userRole = user ? (await getUserRole(user.id)) || 'free_user' : 'guest';

    if (user && (pathname.startsWith('/auth/signin') || pathname.startsWith('/auth/signup'))) {
      return NextResponse.redirect(new URL(REDIRECT_MAP.auth, request.url));
    }

    const requiredRoles =
      permissionsConfig.find((config) => {
        if (typeof config.path === 'string') {
          return pathname === config.path;
        }
        return config.path.test(pathname);
      })?.roles || [];

    if (requiredRoles.length > 0 && !requiredRoles.includes(userRole as any)) {
      const redirectUrl = user ? REDIRECT_MAP.unauthorized : REDIRECT_MAP.default;
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    return response;
  }

  // 对于特定语言页面，跳过国际化处理（但不包括根路径）
  if (pathname.match(/^\/(creole|lao|swahili|burmese|telugu|english)-to-(english|creole|lao|swahili|burmese|telugu)$/)) {
    const response = NextResponse.next({
      request: {
        headers: new Headers(request.headers),
      },
    });
    return response;
  }

  // 对所有其他路径（包括根路径）应用国际化中间件
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (image files)
     * - icon.svg (icon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|icon.svg).*)',
  ],
} 