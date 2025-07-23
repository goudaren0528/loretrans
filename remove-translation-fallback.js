#!/usr/bin/env node

/**
 * 移除文本翻译API的fallback mock逻辑
 * 
 * 问题：当NLLB服务失败时，API返回mock格式的"翻译"而不是真实翻译
 * 解决：移除fallback逻辑，失败时返回错误而不是假翻译
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 移除文本翻译API的fallback mock逻辑...\n');

// 修复主要的文本翻译API
const translateApiPath = path.join(__dirname, 'frontend/app/api/translate/route.ts');
let content = fs.readFileSync(translateApiPath, 'utf8');

console.log('📋 当前fallback逻辑：');
console.log('- getFallbackTranslation() 返回格式化字符串而不是真实翻译');
console.log('- 例如：[English Translation] 你好世界... (from Chinese)');
console.log('- 这不是真实翻译，只是占位符');

// 1. 移除getFallbackTranslation函数
content = content.replace(
  /\/\*\*[\s\S]*?备用翻译（当主服务完全失败时）[\s\S]*?\*\/[\s\S]*?function getFallbackTranslation\(text: string, sourceLang: string, targetLang: string\): string \{[\s\S]*?\}/,
  ''
);

// 2. 移除块翻译中的fallback调用
content = content.replace(
  /console\.log\(`⚠️ 块 \$\{i \+ 1\} 翻译失败，使用备用翻译`\);[\s\S]*?const fallbackChunk = getFallbackTranslation\(chunk, sourceLang, targetLang\);[\s\S]*?translatedChunks\.push\(fallbackChunk\);[\s\S]*?chunkResults\.push\(\{[\s\S]*?status: 'fallback',[\s\S]*?\}\);/,
  `console.log(\`❌ 块 \${i + 1} 翻译失败: \${chunkError.message}\`);
            throw new Error(\`翻译块 \${i + 1} 失败: \${chunkError.message}\`);`
);

// 3. 移除整体翻译失败时的fallback
content = content.replace(
  /\/\/ 使用备用翻译[\s\S]*?const fallbackTranslation = getFallbackTranslation\(text, sourceLang, targetLang\);[\s\S]*?return NextResponse\.json\(\{[\s\S]*?translatedText: fallbackTranslation,[\s\S]*?service: 'fallback-enhanced',[\s\S]*?\}\);/,
  `// 翻译完全失败，返回错误
      console.error('[Translation] 所有翻译服务都失败了');
      return NextResponse.json({
        error: '翻译服务暂时不可用，请稍后重试',
        code: 'TRANSLATION_SERVICE_UNAVAILABLE'
      }, { status: 503 });`
);

// 4. 确保错误处理更加明确
content = content.replace(
  /catch \(error\) \{[\s\S]*?console\.error\('\[Translation\] 处理错误:', error\)[\s\S]*?return NextResponse\.json\(\{[\s\S]*?error: '翻译处理失败',[\s\S]*?code: 'PROCESSING_ERROR'[\s\S]*?\}, \{ status: 500 \}\)[\s\S]*?\}/,
  `catch (error) {
    console.error('[Translation] 处理错误:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : '翻译服务失败',
      code: 'TRANSLATION_FAILED'
    }, { status: 500 })
  }`
);

// 写入修复后的文件
fs.writeFileSync(translateApiPath, content);
console.log('✅ 已移除主要文本翻译API的fallback逻辑');

// 检查并修复公共翻译API
const publicApiPath = path.join(__dirname, 'frontend/app/api/translate/public/route.ts');
if (fs.existsSync(publicApiPath)) {
  let publicContent = fs.readFileSync(publicApiPath, 'utf8');
  
  // 检查是否有类似的fallback逻辑
  if (publicContent.includes('fallback')) {
    console.log('⚠️  发现公共翻译API也有fallback逻辑');
    
    // 移除dictionary fallback
    publicContent = publicContent.replace(
      /console\.log\('\[Translation API\] Using dictionary fallback'\);[\s\S]*?fallback: 'available'/,
      `console.log('[Translation API] Translation service failed');
        throw new Error('Translation service unavailable');`
    );
    
    fs.writeFileSync(publicApiPath, publicContent);
    console.log('✅ 已修复公共翻译API的fallback逻辑');
  }
}

// 检查队列翻译API
const queueApiPath = path.join(__dirname, 'frontend/app/api/translate/queue/route.ts');
if (fs.existsSync(queueApiPath)) {
  let queueContent = fs.readFileSync(queueApiPath, 'utf8');
  
  if (queueContent.includes('fallback') || queueContent.includes('getFallbackTranslation')) {
    console.log('⚠️  发现队列翻译API也有fallback逻辑');
    
    // 移除fallback逻辑
    queueContent = queueContent.replace(
      /getFallbackTranslation[\s\S]*?\}/g,
      ''
    );
    
    fs.writeFileSync(queueApiPath, queueContent);
    console.log('✅ 已修复队列翻译API的fallback逻辑');
  }
}

console.log('\n📋 修复完成！');

console.log('\n🔄 新的翻译行为：');
console.log('1. **翻译成功**：返回真实的NLLB翻译结果');
console.log('2. **翻译失败**：返回明确的错误信息，不返回假翻译');
console.log('3. **服务不可用**：返回503错误，提示用户稍后重试');

console.log('\n❌ 移除的mock行为：');
console.log('- 不再返回 "[English Translation] 你好世界... (from Chinese)" 格式的假翻译');
console.log('- 不再使用 getFallbackTranslation() 函数');
console.log('- 翻译失败时直接返回错误而不是占位符');

console.log('\n✅ 新的错误处理：');
console.log('- 翻译服务失败：返回 "翻译服务暂时不可用，请稍后重试"');
console.log('- 具体翻译错误：返回具体的错误信息');
console.log('- HTTP状态码：503 (服务不可用) 或 500 (内部错误)');

console.log('\n🧪 测试建议：');
console.log('1. 测试正常翻译：应该返回真实的NLLB翻译');
console.log('2. 测试服务失败：应该返回错误而不是假翻译');
console.log('3. 检查前端错误处理：确保能正确显示错误信息');

console.log('\n⚠️  重要提示：');
console.log('- 需要重启前端服务才能生效');
console.log('- 现在只会返回真实翻译或明确错误');
console.log('- 不再有任何mock或假翻译数据');
