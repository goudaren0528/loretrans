# Transly本地NLLB翻译服务启动脚本
# 适用于个人电脑部署（日翻译量1000次以内）

Write-Host @"
🚀 Transly本地NLLB翻译服务启动器
=====================================
目标配置: 个人电脑部署
支持能力: 日翻译1000+次
部署成本: $0（使用现有设备）
"@ -ForegroundColor Cyan

# 检查当前目录
$currentPath = Get-Location
Write-Host "📁 当前目录: $currentPath" -ForegroundColor Yellow

if (-not (Test-Path "microservices\nllb-local")) {
    Write-Host "❌ 错误: 请在项目根目录运行此脚本" -ForegroundColor Red
    Write-Host "正确路径应该是: D:\git_repo\low-source-translate-new" -ForegroundColor Yellow
    Read-Host "按任意键退出"
    exit 1
}

# 检查模型文件
Write-Host "🔍 检查NLLB模型文件..." -ForegroundColor Yellow
if (Test-Path "microservices\nllb-local\models\nllb-600m\config.json") {
    Write-Host "✅ NLLB 600M模型文件存在" -ForegroundColor Green
} else {
    Write-Host "❌ 错误: NLLB模型文件未找到" -ForegroundColor Red
    Write-Host "请确保模型已下载到: microservices\nllb-local\models\nllb-600m\" -ForegroundColor Yellow
    Read-Host "按任意键退出"
    exit 1
}

# 检查Node.js依赖
Write-Host "🔍 检查NLLB服务依赖..." -ForegroundColor Yellow
if (Test-Path "microservices\nllb-local\node_modules") {
    Write-Host "✅ NLLB服务依赖已安装" -ForegroundColor Green
} else {
    Write-Host "⚙️ 正在安装NLLB服务依赖..." -ForegroundColor Yellow
    Set-Location "microservices\nllb-local"
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 依赖安装成功" -ForegroundColor Green
    } else {
        Write-Host "❌ 依赖安装失败" -ForegroundColor Red
        Read-Host "按任意键退出"
        exit 1
    }
    Set-Location "..\..\"
}

# 检查主服务依赖
Write-Host "🔍 检查主服务依赖..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✅ 主服务依赖已安装" -ForegroundColor Green
} else {
    Write-Host "⚙️ 正在安装主服务依赖..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 依赖安装成功" -ForegroundColor Green
    } else {
        Write-Host "❌ 依赖安装失败" -ForegroundColor Red
        Read-Host "按任意键退出"
        exit 1
    }
}

# 检查环境配置
Write-Host "🔍 检查环境配置..." -ForegroundColor Yellow
if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "NLLB_LOCAL_ENABLED=true") {
        Write-Host "✅ 本地NLLB服务已启用" -ForegroundColor Green
    } else {
        Write-Host "⚙️ 正在启用本地NLLB服务..." -ForegroundColor Yellow
        $envContent = $envContent -replace "NLLB_LOCAL_ENABLED=false", "NLLB_LOCAL_ENABLED=true"
        $envContent = $envContent -replace "USE_MOCK_TRANSLATION=true", "USE_MOCK_TRANSLATION=false"
        Set-Content ".env" $envContent
        Write-Host "✅ 配置已更新" -ForegroundColor Green
    }
} else {
    Write-Host "⚙️ 创建环境配置文件..." -ForegroundColor Yellow
    Copy-Item "env.example" ".env"
    $envContent = Get-Content ".env" -Raw
    $envContent = $envContent -replace "NLLB_LOCAL_ENABLED=false", "NLLB_LOCAL_ENABLED=true"
    $envContent = $envContent -replace "USE_MOCK_TRANSLATION=true", "USE_MOCK_TRANSLATION=false"
    Set-Content ".env" $envContent
    Write-Host "✅ 环境配置已创建" -ForegroundColor Green
}

Write-Host @"

🎯 准备启动服务...
=================
配置信息:
- NLLB服务端口: 8081
- 主服务端口: 3000
- 翻译模式: 本地NLLB优先
- 支持语言: 英语→海地克里奥尔语、老挝语、斯瓦希里语、缅甸语、泰卢固语

"@ -ForegroundColor Cyan

Write-Host "🚀 正在启动NLLB本地服务..." -ForegroundColor Yellow

# 启动NLLB服务（新窗口）
$nllbJob = Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$currentPath\microservices\nllb-local'; Write-Host '🤖 NLLB本地翻译服务启动中...' -ForegroundColor Green; npm start"
) -PassThru

Start-Sleep -Seconds 8

# 检查NLLB服务是否启动成功
Write-Host "🔍 检查NLLB服务状态..." -ForegroundColor Yellow
$maxRetries = 10
$retryCount = 0
$nllbReady = $false

while ($retryCount -lt $maxRetries -and -not $nllbReady) {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8081/health" -TimeoutSec 3 -ErrorAction Stop
        if ($response.status -eq "ok") {
            Write-Host "✅ NLLB服务启动成功！" -ForegroundColor Green
            Write-Host "   - 状态: $($response.status)" -ForegroundColor Gray
            Write-Host "   - 模型已加载: $($response.model_loaded)" -ForegroundColor Gray
            $nllbReady = $true
        }
    } catch {
        $retryCount++
        Write-Host "⏳ 等待NLLB服务启动... ($retryCount/$maxRetries)" -ForegroundColor Yellow
        Start-Sleep -Seconds 3
    }
}

if (-not $nllbReady) {
    Write-Host "❌ NLLB服务启动失败或超时" -ForegroundColor Red
    Write-Host "请检查第一个PowerShell窗口的错误信息" -ForegroundColor Yellow
    Read-Host "按任意键继续（或Ctrl+C退出）"
}

Write-Host "🚀 正在启动Transly主服务..." -ForegroundColor Yellow

# 启动主服务（新窗口）
$mainJob = Start-Process powershell -ArgumentList @(
    "-NoExit", 
    "-Command",
    "cd '$currentPath'; Write-Host '🌐 Transly主服务启动中...' -ForegroundColor Green; npm run dev"
) -PassThru

Start-Sleep -Seconds 10

# 检查主服务是否启动成功
Write-Host "🔍 检查主服务状态..." -ForegroundColor Yellow
$mainRetries = 8
$mainRetryCount = 0
$mainReady = $false

while ($mainRetryCount -lt $mainRetries -and -not $mainReady) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 3 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ 主服务启动成功！" -ForegroundColor Green
            $mainReady = $true
        }
    } catch {
        $mainRetryCount++
        Write-Host "⏳ 等待主服务启动... ($mainRetryCount/$mainRetries)" -ForegroundColor Yellow
        Start-Sleep -Seconds 3
    }
}

# 显示启动结果
Write-Host @"

🎉 服务启动完成！
===============

📊 服务状态:
"@ -ForegroundColor Green

if ($nllbReady) {
    Write-Host "✅ NLLB本地服务: 运行中 (http://localhost:8081)" -ForegroundColor Green
} else {
    Write-Host "❌ NLLB本地服务: 启动失败" -ForegroundColor Red
}

if ($mainReady) {
    Write-Host "✅ Transly主服务: 运行中 (http://localhost:3000)" -ForegroundColor Green
} else {
    Write-Host "❌ Transly主服务: 启动失败" -ForegroundColor Red
}

Write-Host @"

🌟 快速访问链接:
- 翻译界面: http://localhost:3000/text-translate
- 文档翻译: http://localhost:3000/document-translate
- API文档: http://localhost:3000/api-docs
- 健康检查: http://localhost:8081/health

🔧 测试命令:
# 测试翻译API
Invoke-RestMethod -Uri "http://localhost:3000/api/translate" -Method Post -ContentType "application/json" -Body '{"text":"Hello world","sourceLanguage":"en","targetLanguage":"ht"}'

💡 使用提示:
1. 两个PowerShell窗口会保持开启状态
2. 不要关闭这些窗口，否则服务会停止
3. 如需停止服务，直接关闭窗口或按Ctrl+C
4. 重新启动时，再次运行此脚本即可

"@ -ForegroundColor Cyan

if ($nllbReady -and $mainReady) {
    Write-Host "🎯 所有服务已就绪！现在可以开始使用Transly翻译服务了。" -ForegroundColor Green
    
    # 询问是否打开浏览器
    $openBrowser = Read-Host "是否打开浏览器访问翻译界面？(y/n)"
    if ($openBrowser -eq "y" -or $openBrowser -eq "Y" -or $openBrowser -eq "") {
        Start-Process "http://localhost:3000/text-translate"
    }
} else {
    Write-Host "⚠️ 部分服务启动失败，请检查错误信息并重试。" -ForegroundColor Yellow
}

Write-Host "`n按任意键关闭此窗口..." -ForegroundColor Gray
Read-Host 