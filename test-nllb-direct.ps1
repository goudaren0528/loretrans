# Direct NLLB Python Test Script
Write-Host "=== Direct NLLB Translation Test ===" -ForegroundColor Cyan
Write-Host ""

$scriptPath = "microservices\nllb-local\scripts\translate.py"
$modelPath = "microservices\nllb-local\models\nllb-600m"

# Check if Python script exists
Write-Host "1. Checking Python script..." -ForegroundColor Yellow
if (Test-Path $scriptPath) {
    Write-Host "✅ Python script exists: $scriptPath" -ForegroundColor Green
} else {
    Write-Host "❌ Python script missing: $scriptPath" -ForegroundColor Red
    Write-Host "Creating the script..." -ForegroundColor Yellow
    
    # Create the script directory if it doesn't exist
    $scriptDir = Split-Path $scriptPath
    if (!(Test-Path $scriptDir)) {
        New-Item -ItemType Directory -Path $scriptDir -Force | Out-Null
    }
    
    # Copy the script content from the service
    Write-Host "Script will be created by the NLLB service when it initializes." -ForegroundColor Gray
}

# Check if model exists
Write-Host ""
Write-Host "2. Checking NLLB model..." -ForegroundColor Yellow
if (Test-Path $modelPath) {
    Write-Host "✅ Model exists: $modelPath" -ForegroundColor Green
    $modelFiles = Get-ChildItem $modelPath -File | Select-Object -First 5
    Write-Host "Model files:" -ForegroundColor Gray
    foreach ($file in $modelFiles) {
        Write-Host "  - $($file.Name)" -ForegroundColor White
    }
} else {
    Write-Host "❌ Model missing: $modelPath" -ForegroundColor Red
    Write-Host "Run 'npm run download-model' in microservices/nllb-local directory" -ForegroundColor Yellow
}

# Check Python environment
Write-Host ""
Write-Host "3. Checking Python environment..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python version: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found or not accessible" -ForegroundColor Red
}

# Test Python dependencies
Write-Host ""
Write-Host "4. Testing Python dependencies..." -ForegroundColor Yellow
$testScript = @"
try:
    import torch
    print(f"PyTorch: {torch.__version__}")
    print(f"CUDA available: {torch.cuda.is_available()}")
except ImportError:
    print("ERROR: PyTorch not installed")

try:
    from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
    print("Transformers: OK")
except ImportError:
    print("ERROR: Transformers not installed")

try:
    import json
    print("JSON: OK")
except ImportError:
    print("ERROR: JSON not available")
"@

$testScript | python 2>&1

Write-Host ""
Write-Host "5. Testing simple translation call..." -ForegroundColor Yellow

if (Test-Path $scriptPath) {
    Write-Host "Testing: python $scriptPath 'Bonjou' 'hat_Latn' 'eng_Latn'" -ForegroundColor Gray
    
    try {
        $result = python $scriptPath 'Bonjou' 'hat_Latn' 'eng_Latn' 2>&1
        Write-Host "Python output:" -ForegroundColor White
        Write-Host $result -ForegroundColor Yellow
        
        # Try to parse as JSON
        try {
            $jsonResult = $result | ConvertFrom-Json
            if ($jsonResult.translatedText) {
                Write-Host "✅ Translation result: $($jsonResult.translatedText)" -ForegroundColor Green
            } elseif ($jsonResult.error) {
                Write-Host "❌ Translation error: $($jsonResult.error)" -ForegroundColor Red
            }
        } catch {
            Write-Host "⚠️  Could not parse as JSON" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "❌ Python script execution failed: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Cannot test - Python script not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Alternative Solutions ===" -ForegroundColor Cyan

Write-Host ""
Write-Host "If NLLB local is having issues, you can:" -ForegroundColor White
Write-Host "1. Use Hugging Face API instead (add HUGGINGFACE_API_KEY to .env)" -ForegroundColor Gray
Write-Host "2. Fix the local NLLB setup by reinstalling dependencies" -ForegroundColor Gray
Write-Host "3. Use a different translation approach" -ForegroundColor Gray

Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
Read-Host 