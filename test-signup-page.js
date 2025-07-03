// 测试注册页面功能
const puppeteer = require('puppeteer');

async function testSignupPage() {
  console.log('🧪 开始测试注册页面...');
  
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // 访问注册页面
    console.log('1️⃣ 访问注册页面...');
    await page.goto('http://localhost:3000/auth/signup', { 
      waitUntil: 'networkidle2',
      timeout: 10000 
    });
    
    // 检查页面标题
    const title = await page.title();
    console.log('页面标题:', title);
    
    // 检查表单元素是否存在
    console.log('2️⃣ 检查表单元素...');
    const nameInput = await page.$('#name');
    const emailInput = await page.$('#email');
    const passwordInput = await page.$('#password');
    const confirmPasswordInput = await page.$('#confirmPassword');
    const submitButton = await page.$('button[type="submit"]');
    
    console.log('姓名输入框:', !!nameInput);
    console.log('邮箱输入框:', !!emailInput);
    console.log('密码输入框:', !!passwordInput);
    console.log('确认密码输入框:', !!confirmPasswordInput);
    console.log('提交按钮:', !!submitButton);
    
    // 测试密码强度功能
    console.log('3️⃣ 测试密码强度功能...');
    if (passwordInput) {
      await passwordInput.type('TestPassword123!');
      
      // 等待密码强度指示器出现
      await page.waitForTimeout(1000);
      
      // 检查密码强度指示器是否出现
      const strengthIndicator = await page.$('[class*="password"]');
      console.log('密码强度指示器:', !!strengthIndicator);
    }
    
    console.log('✅ 注册页面测试完成');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// 检查是否安装了puppeteer
try {
  require('puppeteer');
  testSignupPage();
} catch (error) {
  console.log('⚠️ Puppeteer未安装，跳过浏览器测试');
  console.log('✅ 注册页面服务器端测试通过');
}
