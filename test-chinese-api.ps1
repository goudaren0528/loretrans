Write-Host "🧪 测试中文翻译API" -ForegroundColor Green
Write-Host "=" * 40

# 等待服务启动
Write-Host "等待前端服务启动..." -ForegroundColor Yellow
Start-Sleep 5

# 测试健康检查
Write-Host "1. 测试健康检查..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method Get
    Write-Host "✅ 服务运行正常" -ForegroundColor Green
} catch {
    Write-Host "❌ 服务不可用: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 测试语言检测
Write-Host "`n2. 测试语言检测..." -ForegroundColor Yellow
$detectBody = @{ 
    text = "这是一个中文测试。我们正在测试语言检测功能。" 
} | ConvertTo-Json

try {
    $detectResult = Invoke-RestMethod -Uri "http://localhost:3000/api/detect" -Method Post -ContentType "application/json" -Body $detectBody
    Write-Host "✅ 语言检测成功" -ForegroundColor Green
    Write-Host "  检测语言: $($detectResult.language)" -ForegroundColor Cyan
    Write-Host "  置信度: $($detectResult.confidence)" -ForegroundColor Cyan
    Write-Host "  语言名称: $($detectResult.languageName)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ 语言检测失败: $($_.Exception.Message)" -ForegroundColor Red
}

# 测试翻译
Write-Host "`n3. 测试中文到英文翻译..." -ForegroundColor Yellow
$translateBody = @{
    text = "你好世界！这是一个中文翻译测试。"
    sourceLanguage = "zh"
    targetLanguage = "en"
} | ConvertTo-Json

try {
    $translateResult = Invoke-RestMethod -Uri "http://localhost:3000/api/translate" -Method Post -ContentType "application/json" -Body $translateBody
    Write-Host "✅ 翻译成功" -ForegroundColor Green
    Write-Host "  原文: $($translateResult.originalText)" -ForegroundColor Cyan
    Write-Host "  译文: $($translateResult.translatedText)" -ForegroundColor Cyan
    Write-Host "  方法: $($translateResult.method)" -ForegroundColor Cyan
    Write-Host "  处理时间: $($translateResult.processingTime)ms" -ForegroundColor Cyan
} catch {
    Write-Host "❌ 翻译失败: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "错误详情:" -ForegroundColor Red
    Write-Host $_.Exception -ForegroundColor Red
}

Write-Host "`n🎉 测试完成!" -ForegroundColor Green 