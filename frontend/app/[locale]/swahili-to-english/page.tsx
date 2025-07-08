export const dynamic = "force-dynamic";
export const metadata = {
  title: 'Swahili to English Translator - Free AI Translation Tool | Loretrans',
  description: 'Free online Swahili to English translator. Accurate AI-powered translation for Kiswahili text, documents, and phrases. Instant results with NLLB technology.',
  keywords: [
    'swahili translator',
    'swahili to english',
    'kiswahili translator',
    'swahili language translator',
    'free swahili translator',
    'AI swahili translation'
  ],
  alternates: {
    canonical: '/swahili-to-english',
  },
  openGraph: {
    title: 'Swahili to English Translator - Free AI Translation',
    description: 'Professional Swahili to English translation powered by AI. Translate Kiswahili text, documents and phrases instantly.',
    type: 'website',
    url: 'https://loretrans.app/swahili-to-english',
  },
  twitter: {
    title: 'Free Swahili to English Translator | Loretrans',
    description: 'Accurate AI-powered Swahili to English translation. Perfect for Kiswahili speakers.',
  }
};

import nextDynamic from 'next/dynamic';
const SwahiliToEnglishClient = nextDynamic(() => import('./client'), { ssr: false });

export default function SwahiliToEnglishPage() {
  return <SwahiliToEnglishClient />;
} 