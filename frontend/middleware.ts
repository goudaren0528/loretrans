import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { getUserRole } from './lib/auth-utils'
import { permissionsConfig, REDIRECT_MAP } from '../config/permissions.config'

export default async function middleware(request: NextRequest) {
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
  
  const { pathname } = request.nextUrl;


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