#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 为文档翻译添加多语言积分不足提示...');

// 1. 添加英文翻译键到 en.json
const enFilePath = path.join(__dirname, 'frontend/messages/en.json');
let enContent = fs.readFileSync(enFilePath, 'utf8');
let enJson = JSON.parse(enContent);

// 在 DocumentTranslation 部分添加积分相关提示
if (!enJson.DocumentTranslation) {
  enJson.DocumentTranslation = {};
}

if (!enJson.DocumentTranslation.credits) {
  enJson.DocumentTranslation.credits = {};
}

// 添加积分不足相关的翻译
enJson.DocumentTranslation.credits = {
  ...enJson.DocumentTranslation.credits,
  "insufficient_title": "Insufficient Credits",
  "insufficient_description": "Need {required} credits, current balance {available} credits. Please go to the recharge page to purchase credits.",
  "insufficient_error": "Insufficient credits: need {required} credits, current balance {available} credits",
  "recharge_page": "Recharge Page"
};

// 写回英文文件
fs.writeFileSync(enFilePath, JSON.stringify(enJson, null, 2), 'utf8');
console.log('✅ 已添加英文积分不足提示');

// 2. 添加中文翻译键到 zh.json
const zhFilePath = path.join(__dirname, 'frontend/messages/zh.json');
let zhContent = fs.readFileSync(zhFilePath, 'utf8');
let zhJson = JSON.parse(zhContent);

if (!zhJson.DocumentTranslation) {
  zhJson.DocumentTranslation = {};
}

if (!zhJson.DocumentTranslation.credits) {
  zhJson.DocumentTranslation.credits = {};
}

// 添加中文积分不足相关的翻译
zhJson.DocumentTranslation.credits = {
  ...zhJson.DocumentTranslation.credits,
  "insufficient_title": "积分不足",
  "insufficient_description": "需要 {required} 积分，当前余额 {available} 积分。请前往充值页面购买积分。",
  "insufficient_error": "积分不足：需要 {required} 积分，当前余额 {available} 积分",
  "recharge_page": "充值页面"
};

// 写回中文文件
fs.writeFileSync(zhFilePath, JSON.stringify(zhJson, null, 2), 'utf8');
console.log('✅ 已添加中文积分不足提示');

console.log('\n📊 多语言积分提示添加总结:');
console.log('- ✅ 英文提示: insufficient_title, insufficient_description, insufficient_error');
console.log('- ✅ 中文提示: 积分不足标题、描述、错误信息');
console.log('- ✅ 支持参数替换: {required}, {available}');
console.log('- ✅ 统一的多语言键名');
console.log('\n✅ 多语言文件更新完成');
