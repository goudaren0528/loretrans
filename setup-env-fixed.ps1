# Environment Setup Script for PolyTrans (Fixed Encoding)
Write-Host "=== PolyTrans Environment Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check current directory
$currentDir = Get-Location
Write-Host "Current directory: $currentDir" -ForegroundColor Gray

# Create root .env file
Write-Host "1. Creating root .env file..." -ForegroundColor Yellow

$rootEnvContent = @"
# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Hugging Face API Configuration
HUGGINGFACE_API_KEY=
HUGGINGFACE_API_URL=https://api-inference.huggingface.co/models
NLLB_MODEL=facebook/nllb-200-distilled-600M
NLLB_MAX_LENGTH=1000
NLLB_TEMPERATURE=0.3
NLLB_TIMEOUT=30000

# Vercel KV (Redis) Configuration
KV_REST_API_URL=
KV_REST_API_TOKEN=
CACHE_TTL=3600
CACHE_MAX_SIZE=1000

# MongoDB Configuration (Optional)
MONGODB_URI=
MONGODB_DB_NAME=transly

# File Processing Configuration
FILE_MAX_SIZE=52428800
FILE_MAX_PAGES=100
FILE_UPLOAD_PATH=/tmp/uploads
FILE_SERVICE_URL=http://localhost:8000
FILE_SERVICE_SECRET=dev-secret-key
FILE_SERVICE_TIMEOUT=60000

# TTS Service Configuration
TTS_PROVIDER=edge-speech
TTS_VOICE=en-US-AriaNeural
TTS_RATE=1.0
TTS_PITCH=1.0

# Email Service Configuration
EMAIL_PROVIDER=resend
RESEND_API_KEY=
EMAIL_FROM=noreply@transly.app

# Payment Service Configuration
CREEM_API_KEY=
CREEM_WEBHOOK_SECRET=

# Rate Limiting Configuration
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Security Configuration
JWT_SECRET=your-jwt-secret-key
ENCRYPTION_KEY=your-encryption-key

# Development/Debug Configuration
DEBUG=false
LOG_LEVEL=info

# NLLB Local Service Configuration - Fixed port to 8081
NLLB_LOCAL_ENABLED=true
NLLB_LOCAL_URL=http://localhost:8081
NLLB_LOCAL_FALLBACK=true
NLLB_LOCAL_TIMEOUT=30000

# Development - Ensure not using mock mode
USE_MOCK_TRANSLATION=false
"@

try {
    $rootEnvContent | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "SUCCESS: Root .env file created successfully" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to create root .env file: $($_.Exception.Message)" -ForegroundColor Red
}

# Create frontend .env.local file
Write-Host "2. Creating frontend .env.local file..." -ForegroundColor Yellow

$frontendEnvContent = @"
# .env.local - Next.js highest priority environment variables
# Local development configuration - Ensure NLLB service works correctly

USE_MOCK_TRANSLATION=false
NLLB_LOCAL_ENABLED=true
NLLB_LOCAL_URL=http://localhost:8081
NLLB_LOCAL_FALLBACK=true
NLLB_LOCAL_TIMEOUT=30000

# Application Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Debug Configuration
DEBUG=true
LOG_LEVEL=debug
"@

try {
    $frontendEnvContent | Out-File -FilePath "frontend/.env.local" -Encoding UTF8
    Write-Host "SUCCESS: Frontend .env.local file created successfully" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to create frontend .env.local file: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "3. Verification..." -ForegroundColor Yellow

# Verify files were created successfully
if (Test-Path ".env") {
    Write-Host "SUCCESS: Root .env file exists" -ForegroundColor Green
} else {
    Write-Host "ERROR: Root .env file missing" -ForegroundColor Red
}

if (Test-Path "frontend/.env.local") {
    Write-Host "SUCCESS: Frontend .env.local file exists" -ForegroundColor Green
} else {
    Write-Host "ERROR: Frontend .env.local file missing" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== NEXT STEPS ===" -ForegroundColor Cyan
Write-Host "1. Restart your main service (Stop and start npm run dev)" -ForegroundColor White
Write-Host "2. Test the translation at: http://localhost:3000/creole-to-english" -ForegroundColor White
Write-Host "3. Check the browser console for any debug messages" -ForegroundColor White
Write-Host ""
Write-Host "If issues persist, run .\debug-config.ps1 for detailed diagnosis" -ForegroundColor Gray

Write-Host ""
Write-Host "Environment setup complete!" -ForegroundColor Green

# Quick test of translation API
Write-Host ""
Write-Host "=== QUICK API TEST ===" -ForegroundColor Cyan
Write-Host "Testing if NLLB service is accessible..." -ForegroundColor Yellow

try {
    $testResponse = Invoke-RestMethod -Uri "http://localhost:8081/health" -TimeoutSec 3
    Write-Host "NLLB Service Status: $($testResponse.status)" -ForegroundColor Green
    Write-Host "Model Loaded: $($testResponse.model_loaded)" -ForegroundColor Green
} catch {
    Write-Host "WARNING: NLLB service not accessible: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "Make sure NLLB service is running before testing translation." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
Read-Host 