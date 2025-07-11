#!/usr/bin/env node

const fs = require('fs');

console.log('🔗 优化llm.txt中的站点结构和页面链接信息...\n');

// 扫描实际存在的页面
function scanActualPages() {
  const localeDir = '/home/hwt/translation-low-source/frontend/app/[locale]';
  const pages = [];
  
  try {
    const entries = fs.readdirSync(localeDir, { withFileTypes: true });
    
    entries.forEach(entry => {
      if (entry.isDirectory()) {
        const pageFile = `${localeDir}/${entry.name}/page.tsx`;
        if (fs.existsSync(pageFile)) {
          pages.push(entry.name);
        }
      }
    });
    
    return pages.sort();
  } catch (error) {
    console.log(`❌ 扫描页面目录失败: ${error.message}`);
    return [];
  }
}

// 生成增强的站点结构部分
function generateEnhancedSiteStructure() {
  const actualPages = scanActualPages();
  
  // 分类页面
  const translationPages = actualPages.filter(page => page.includes('-to-'));
  const staticPages = actualPages.filter(page => 
    ['about', 'contact', 'pricing', 'terms', 'privacy', 'text-translate', 'document-translate'].includes(page)
  );
  const authPages = actualPages.filter(page => page.startsWith('auth/') || page === 'auth');
  const utilityPages = actualPages.filter(page => 
    ['help', 'api-docs', 'compliance'].includes(page)
  );
  
  console.log(`📊 页面统计:`);
  console.log(`   翻译页面: ${translationPages.length}`);
  console.log(`   静态页面: ${staticPages.length}`);
  console.log(`   工具页面: ${utilityPages.length}`);
  console.log(`   认证页面: ${authPages.length}\n`);

  const siteStructureSection = `## Complete Website Structure and Navigation

### Main Navigation Pages
- **Homepage** (https://loretrans.com) - Landing page with service overview and quick access
- **English Homepage** (https://loretrans.com/en) - Localized English version with full navigation

### Core Translation Services
- **Text Translation** (https://loretrans.com/en/text-translate) - Main translation interface for short texts
- **Document Translation** (https://loretrans.com/en/document-translate) - File upload and document processing

### Information and Support Pages
- **About Us** (https://loretrans.com/en/about) - Company mission, technology, and team information
- **Pricing** (https://loretrans.com/en/pricing) - Credit packages, billing, and subscription options
- **Contact Support** (https://loretrans.com/en/contact) - Customer support, inquiries, and feedback
- **Terms of Service** (https://loretrans.com/en/terms) - Legal terms and conditions
- **Privacy Policy** (https://loretrans.com/en/privacy) - Data protection and privacy practices
- **Help Center** (https://loretrans.com/en/help) - User guides, tutorials, and FAQ
- **API Documentation** (https://loretrans.com/en/api-docs) - Developer resources and API reference
- **Compliance** (https://loretrans.com/en/compliance) - Security and compliance information

### Language-Specific Translation Pages (${translationPages.length} total)
Each of our ${Math.floor(translationPages.length / 2)} supported languages has dedicated bidirectional translation pages:

#### African Languages
- **Amharic Translation**: 
  - Amharic to English (https://loretrans.com/en/amharic-to-english)
  - English to Amharic (https://loretrans.com/en/english-to-amharic)
- **Hausa Translation**:
  - Hausa to English (https://loretrans.com/en/hausa-to-english)
  - English to Hausa (https://loretrans.com/en/english-to-hausa)
- **Igbo Translation**:
  - Igbo to English (https://loretrans.com/en/igbo-to-english)
  - English to Igbo (https://loretrans.com/en/english-to-igbo)
- **Swahili Translation**:
  - Swahili to English (https://loretrans.com/en/swahili-to-english)
  - English to Swahili (https://loretrans.com/en/english-to-swahili)
- **Yoruba Translation**:
  - Yoruba to English (https://loretrans.com/en/yoruba-to-english)
  - English to Yoruba (https://loretrans.com/en/english-to-yoruba)
- **Zulu Translation**:
  - Zulu to English (https://loretrans.com/en/zulu-to-english)
  - English to Zulu (https://loretrans.com/en/english-to-zulu)
- **Xhosa Translation**:
  - Xhosa to English (https://loretrans.com/en/xhosa-to-english)
  - English to Xhosa (https://loretrans.com/en/english-to-xhosa)
- **Malagasy Translation**:
  - Malagasy to English (https://loretrans.com/en/malagasy-to-english)
  - English to Malagasy (https://loretrans.com/en/english-to-malagasy)

#### Asian Languages
- **Burmese Translation**:
  - Burmese to English (https://loretrans.com/en/burmese-to-english)
  - English to Burmese (https://loretrans.com/en/english-to-burmese)
- **Chinese Translation**:
  - Chinese to English (https://loretrans.com/en/chinese-to-english)
  - English to Chinese (https://loretrans.com/en/english-to-chinese)
- **Hindi Translation**:
  - Hindi to English (https://loretrans.com/en/hindi-to-english)
  - English to Hindi (https://loretrans.com/en/english-to-hindi)
- **Khmer Translation**:
  - Khmer to English (https://loretrans.com/en/khmer-to-english)
  - English to Khmer (https://loretrans.com/en/english-to-khmer)
- **Lao Translation**:
  - Lao to English (https://loretrans.com/en/lao-to-english)
  - English to Lao (https://loretrans.com/en/english-to-lao)
- **Mongolian Translation**:
  - Mongolian to English (https://loretrans.com/en/mongolian-to-english)
  - English to Mongolian (https://loretrans.com/en/english-to-mongolian)
- **Nepali Translation**:
  - Nepali to English (https://loretrans.com/en/nepali-to-english)
  - English to Nepali (https://loretrans.com/en/english-to-nepali)
- **Sinhala Translation**:
  - Sinhala to English (https://loretrans.com/en/sinhala-to-english)
  - English to Sinhala (https://loretrans.com/en/english-to-sinhala)
- **Telugu Translation**:
  - Telugu to English (https://loretrans.com/en/telugu-to-english)
  - English to Telugu (https://loretrans.com/en/english-to-telugu)

#### Central Asian Languages
- **Kyrgyz Translation**:
  - Kyrgyz to English (https://loretrans.com/en/kyrgyz-to-english)
  - English to Kyrgyz (https://loretrans.com/en/english-to-kyrgyz)
- **Pashto Translation**:
  - Pashto to English (https://loretrans.com/en/pashto-to-english)
  - English to Pashto (https://loretrans.com/en/english-to-pashto)
- **Sindhi Translation**:
  - Sindhi to English (https://loretrans.com/en/sindhi-to-english)
  - English to Sindhi (https://loretrans.com/en/english-to-sindhi)
- **Tajik Translation**:
  - Tajik to English (https://loretrans.com/en/tajik-to-english)
  - English to Tajik (https://loretrans.com/en/english-to-tajik)

#### Other Languages
- **Arabic Translation**:
  - Arabic to English (https://loretrans.com/en/arabic-to-english)
  - English to Arabic (https://loretrans.com/en/english-to-arabic)
- **French Translation**:
  - French to English (https://loretrans.com/en/french-to-english)
  - English to French (https://loretrans.com/en/english-to-french)
- **Haitian Creole Translation**:
  - Creole to English (https://loretrans.com/en/creole-to-english)
  - English to Creole (https://loretrans.com/en/english-to-creole)
- **Portuguese Translation**:
  - Portuguese to English (https://loretrans.com/en/portuguese-to-english)
  - English to Portuguese (https://loretrans.com/en/english-to-portuguese)
- **Spanish Translation**:
  - Spanish to English (https://loretrans.com/en/spanish-to-english)
  - English to Spanish (https://loretrans.com/en/english-to-spanish)

### Technical and SEO Pages
- **Sitemap** (https://loretrans.com/sitemap.xml) - Complete site structure for search engines
- **Robots.txt** (https://loretrans.com/robots.txt) - Search engine crawling instructions
- **Security.txt** (https://loretrans.com/.well-known/security.txt) - Security contact information

### User Account Pages
- **Sign In** (https://loretrans.com/en/auth/signin) - User authentication
- **Sign Up** (https://loretrans.com/en/auth/signup) - New user registration
- **Dashboard** (https://loretrans.com/en/dashboard) - User account management (authenticated users)

### Navigation Structure
The website follows a clear hierarchical structure:
1. **Root Level**: Homepage and language selection
2. **Service Level**: Core translation services (text, document)
3. **Language Level**: Specific language pair pages
4. **Support Level**: Information, help, and contact pages
5. **Account Level**: User authentication and management

### URL Pattern and SEO Structure
- **Homepage**: / (redirects to /en for English users)
- **Service Pages**: /en/{service-name} (e.g., /en/text-translate)
- **Language Pages**: /en/{source-language}-to-{target-language}
- **Information Pages**: /en/{page-name} (e.g., /en/about)
- **All URLs are SEO-friendly with descriptive slugs**
- **Consistent /en/ prefix for English content**
- **Bidirectional language support with clear URL patterns**

This comprehensive structure ensures that users can easily find translation services for any of our supported languages, while search engines can effectively crawl and index all content for maximum discoverability.`;

  return siteStructureSection;
}

// 更新llm.txt文件
function updateLLMWithEnhancedStructure() {
  const llmPath = '/home/hwt/translation-low-source/frontend/public/llm.txt';
  
  try {
    let content = fs.readFileSync(llmPath, 'utf8');
    
    // 查找现有的Website Structure部分
    const structureRegex = /## Website Structure and Pages[\s\S]*?(?=## Contact Information)/;
    
    if (structureRegex.test(content)) {
      const enhancedStructure = generateEnhancedSiteStructure();
      content = content.replace(structureRegex, enhancedStructure + '\n\n');
      
      fs.writeFileSync(llmPath, content, 'utf8');
      console.log('✅ 已更新llm.txt中的站点结构部分');
      return true;
    } else {
      console.log('❌ 未找到现有的Website Structure部分');
      return false;
    }
    
  } catch (error) {
    console.log(`❌ 更新失败: ${error.message}`);
    return false;
  }
}

// 验证更新结果
function verifyEnhancedStructure() {
  console.log('\n🔍 验证增强的站点结构...\n');
  
  const llmPath = '/home/hwt/translation-low-source/frontend/public/llm.txt';
  
  try {
    const content = fs.readFileSync(llmPath, 'utf8');
    
    const checks = [
      { name: '包含完整导航结构', check: content.includes('Main Navigation Pages') },
      { name: '包含核心服务页面', check: content.includes('Core Translation Services') },
      { name: '包含支持页面', check: content.includes('Information and Support Pages') },
      { name: '包含按地区分组的语言', check: content.includes('African Languages') },
      { name: '包含完整URL链接', check: content.includes('https://loretrans.com/en/') },
      { name: '包含SEO页面', check: content.includes('sitemap.xml') },
      { name: '包含URL模式说明', check: content.includes('URL Pattern and SEO Structure') },
      { name: '包含导航层次结构', check: content.includes('Navigation Structure') }
    ];
    
    console.log('📊 结构验证:');
    checks.forEach(check => {
      console.log(`   ${check.check ? '✅' : '❌'} ${check.name}`);
    });
    
    // 统计链接数量
    const linkMatches = content.match(/https:\/\/loretrans\.com\/[^\s)]+/g);
    const linkCount = linkMatches ? linkMatches.length : 0;
    
    console.log(`\n📏 链接统计:`);
    console.log(`   完整URL链接数量: ${linkCount}`);
    
    // 检查文件大小
    const fileSize = content.length;
    console.log(`   文件大小: ${fileSize.toLocaleString()} 字符`);
    
    return checks.every(check => check.check) && linkCount > 50;
    
  } catch (error) {
    console.log(`❌ 验证失败: ${error.message}`);
    return false;
  }
}

// 主函数
function main() {
  console.log('🎯 目标: 增强llm.txt中的站点结构和页面链接信息\n');
  
  // 更新文件
  const updateSuccess = updateLLMWithEnhancedStructure();
  
  // 验证结果
  const verificationPassed = verifyEnhancedStructure();
  
  console.log('\n📊 优化总结:');
  console.log(`   结构更新: ${updateSuccess ? '✅ 成功' : '❌ 失败'}`);
  console.log(`   验证结果: ${verificationPassed ? '✅ 通过' : '❌ 失败'}`);
  
  if (updateSuccess && verificationPassed) {
    console.log('\n🎉 llm.txt站点结构优化完成！');
    console.log('\n📝 增强内容:');
    console.log('✅ 完整的导航结构说明');
    console.log('✅ 按功能分类的页面列表');
    console.log('✅ 按地区分组的语言页面');
    console.log('✅ 完整的URL链接（50+个）');
    console.log('✅ SEO和技术页面信息');
    console.log('✅ URL模式和结构说明');
    console.log('✅ 导航层次结构描述');
    
    console.log('\n🤖 AI搜索引擎优化效果:');
    console.log('✅ AI可以准确了解网站的完整结构');
    console.log('✅ 可以直接提供具体页面的URL链接');
    console.log('✅ 理解不同类型页面的功能和用途');
    console.log('✅ 能够推荐最合适的页面给用户');
    console.log('✅ 支持精确的导航和页面查找');
  } else {
    console.log('\n⚠️  优化可能不完整，请检查上述错误');
  }
  
  console.log('\n✨ 优化完成!');
}

if (require.main === module) {
  main();
}
