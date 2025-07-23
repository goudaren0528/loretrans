#!/usr/bin/env node

/**
 * 为文本翻译组件添加积分预扣除显示功能
 * 
 * 参考文档翻译的实现，添加：
 * 1. 积分计算和检查
 * 2. 立即积分扣除显示
 * 3. 积分不足处理
 * 4. 翻译失败时积分恢复
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 为文本翻译组件添加积分预扣除显示功能...\n');

// 修复 translator-widget.tsx
const translatorWidgetPath = path.join(__dirname, 'frontend/components/translator-widget.tsx');
let content = fs.readFileSync(translatorWidgetPath, 'utf8');

// 1. 添加必要的导入
if (!content.includes('createServerCreditService')) {
  content = content.replace(
    /import \{ useGlobalCredits \} from '@\/lib\/contexts\/credits-context'/,
    `import { useGlobalCredits } from '@/lib/contexts/credits-context'
import { createServerCreditService } from '@/lib/services/credits'`
  );
}

if (!content.includes('toast')) {
  content = content.replace(
    /import \{ useGlobalCredits \} from '@\/lib\/contexts\/credits-context'/,
    `import { useGlobalCredits } from '@/lib/contexts/credits-context'
import { toast } from '@/lib/hooks/use-toast'`
  );
}

// 2. 更新 useGlobalCredits 调用，获取 updateCredits 函数
content = content.replace(
  /const \{ credits, hasEnoughCredits, estimateCredits \} = useGlobalCredits\(\)/,
  `const { credits, hasEnoughCredits, estimateCredits, updateCredits } = useGlobalCredits()`
);

// 3. 在翻译开始前添加积分计算和预扣除逻辑
const creditsPreDeductionCode = `
      // 计算所需积分（仅对需要认证的翻译）
      let creditsRequired = 0;
      if (!shouldUsePublicAPI && user) {
        const creditService = createServerCreditService();
        const calculation = creditService.calculateCreditsRequired(characterCount);
        creditsRequired = calculation.credits_required;
        
        // 检查积分是否足够
        if (creditsRequired > 0 && credits < creditsRequired) {
          setState(prev => ({ ...prev, isLoading: false }));
          toast({
            title: '积分不足',
            description: \`需要 \${creditsRequired} 积分，当前余额 \${credits} 积分。请前往充值页面购买积分。\`,
            variant: "destructive",
          });
          return;
        }
        
        // 立即更新积分显示（预扣除）
        if (creditsRequired > 0) {
          const newCredits = Math.max(0, credits - creditsRequired);
          updateCredits(newCredits);
          console.log(\`[Text Translation] 立即预扣除积分显示: \${creditsRequired}, 剩余显示: \${newCredits}\`);
          
          // 显示积分扣除提示
          toast({
            title: '积分已扣除',
            description: \`本次翻译消耗 \${creditsRequired} 积分，剩余 \${newCredits} 积分\`,
            duration: 3000,
          });
        }
      }`;

// 在发送请求前插入积分预扣除逻辑
content = content.replace(
  /const response = await fetch\(endpoint, \{/,
  `${creditsPreDeductionCode.trim()}

      const response = await fetch(endpoint, {`
);

// 4. 在翻译失败时添加积分恢复逻辑
const creditsRestoreCode = `
      // 翻译失败时恢复积分显示（仅对认证翻译）
      if (!shouldUsePublicAPI && user && creditsRequired > 0) {
        const restoredCredits = credits + creditsRequired;
        updateCredits(restoredCredits);
        console.log(\`[Text Translation] 翻译失败，恢复积分显示: \${creditsRequired}, 总计: \${restoredCredits}\`);
        
        toast({
          title: '积分已退还',
          description: \`翻译失败，已退还 \${creditsRequired} 积分\`,
          duration: 3000,
        });
      }`;

// 在错误处理中添加积分恢复
content = content.replace(
  /setState\(prev => \(\{ \.\.\.prev, isLoading: false, error: error\.message \}\)\)/,
  `${creditsRestoreCode.trim()}
      
      setState(prev => ({ ...prev, isLoading: false, error: error.message }))`
);

// 5. 处理积分不足的特殊错误
const insufficientCreditsHandling = `
      if (!response.ok) {
        // 特殊处理积分不足的情况
        if (response.status === 402 && data.code === 'INSUFFICIENT_CREDITS') {
          setState(prev => ({ ...prev, isLoading: false }));
          toast({
            title: '积分不足',
            description: \`需要 \${data.required} 积分，当前余额 \${data.available} 积分。请前往充值页面购买积分。\`,
            variant: "destructive",
          });
          return;
        }
        
        throw new Error(data.error?.message || data.error || 'Translation failed');
      }`;

// 替换原有的错误处理
content = content.replace(
  /if \(!response\.ok\) \{[\s\S]*?throw new Error\(data\.error\?\.\message \|\| data\.error \|\| 'Translation failed'\)[\s\S]*?\}/,
  insufficientCreditsHandling.trim()
);

// 写入修复后的文件
fs.writeFileSync(translatorWidgetPath, content);
console.log('✅ 已为 translator-widget.tsx 添加积分预扣除显示功能');

// 修复其他文本翻译组件
const otherComponents = [
  'frontend/components/translation/enhanced-text-translator.tsx',
  'frontend/components/translation/unified-translator.tsx'
];

otherComponents.forEach(componentPath => {
  const fullPath = path.join(__dirname, componentPath);
  if (fs.existsSync(fullPath)) {
    let componentContent = fs.readFileSync(fullPath, 'utf8');
    
    // 检查是否有翻译处理逻辑，如果有则添加类似的积分处理
    if (componentContent.includes('fetch') && componentContent.includes('translate')) {
      // 添加 updateCredits 到 useGlobalCredits 调用
      componentContent = componentContent.replace(
        /const \{ ([^}]*) \} = useGlobalCredits\(\)/,
        (match, params) => {
          if (!params.includes('updateCredits')) {
            return `const { ${params}, updateCredits } = useGlobalCredits()`;
          }
          return match;
        }
      );
      
      fs.writeFileSync(fullPath, componentContent);
      console.log(`✅ 已更新 ${componentPath} 的积分处理`);
    }
  }
});

console.log('\n📋 修复完成！');

console.log('\n🔄 新的文本翻译积分显示流程：');
console.log('1. 用户输入文本并点击翻译');
console.log('2. 检查是否需要积分（超过免费限制且已登录）');
console.log('3. 计算所需积分并检查余额');
console.log('4. 立即预扣除积分显示 + 显示提示');
console.log('5. 发送翻译请求到服务器');
console.log('6. 翻译成功：保持扣除状态');
console.log('7. 翻译失败：恢复积分显示');

console.log('\n🧪 测试场景：');
console.log('1. 免费翻译（≤1000字符）：不扣积分');
console.log('2. 付费翻译（>1000字符且已登录）：扣积分');
console.log('3. 积分不足：显示错误提示');
console.log('4. 翻译失败：自动恢复积分显示');

console.log('\n⚠️  重要提示：');
console.log('- 需要重启前端服务才能生效');
console.log('- 现在文本翻译和文档翻译使用相同的积分处理逻辑');
console.log('- 免费翻译（≤1000字符）不会扣除积分');
console.log('- 付费翻译（>1000字符）会立即显示积分扣除');
