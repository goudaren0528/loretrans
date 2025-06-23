#!/usr/bin/env pwsh

Write-Host "=== 测试中文翻译并分析详细日志 ===" -ForegroundColor Green

# 测试中文文本
$chineseText = @"
这是一个中文测试文档。

我们正在测试文档翻译功能的中文支持。这个文档包含了中文内容，用来验证语言检测和翻译功能是否正常工作。

系统应该能够：
1. 正确检测中文语言
2. 将中文翻译成英文
3. 生成带有原文对照的结果文件

让我们看看修复后的效果如何。

测试内容包括：
- 日常用语：你好，谢谢，再见
- 数字：一、二、三、四、五
- 标点符号：！？。，；：

希望这次能够正确识别为中文并翻译成英文。
"@

Write-Host "输入文本长度: $($chineseText.Length) 字符" -ForegroundColor Cyan

# 测试文档翻译API
Write-Host "`n=== 测试文档翻译API ===" -ForegroundColor Yellow

# 创建临时文件
$tempFile = [System.IO.Path]::GetTempFileName() + ".txt"
$chineseText | Out-File -FilePath $tempFile -Encoding UTF8

Write-Host "临时文件: $tempFile" -ForegroundColor Gray

try {
    # 调用文档翻译API
    $uri = "http://localhost:3010/translate"
    $formData = @{
        file = Get-Item $tempFile
        sourceLanguage = "auto"
        targetLanguage = "en"
    }
    
    Write-Host "调用文档翻译API..." -ForegroundColor Cyan
    
    $response = Invoke-RestMethod -Uri $uri -Method Post -Form $formData -ContentType "multipart/form-data"
    
    Write-Host "`n=== API响应 ===" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 5 | Write-Host
    
    if ($response.success -and $response.downloadUrl) {
        Write-Host "`n=== 下载翻译结果 ===" -ForegroundColor Yellow
        $downloadUrl = $response.downloadUrl
        Write-Host "下载链接: $downloadUrl" -ForegroundColor Cyan
        
        # 下载结果文件
        $resultContent = Invoke-RestMethod -Uri $downloadUrl
        Write-Host "`n=== 翻译结果内容 ===" -ForegroundColor Green
        Write-Host $resultContent
        
        # 分析结果
        if ($resultContent -match "Translated Text[\r\n]+(.+?)[\r\n]+##") {
            $translatedText = $matches[1].Trim()
            Write-Host "`n=== 翻译分析 ===" -ForegroundColor Magenta
            Write-Host "原文长度: $($chineseText.Length) 字符"
            Write-Host "译文长度: $($translatedText.Length) 字符"
            Write-Host "翻译比例: $([math]::Round($translatedText.Length / $chineseText.Length, 2))"
            
            # 检查翻译质量
            if ($translatedText.Length -lt ($chineseText.Length * 0.8)) {
                Write-Host "⚠️  翻译可能不完整 - 译文明显短于原文" -ForegroundColor Red
            } elseif ($translatedText -match "[\u4e00-\u9fff]") {
                Write-Host "⚠️  翻译可能失败 - 译文中仍包含中文字符" -ForegroundColor Red
            } else {
                Write-Host "✅ 翻译看起来正常" -ForegroundColor Green
            }
        }
    }
    
} catch {
    Write-Host "错误: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "详细错误: $($_.Exception)" -ForegroundColor Gray
} finally {
    # 清理临时文件
    if (Test-Path $tempFile) {
        Remove-Item $tempFile -Force
        Write-Host "`n临时文件已清理" -ForegroundColor Gray
    }
}

Write-Host "`n=== 测试完成 ===" -ForegroundColor Green 