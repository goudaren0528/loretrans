import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createSupabaseServerClient(cookieStore)
    
    // Get current user and session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    // Get all cookies for debugging
    const allCookies: Record<string, string> = {}
    cookieStore.getAll().forEach(cookie => {
      allCookies[cookie.name] = cookie.value
    })
    
    // Filter for auth-related cookies
    const authCookies = Object.keys(allCookies).filter(name => 
      name.includes('auth') || name.includes('supabase') || name.includes('sb-')
    ).reduce((obj, key) => {
      obj[key] = allCookies[key]
      return obj
    }, {} as Record<string, string>)
    
    return NextResponse.json({
      success: true,
      user: user ? {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      } : null,
      session: session ? {
        access_token: session.access_token ? 'present' : 'missing',
        refresh_token: session.refresh_token ? 'present' : 'missing',
        expires_at: session.expires_at
      } : null,
      cookies: authCookies,
      allCookieNames: Object.keys(allCookies),
      errors: {
        userError: userError?.message,
        sessionError: sessionError?.message
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('[Debug API] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
