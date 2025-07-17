# 🧪 异步队列翻译测试指南

## 🌐 服务状态
- ✅ 前端应用: http://localhost:3000
- ✅ 文本翻译: http://localhost:3000/en/text-translate
- ✅ 文档翻译: http://localhost:3000/en/document-translate
- ✅ 文件处理微服务: http://localhost:3010

## 🎯 测试目标
验证异步队列处理方案是否能解决504超时问题

## 📋 测试计划

### 1. 短文本测试 (应该直接处理)
**测试内容**: 少于1000字符的文本
**预期行为**: 
- 直接翻译，不进入队列
- 快速返回结果
- 无进度条显示

**测试步骤**:
1. 访问 http://localhost:3000/en/text-translate
2. 输入短文本 (例如: "Hello, this is a short text for testing.")
3. 选择语言对 (如: 英语 → 中文)
4. 点击翻译
5. 验证快速返回结果

### 2. 长文本测试 (应该进入队列)
**测试内容**: 超过1000字符的文本
**预期行为**:
- 自动进入队列处理
- 显示进度条和状态
- 分批异步处理
- 最终返回完整结果

**测试步骤**:
1. 访问 http://localhost:3000/en/text-translate
2. 输入长文本 (>1000字符，可以复制多段文字)
3. 选择语言对
4. 点击翻译
5. 观察是否显示队列状态和进度条
6. 等待处理完成，验证结果

### 3. API端点直接测试

#### 测试队列API创建任务:
```bash
curl -X POST http://localhost:3000/api/translate/queue \
  -H "Content-Type: application/json" \
  -d '{
    "text": "This is a very long text that should be processed in queue. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
    "sourceLanguage": "en",
    "targetLanguage": "zh"
  }'
```

#### 测试队列状态查询:
```bash
# 使用上面返回的jobId
curl "http://localhost:3000/api/translate/queue?jobId=YOUR_JOB_ID"
```

## 📊 监控和调试

### 查看实时日志:
```bash
# 前端日志
tail -f ~/translation-low-source/logs/frontend.log

# 微服务日志  
tail -f ~/translation-low-source/logs/file-processor.log
```

### 关键日志标识:
- `[Translation] 长文本检测: XXX字符，重定向到队列处理`
- `[Queue] Job job_xxx created`
- `[Queue] Job job_xxx processing batch X/Y`
- `[Queue] Job job_xxx completed successfully`

## 🔍 预期结果

### 短文本 (<1000字符):
- ✅ 直接处理，快速返回
- ✅ 日志显示直接翻译路径
- ✅ 无队列相关日志

### 长文本 (>1000字符):
- ✅ 返回 `useQueue: true` 和 `jobId`
- ✅ 队列状态从 `pending` → `processing` → `completed`
- ✅ 进度从 0% → 100%
- ✅ 最终返回完整翻译结果

## ⚠️ 可能的问题和解决

### 问题1: 队列API 404错误
**原因**: 队列API文件未正确创建
**解决**: 检查 `frontend/app/api/translate/queue/route.ts` 是否存在

### 问题2: 长文本仍然直接处理
**原因**: 主翻译API未正确更新
**解决**: 检查主翻译API是否包含队列重定向逻辑

### 问题3: 队列任务卡在pending状态
**原因**: 后台处理函数未��动
**解决**: 检查服务器日志，重启服务

### 问题4: 翻译服务超时
**原因**: NLLB服务响应慢
**解决**: 检查网络连接，考虑增加重试次数

## 🎯 成功标准

测试成功的标志:
1. ✅ 短文本快速直接翻译
2. ✅ 长文本自动进入队列
3. ✅ 队列状态正确更新
4. ✅ 进度条正常显示
5. ✅ 最终获得完整翻译结果
6. ✅ 无504超时错误

## 📞 如需帮助

如果测试过程中遇到问题:
1. 查看浏览器开发者工具的Network和Console标签
2. 检查服务器日志
3. 提供具体的错误信息和日志内容

祝测试顺利！🚀
