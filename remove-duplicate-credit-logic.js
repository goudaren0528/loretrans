#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const routeFilePath = path.join(__dirname, 'frontend/app/api/translate/route.ts');

console.log('🔧 移除重复的积分检查逻辑...');

// 读取当前文件内容
let content = fs.readFileSync(routeFilePath, 'utf8');

// 查找并移除第二套积分检查逻辑
const duplicateCreditLogic = `    // 检查用户积分（如果已登录）
    if (user) {
      const creditService = createServerCreditService();
      const hasEnoughCredits = await creditService.hasEnoughCredits(user.id, creditsRequired);
      
      if (!hasEnoughCredits) {
        return NextResponse.json({
          error: '积分不足',
          code: 'INSUFFICIENT_CREDITS',
          required: creditsRequired,
          available: user.credits || 0
        }, { status: 402 });
      }

      // 扣除积分
      const consumeResult = await creditService.consumeTranslationCredits(
        user.id,
        characterCount,
        sourceLang,
        targetLang,
        'text'
      );
      
      if (!consumeResult.success) {
        return NextResponse.json({
          error: '积分扣除失败',
          code: 'CREDIT_DEDUCTION_FAILED',
          details: consumeResult.error
        }, { status: 500 });
      }
      
      console.log(\`[Text Translation] 已扣除积分: \${consumeResult.calculation.creditsRequired} (用户: \${user.id})\`);
    }`;

if (content.includes('const hasEnoughCredits = await creditService.hasEnoughCredits(user.id, creditsRequired);')) {
  // 找到重复逻辑的开始和结束位置
  const startMarker = '    // 检查用户积分（如果已登录）';
  const startIndex = content.indexOf(startMarker);
  
  if (startIndex !== -1) {
    // 找到这个代码块的结束位置
    const endMarker = '    }';
    let endIndex = startIndex;
    let braceCount = 0;
    let foundFirstBrace = false;
    
    // 从开始位置向后查找，计算大括号匹配
    for (let i = startIndex; i < content.length; i++) {
      if (content[i] === '{') {
        foundFirstBrace = true;
        braceCount++;
      } else if (content[i] === '}') {
        if (foundFirstBrace) {
          braceCount--;
          if (braceCount === 0) {
            endIndex = i + 1;
            break;
          }
        }
      }
    }
    
    if (endIndex > startIndex) {
      // 移除重复的积分检查逻辑
      const beforeCode = content.substring(0, startIndex);
      const afterCode = content.substring(endIndex);
      content = beforeCode + afterCode;
      console.log('✅ 已移除重复的积分检查逻辑');
    } else {
      console.log('⚠️  无法确定重复逻辑的结束位置');
    }
  } else {
    console.log('⚠️  未找到重复积分检查逻辑的开始标记');
  }
} else {
  console.log('⚠️  未找到hasEnoughCredits调用，可能已经清理');
}

// 检查是否还有其他的hasEnoughCredits调用
const remainingCalls = content.match(/hasEnoughCredits/g);
if (remainingCalls) {
  console.log(`⚠️  仍有 ${remainingCalls.length} 个hasEnoughCredits调用需要处理`);
} else {
  console.log('✅ 所有hasEnoughCredits调用已清理');
}

// 检查是否还有consumeTranslationCredits调用
const consumeCalls = content.match(/consumeTranslationCredits/g);
if (consumeCalls) {
  console.log(`⚠️  仍有 ${consumeCalls.length} 个consumeTranslationCredits调用需要处理`);
} else {
  console.log('✅ 所有consumeTranslationCredits调用已清理');
}

// 写回文件
fs.writeFileSync(routeFilePath, content, 'utf8');

console.log('✅ 重复积分检查逻辑清理完成');
console.log('🔄 请重启开发服务器以应用更改');
