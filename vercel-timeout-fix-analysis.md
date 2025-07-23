# Vercel 30秒超时问题修复方案

## 问题确认

当前实现在以下情况下会超时：
- **4800字符（6个块）**: 33.5秒 ❌ 超时
- **7200字符（9个块）**: 51秒 ❌ 严重超时

## 当前架构分析

### 正确的部分 ✅
1. **队列重定向机制**：超过1000字符自动使用队列
2. **异步处理**：队列API立即返回，不等待翻译完成
3. **进度跟踪**：前端可以轮询查询进度

### 问题部分 ❌
1. **后台处理仍在同一函数**：`processTranslationJob`在同一个Vercel函数中执行
2. **批次处理时间过长**：每批次3个块 × 5秒 = 15秒，多批次必然超时

## 修复方案

### 方案1：分批次API调用（推荐）

将长时间的批次处理拆分为多个独立的API调用：

```typescript
// 修改队列处理逻辑
async function processTranslationJob(jobId: string) {
  const job = translationQueue.get(jobId);
  if (!job) return;
  
  job.status = 'processing';
  job.progress = 5;
  translationQueue.set(jobId, job);
  
  // 不在这里直接处理所有批次，而是启动第一个批次
  await processSingleBatch(jobId, 0);
}

// 新增：单批次处理函数
async function processSingleBatch(jobId: string, batchIndex: number) {
  const job = translationQueue.get(jobId);
  if (!job) return;
  
  const totalBatches = Math.ceil(job.chunks.length / CONFIG.BATCH_SIZE);
  const startIndex = batchIndex * CONFIG.BATCH_SIZE;
  const endIndex = Math.min(startIndex + CONFIG.BATCH_SIZE, job.chunks.length);
  const batch = job.chunks.slice(startIndex, endIndex);
  
  // 处理当前批次（时间控制在15秒内）
  const batchResults = await Promise.all(
    batch.map(chunk => translateChunkWithRetry(chunk, job.sourceLanguage, job.targetLanguage))
  );
  
  // 保存批次结果
  job.batchResults = job.batchResults || [];
  job.batchResults[batchIndex] = batchResults;
  
  // 更新进度
  job.progress = Math.round(((batchIndex + 1) / totalBatches) * 90) + 10;
  job.updatedAt = new Date();
  translationQueue.set(jobId, job);
  
  // 如果还有更多批次，调用下一个批次API
  if (batchIndex + 1 < totalBatches) {
    // 异步调用下一个批次，不等待结果
    setTimeout(() => {
      fetch('/api/translate/queue/process-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, batchIndex: batchIndex + 1 })
      }).catch(error => {
        console.error(`[Queue] 批次 ${batchIndex + 1} 处理失败:`, error);
      });
    }, CONFIG.BATCH_DELAY);
  } else {
    // 所有批次完成，合并结果
    await finalizeTranslationJob(jobId);
  }
}
```

### 方案2：调整批次大小和超时阈值

```typescript
// 更保守的配置
export const TRANSLATION_CHUNK_CONFIG = {
  MAX_CHUNK_SIZE: 1000,    // 增大分块，减少块数
  BATCH_SIZE: 2,           // 减小批次大小
  CHUNK_DELAY: 200,        // 减少延迟
  BATCH_DELAY: 500,        // 减少批次延迟
  QUEUE_THRESHOLD: 2000,   // 降低队列阈值，2000字符就用队列
};

// 安全计算：2000字符 = 2块 × 2批次 × 5秒 + 延迟 ≈ 20秒 ✅
```

### 方案3：混合处理策略

```typescript
export async function POST(request: NextRequest) {
  const { text, sourceLang, targetLang } = await request.json();
  
  // 根据预估时间决定处理方式
  const estimatedTime = estimateProcessingTime(text.length);
  
  if (estimatedTime > 25) { // 留5秒缓冲
    // 使用队列处理
    return redirectToQueue(text, sourceLang, targetLang);
  } else {
    // 直接处理，但使用更小的批次
    return processDirectly(text, sourceLang, targetLang);
  }
}
```

## 推荐实施步骤

### 第1步：立即修复（降低超时风险）
```typescript
// 调整配置，确保大部分情况不超时
const SAFE_CONFIG = {
  MAX_CHUNK_SIZE: 1200,
  BATCH_SIZE: 2,
  QUEUE_THRESHOLD: 2000,  // 2000字符就用队列
  CHUNK_DELAY: 300,
  BATCH_DELAY: 500
};
```

### 第2步：实施分批次API（彻底解决）
创建新的API端点：`/api/translate/queue/process-batch`

### 第3步：监控和优化
添加处理时间监控，动态调整参数

## 测试验证

```bash
# 测试不同长度文本的处理时间
node -e "
const configs = [
  { CHUNK_SIZE: 800, BATCH_SIZE: 3, THRESHOLD: 1000 },
  { CHUNK_SIZE: 1200, BATCH_SIZE: 2, THRESHOLD: 2000 },
];

configs.forEach(config => {
  console.log('配置:', config);
  [2000, 4000, 6000].forEach(length => {
    const time = calculateTime(length, config);
    console.log(\`\${length}字符: \${time}秒 \${time > 30 ? '❌' : '✅'}\`);
  });
  console.log('---');
});
"
```

## 结论

**立即行动项**：
1. 降低队列阈值到2000字符
2. 调整批次大小为2
3. 实施分批次API调用

这样可以确保Vercel部署的稳定性，避免30秒超时问题。
