# 测试改进的中文翻译系统
# 包含智能超时、动态分块和重试机制

Write-Host "🚀 测试改进的翻译系统" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# 测试不同长度的中文文本
$testTexts = @{
    "短文本" = "你好，世界！这是一个简单的测试。"
    "中等文本" = @"
坐在办公室都是问题，下去调研全是办法。调查研究本为发现并更好解决问题，近年来却时常暴露出作风"问题"。此前曾有媒体报道，某省直单位调研团一共20多人，陪同人员却有50多人，每天六七辆中巴车保障，一天要跑七八个地方。有基层干部吐槽，一些调研"内容不够，人数来凑"，调研过程常常沦为"上车转一转，下车看一看"。
"@
    "长文本" = @"
坐在办公室都是问题，下去调研全是办法。调查研究本为发现并更好解决问题，近年来却时常暴露出作风"问题"。此前曾有媒体报道，某省直单位调研团一共20多人，陪同人员却有50多人，每天六七辆中巴车保障，一天要跑七八个地方。有基层干部吐槽，一些调研"内容不够，人数来凑"，调研过程常常沦为"上车转一转，下车看一看"。

层层陪同，一哄而上，难以发现真问题。客观来说，深入基层调研，广泛接触群众，有助于打破信息茧房，作出科学决策。但广泛性不等于"大阵仗"，盲目拼凑无关人员参加，获得的往往是无效信息，甚至调研组还会被"层层包围"，无法与老百姓接触，以至于调研真正需要掌握的实情"缩水"。

调研工作需要更加精准和高效。首先，调研目标要明确，针对具体问题制定详细的调研方案。其次，调研团队要精简，避免人浮于事。最后，调研方法要科学，确保获得真实有效的信息。只有这样，调研工作才能真正发挥作用，为决策提供有力支撑。

此外，调研工作还需要建立完善的反馈机制。调研结束后，要及时整理调研成果，形成详细的调研报告。同时，要跟踪调研建议的落实情况，确保调研成果转化为实际行动。这样才能形成调研工作的闭环，真正发挥调研的价值和作用。
"@
}

foreach ($testName in $testTexts.Keys) {
    $text = $testTexts[$testName]
    $textLength = $text.Length
    
    Write-Host "`n📝 测试 $testName (${textLength} 字符)" -ForegroundColor Yellow
    Write-Host "=" * 50 -ForegroundColor Gray
    
    # 创建临时文件
    $tempFile = "temp_test_${testName}_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"
    Set-Content -Path $tempFile -Value $text -Encoding UTF8
    
    try {
        # 记录开始时间
        $startTime = Get-Date
        Write-Host "⏰ 开始时间: $($startTime.ToString('HH:mm:ss'))" -ForegroundColor Gray
        
        # 上传文件进行翻译
        Write-Host "📤 上传文件..." -ForegroundColor Blue
        $uploadResponse = curl -s -X POST -F "file=@$tempFile" -F "sourceLanguage=auto" -F "targetLanguage=en" http://localhost:3010/translate
        
        if ($LASTEXITCODE -eq 0) {
            $jobData = $uploadResponse | ConvertFrom-Json
            $jobId = $jobData.jobId
            Write-Host "✅ 文件上传成功，任务ID: $jobId" -ForegroundColor Green
            
            # 监控翻译进度
            $completed = $false
            $pollCount = 0
            $maxPolls = 60 # 最多轮询60次（5分钟）
            
            while (-not $completed -and $pollCount -lt $maxPolls) {
                Start-Sleep -Seconds 5
                $pollCount++
                
                try {
                    $statusResponse = curl -s "http://localhost:3010/job/$jobId"
                    $status = $statusResponse | ConvertFrom-Json
                    
                    Write-Host "📊 进度: $($status.progress)% - $($status.status)" -ForegroundColor Cyan
                    
                    if ($status.status -eq "completed") {
                        $completed = $true
                        $endTime = Get-Date
                        $duration = ($endTime - $startTime).TotalSeconds
                        
                        Write-Host "🎉 翻译完成!" -ForegroundColor Green
                        Write-Host "⏱️ 用时: $([math]::Round($duration, 2)) 秒" -ForegroundColor Green
                        
                        # 显示结果统计
                        if ($status.result) {
                            $result = $status.result
                            Write-Host "📈 翻译统计:" -ForegroundColor Yellow
                            Write-Host "  - 源语言: $($result.sourceLanguage)" -ForegroundColor Gray
                            Write-Host "  - 目标语言: $($result.targetLanguage)" -ForegroundColor Gray
                            Write-Host "  - 原文长度: $($result.statistics.originalLength) 字符" -ForegroundColor Gray
                            Write-Host "  - 译文长度: $($result.statistics.translatedLength) 字符" -ForegroundColor Gray
                            Write-Host "  - 处理块数: $($result.statistics.chunksProcessed)/$($result.statistics.chunksTotal)" -ForegroundColor Gray
                            
                            # 显示翻译预览
                            if ($result.translatedText -and $result.translatedText.Length -gt 0) {
                                $preview = if ($result.translatedText.Length -gt 200) { 
                                    $result.translatedText.Substring(0, 200) + "..." 
                                } else { 
                                    $result.translatedText 
                                }
                                Write-Host "📖 翻译预览: $preview" -ForegroundColor Magenta
                            } else {
                                Write-Host "❌ 翻译结果为空!" -ForegroundColor Red
                            }
                        }
                    } elseif ($status.status -eq "failed") {
                        Write-Host "❌ 翻译失败: $($status.error)" -ForegroundColor Red
                        break
                    }
                } catch {
                    Write-Host "⚠️ 状态查询失败: $_" -ForegroundColor Yellow
                    $pollCount = $maxPolls # 跳出循环
                }
            }
            
            if ($pollCount -ge $maxPolls) {
                Write-Host "⏰ 翻译超时 (5分钟)" -ForegroundColor Red
            }
            
        } else {
            Write-Host "❌ 文件上传失败" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "❌ 测试出错: $_" -ForegroundColor Red
    } finally {
        # 清理临时文件
        if (Test-Path $tempFile) {
            Remove-Item $tempFile -Force
        }
    }
}

Write-Host "`n🏁 测试完成!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan

# 检查服务状态
Write-Host "`n🔍 服务状态检查:" -ForegroundColor Yellow
try {
    $mainHealth = curl -s http://localhost:3000/api/health | ConvertFrom-Json
    Write-Host "✅ 主服务: $($mainHealth.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ 主服务: 无响应" -ForegroundColor Red
}

try {
    $nllbHealth = curl -s http://localhost:8081/health | ConvertFrom-Json
    Write-Host "✅ NLLB服务: $($nllbHealth.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ NLLB服务: 无响应" -ForegroundColor Red
}

try {
    $fileHealth = curl -s http://localhost:3010/health | ConvertFrom-Json
    Write-Host "✅ 文件处理服务: $($fileHealth.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ 文件处理服务: 无响应" -ForegroundColor Red
} 