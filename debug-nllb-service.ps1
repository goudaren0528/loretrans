Write-Host "NLLB Service Debug Script" -ForegroundColor Green
Write-Host "=" * 40

# Test 1: Check if Python is available
Write-Host "1. Checking Python environment..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "  Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "  Python: NOT FOUND" -ForegroundColor Red
    Write-Host "  Please install Python 3.7+ and ensure it's in PATH" -ForegroundColor Yellow
    exit 1
}

# Test 2: Check Python dependencies
Write-Host "`n2. Checking Python dependencies..." -ForegroundColor Yellow
try {
    $transformersCheck = python -c "import transformers; print('transformers:', transformers.__version__)" 2>&1
    Write-Host "  $transformersCheck" -ForegroundColor Green
} catch {
    Write-Host "  transformers: NOT FOUND" -ForegroundColor Red
}

try {
    $torchCheck = python -c "import torch; print('torch:', torch.__version__)" 2>&1
    Write-Host "  $torchCheck" -ForegroundColor Green
} catch {
    Write-Host "  torch: NOT FOUND" -ForegroundColor Red
}

# Test 3: Check model directory
Write-Host "`n3. Checking NLLB model..." -ForegroundColor Yellow
$modelPath = "microservices\nllb-local\models\nllb-600m"
if (Test-Path $modelPath) {
    $modelFiles = Get-ChildItem $modelPath | Measure-Object
    Write-Host "  Model directory exists: $($modelFiles.Count) files" -ForegroundColor Green
} else {
    Write-Host "  Model directory: NOT FOUND" -ForegroundColor Red
    Write-Host "  Run: npm run download-model" -ForegroundColor Yellow
}

# Test 4: Check NLLB service status
Write-Host "`n4. Checking NLLB service..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8081/health" -TimeoutSec 5
    Write-Host "  NLLB Service: RUNNING" -ForegroundColor Green
    Write-Host "  Status: $($response.status)" -ForegroundColor Cyan
    Write-Host "  Model loaded: $($response.modelLoaded)" -ForegroundColor Cyan
} catch {
    Write-Host "  NLLB Service: NOT RUNNING" -ForegroundColor Red
    Write-Host "  Start with: npm start (in microservices/nllb-local)" -ForegroundColor Yellow
}

# Test 5: Test direct Python translation script
Write-Host "`n5. Testing Python translation script..." -ForegroundColor Yellow
$scriptPath = "microservices\nllb-local\scripts\translate.py"
if (Test-Path $scriptPath) {
    Write-Host "  Script exists: $scriptPath" -ForegroundColor Green
    try {
        $result = python $scriptPath "Hello" "eng_Latn" "zho_Hans" 2>&1
        Write-Host "  Test result: $result" -ForegroundColor Cyan
    } catch {
        Write-Host "  Script test failed: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "  Translation script: NOT FOUND" -ForegroundColor Red
}

Write-Host "`nDebug completed!" -ForegroundColor Green 