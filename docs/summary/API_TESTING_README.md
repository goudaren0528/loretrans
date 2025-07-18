# API Testing Tools - 运行时测试工具集

这是一套完整的基于curl的API测试工具，用于测试翻译服务的各个API端点。

## 工具概览

### 1. 核心测试脚本
- **`test-apis-with-curl.sh`** - 主要的API测试脚本
- **`run-api-tests.sh`** - 增强版测试运行器，支持多环境配置
- **`quick-api-check.sh`** - 快速API状态检查
- **`monitor-apis.sh`** - 持续API监控脚本

### 2. 配置文件
- **`api-test-config.json`** - API测试配置文件

## 快速开始

### 1. 快速状态检查
```bash
# 检查本地服务器 (默认 localhost:3000)
./quick-api-check.sh

# 检查自定义URL
./quick-api-check.sh http://localhost:8080
./quick-api-check.sh https://api.example.com
```

### 2. 运行完整测试套件
```bash
# 运行所有测试 (本地环境)
./run-api-tests.sh

# 运行特定环境的测试
./run-api-tests.sh -e staging
./run-api-tests.sh -e production

# 运行特定类型的测试
./run-api-tests.sh translation
./run-api-tests.sh health
./run-api-tests.sh errors
```

### 3. 持续监控
```bash
# 启动API监控 (每60秒检查一次)
./monitor-apis.sh

# 自定义监控间隔
./monitor-apis.sh -i 30  # 每30秒检查一次

# 监控生产环境
./monitor-apis.sh -u https://api.example.com -i 120
```

## 详细使用说明

### test-apis-with-curl.sh - 主测试脚本

这是核心的API测试脚本，包含了所有的测试用例。

#### 基本用法
```bash
# 运行所有测试
./test-apis-with-curl.sh

# 指定服务器URL
./test-apis-with-curl.sh -u http://localhost:8080

# 启用详细输出
./test-apis-with-curl.sh -v

# 运行特定测试类型
./test-apis-with-curl.sh health
./test-apis-with-curl.sh translation
./test-apis-with-curl.sh performance
```

#### 支持的测试类型
- **all** - 运行所有测试 (默认)
- **health** - 健康检查测试
- **translation** - 翻译API测试
- **auth** - 认证测试
- **performance** - 性能测试
- **errors** - 错误处理测试

#### 测试内容
- ✅ 基本翻译功能
- ✅ 批量翻译
- ✅ 语言检测
- ✅ 支持的语言列表
- ✅ 错误处理 (无效语言、空文本、格式错误等)
- ✅ 性能测试 (大文本、速率限制)
- ✅ 认证测试

### run-api-tests.sh - 增强版测试运行器

提供了更高级的功能，包括多环境支持、配置文件管理等。

#### 基本用法
```bash
# 使用默认配置运行测试
./run-api-tests.sh

# 指定环境
./run-api-tests.sh -e staging
./run-api-tests.sh -e production

# 使用自定义配置文件
./run-api-tests.sh -c custom-config.json

# 启用详细输出
./run-api-tests.sh -v

# 禁用报告生成
./run-api-tests.sh -r
```

#### 环境配置
在 `api-test-config.json` 中配置不同的环境：

```json
{
  "environments": {
    "local": {
      "base_url": "http://localhost:3000",
      "timeout": 30
    },
    "staging": {
      "base_url": "https://staging.your-domain.com",
      "timeout": 45
    },
    "production": {
      "base_url": "https://your-domain.com",
      "timeout": 60
    }
  }
}
```

### quick-api-check.sh - 快速检查

用于快速验证API的基本功能是否正常。

```bash
# 检查本地服务器
./quick-api-check.sh

# 检查指定URL
./quick-api-check.sh https://api.example.com
```

输出示例：
```
Quick API Status Check for: http://localhost:3000
==================================================
Health:              ✓ HTTP 200 (45ms)
Translation:         ✓ HTTP 200 (123ms)
Detection:           ✓ HTTP 200 (67ms)
Languages:           ✓ HTTP 200 (23ms)
Error Handling:      ✓ HTTP 400 (34ms)
==================================================
✓ All tests passed (5/5) - Success rate: 100%
```

### monitor-apis.sh - 持续监控

用于持续监控API的健康状态和性能。

#### 基本用法
```bash
# 启动监控 (默认每60秒检查一次)
./monitor-apis.sh

# 自定义检查间隔
./monitor-apis.sh -i 30  # 每30秒

# 监控指定URL
./monitor-apis.sh -u https://api.example.com

# 设置Slack告警
./monitor-apis.sh -w https://hooks.slack.com/services/...
```

#### 功能特性
- 🔄 持续监控所有API端点
- 📊 记录性能指标和响应时间
- 🚨 连续失败时发送告警
- 📝 生成详细的监控日志
- 📈 定期生成状态报告

## 输出和报告

### 测试结果
所有测试结果都会保存在 `test-results/` 目录中：
- 每个测试的响应内容
- 详细的测试报告
- 性能指标数据

### 监控日志
监控脚本会在 `logs/` 目录中生成：
- `api-monitor.log` - 详细的监控日志
- `api-metrics.json` - 性能指标数据
- `status-report-*.html` - HTML格式的状态报告

### HTML报告
测试完成后会生成HTML格式的报告，包含：
- 测试摘要和统计信息
- 详细的测试结果
- 性能指标图表
- 错误分析

## 配置选项

### 环境变量
```bash
export API_BASE_URL="http://localhost:8080"  # 默认API地址
export API_TIMEOUT=30                        # 请求超时时间
```

### 配置文件 (api-test-config.json)
```json
{
  "environments": {
    "local": {
      "base_url": "http://localhost:3000",
      "timeout": 30,
      "description": "Local development environment"
    }
  },
  "test_data": {
    "translation": {
      "basic_text": "Hello world",
      "languages": {
        "valid": ["en", "zh", "es", "fr"],
        "invalid": ["invalid", "xyz"]
      }
    }
  },
  "expected_responses": {
    "translation": {
      "success": {
        "status": 200,
        "required_fields": ["translatedText", "sourceLanguage"]
      }
    }
  }
}
```

## 故障排除

### 常见问题

1. **连接失败**
   ```bash
   # 检查服务器是否运行
   curl -I http://localhost:3000/health
   
   # 检查端口是否正确
   netstat -tlnp | grep :3000
   ```

2. **权限错误**
   ```bash
   # 确保脚本有执行权限
   chmod +x *.sh
   ```

3. **依赖缺失**
   ```bash
   # 安装必要的依赖
   sudo apt-get install curl jq  # Ubuntu/Debian
   brew install curl jq          # macOS
   ```

### 调试模式
```bash
# 启用详细输出
./test-apis-with-curl.sh -v

# 查看curl命令详情
VERBOSE=true ./test-apis-with-curl.sh
```

## 集成到CI/CD

### GitHub Actions 示例
```yaml
name: API Tests
on: [push, pull_request]
jobs:
  api-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Start API server
        run: npm start &
      - name: Wait for server
        run: sleep 30
      - name: Run API tests
        run: ./run-api-tests.sh -e local
```

### Jenkins 示例
```groovy
pipeline {
    agent any
    stages {
        stage('API Tests') {
            steps {
                sh './run-api-tests.sh -e staging'
                publishHTML([
                    allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'test-results',
                    reportFiles: '*.html',
                    reportName: 'API Test Report'
                ])
            }
        }
    }
}
```

## 最佳实践

1. **定期运行测试** - 在每次部署前后运行完整的测试套件
2. **监控生产环境** - 使用监控脚本持续检查生产API的健康状态
3. **保存测试历史** - 定期备份测试结果和性能数据
4. **设置告警** - 配置Slack或邮件告警，及时发现问题
5. **版本控制** - 将测试脚本和配置文件纳入版本控制

## 扩展和自定义

### 添加新的测试用例
在 `test-apis-with-curl.sh` 中添加新的测试函数：

```bash
test_new_feature() {
    local data='{"test": "data"}'
    test_api "new_feature" "POST" "/api/new-endpoint" "$data" "200" "New feature test"
}
```

### 自定义配置
修改 `api-test-config.json` 来适应你的API结构和需求。

### 集成其他工具
这些脚本可以很容易地与其他测试工具集成，如Newman、Postman、或自定义的测试框架。

---

## 支持和贡献

如果你发现任何问题或有改进建议，请创建issue或提交pull request。

这套工具旨在提供一个完整、可靠的API测试解决方案，帮助确保翻译服务的质量和稳定性。
