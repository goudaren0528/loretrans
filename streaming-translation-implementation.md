# 串流长文本翻译实施方案

## 核心理念

**每个块都是独立的任务，规避Vercel 30秒超时限制**

## 实施策略

### 1. 分块策略
- **块大小**: 800字符上限
- **分块逻辑**: 智能边界分割（段落 > 句子 > 逗号 > 空格）
- **触发阈值**: 1600字符以上使用串流处理

### 2. 串流处理流程

```
长文本输入 (>1600字符)
    ↓
智能分块 (800字符/块)
    ↓
创建串流任务
    ↓
逐块处理 (每块独立API调用)
    ↓
实时状态更新
    ↓
结果合并返回
```

### 3. 超时规避机制

#### 传统方式问题：
- 所有块在一个请求中处理
- 累积处理时间超过30秒
- Vercel函数超时

#### 串流方式解决：
- 每个块独立处理，单块<25秒
- 块间异步调度，避免累积
- 任务状态持久化，支持长时间处理

### 4. 技术实现

#### API结构：
```
/api/translate/stream
├── POST - 创建串流任务
└── GET  - 查询任务状态
```

#### 任务生命周期：
```
pending → processing → completed/failed
```

#### 前端轮询：
```javascript
// 每2秒查询一次任务状态
const pollStatus = async (taskId) => {
  const response = await fetch(`/api/translate/stream?taskId=${taskId}`)
  const { task } = await response.json()
  
  if (task.status === 'completed') {
    return task.result
  } else if (task.status === 'failed') {
    throw new Error(task.error)
  } else {
    // 继续轮询
    setTimeout(() => pollStatus(taskId), 2000)
  }
}
```

## 配置参数

```javascript
const STREAMING_CONFIG = {
  MAX_CHUNK_SIZE: 800,        // 块大小限制
  CHUNK_INTERVAL: 1000,       // 块间延迟1秒
  SINGLE_CHUNK_TIMEOUT: 25000, // 单块超时25秒
  STREAM_THRESHOLD: 1600,     // 串流触发阈值
  MAX_RETRIES: 3,             // 重试次数
}
```

## 用户体验

### 短文本 (≤1600字符)
- 直接处理，立即返回结果
- 处理时间: 3-10秒

### 长文本 (>1600字符)
- 串流处理，实时进度显示
- 预估时间: 块数 × 3秒 + 块间延迟
- 支持取消和重试

## 优势

1. **规避超时**: 每块独立处理，不累积时间
2. **用户友好**: 实时进度，不会长时间等待
3. **稳定可靠**: 支持重试，错误恢复
4. **资源优化**: 避免长时间占用Vercel函数

## 部署步骤

1. 创建串流API端点
2. 实现前端组件
3. 集成到现有翻译流程
4. 测试验证
5. 部署到生产环境

## 监控指标

- 任务完成率
- 平均处理时间
- 超时错误频率
- 用户满意度

## 注意事项

- 串流处理适用于长文本，短文本仍使用直接处理
- 需要合理设置轮询频率，避免过度请求
- 任务状态需要持久化，支持服务重启恢复
- 考虑添加任务清理机制，避免内存泄漏
