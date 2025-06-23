# Fix Environment Variables Script
Write-Host "Fixing environment configuration for NLLB translation..." -ForegroundColor Yellow

# Manually create .env file with correct configuration
$envContent = @"
# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# NLLB Local Service Configuration
NLLB_LOCAL_ENABLED=true
NLLB_LOCAL_URL=http://localhost:8081
NLLB_LOCAL_FALLBACK=true
NLLB_LOCAL_TIMEOUT=30000

# Disable Mock Translation - IMPORTANT!
USE_MOCK_TRANSLATION=false

# Hugging Face API (backup)
HUGGINGFACE_API_KEY=
HUGGINGFACE_API_URL=https://api-inference.huggingface.co/models
NLLB_MODEL=facebook/nllb-200-distilled-600M
NLLB_MAX_LENGTH=1000
NLLB_TEMPERATURE=0.3
NLLB_TIMEOUT=30000

# Other configurations
CACHE_TTL=3600
CACHE_MAX_SIZE=1000
FILE_MAX_SIZE=52428800
FILE_MAX_PAGES=100
FILE_UPLOAD_PATH=/tmp/uploads
FILE_SERVICE_URL=http://localhost:8000
FILE_SERVICE_SECRET=dev-secret-key
FILE_SERVICE_TIMEOUT=60000

# TTS Configuration
TTS_PROVIDER=edge-speech
TTS_VOICE=en-US-AriaNeural
TTS_RATE=1.0
TTS_PITCH=1.0

# Security
JWT_SECRET=your-jwt-secret-key
ENCRYPTION_KEY=your-encryption-key

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Debug
DEBUG=false
LOG_LEVEL=info
"@

# Write .env file
Set-Content ".env" $envContent -Encoding UTF8
Write-Host ".env file created with correct configuration" -ForegroundColor Green

# Display current configuration
Write-Host ""
Write-Host "=== ENVIRONMENT CONFIGURATION ===" -ForegroundColor Cyan
Write-Host "NLLB_LOCAL_ENABLED: true"
Write-Host "NLLB_LOCAL_URL: http://localhost:8081"
Write-Host "USE_MOCK_TRANSLATION: false"
Write-Host ""

# Check NLLB service status
Write-Host "Checking NLLB service status..." -ForegroundColor Yellow
try {
    $nllbResponse = Invoke-RestMethod -Uri "http://localhost:8081/health" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "NLLB Service Status: $($nllbResponse.status)" -ForegroundColor Green
    Write-Host "Model Loaded: $($nllbResponse.model_loaded)" -ForegroundColor Green
} catch {
    Write-Host "NLLB Service is not running! Please start it first." -ForegroundColor Red
    Write-Host "Run: cd microservices\nllb-local && npm start" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Environment fixed! Now restart the main service:" -ForegroundColor Green
Write-Host "1. Stop the current npm run dev process (Ctrl+C)"
Write-Host "2. Run: npm run dev"
Write-Host ""
Write-Host "After restart, test translation at: http://localhost:3000/creole-to-english"

# Test API after environment fix
Write-Host ""
Write-Host "Testing translation API with new configuration..." -ForegroundColor Yellow
try {
    $testResult = Invoke-RestMethod -Uri "http://localhost:3000/api/translate" -Method Post -ContentType "application/json" -Body '{"text":"Bonjou","sourceLanguage":"ht","targetLanguage":"en"}'
    Write-Host "Current API Test Result: $($testResult.data.translatedText)" -ForegroundColor Cyan
    Write-Host "Current Translation Method: $($testResult.data.method)" -ForegroundColor Cyan
    
    if ($testResult.data.method -eq "mock") {
        Write-Host ""
        Write-Host "WARNING: Still using mock mode!" -ForegroundColor Red
        Write-Host "You MUST restart the main service (npm run dev) for env changes to take effect!" -ForegroundColor Yellow
    } else {
        Write-Host ""
        Write-Host "SUCCESS: Using real translation service!" -ForegroundColor Green
    }
} catch {
    Write-Host "API Test Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure the main service is running on port 3000" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
Read-Host 