# 智能API端点选择逻辑

## 🎯 设计目标

保持原有的积分检查逻辑不变，同时根据实际情况智能选择合适的API端点，避免不必要的登录重定向。

## 🧠 智能选择逻辑

### 端点选择规则
```typescript
// 默认使用需要认证的端点
let endpoint = '/api/translate'

// 智能选择逻辑
if (!needsCredits || (!user && textLength <= 1000)) {
  endpoint = '/api/translate/public'  // 使用公共端点
} else if (processingMode === 'queue') {
  endpoint = '/api/translate/queue'   // 使用队列端点
}
```

### 认证头处理
```typescript
// 只有使用需要认证的端点时才添加认证头
if (endpoint !== '/api/translate/public' && user) {
  const session = await supabase.auth.getSession()
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }
}
```

## 📊 场景分析

### 场景1: 免费用户，短文本
- **条件**: `!needsCredits` 或 `(!user && textLength <= 1000)`
- **端点**: `/api/translate/public`
- **认证**: 无需认证
- **结果**: ✅ 直接翻译，无需登录

### 场景2: 登录用户，需要积分
- **条件**: `needsCredits && user`
- **端点**: `/api/translate`
- **认证**: Bearer token
- **结果**: ✅ 正常翻译，扣减积分

### 场景3: 未登录用户，需要积分
- **条件**: `needsCredits && !user`
- **端点**: 不会到达API调用
- **结果**: 🔄 重定向到登录页面（保持原逻辑）

### 场景4: 队列模式
- **条件**: `processingMode === 'queue'`
- **端点**: `/api/translate/queue`
- **认证**: Bearer token（如果用户已登录）
- **结果**: ✅ 队列处理

## 🔧 修复的问题

### 原始问题
- 已登录用户点击翻译后被重定向到登录页面
- 原因：强制使用公共端点，但积分逻辑仍然检查登录状态

### 解决方案
- **保持积分逻辑**: `needsCredits = estimatedCredits > 0`
- **智能端点选择**: 根据用户状态和积分需求选择端点
- **动态认证**: 只在需要时添加认证头

## 📁 修改的文件

### `/frontend/components/translation/unified-translator.tsx`
- ✅ 恢复了原始的积分计算逻辑
- ✅ 添加了智能端点选择逻辑
- ✅ 实现了动态认证头添加
- ✅ 保持了所有原有的业务逻辑

## 🎯 预期效果

### 用户体验
- ✅ 免费用户可以直接翻译短文本
- ✅ 登录用户可以正常使用积分翻译
- ✅ 需要积分时仍然会检查登录状态
- ✅ 不会出现不必要的登录重定向

### 系统行为
- ✅ 积分扣减逻辑正常工作
- ✅ 用户认证状态正确检查
- ✅ API端点根据情况智能选择
- ✅ 错误处理保持一致

## 🔍 测试场景

### 必须测试的场景
1. **未登录用户 + 短文本**: 应该直接翻译成功
2. **未登录用户 + 长文本**: 应该提示登录
3. **登录用户 + 任意文本**: 应该正常翻译并扣减积分
4. **登录用户 + 积分不足**: 应该提示充值

### 验证点
- [ ] 不会出现不必要的登录重定向
- [ ] 积分扣减逻辑正常工作
- [ ] 翻译功能在各种场景下都能正常工作
- [ ] 错误提示准确友好

---

**设计原则**: 智能化、用户友好、逻辑一致  
**修复时间**: 2025-07-07  
**状态**: ✅ 完成，待测试
