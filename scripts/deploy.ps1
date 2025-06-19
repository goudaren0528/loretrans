# Transly Vercel 部署脚本 (Windows PowerShell)

Write-Host "🚀 开始部署Transly到Vercel..." -ForegroundColor Green

# 检查必要文件
if (-not (Test-Path "vercel.json")) {
    Write-Host "❌ 缺少vercel.json配置文件" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "frontend/package.json")) {
    Write-Host "❌ 缺少frontend/package.json" -ForegroundColor Red
    exit 1
}

# 检查Vercel CLI
try {
    vercel --version | Out-Null
} catch {
    Write-Host "📦 安装Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# 清理和构建
Write-Host "🧹 清理构建缓存..." -ForegroundColor Yellow
if (Test-Path "frontend/.next") {
    Remove-Item -Recurse -Force "frontend/.next"
}
if (Test-Path "frontend/node_modules/.cache") {
    Remove-Item -Recurse -Force "frontend/node_modules/.cache"
}

# 安装依赖
Write-Host "📦 安装依赖..." -ForegroundColor Yellow
Set-Location frontend
npm install

# 运行linting (警告)
Write-Host "🔍 代码检查..." -ForegroundColor Yellow
try {
    npm run lint
} catch {
    Write-Host "⚠️ 发现lint警告，继续部署..." -ForegroundColor Yellow
}

# 本地构建测试
Write-Host "🔨 本地构建测试..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 本地构建失败，停止部署" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 本地构建成功" -ForegroundColor Green

# 返回根目录
Set-Location ..

# 部署到Vercel
Write-Host "🚀 部署到Vercel..." -ForegroundColor Green
vercel --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host "🎉 部署成功！" -ForegroundColor Green
    Write-Host "📍 请检查Vercel Dashboard查看部署URL" -ForegroundColor Cyan
} else {
    Write-Host "❌ 部署失败，请检查错误信息" -ForegroundColor Red
    exit 1
} 