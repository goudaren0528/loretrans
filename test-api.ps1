# Simple API Test Script
Write-Host "Testing NLLB API..." -ForegroundColor Yellow

try {
    $requestBody = @{
        text = "Bonjou"
        sourceLanguage = "ht"
        targetLanguage = "en"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:8081/translate" -Method Post -ContentType "application/json" -Body $requestBody -TimeoutSec 15

    Write-Host "API Response:" -ForegroundColor Green
    Write-Host "  Text: $($response.translatedText)" -ForegroundColor White
    Write-Host "  Source: $($response.sourceLanguage)" -ForegroundColor White
    Write-Host "  Target: $($response.targetLanguage)" -ForegroundColor White
    Write-Host "  Method: $($response.method)" -ForegroundColor White
    Write-Host "  Time: $($response.processingTime)ms" -ForegroundColor White

    if ($response.translatedText -eq "Hello") {
        Write-Host "SUCCESS: Translation working correctly!" -ForegroundColor Green
    } elseif ($response.translatedText -eq "Bonjou") {
        Write-Host "ISSUE: Still returning original text" -ForegroundColor Red
    } else {
        Write-Host "INFO: Got different result: $($response.translatedText)" -ForegroundColor Yellow
    }

} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
Read-Host 