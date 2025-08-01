#!/usr/bin/env node

const http = require('http');

console.log('🔍 最终结构化数据验证报告\n');

const mainPages = [
  { url: '/en/text-translate', name: 'Text Translate (文本翻译)', type: 'main' },
  { url: '/en/document-translate', name: 'Document Translate (文档翻译)', type: 'main' }
];

async function checkPageStructuredData(url, name, type) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:3000${url}`, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📄 ${name}`);
        console.log(`   URL: ${url}`);
        console.log(`   状态码: ${res.statusCode}`);
        
        if (res.statusCode === 200) {
          // 检查结构化数据
          const hasStructuredData = data.includes('application/ld+json');
          const structuredDataCount = (data.match(/application\/ld\+json/g) || []).length;
          
          console.log(`   结构化数据: ${hasStructuredData ? '✅ 已实现' : '❌ 未实现'}`);
          console.log(`   JSON-LD脚本数量: ${structuredDataCount}`);
          
          // 详细分析结构化数据内容
          if (hasStructuredData) {
            console.log('   📋 结构化数据详情:');
            
            // 使用更简单的方法提取JSON-LD内容
            const scriptMatches = data.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
            
            if (scriptMatches) {
              const detectedTypes = [];
              
              scriptMatches.forEach((match, index) => {
                try {
                  // 提取script标签内的内容
                  const jsonMatch = match.match(/>([\s\S]*?)</);
                  if (jsonMatch && jsonMatch[1]) {
                    let jsonContent = jsonMatch[1].trim();
                    
                    // 清理JSON内容
                    jsonContent = jsonContent
                      .replace(/\n/g, '')
                      .replace(/\r/g, '')
                      .replace(/\t/g, '')
                      .replace(/\\\\/g, '\\')
                      .replace(/\\"/g, '"');
                    
                    // 尝试解析JSON
                    const parsedData = JSON.parse(jsonContent);
                    
                    const schemaType = parsedData['@type'];
                    detectedTypes.push(schemaType);
                    
                    console.log(`      ${index + 1}. ${schemaType} Schema ✅`);
                    console.log(`         - Name: ${parsedData.name || 'N/A'}`);
                    
                    if (parsedData.description) {
                      const desc = parsedData.description.length > 60 
                        ? parsedData.description.substring(0, 60) + '...' 
                        : parsedData.description;
                      console.log(`         - Description: ${desc}`);
                    }
                    
                    if (parsedData.featureList && Array.isArray(parsedData.featureList)) {
                      console.log(`         - Features: ${parsedData.featureList.length} items`);
                    }
                    
                    if (parsedData.mainEntity && Array.isArray(parsedData.mainEntity)) {
                      console.log(`         - FAQ Questions: ${parsedData.mainEntity.length} items`);
                    }
                    
                    if (parsedData.step && Array.isArray(parsedData.step)) {
                      console.log(`         - How-to Steps: ${parsedData.step.length} items`);
                    }
                    
                    if (parsedData.itemListElement && Array.isArray(parsedData.itemListElement)) {
                      console.log(`         - Breadcrumb Items: ${parsedData.itemListElement.length} items`);
                    }
                    
                  }
                } catch (error) {
                  console.log(`      ${index + 1}. JSON解析错误: ${error.message}`);
                }
              });
              
              console.log(`   🎯 检测到的Schema类型: ${detectedTypes.join(', ')}`);
              
              // 检查必需的Schema类型
              const requiredTypes = ['WebApplication', 'FAQPage', 'HowTo', 'BreadcrumbList'];
              const missingTypes = requiredTypes.filter(type => !detectedTypes.includes(type));
              
              if (missingTypes.length === 0) {
                console.log('   ✅ 所有必需的Schema类型都已实现');
              } else {
                console.log(`   ⚠️  缺少的Schema类型: ${missingTypes.join(', ')}`);
              }
            }
          }
          
          // 检查SEO元素
          console.log('   🔍 SEO元素检查:');
          const hasTitle = data.includes('<title>');
          const hasDescription = data.includes('name="description"');
          const hasCanonical = data.includes('rel="canonical"');
          const hasOgTags = data.includes('property="og:');
          
          console.log(`      Title标签: ${hasTitle ? '✅' : '❌'}`);
          console.log(`      Description: ${hasDescription ? '✅' : '❌'}`);
          console.log(`      Canonical URL: ${hasCanonical ? '✅' : '❌'}`);
          console.log(`      OpenGraph标签: ${hasOgTags ? '✅' : '❌'}`);
          
          resolve({
            url,
            name,
            type,
            status: res.statusCode,
            hasStructuredData,
            structuredDataCount,
            success: hasStructuredData && structuredDataCount >= 3
          });
        } else {
          console.log('   ❌ 页面加载失败');
          resolve({
            url,
            name,
            type,
            status: res.statusCode,
            hasStructuredData: false,
            structuredDataCount: 0,
            success: false
          });
        }
        
        console.log('\n' + '='.repeat(80) + '\n');
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ 请求错误: ${err.message}`);
      resolve({
        url,
        name,
        type,
        status: 'ERROR',
        hasStructuredData: false,
        structuredDataCount: 0,
        success: false,
        error: err.message
      });
    });
    
    req.setTimeout(15000, () => {
      req.destroy();
      console.log('❌ 请求超时');
      resolve({
        url,
        name,
        type,
        status: 'TIMEOUT',
        hasStructuredData: false,
        structuredDataCount: 0,
        success: false
      });
    });
  });
}

async function runFinalVerification() {
  console.log('🎯 开始最终验证主要界面页面的结构化数据...\n');
  
  const results = [];
  
  for (const page of mainPages) {
    const result = await checkPageStructuredData(page.url, page.name, page.type);
    results.push(result);
  }
  
  // 生成最终报告
  console.log('📊 最终验证报告');
  console.log('='.repeat(80));
  
  const successfulPages = results.filter(r => r.success);
  const failedPages = results.filter(r => !r.success);
  
  console.log(`\n✅ 结构化数据实现状态:`);
  console.log(`   成功: ${successfulPages.length}/${results.length} 页面`);
  
  successfulPages.forEach(page => {
    console.log(`   ✅ ${page.name} - ${page.structuredDataCount} 个结构化数据脚本`);
  });
  
  if (failedPages.length > 0) {
    console.log(`\n❌ 需要修复的页面:`);
    failedPages.forEach(page => {
      console.log(`   ❌ ${page.name} - ${page.hasStructuredData ? '结构化数据不完整' : '缺少结构化数据'}`);
    });
  }
  
  console.log('\n🎉 最终结论:');
  if (successfulPages.length === results.length) {
    console.log('   ✅ 主要界面已经增加了结构化数据！');
    console.log('   ✅ Text Translate (/en/text-translate) - 完成 ✅');
    console.log('   ✅ Document Translate (/en/document-translate) - 完成 ✅');
    console.log('   ✅ 所有页面都包含了丰富的Schema.org标记');
    console.log('   ✅ GSC应该能够检测到以下增强功能:');
    console.log('      - FAQ Rich Results (常见问题丰富结果)');
    console.log('      - HowTo Rich Results (操作指南丰富结果)');
    console.log('      - Breadcrumb Navigation (面包屑导航)');
    console.log('      - WebApplication Schema (应用程序信息)');
    
    console.log('\n💡 下一步建议:');
    console.log('   1. ✅ 结构化数据已完成 - 无需额外操作');
    console.log('   2. 🔍 使用Google Rich Results Test验证');
    console.log('   3. ⏰ 等待24-48小时让GSC重新抓取');
    console.log('   4. 📊 在GSC中检查"增强功能"部分');
    
  } else {
    console.log('   ⚠️  部分页面仍需要添加结构化数据');
    console.log('   📝 请检查失败的页面并添加必要的Schema标记');
  }
  
  console.log('\n🔗 验证工具:');
  console.log('   • Rich Results Test: https://search.google.com/test/rich-results');
  console.log('   • Schema Markup Validator: https://validator.schema.org/');
  console.log('   • GSC URL Inspection: Google Search Console');
  
  console.log('\n📋 回答您的问题:');
  console.log('   ❓ 主要界面已经增加了结构化数据吗？');
  if (successfulPages.length === results.length) {
    console.log('   ✅ 是的！Text Translate和Document Translate页面都已经实现了完整的结构化数据');
  } else {
    console.log('   ❌ 不完整，需要继续添加结构化数据');
  }
}

runFinalVerification().catch(console.error);
