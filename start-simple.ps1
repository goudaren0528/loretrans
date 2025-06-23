# Simple NLLB Startup Script with File Processor
# Avoid encoding issues by using only English

Write-Host "Starting Transly Complete Service Suite..." -ForegroundColor Green

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

# Check dependencies for all services
Write-Host "Checking service dependencies..." -ForegroundColor Yellow

# NLLB service dependencies
if (-not (Test-Path "microservices\nllb-local\node_modules")) {
    Write-Host "Installing NLLB dependencies..." -ForegroundColor Yellow
    Set-Location "microservices\nllb-local"
    npm install
    Set-Location "..\..\"
}

# File processor dependencies
if (-not (Test-Path "microservices\file-processor\node_modules")) {
    Write-Host "Installing File Processor dependencies..." -ForegroundColor Yellow
    Set-Location "microservices\file-processor"
    npm install
    Set-Location "..\..\"
}

# Main service dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing main service dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "All dependencies checked." -ForegroundColor Green

# Start NLLB service in new window
Write-Host "Starting NLLB Local Service on port 8081..." -ForegroundColor Yellow
$nllbJob = Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$currentPath\microservices\nllb-local'; Write-Host 'NLLB Service Starting...' -ForegroundColor Green; npm start"
) -PassThru

# Wait for NLLB service to start
Start-Sleep -Seconds 8

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

# Start File Processor service in new window
Write-Host "Starting File Processor Service on port 3010..." -ForegroundColor Yellow
$fileJob = Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$currentPath\microservices\file-processor'; Write-Host 'File Processor Service Starting...' -ForegroundColor Green; npm start"
) -PassThru

# Wait for File Processor service to start
Start-Sleep -Seconds 5

# Check File Processor service health
Write-Host "Checking File Processor service status..." -ForegroundColor Yellow
$fileReady = $false
$fileRetries = 8
$fileRetryCount = 0

while ($fileRetryCount -lt $fileRetries -and -not $fileReady) {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3010/health" -TimeoutSec 3 -ErrorAction Stop
        if ($response.status -eq "healthy") {
            Write-Host "File Processor Service is ready!" -ForegroundColor Green
            Write-Host "Status: $($response.status)" -ForegroundColor Gray
            $fileReady = $true
        }
    } catch {
        $fileRetryCount++
        Write-Host "Waiting for File Processor service... ($fileRetryCount/$fileRetries)" -ForegroundColor Yellow
        Start-Sleep -Seconds 3
    }
}

if (-not $fileReady) {
    Write-Host "File Processor service failed to start or timeout" -ForegroundColor Red
    Write-Host "Check the File Processor service window for errors" -ForegroundColor Yellow
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

if ($fileReady) {
    Write-Host "File Processor: RUNNING (http://localhost:3010)" -ForegroundColor Green
} else {
    Write-Host "File Processor: FAILED" -ForegroundColor Red
}

if ($mainReady) {
    Write-Host "Main Service: RUNNING (http://localhost:3000)" -ForegroundColor Green
} else {
    Write-Host "Main Service: FAILED" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== ACCESS LINKS ===" -ForegroundColor Cyan
Write-Host "Translation Interface: http://localhost:3000/text-translate"
Write-Host "Document Translation: http://localhost:3000/document-translate"
Write-Host "Creole Translator: http://localhost:3000/creole-to-english"
Write-Host "Lao Translator: http://localhost:3000/lao-to-english"
Write-Host "Chinese Translator: http://localhost:3000" 
Write-Host ""
Write-Host "=== API ENDPOINTS ===" -ForegroundColor Cyan
Write-Host "NLLB Health: http://localhost:8081/health"
Write-Host "File Processor Health: http://localhost:3010/health"
Write-Host "Main API Health: http://localhost:3000/api/health"
Write-Host ""

if ($nllbReady -and $fileReady -and $mainReady) {
    Write-Host "All services ready! Text and document translation available." -ForegroundColor Green
    
    # Test APIs
    Write-Host "Testing services..." -ForegroundColor Yellow
    
    # Test text translation API
    try {
        $testResult = Invoke-RestMethod -Uri "http://localhost:3000/api/translate" -Method Post -ContentType "application/json" -Body '{"text":"Bonjou","sourceLanguage":"ht","targetLanguage":"en"}'
        Write-Host "Text Translation API: WORKING" -ForegroundColor Green
        Write-Host "  Test Result: $($testResult.data.translatedText)" -ForegroundColor Gray
        Write-Host "  Method: $($testResult.data.method)" -ForegroundColor Gray
    } catch {
        Write-Host "Text Translation API: FAILED - $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Test file processor API
    try {
        $fileTest = Invoke-RestMethod -Uri "http://localhost:3010/health" -TimeoutSec 3
        Write-Host "File Processor API: WORKING" -ForegroundColor Green
        Write-Host "  Service: $($fileTest.service)" -ForegroundColor Gray
        Write-Host "  Memory Used: $($fileTest.memory.used)MB" -ForegroundColor Gray
    } catch {
        Write-Host "File Processor API: FAILED - $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    $openBrowser = Read-Host "Open browser to test translation? (y/n)"
    if ($openBrowser -eq "y" -or $openBrowser -eq "Y" -or $openBrowser -eq "") {
        Start-Process "http://localhost:3000/document-translate"
    }
} else {
    Write-Host "Some services failed to start. Check the error messages above." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Services needed for full functionality:" -ForegroundColor Yellow
    Write-Host "- NLLB Service (text translation)" -ForegroundColor Gray
    Write-Host "- File Processor (document translation)" -ForegroundColor Gray  
    Write-Host "- Main Service (web interface)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Gray
Read-Host 