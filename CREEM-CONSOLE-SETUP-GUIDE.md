# 🎯 CREEM控制台设置指南

## 🚨 调试结果分析

根据API调试结果，发现以下问题：

### 主要问题
- ❌ **API密钥权限不足**: 403 Forbidden错误
- ❌ **产品ID不存在**: `prod_7ghOSJ2klCjPTjnURPbMoh` 返回404
- ❌ **API端点访问受限**: 多个端点无法访问

### 根本原因
**API密钥可能是只读权限或测试环境限制**

## 🛠️ 解决步骤

### 步骤1: 登录CREEM控制台

1. **访问控制台**
   ```
   URL: https://creem.io/dashboard
   或: https://dashboard.creem.io
   ```

2. **登录账户**
   - 使用注册时的邮箱和密码
   - 如果忘记密码，点击"忘记密码"重置

### 步骤2: 检查API密钥设置

1. **进入API密钥页面**
   - 点击左侧菜单 "API Keys" 或 "Settings"
   - 或查找 "Developer" / "Integration" 相关菜单

2. **检查当前密钥**
   ```
   当前密钥: creem_test_1DJqKl2eRnF3FTlYNW09u8
   ```

3. **验证密钥权限**
   确保密钥有以下权限：
   - ✅ **Read Products** (读取产品)
   - ✅ **Create Checkouts** (创建支付会话)
   - ✅ **Read Orders** (读取订单)
   - ✅ **Webhook Access** (Webhook访问)

4. **如果权限不足**
   - 点击密钥旁边的"编辑"或"权限"按钮
   - 启用所需权限
   - 保存更改

### 步骤3: 创建或验证产品

1. **进入产品页面**
   - 点击 "Products" 或 "Catalog"
   - 查看现有产品列表

2. **检查产品是否存在**
   - 查找ID为 `prod_7ghOSJ2klCjPTjnURPbMoh` 的产品
   - 如果不存在，需要创建新产品

3. **创建新产品** (如果需要)
   ```
   产品名称: Basic Pack
   描述: 5000 Credits for Translation
   价格: $5.00 USD
   类型: One-time payment
   状态: Active
   ```

4. **获取正确的产品ID**
   - 创建后会显示产品ID (格式: prod_xxxxxxxxxx)
   - 复制这个ID用于配置

### 步骤4: 测试新配置

1. **更新产品ID** (如果获得了新的)
   ```bash
   # 编辑 config/pricing.config.ts
   creemProductId: 'YOUR_NEW_PRODUCT_ID_HERE'
   ```

2. **重新测试API**
   ```bash
   cd /home/hwt/translation-low-source
   node debug-creem-api.js
   ```

### 步骤5: 如果问题持续存在

1. **生成新的API密钥**
   - 在CREEM控制台中点击"生成新密钥"
   - 确保选择所有必要权限
   - 复制新密钥

2. **更新环境变量**
   ```bash
   # 更新 .env.local
   CREEM_API_KEY=your_new_api_key_here
   ```

3. **重新测试**
   ```bash
   node verify-api-keys.js
   ```

## 🔍 控制台截图指南

如果你在控制台中找不到相关选项，请截图以下页面：

### 需要的截图
1. **主控制台页面** - 显示左侧菜单
2. **API密钥页面** - 显示当前密钥和权限
3. **产品页面** - 显示产品列表
4. **账户设置页面** - 显示账户类型和限制

### 截图要求
- 确保显示完整的页面布局
- 包含左侧导航菜单
- 显示当前的设置和选项
- 隐藏敏感信息（如完整的API密钥）

## 🆘 紧急解决方案

如果无法立即解决CREEM问题，可以临时使用以下方案：

### 方案1: 启用Mock模式
```bash
# 在 .env.local 中添加
USE_MOCK_CREEM=true
```

### 方案2: 使用直接支付URL
```typescript
// 在 config/pricing.config.ts 中
{
  id: 'basic',
  creemProductId: '', // 暂时留空
  creemPaymentUrl: 'https://www.creem.io/test/payment/prod_7ghOSJ2klCjPTjnURPbMoh'
}
```

## 📞 联系支持

如果以上步骤都无法解决问题：

### CREEM技术支持
- **邮箱**: support@creem.io
- **Discord**: https://discord.gg/q3GKZs92Av
- **文档**: https://docs.creem.io

### 支持请求模板
```
主题: API Key 403 Forbidden Error - Need Permission Check

内容:
Hi CREEM Support Team,

I'm experiencing 403 Forbidden errors when using my API key for basic operations.

API Key: creem_test_1DJqKl2eRnF3FTlYNW09u8 (test key)
Error: 403 Forbidden on /v1/products and /v1/checkouts endpoints
Trace ID: [从调试日志中获取]

Could you please:
1. Check if my API key has the correct permissions
2. Verify if the product ID prod_7ghOSJ2klCjPTjnURPbMoh exists
3. Confirm what permissions are needed for creating checkouts

Debug log attached.

Thank you!
```

## 🎯 成功标准

问题解决后，应该看到：
```
✅ API访问正常！
✅ 产品列表获取成功
✅ Checkout创建成功！
🔗 Checkout URL: https://checkout.creem.io/...
```

## 📝 下一步

1. **立即执行**: 登录CREEM控制台检查设置
2. **如果成功**: 运行 `node debug-creem-api.js` 验证
3. **如果失败**: 联系CREEM技术支持
4. **临时方案**: 启用Mock模式继续开发

记住：**代码已经正确修改**，现在只是配置和权限问题！
