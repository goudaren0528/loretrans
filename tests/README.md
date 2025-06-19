# Tests Directory

这里包含了 Transly 项目的所有测试代码，采用分层测试架构。

## 📁 目录结构

```
tests/
├── unit/                    # 单元测试
│   ├── frontend/           # 前端组件和工具测试
│   │   ├── components/     # React组件测试
│   │   ├── services/       # 服务层测试
│   │   └── utils/          # 工具函数测试
│   └── backend/            # 后端逻辑测试
│       ├── api/            # API路由测试
│       └── services/       # 微服务测试
├── integration/            # 集成测试
│   ├── api/                # API端到端测试
│   └── services/           # 服务间集成测试
├── e2e/                    # 端到端测试
│   ├── features/           # 功能测试
│   ├── performance/        # 性能测试
│   └── security/           # 安全测试
├── fixtures/               # 测试数据和固定装置
│   ├── files/              # 测试文件
│   └── data/               # 测试数据
└── config/                 # 测试配置
    ├── jest/               # Jest配置
    ├── playwright/         # Playwright配置
    └── setup/              # 测试环境设置
```

## 🧪 测试类型

### 单元测试 (Unit Tests)
- **位置**: `tests/unit/`
- **工具**: Jest + React Testing Library
- **目标**: 测试独立的函数、组件和模块
- **覆盖率**: 要求 ≥ 70%

### 集成测试 (Integration Tests)  
- **位置**: `tests/integration/`
- **工具**: Jest + Supertest
- **目标**: 测试模块间的交互和数据流
- **重点**: API集成、数据库交互、服务通信

### 端到端测试 (E2E Tests)
- **位置**: `tests/e2e/`
- **工具**: Playwright
- **目标**: 测试完整的用户流程
- **覆盖**: 多浏览器、移动端、性能、安全

## 🚀 运行测试

### 快速开始
```bash
# 安装依赖
npm install

# 运行所有测试
npm run test:all

# 运行特定类型的测试
npm run test:unit          # 单元测试
npm run test:integration   # 集成测试
npm run test:e2e          # E2E测试
npm run test:performance  # 性能测试
npm run test:security     # 安全测试
```

### 开发模式
```bash
# 监听模式运行单元测试
npm run test:unit:watch

# 可视化模式运行E2E测试
npm run test:e2e:ui

# 生成覆盖率报告
npm run test:coverage
```

## 🔧 配置文件

### Jest配置
- **前端**: `tests/config/jest/frontend.config.js`
- **后端**: `tests/config/jest/backend.config.js`
- **通用**: `tests/config/jest/common.config.js`

### Playwright配置
- **主配置**: `tests/config/playwright/playwright.config.ts`
- **环境配置**: `tests/config/playwright/environments/`

## 📋 测试规范

### 命名约定
- 单元测试: `*.test.{js,ts,tsx}`
- 集成测试: `*.integration.{js,ts}`
- E2E测试: `*.spec.{js,ts}`

### 文件组织
- 测试文件应与被测试文件有相同的目录结构
- 每个测试文件应专注于测试一个模块或功能
- 使用描述性的测试名称和分组

### 最佳实践
1. **AAA模式**: Arrange(准备) → Act(执行) → Assert(断言)
2. **独立性**: 每个测试应该独立运行
3. **可读性**: 测试应该作为文档来阅读
4. **覆盖率**: 关注边界条件和错误情况
5. **性能**: 保持测试运行快速

## 🔍 调试测试

### 常用调试方法
```bash
# 运行单个测试文件
npm run test:unit -- specific-test.test.js

# 调试模式运行测试
npm run test:debug

# 生成详细的测试报告
npm run test:verbose
```

### Playwright调试
```bash
# 头显模式运行E2E测试
npm run test:e2e:headed

# 逐步调试模式
npm run test:e2e:debug

# 生成测试报告
npm run test:e2e:report
```

## 📊 CI/CD集成

测试在以下情况下自动运行：
- 每次 `git push`
- Pull Request 创建和更新
- 定时任务 (每日构建)

### GitHub Actions
- **工作流**: `.github/workflows/test.yml`
- **并行执行**: 不同类型的测试并行运行
- **报告生成**: 自动生成测试报告和覆盖率数据
- **失败通知**: 测试失败时自动通知

## 🛠️ 维护指南

### 添加新测试
1. 确定测试类型（单元/集成/E2E）
2. 在相应目录创建测试文件
3. 遵循命名和结构约定
4. 更新相关配置（如需要）

### 更新测试配置
1. 修改对应的配置文件
2. 更新文档
3. 运行测试确保配置正确
4. 提交变更

### 性能优化
- 定期检查测试运行时间
- 优化慢速测试
- 合理使用并行执行
- 清理不必要的测试数据 