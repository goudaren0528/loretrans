# 🧪 翻译功能测试套件

## 概述

本测试套件专门针对翻译平台的核心功能进行全面测试，特别加强了长文本/文档翻译的测试覆盖。基于产品文档的核心功能设计，确保所有翻译场景都得到充分验证。

## 🎯 测试覆盖范围

### 1. 核心翻译功能测试 (`core-translation.test.js`)
- **NLLB API直接调用测试**
  - API健康检查
  - 11种核心语言对翻译质量验证
  - 错误处理和边界条件
- **应用翻译API测试**
  - 翻译端点可用性
  - 语言检测功能
- **翻译质量评估**
  - 短文本翻译质量
  - 长文本翻译处理
  - 特殊字符和格式处理
- **性能测试**
  - 响应时间监控
  - 并发翻译处理
- **语言支持覆盖**
  - 11种支持语言的翻译验证
  - 反向翻译测试

### 2. 长文本翻译专项测试 (`long-text-translation.test.js`)
- **不同长度文本翻译**
  - 中等长度文本 (1000-2000字符)
  - 长文本 (3000-5000字符)
  - 超长文本 (5000+字符)
- **翻译质量验证**
  - 文本结构完整性检查
  - 专业术语处理验证
  - 段落结构保持测试
- **性能基准测试**
  - 长文本响应时间
  - 批量长文本处理
  - 字符处理速度测试
- **特殊场景处理**
  - 多语言混合文本
  - 专业术语密集文本
  - 特殊格式文档

### 3. 文档翻译专项测试 (`document-translation.test.js`)
- **文档内容提取测试**
  - 纯文本文档翻译
  - 学术论文摘要翻译
  - 技术文档翻译
  - 法律文档翻译
- **文档格式处理**
  - 列表和编号结构
  - 表格数据处理
  - 特殊字符和符号
- **翻译质量评估**
  - 术语一致性检查
  - 上下文理解测试
  - 专业领域适应性
- **错误处理**
  - 空文档处理
  - 超长文档限制
  - 特殊字符兼容性

### 4. 综合翻译功能测试 (`comprehensive-translation.test.js`)
- **免费额度翻译测试**
  - ≤500字符免费翻译
  - 500字符边界测试
  - 短文本质量验证
- **付费功能翻译测试**
  - 501-1000字符翻译
  - 1000-2000字符翻译
  - 付费功能质量保证
- **小语种专项测试**
  - 5种核心小语种翻译
  - 反向翻译验证
  - 语言特征识别
- **翻译质量一致性**
  - 相同文本多次翻译
  - 相似文本质量对比
  - 翻译结果稳定性
- **边界条件处理**
  - 最小文本翻译
  - 特殊字符处理
  - 数字和单位保持
- **性能和可靠性**
  - 服务可用性测试
  - 并发处理能力
  - 错误恢复机制

### 5. 积分系统和付费功能测试 (`credits-and-billing.test.js`)
- **积分计算逻辑**
  - 免费额度计算 (≤500字符)
  - 付费积分计算 (>500字符)
  - 不同套餐价值计算
- **文本长度分类**
  - 5种文本长度类别测试
  - 边界条件积分计算
  - 最小扣费逻辑验证
- **用户权限管理**
  - 未登录用户限制
  - 注册用户权限
  - 付费用户功能
- **积分消耗场景**
  - 不同使用场景积分预估
  - 套餐推荐算法
  - 使用量分析
- **积分不足处理**
  - 余额检查逻辑
  - 充值建议算法
  - 转化触发机制
- **系统安全性**
  - 积分计算防篡改
  - 扣费原子性保证
  - 服务端验证机制

### 6. 端到端翻译测试 (`e2e-translation.test.js`)
- **翻译页面功能**
  - 页面加载和元素检查
  - 语言选择器功能
  - 用户界面交互
- **完整翻译流程**
  - 文本输入到结果输出
  - 语言切换功能
  - 错误处理流程

## 🚀 运行测试

### 快速运行所有测试
```bash
# 运行完整测试套件
./scripts/run-translation-tests.sh

# 运行测试并生成覆盖率报告
./scripts/run-translation-tests.sh --coverage
```

### 运行特定测试套件
```bash
# 核心翻译功能测试
npm test -- tests/core-translation.test.js

# 长文本翻译测试
npm test -- tests/long-text-translation.test.js

# 文档翻译测试
npm test -- tests/document-translation.test.js

# 综合翻译测试
npm test -- tests/comprehensive-translation.test.js

# 积分系统测试
npm test -- tests/credits-and-billing.test.js

# 端到端测试
npm test -- tests/e2e-translation.test.js
```

### 运行特定测试用例
```bash
# 运行包含特定关键词的测试
npm test -- --testNamePattern="长文本翻译"

# 运行特定语言的测试
npm test -- --testNamePattern="海地克里奥尔语"

# 运行性能相关测试
npm test -- --testNamePattern="性能测试"
```

## 📊 测试配置

### 超时设置
- 核心翻译测试: 60秒
- 长文本翻译测试: 90秒
- 文档翻译测试: 90秒
- 综合翻译测试: 120秒
- 积分系统测试: 30秒
- 端到端测试: 60秒

### 环境变量
```bash
# 测试基础URL
TEST_BASE_URL=http://localhost:3000

# 测试环境
NODE_ENV=test
```

## 🎯 测试重点

### 产品核心功能验证
1. **免费翻译功能** (≤500字符)
   - 所有支持语言对的翻译质量
   - 响应时间和用户体验
   - 错误处理和边界条件

2. **付费翻译功能** (>500字符)
   - 长文本翻译质量和性能
   - 积分计算和扣费逻辑
   - 文档翻译完整流程

3. **小语种专项支持**
   - 海地克里奥尔语、老挝语、缅甸语等
   - 双向翻译质量验证
   - 语言特征保持测试

4. **用户体验和商业逻辑**
   - 积分系统完整性
   - 付费转化流程
   - 错误恢复机制

### 质量保证标准
- **翻译准确性**: 所有翻译结果必须非空且不等于原文
- **语言识别**: 目标语言字符必须正确显示
- **性能要求**: 标准翻译请求应在10秒内完成
- **错误处理**: 所有异常情况都有适当的错误响应
- **一致性**: 相同输入应产生稳定的输出结果

## 📈 测试报告

测试完成后会生成详细的测试报告，包括：
- 各测试套件的通过率
- 翻译质量评估结果
- 性能基准测试数据
- 错误处理验证结果
- 代码覆盖率报告

## 🔧 故障排除

### 常见问题
1. **API超时**: 检查网络连接和NLLB服务状态
2. **测试失败**: 确认测试环境变量设置正确
3. **依赖问题**: 运行 `npm install` 安装所需依赖
4. **权限错误**: 确保测试脚本有执行权限

### 调试技巧
```bash
# 详细输出模式
npm test -- --verbose

# 只运行失败的测试
npm test -- --onlyFailures

# 监视模式（开发时使用）
npm test -- --watch
```

## 📝 测试维护

### 添加新测试
1. 在相应的测试文件中添加新的测试用例
2. 更新Jest配置如需要新的超时设置
3. 更新本文档说明新增的测试内容

### 测试数据更新
- 定期更新测试文本内容以覆盖更多场景
- 根据产品功能更新调整测试预期结果
- 监控API变化并相应更新测试配置

这个增强的测试套件确保了翻译平台核心功能的全面覆盖，特别是长文本和文档翻译功能的深度测试，为产品质量提供了可靠保障。
