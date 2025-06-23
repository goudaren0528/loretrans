Write-Host "Testing Document Translation System" -ForegroundColor Green
Write-Host "=" * 40

# Test 1: Check all services
Write-Host "1. Checking service health..." -ForegroundColor Yellow

$services = @(
    @{ Name = "Main Service"; Url = "http://localhost:3000/api/health" },
    @{ Name = "NLLB Service"; Url = "http://localhost:8081/health" },
    @{ Name = "File Processor"; Url = "http://localhost:3010/health" }
)

$allHealthy = $true
foreach ($service in $services) {
    try {
        $response = Invoke-RestMethod -Uri $service.Url -TimeoutSec 5
        Write-Host "  $($service.Name): OK" -ForegroundColor Green
    } catch {
        Write-Host "  $($service.Name): FAILED" -ForegroundColor Red
        $allHealthy = $false
    }
}

if (-not $allHealthy) {
    Write-Host "Some services are not running. Please start them first." -ForegroundColor Red
    exit 1
}

# Test 2: Upload test file
Write-Host "`n2. Testing file upload..." -ForegroundColor Yellow

if (-not (Test-Path "chinese-test.txt")) {
    Write-Host "chinese-test.txt not found!" -ForegroundColor Red
    exit 1
}

$boundary = [System.Guid]::NewGuid().ToString()
$fileBytes = [System.IO.File]::ReadAllBytes("chinese-test.txt")
$fileEnc = [System.Text.Encoding]::GetEncoding('iso-8859-1').GetString($fileBytes)

$bodyLines = @(
    "--$boundary",
    'Content-Disposition: form-data; name="file"; filename="chinese-test.txt"',
    'Content-Type: text/plain',
    '',
    $fileEnc,
    "--$boundary--"
)
$body = $bodyLines -join "`r`n"

try {
    $uploadResponse = Invoke-RestMethod -Uri "http://localhost:3010/upload" -Method Post -ContentType "multipart/form-data; boundary=$boundary" -Body $body
    if ($uploadResponse.success) {
        Write-Host "  File uploaded successfully!" -ForegroundColor Green
        Write-Host "  File ID: $($uploadResponse.data.fileId)" -ForegroundColor Cyan
        $fileId = $uploadResponse.data.fileId
    } else {
        throw "Upload failed: $($uploadResponse.error.message)"
    }
} catch {
    Write-Host "  Upload failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 3: Start translation
Write-Host "`n3. Starting translation job..." -ForegroundColor Yellow

$translateBody = @{
    fileId = $fileId
    sourceLanguage = "zh"
    targetLanguage = "en"
} | ConvertTo-Json

try {
    $translateResponse = Invoke-RestMethod -Uri "http://localhost:3010/translate" -Method Post -ContentType "application/json" -Body $translateBody
    if ($translateResponse.success) {
        Write-Host "  Translation job started!" -ForegroundColor Green
        Write-Host "  Job ID: $($translateResponse.data.jobId)" -ForegroundColor Cyan
        $jobId = $translateResponse.data.jobId
    } else {
        throw "Translation job failed: $($translateResponse.error.message)"
    }
} catch {
    Write-Host "  Translation job failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 4: Monitor progress
Write-Host "`n4. Monitoring translation progress..." -ForegroundColor Yellow

$maxWait = 60
$waited = 0
$completed = $false

while ($waited -lt $maxWait -and -not $completed) {
    try {
        $statusResponse = Invoke-RestMethod -Uri "http://localhost:3010/job/$jobId" -Method Get
        
        if ($statusResponse.success) {
            $job = $statusResponse.data
            Write-Host "  Status: $($job.status) | Progress: $($job.progress)%" -ForegroundColor Cyan
            
            if ($job.status -eq "completed") {
                Write-Host "  Translation completed!" -ForegroundColor Green
                $completed = $true
                
                if ($job.downloadUrl) {
                    Write-Host "  Download URL: $($job.downloadUrl)" -ForegroundColor Green
                    
                    # Download and show result
                    try {
                        $resultContent = Invoke-WebRequest -Uri $job.downloadUrl
                        Write-Host "`n5. Translation Result:" -ForegroundColor Yellow
                        Write-Host "=" * 40 -ForegroundColor Gray
                        Write-Host $resultContent.Content
                        Write-Host "=" * 40 -ForegroundColor Gray
                    } catch {
                        Write-Host "  Failed to download result: $($_.Exception.Message)" -ForegroundColor Red
                    }
                }
            } elseif ($job.status -eq "failed") {
                Write-Host "  Translation failed: $($job.error)" -ForegroundColor Red
                break
            }
        }
    } catch {
        Write-Host "  Status check failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    if (-not $completed) {
        Start-Sleep 3
        $waited += 3
    }
}

if (-not $completed) {
    Write-Host "  Translation timed out" -ForegroundColor Yellow
}

Write-Host "`nTest completed!" -ForegroundColor Green 