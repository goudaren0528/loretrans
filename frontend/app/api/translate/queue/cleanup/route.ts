import { NextRequest, NextResponse } from 'next/server'

// 获取翻译队列的引用（需要从主文件导入）
// 这里我们直接访问全局变量，在生产环境中应该使用更好的方式
declare global {
  var translationQueue: Map<string, any>;
}

export async function POST(request: NextRequest) {
  try {
    // 获取所有任务
    const allTasks = Array.from(global.translationQueue?.entries() || []);
    const now = new Date();
    
    let cleanedCount = 0;
    let stuckTasks = [];
    
    for (const [jobId, job] of allTasks) {
      const taskAge = now.getTime() - new Date(job.createdAt).getTime();
      const isStuck = job.status === 'pending' && taskAge > 5 * 60 * 1000; // 5分钟以上的pending任务
      
      if (isStuck) {
        stuckTasks.push({
          id: jobId,
          status: job.status,
          progress: job.progress,
          age: Math.round(taskAge / 1000 / 60), // 分钟
          createdAt: job.createdAt
        });
        
        // 标记为失败
        job.status = 'failed';
        job.error = '任务超时，已自动清理';
        job.updatedAt = now;
        global.translationQueue?.set(jobId, job);
        cleanedCount++;
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `清理了 ${cleanedCount} 个卡住的任务`,
      cleanedTasks: stuckTasks,
      totalTasks: allTasks.length
    });
    
  } catch (error) {
    console.error('[Cleanup] 清理任务失败:', error);
    return NextResponse.json({
      success: false,
      error: '清理任务失败',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // 获取所有任务状态统计
    const allTasks = Array.from(global.translationQueue?.entries() || []);
    const now = new Date();
    
    const stats = {
      total: allTasks.length,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      stuck: []
    };
    
    for (const [jobId, job] of allTasks) {
      stats[job.status]++;
      
      const taskAge = now.getTime() - new Date(job.createdAt).getTime();
      if (job.status === 'pending' && taskAge > 5 * 60 * 1000) {
        stats.stuck.push({
          id: jobId,
          age: Math.round(taskAge / 1000 / 60), // 分钟
          createdAt: job.createdAt
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      stats
    });
    
  } catch (error) {
    console.error('[Cleanup] 获取任务统计失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取任务统计失败'
    }, { status: 500 });
  }
}
