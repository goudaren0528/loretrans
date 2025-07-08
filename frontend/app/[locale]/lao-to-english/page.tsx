export const dynamic = "force-dynamic";
export const metadata = {
  title: 'Lao to English Translator - Free AI Translation Tool | Loretrans',
  description: 'Free online Lao to English translator. Accurate AI-powered translation for ລາວ text, documents, and phrases. Instant results with NLLB technology.',
  keywords: [
    'lao translator',
    'lao to english',
    'laotian translator',
    'lao language translator',
    'free lao translator',
    'AI lao translation'
  ],
  alternates: {
    canonical: '/lao-to-english',
  },
  openGraph: {
    title: 'Lao to English Translator - Free AI Translation',
    description: 'Professional Lao to English translation powered by AI. Translate ລາວ text, documents and phrases instantly.',
    type: 'website',
    url: 'https://loretrans.app/lao-to-english',
  },
  twitter: {
    title: 'Free Lao to English Translator | Loretrans',
    description: 'Accurate AI-powered Lao to English translation. Perfect for ລາວ speakers.',
  }
};

import nextDynamic from 'next/dynamic';
const LaoToEnglishClient = nextDynamic(() => import('./client'), { ssr: false });

export default function LaoToEnglishPage() {
  return <LaoToEnglishClient />;
} 