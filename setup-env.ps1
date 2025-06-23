# Environment Setup Script for PolyTrans
Write-Host "=== PolyTrans Environment Setup ===" -ForegroundColor Cyan
Write-Host ""

# 检查当前目录
$currentDir = Get-Location
Write-Host "Current directory: $currentDir" -ForegroundColor Gray

# 创建根目录的.env文件
Write-Host "1. Creating root .env file..." -ForegroundColor Yellow

$rootEnvContent = @"
# 应用基础配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Hugging Face API配置
HUGGINGFACE_API_KEY=
HUGGINGFACE_API_URL=https://api-inference.huggingface.co/models
NLLB_MODEL=facebook/nllb-200-distilled-600M
NLLB_MAX_LENGTH=1000
NLLB_TEMPERATURE=0.3
NLLB_TIMEOUT=30000

# Vercel KV (Redis) 配置
KV_REST_API_URL=
KV_REST_API_TOKEN=
CACHE_TTL=3600
CACHE_MAX_SIZE=1000

# MongoDB 配置 (可选)
MONGODB_URI=
MONGODB_DB_NAME=transly

# 文件处理配置
FILE_MAX_SIZE=52428800
FILE_MAX_PAGES=100
FILE_UPLOAD_PATH=/tmp/uploads
FILE_SERVICE_URL=http://localhost:8000
FILE_SERVICE_SECRET=dev-secret-key
FILE_SERVICE_TIMEOUT=60000

# TTS 服务配置
TTS_PROVIDER=edge-speech
TTS_VOICE=en-US-AriaNeural
TTS_RATE=1.0
TTS_PITCH=1.0

# 邮件服务配置
EMAIL_PROVIDER=resend
RESEND_API_KEY=
EMAIL_FROM=noreply@transly.app

# 支付服务配置
CREEM_API_KEY=
CREEM_WEBHOOK_SECRET=

# 限流配置
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# 安全配置
JWT_SECRET=your-jwt-secret-key
ENCRYPTION_KEY=your-encryption-key

# 开发/调试配置
DEBUG=false
LOG_LEVEL=info

# NLLB Local Service (本地NLLB服务配置) - 修正端口为8081
NLLB_LOCAL_ENABLED=true
NLLB_LOCAL_URL=http://localhost:8081
NLLB_LOCAL_FALLBACK=true
NLLB_LOCAL_TIMEOUT=30000

# Development - 确保不使用mock模式
USE_MOCK_TRANSLATION=false
"@

try {
    Set-Content ".env" $rootEnvContent -Encoding UTF8
    Write-Host "✅ Root .env file created successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to create root .env file: $($_.Exception.Message)" -ForegroundColor Red
}

# 创建frontend目录的.env.local文件
Write-Host "2. Creating frontend .env.local file..." -ForegroundColor Yellow

$frontendEnvContent = @"
# .env.local - Next.js优先级最高的环境变量文件
# 本地开发配置 - 确保NLLB服务正确工作

USE_MOCK_TRANSLATION=false
NLLB_LOCAL_ENABLED=true
NLLB_LOCAL_URL=http://localhost:8081
NLLB_LOCAL_FALLBACK=true
NLLB_LOCAL_TIMEOUT=30000

# 应用配置
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 调试配置
DEBUG=true
LOG_LEVEL=debug
"@

try {
    Set-Content "frontend/.env.local" $frontendEnvContent -Encoding UTF8
    Write-Host "✅ Frontend .env.local file created successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to create frontend .env.local file: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "3. Verification..." -ForegroundColor Yellow

# 验证文件是否创建成功
if (Test-Path ".env") {
    Write-Host "✅ Root .env file exists" -ForegroundColor Green
} else {
    Write-Host "❌ Root .env file missing" -ForegroundColor Red
}

if (Test-Path "frontend/.env.local") {
    Write-Host "✅ Frontend .env.local file exists" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend .env.local file missing" -ForegroundColor Red
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