# Next.js Client Component 错误修复

## 问题描述
在Next.js 13+ App Router中遇到以下错误：
```
Event handlers cannot be passed to Client Component props.
<img src=... alt=... className=... onError={function onError}>
                                   ^^^^^^^^^^^^^^^^^^
If you need interactivity, consider converting part of this to a Client Component.
```

## 错误原因
在服务器组件中直接使用了事件处理器（`onError`），这在Next.js App Router中是不允许的。服务器组件在服务器端渲染，无法处理客户端事件。

## 解决方案

### 1. 创建专用的客户端组件
创建了 `frontend/components/hero-image.tsx` 客户端组件：

```tsx
'use client'

import { useState } from 'react'

interface HeroImageProps {
  src: string
  alt: string
  className?: string
}

export function HeroImage({ src, alt, className }: HeroImageProps) {
  const [imageError, setImageError] = useState(false)

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Failed to load hero illustration:', e)
    setImageError(true)
    const target = e.target as HTMLImageElement
    target.style.display = 'none'
  }

  // 错误时显示占位符
  if (imageError) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`}>
        <div className="text-center p-8">
          <div className="text-gray-400 mb-2">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">Image not available</p>
        </div>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={handleImageError}
    />
  )
}
```

### 2. 更新服务器组件
在 `frontend/app/[locale]/page.tsx` 中：

**修改前：**
```tsx
<img
  src="/images/hero-illustration.svg"
  alt="AI Translation Platform Illustration"
  className="w-full max-w-md h-auto"
  onError={(e) => {
    console.error('Failed to load hero illustration:', e);
    (e.target as HTMLImageElement).style.display = 'none';
  }}
/>
```

**修改后：**
```tsx
<HeroImage
  src="/images/hero-illustration.svg"
  alt="AI Translation Platform Illustration"
  className="w-full max-w-md h-auto"
/>
```

## 修复效果

### ✅ 修复前的问题
- 服务器组件包含客户端事件处理器
- Next.js 构建时报错
- 页面无法正常渲染

### ✅ 修复后的改进
- 正确分离服务器组件和客户端组件
- 事件处理器在客户端组件中正常工作
- 增加了更好的错误处理和用户体验
- 图片加载失败时显示友好的占位符

## 最佳实践

### 1. 组件分离原则
- **服务器组件**: 用于数据获取、SEO、静态内容
- **客户端组件**: 用于交互、状态管理、事件处理

### 2. 事件处理器使用
- 所有事件处理器（onClick, onChange, onError等）必须在客户端组件中
- 使用 `'use client'` 指令标记客户端组件

### 3. 错误处理改进
- 提供用户友好的错误状态
- 使用适当的占位符和反馈
- 记录错误信息用于调试

## 验证结果
- ✅ 错误已修复
- ✅ 页面正常渲染
- ✅ 图片错误处理正常工作
- ✅ 服务器重启后无错误日志

这个修复确保了Next.js App Router的最佳实践，同时保持了原有的功能和用户体验。
