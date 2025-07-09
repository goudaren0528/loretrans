#!/usr/bin/env node

/**
 * 更新多语言文件中的字符限制
 * 从300字符更新为1000字符
 */

const fs = require('fs');
const path = require('path');

const messagesDir = '/home/hwt/translation-low-source/frontend/messages';

// 需要更新的模式和替换规则
const updateRules = [
  // 基本的300字符替换为1000字符
  {
    pattern: /300 free characters/g,
    replacement: '1000 free characters',
    description: '免费字符数描述'
  },
  {
    pattern: /Free up to 300 characters/g,
    replacement: 'Free up to 1000 characters',
    description: '免费字符上限'
  },
  {
    pattern: /up to 300 characters per request/g,
    replacement: 'up to 1000 characters per request',
    description: '每次请求字符限制'
  },
  {
    pattern: /300 free characters per translation/g,
    replacement: '1000 free characters per translation',
    description: '每次翻译免费字符'
  },
  {
    pattern: /Up to 300 characters free/g,
    replacement: 'Up to 1000 characters free',
    description: '免费字符数量'
  },
  
  // 计算相关的更新 (需要重新计算)
  {
    pattern: /300 free \+ 700×0\.1/g,
    replacement: '1000 free + 0×0.1',
    description: '1000字符计算示例'
  },
  {
    pattern: /1000-character text costs 70 credits \(300 free \+ 700×0\.1\)/g,
    replacement: '1000-character text costs 0 credits (1000 free + 0×0.1)',
    description: '1000字符成本计算'
  },
  
  // FAQ中的具体描述
  {
    pattern: /No account needed for 300-character translations/g,
    replacement: 'No account needed for 1000-character translations',
    description: '无需账户的字符限制'
  },
  {
    pattern: /Credits are used for translations over 300 characters/g,
    replacement: 'Credits are used for translations over 1000 characters',
    description: '积分使用门槛'
  },
  {
    pattern: /Text under 300 characters/g,
    replacement: 'Text under 1000 characters',
    description: '免费文本长度'
  },
  {
    pattern: /over 300 characters/g,
    replacement: 'over 1000 characters',
    description: '超过字符限制'
  },
  
  // 更复杂的计算示例需要重新计算
  {
    pattern: /translating 1000 characters requires 70 credits/g,
    replacement: 'translating 1000 characters requires 0 credits',
    description: '1000字符翻译成本'
  },
  {
    pattern: /For example, a 1000-character text would cost 70 credits \(300 free \+ 700×0\.1 = 70 credits\)/g,
    replacement: 'For example, a 1000-character text would cost 0 credits (1000 free + 0×0.1 = 0 credits)',
    description: '1000字符详细计算'
  }
];

// 特殊的数值更新规则（需要重新计算的复杂情况）
const complexUpdates = [
  {
    // 更新成本比较中的计算
    pattern: /1000 characters × \$0\.001\/char \(300 free \+ 700×0\.001\)/g,
    replacement: '1000 characters × $0.001/char (1000 free + 0×0.001)',
    description: '成本比较计算'
  }
];

async function updateLanguageFile(filePath) {
  console.log(`\n📝 更新文件: ${path.basename(filePath)}`);
  
  try {
    // 读取文件
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    let changeCount = 0;
    
    // 应用所有更新规则
    [...updateRules, ...complexUpdates].forEach(rule => {
      const matches = updatedContent.match(rule.pattern);
      if (matches) {
        console.log(`  ✅ 找到 ${matches.length} 处: ${rule.description}`);
        updatedContent = updatedContent.replace(rule.pattern, rule.replacement);
        changeCount += matches.length;
      }
    });
    
    // 如果有更改，写回文件
    if (changeCount > 0) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`  🎯 总共更新了 ${changeCount} 处内容`);
    } else {
      console.log(`  ℹ️  没有找到需要更新的内容`);
    }
    
    return changeCount;
    
  } catch (error) {
    console.error(`  ❌ 更新失败: ${error.message}`);
    return 0;
  }
}

async function main() {
  console.log('🔄 开始更新多语言文件中的字符限制...');
  console.log('📊 更新规则: 300字符 → 1000字符\n');
  
  // 获取所有语言文件
  const files = fs.readdirSync(messagesDir)
    .filter(file => file.endsWith('.json') && !file.includes('.backup'))
    .map(file => path.join(messagesDir, file));
  
  console.log(`📁 找到 ${files.length} 个语言文件:`);
  files.forEach(file => console.log(`   - ${path.basename(file)}`));
  
  let totalChanges = 0;
  
  // 更新每个文件
  for (const file of files) {
    const changes = await updateLanguageFile(file);
    totalChanges += changes;
  }
  
  console.log('\n📊 更新总结:');
  console.log(`✅ 处理了 ${files.length} 个语言文件`);
  console.log(`🎯 总共更新了 ${totalChanges} 处内容`);
  
  if (totalChanges > 0) {
    console.log('\n🎉 更新完成！所有语言文件已同步新的字符限制。');
    console.log('\n📋 主要更新内容:');
    console.log('- 免费字符限制: 300 → 1000');
    console.log('- 相关计算示例已重新计算');
    console.log('- FAQ内容已更新');
    console.log('- 产品描述已同步');
  } else {
    console.log('\n ℹ️ 没有找到需要更新的内容，可能已经是最新的。');
  }
  
  console.log('\n🔍 建议手动检查:');
  console.log('- 复杂的计算示例是否正确');
  console.log('- 营销文案是否需要调整');
  console.log('- 用户体验描述是否一致');
}

main().catch(console.error);
