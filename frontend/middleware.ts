import { type NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware';
import { routing } from './lib/navigation';

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',

    // Set a cookie to remember the previous locale for all requests that have a locale prefix
    '/(en|zh|es|fr|ar|hi|ht|lo|my|pt|sw|te)/:path*',

    // Enable redirects that add missing locales but exclude auth, api, and static files
    '/((?!auth|api|_next|_vercel|.*\\..*).*)'
  ]
};
