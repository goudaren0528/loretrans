# Loretrans 密钥管理与安全策略

## 1. 概述

本文档旨在说明 Loretrans 平台如何管理敏感信息，特别是数据库中的加密密钥和用户敏感数据的处理流程。我们的目标是确保所有敏感信息都得到最高级别的保护。

## 2. 密钥管理

### 2.1 加密密钥

**存储位置**: 所有数据库加密密钥都存储在 **Supabase Vault** 中。Supabase Vault 提供了一个安全的环境来存储密钥、认证令牌和其他机密信息。

**密钥类型**:
- **数据库加密主密钥**: 用于加密和解密 `user_profiles` 表中的 `encrypted_metadata` 列。

### 2.2 密钥创建与轮换

**创建流程**:
1.  访问 Supabase Dashboard -> Project Settings -> Vault。
2.  点击 "New Secret" 创建一个新的密钥。
3.  为密钥提供一个描述性的名称，例如 `database-encryption-key`。
4.  将生成的密钥ID (UUID) 复制下来。

**配置**:
- 将复制的密钥ID添加到项目的环境变量中，变量名为 `NEXT_PUBLIC_SUPABASE_ENCRYPTION_KEY_ID`。
- 在本地开发中，请将其添加到 `.env.local` 文件中。
- 在生产环境中 (Vercel)，请在项目设置的 "Environment Variables" 中配置。

**密钥轮换**:
- **策略**: 建议每 6-12 个月轮换一次加密密钥。
- **流程**:
    1. 在 Supabase Vault 中创建一个新的密钥。
    2. 部署一个临时的数据库函数，用于使用旧密钥解密所有数据，然后使用新密钥重新加密。
    3. 更新应用中的 `NEXT_PUBLIC_SUPABASE_ENCRYPTION_KEY_ID` 环境变量为新的密钥ID。
    4. 验证数据访问正常后，可以安全地停用旧密钥。

## 3. 数据库加密

### 3.1 加密实现

- **扩展**: 使用 `pgsodium` 扩展进行加密操作，该扩展在所有 Supabase 项目中默认启用。
- **算法**: `crypto_aead_encrypt` 和 `crypto_aead_decrypt`，提供带有关联数据的认证加密 (AEAD)，可防止篡改。

### 3.2 加密函数

- **`encrypt_secret(p_secret TEXT, p_key_id UUID)`**:
    - **功能**: 接收明文和密钥ID，返回加密后的 `bytea` 数据。
    - **安全**: 定义为 `SECURITY DEFINER`，确保函数在定义者的权限下运行，防止普通用户直接访问密钥。

- **`decrypt_secret(p_encrypted_secret bytea, p_key_id UUID)`**:
    - **功能**: 接收加密的 `bytea` 数据和密钥ID，返回解密后的明文。
    - **安全**: 同样定义为 `SECURITY DEFINER`。

### 3.3 应用层集成

- **数据服务**: `frontend/lib/services/user.ts` 服务层封装了加解密逻辑。
- **更新操作**:
    1. `updateUserProfile` 函数接收 `sensitive_metadata` 对象。
    2. 在函数内部，该对象被序列化为 JSON 字符串。
    3. 调用 `encrypt_secret` RPC 将其加密。
    4. 加密后的数据存储在 `user_profiles.encrypted_metadata` 列中。
- **读取操作**:
    1. `getUserProfile` 函数获取用户资料。
    2. 如果 `encrypted_metadata` 列存在数据，则调用 `decrypt_secret` RPC 解密。
    3. 解密后的 JSON 字符串被解析并附加到返回的 `userProfile` 对象的 `sensitive_metadata` 字段上。

## 4. 行级安全 (RLS)

- **直接访问控制**: `user_profiles` 表的 `encrypted_metadata` 列被 RLS 策略保护，禁止任何用户直接读取 (`SELECT`)。
- **解密权限**: 只有通过调用 `decrypt_secret` 函数才能访问解密后的数据，而该函数的调用受到应用逻辑和用户身份验证的控制。
- **更新权限**: 用户只能更新自己的 `encrypted_metadata` 列，防止越权操作。

## 5. 安全最佳实践

- **最小权限**: 始终遵循最小权限原则。不要在客户端暴露不必要的敏感数据或密钥。
- **环境变量**: 严格区分客户端安全 (`NEXT_PUBLIC_`) 和服务器端私有的环境变量。加密密钥ID虽然是UUID，但仍应视为敏感信息，根据实际情况决定是否可以暴露在客户端。在当前设计中，由于加解密操作是通过数据库RPC完成的，因此客户端需要知道密钥ID来调用函数。
- **审计与监控**: 定期审计 `audit_logs` 表，监控对敏感数据的访问和修改尝试。
- **代码审查**: 对所有涉及安全和加密的代码进行严格审查。

---
**最后更新:** 2025-01-25
**版本:** 1.0
**负责人:** 开发团队 