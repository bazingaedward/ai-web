# Stripe 支付集成设置指南

## 概述

本项目已集成 Stripe 支付系统，支持以下功能：
- 3 层价格方案（Free、Pro $20/月、Team 定制）
- 订阅管理
- Webhook 事件处理
- 用户使用限制

## 设置步骤

### 1. 创建 Stripe 账户

1. 访问 [Stripe Dashboard](https://dashboard.stripe.com/)
2. 创建账户或登录现有账户
3. 在测试模式下进行开发

### 2. 获取 API 密钥

在 Stripe Dashboard 中：
1. 转到 "Developers" > "API keys"
2. 复制以下密钥：
   - Publishable key (`pk_test_...`)
   - Secret key (`sk_test_...`)

### 3. 创建产品和价格

1. 转到 "Products" 页面
2. 创建 "Pro Plan" 产品
3. 添加价格：$20/月，设置 `lookup_key` 为 `pro_monthly`
4. 复制价格 ID (`price_...`)

### 4. 设置 Webhook

1. 转到 "Developers" > "Webhooks"
2. 点击 "Add endpoint"
3. 添加端点 URL：`https://your-domain.com/api/stripe/webhook`
4. 选择以下事件：
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. 复制 Webhook 签名密钥 (`whsec_...`)

### 5. 配置环境变量

更新 `wrangler.toml` 或本地 `.env` 文件：

```toml
[vars]
STRIPE_PUBLISHABLE_KEY="pk_test_your_key_here"
STRIPE_SECRET_KEY="sk_test_your_key_here"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"
```

### 6. 创建数据库表

运行 SQL 迁移脚本创建用户订阅表：

```sql
-- 参考 sql/001_create_user_subscriptions.sql
```

### 7. 更新价格 ID

在 `app/components/ui/PricingModal.tsx` 中更新实际的价格 ID：

```typescript
{
  name: "Pro",
  price: "$20",
  // ...
  priceId: "price_your_actual_price_id", // 替换为实际的价格 ID
}
```

## 功能说明

### 价格方案

- **Free**: 每日 5 次对话，基础功能
- **Pro ($20/月)**: 无限对话，高级功能，优先支持
- **Team (定制)**: 团队协作，高级分析，SSO 集成

### 组件说明

1. **PricingModal**: 价格方案弹框
2. **SubscriptionBadge**: 订阅状态徽章
3. **UsageLimit**: 使用限制显示
4. **UpgradePrompt**: 升级提示
5. **FeatureGate**: 功能权限控制

### API 路由

- `/api/stripe/create-checkout-session`: 创建支付会话
- `/api/stripe/webhook`: 处理 Stripe webhook 事件

## 测试

使用 Stripe 测试卡号进行测试：
- 成功：`4242 4242 4242 4242`
- 拒绝：`4000 0000 0000 0002`
- 需要 3DS：`4000 0000 0000 3220`

## 生产环境部署

1. 切换到 Stripe 生产模式
2. 更新所有密钥为生产环境密钥
3. 确保 webhook 端点指向生产域名
4. 设置正确的价格 ID

## 常见问题

### Q: 支付完成后用户没有升级？
A: 检查 webhook 是否正确配置，查看服务器日志中的错误信息。

### Q: 如何处理订阅取消？
A: Stripe 会发送 `customer.subscription.deleted` 事件，webhook 会自动处理。

### Q: 如何添加新的价格方案？
A: 在 Stripe 中创建新产品/价格，然后在 `PricingModal.tsx` 中添加配置。

## 安全注意事项

- 永远不要在客户端暴露 Secret Key
- 使用 Webhook 签名验证确保数据完整性
- 在生产环境中启用 HTTPS
- 定期轮换 API 密钥
