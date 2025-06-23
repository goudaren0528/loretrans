# Simple NLLB Startup Script
# Avoid encoding issues by using only English

Write-Host "Starting NLLB Translation Service..." -ForegroundColor Green

# Get current path
$currentPath = Get-Location

# Check if .env file exists, if not create it
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    Copy-Item "env.example" ".env"
    
    # Update .env file for local NLLB service
    $envContent = Get-Content ".env" -Raw
    $envContent = $envContent -replace "NLLB_LOCAL_ENABLED=false", "NLLB_LOCAL_ENABLED=true"
    $envContent = $envContent -replace "NLLB_LOCAL_URL=http://localhost:8080", "NLLB_LOCAL_URL=http://localhost:8081"
    $envContent = $envContent -replace "USE_MOCK_TRANSLATION=true", "USE_MOCK_TRANSLATION=false"
    Set-Content ".env" $envContent -Encoding UTF8
    Write-Host "Environment file created and configured." -ForegroundColor Green
} else {
    Write-Host "Environment file exists." -ForegroundColor Green
}

# Check dependencies
Write-Host "Checking NLLB service dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "microservices\nllb-local\node_modules")) {
    Write-Host "Installing NLLB dependencies..." -ForegroundColor Yellow
    Set-Location "microservices\nllb-local"
    npm install
    Set-Location "..\..\"
}

Write-Host "Checking main service dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing main service dependencies..." -ForegroundColor Yellow
    npm install
}

# Start NLLB service in new window
Write-Host "Starting NLLB Local Service on port 8081..." -ForegroundColor Yellow
$nllbJob = Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$currentPath\microservices\nllb-local'; Write-Host 'NLLB Service Starting...' -ForegroundColor Green; npm start"
) -PassThru

# Wait for NLLB service to start
Start-Sleep -Seconds 10

# Check NLLB service health
Write-Host "Checking NLLB service status..." -ForegroundColor Yellow
$nllbReady = $false
$maxRetries = 10
$retryCount = 0

while ($retryCount -lt $maxRetries -and -not $nllbReady) {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8081/health" -TimeoutSec 3 -ErrorAction Stop
        if ($response.status -eq "ok") {
            Write-Host "NLLB Service is ready!" -ForegroundColor Green
            Write-Host "Status: $($response.status)" -ForegroundColor Gray
            $nllbReady = $true
        }
    } catch {
        $retryCount++
        Write-Host "Waiting for NLLB service... ($retryCount/$maxRetries)" -ForegroundColor Yellow
        Start-Sleep -Seconds 3
    }
}

if (-not $nllbReady) {
    Write-Host "NLLB service failed to start or timeout" -ForegroundColor Red
    Write-Host "Check the NLLB service window for errors" -ForegroundColor Yellow
}

# Start main service in new window
Write-Host "Starting Transly Main Service on port 3000..." -ForegroundColor Yellow
$mainJob = Start-Process powershell -ArgumentList @(
    "-NoExit", 
    "-Command",
    "cd '$currentPath'; Write-Host 'Main Service Starting...' -ForegroundColor Green; npm run dev"
) -PassThru

# Wait for main service to start
Start-Sleep -Seconds 8

# Check main service health
Write-Host "Checking main service status..." -ForegroundColor Yellow
$mainReady = $false
$mainRetries = 8
$mainRetryCount = 0

while ($mainRetryCount -lt $mainRetries -and -not $mainReady) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 3 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "Main Service is ready!" -ForegroundColor Green
            $mainReady = $true
        }
    } catch {
        $mainRetryCount++
        Write-Host "Waiting for main service... ($mainRetryCount/$mainRetries)" -ForegroundColor Yellow
        Start-Sleep -Seconds 3
    }
}

# Show results
Write-Host ""
Write-Host "=== SERVICE STATUS ===" -ForegroundColor Green
Write-Host ""

if ($nllbReady) {
    Write-Host "NLLB Service: RUNNING (http://localhost:8081)" -ForegroundColor Green
} else {
    Write-Host "NLLB Service: FAILED" -ForegroundColor Red
}

if ($mainReady) {
    Write-Host "Main Service: RUNNING (http://localhost:3000)" -ForegroundColor Green
} else {
    Write-Host "Main Service: FAILED" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== ACCESS LINKS ===" -ForegroundColor Cyan
Write-Host "Translation Interface: http://localhost:3000/text-translate"
Write-Host "Creole Translator: http://localhost:3000/creole-to-english"
Write-Host "Lao Translator: http://localhost:3000/lao-to-english"
Write-Host "API Health Check: http://localhost:8081/health"
Write-Host ""

if ($nllbReady -and $mainReady) {
    Write-Host "All services ready! Translation should now work properly." -ForegroundColor Green
    
    # Test API
    Write-Host "Testing translation API..." -ForegroundColor Yellow
    try {
        $testResult = Invoke-RestMethod -Uri "http://localhost:3000/api/translate" -Method Post -ContentType "application/json" -Body '{"text":"Bonjou","sourceLanguage":"ht","targetLanguage":"en"}'
        Write-Host "API Test Result: $($testResult.data.translatedText)" -ForegroundColor Green
        Write-Host "Translation Method: $($testResult.data.method)" -ForegroundColor Gray
    } catch {
        Write-Host "API Test Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    $openBrowser = Read-Host "Open browser to test translation? (y/n)"
    if ($openBrowser -eq "y" -or $openBrowser -eq "Y" -or $openBrowser -eq "") {
        Start-Process "http://localhost:3000/creole-to-english"
    }
} else {
    Write-Host "Some services failed to start. Check the error messages above." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Gray
Read-Host 