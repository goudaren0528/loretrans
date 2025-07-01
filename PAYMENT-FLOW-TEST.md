# 完整支付流程测试指南

## 🎯 新功能

### 1. 新窗口支付 ✅
- 点击购买按钮现在会在新窗口打开支付页面
- 主页面保持不变，用户体验更好
- 如果浏览器阻止弹窗，会fallback到当前窗口

### 2. 支付回调处理 ✅
- 支付成功后自动处理积分充值
- 完整的错误处理和日志记录
- 支持Creem签名验证

### 3. 支付成功页面 ✅
- 专门的支付成功页面显示购买详情
- 自动刷新用户积分数据
- 友好的用户界面和操作引导

## 🧪 测试步骤

### 第一步：基础测试
1. **访问定价页面**: http://localhost:3001/en/pricing
2. **确认登录**: 显示用户邮箱和当前积分
3. **验证商品**: 只显示2个商品（Free + Basic Pack）

### 第二步：支付流程测试
1. **点击购买**: 点击Basic Pack的"Buy Now"按钮
2. **新窗口打开**: 应该在新窗口打开Creem支付页面
3. **支付URL**: 应该包含回调参数
   ```
   https://www.creem.io/test/payment/prod_7ghOSJ2klCjPTjnURPbMoh?
   success_url=http://localhost:3001/api/payment/success?plan=basic&
   cancel_url=http://localhost:3001/pricing?purchase=canceled&
   customer_email=hongwane323@gmail.com&
   request_id=用户ID_basic_时间戳
   ```

### 第三步：支付完成测试
1. **完成支付**: 在Creem页面完成测试支付
2. **自动跳转**: 支付成功后应该跳转到成功页面
3. **积分更新**: 用户积分应该增加5000
4. **成功页面**: 显示购买详情和操作按钮

## 📊 预期结果

### ✅ 成功场景
- 新窗口打开支付页面
- 支付完成后积分从500增加到5500
- 显示支付成功页面
- 可以继续到Dashboard或返回首页

### 🔧 调试信息
浏览器控制台应该显示：
```
🛒 Purchase button clicked for package: basic
👤 Current user: hongwane323@gmail.com
🔑 Getting authentication token...
✅ Got authentication token
📡 Sending checkout request to API...
📊 API Response status: 200
✅ API Response data: {url: "...", checkout_id: "...", request_id: "..."}
🔗 Opening payment URL in new window: ...
```

服务器日志应该显示：
```
[POST /api/checkout] User xxx is creating a checkout session
Using direct payment URL for plan basic: ...
[GET /api/payment/success] Processing payment success callback
Successfully added 5000 credits to user xxx
```

## 🚨 故障排除

### 如果新窗口被阻止
- 浏览器会显示弹窗阻止提示
- 系统会fallback到当前窗口打开支付

### 如果积分没有增加
1. 检查Creem是否正确配置了success_url
2. 查看服务器日志是否有支付回调
3. 确认数据库中的积分记录

### 如果支付后没有跳转
1. 检查Creem控制台的回调URL配置
2. 确认success_url参数正确传递
3. 查看API日志是否有错误

## 🔗 相关URL

- **定价页面**: http://localhost:3001/en/pricing
- **支付成功**: http://localhost:3001/en/payment-success
- **支付回调**: http://localhost:3001/api/payment/success
- **支付取消**: http://localhost:3001/pricing?purchase=canceled

---

**准备测试**: ✅ 所有功能已实现
**服务状态**: 运行在 http://localhost:3001
**测试用户**: hongwane323@gmail.com (当前积分: 500)
