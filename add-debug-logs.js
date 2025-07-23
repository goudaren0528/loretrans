#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const routeFilePath = path.join(__dirname, 'frontend/app/api/translate/route.ts');

console.log('🔧 添加调试日志来验证积分检查逻辑...');

// 读取当前文件内容
let content = fs.readFileSync(routeFilePath, 'utf8');

// 在积分检查逻辑前添加调试日志
const oldLogic = `    // 积分检查和扣除（仅对登录用户，与文档翻译逻辑完全一致）
    if (user) {`;

const newLogic = `    // 积分检查和扣除（仅对登录用户，与文档翻译逻辑完全一致）
    console.log(\`[Text Translation] 积分检查开始: 用户=\${user ? '已登录' : '未登录'}, 字符数=\${characterCount}\`);
    if (user) {
      console.log(\`[Text Translation] 开始为登录用户进行积分检查和扣除\`);`;

if (content.includes(oldLogic)) {
  content = content.replace(oldLogic, newLogic);
  console.log('✅ 已添加积分检查调试日志');
} else {
  console.log('⚠️  未找到预期的积分检查代码');
}

// 在creditsRequired赋值后添加日志
const oldAssignment = `      creditsRequired = calculation.credits_required`;
const newAssignment = `      creditsRequired = calculation.credits_required
      console.log(\`[Text Translation] 积分计算结果: 需要 \${creditsRequired} 积分\`)`;

if (content.includes(oldAssignment)) {
  content = content.replace(oldAssignment, newAssignment);
  console.log('✅ 已添加积分计算结果日志');
}

// 在任务创建时添加积分信息日志
const oldTaskCreation = `      creditsUsed: creditsRequired,`;
const newTaskCreation = `      creditsUsed: creditsRequired,`;

// 在任务创建后添加日志
const taskCreationMarker = 'characterCount';
const taskCreationIndex = content.indexOf(taskCreationMarker);
if (taskCreationIndex !== -1) {
  const insertPosition = content.indexOf('\n', taskCreationIndex) + 1;
  const beforeInsert = content.substring(0, insertPosition);
  const afterInsert = content.substring(insertPosition);
  
  const debugLog = `    
    console.log(\`[Text Translation] 任务创建完成: jobId=\${jobId}, creditsUsed=\${creditsRequired}, userCredits=\${userCredits}\`);
    `;
  
  content = beforeInsert + debugLog + afterInsert;
  console.log('✅ 已添加任务创建调试日志');
}

// 写回文件
fs.writeFileSync(routeFilePath, content, 'utf8');

console.log('✅ 调试日志添加完成');
console.log('🔄 请重启开发服务器以应用更改');
