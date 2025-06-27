export const dynamic = "force-dynamic";
export const metadata = {
  title: 'Telugu to English Translator - Free AI Translation Tool | Transly',
  description: 'Free online Telugu to English translator. Accurate AI-powered translation for తెలుగు text, documents, and phrases. Instant results with NLLB technology.',
  keywords: [
    'telugu translator',
    'telugu to english',
    'telugu language translator',
    'free telugu translator',
    'AI telugu translation',
    'telugu script translator'
  ],
  alternates: {
    canonical: '/telugu-to-english',
  },
  openGraph: {
    title: 'Telugu to English Translator - Free AI Translation',
    description: 'Professional Telugu to English translation powered by AI. Translate తెలుగు text, documents and phrases instantly.',
    type: 'website',
    url: 'https://transly.app/telugu-to-english',
  },
  twitter: {
    title: 'Free Telugu to English Translator | Transly',
    description: 'Accurate AI-powered Telugu to English translation. Perfect for తెలుగు speakers.',
  }
};

import nextDynamic from 'next/dynamic';
const TeluguToEnglishClient = nextDynamic(() => import('./client'), { ssr: false });

export default function TeluguToEnglishPage() {
  return <TeluguToEnglishClient />;
} 