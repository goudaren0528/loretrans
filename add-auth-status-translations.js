#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 翻译映射
const translations = {
  'ar.json': {
    "checking_login": "جاري التحقق من حالة تسجيل الدخول...",
    "redirecting": "تم تسجيل الدخول بالفعل، جاري إعادة التوجيه..."
  },
  'hi.json': {
    "checking_login": "लॉगिन स्थिति की जांच की जा रही है...",
    "redirecting": "पहले से लॉग इन हैं, रीडायरेक्ट कर रहे हैं..."
  },
  'pt.json': {
    "checking_login": "Verificando status de login...",
    "redirecting": "Já logado, redirecionando..."
  },
  'ht.json': {
    "checking_login": "N ap verifye estati koneksyon an...",
    "redirecting": "Deja konekte, n ap redirije..."
  },
  'lo.json': {
    "checking_login": "ກຳລັງກວດສອບສະຖານະການເຂົ້າສູ່ລະບົບ...",
    "redirecting": "ເຂົ້າສູ່ລະບົບແລ້ວ, ກຳລັງປ່ຽນເສັ້ນທາງ..."
  },
  'sw.json': {
    "checking_login": "Inakagua hali ya kuingia...",
    "redirecting": "Tayari umeingia, inaelekeza..."
  },
  'my.json': {
    "checking_login": "လော့ဂ်အင်အခြေအနေကို စစ်ဆေးနေသည်...",
    "redirecting": "ရှိပြီးသား လော့ဂ်အင်ဝင်ထားသည်၊ ပြန်လည်ညွှန်းနေသည်..."
  },
  'te.json': {
    "checking_login": "లాగిన్ స్థితిని తనిఖీ చేస్తోంది...",
    "redirecting": "ఇప్పటికే లాగిన్ అయ్యారు, రీడైరెక్ట్ చేస్తోంది..."
  }
};

const messagesDir = '/home/hwt/translation-low-source/frontend/messages';

console.log('🌐 Adding Auth.Status translations to all language files...\n');

Object.keys(translations).forEach(filename => {
  const filePath = path.join(messagesDir, filename);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${filename} - File not found, skipping`);
    return;
  }
  
  try {
    // 读取文件内容
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 查找GuestLimit部分的结束位置
    const guestLimitMatch = content.match(/"GuestLimit":\s*\{[^}]*\}/);
    if (!guestLimitMatch) {
      console.log(`❌ ${filename} - Could not find GuestLimit section`);
      return;
    }
    
    // 构建Status部分
    const statusSection = `    "Status": {
      "checking_login": "${translations[filename].checking_login}",
      "redirecting": "${translations[filename].redirecting}"
    }`;
    
    // 替换GuestLimit部分，添加Status部分
    const guestLimitSection = guestLimitMatch[0];
    const newGuestLimitSection = guestLimitSection + ',\n' + statusSection;
    
    const newContent = content.replace(guestLimitSection, newGuestLimitSection);
    
    // 写入文件
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ ${filename} - Added Auth.Status translations`);
    
  } catch (error) {
    console.log(`❌ ${filename} - Error: ${error.message}`);
  }
});

console.log('\n🎉 Auth.Status translations added to all language files!');
console.log('\nNext step: Update the RedirectIfAuthenticated component to use these translations.');
