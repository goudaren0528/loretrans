#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 为文档翻译添加"积分已扣除"的多语言支持...');

// 1. 添加英文翻译键到 en.json
const enFilePath = path.join(__dirname, 'frontend/messages/en.json');
let enContent = fs.readFileSync(enFilePath, 'utf8');
let enJson = JSON.parse(enContent);

// 确保 DocumentTranslation.credits 存在
if (!enJson.DocumentTranslation) {
  enJson.DocumentTranslation = {};
}
if (!enJson.DocumentTranslation.credits) {
  enJson.DocumentTranslation.credits = {};
}

// 添加积分扣除相关的翻译
enJson.DocumentTranslation.credits = {
  ...enJson.DocumentTranslation.credits,
  "deducted_title": "Credits Deducted",
  "deducted_description": "This translation consumed {consumed} credits, remaining {remaining} credits"
};

// 写回英文文件
fs.writeFileSync(enFilePath, JSON.stringify(enJson, null, 2), 'utf8');
console.log('✅ 已添加英文积分扣除提示');

// 2. 添加中文翻译键到 zh.json
const zhFilePath = path.join(__dirname, 'frontend/messages/zh.json');
let zhContent = fs.readFileSync(zhFilePath, 'utf8');
let zhJson = JSON.parse(zhContent);

// 确保 DocumentTranslation.credits 存在
if (!zhJson.DocumentTranslation) {
  zhJson.DocumentTranslation = {};
}
if (!zhJson.DocumentTranslation.credits) {
  zhJson.DocumentTranslation.credits = {};
}

// 添加中文积分扣除相关的翻译
zhJson.DocumentTranslation.credits = {
  ...zhJson.DocumentTranslation.credits,
  "deducted_title": "积分已扣除",
  "deducted_description": "本次翻译消耗 {consumed} 积分，剩余 {remaining} 积分"
};

// 写回中文文件
fs.writeFileSync(zhFilePath, JSON.stringify(zhJson, null, 2), 'utf8');
console.log('✅ 已添加中文积分扣除提示');

console.log('\n📊 积分扣除多语言支持添加总结:');
console.log('- ✅ 英文提示: "Credits Deducted", "This translation consumed {consumed} credits, remaining {remaining} credits"');
console.log('- ✅ 中文提示: "积分已扣除", "本次翻译消耗 {consumed} 积分，剩余 {remaining} 积分"');
console.log('- ✅ 支持参数替换: {consumed}, {remaining}');
console.log('- ✅ 统一的多语言键名: DocumentTranslation.credits.deducted_*');
console.log('\n✅ 多语言文件更新完成');
