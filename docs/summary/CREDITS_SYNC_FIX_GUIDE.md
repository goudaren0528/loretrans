
# 文档翻译器积分同步问题手动修复指南

## 问题描述
- useAuth.ts 正确查询到用户积分：5500
- document-translator.tsx 在文档上传时却显示0积分

## 修复步骤

### 1. 修改 frontend/lib/hooks/useAuth.ts
在 useCredits 函数的返回值中添加 isLoading：

```typescript
return { 
  credits, 
  isLoading,  // 添加这一行
  hasCredits, 
  hasEnoughCredits, 
  estimateCredits, 
  refreshCredits: fetchCredits 
}
```

### 2. 修改 frontend/components/document-translator.tsx

#### 2.1 更新 useCredits 调用
```typescript
const { credits, refreshCredits, isLoading: creditsLoading } = useCredits()
```

#### 2.2 在 handleTranslate 函数开始处添加积分加载检查
```typescript
const handleTranslate = useCallback(async (sourceLanguage: string, targetLanguage: string) => {
  if (!uploadState.uploadResult || !user) return

  // 等待积分加载完成
  if (creditsLoading) {
    console.log('[Document Translation] Waiting for credits to load...')
    toast({
      title: '正在加载积分信息...',
      description: '请稍候',
      variant: "default",
    })
    return
  }

  // 强制刷新积分以确保最新状态
  await refreshCredits()

  // 原有的积分检查逻辑...
```

#### 2.3 添加组件挂载时的积分刷新
在组件中添加以下 useEffect：

```typescript
// 组件挂载时强制刷新积分
useEffect(() => {
  if (user?.id) {
    console.log('[Document Translator] Component mounted, refreshing credits for user:', user.id)
    refreshCredits()
  }
}, [user?.id, refreshCredits])

// 文件上传成功后刷新积分
useEffect(() => {
  if (uploadState.uploadResult && user?.id) {
    console.log('[Document Translator] File uploaded, refreshing credits')
    refreshCredits()
  }
}, [uploadState.uploadResult, user?.id, refreshCredits])
```

### 3. 重启服务并测试
```bash
cd frontend
npm run dev
```

### 4. 测试步骤
1. 打开浏览器开发者工具
2. 登录用户账户
3. 上传文档进行翻译
4. 观察控制台日志，确认积分正确显示

### 5. 预期结果
- 控制台显示: [useCredits] 查询到用户积分: 5500
- 文档翻译不再显示积分不足错误
- 积分检查在加载完成后进行
