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
        
        <h2 className="text-lg font-semibold">不同变体的按钮</h2>
        <div className="flex gap-2 flex-wrap">
          <Button variant="default">Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="success">Success</Button>
          <Button variant="warning">Warning</Button>
        </div>
        
        <h2 className="text-lg font-semibold">不同尺寸的按钮</h2>
        <div className="flex gap-2 items-center">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="xl">Extra Large</Button>
          <Button size="icon">
            <Home className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
