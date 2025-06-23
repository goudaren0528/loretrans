# 🚀 NLLB核心翻译功能 - 个人电脑部署指南

## 📊 您的专属方案
```yaml
部署环境: 个人电脑本地部署
预期使用: 日翻译1000次以内
成本优势: $0（使用现有设备）
技术优势: 完全本地化，数据不出本地
扩展性: 后期可无缝升级到云端
```

## ⚡ 超级简单启动（推荐）

### 方式1：一键启动脚本（最简单）
```powershell
# 在项目根目录运行
.\start-local-nllb.ps1
```
**说明**：此脚本会自动检查环境、安装依赖、启动服务，完全自动化！

### 方式2：手动启动（传统方式）

### 步骤1：启动NLLB本地服务
```powershell
# 打开PowerShell终端1
cd D:\git_repo\low-source-translate-new\microservices\nllb-local
npm install
npm start
```

### 步骤2：启动Transly主服务  
```powershell
# 打开PowerShell终端2（新窗口）
cd D:\git_repo\low-source-translate-new
npm run dev
```

### 步骤3：验证功能
1. **健康检查**：打开浏览器访问 http://localhost:8080/health
2. **前端测试**：打开 http://localhost:3000/text-translate
3. **选择语言**：English → Haitian Creole  
4. **输入文本**："Hello world"
5. **点击翻译**：应该看到"Bonjou monn"

## 🔧 如果遇到问题

### 问题1：NLLB服务启动失败
```powershell
# 检查Python环境
python --version
pip list | findstr transformers
pip list | findstr torch

# 如果缺少依赖，安装：
pip install transformers torch sentencepiece
```

### 问题2：npm install失败  
```powershell
# 清理并重新安装
cd microservices\nllb-local
rm -rf node_modules
npm cache clean --force
npm install
```

### 问题3：端口被占用
```powershell
# 检查端口使用
netstat -ano | findstr :8080
netstat -ano | findstr :3000

# 如果需要，终止进程：
taskkill /PID <进程ID> /F
```

## 📋 个人电脑部署验证清单

### 系统资源检查
- [ ] CPU使用率 < 80%（正常运行时）
- [ ] 内存使用 < 8GB（或您电脑的80%）
- [ ] 磁盘剩余空间 > 10GB
- [ ] 网络连接正常

### 服务状态检查  
- [ ] NLLB服务在端口8080正常运行
- [ ] 主服务在端口3000正常运行  
- [ ] 健康检查API返回"ok"状态
- [ ] 翻译方法显示"nllb-local"（而非mock）

### 翻译功能检查
- [ ] English→Haitian Creole翻译正常
- [ ] English→Swahili翻译正常
- [ ] English→Lao翻译正常
- [ ] English→Burmese翻译正常
- [ ] English→Telugu翻译正常
- [ ] 响应时间 < 5秒（个人电脑可接受范围）

## 🎯 预期结果

✅ **成功标志**：
- 控制台显示 "NLLB Local Service running on http://0.0.0.0:8080"
- 前端翻译返回method: "nllb-local"
- 翻译结果准确且快速（<3秒）

❌ **失败标志**：
- 服务启动错误
- 翻译请求超时
- 返回method: "mock"或"fallback"

## 📞 支持

如有问题，请查看：
1. `docs/local-pc-deployment-guide.md` - 个人电脑部署详细指南
2. `docs/nllb-core-translation-implementation.md` - 完整实现指南
3. `microservices/nllb-local/README.md` - 服务文档  
4. `todo_list.md` - 任务进度追踪

## 📈 您的扩展路径规划

### 阶段1：当前个人电脑部署（立即）
```yaml
配置: 您的个人电脑
支持: 日1000次翻译
成本: $0
优势: 立即可用、完全本地化
```

### 阶段2：专用服务器升级（使用量增长时）
```yaml
时机: 日翻译量 > 5000次
配置: 8核16GB云服务器
成本: $300-500/月
优势: 7x24稳定运行、更高性能
```

### 阶段3：集群化部署（业务规模化时）
```yaml
时机: 日翻译量 > 50000次
配置: 多服务器集群
成本: $1500-3000/月
优势: 高可用、负载均衡、全球部署
```

**重要提醒**：
1. 确保NLLB 600M模型文件已正确下载到`microservices/nllb-local/models/nllb-600m/`目录中
2. 建议使用`start-local-nllb.ps1`脚本启动，会自动处理所有配置
3. 个人电脑部署完全满足您早期阶段的需求，成本为零且性能充足 