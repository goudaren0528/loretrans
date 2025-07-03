# 🔧 CREEM控制台Webhook配置指南

## ✅ 需要更新的配置

### 🌐 Webhook URL
**必须更新**: 在CREEM控制台中配置以下webhook URL

```
新的Webhook URL: https://fdb2-38-98-191-33.ngrok-free.app/api/webhook/creem
```

## 📋 CREEM控制台配置步骤

### 1. 登录CREEM控制台
- 访问: https://dashboard.creem.io
- 使用您的CREEM账户登录

### 2. 找到Webhook设置
可能的位置：
- **Settings** → **Webhooks**
- **API** → **Webhooks** 
- **Integration** → **Webhooks**
- **Developer** → **Webhooks**

### 3. 配置Webhook URL
```
Webhook URL: https://fdb2-38-98-191-33.ngrok-free.app/api/webhook/creem
HTTP Method: POST
Content-Type: application/json
```

### 4. 配置Webhook事件
选择需要接收的事件类型：
- ✅ `payment.completed` - 支付成功
- ✅ `payment.failed` - 支付失败  
- ✅ `payment.cancelled` - 支付取消
- ✅ `checkout.completed` - 结账完成
- ✅ `checkout.failed` - 结账失败

### 5. 配置Webhook签名 (可选但推荐)
如果CREEM支持webhook签名验证：
```
Webhook Secret: whsec_65jSbiU6yfhC9NDVdbAIpf
```
(这个值已在环境变量 `CREEM_WEBHOOK_SECRET` 中配置)

## 🧪 测试Webhook配置

### 验证Webhook端点
```bash
# GET请求测试 (验证端点活跃)
curl https://fdb2-38-98-191-33.ngrok-free.app/api/webhook/creem

# 预期响应:
{
  "status": "CREEM webhook endpoint active",
  "timestamp": "2025-07-02T05:39:01.870Z",
  "url": "https://localhost:3000/api/webhook/creem"
}
```

### 模拟Webhook测试
```bash
# POST请求测试 (模拟CREEM webhook)
curl -X POST https://fdb2-38-98-191-33.ngrok-free.app/api/webhook/creem \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment.completed",
    "request_id": "test_user_basic_1234567890",
    "amount": 5.00,
    "currency": "USD",
    "customer": {
      "email": "test@example.com"
    },
    "metadata": {
      "userId": "test_user",
      "planId": "basic",
      "credits": "5000"
    }
  }'
```

## 🔍 监控Webhook

### 1. 服务器日志
查看应用日志中的webhook处理信息：
```bash
# 查看最新日志
tail -f /home/hwt/translation-low-source/logs/frontend.log
```

### 2. ngrok控制台
- 访问: http://localhost:4040
- 查看 "HTTP Requests" 标签
- 监控来自CREEM的webhook请求

### 3. 浏览器开发者工具
在测试支付时，查看网络请求和控制台日志

## ⚠️ 重要注意事项

### ngrok地址变化
- **问题**: ngrok重启后地址会改变
- **解决**: 每次ngrok重启后需要更新CREEM控制台的webhook URL
- **当前地址**: `https://fdb2-38-98-191-33.ngrok-free.app`

### HTTPS要求
- ✅ CREEM要求webhook URL使用HTTPS
- ✅ ngrok提供免费的HTTPS隧道
- ✅ 当前配置满足要求

### 防火墙和网络
- 确保ngrok可以接收外部请求
- 确保开发服务器正在运行
- 确保端口3000可访问

## 🔄 完整的支付流程

```
1. 用户点击支付
   ↓
2. 创建checkout session (包含ngrok回调URL)
   ↓
3. 用户完成支付
   ↓
4. CREEM发送webhook到ngrok地址
   ↓
5. 我们的webhook处理器接收并处理
   ↓
6. 更新用户积分和订阅状态
   ↓
7. 用户重定向到成功页面
```

## 📊 配置检查清单

- [ ] **CREEM控制台登录** - 确保可以访问控制台
- [ ] **找到Webhook设置** - 定位webhook配置页面
- [ ] **更新Webhook URL** - 设置为ngrok地址
- [ ] **选择事件类型** - 启用支付相关事件
- [ ] **配置签名验证** - 使用环境变量中的secret
- [ ] **保存配置** - 确认设置已生效
- [ ] **测试webhook** - 发送测试请求验证
- [ ] **监控日志** - 确保webhook正常接收

## 🚀 测试建议

1. **先测试webhook端点**
   ```bash
   curl https://fdb2-38-98-191-33.ngrok-free.app/api/webhook/creem
   ```

2. **配置CREEM控制台**
   - 使用上述ngrok地址
   - 启用所有支付相关事件

3. **进行真实支付测试**
   - 访问: https://fdb2-38-98-191-33.ngrok-free.app/en/test-payment
   - 完成支付流程
   - 检查webhook是否被调用

4. **监控ngrok控制台**
   - 访问: http://localhost:4040
   - 查看CREEM的webhook请求

---

**总结**: 现在webhook端点已准备就绪，您需要在CREEM控制台中将webhook URL更新为 `https://fdb2-38-98-191-33.ngrok-free.app/api/webhook/creem`，这样CREEM就可以正确通知我们支付状态变化了。
