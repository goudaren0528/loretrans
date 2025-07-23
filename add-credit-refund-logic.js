#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const routeFilePath = path.join(__dirname, 'frontend/app/api/translate/route.ts');

console.log('🔧 为文本翻译添加积分退还逻辑...');

// 读取当前文件内容
let content = fs.readFileSync(routeFilePath, 'utf8');

// 查找任务创建部分，添加积分信息到任务中
const oldJobCreation = `      userId: user?.id || null,
      creditsUsed: creditsRequired,
      userCredits: user ? userCredits : 0,
      characterCount`;

const newJobCreation = `      userId: user?.id || null,
      creditsUsed: creditsRequired,
      userCredits: user ? userCredits : 0,
      originalUserCredits: user ? userCredits : 0, // 保存原始积分用于退还
      characterCount`;

if (content.includes(oldJobCreation)) {
  content = content.replace(oldJobCreation, newJobCreation);
  console.log('✅ 已更新任务创建，添加原始积分信息');
}

// 查找错误处理部分，添加积分退还逻辑
const oldErrorHandling = `    // 翻译失败时退还积分 (与文档翻译相同的逻辑)
    if (job.userId && job.creditsUsed > 0) {
      try {
        console.log(\`[Text Translation] 翻译失败，退还积分: \${job.creditsUsed}\`)
        const supabase = createSupabaseAdminClient()
        const { error: refundError } = await supabase
          .from('users')
          .update({ credits: job.userCredits + job.creditsUsed }) // 恢复积分
          .eq('id', job.userId)

        if (refundError) {
          console.error(\`[Text Translation] 退还积分失败: \${jobId}\`, refundError)
        } else {
          console.log(\`[Text Translation] 翻译失败，已退还积分: \${job.creditsUsed} 积分给用户 \${job.userId}\`)
        }
      } catch (refundException) {
        console.error(\`[Text Translation] 积分退还异常: \${jobId}\`, refundException)
      }
    }`;

const newErrorHandling = `    // 翻译失败时退还积分 (与文档翻译相同的逻辑)
    if (job.userId && job.creditsUsed > 0) {
      try {
        console.log(\`[Text Translation] 翻译失败，退还积分: \${job.creditsUsed}\`)
        const supabase = createSupabaseAdminClient()
        
        // 查询当前用户积分
        const { data: userData, error: queryError } = await supabase
          .from('users')
          .select('credits')
          .eq('id', job.userId)
          .single()

        if (queryError) {
          console.error(\`[Text Translation] 查询用户积分失败: \${jobId}\`, queryError)
        } else if (userData) {
          // 计算退还后的积分
          const newCredits = userData.credits + job.creditsUsed
          
          // 更新用户积分
          const { error: refundError } = await supabase
            .from('users')
            .update({ 
              credits: newCredits
            })
            .eq('id', job.userId)

          if (refundError) {
            console.error(\`[Text Translation] 退还积分失败: \${jobId}\`, refundError)
          } else {
            console.log(\`[Text Translation] 翻译失败，已退还积分: \${job.creditsUsed} 积分给用户 \${job.userId} (\${userData.credits} -> \${newCredits})\`)
          }
        }
      } catch (refundException) {
        console.error(\`[Text Translation] 积分退还异常: \${jobId}\`, refundException)
      }
    }`;

// 查找现有的错误处理逻辑并替换
if (content.includes('翻译失败时退还积分 (与文档翻译相同的逻辑)')) {
  content = content.replace(oldErrorHandling, newErrorHandling);
  console.log('✅ 已更新积分退还逻辑');
} else {
  // 如果没有找到现有逻辑，查找错误处理位置并添加
  const errorHandlingMarker = 'job.error = error instanceof Error ? error.message : \'翻译失败\'';
  const errorHandlingIndex = content.indexOf(errorHandlingMarker);
  
  if (errorHandlingIndex !== -1) {
    const insertPosition = content.indexOf('job.updatedAt = new Date()', errorHandlingIndex) + 'job.updatedAt = new Date()'.length;
    const beforeInsert = content.substring(0, insertPosition);
    const afterInsert = content.substring(insertPosition);
    
    content = beforeInsert + '\n    \n' + newErrorHandling + '\n' + afterInsert;
    console.log('✅ 已添加积分退还逻辑到错误处理');
  }
}

// 写回文件
fs.writeFileSync(routeFilePath, content, 'utf8');

console.log('✅ 积分退还逻辑添加完成');
console.log('🔄 请重启开发服务器以应用更改');
