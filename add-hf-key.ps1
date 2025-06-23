# Add Hugging Face API Key Script
Write-Host "=== Hugging Face API Setup ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "To use Hugging Face API for better translation quality:" -ForegroundColor Yellow
Write-Host "1. Visit: https://huggingface.co/settings/tokens" -ForegroundColor White
Write-Host "2. Create a new token (read access is sufficient)" -ForegroundColor White
Write-Host "3. Copy the token and paste it below" -ForegroundColor White
Write-Host ""

$apiKey = Read-Host "Enter your Hugging Face API key (or press Enter to skip)"

if ($apiKey -and $apiKey.Length -gt 10) {
    Write-Host ""
    Write-Host "Adding API key to environment files..." -ForegroundColor Yellow
    
    # Update .env file
    if (Test-Path ".env") {
        $envContent = Get-Content ".env" -Raw
        if ($envContent -match "HUGGINGFACE_API_KEY=") {
            $envContent = $envContent -replace "HUGGINGFACE_API_KEY=.*", "HUGGINGFACE_API_KEY=$apiKey"
        } else {
            $envContent += "`nHUGGINGFACE_API_KEY=$apiKey"
        }
        Set-Content ".env" $envContent -Encoding UTF8
        Write-Host "✅ Updated .env file" -ForegroundColor Green
    }
    
    # Update frontend/.env.local file
    if (Test-Path "frontend/.env.local") {
        $envLocalContent = Get-Content "frontend/.env.local" -Raw
        if ($envLocalContent -match "HUGGINGFACE_API_KEY=") {
            $envLocalContent = $envLocalContent -replace "HUGGINGFACE_API_KEY=.*", "HUGGINGFACE_API_KEY=$apiKey"
        } else {
            $envLocalContent += "`nHUGGINGFACE_API_KEY=$apiKey"
        }
        Set-Content "frontend/.env.local" $envLocalContent -Encoding UTF8
        Write-Host "✅ Updated frontend/.env.local file" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "✅ Hugging Face API key configured!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Now restart your main service:" -ForegroundColor Yellow
    Write-Host "1. Stop the current npm run dev (Ctrl+C)" -ForegroundColor White
    Write-Host "2. Start it again: npm run dev" -ForegroundColor White
    Write-Host "3. Test translation - it should now use Hugging Face API" -ForegroundColor White
    
} else {
    Write-Host ""
    Write-Host "⚠️  API key not provided. Skipping HF API setup." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Alternative solutions:" -ForegroundColor Cyan
    Write-Host "1. Fix local NLLB model (may take time)" -ForegroundColor White
    Write-Host "2. Use mock translations for now" -ForegroundColor White
}

Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
Read-Host 