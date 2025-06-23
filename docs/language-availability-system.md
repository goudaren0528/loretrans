# 语言可用性控制系统

## 概述
本系统通过集中配置管理所有支持的语言，可以灵活控制每个语言的可用状态，并在首页和语言选择器中相应地显示状态。

## 核心功能

### 1. 集中配置管理
在 `config/app.config.ts` 中，每个语言都有以下属性：
- `available`: 是否可用 (true/false)
- `bidirectional`: 是否支持双向翻译 (true/false)

```typescript
{
  code: 'ht',
  name: 'Haitian Creole',
  nativeName: 'Kreyòl Ayisyen',
  slug: 'creole',
  available: true,      // 完全可用
  bidirectional: true,  // 支持双向翻译
}
```

### 2. 首页语言卡片
在首页的语言网格中：
- **可用语言**: 显示绿色状态指示器，可点击跳转
- **即将支持语言**: 
  - 显示 "Coming Soon" 徽章
  - 显示黄色状态指示器
  - 按钮变为禁用状态
  - 卡片不可点击

### 3. 语言选择器过滤
在翻译组件的语言下拉菜单中：
- 只显示 `available: true` 的语言
- 自动过滤掉不可用的语言
- 确保用户只能选择支持的语言

### 4. 工具函数库
创建了 `frontend/lib/language-utils.ts` 提供便捷的语言操作方法：

```typescript
// 获取所有可用语言
getAvailableLanguages()

// 获取支持双向翻译的语言
getBidirectionalLanguages()

// 检查语言是否可用
isLanguageAvailable(languageCode)

// 检查是否支持双向翻译
isBidirectionalSupported(languageCode)

// 获取即将支持的语言
getComingSoonLanguages()
```

## 当前语言状态

### 完全支持 (available: true, bidirectional: true)
- ✅ Haitian Creole (ht)
- ✅ Lao (lo)
- ✅ Swahili (sw)
- ✅ Burmese (my)
- ✅ Telugu (te)

### 即将支持 (available: false)
- 🔄 Sinhala (si)
- 🔄 Amharic (am)
- 🔄 Khmer (km)
- 🔄 Nepali (ne)
- 🔄 Malagasy (mg)

## 如何控制语言可用性

### 启用新语言
1. 在 `config/app.config.ts` 中设置 `available: true`
2. 如果支持双向翻译，设置 `bidirectional: true`
3. 确保相应的翻译页面存在
4. 更新sitemap.ts包含新路由

### 临时禁用语言
1. 在 `config/app.config.ts` 中设置 `available: false`
2. 语言会自动从选择器中移除
3. 首页显示为"Coming Soon"状态

## 影响的组件

### 1. LanguageGrid
- 首页语言卡片显示
- 根据可用性状态显示不同UI

### 2. TranslatorWidget
- 语言选择器过滤
- 只显示可用语言

### 3. BidirectionalTranslator
- 语言选择器过滤
- 目标语言选项控制

### 4. 类型定义
更新了 `shared/types/index.ts` 中的 Language 接口：
```typescript
interface Language {
  code: string;
  name: string;
  nativeName: string;
  slug: string;
  available?: boolean;      // 新增
  bidirectional?: boolean;  // 新增
}
```

## 用户体验

### 可用语言
- 绿色状态指示器
- 可点击跳转到翻译页面
- 在选择器中正常显示

### 即将支持语言
- 黄色状态指示器
- "Coming Soon" 徽章
- 禁用按钮状态
- 不可点击
- 不在选择器中显示

## 开发工作流程

1. **新语言开发完成**: 设置 `available: true`
2. **语言暂时不可用**: 设置 `available: false`
3. **支持双向翻译**: 设置 `bidirectional: true`
4. **只支持单向**: 保持 `bidirectional: false`

这样可以在不修改代码的情况下，通过配置文件灵活控制语言的可用状态。 