export const dynamic = "force-dynamic";
export const metadata = {
  title: 'Burmese to English Translator - Free AI Translation Tool | Loretrans',
  description: 'Free online Burmese to English translator. Accurate AI-powered translation for မြန်မာ text, documents, and phrases. Instant results with NLLB technology.',
  keywords: [
    'burmese translator',
    'burmese to english',
    'myanmar translator',
    'burmese language translator',
    'free burmese translator',
    'AI burmese translation'
  ],
  alternates: {
    canonical: '/burmese-to-english',
  },
  openGraph: {
    title: 'Burmese to English Translator - Free AI Translation',
    description: 'Professional Burmese to English translation powered by AI. Translate မြန်မာ text, documents and phrases instantly.',
    type: 'website',
    url: 'https://loretrans.app/burmese-to-english',
  },
  twitter: {
    title: 'Free Burmese to English Translator | Loretrans',
    description: 'Accurate AI-powered Burmese to English translation. Perfect for မြန်မာ speakers.',
  }
};

import nextDynamic from 'next/dynamic';
const BurmeseToEnglishClient = nextDynamic(() => import('./client'), { ssr: false });

export default function BurmeseToEnglishPage() {
  return <BurmeseToEnglishClient />;
} 