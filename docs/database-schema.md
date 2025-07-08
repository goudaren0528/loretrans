# Loretrans 数据库设计文档

## 概述

Loretrans 采用 Supabase PostgreSQL 数据库，设计了完整的用户系统、积分系统和支付系统。本文档详细描述数据库架构、表结构和安全策略。

## 架构设计原则

- **安全第一**: 使用行级安全策略（RLS）保护用户数据
- **零成本基础设施**: 利用 Supabase 免费额度，支持 50,000 用户
- **实时同步**: 支持实时数据更新和积分余额同步
- **审计完整**: 所有积分变动都有完整的交易记录
- **扩展性**: 设计支持未来功能扩展

## 表结构详解

### 1. users 表
用户基本信息表，扩展 Supabase Auth 用户数据。

```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  credits INTEGER NOT NULL DEFAULT 500,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**字段说明:**
- `id`: 用户唯一标识，关联 Supabase Auth
- `email`: 用户邮箱，唯一索引
- `email_verified`: 邮箱验证状态
- `credits`: 用户积分余额，默认注册奖励 500 积分
- `created_at/updated_at`: 创建和更新时间

**业务规则:**
- 新用户注册自动获得 500 积分奖励
- 积分余额通过触发器与交易记录同步
- 支持邮箱验证流程（可选）

### 2. user_profiles 表
用户扩展资料表，存储用户个性化信息。

```sql
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT,
  avatar_url TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  notification_preferences JSONB DEFAULT '{"email": true, "push": true}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(user_id)
);
```

**字段说明:**
- `user_id`: 关联用户 ID，一对一关系
- `name`: 用户显示名称
- `avatar_url`: 用户头像 URL
- `language`: 界面语言偏好 (en, zh, es 等)
- `timezone`: 用户时区
- `notification_preferences`: 通知偏好设置（JSON 格式）

**业务规则:**
- 每个用户只能有一个资料记录
- 支持多语言界面
- 灵活的通知偏好配置

### 3. credit_transactions 表
积分交易记录表，记录所有积分变动。

```sql
CREATE TYPE transaction_type AS ENUM ('purchase', 'consume', 'reward', 'refund');

CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  amount INTEGER NOT NULL,
  balance INTEGER NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**字段说明:**
- `type`: 交易类型枚举
  - `purchase`: 购买积分
  - `consume`: 消费积分（翻译服务）
  - `reward`: 奖励积分（注册、推荐等）
  - `refund`: 退款积分
- `amount`: 积分变动数量（正数增加，负数减少）
- `balance`: 交易后的积分余额
- `description`: 交易描述
- `metadata`: 交易元数据（JSON 格式）

**业务规则:**
- 所有积分变动必须记录
- 余额必须非负
- 消费记录金额为负数，其他为正数
- 支持元数据存储（如翻译文本长度、支付 ID）

### 4. payments 表
支付记录表，集成 Creem 支付系统。

```sql
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'cancelled', 'refunded');

CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  creem_payment_id TEXT NOT NULL UNIQUE,
  creem_session_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  credits INTEGER NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
```

**字段说明:**
- `creem_payment_id`: Creem 支付唯一标识
- `creem_session_id`: Creem 支付会话 ID
- `amount`: 支付金额（美元）
- `credits`: 购买的积分数量
- `status`: 支付状态枚举
- `payment_method`: 支付方式
- `completed_at`: 支付完成时间

**业务规则:**
- 支持多种支付状态跟踪
- 与 Creem 支付系统集成
- 支付完成后自动添加积分

## 数据关系图

```
auth.users (Supabase Auth)
    ↓ (1:1)
public.users
    ↓ (1:1)
public.user_profiles
    ↓ (1:many)
public.credit_transactions
    ↑
public.payments (1:many)
```

## 安全策略 (RLS)

### 基本原则
- 用户只能访问自己的数据
- 管理员可以查看所有数据
- 系统服务可以执行特权操作
- 禁止用户直接修改敏感数据

### 主要策略

1. **用户数据访问**
   - 用户只能查看和更新自己的记录
   - 积分字段由系统管理，用户不能直接修改

2. **交易记录保护**
   - 用户只能查看自己的交易记录
   - 只有系统可以创建交易记录
   - 禁止修改或删除交易记录

3. **支付记录安全**
   - 用户只能查看自己的支付记录
   - 支付状态只能由系统更新

## 数据库函数

### 1. consume_credits()
安全的积分消费函数，确保原子操作。

```sql
SELECT consume_credits(
  user_id := 'uuid-here',
  amount := 10,
  description := '翻译文档',
  metadata := '{"text_length": 1000, "source_lang": "en", "target_lang": "zh"}'::jsonb
);
```

### 2. purchase_credits()
安全的积分购买函数，关联支付记录。

```sql
SELECT purchase_credits(
  user_id := 'uuid-here',
  amount := 1000,
  payment_id := 'payment-uuid',
  description := '积分购买'
);
```

### 3. get_user_credits()
获取用户积分余额函数。

```sql
SELECT get_user_credits(); -- 获取当前用户积分
SELECT get_user_credits('uuid-here'); -- 管理员查看指定用户积分
```

## 触发器机制

### 1. 用户注册触发器
当用户在 `auth.users` 表注册时，自动：
- 在 `public.users` 表创建记录
- 在 `public.user_profiles` 表创建资料
- 添加 500 积分注册奖励记录

### 2. 积分同步触发器
当在 `credit_transactions` 表插入记录时，自动：
- 更新 `users` 表的积分余额
- 确保数据一致性

### 3. 更新时间触发器
自动更新 `updated_at` 字段。

## 索引优化

### 主要索引
- `users.email` - 邮箱查询
- `credit_transactions(user_id, created_at DESC)` - 用户交易记录查询
- `payments.creem_payment_id` - 支付记录查询

### 查询优化
- 用户数据查询使用主键索引
- 交易记录支持时间范围查询
- 支付记录支持状态筛选

## 实时功能

启用 Supabase Realtime，支持：
- 用户积分余额实时更新
- 支付状态实时通知
- 交易记录实时同步

## 迁移管理

### 迁移文件
1. `001_create_user_tables.sql` - 创建基础表结构
2. `002_setup_rls_policies.sql` - 配置安全策略

### 部署步骤
1. 在 Supabase 控制台执行迁移 SQL
2. 配置环境变量
3. 测试 RLS 策略
4. 验证触发器功能

## 监控和维护

### 性能监控
- 查询执行计划分析
- 索引使用情况监控
- 慢查询日志分析

### 数据备份
- Supabase 自动备份
- 定期数据导出
- 关键数据迁移预案

### 扩展计划
- 支持更多支付方式
- 添加用户行为分析
- 实现推荐系统积分奖励

## 开发注意事项

1. **类型安全**: 使用 TypeScript 类型定义
2. **错误处理**: 完善的错误处理和回滚机制
3. **测试覆盖**: 数据库函数和触发器测试
4. **文档维护**: 数据库变更及时更新文档

## 总结

该数据库设计充分考虑了安全性、性能和扩展性，采用现代 PostgreSQL 特性和 Supabase 平台优势，为 Loretrans 翻译平台提供了稳定可靠的数据存储解决方案。 