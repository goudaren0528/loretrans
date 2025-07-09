# 文档翻译认证问题修复

## 🐛 问题分析

**错误信息**: `Unauthorized: No token provided`

**根本原因**: 
- 虽然用户已经登录并有有效的Supabase session
- 但前端在调用文档翻译API时**没有传递认证token**
- API端点使用 `withApiAuth` 中间件，要求Authorization头
- 前端fetch请求缺少 `Authorization: Bearer <token>` 头

## 🔧 修复方案

### 问题定位
```typescript
// 修复前 - 缺少认证头
const response = await fetch('/api/document/translate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json', // ❌ 缺少Authorization头
  },
  body: JSON.stringify({...})
})
```

### 修复实现
```typescript
// 修复后 - 添加认证头获取逻辑
// 1. 获取Supabase session
const { createSupabaseBrowserClient } = await import('@/lib/supabase')
const supabase = createSupabaseBrowserClient()
const { data: { session } } = await supabase.auth.getSession()

// 2. 构建包含认证头的headers
let headers: Record<string, string> = {
  'Content-Type': 'application/json',
}

if (session?.access_token) {
  headers['Authorization'] = `Bearer ${session.access_token}` // ✅ 添加认证头
}

// 3. 发送带认证头的请求
const response = await fetch('/api/document/translate', {
  method: 'POST',
  headers, // ✅ 包含认证头
  body: JSON.stringify({...})
})
```

---

## 📋 修复的API端点

### 1. 文档上传 API
**端点**: `/api/document/upload`
**修复**: 添加Authorization头到FormData请求

```typescript
// 修复前
const response = await fetch('/api/document/upload', {
  method: 'POST',
  body: formData, // ❌ 没有认证头
})

// 修复后  
const response = await fetch('/api/document/upload', {
  method: 'POST',
  headers, // ✅ 包含Authorization头
  body: formData,
})
```

### 2. 文档翻译 API
**端点**: `/api/document/translate`
**修复**: 添加Authorization头到JSON请求

```typescript
// 修复前
headers: {
  'Content-Type': 'application/json', // ❌ 只有Content-Type
}

// 修复后
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${session.access_token}` // ✅ 添加认证头
}
```

---

## 🔍 调试功能

### 添加的调试日志
```typescript
console.log('[Document Upload Auth]', {
  hasUser: !!user,
  hasSession: !!session,
  hasAccessToken: !!session?.access_token,
  tokenPreview: session?.access_token?.substring(0, 20) + '...'
})

console.log('[Document Translation Auth]', {
  hasUser: !!user,
  hasSession: !!session,
  hasAccessToken: !!session?.access_token,
  tokenPreview: session?.access_token?.substring(0, 20) + '...'
})
```

### 调试信息说明
- `hasUser`: 确认用户对象存在
- `hasSession`: 确认Supabase session有效
- `hasAccessToken`: 确认access_token存在
- `tokenPreview`: 显示token前20个字符（用于验证）

---

## 🧪 测试验证

### 前端测试步骤
1. **确保登录**: 用户必须已登录
2. **上传文档**: 测试文档上传功能
3. **开始翻译**: 选择语言并开始翻译
4. **检查日志**: 查看浏览器控制台的认证日志

### 预期结果
- ✅ 不再出现 "Unauthorized: No token provided" 错误
- ✅ 文档上传成功
- ✅ 文档翻译正常进行
- ✅ 积分正确扣除

### 调试检查点
```javascript
// 在浏览器控制台查看
[Document Upload Auth] {
  hasUser: true,
  hasSession: true, 
  hasAccessToken: true, // ✅ 应该为true
  tokenPreview: "eyJhbGciOiJIUzI1NiIs..." // ✅ 应该显示token
}
```

---

## ⚠️ 注意事项

### 可能的问题
1. **Session过期**: 如果session过期，需要重新登录
2. **Token刷新**: 长时间使用可能需要刷新token
3. **网络问题**: 确保能正常访问Supabase

### 故障排除
```typescript
// 如果仍然出现认证错误，检查：
1. 用户是否真正登录: console.log(user)
2. Session是否有效: console.log(session)
3. Token是否存在: console.log(session?.access_token)
4. 网络请求头: 在Network面板查看Authorization头
```

---

## 📊 修复状态

- [x] 修复文档上传认证头传递
- [x] 修复文档翻译认证头传递  
- [x] 添加详细的调试日志
- [x] 保持错误处理机制
- [ ] 前端功能测试
- [ ] 用户验收测试

**修复状态**: ✅ 代码修复完成  
**测试状态**: 🟡 待前端验证  
**部署状态**: 🟡 待重启服务

---

## 🎯 预期效果

修复后，文档翻译功能应该：
- 🚀 **正常上传文档**: 不再出现认证错误
- 🎯 **成功开始翻译**: 认证头正确传递
- ⚡ **积分正确扣除**: 完整的付费流程
- 🔧 **详细的调试信息**: 便于问题排查

现在你可以重启服务并测试文档翻译功能了！
