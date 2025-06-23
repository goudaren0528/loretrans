# Test Enhanced Translation Progress Feedback
Write-Host "Testing Enhanced Translation Progress Feedback" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Check service status
Write-Host "`nStep 1: Checking service status..." -ForegroundColor Yellow

$services = @(
    @{ Name = "Main Service"; Url = "http://localhost:3000/api/health" },
    @{ Name = "NLLB Service"; Url = "http://localhost:8081/health" },
    @{ Name = "File Processor"; Url = "http://localhost:3010/health" }
)

$allHealthy = $true
foreach ($service in $services) {
    try {
        $response = Invoke-RestMethod -Uri $service.Url -TimeoutSec 5
        if ($response) {
            Write-Host "  ✅ $($service.Name): Running" -ForegroundColor Green
        }
    } catch {
        Write-Host "  ❌ $($service.Name): Not available" -ForegroundColor Red
        $allHealthy = $false
    }
}

if (-not $allHealthy) {
    Write-Host "`n❌ Some services are not running. Please start all services first." -ForegroundColor Red
    exit 1
}

# Prepare test file
Write-Host "`nStep 2: Preparing test file..." -ForegroundColor Yellow

$testText = @"
This is a comprehensive test document for validating the enhanced translation progress feedback system. The document contains sufficient content to demonstrate real-time progress updates during the translation process.

In the improved system, we have implemented the following features:
1. Language detection phase progress feedback
2. Text chunking process progress display
3. Real-time progress for each chunk translation
4. Detailed status message display
5. Smoother progress bar animations

This test will verify that the frontend correctly displays these enhanced progress features, including:
- Initialization phase when the task starts
- Text analysis and chunking phase
- Chunk-by-chunk translation progress updates
- Final result combination phase

Through these improvements, users will see every step of the translation process instead of waiting for a long time and suddenly seeing 100% completion. This greatly improves user experience by letting users understand the actual translation progress.

The system also displays more detailed status messages, such as "Translating chunk 3/5" or "Detecting source language", allowing users to clearly understand the current operation being performed.

Additionally, the frontend polling interval has been optimized - processing tasks update every 1 second, while pending tasks update every 2 seconds, ensuring users can see progress changes promptly.

This enhanced feedback system provides transparency into the translation workflow and helps users understand what is happening behind the scenes. The visual improvements include animated progress bars with gradient effects and detailed status indicators that change based on the current phase of translation.
"@

$testFileName = "progress-test-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
$testText | Out-File -FilePath $testFileName -Encoding UTF8

Write-Host "  ✅ Created test file: $testFileName" -ForegroundColor Green
Write-Host "  📊 File size: $((Get-Item $testFileName).Length) bytes" -ForegroundColor Cyan
Write-Host "  📝 Character count: $($testText.Length)" -ForegroundColor Cyan

# Upload file
Write-Host "`nStep 3: Uploading test file..." -ForegroundColor Yellow

try {
    $uploadResponse = curl -s -X POST -F "file=@$testFileName" "http://localhost:3010/upload"
    $uploadData = $uploadResponse | ConvertFrom-Json
    
    if ($uploadData.success) {
        Write-Host "  ✅ File uploaded successfully" -ForegroundColor Green
        Write-Host "  🆔 File ID: $($uploadData.data.fileId)" -ForegroundColor Cyan
        $fileId = $uploadData.data.fileId
    } else {
        throw "Upload failed: $($uploadData.error.message)"
    }
} catch {
    Write-Host "  ❌ File upload failed: $($_.Exception.Message)" -ForegroundColor Red
    Remove-Item $testFileName -Force
    exit 1
}

# Start translation task
Write-Host "`nStep 4: Starting translation task..." -ForegroundColor Yellow

$translatePayload = @{
    fileId = $fileId
    sourceLanguage = "en"
    targetLanguage = "zh"
} | ConvertTo-Json

try {
    $translateResponse = Invoke-RestMethod -Uri "http://localhost:3010/translate" -Method Post -Body $translatePayload -ContentType "application/json"
    
    if ($translateResponse.success) {
        Write-Host "  ✅ Translation task started successfully" -ForegroundColor Green
        Write-Host "  🆔 Job ID: $($translateResponse.data.jobId)" -ForegroundColor Cyan
        $jobId = $translateResponse.data.jobId
    } else {
        throw "Translation start failed: $($translateResponse.error.message)"
    }
} catch {
    Write-Host "  ❌ Translation start failed: $($_.Exception.Message)" -ForegroundColor Red
    Remove-Item $testFileName -Force
    exit 1
}

# Monitor translation progress
Write-Host "`nStep 5: Monitoring translation progress..." -ForegroundColor Yellow
Write-Host "Frontend URL: http://localhost:3000/document-translate" -ForegroundColor Cyan
Write-Host "Manual monitoring URL: http://localhost:3010/job/$jobId" -ForegroundColor Cyan
Write-Host ""

$maxWait = 120 # Wait up to 2 minutes
$waited = 0
$lastProgress = -1
$lastMessage = ""

while ($waited -lt $maxWait) {
    try {
        $statusResponse = Invoke-RestMethod -Uri "http://localhost:3010/job/$jobId"
        
        if ($statusResponse.success) {
            $job = $statusResponse.data
            $progress = $job.progress
            $status = $job.status
            $message = $job.message
            
            # Only display when progress or message changes
            if ($progress -ne $lastProgress -or $message -ne $lastMessage) {
                $timestamp = Get-Date -Format "HH:mm:ss"
                $progressBar = "=" * [math]::Floor($progress / 5) + "-" * (20 - [math]::Floor($progress / 5))
                
                Write-Host "[$timestamp] " -ForegroundColor Gray -NoNewline
                Write-Host "[$progressBar] " -ForegroundColor Blue -NoNewline
                Write-Host "$progress% " -ForegroundColor Green -NoNewline
                Write-Host "- $status" -ForegroundColor Yellow -NoNewline
                
                if ($message) {
                    Write-Host " - $message" -ForegroundColor Cyan
                } else {
                    Write-Host ""
                }
                
                $lastProgress = $progress
                $lastMessage = $message
            }
            
            if ($status -eq "completed") {
                Write-Host "`n🎉 Translation completed!" -ForegroundColor Green
                Write-Host "  📥 Download URL: $($job.downloadUrl)" -ForegroundColor Cyan
                
                if ($job.statistics) {
                    Write-Host "  📊 Statistics:" -ForegroundColor Yellow
                    Write-Host "    Original words: $($job.statistics.wordCount)" -ForegroundColor Gray
                    Write-Host "    Translated words: $($job.statistics.translatedWordCount)" -ForegroundColor Gray
                    Write-Host "    Chunks processed: $($job.statistics.chunkCount)" -ForegroundColor Gray
                }
                break
            } elseif ($status -eq "failed") {
                Write-Host "`n❌ Translation failed: $($job.error)" -ForegroundColor Red
                break
            }
        }
    } catch {
        Write-Host "`n⚠️  Failed to get status: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    
    Start-Sleep -Seconds 1
    $waited++
}

if ($waited -ge $maxWait) {
    Write-Host "`n⏰ Timeout reached, translation may still be in progress" -ForegroundColor Yellow
}

# Cleanup
Write-Host "`nStep 6: Cleaning up test file..." -ForegroundColor Yellow
Remove-Item $testFileName -Force
Write-Host "  ✅ Test file deleted" -ForegroundColor Green

Write-Host "`n✨ Test completed!" -ForegroundColor Cyan
Write-Host "Please check the frontend page http://localhost:3000/document-translate for progress display effects" -ForegroundColor White 