Write-Host "Testing Translation API Directly" -ForegroundColor Green

$body = @{
    text = "这是一个测试"
    sourceLanguage = "zh"
    targetLanguage = "en"
} | ConvertTo-Json

Write-Host "Request Body: $body" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/translate" -Method Post -ContentType "application/json" -Body $body
    Write-Host "Success!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Cyan
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
} 