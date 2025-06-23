# Configuration Debug and Fix Script
Write-Host "=== TRANSLATION SERVICE CONFIGURATION DIAGNOSIS ===" -ForegroundColor Cyan
Write-Host ""

# Check .env file
Write-Host "1. CHECKING .ENV FILE:" -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✅ .env file exists" -ForegroundColor Green
    $envContent = Get-Content ".env" -Raw
    
    Write-Host ""
    Write-Host "Key environment variables:" -ForegroundColor Gray
    $envContent | Select-String "USE_MOCK_TRANSLATION" | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
    $envContent | Select-String "NLLB_LOCAL_ENABLED" | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
    $envContent | Select-String "NLLB_LOCAL_URL" | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
    $envContent | Select-String "NODE_ENV" | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
} else {
    Write-Host "❌ .env file missing!" -ForegroundColor Red
}

Write-Host ""

# Check NLLB service
Write-Host "2. CHECKING NLLB SERVICE:" -ForegroundColor Yellow
try {
    $nllbResponse = Invoke-RestMethod -Uri "http://localhost:8081/health" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✅ NLLB Service Status: $($nllbResponse.status)" -ForegroundColor Green
    Write-Host "✅ Model Loaded: $($nllbResponse.model_loaded)" -ForegroundColor Green
} catch {
    Write-Host "❌ NLLB Service not accessible: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Check main service
Write-Host "3. CHECKING MAIN SERVICE:" -ForegroundColor Yellow
try {
    $mainResponse = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✅ Main Service Status: $($mainResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Main Service not accessible: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test translation API
Write-Host "4. TESTING TRANSLATION API:" -ForegroundColor Yellow
try {
    $testResult = Invoke-RestMethod -Uri "http://localhost:3000/api/translate" -Method Post -ContentType "application/json" -Body '{"text":"Bonjou","sourceLanguage":"ht","targetLanguage":"en"}'
    Write-Host "Result: $($testResult.data.translatedText)" -ForegroundColor White
    
    if ($testResult.data.method -eq "mock") {
        Write-Host "❌ Still using MOCK mode!" -ForegroundColor Red
    } elseif ($testResult.data.method -eq "nllb-local") {
        Write-Host "✅ Using NLLB Local service!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Using: $($testResult.data.method)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Translation API test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== SOLUTION OPTIONS ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "OPTION 1: Force Environment Variables (Immediate Fix)" -ForegroundColor Green
Write-Host "This modifies the translation service directly to bypass environment variables:"
Write-Host ""
$choice1 = Read-Host "Apply Option 1? (y/n)"

if ($choice1 -eq "y" -or $choice1 -eq "Y") {
    Write-Host "Applying direct code fix..." -ForegroundColor Yellow
    
    # Create a patch for shouldUseMockMode function
    $patchContent = @"
/**
 * 检查是否应该使用mock模式 - FORCED NLLB MODE
 */
function shouldUseMockMode(): boolean {
  // HARDCODED: Always use NLLB local service if available
  console.log('DEBUG: Force using NLLB local service mode');
  return false; // Never use mock mode
}
"@
    
    Write-Host "Option 1 would require manual code modification." -ForegroundColor Yellow
    Write-Host "Let's try Option 2 instead..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "OPTION 2: Create next.config.js Environment Override" -ForegroundColor Green
Write-Host "This ensures environment variables are properly loaded:"
Write-Host ""
$choice2 = Read-Host "Apply Option 2? (y/n)"

if ($choice2 -eq "y" -or $choice2 -eq "Y") {
    Write-Host "Creating next.config.js with environment override..." -ForegroundColor Yellow
    
    # Check if next.config.js exists
    $nextConfigPath = "frontend/next.config.js"
    if (Test-Path $nextConfigPath) {
        Write-Host "Backing up existing next.config.js..." -ForegroundColor Gray
        Copy-Item $nextConfigPath "$nextConfigPath.backup"
    }
    
    $nextConfigContent = @"
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Force environment variables
    USE_MOCK_TRANSLATION: 'false',
    NLLB_LOCAL_ENABLED: 'true',
    NLLB_LOCAL_URL: 'http://localhost:8081',
    NLLB_LOCAL_FALLBACK: 'true',
    NODE_ENV: 'development'
  },
  experimental: {
    serverComponentsExternalPackages: ['sharp', 'canvas']
  }
}

module.exports = nextConfig
"@
    
    Set-Content $nextConfigPath $nextConfigContent -Encoding UTF8
    Write-Host "✅ next.config.js created with forced environment variables" -ForegroundColor Green
    Write-Host "⚠️  You MUST restart the main service now!" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "OPTION 3: Use .env.local (Next.js Priority)" -ForegroundColor Green
Write-Host "Create .env.local which has higher priority than .env:"
Write-Host ""
$choice3 = Read-Host "Apply Option 3? (y/n)"

if ($choice3 -eq "y" -or $choice3 -eq "Y") {
    Write-Host "Creating .env.local file..." -ForegroundColor Yellow
    
    $envLocalContent = @"
# .env.local - High priority environment variables for Next.js
USE_MOCK_TRANSLATION=false
NLLB_LOCAL_ENABLED=true
NLLB_LOCAL_URL=http://localhost:8081
NLLB_LOCAL_FALLBACK=true
NODE_ENV=development
"@
    
    Set-Content ".env.local" $envLocalContent -Encoding UTF8
    Write-Host "✅ .env.local created" -ForegroundColor Green
    Write-Host "⚠️  You MUST restart the main service now!" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "OPTION 4: Direct Translation Service Test" -ForegroundColor Green
Write-Host "Test NLLB service directly to verify it works:"
Write-Host ""
$choice4 = Read-Host "Apply Option 4? (y/n)"

if ($choice4 -eq "y" -or $choice4 -eq "Y") {
    Write-Host "Testing NLLB service directly..." -ForegroundColor Yellow
    
    try {
        $directTest = Invoke-RestMethod -Uri "http://localhost:8081/translate" -Method Post -ContentType "application/json" -Body '{"text":"Bonjou","sourceLanguage":"ht","targetLanguage":"en"}' -TimeoutSec 10
        Write-Host "✅ Direct NLLB Translation Result: $($directTest.translatedText)" -ForegroundColor Green
        Write-Host "✅ Processing Time: $($directTest.processingTime)ms" -ForegroundColor Green
        Write-Host "✅ Method: $($directTest.method)" -ForegroundColor Green
        Write-Host ""
        Write-Host "NLLB service is working! The problem is in the main service configuration." -ForegroundColor Yellow
    } catch {
        Write-Host "❌ Direct NLLB test failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "The NLLB service itself has issues." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== RECOMMENDED NEXT STEPS ===" -ForegroundColor Cyan
Write-Host "1. If you applied Option 2 or 3, restart the main service:"
Write-Host "   Stop npm run dev and restart it"
Write-Host ""
Write-Host "2. If still not working, try the nuclear option:"
Write-Host "   Delete node_modules and reinstall: rm -rf node_modules && npm install"
Write-Host ""
Write-Host "3. Test again with:"
Write-Host "   http://localhost:3000/creole-to-english"
Write-Host ""

Write-Host "Press any key to exit..." -ForegroundColor Gray
Read-Host 