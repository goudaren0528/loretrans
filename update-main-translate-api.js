#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

console.log('🔧 更新主翻译API支持队列重定向...\n');

async function updateMainTranslationAPI() {
    const mainAPIPath = path.join(__dirname, 'frontend/app/api/translate/route.ts');
    
    try {
        let content = await fs.readFile(mainAPIPath, 'utf8');
        
        // 添加队列重定向逻辑
        const queueRedirectCode = `
    // 长文本检测和队列重定向
    if (text.length > 1000) { // 超过1000字符使用队列处理
      console.log(\`[Translation] 长文本检测: \${text.length}字符，重定向到队列处理\`);
      
      try {
        const queueResponse = await fetch(\`\${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/translate/queue\`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            sourceLanguage: sourceLang,
            targetLanguage: targetLang
          })
        });
        
        const queueResult = await queueResponse.json();
        
        if (queueResult.success) {
          return NextResponse.json({
            success: true,
            useQueue: true,
            jobId: queueResult.jobId,
            estimatedTime: queueResult.estimatedTime,
            totalChunks: queueResult.totalChunks,
            message: '文本较长，已转入后台队列处理，请稍后查询结果'
          });
        }
      } catch (queueError) {
        console.error('[Translation] 队列处理失败，回退到直接处理:', queueError);
        // 继续使用原有逻辑，但使用更小的分块
      }
    }`;

        // 查找合适的插入位置
        const insertPoint = content.indexOf('console.log(`\\n🌍 增强翻译开始:');
        if (insertPoint > -1) {
            const beforeInsert = content.slice(0, insertPoint);
            const afterInsert = content.slice(insertPoint);
            content = beforeInsert + queueRedirectCode + '\n\n    ' + afterInsert;
        } else {
            // 如果找不到特定位置，在POST函数开始后插入
            const postFunctionStart = content.indexOf('export async function POST(request: NextRequest) {');
            if (postFunctionStart > -1) {
                const functionBodyStart = content.indexOf('{', postFunctionStart) + 1;
                const beforeInsert = content.slice(0, functionBodyStart);
                const afterInsert = content.slice(functionBodyStart);
                content = beforeInsert + '\n  try {' + queueRedirectCode + '\n\n' + afterInsert.replace('try {', '');
            }
        }

        await fs.writeFile(mainAPIPath, content, 'utf8');
        console.log('✅ 已更新主翻译API支持队列重定向');
        
    } catch (error) {
        console.error('❌ 更新主翻译API失败:', error.message);
    }
}

async function main() {
    console.log('🎯 更新主翻译API');
    console.log('');
    console.log('📋 更新内容:');
    console.log('1. 添加长文本检测 (>1000字符)');
    console.log('2. 自动重定向到队列处理');
    console.log('3. 返回队列任务ID和状态');
    console.log('4. 保持短文本直接处理');
    console.log('');
    
    await updateMainTranslationAPI();
    
    console.log('\n✅ 主翻译API更新完成！');
    console.log('\n🔄 工作流程:');
    console.log('短文本 (<1000字符) → 直接翻译');
    console.log('长文本 (>1000字符) → 队列处理 → 轮询状态');
}

main().catch(console.error);
