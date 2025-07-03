# ngrok 设置指南

## 🚀 快速设置ngrok

### 1. 注册ngrok账户
1. 访问: https://dashboard.ngrok.com/signup
2. 注册免费账户
3. 获取您的authtoken

### 2. 配置ngrok
```bash
# 在项目目录中
cd /home/hwt/translation-low-source

# 设置authtoken (替换YOUR_AUTHTOKEN为您的实际token)
./ngrok config add-authtoken YOUR_AUTHTOKEN
```

### 3. 启动服务
```bash
# 终端1: 启动前端服务
cd /home/hwt/translation-low-source/frontend
npm run dev

# 终端2: 启动ngrok隧道
cd /home/hwt/translation-low-source
./ngrok http 3000
```

### 4. 获取公网URL
ngrok启动后会显示类似这样的信息:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

复制这个HTTPS URL (例如: `https://abc123.ngrok.io`)

### 5. 更新回调URL配置

#### 方法1: 临时修改代码
编辑 `frontend/app/api/checkout/route.ts`:
```typescript
// 找到这一行
const origin = req.nextUrl.origin;

// 临时替换为
const origin = 'https://abc123.ngrok.io'; // 替换为您的ngrok URL
```

#### 方法2: 环境变量 (推荐)
在 `.env.local` 中添加:
```
NEXT_PUBLIC_BASE_URL=https://abc123.ngrok.io
```

然后修改代码使用环境变量:
```typescript
const origin = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin;
```

### 6. 测试支付流程
1. 访问: `https://abc123.ngrok.io/en/pricing`
2. 登录用户账户
3. 点击购买Basic Pack
4. 完成支付测试
5. 验证积分是否正确增加

## ✅ 当前状态

### 服务状态
- ✅ 前端服务: 运行在端口3000
- ✅ ngrok已下载并准备就绪
- ✅ 支付回调逻辑已验证正常工作

### 测试结果
- ✅ 支付回调模拟器测试成功
- ✅ 用户积分正确增加5000
- ✅ 交易记录正确插入
- ✅ 重定向到成功页面正常

### 用户当前积分
- 用户: hongwane323@gmail.com
- 当前积分: 15,501
- 包含多次测试的积分累计

## 🔧 故障排除

### 如果ngrok连接失败
1. 检查网络连接
2. 确认authtoken正确设置
3. 尝试重启ngrok

### 如果支付回调失败
1. 检查ngrok URL是否可访问
2. 确认回调URL配置正确
3. 查看服务器日志: `tail -f logs/frontend.log`

### 如果积分没有增加
1. 检查数据库连接
2. 验证purchase_credits函数
3. 查看交易记录表

## 📞 需要帮助？

如果遇到问题，请检查:
1. ngrok是否正常运行
2. 前端服务是否响应
3. 数据库连接是否正常
4. 环境变量是否正确配置

---

**下一步**: 设置ngrok authtoken并测试完整的支付流程！
