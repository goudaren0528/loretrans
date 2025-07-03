import { type NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/settings';

export default createMiddleware({
  locales,
  defaultLocale: 'en',
  localeDetection: true,
  localePrefix: 'as-needed',
  pathnames: {
    '/': '/',
    '/about': {
      en: '/about',
      es: '/acerca-de', 
      fr: '/a-propos',
      ht: '/konsènan',
      lo: '/ກ່ຽວກັບ',
      sw: '/kuhusu',
      my: '/အကြောင်း',
      te: '/గురించి',
      zh: '/关于',
      ar: '/حول',
      hi: '/के-बारे-में',
      pt: '/sobre'
    },
    '/contact': {
      en: '/contact',
      es: '/contacto',
      fr: '/contact',
      ht: '/kontak',
      lo: '/ຕິດຕໍ່',
      sw: '/wasiliana',
      my: '/ဆက်သွယ်ရန်',
      te: '/సంప్రదించండి',
      zh: '/联系',
      ar: '/اتصل-بنا',
      hi: '/संपर्क',
      pt: '/contato'
    },
    '/pricing': {
      en: '/pricing',
      es: '/precios',
      fr: '/tarifs',
      ht: '/pri',
      lo: '/ລາຄາ',
      sw: '/bei',
      my: '/စျေးနှုန်း',
      te: '/ధరలు',
      zh: '/定价',
      ar: '/الأسعار',
      hi: '/मूल्य-निर्धारण',
      pt: '/precos'
    },
    '/text-translate': {
      en: '/text-translate',
      es: '/traducir-texto',
      fr: '/traduire-texte',
      ht: '/tradwi-tèks',
      lo: '/ແປຂໍ້ຄວາມ',
      sw: '/tafsiri-maandishi',
      my: '/စာသား-ဘာသာပြန်',
      te: '/వచనం-అనువాదం',
      zh: '/文本翻译',
      ar: '/ترجمة-النص',
      hi: '/पाठ-अनुवाद',
      pt: '/traduzir-texto'
    },
    '/document-translate': {
      en: '/document-translate',
      es: '/traducir-documentos',
      fr: '/traduire-documents',
      ht: '/tradwi-dokiman',
      lo: '/ແປເອກະສານ',
      sw: '/tafsiri-hati',
      my: '/စာရွက်စာတမ်း-ဘာသာပြန်',
      te: '/పత్రం-అనువాదం',
      zh: '/文档翻译',
      ar: '/ترجمة-المستندات',
      hi: '/दस्तावेज़-अनुवाद',
      pt: '/traduzir-documentos'
    },
    '/help': {
      en: '/help',
      es: '/ayuda',
      fr: '/aide',
      ht: '/èd',
      lo: '/ຊ່ວຍເຫຼືອ',
      sw: '/msaada',
      my: '/အကူအညီ',
      te: '/సహాయం',
      zh: '/帮助',
      ar: '/مساعدة',
      hi: '/सहायता',
      pt: '/ajuda'
    },
    '/privacy': {
      en: '/privacy',
      es: '/privacidad',
      fr: '/confidentialite',
      ht: '/vi-prive',
      lo: '/ຄວາມເປັນສ່ວນຕົວ',
      sw: '/faragha',
      my: '/ကိုယ်ရေးကိုယ်တာ',
      te: '/గోప్యత',
      zh: '/隐私',
      ar: '/الخصوصية',
      hi: '/गोपनीयता',
      pt: '/privacidade'
    },
    '/terms': {
      en: '/terms',
      es: '/terminos',
      fr: '/conditions',
      ht: '/kondisyon',
      lo: '/ເງື່ອນໄຂ',
      sw: '/masharti',
      my: '/စည်းကမ်းများ',
      te: '/నిబంధనలు',
      zh: '/条款',
      ar: '/الشروط',
      hi: '/नियम',
      pt: '/termos'
    },
    '/compliance': {
      en: '/compliance',
      es: '/cumplimiento',
      fr: '/conformite',
      ht: '/konfòmite',
      lo: '/ການປະຕິບັດຕາມ',
      sw: '/utii',
      my: '/လိုက်နာမှု',
      te: '/అనుపాలన',
      zh: '/合规',
      ar: '/الامتثال',
      hi: '/अनुपालन',
      pt: '/conformidade'
    },
    '/dashboard': {
      en: '/dashboard',
      es: '/panel',
      fr: '/tableau-de-bord',
      ht: '/tablo-kòmand',
      lo: '/ແຜງຄວບຄຸມ',
      sw: '/dashibodi',
      my: '/ဒက်ရှ်ဘုတ်',
      te: '/డ్యాష్‌బోర్డ్',
      zh: '/控制台',
      ar: '/لوحة-التحكم',
      hi: '/डैशबोर्ड',
      pt: '/painel'
    }
  }
});

export const config = {
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',

    // Set a cookie to remember the previous locale for all requests that have a locale prefix
    '/(en|es|fr|ht|lo|sw|my|te|zh|ar|hi|pt)/:path*',

    // Enable redirects that add missing locales but exclude auth, api, and static files
    '/((?!auth|api|_next|_vercel|.*\\..*).*)'
  ]
};
