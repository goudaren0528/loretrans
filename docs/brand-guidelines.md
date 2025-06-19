# Transly 品牌视觉设计指南

## 🎨 品牌概述

**Transly** 是一个专业的低资源语言翻译平台，致力于消除语言障碍，连接世界各地的文化和社区。

### 品牌核心价值
- **专业性** - 提供准确、可靠的AI翻译服务
- **包容性** - 支持被主流忽视的低资源语言
- **易用性** - 简洁直观的用户体验
- **创新性** - 基于最新AI技术的翻译解决方案

## 🔤 Logo设计

### 主要Logo
- **文件**: `/public/logo-full.svg`
- **用途**: 网站头部、营销材料、官方文档
- **最小尺寸**: 120px宽度
- **背景要求**: 建议使用白色或浅色背景

### 图标Logo
- **文件**: `/public/icon.svg`
- **用途**: Favicon、应用图标、社交媒体头像
- **尺寸**: 32x32px (可缩放)
- **设计元素**: 双向翻译箭头 + 连接点 + 装饰线条

### Logo使用规范
```css
/* 正确的Logo尺寸 */
.logo-large { width: 200px; }    /* 主要展示 */
.logo-medium { width: 150px; }   /* 导航栏 */
.logo-small { width: 100px; }    /* 移动端 */
.logo-icon { width: 32px; }      /* 图标使用 */
```

## 🎨 色彩系统

### 主色调 - 专业蓝
```css
--primary: hsl(220, 90%, 56%)      /* #2563eb */
--primary-foreground: hsl(0, 0%, 100%)  /* #ffffff */
```
- **含义**: 专业、信任、科技
- **用途**: 主要按钮、链接、品牌强调

### 功能色彩
```css
/* 成功绿 */
--success: hsl(142, 76%, 36%)      /* #16a34a */

/* 警告黄 */
--warning: hsl(38, 92%, 50%)       /* #eab308 */

/* 错误红 */
--destructive: hsl(0, 84%, 60%)    /* #ef4444 */
```

### 中性色系
```css
--background: hsl(0, 0%, 100%)     /* #ffffff */
--foreground: hsl(222, 84%, 5%)    /* #09090b */
--muted: hsl(210, 40%, 98%)        /* #f8fafc */
--border: hsl(214, 32%, 91%)       /* #e2e8f0 */
```

### 色彩使用原则
1. **对比度**: 确保文字与背景对比度 ≥ 4.5:1 (AA级)
2. **层级**: 使用色彩深浅表现信息层级
3. **情感**: 功能色彩传达明确的操作反馈

## 📝 字体系统

### 主要字体
```css
font-family: 'Inter', 'SF Pro Display', -apple-system, sans-serif;
```

### 字体层级
```css
/* 标题层级 */
h1 { font-size: 1.875rem; font-weight: 700; }  /* 30px */
h2 { font-size: 1.5rem; font-weight: 600; }    /* 24px */
h3 { font-size: 1.25rem; font-weight: 600; }   /* 20px */

/* 正文层级 */
.text-lg { font-size: 1.125rem; }  /* 18px - 重要正文 */
.text-base { font-size: 1rem; }    /* 16px - 标准正文 */
.text-sm { font-size: 0.875rem; }  /* 14px - 次要信息 */
```

### 多语种支持
```css
/* 中文字体 */
.lang-zh { font-family: 'Inter', 'Noto Sans CJK SC', '微软雅黑', sans-serif; }

/* 阿拉伯语字体 */
.lang-ar { font-family: 'Inter', 'Noto Sans Arabic', sans-serif; }
```

## 🎭 图标系统

### 图标库
- **主要来源**: Lucide React
- **自定义图标**: `/public/icons/`
- **风格**: 线性图标，1.5px描边
- **尺寸**: 16px, 20px, 24px, 32px

### 核心图标
```tsx
// 翻译相关
import { Languages, FileText, Globe } from 'lucide-react'

// 功能操作
import { Copy, Download, Upload, Play } from 'lucide-react'

// 状态反馈
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
```

### 自定义图标
- `translate-icon.svg` - 翻译功能图标
- `language-globe.svg` - 语言选择图标

## 🖼️ 插图风格

### 设计原则
1. **扁平化设计** - 简洁的几何形状
2. **柔和色彩** - 使用品牌色彩系统
3. **功能导向** - 插图服务于用户理解
4. **国际化友好** - 避免文化特定元素

### 插图库
- `hero-illustration.svg` - 首页主插图
- `empty-state-translation.svg` - 翻译空状态
- `empty-state-upload.svg` - 文件上传空状态

### 插图使用场景
- **英雄区域** - 产品概念展示
- **空状态** - 引导用户操作
- **功能说明** - 辅助文字说明
- **错误页面** - 友好的错误提示

## 📱 组件设计规范

### 按钮设计
```tsx
// 主要按钮 - 关键操作
<Button variant="default" size="lg">翻译</Button>

// 次要按钮 - 辅助操作  
<Button variant="outline">复制</Button>

// 图标按钮 - 快捷操作
<Button variant="ghost" size="icon"><Play /></Button>
```

### 卡片设计
```css
.card {
  border-radius: 8px;
  border: 1px solid var(--border);
  background: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
```

### 输入框设计
```css
.input {
  border-radius: 6px;
  border: 1.5px solid var(--border);
  padding: 8px 12px;
  font-size: 16px;
}

.input:focus {
  border-color: var(--primary);
  outline: 2px solid var(--primary);
  outline-offset: 1px;
}
```

## 🌍 多语种适配

### 设计考虑
1. **文字长度** - 预留30%额外空间
2. **阅读方向** - 支持RTL语言
3. **字体支持** - 覆盖目标语言字符集
4. **文化敏感** - 避免特定文化元素

### RTL支持
```css
[dir="rtl"] .layout {
  direction: rtl;
  text-align: right;
}
```

## 📐 布局规范

### 响应式断点
```css
/* Mobile First */
sm: 640px   /* 手机横屏 */
md: 768px   /* 平板 */
lg: 1024px  /* 桌面 */
xl: 1280px  /* 大屏 */
```

### 间距系统
```css
/* 8px基准间距系统 */
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
```

### 最大宽度
```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}
```

## ✅ 品牌应用检查清单

### Logo使用
- [ ] Logo清晰可见，尺寸适当
- [ ] 保持足够的留白空间
- [ ] 背景对比度充足
- [ ] 不同尺寸下可读性良好

### 色彩应用
- [ ] 主色调使用一致
- [ ] 功能色彩语义明确
- [ ] 无障碍色彩对比度达标
- [ ] 色彩层级逻辑清晰

### 字体排版
- [ ] 字体层级结构合理
- [ ] 行间距和字间距适当
- [ ] 多语种字体显示正常
- [ ] 移动端文字可读性良好

### 图标插图
- [ ] 图标风格统一
- [ ] 插图风格与品牌一致
- [ ] 空状态插图友好引导
- [ ] 装饰元素不干扰功能

---

## 📝 更新日志

### 2024-01-XX
- ✅ 创建完整的Logo设计系统
- ✅ 建立色彩和字体规范
- ✅ 设计核心功能插图
- ✅ 制定品牌应用指南

---

> 本指南将随着产品发展持续更新，确保品牌视觉的一致性和专业性。 