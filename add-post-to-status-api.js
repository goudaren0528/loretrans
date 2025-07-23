#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const statusApiPath = path.join(__dirname, 'frontend/app/api/translate/status/route.ts');

console.log('🔧 为状态API添加POST方法...');

// 读取当前文件内容
let content = fs.readFileSync(statusApiPath, 'utf8');

// 检查是否已经有POST方法
if (content.includes('export async function POST')) {
  console.log('✅ POST方法已存在');
  process.exit(0);
}

// 在文件末尾添加POST方法
const postMethod = `

// POST方法支持 - 与GET方法功能相同
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId } = body;
    
    // 🔥 严格验证jobId
    if (!jobId || jobId === 'undefined' || jobId === 'null' || jobId.trim() === '') {
      console.error('[Translation Status] 收到无效的jobId:', {
        jobId,
        type: typeof jobId,
        body
      });
      return NextResponse.json({
        error: '无效的任务ID，请重新提交翻译请求',
        code: 'INVALID_JOB_ID',
        details: 'jobId不能为空或无效'
      }, { status: 400 });
    }

    console.log(\`[Translation Status] 查询任务状态: \${jobId}\`);

    // 获取全局队列
    const textTranslationQueue = (global as any).textTranslationQueue;
    if (!textTranslationQueue) {
      console.error('[Translation Status] 翻译队列未初始化');
      return NextResponse.json({
        error: '翻译服务未初始化',
        code: 'SERVICE_NOT_INITIALIZED'
      }, { status: 503 });
    }

    const job = textTranslationQueue.get(jobId);
    if (!job) {
      console.error(\`[Translation Status] 任务不存在: \${jobId}\`);
      return NextResponse.json({
        error: '任务不存在或已过期',
        code: 'JOB_NOT_FOUND'
      }, { status: 404 });
    }

    console.log(\`[Translation Status] 任务状态: \${job.status}, 进度: \${job.progress}%\`);

    return NextResponse.json({
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      result: job.result,
      error: job.error,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      characterCount: job.characterCount
    });

  } catch (error: any) {
    console.error('[Translation Status] POST方法错误:', error);
    return NextResponse.json({
      error: '查询状态失败',
      code: 'STATUS_QUERY_ERROR',
      details: error.message
    }, { status: 500 });
  }
}
`;

// 将POST方法添加到文件末尾
content += postMethod;

// 写回文件
fs.writeFileSync(statusApiPath, content, 'utf8');

console.log('✅ 已添加POST方法到状态API');
console.log('🔄 请重启开发服务器以应用更改');
