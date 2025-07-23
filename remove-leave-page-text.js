#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/components/translation/enhanced-text-translator.tsx');

console.log('🔧 移除文本翻译界面中的"you can leave this page"相关文案...');

// 读取文件内容
let content = fs.readFileSync(filePath, 'utf8');

// 修改toast消息，移除"you can leave this page"部分
const oldToast = `        toast({
          title: "Translation queued",
          description: "Your translation has been added to the queue. You can leave this page and come back later.",
        })`;

const newToast = `        toast({
          title: "Translation queued",
          description: "Your translation has been added to the queue.",
        })`;

if (content.includes(oldToast)) {
  content = content.replace(oldToast, newToast);
  console.log('✅ 已修改toast消息');
} else {
  console.log('⚠️  未找到预期的toast消息');
}

// 移除界面上的提示文案
const oldHint = `              {willUseQueue && user && (
                <p className="mt-1 text-sm">
                  You can leave this page and return later to check your translation progress.
                </p>
              )}`;

const newHint = `              {willUseQueue && user && (
                <p className="mt-1 text-sm">
                  Your translation will be processed in the background.
                </p>
              )}`;

if (content.includes(oldHint)) {
  content = content.replace(oldHint, newHint);
  console.log('✅ 已修改界面提示文案');
} else {
  console.log('⚠️  未找到预期的界面提示文案');
}

// 写回文件
fs.writeFileSync(filePath, content, 'utf8');

console.log('\n📊 文本翻译界面文案修改总结:');
console.log('- ✅ Toast消息: 移除"you can leave this page"');
console.log('- ✅ 界面提示: 改为"processed in the background"');
console.log('- ✅ 用户体验: 更简洁的提示信息');
console.log('\n✅ 文案修改完成');
