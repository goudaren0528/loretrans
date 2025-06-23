# Simple test for timeout fix
Write-Host "Testing improved timeout system..." -ForegroundColor Cyan

# Create test file with Chinese content
$testContent = "坐在办公室都是问题，下去调研全是办法。调查研究本为发现并更好解决问题，近年来却时常暴露出作风问题。此前曾有媒体报道，某省直单位调研团一共20多人，陪同人员却有50多人，每天六七辆中巴车保障，一天要跑七八个地方。有基层干部吐槽，一些调研内容不够，人数来凑，调研过程常常沦为上车转一转，下车看一看。层层陪同，一哄而上，难以发现真问题。客观来说，深入基层调研，广泛接触群众，有助于打破信息茧房，作出科学决策。"

Write-Host "Creating test file..." -ForegroundColor Yellow
$testFile = "timeout_test.txt"
$testContent | Out-File -FilePath $testFile -Encoding UTF8

Write-Host "Text length: $($testContent.Length) characters" -ForegroundColor Gray

# Upload for translation
Write-Host "Uploading file for translation..." -ForegroundColor Yellow
$startTime = Get-Date

try {
    $response = curl -X POST -F "file=@$testFile" -F "sourceLanguage=auto" -F "targetLanguage=en" http://localhost:3010/translate
    
    if ($LASTEXITCODE -eq 0) {
        $job = $response | ConvertFrom-Json
        Write-Host "Upload successful. Job ID: $($job.jobId)" -ForegroundColor Green
        
        # Monitor progress
        $jobId = $job.jobId
        $maxWait = 300 # 5 minutes max
        $elapsed = 0
        
        do {
            Start-Sleep -Seconds 5
            $elapsed += 5
            
            $statusResponse = curl -s "http://localhost:3010/job/$jobId"
            $status = $statusResponse | ConvertFrom-Json
            
            Write-Host "Status: $($status.status) - Progress: $($status.progress)% - Elapsed: ${elapsed}s" -ForegroundColor Cyan
            
            if ($status.status -eq "completed") {
                $endTime = Get-Date
                $totalTime = ($endTime - $startTime).TotalSeconds
                Write-Host "SUCCESS! Translation completed in $([math]::Round($totalTime, 2)) seconds" -ForegroundColor Green
                
                if ($status.result -and $status.result.translatedText) {
                    Write-Host "Translation preview: $($status.result.translatedText.Substring(0, [math]::Min(200, $status.result.translatedText.Length)))..." -ForegroundColor Magenta
                    Write-Host "Original: $($status.result.statistics.originalLength) chars -> Translated: $($status.result.statistics.translatedLength) chars" -ForegroundColor Gray
                } else {
                    Write-Host "WARNING: No translation result found" -ForegroundColor Yellow
                }
                break
            } elseif ($status.status -eq "failed") {
                Write-Host "FAILED: $($status.error)" -ForegroundColor Red
                break
            }
            
        } while ($elapsed -lt $maxWait)
        
        if ($elapsed -ge $maxWait) {
            Write-Host "TIMEOUT: Test exceeded 5 minutes" -ForegroundColor Red
        }
        
    } else {
        Write-Host "Upload failed" -ForegroundColor Red
    }
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
} finally {
    # Cleanup
    if (Test-Path $testFile) {
        Remove-Item $testFile
    }
}

Write-Host "Test completed." -ForegroundColor Cyan 