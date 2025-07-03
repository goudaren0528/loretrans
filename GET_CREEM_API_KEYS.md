# 🔑 获取Creem API密钥指南

## 📋 当前问题
您的 `.env.local` 中两个密钥使用了相同的值：
```
NEXT_PUBLIC_CREEM_PUBLISHABLE_KEY=creem_test_1DJqKl2eRnF3FTlYNW09u8
CREEM_SECRET_KEY=creem_test_1DJqKl2eRnF3FTlYNW09u8  # ❌ 错误：应该是不同的密钥
```

## 🎯 需要获取的密钥类型

### 1. Publishable Key (已有)
- **格式**: `creem_test_xxxxx` (测试模式) 或 `creem_pk_xxxxx` (生产模式)
- **用途**: 前端使用，可以公开
- **当前值**: `creem_test_1DJqKl2eRnF3FTlYNW09u8` ✅

### 2. Secret Key (需要获取)
- **格式**: `creem_sk_test_xxxxx` (测试模式) 或 `creem_sk_live_xxxxx` (生产模式)
- **用途**: 后端API调用，必须保密
- **当前值**: ❌ 使用了错误的密钥

## 📝 获取步骤

### 方法1: 从Creem控制台获取

1. **登录Creem控制台**
   - 访问: https://creem.io/dashboard
   - 使用您的账户登录

2. **进入API密钥页面**
   - 点击左侧菜单的 "API Keys" 或 "Settings"
   - 或直接访问: https://creem.io/dashboard/api-keys

3. **查找Secret Key**
   - 寻找格式为 `creem_sk_test_xxxxx` 的密钥
   - 如果没有，点击 "Create New Key" 或 "Generate Secret Key"

4. **复制Secret Key**
   - 复制完整的密钥（包括 `creem_sk_test_` 前缀）

### 方法2: 生成新的API密钥对

如果找不到现有的Secret Key：

1. **生成新密钥对**
   - 在Creem控制台中点击 "Generate New API Key Pair"
   - 或 "Create New Key"

2. **保存两个密钥**
   - Publishable Key: `creem_test_xxxxx`
   - Secret Key: `creem_sk_test_xxxxx`

## 🔧 更新配置

获取到正确的Secret Key后，更新 `.env.local`：

```bash
# 前端公开密钥 (保持不变)
NEXT_PUBLIC_CREEM_PUBLISHABLE_KEY=creem_test_1DJqKl2eRnF3FTlYNW09u8

# 后端私密密钥 (需要更新为正确的值)
CREEM_SECRET_KEY=creem_sk_test_YOUR_ACTUAL_SECRET_KEY_HERE

# Webhook密钥 (保持不变)
CREEM_WEBHOOK_SECRET=whsec_65jSbiU6yfhC9NDVdbAIpf
```

## 🧪 验证配置

更新后运行测试：
```bash
cd /home/hwt/translation-low-source
node test-new-checkout.js
```

## 📞 如果仍有问题

### 检查事项
1. **测试模式**: 确认您在测试模式下操作
2. **权限**: 确认API密钥有创建checkout session的权限
3. **账户状态**: 确认Creem账户状态正常

### 联系支持
如果问题持续存在：
- 邮箱: support@creem.io
- Discord: https://discord.gg/q3GKZs92Av

---

**下一步**: 获取正确的Secret Key并更新 `.env.local` 文件
