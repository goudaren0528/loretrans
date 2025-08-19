#!/usr/bin/env node

/**
 * SEO优化验证脚本
 * 用于验证优化后的页面是否符合SEO最佳实践
 */

const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, 'frontend/app/[locale]');

// 验证规则配置
const SEO_RULES = {
  title: {
    minLength: 30,
    maxLength: 60,
    shouldInclude: ['free', 'online', 'translator', 'instant'],
    shouldAvoid: ['|', 'LoReTrans'] // 避免品牌名占用太多字符
  },
  description: {
    minLength: 120,
    maxLength: 160,
    shouldInclude: ['free', 'instant', 'accurate', 'try'],
    shouldAvoid: ['click here', 'read more']
  },
  keywords: {
    minCount: 5,
    maxCount: 10,
    shouldInclude: ['translation', 'translator', 'free']
  },
  structuredData: {
    requiredTypes: ['WebPage', 'FAQPage'],
    optionalTypes: ['Organization']
  },
  content: {
    requiredHeadings: ['h1', 'h2'],
    minFAQCount: 3,
    shouldIncludeKeywords: true
  }
};

function extractMetadata(content) {
  const metadata = {};
  
  // 提取 title
  const titleMatch = content.match(/title:\s*['"`]([^'"`]+)['"`]/);
  metadata.title = titleMatch ? titleMatch[1] : '';
  
  // 提取 description
  const descMatch = content.match(/description:\s*['"`]([^'"`]+)['"`]/);
  metadata.description = descMatch ? descMatch[1] : '';
  
  // 提取 keywords
  const keywordsMatch = content.match(/keywords:\s*\[([\s\S]*?)\]/);
  if (keywordsMatch) {
    const keywordsStr = keywordsMatch[1];
    metadata.keywords = keywordsStr.match(/['"`]([^'"`]+)['"`]/g)?.map(k => k.slice(1, -1)) || [];
  } else {
    metadata.keywords = [];
  }
  
  // 检查结构化数据
  const structuredDataMatch = content.match(/"application\/ld\+json":\s*JSON\.stringify\(\[([\s\S]*?)\]\)/);
  metadata.hasStructuredData = !!structuredDataMatch;
  
  if (structuredDataMatch) {
    const structuredDataStr = structuredDataMatch[1];
    metadata.structuredDataTypes = [];
    if (structuredDataStr.includes('"@type": "WebPage"')) metadata.structuredDataTypes.push('WebPage');
    if (structuredDataStr.includes('"@type": "FAQPage"')) metadata.structuredDataTypes.push('FAQPage');
    if (structuredDataStr.includes('"@type": "Organization"')) metadata.structuredDataTypes.push('Organization');
  }
  
  // 检查 FAQ 数量
  const faqMatches = content.match(/question:\s*["'`]([^"'`]+)["'`]/g);
  metadata.faqCount = faqMatches ? faqMatches.length : 0;
  
  // 检查 H1 标签
  const h1Match = content.match(/<h1[^>]*>([^<]+)<\/h1>/);
  metadata.h1 = h1Match ? h1Match[1] : '';
  
  // 检查 H2 标签数量
  const h2Matches = content.match(/<h2[^>]*>([^<]+)<\/h2>/g);
  metadata.h2Count = h2Matches ? h2Matches.length : 0;
  
  return metadata;
}

function validateTitle(title) {
  const issues = [];
  const suggestions = [];
  
  if (title.length < SEO_RULES.title.minLength) {
    issues.push(`标题太短 (${title.length} < ${SEO_RULES.title.minLength})`);
  }
  
  if (title.length > SEO_RULES.title.maxLength) {
    issues.push(`标题太长 (${title.length} > ${SEO_RULES.title.maxLength})`);
  }
  
  SEO_RULES.title.shouldInclude.forEach(keyword => {
    if (!title.toLowerCase().includes(keyword)) {
      suggestions.push(`建议包含关键词: "${keyword}"`);
    }
  });
  
  SEO_RULES.title.shouldAvoid.forEach(avoid => {
    if (title.includes(avoid)) {
      suggestions.push(`建议避免使用: "${avoid}"`);
    }
  });
  
  return { issues, suggestions };
}

function validateDescription(description) {
  const issues = [];
  const suggestions = [];
  
  if (description.length < SEO_RULES.description.minLength) {
    issues.push(`描述太短 (${description.length} < ${SEO_RULES.description.minLength})`);
  }
  
  if (description.length > SEO_RULES.description.maxLength) {
    issues.push(`描述太长 (${description.length} > ${SEO_RULES.description.maxLength})`);
  }
  
  SEO_RULES.description.shouldInclude.forEach(keyword => {
    if (!description.toLowerCase().includes(keyword)) {
      suggestions.push(`建议包含关键词: "${keyword}"`);
    }
  });
  
  return { issues, suggestions };
}

function validateKeywords(keywords) {
  const issues = [];
  const suggestions = [];
  
  if (keywords.length < SEO_RULES.keywords.minCount) {
    issues.push(`关键词太少 (${keywords.length} < ${SEO_RULES.keywords.minCount})`);
  }
  
  if (keywords.length > SEO_RULES.keywords.maxCount) {
    issues.push(`关键词太多 (${keywords.length} > ${SEO_RULES.keywords.maxCount})`);
  }
  
  SEO_RULES.keywords.shouldInclude.forEach(keyword => {
    const hasKeyword = keywords.some(k => k.toLowerCase().includes(keyword));
    if (!hasKeyword) {
      suggestions.push(`建议包含相关关键词: "${keyword}"`);
    }
  });
  
  return { issues, suggestions };
}

function validateStructuredData(metadata) {
  const issues = [];
  const suggestions = [];
  
  if (!metadata.hasStructuredData) {
    issues.push('缺少结构化数据');
    return { issues, suggestions };
  }
  
  SEO_RULES.structuredData.requiredTypes.forEach(type => {
    if (!metadata.structuredDataTypes.includes(type)) {
      issues.push(`缺少必需的结构化数据类型: ${type}`);
    }
  });
  
  SEO_RULES.structuredData.optionalTypes.forEach(type => {
    if (!metadata.structuredDataTypes.includes(type)) {
      suggestions.push(`建议添加结构化数据类型: ${type}`);
    }
  });
  
  return { issues, suggestions };
}

function validateContent(metadata) {
  const issues = [];
  const suggestions = [];
  
  if (!metadata.h1) {
    issues.push('缺少 H1 标题');
  }
  
  if (metadata.h2Count < 2) {
    suggestions.push(`建议增加 H2 标题 (当前: ${metadata.h2Count})`);
  }
  
  if (metadata.faqCount < SEO_RULES.content.minFAQCount) {
    suggestions.push(`建议增加 FAQ 数量 (当前: ${metadata.faqCount})`);
  }
  
  return { issues, suggestions };
}

function validatePage(pageName, filePath) {
  console.log(`\n🔍 验证页面: ${pageName}`);
  console.log(`文件路径: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ 文件不存在`);
    return { score: 0, issues: ['文件不存在'], suggestions: [] };
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const metadata = extractMetadata(content);
  
  console.log(`📊 提取的元数据:`);
  console.log(`- 标题: "${metadata.title}" (${metadata.title.length} 字符)`);
  console.log(`- 描述: "${metadata.description}" (${metadata.description.length} 字符)`);
  console.log(`- 关键词: ${metadata.keywords.length} 个`);
  console.log(`- 结构化数据: ${metadata.hasStructuredData ? '✅' : '❌'}`);
  console.log(`- FAQ 数量: ${metadata.faqCount}`);
  console.log(`- H1: "${metadata.h1}"`);
  console.log(`- H2 数量: ${metadata.h2Count}`);
  
  // 执行各项验证
  const titleValidation = validateTitle(metadata.title);
  const descValidation = validateDescription(metadata.description);
  const keywordsValidation = validateKeywords(metadata.keywords);
  const structuredDataValidation = validateStructuredData(metadata);
  const contentValidation = validateContent(metadata);
  
  // 汇总结果
  const allIssues = [
    ...titleValidation.issues,
    ...descValidation.issues,
    ...keywordsValidation.issues,
    ...structuredDataValidation.issues,
    ...contentValidation.issues
  ];
  
  const allSuggestions = [
    ...titleValidation.suggestions,
    ...descValidation.suggestions,
    ...keywordsValidation.suggestions,
    ...structuredDataValidation.suggestions,
    ...contentValidation.suggestions
  ];
  
  // 计算得分
  const maxScore = 100;
  const issueWeight = 10;
  const suggestionWeight = 2;
  
  const score = Math.max(0, maxScore - (allIssues.length * issueWeight) - (allSuggestions.length * suggestionWeight));
  
  // 输出结果
  console.log(`\n📈 SEO 得分: ${score}/100`);
  
  if (allIssues.length > 0) {
    console.log(`\n❌ 发现问题 (${allIssues.length}):`);
    allIssues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`);
    });
  }
  
  if (allSuggestions.length > 0) {
    console.log(`\n💡 优化建议 (${allSuggestions.length}):`);
    allSuggestions.forEach((suggestion, index) => {
      console.log(`   ${index + 1}. ${suggestion}`);
    });
  }
  
  if (allIssues.length === 0 && allSuggestions.length === 0) {
    console.log(`\n🎉 页面SEO优化完美！`);
  }
  
  return { score, issues: allIssues, suggestions: allSuggestions, metadata };
}

function main() {
  console.log(`🔍 开始SEO优化验证...`);
  
  const pagesToCheck = [
    {
      name: 'Nepali to English',
      path: path.join(FRONTEND_DIR, 'nepali-to-english/page.tsx')
    },
    {
      name: 'English to Khmer',
      path: path.join(FRONTEND_DIR, 'english-to-khmer/page.tsx')
    }
  ];
  
  const results = [];
  
  for (const page of pagesToCheck) {
    const result = validatePage(page.name, page.path);
    results.push({ ...page, ...result });
  }
  
  // 生成总结报告
  console.log(`\n📊 验证总结报告`);
  console.log(`==========================================`);
  
  const totalScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
  console.log(`平均SEO得分: ${totalScore.toFixed(1)}/100`);
  
  results.forEach(result => {
    console.log(`\n${result.name}: ${result.score}/100`);
    if (result.issues.length > 0) {
      console.log(`  ❌ 问题: ${result.issues.length}`);
    }
    if (result.suggestions.length > 0) {
      console.log(`  💡 建议: ${result.suggestions.length}`);
    }
  });
  
  if (totalScore >= 90) {
    console.log(`\n🎉 优秀！SEO优化效果很好`);
  } else if (totalScore >= 70) {
    console.log(`\n👍 良好！还有一些优化空间`);
  } else {
    console.log(`\n⚠️  需要改进！请根据建议进行优化`);
  }
  
  console.log(`\n🔗 推荐验证工具:`);
  console.log(`- Google Rich Results Test: https://search.google.com/test/rich-results`);
  console.log(`- PageSpeed Insights: https://pagespeed.web.dev/`);
  console.log(`- SEO Meta Tags Checker: https://www.seoptimer.com/meta-tag-checker`);
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = {
  validatePage,
  extractMetadata
};
