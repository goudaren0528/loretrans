'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Home } from 'lucide-react'
import Link from 'next/link'

export default function TestButtonPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Button 组件测试</h1>
      
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">正常 Button</h2>
        <Button>普通按钮</Button>
        
        <h2 className="text-lg font-semibold">Loading Button</h2>
        <Button loading>加载中按钮</Button>
        
        <h2 className="text-lg font-semibold">asChild Button (正确用法)</h2>
        <Button asChild>
          <Link href="/" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            回到首页
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        
        <h2 className="text-lg font-semibold">asChild Button (简单链接)</h2>
        <Button asChild variant="outline">
          <Link href="/pricing">查看定价</Link>
        </Button>
        
        <h2 className="text-lg font-semibold">asChild + Loading (应该正常工作)</h2>
        <Button asChild loading>
          <Link href="/test">测试链接</Link>
        </Button>
      </div>
    </div>
  )
}
