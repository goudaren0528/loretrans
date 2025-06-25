# Transly 安全策略文档

## 概述

本文档详细说明了 Transly 翻译平台的数据库安全策略，包括行级安全（RLS）策略配置、数据访问控制和安全监控机制。

## 行级安全（RLS）策略

### 1. 用户数据安全策略

#### 1.1 users 表策略

**基础访问控制：**
- `Users can view own data`: 用户只能查看自己的记录
- `Users can update own data`: 用户只能更新自己的记录
- `System can insert users`: 系统可以插入用户记录（通过触发器）
- `Admins can view all users`: 管理员可以查看所有用户

**增强安全策略：**
- `Enforce user data integrity`: 确保用户不能修改敏感字段
  - 用户ID不可修改
  - 创建时间不可修改
  - 积分只能减少，不能直接增加

#### 1.2 user_profiles 表策略

**基础访问控制：**
- `Users can view own profile`: 用户只能查看自己的资料
- `Users can update own profile`: 用户只能更新自己的资料
- `System can insert profiles`: 系统可以插入用户资料
- `Admins can view all profiles`: 管理员可以查看所有用户资料

**数据验证策略：**
- `Validate profile updates`: 验证用户资料更新
  - 邮箱格式验证
  - 昵称长度限制（1-50字符）
  - 用户ID和创建时间不可修改

### 2. 积分交易安全策略

#### 2.1 credit_transactions 表策略

**基础访问控制：**
- `Users can view own transactions`: 用户只能查看自己的交易记录
- `System can insert transactions`: 只有系统可以插入交易记录
- `Admins can view all transactions`: 管理员可以查看所有交易记录

**增强安全策略：**
- `Validate credit transactions`: 验证积分交易合法性
  - 交易类型限制：`purchase`, `consume`, `reward`, `refund`
  - 金额限制：> 0 且 ≤ 1,000,000 积分
  - 描述不能为空且长度 ≤ 500 字符
  - 用户ID必须存在

- `Block direct transaction manipulation`: 禁止用户直接操作交易记录
  - 只有系统角色或管理员可以操作
  - 防止用户绕过业务逻辑

### 3. 支付记录安全策略

#### 3.1 payments 表策略

**基础访问控制：**
- `Users can view own payments`: 用户只能查看自己的支付记录
- `System can insert payments`: 只有系统可以插入支付记录
- `System can update payments`: 只有系统可以更新支付状态
- `Admins can view all payments`: 管理员可以查看所有支付记录

**支付验证策略：**
- `Validate payment records`: 验证支付记录
  - 状态限制：`pending`, `completed`, `failed`, `cancelled`, `refunded`
  - 金额限制：> 0 且 ≤ 100,000（$1000）
  - 货币代码限制：`USD`, `EUR`, `GBP`, `JPY`, `CNY`, `AUD`, `CAD`
  - 外部支付ID不能为空

- `Restrict payment updates`: 限制支付记录更新
  - 只能更新状态和元数据
  - 核心字段（金额、货币、用户ID）不可修改
  - 状态转换必须合法

### 4. 审计和监控策略

#### 4.1 audit_logs 表策略

**访问控制：**
- `Only admins can view audit logs`: 只有管理员可以查看审计日志
- `System can insert audit logs`: 系统可以插入审计日志

**审计内容：**
- 用户积分变更记录
- 支付状态变更记录
- 系统关键操作记录

#### 4.2 system_configs 表策略

**访问控制：**
- `Only admins can access system configs`: 只有管理员可以访问系统配置

**配置项：**
- `security.max_daily_transactions`: 用户每日最大交易次数
- `security.max_transaction_amount`: 单次交易最大积分数
- `security.require_email_verification`: 是否要求邮箱验证
- `security.session_timeout_hours`: 会话超时时间
- `security.max_failed_login_attempts`: 最大登录失败次数
- `audit.retention_days`: 审计日志保留天数

## 数据完整性约束

### 1. 数据库级约束

**用户表约束：**
```sql
ALTER TABLE public.users 
ADD CONSTRAINT check_positive_credits 
CHECK (credits >= 0);
```

**积分交易表约束：**
```sql
ALTER TABLE public.credit_transactions 
ADD CONSTRAINT check_positive_amount 
CHECK (amount > 0);
```

**支付表约束：**
```sql
ALTER TABLE public.payments 
ADD CONSTRAINT check_positive_payment_amount 
CHECK (amount > 0);
```

**用户资料表约束：**
```sql
ALTER TABLE public.user_profiles 
ADD CONSTRAINT check_email_format 
CHECK (email IS NULL OR email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE public.user_profiles 
ADD CONSTRAINT check_display_name_length 
CHECK (display_name IS NULL OR LENGTH(display_name) BETWEEN 1 AND 50);
```

## 安全监控功能

### 1. 异常活动检测

**函数：** `detect_suspicious_activity()`

**检测项目：**
- 短时间内大量积分交易
- 频繁的支付尝试
- 大额积分消费

**风险级别：**
- `HIGH`: 需要立即关注
- `MEDIUM`: 需要监控
- `LOW`: 正常范围

### 2. 用户权限检查

**函数：** `check_user_permissions()`

**检查项目：**
- 账户状态验证
- 邮箱验证状态
- 角色权限验证

**权限类型：**
- `translate`: 翻译功能权限
- `purchase_credits`: 购买积分权限
- `admin_access`: 管理员访问权限

## 安全视图

### 1. secure_user_stats 视图

**功能：** 提供安全的用户统计信息
**特点：** 用户只能查看自己的统计数据
**包含信息：**
- 积分余额
- 交易统计
- 支付历史
- 使用量统计

## 数据保留策略

### 1. 审计日志清理

**函数：** `cleanup_old_audit_logs()`
**默认保留期：** 90天
**执行方式：** 定期清理（建议使用外部调度器）

### 2. 数据备份

**策略：** 利用 Supabase 自动备份功能
**频率：** 每日自动备份
**保留期：** 根据订阅计划确定

## 安全最佳实践

### 1. 开发环境

**数据库访问：**
- 使用环境变量管理数据库凭据
- 开发环境使用测试数据
- 定期轮换数据库密钥

**代码安全：**
- 所有数据库操作通过 RLS 策略保护
- 使用参数化查询防止 SQL 注入
- 实施最小权限原则

### 2. 生产环境

**网络安全：**
- 启用 HTTPS 强制加密
- 配置 CORS 策略
- 实施 Rate Limiting

**监控和告警：**
- 配置异常活动告警
- 监控数据库性能
- 定期安全审计

## 安全测试

### 1. RLS 策略测试

**测试工具：** `frontend/lib/security/rls-validator.ts`

**测试内容：**
- 用户数据访问权限测试
- 积分交易权限测试
- 支付记录权限测试
- 数据修改权限测试
- 管理员权限测试

**运行方式：**
```typescript
import { quickSecurityCheck } from '@/lib/security/rls-validator'

const testResults = await quickSecurityCheck()
console.log(testResults)
```

### 2. 安全测试检查清单

- [ ] 用户只能访问自己的数据
- [ ] 用户无法修改其他用户的数据
- [ ] 积分交易记录无法被用户直接操作
- [ ] 支付记录访问权限正确
- [ ] 管理员权限正确配置
- [ ] 数据库函数权限正确
- [ ] 审计日志正常记录
- [ ] 异常活动检测正常工作

## 故障排除

### 1. 常见问题

**问题：** 用户无法访问自己的数据
**解决：** 检查 `auth.uid()` 是否正确返回用户ID

**问题：** RLS 策略过于严格
**解决：** 检查策略条件，确保业务逻辑正确

**问题：** 管理员无法访问数据
**解决：** 检查用户角色配置和管理员策略

### 2. 调试工具

**查看当前用户：**
```sql
SELECT auth.uid(), auth.role();
```

**测试 RLS 策略：**
```sql
SET row_security = on;
SELECT * FROM users; -- 应该只返回当前用户的数据
```

**检查策略：**
```sql
SELECT * FROM pg_policies WHERE tablename = 'users';
```

## 合规性

### 1. GDPR 合规

- 用户数据完全删除功能
- 数据导出功能
- 明确的隐私政策
- 用户同意管理

### 2. 数据安全

- 静态数据加密（Supabase 提供）
- 传输数据加密（TLS/SSL）
- 访问日志记录
- 定期安全审计

## 更新和维护

### 1. 策略更新流程

1. 在开发环境测试新策略
2. 运行安全测试验证
3. 更新文档
4. 部署到生产环境
5. 监控策略效果

### 2. 定期维护

- 每月安全审查
- 季度策略评估
- 年度合规检查
- 持续监控和改进

---

**最后更新：** 2025-01-25
**版本：** 1.0
**负责人：** 开发团队 