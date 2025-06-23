# Stop All Translation Services Script
Write-Host "Checking and stopping all translation services..." -ForegroundColor Yellow

# Function to check port
function Test-Port {
    param([int]$Port)
    try {
        $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        return $connection -ne $null
    } catch {
        return $false
    }
}

# Function to get process by port
function Get-ProcessByPort {
    param([int]$Port)
    try {
        $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        if ($connection) {
            return Get-Process -Id $connection.OwningProcess -ErrorAction SilentlyContinue
        }
    } catch {
        return $null
    }
    return $null
}

# Function to stop process safely
function Stop-ProcessSafely {
    param([System.Diagnostics.Process]$Process, [string]$ServiceName)
    if ($Process) {
        Write-Host "Stopping $ServiceName (PID: $($Process.Id))..." -ForegroundColor Yellow
        try {
            $Process.CloseMainWindow()
            Start-Sleep -Seconds 2
            if (!$Process.HasExited) {
                $Process.Kill()
            }
            Write-Host "$ServiceName stopped successfully." -ForegroundColor Green
        } catch {
            Write-Host "Failed to stop $ServiceName : $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "=== SERVICE STATUS CHECK ===" -ForegroundColor Cyan
Write-Host ""

# Check ports and services
$ports = @{
    3000 = "Main Service (Next.js)"
    8081 = "NLLB Local Service"
    8080 = "NLLB Service (old port)"
    8000 = "File Processor Service"
}

$runningServices = @()

foreach ($port in $ports.Keys) {
    $isRunning = Test-Port $port
    $serviceName = $ports[$port]
    
    if ($isRunning) {
        $process = Get-ProcessByPort $port
        Write-Host "✅ $serviceName : RUNNING on port $port" -ForegroundColor Green
        if ($process) {
            Write-Host "   Process: $($process.ProcessName) (PID: $($process.Id))" -ForegroundColor Gray
            $runningServices += @{
                Port = $port
                Name = $serviceName
                Process = $process
            }
        }
    } else {
        Write-Host "⭕ $serviceName : NOT RUNNING on port $port" -ForegroundColor Gray
    }
}

Write-Host ""

# Check for Node.js processes
Write-Host "=== NODE.JS PROCESSES ===" -ForegroundColor Cyan
$nodeProcesses = Get-Process | Where-Object {$_.ProcessName -like "*node*" -or $_.ProcessName -like "*npm*"} 2>$null
if ($nodeProcesses) {
    foreach ($proc in $nodeProcesses) {
        Write-Host "Node Process: $($proc.ProcessName) (PID: $($proc.Id)) - CPU: $($proc.CPU) - Memory: $([math]::Round($proc.WorkingSet/1MB, 2)) MB" -ForegroundColor Yellow
    }
} else {
    Write-Host "No Node.js processes found." -ForegroundColor Gray
}

Write-Host ""

# Ask user what to do
if ($runningServices.Count -gt 0) {
    Write-Host "=== STOP SERVICES ===" -ForegroundColor Red
    $answer = Read-Host "Do you want to stop all running services? (y/n)"
    
    if ($answer -eq "y" -or $answer -eq "Y" -or $answer -eq "") {
        Write-Host ""
        Write-Host "Stopping all services..." -ForegroundColor Yellow
        
        foreach ($service in $runningServices) {
            Stop-ProcessSafely $service.Process $service.Name
        }
        
        # Double check - kill any remaining Node processes
        Write-Host ""
        Write-Host "Checking for remaining Node.js processes..." -ForegroundColor Yellow
        $remainingNodes = Get-Process | Where-Object {$_.ProcessName -like "*node*"} 2>$null
        if ($remainingNodes) {
            Write-Host "Found remaining Node.js processes. Stopping them..." -ForegroundColor Yellow
            foreach ($proc in $remainingNodes) {
                try {
                    Stop-Process -Id $proc.Id -Force
                    Write-Host "Stopped Node process PID: $($proc.Id)" -ForegroundColor Green
                } catch {
                    Write-Host "Failed to stop Node process PID: $($proc.Id)" -ForegroundColor Red
                }
            }
        }
        
        Write-Host ""
        Write-Host "All services stopped!" -ForegroundColor Green
        
        # Verify all ports are free
        Write-Host ""
        Write-Host "=== VERIFICATION ===" -ForegroundColor Cyan
        foreach ($port in $ports.Keys) {
            $isRunning = Test-Port $port
            $serviceName = $ports[$port]
            if ($isRunning) {
                Write-Host "⚠️  $serviceName : Still running on port $port" -ForegroundColor Red
            } else {
                Write-Host "✅ Port $port : FREE" -ForegroundColor Green
            }
        }
        
    } else {
        Write-Host "Services left running." -ForegroundColor Yellow
    }
} else {
    Write-Host "No translation services are currently running." -ForegroundColor Green
}

Write-Host ""
Write-Host "=== QUICK COMMANDS ===" -ForegroundColor Cyan
Write-Host "To restart services:"
Write-Host "1. NLLB Service: cd microservices\nllb-local && npm start"
Write-Host "2. Main Service: npm run dev"
Write-Host "3. Or use: .\start-simple.ps1"
Write-Host ""

Write-Host "Press any key to exit..." -ForegroundColor Gray
Read-Host 