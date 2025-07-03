# 🔧 CREEM控制台自助修复指南

## 🎯 目标
在等待技术支持回复的同时，尝试通过CREEM控制台自助解决权限问题。

## 📋 立即执行步骤

### 1. 登录CREEM控制台
```
URL: https://creem.io/dashboard
或: https://dashboard.creem.io
或: https://app.creem.io
```

### 2. 查找API密钥管理页面
寻找以下菜单项：
- "API Keys"
- "Developer"
- "Integration"
- "Settings" → "API"
- "Account" → "API Keys"

### 3. 检查当前API密钥
找到密钥: `creem_test_1DJqKl2eRnF3FTlYNW09u8`

检查项目：
- [ ] 密钥状态是否为"Active"
- [ ] 密钥是否有过期时间
- [ ] 密钥权限列表

### 4. 权限设置检查
确保API密钥有以下权限：
- [ ] **Products: Read** (读取产品)
- [ ] **Checkouts: Create** (创建支付会话)
- [ ] **Orders: Read** (读取订单)
- [ ] **Webhooks: Access** (Webhook访问)

### 5. 如果找到权限设置
1. 点击"编辑"或"权限"按钮
2. 启用所有必要权限
3. 保存更改
4. 等待2-5分钟让权限生效

### 6. 如果无法找到权限设置
尝试以下操作：
1. **重新生成API密钥**
   - 点击"生成新密钥"
   - 选择所有权限
   - 复制新密钥
   - 更新 `.env.local` 文件

2. **检查账户类型**
   - 确认账户不是"只读"类型
   - 检查是否需要升级账户

## 🧪 测试修复结果

每次修改后，运行测试：
```bash
cd /home/hwt/translation-low-source
node test-creem-permissions.js
```

期望看到：
```
✅ 产品列表访问成功
✅ 支付会话创建成功!
```

## 📸 如果需要帮助

如果在控制台中找不到相关选项，请截图：

### 需要的截图
1. **主控制台页面** - 显示所有菜单选项
2. **API密钥页面** - 显示当前密钥列表
3. **密钥详情页面** - 显示权限设置（如果有）
4. **账户设置页面** - 显示账户类型和限制

### 截图要求
- 完整页面截图
- 包含左侧导航菜单
- 隐藏敏感信息（完整API密钥等）

## 🔄 如果自助修复成功

1. **更新API密钥**（如果生成了新密钥）
```bash
# 编辑 .env.local
CREEM_API_KEY=your_new_api_key_here
```

2. **运行完整测试**
```bash
node debug-creem-api.js
```

3. **测试实际支付流程**
```bash
node test-new-checkout.js
```

## 🆘 如果自助修复失败

继续等待技术支持回复，同时：

1. **记录尝试过的步骤**
2. **收集控制台截图**
3. **准备详细的问题描述**

## ⏰ 时间安排

- **立即**: 尝试控制台自助修复
- **同时**: 发送技术支持请求
- **1-2小时**: 如果自助失败，整理详细信息给技术支持
- **24小时内**: 应该收到技术支持回复

## 🎯 成功标准

修复成功的标志：
```bash
$ node test-creem-permissions.js

✅ 产品列表访问成功
📊 找到 X 个产品
✅ 支付会话创建成功!
会话ID: cs_xxxxx
支付URL: https://checkout.creem.io/xxxxx
```

---

**现在就开始**: 立即登录CREEM控制台尝试自助修复！
