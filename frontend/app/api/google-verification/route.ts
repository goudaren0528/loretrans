import { NextResponse } from 'next/server'

export async function GET() {
  // 返回Google Search Console验证内容
  const verificationContent = 'google-site-verification: google9879f9edb25bbe5e.html'
  
  return new NextResponse(verificationContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=3600', // 缓存1小时
    },
  })
}
