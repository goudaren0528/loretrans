# 翻译历史功能改进实施方案

## 需求概述

### 当前问题
- 用户在文本翻译、文档翻译时，离开页面或刷新页面后翻译历史丢失
- 文档翻译界面缺少翻译历史列表显示
- 未登录用户无历史记录保存机制

### 改进目标
1. 为登录用户提供持久化的翻译历史记录
2. 支持后台任务继续执行，用户可随时查看进度
3. 提供7天的历史记录保留期
4. 为未登录用户提供登录引导
5. 统一文本和文档翻译的历史记录界面

## 技术实施方案

### 1. 数据库设计

#### 翻译历史表 (translation_history)
```sql
CREATE TABLE translation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    task_type VARCHAR(20) NOT NULL, -- 'text' 或 'document'
    source_language VARCHAR(10) NOT NULL,
    target_language VARCHAR(10) NOT NULL,
    source_content TEXT, -- 文本翻译的原文
    translated_content TEXT, -- 翻译结果
    file_name VARCHAR(255), -- 文档翻译的文件名
    file_url TEXT, -- 原文档URL
    result_url TEXT, -- 翻译结果文档URL
    status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
    progress INTEGER DEFAULT 0, -- 进度百分比
    error_message TEXT,
    credits_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- 创建索引
CREATE INDEX idx_translation_history_user_id ON translation_history(user_id);
CREATE INDEX idx_translation_history_created_at ON translation_history(created_at);
CREATE INDEX idx_translation_history_expires_at ON translation_history(expires_at);
```

### 2. API 接口设计

#### 2.1 创建翻译任务
```javascript
POST /api/translation/create-task
{
    "type": "text|document",
    "sourceLanguage": "en",
    "targetLanguage": "zh",
    "content": "...", // 文本翻译时使用
    "fileName": "...", // 文档翻译时使用
    "fileUrl": "..." // 文档翻译时使用
}

Response:
{
    "taskId": "uuid",
    "status": "pending"
}
```

#### 2.2 获取翻译历史列表
```javascript
GET /api/translation/history?type=text|document&page=1&limit=10

Response:
{
    "data": [
        {
            "id": "uuid",
            "taskType": "text",
            "sourceLanguage": "en",
            "targetLanguage": "zh",
            "status": "completed",
            "progress": 100,
            "createdAt": "2025-01-01T00:00:00Z",
            "fileName": "document.pdf", // 文档翻译时有值
            "preview": "翻译内容预览..." // 文本翻译时有值
        }
    ],
    "total": 50,
    "page": 1,
    "limit": 10
}
```

#### 2.3 获取翻译任务详情
```javascript
GET /api/translation/task/:taskId

Response:
{
    "id": "uuid",
    "taskType": "text",
    "sourceLanguage": "en",
    "targetLanguage": "zh",
    "sourceContent": "...",
    "translatedContent": "...",
    "status": "completed",
    "progress": 100,
    "createdAt": "2025-01-01T00:00:00Z",
    "downloadUrl": "..." // 文档翻译时的下载链接
}
```

#### 2.4 下载翻译结果
```javascript
GET /api/translation/download/:taskId
// 返回文件流或重定向到文件URL
```

### 3. 前端实现方案

#### 3.1 翻译历史组件 (TranslationHistory.vue)
```vue
<template>
  <div class="translation-history">
    <div class="history-header">
      <h3>翻译历史</h3>
      <div class="filter-tabs">
        <button @click="filterType = 'all'" :class="{ active: filterType === 'all' }">
          全部
        </button>
        <button @click="filterType = 'text'" :class="{ active: filterType === 'text' }">
          文本翻译
        </button>
        <button @click="filterType = 'document'" :class="{ active: filterType === 'document' }">
          文档翻译
        </button>
      </div>
    </div>
    
    <div class="history-list">
      <div v-for="item in historyList" :key="item.id" class="history-item">
        <div class="item-info">
          <div class="language-pair">
            {{ getLanguageName(item.sourceLanguage) }} → {{ getLanguageName(item.targetLanguage) }}
          </div>
          <div class="item-content">
            <span v-if="item.taskType === 'text'" class="text-preview">
              {{ item.preview }}
            </span>
            <span v-else class="file-name">
              📄 {{ item.fileName }}
            </span>
          </div>
          <div class="item-meta">
            <span class="time">{{ formatTime(item.createdAt) }}</span>
            <span class="status" :class="item.status">{{ getStatusText(item.status) }}</span>
          </div>
        </div>
        
        <div class="item-actions">
          <button v-if="item.status === 'processing'" class="progress-btn" disabled>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: item.progress + '%' }"></div>
            </div>
            {{ item.progress }}%
          </button>
          <button v-else-if="item.status === 'completed'" @click="viewResult(item)" class="view-btn">
            查看结果
          </button>
          <button v-if="item.status === 'completed' && item.taskType === 'document'" 
                  @click="downloadResult(item)" class="download-btn">
            下载
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="!isLoggedIn" class="login-prompt">
      <div class="prompt-content">
        <p>登录后可保存翻译历史，方便随时查看和下载</p>
        <button @click="showLoginModal" class="login-btn">立即登录</button>
      </div>
    </div>
  </div>
</template>
```

#### 3.2 未登录用户提醒组件
```vue
<template>
  <div v-if="!isLoggedIn && hasTranslationAttempt" class="guest-reminder">
    <div class="reminder-content">
      <i class="icon-info"></i>
      <span>登录后可保存翻译历史，避免刷新页面后丢失</span>
      <button @click="showLogin" class="login-link">立即登录</button>
    </div>
  </div>
</template>
```

### 4. 后台任务处理

#### 4.1 任务队列设计
```javascript
// 使用 Bull Queue 或类似的任务队列系统
const translationQueue = new Queue('translation processing');

// 添加翻译任务到队列
async function addTranslationTask(taskData) {
    const job = await translationQueue.add('process-translation', {
        taskId: taskData.id,
        type: taskData.taskType,
        sourceLanguage: taskData.sourceLanguage,
        targetLanguage: taskData.targetLanguage,
        content: taskData.sourceContent || taskData.fileUrl
    }, {
        attempts: 3,
        backoff: 'exponential',
        delay: 1000
    });
    
    return job.id;
}

// 处理翻译任务
translationQueue.process('process-translation', async (job) => {
    const { taskId, type, sourceLanguage, targetLanguage, content } = job.data;
    
    try {
        // 更新任务状态为处理中
        await updateTaskStatus(taskId, 'processing', 0);
        
        let result;
        if (type === 'text') {
            result = await processTextTranslation(content, sourceLanguage, targetLanguage, (progress) => {
                updateTaskStatus(taskId, 'processing', progress);
            });
        } else {
            result = await processDocumentTranslation(content, sourceLanguage, targetLanguage, (progress) => {
                updateTaskStatus(taskId, 'processing', progress);
            });
        }
        
        // 更新任务状态为完成
        await updateTaskStatus(taskId, 'completed', 100, result);
        
    } catch (error) {
        await updateTaskStatus(taskId, 'failed', 0, null, error.message);
    }
});
```

### 5. 实施计划

#### 阶段一：数据库和基础API (3天)
- [ ] 创建翻译历史数据表
- [ ] 实现基础的CRUD API接口
- [ ] 添加用户认证中间件
- [ ] 实现数据过期清理机制

#### 阶段二：后台任务系统 (4天)
- [ ] 集成任务队列系统
- [ ] 实现异步翻译处理
- [ ] 添加任务进度更新机制
- [ ] 实现错误处理和重试机制

#### 阶段三：前端历史记录界面 (5天)
- [ ] 创建翻译历史组件
- [ ] 实现历史记录列表展示
- [ ] 添加筛选和分页功能
- [ ] 实现结果查看和下载功能

#### 阶段四：用户体验优化 (3天)
- [ ] 添加未登录用户提醒
- [ ] 实现实时进度更新
- [ ] 优化界面交互体验
- [ ] 添加错误状态处理

#### 阶段五：文档翻译界面集成 (2天)
- [ ] 在文档翻译页面集成历史记录组件
- [ ] 统一文本和文档翻译的界面风格
- [ ] 测试两种翻译类型的历史记录功能

#### 阶段六：测试和优化 (3天)
- [ ] 功能测试和bug修复
- [ ] 性能优化
- [ ] 用户体验测试
- [ ] 部署和上线

## 技术要点

### 1. 数据持久化
- 使用数据库存储翻译历史
- 实现7天自动过期清理
- 支持大文件的URL存储

### 2. 实时更新
- 使用WebSocket或Server-Sent Events推送进度更新
- 前端轮询作为备选方案

### 3. 文件管理
- 翻译结果文件存储在云存储服务
- 实现文件的生命周期管理
- 支持断点续传下载

### 4. 性能优化
- 历史记录分页加载
- 实现虚拟滚动优化长列表
- 缓存常用的翻译结果

## 风险评估

### 技术风险
- 大文件翻译的内存占用问题
- 并发翻译任务的资源管理
- 数据库存储空间增长

### 解决方案
- 实现文件分块处理
- 添加任务队列限流机制
- 定期清理过期数据

## 验收标准

1. 登录用户的翻译历史能够持久保存7天
2. 用户离开页面后任务继续在后台执行
3. 文档翻译页面显示历史记录列表
4. 未登录用户看到登录引导提示
5. 支持下载历史翻译结果
6. 实时显示翻译进度
7. 界面响应速度良好，用户体验流畅

## 预计工期
总计：20个工作日

## 资源需求
- 后端开发：1人
- 前端开发：1人
- 测试：0.5人
- 数据库存储空间：预估增加50GB/月
