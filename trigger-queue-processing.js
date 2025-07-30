const { createClient } = require('@supabase/supabase-js');

// 直接使用Supabase配置
const supabaseUrl = 'https://crhchsvaesipbifykbnp.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyaGNoc3ZhZXNpcGJpZnlrYm5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTYyOTEyNCwiZXhwIjoyMDY1MjA1MTI0fQ.MzmkGXEe8vIrGaW9S0SqfbrUq3kmtu4Q9Piv2rlYK0I';

// 初始化Supabase客户端
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function triggerQueueProcessing() {
  try {
    console.log('🔄 尝试触发队列处理...\n');

    // 获取最老的pending任务
    const { data: pendingTasks, error } = await supabase
      .from('translation_jobs')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(5);

    if (error) {
      console.error('❌ 查询pending任务失败:', error);
      return;
    }

    if (!pendingTasks || pendingTasks.length === 0) {
      console.log('✅ 没有待处理的任务');
      return;
    }

    console.log(`📋 找到 ${pendingTasks.length} 个待处理任务:`);
    pendingTasks.forEach((task, index) => {
      const createdTime = new Date(task.created_at).toLocaleString('zh-CN');
      console.log(`${index + 1}. ${task.id} (${task.job_type}, ${createdTime})`);
    });
    console.log('');

    // 尝试通过API触发队列处理
    const oldestTask = pendingTasks[0];
    console.log(`🎯 尝试处理最老的任务: ${oldestTask.id}`);

    try {
      // 对于文本任务，调用文本翻译队列API
      if (oldestTask.job_type === 'text') {
        const response = await fetch('http://localhost:3000/api/translate/queue', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer dummy-token' // 使用虚拟token
          },
          body: JSON.stringify({
            text: oldestTask.original_content,
            sourceLang: oldestTask.source_language,
            targetLang: oldestTask.target_language
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ 文本翻译任务已提交到队列');
          console.log('📝 任务ID:', result.taskId);
        } else {
          console.log('❌ 提交文本翻译任务失败:', response.status, response.statusText);
        }
      }
      // 对于文档任务，调用文档翻译队列API
      else if (oldestTask.job_type === 'document') {
        const response = await fetch('http://localhost:3000/api/document/translate/queue', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer dummy-token' // 使用虚拟token
          },
          body: JSON.stringify({
            jobId: oldestTask.id,
            sourceLang: oldestTask.source_language,
            targetLang: oldestTask.target_language,
            originalContent: oldestTask.original_content
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ 文档翻译任务已提交到队列');
          console.log('📝 任务ID:', result.taskId);
        } else {
          console.log('❌ 提交文档翻译任务失败:', response.status, response.statusText);
        }
      }

    } catch (apiError) {
      console.error('❌ API调用失败:', apiError.message);
    }

    // 检查队列状态
    setTimeout(async () => {
      try {
        const queueResponse = await fetch('http://localhost:3000/api/translate/queue', {
          method: 'GET'
        });

        if (queueResponse.ok) {
          const queueStatus = await queueResponse.json();
          console.log('\n📊 队列状态更新:');
          console.log(`🔄 队列长度: ${queueStatus.queueLength || 0}`);
          console.log(`⚡ 正在处理: ${queueStatus.isProcessing ? '是' : '否'}`);
          console.log(`📝 当前任务: ${queueStatus.currentTask || '无'}`);
        }
      } catch (statusError) {
        console.log('❌ 无法获取队列状态:', statusError.message);
      }
    }, 2000);

  } catch (error) {
    console.error('❌ 触发队列处理时发生错误:', error);
  }
}

// 运行触发
triggerQueueProcessing();
