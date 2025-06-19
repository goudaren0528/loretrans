# 🧩 产品名称：Transly — Translate Low-Resource Languages to English

## 🎯 产品定位
为全球小语种用户提供精准、高可用的"翻译成英文"工具，覆盖 20+ 低竞争语言，基于 Meta NLLB 模型，兼顾 SEO 流量与实用翻译体验。

---

## 🏗️ 产品结构

### 1. 多语种独立 Landing Pages
- `/creole-to-english` - 海地克里奥尔语翻译页面（已完成）
- `/lao-to-english` - 老挝语翻译页面（待开发）
- `/swahili-to-english` - 斯瓦希里语翻译页面（待开发）
- `/burmese-to-english` - 缅甸语翻译页面（待开发）
- `/telugu-to-english` - 泰卢固语翻译页面（待开发）
- …（每个页面独立SEO优化，包含完整的Schema.org结构化数据）
- 暂不支持的语言显示"Coming Soon"页面

### 2. 首页 `/`
- 产品介绍与品牌展示
- 多种翻译形式概览（Text翻译、Document翻译、图片翻译Coming Soon）
- 推荐翻译语言入口
- FAQ
- 站点地图/所有语种链接集合

### 3. 文本翻译页面 `/text-translate`
- 独立的文本翻译功能页面
- 语言选择器与翻译界面
- 翻译历史记录（本地存储）
- 快捷复制与TTS功能

### 4. 关于页面 `/about`
- 产品介绍与优势
- 支持的语言列表
- 使用帮助与FAQ

---

## 🧠 核心功能模块

| 模块         | 描述 |
|--------------|------|
| 文本输入框   | 最大支持1000字符，自动检测语种（或预选） |
| 翻译按钮     | 请求后台NLLB API，返回英文结果 |
| 快捷复制/朗读| 英文朗读+原文朗读（可选） |
| SEO增强模块 | 同义关键词落地内容块、FAQ、评论、视频等 |
| 下载/导出翻译| 导出为TXT/PDF |
| 文件翻译     | 支持PDF/Word/PPT/图片文件上传与翻译，自动提取文本并翻译为英文或目标语种 |
| 反向翻译     | 支持英文到小语种的反向翻译，用户可切换源语言与目标语言 |
| 语音播放     | 翻译结果支持语音播放（TTS），MVP先支持英文，后续支持小语种 |

---

## 🚀 MVP与功能扩展

### MVP首发功能
- 小语种↔英文文本互译（独立页面）
- 英文翻译结果语音播放（TTS，优先支持英文）
- 支持PDF/Word文件上传与翻译（先实现文本型文件，后续支持图片/PPT）
- 用户友好的Web界面与交互体验
- 多语言界面支持（i18n系统）
- 完整的语言落地页系统

### 后续可扩展功能
- 图片OCR翻译、PPT文件翻译
- 小语种TTS语音播放
- 多语种互译、更多文件格式支持
- 用户历史记录、用量统计
- 开发者API服务（API Key授权、限流、计费）

---

## 📝 需求细化与设计补充

### 1. 用户体验与界面细节
- 支持自动检测源语言，用户可通过按钮切换语种，自动检测优先级高于手动选择
- 文件翻译交互：上传后显示文件名、进度条、错误提示和翻译结果提示。翻译结果支持原文-译文对照，内容过长可滚动查看，支持下载新文件。MVP支持最大30~50MB、100页文档，需采用分块/异步处理等技术方案
- 语音播放（TTS）：支持暂停、继续、重播，内嵌播放器，音频格式为mp3或webm

### 2. Web应用用户体验
- 响应式设计：完美适配桌面端、平板、手机等各种设备
- 直观操作：一键翻译、快速复制、语音播放等便捷功能
- 实时反馈：翻译进度、错误提示、成功状态等用户友好提示

### 3. SEO与内容运营
- Schema.org结构化数据：MVP阶段静态生成，后续可动态渲染，保证SEO友好
- FAQ、HowTo、SoftwareApplication等Schema：MVP阶段静态维护，后续可接入CMS
- 多语种SEO策略：明确hreflang标签、canonical策略，提升多语种SEO，站点地图自动生成

### 4. 技术实现细节
- NLLB模型部署：MVP阶段采用Hugging Face云API
- 多语种模型切换、模型版本管理：建议通过配置文件管理支持语种和模型版本，便于后续扩展和升级
- 数据存储与隐私：不存储用户翻译历史。文件类翻译结果通过异步方式发送到用户邮箱，用户需在翻译时提供邮箱，无需页面等待
- 可扩展性：预留接口支持更多文件格式、语种、TTS引擎

### 5. 运营与合规
- 免费额度与付费策略：免费用户仅支持文本翻译且有长度限制，文档翻译仅支持第1页且输出长度有限。付费用户可根据文档长度计价，支持完整文档翻译。付费能力集成Creem
- 用户协议、隐私政策、合规声明：需提供相应页面，确保合规

### 6. 网站架构优化需求

#### 6.1 首页功能重构
- **当前问题**: 首页直接嵌入文本翻译功能，影响产品展示
- **解决方案**: 
  - 将文本翻译功能独立到 `/text-translate` 页面
  - 首页改为展示多种翻译形式：
    - Text翻译（跳转到 `/text-translate`）
    - Document翻译（跳转到 `/document-translate`）
    - 图片翻译（Coming Soon状态）

#### 6.2 语言落地页系统
- **功能需求**: 为Supported Languages模块中的每个语言创建完整落地页
- **页面分类**:
  - **已支持语言**: 完整的翻译功能页面（如 `/creole-to-english`）
  - **暂不支持语言**: Coming Soon提示页面
- **SEO要求**: 所有页面需包含完整的Schema.org结构化数据
- **路径规范**: `/{source-language}-to-english` 格式

#### 6.3 多语言界面支持 (i18n)
- **功能描述**: 整个网站支持界面语言切换
- **支持语言**: 网站可翻译的小语种（海地克里奥尔语、老挝语、斯瓦希里语、缅甸语等）
- **实现范围**: 
  - 导航栏、按钮、表单等所有UI元素
  - 页面标题、描述文案
  - 错误提示、状态信息
- **技术方案**: Next.js国际化(i18n)系统 + react-i18next

#### 6.4 Footer链接完善
- **当前问题**: Contact Support、API Documentation等链接导向404
- **需要完善的页面**:
  - Contact Support: 联系方式页面或Coming Soon
  - API Documentation: API文档页面或Coming Soon  
  - Help & FAQ: 帮助文档页面
  - Blog: 博客页面或Coming Soon

---

## 🎨 UI设计规范与风格指南

### 设计理念
- **专业简洁**：现代化的专业翻译工具体验
- **国际化友好**：适配全球小语种用户的视觉习惯
- **功能导向**：界面服务于翻译功能，避免视觉干扰
- **信任感**：通过专业设计建立用户对翻译准确性的信任

### 推荐设计系统
**主要方案：shadcn/ui + Tailwind CSS**
- 现代化组件库，基于Radix UI无障碍基础
- 完美集成TypeScript和Next.js
- 高度可定制，符合品牌调性
- 组件质量高，维护成本低

### 色彩方案
```css
/* 主色调 - 专业蓝 */
--primary: 220 90% 56%        /* #2563eb - 主要按钮、链接 */
--primary-foreground: 0 0% 100%  /* #ffffff - 主色文字 */

/* 辅助色 - 成功绿 */
--success: 142 76% 36%        /* #16a34a - 翻译成功状态 */
--warning: 38 92% 50%         /* #eab308 - 警告提示 */
--destructive: 0 84% 60%      /* #ef4444 - 错误状态 */

/* 中性色系 */
--background: 0 0% 100%       /* #ffffff - 页面背景 */
--foreground: 222 84% 5%      /* #09090b - 主要文字 */
--muted: 210 40% 98%          /* #f8fafc - 次要区域背景 */
--muted-foreground: 215 16% 47%  /* #64748b - 次要文字 */
--border: 214 32% 91%         /* #e2e8f0 - 边框颜色 */
```

### 字体规范
```css
/* 英文字体 */
font-family: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* 多语种字体栈 */
font-family: 'Inter', 'Noto Sans', 'Microsoft YaHei', '微软雅黑', sans-serif;

/* 字体大小层级 */
--text-xs: 0.75rem     /* 12px - 辅助信息 */
--text-sm: 0.875rem    /* 14px - 次要文字 */
--text-base: 1rem      /* 16px - 正文 */
--text-lg: 1.125rem    /* 18px - 小标题 */
--text-xl: 1.25rem     /* 20px - 页面标题 */
--text-2xl: 1.5rem     /* 24px - 主标题 */
--text-3xl: 1.875rem   /* 30px - 大标题 */
```

### 组件设计原则

#### 翻译输入框
- **设计**: 大尺寸文本域，清晰边框，focus状态突出
- **交互**: 支持拖拽调整大小，字符计数显示
- **无障碍**: 明确的label，键盘导航支持

#### 按钮系统
```tsx
// 主要按钮 - 翻译行动
<Button variant="default" size="lg">翻译</Button>

// 次要按钮 - 辅助功能
<Button variant="outline">复制</Button>

// 图标按钮 - 语音播放
<Button variant="ghost" size="icon">🔊</Button>
```

#### 文件上传区域
- **视觉**: 虚线边框拖拽区域，清晰的上传指引
- **状态**: 上传进度条，成功/错误状态反馈
- **格式**: 支持格式明确标注

#### 语言选择器
- **设计**: 下拉选择器 + 搜索功能
- **显示**: 语言名称（本地语言）+ 英文名称
- **交互**: 快速切换按钮，常用语言置顶

### 布局规范

#### 响应式断点
```css
/* Mobile First */
sm: 640px   /* 手机横屏 */
md: 768px   /* 平板 */
lg: 1024px  /* 小型桌面 */
xl: 1280px  /* 标准桌面 */
2xl: 1536px /* 大屏桌面 */
```

#### 页面布局
- **最大宽度**: 1200px，居中对齐
- **内边距**: 移动端16px，桌面端24px
- **组件间距**: 8px递增规律（8px, 16px, 24px, 32px, 48px）

#### 翻译界面布局
```
┌─────────────────────────────────┐
│ 语言选择器   [切换] 语言选择器      │
├─────────────────────────────────┤
│                                 │
│     源文本输入区域                │
│                                 │
├─────────────────────────────────┤
│     [翻译按钮]                   │
├─────────────────────────────────┤
│                                 │
│     翻译结果区域                 │
│     [复制] [语音播放]             │
│                                 │
└─────────────────────────────────┘
```

### 动效规范
```css
/* 过渡动画 */
--transition-fast: 150ms ease     /* 快速反馈 */
--transition-base: 300ms ease     /* 标准动画 */
--transition-slow: 500ms ease     /* 重要状态变化 */

/* 常用动效 */
.fade-in { animation: fadeIn 300ms ease-in-out; }
.slide-up { animation: slideUp 300ms ease-out; }
.scale-in { animation: scaleIn 200ms ease-out; }
```

### 无障碍设计
- **色彩对比度**: AA级标准（4.5:1）
- **焦点指示**: 明显的焦点环
- **屏幕阅读器**: 语义化HTML，ARIA标签
- **键盘导航**: Tab顺序逻辑，快捷键支持

### 组件库选择对比

| 设计系统 | 优势 | 适合场景 |
|---------|------|----------|
| **shadcn/ui** ✅ | 现代、可定制、TypeScript友好 | **推荐使用** |
| Ant Design | 组件丰富、企业级 | 管理后台 |
| Material UI | Google设计语言、成熟 | 国际化产品 |
| Chakra UI | 简洁、易用 | 快速原型 |

### 品牌视觉元素
- **Logo**: 简洁的字体LOGO + 翻译符号图标
- **插图风格**: 扁平化插图，多语言场景
- **图标**: Lucide React 图标库（统一风格）
- **空状态**: 友好的插图 + 引导文案

---

## 🔍 SEO内容结构模板（以 `/creole-to-english` 为例）

```html
<h1>Creole to English Translator – Free & Accurate Online Tool</h1>
<p>Easily translate Haitian Creole to English using our free online tool powered by advanced AI. No signup, no ads – just simple and fast translation.</p>

<h2>Why Use Our Creole to English Translator?</h2>
<ul>
  <li>✅ Instant translation with high accuracy</li>
  <li>✅ Supports conversational and formal Creole</li>
  <li>✅ 100% free and secure</li>
</ul>

<h2>How to Translate Creole to English</h2>
<ol>
  <li>Enter your Creole text in the box above</li>
  <li>Click "Translate"</li>
  <li>Copy or listen to the English translation</li>
</ol>

<h2>Use Cases</h2>
<p>Perfect for immigration documents, Creole-English chat, school work, or Creole content localization.</p>

<h2>FAQs</h2>
<details><summary>Is this translator accurate?</summary><p>Yes, it uses Meta's NLLB model with support for over 200 languages.</p></details>
<details><summary>Is it free to use?</summary><p>Yes, always free. No ads or limits.</p></details>

<h2>More Translators</h2>
<ul>
  <li><a href="/swahili-to-english">Swahili to English</a></li>
  <li><a href="/lao-to-english">Lao to English</a></li>
  <li><a href="/burmese-to-english">Burmese to English</a></li>
</ul>
```

结构化数据 Schema 集成（SERP 强化）

FAQ Schema
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is this Creole to English translator accurate?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, we use Meta's NLLB AI model to ensure high-quality translations."
      }
    },
    {
      "@type": "Question",
      "name": "Is it free to use?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. It is 100% free with no limits or hidden charges."
      }
    }
  ]
}
```

SoftwareApplication Schema
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Creole to English Translator",
  "applicationCategory": "Translation",
  "operatingSystem": "All",
  "browserRequirements": "Requires JavaScript",
  "url": "https://yourdomain.com/creole-to-english",
  "description": "A free online tool to translate Haitian Creole to English instantly using AI.",
  "offers": {
    "@type": "Offer",
    "price": "0.00",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "137"
  }
}
```

HowTo Schema
```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Translate Creole to English",
  "step": [
    { "@type": "HowToStep", "text": "Enter your Creole text in the input box." },
    { "@type": "HowToStep", "text": "Click the 'Translate' button to process." },
    { "@type": "HowToStep", "text": "Copy or listen to the English output." }
  ],
  "tool": { "@type": "WebApplication", "name": "Creole to English Translator" }
}
```

---

## 🏗️ 技术部署架构

### 轻量化全栈方案（推荐）
- **前端**：Next.js 14+ (App Router)
- **后端**：
  - **方案一**：Next.js API Routes + Node.js 微服务
    - 核心翻译 API：Next.js API Routes
    - 文件处理服务：独立 Node.js + Fastify
  - **方案二**：Node.js + Fastify 全后端（轻量高性能）
  - **方案三**：Bun + Hono（前沿轻量方案）
- **AI 模型调用**：Hugging Face Inference API（NLLB模型）
- **数据层**：
  - Vercel KV / Upstash Redis（缓存 + 限流）
  - MongoDB Atlas 免费层（用户记录，可选）
- **部署**：
  - 前端 + 核心API：Vercel（一体化部署）
  - 文件处理微服务：Railway/Fly.io
- **文件存储**：Vercel Blob / Cloudflare R2（临时文件）

### 架构详细设计
#### 核心翻译服务（Next.js API Routes）
- `/api/translate` - 文本翻译
- `/api/detect` - 语言检测
- `/api/tts` - 语音合成
- `/api/usage` - 用量统计（内部使用）

#### 文件处理微服务（Node.js + Fastify）
- `/file/upload` - 文件上传
- `/file/extract` - 文本提取（PDF/Word/PPT）
- `/file/translate` - 文件翻译
- `/file/download` - 结果下载

### 技术栈优势
- **统一语言栈**：JavaScript/TypeScript 全栈
- **类型安全**：前后端共享类型定义，微服务间类型同步
- **轻量部署**：核心功能零配置，文件服务独立扩展
- **开发体验**：热重载、调试友好，本地开发简单
- **成本优化**：Serverless 按需付费 + 微服务按需扩展
- **高可用性**：核心功能与重计算任务解耦，故障隔离