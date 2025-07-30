import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    console.log('[DEBUG] Auth check started')
    
    // 获取所有cookies
    const allCookies = cookieStore.getAll()
    console.log('[DEBUG] All cookies:', allCookies.map(c => ({ name: c.name, value: c.value?.substring(0, 20) + '...' })))
    
    // 检查用户认证
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('[DEBUG] Auth result:', {
      user: user ? { id: user.id, email: user.email, aud: user.aud } : null,
      authError: authError ? { message: authError.message, status: authError.status } : null
    })
    
    // 检查会话
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    console.log('[DEBUG] Session result:', {
      session: session ? { 
        access_token: session.access_token?.substring(0, 20) + '...',
        refresh_token: session.refresh_token?.substring(0, 20) + '...',
        expires_at: session.expires_at,
        user: session.user ? { id: session.user.id, email: session.user.email } : null
      } : null,
      sessionError: sessionError ? { message: sessionError.message } : null
    })
    
    // 尝试查询数据库
    let dbTestResult = null
    let dbTestError = null
    
    if (user) {
      try {
        const { data, error } = await supabase
          .from('translation_jobs')
          .select('id, created_at, status')
          .eq('user_id', user.id)
          .limit(5)
        
        dbTestResult = {
          count: data?.length || 0,
          data: data?.map(item => ({ id: item.id, created_at: item.created_at, status: item.status }))
        }
        dbTestError = error
        
        console.log('[DEBUG] DB test result:', { dbTestResult, dbTestError })
      } catch (err) {
        dbTestError = err
        console.log('[DEBUG] DB test error:', err)
      }
    }
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      cookies: {
        count: allCookies.length,
        names: allCookies.map(c => c.name),
        hasAuthCookies: allCookies.some(c => c.name.includes('supabase') || c.name.includes('auth'))
      },
      auth: {
        user: user ? {
          id: user.id,
          email: user.email,
          aud: user.aud,
          role: user.role,
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at
        } : null,
        authError: authError ? {
          message: authError.message,
          status: authError.status
        } : null
      },
      session: {
        exists: !!session,
        expires_at: session?.expires_at,
        sessionError: sessionError ? {
          message: sessionError.message
        } : null
      },
      database: {
        testResult: dbTestResult,
        testError: dbTestError ? {
          message: dbTestError.message,
          code: dbTestError.code,
          details: dbTestError.details
        } : null
      },
      environment: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        nodeEnv: process.env.NODE_ENV
      }
    }
    
    return NextResponse.json({
      success: true,
      authenticated: !!user,
      debugInfo
    })
    
  } catch (error) {
    console.error('[DEBUG] Auth check error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      debugInfo: {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack
        } : error
      }
    }, { status: 500 })
  }
}
