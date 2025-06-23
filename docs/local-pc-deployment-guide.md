# 个人电脑NLLB翻译服务部署指南

## 🎯 部署概述

本指南专为使用个人电脑提供NLLB翻译服务而设计，适用于早期阶段（日翻译量1000次以内）的小规模部署。

## 📋 部署优势

### ✅ 成本优势
- **零额外硬件成本**：使用现有电脑
- **零API调用费用**：完全本地化
- **低运营成本**：仅电费消耗

### ✅ 性能优势
- **无网络延迟**：本地处理，响应更快
- **数据隐私**：翻译内容不离开本地
- **高可用性**：配合云端API备用方案

### ✅ 灵活性优势
- **即时调试**：本地开发和生产环境一致
- **快速迭代**：功能更新无需重新部署
- **渐进升级**：后期可无缝迁移到云端

## 🖥️ 系统要求验证

### 最低配置（已满足）
```yaml
基本要求:
  CPU: 4核心（您的配置应该足够）
  内存: 8GB RAM（推荐16GB+）
  存储: 20GB可用空间
  网络: 稳定的互联网连接

推荐配置:
  CPU: 8核心+
  内存: 16GB+
  存储: SSD存储（提升模型加载速度）
  网络: 100Mbps+上行带宽（用于用户访问）
```

## 🔧 部署步骤

### 步骤1：环境准备
```powershell
# 1. 确认当前目录
cd D:\git_repo\low-source-translate-new

# 2. 检查模型文件
dir microservices\nllb-local\models\nllb-600m

# 3. 验证Python环境
python --version
pip list | findstr transformers
```

### 步骤2：配置本地服务
```powershell
# 1. 进入NLLB服务目录
cd microservices\nllb-local

# 2. 安装依赖
npm install

# 3. 创建本地配置文件（如果不存在）
# 创建 .env.local 文件
```

**创建 `.env.local` 配置：**
```env
# 本地部署专用配置
PORT=8080
HOST=0.0.0.0
NODE_ENV=production

# 模型配置
MODEL_PATH=./models/nllb-600m
DEVICE=cpu
BATCH_SIZE=4

# 性能优化（针对个人电脑）
MAX_CONCURRENT_REQUESTS=5
REQUEST_TIMEOUT=30000
LOG_LEVEL=info

# 内存优化
NODE_OPTIONS=--max-old-space-size=8192
```

### 步骤3：启动服务
```powershell
# 终端1：启动NLLB本地服务
cd D:\git_repo\low-source-translate-new\microservices\nllb-local
npm start

# 终端2：启动主服务（新PowerShell窗口）
cd D:\git_repo\low-source-translate-new
npm run dev
```

### 步骤4：配置主服务使用本地NLLB

**确保根目录 `.env` 文件包含以下配置：**
```env
# NLLB Local Service (本地NLLB服务配置)
NLLB_LOCAL_ENABLED=true
NLLB_LOCAL_URL=http://localhost:8080
NLLB_LOCAL_FALLBACK=true
NLLB_LOCAL_TIMEOUT=30000

# 关闭Mock模式，使用真实翻译
USE_MOCK_TRANSLATION=false
```

### 步骤5：验证部署
```powershell
# 1. 健康检查
# 浏览器访问: http://localhost:8080/health

# 2. 测试翻译功能
# 浏览器访问: http://localhost:3000/text-translate

# 3. API测试（PowerShell）
Invoke-RestMethod -Uri "http://localhost:3000/api/translate" -Method Post -ContentType "application/json" -Body '{"text":"Hello world","sourceLanguage":"en","targetLanguage":"ht"}'
```

## 🔧 个人电脑专用优化

### 1. 内存优化配置
```env
# NLLB服务内存限制
NODE_OPTIONS=--max-old-space-size=4096

# 批处理大小调整（减少内存使用）
BATCH_SIZE=2

# 并发限制（避免系统过载）
MAX_CONCURRENT_REQUESTS=3
```

### 2. Windows系统优化
```powershell
# 设置高性能电源模式
powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c

# 增加虚拟内存（如果物理内存不足）
# 控制面板 → 系统 → 高级系统设置 → 性能设置 → 高级 → 虚拟内存

# 关闭不必要的后台应用
# 设置 → 隐私 → 后台应用
```

### 3. 网络配置（如果需要外部访问）
```powershell
# 配置Windows防火墙（允许端口3000和8080）
netsh advfirewall firewall add rule name="NLLB Local Service" dir=in action=allow protocol=TCP localport=8080
netsh advfirewall firewall add rule name="Transly Web Service" dir=in action=allow protocol=TCP localport=3000

# 查看本机IP地址
ipconfig | findstr IPv4
```

## 📊 性能监控

### 1. 系统资源监控
```powershell
# 查看CPU和内存使用
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Format-Table ProcessName,CPU,WorkingSet

# 实时监控
# 任务管理器 → 性能选项卡
```

### 2. 服务状态监控
```powershell
# 检查服务端口
netstat -an | findstr ":8080"
netstat -an | findstr ":3000"

# 健康检查脚本
function Test-NLLBService {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8080/health" -TimeoutSec 5
        Write-Host "✅ NLLB Service: $($response.status)" -ForegroundColor Green
    } catch {
        Write-Host "❌ NLLB Service: Offline" -ForegroundColor Red
    }
}
```

## 🚦 日常运维

### 1. 启动脚本（自动化）
```powershell
# 创建 start-services.ps1
# 内容如下：

Write-Host "🚀 启动Transly翻译服务..." -ForegroundColor Yellow

# 启动NLLB服务
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\git_repo\low-source-translate-new\microservices\nllb-local; npm start"

# 等待服务启动
Start-Sleep -Seconds 10

# 启动主服务
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\git_repo\low-source-translate-new; npm run dev"

Write-Host "✅ 服务启动完成！" -ForegroundColor Green
Write-Host "📝 访问地址: http://localhost:3000" -ForegroundColor Cyan
```

### 2. 停止脚本
```powershell
# 创建 stop-services.ps1
# 停止所有Node.js进程
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force
Write-Host "✅ 所有服务已停止" -ForegroundColor Green
```

### 3. 健康检查脚本
```powershell
# 创建 health-check.ps1
Write-Host "🔍 检查服务状态..." -ForegroundColor Yellow

# 检查NLLB服务
try {
    $nllb = Invoke-RestMethod -Uri "http://localhost:8080/health" -TimeoutSec 5
    Write-Host "✅ NLLB服务: 正常运行" -ForegroundColor Green
} catch {
    Write-Host "❌ NLLB服务: 离线" -ForegroundColor Red
}

# 检查主服务
try {
    $main = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -TimeoutSec 5
    Write-Host "✅ 主服务: 正常运行" -ForegroundColor Green
} catch {
    Write-Host "❌ 主服务: 离线" -ForegroundColor Red
}
```

## 💡 使用建议

### 1. 开发期间
- 保持两个PowerShell窗口开启
- 定期检查内存使用情况
- 如遇问题，重启服务即可

### 2. 生产使用
- 设置开机自启动脚本
- 定期备份配置文件
- 监控系统资源使用

### 3. 扩展规划
```yaml
使用量预测:
  100次/日: 当前配置完全够用
  500次/日: 建议增加内存到16GB
  1000次/日: 考虑使用SSD存储
  5000次/日: 准备迁移到专用服务器
```

## ⚠️ 注意事项

### 1. 系统稳定性
- 避免在翻译高峰期重启电脑
- 定期清理临时文件和日志
- 保持足够的磁盘空间

### 2. 网络安全
- 不要将8080端口暴露到公网
- 使用反向代理（如Nginx）提供外部访问
- 定期更新Node.js和依赖包

### 3. 备份策略
- 定期备份模型文件
- 保存配置文件副本
- 记录重要的环境变量

## 🎯 成功标准

完成部署后，您应该能够：
- ✅ 本地访问 http://localhost:3000 看到翻译界面
- ✅ 翻译功能返回 method: "nllb-local"
- ✅ 响应时间在3秒以内
- ✅ 支持所有5种目标语言翻译
- ✅ 系统资源使用合理（CPU < 80%, 内存 < 8GB）

## 📞 故障排除

### 常见问题解决
1. **端口冲突**：使用 `netstat -an | findstr :8080` 检查
2. **内存不足**：减少 BATCH_SIZE 到 2
3. **Python环境问题**：重新安装 transformers 包
4. **模型加载失败**：检查模型文件完整性

---

**🎉 部署成功后，您就拥有了完全本地化的NLLB翻译服务，可以稳定支撑日1000次的翻译需求！** 