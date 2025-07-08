# Creem 集成指南

本文档提供了在 Loretrans 平台中设置和集成 Creem 支付所需的步骤和最佳实践。

## 1. Creem 账户设置

1.  **创建账户**: 前往 Creem 官网注册一个新账户（链接待定）。
2.  **激活账户**: 按照仪表板上的指示完成账户激活流程。这通常需要提供业务信息、银行账户详情等。在完全激活之前，你只能使用测试模式。
3.  **切换到测试模式**: 在开发过程中，请确保 Creem 仪表板处于 **"Test mode"**。

## 2. API 密钥配置

Creem 提供两种主要的 API 密钥：

-   **Publishable Key (可发布密钥)**: 用于前端代码。此密钥是公开的，可以安全地暴露给客户端。
-   **Secret Key (私钥)**: 用于后端服务器代码。**此密钥必须严格保密**，绝不能暴露在任何客户端代码中。

### 获取密钥

1.  登录 Creem 仪表板。
2.  导航至 **开发者 > API 密钥**。
3.  你可以找到：
    -   `Publishable key`
    -   `Secret key`

### 在项目中使用密钥

将获取到的密钥添加到项目的环境配置文件中。

1.  **本地开发**: 复制 `.env.example` 为 `.env.local`。
2.  **填入密钥**:
    ```env
    # .env.local
    NEXT_PUBLIC_CREEM_PUBLISHABLE_KEY=pk_test_...
    CREEM_SECRET_KEY=sk_test_...
    ```

## 3. Webhook 配置

Webhook 用于接收来自 Creem 的实时事件通知（例如支付成功），这是实现自动积分充值的关键。

1.  **获取 Webhook 签名密钥**: 在 Creem 仪表板的 **开发者 > Webhooks** 部分，创建一个新的端点后，可以找到 Webhook 签名密钥。
2.  **配置环境变量**: 将签名密钥添加到 `.env.local` 文件中。
    ```env
    # .env.local
    CREEM_WEBHOOK_SECRET=whsec_...
    ```
3.  **生产环境配置**: 在生产环境中，你需要直接在 Creem 仪表板中添加一个端点，指向你部署的应用的 URL (`https://your-domain.com/api/webhooks/creem`)。

## 4. 在 Creem 中创建产品

所有可供购买的积分包都必须先在 Creem 中创建为"产品"。

1.  导航至 **产品**。
2.  点击 **+ 添加产品**。
3.  **填写信息** (名称、描述等)。
4.  **定价**: 设置价格和计费周期（一次性）。
5.  **保存产品**: 创建产品后，Creem 会为其生成一个 **API ID**，你将在代码中使用这个 ID 来创建支付会话。

## 5. 安全最佳实践

-   **绝不暴露私钥**: 确保 `CREEM_SECRET_KEY` 和 `CREEM_WEBHOOK_SECRET` 不会被提交到版本控制系统。
-   **使用 Webhook 签名验证**: 始终验证收到的 Webhook 事件的签名。
-   **限制 API 密钥权限**: 遵循最小权限原则。 