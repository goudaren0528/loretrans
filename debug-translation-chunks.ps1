Write-Host "Translation Chunks Debug" -ForegroundColor Green
Write-Host "=" * 40

# 读取测试文档
$testText = Get-Content "chinese-test.txt" -Raw

Write-Host "Original Text Length: $($testText.Length)" -ForegroundColor Yellow
Write-Host "Original Text:" -ForegroundColor Cyan
Write-Host $testText
Write-Host ""

# 测试直接翻译API
Write-Host "Testing Direct Translation API..." -ForegroundColor Yellow
$body = @{
    text = $testText
    sourceLanguage = "zh"
    targetLanguage = "en"
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/translate" -Method Post -ContentType "application/json" -Body $body
    Write-Host "Direct API Translation Success!" -ForegroundColor Green
    Write-Host "Translated Text Length: $($response.data.translatedText.Length)" -ForegroundColor Yellow
    Write-Host "Translated Text:" -ForegroundColor Cyan
    Write-Host $response.data.translatedText
    Write-Host ""
    Write-Host "Method: $($response.data.method)" -ForegroundColor Gray
    Write-Host "Processing Time: $($response.data.processingTime)ms" -ForegroundColor Gray
} catch {
    Write-Host "Direct API Translation Failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Debug completed!" -ForegroundColor Green 