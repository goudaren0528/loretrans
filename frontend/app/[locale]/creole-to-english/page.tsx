export const dynamic = "force-dynamic";
export const metadata = {
  title: 'Haitian Creole to English Translator - Free AI Translation Tool | Transly',
  description: 'Free online Haitian Creole to English translator. Accurate AI-powered translation for Kreyòl Ayisyen text, documents, and phrases. Instant results with NLLB technology.',
  keywords: [
    'haitian creole translator',
    'creole to english',
    'kreyol ayisyen translator',
    'haitian translator',
    'creole translation',
    'haiti language translator',
    'free creole translator',
    'AI creole translation'
  ],
  alternates: {
    canonical: '/creole-to-english',
  },
  openGraph: {
    title: 'Haitian Creole to English Translator - Free AI Translation',
    description: 'Professional Haitian Creole to English translation powered by AI. Translate Kreyòl Ayisyen text, documents and phrases instantly.',
    type: 'website',
    url: 'https://transly.app/creole-to-english',
  },
  twitter: {
    title: 'Free Haitian Creole to English Translator | Transly',
    description: 'Accurate AI-powered Haitian Creole to English translation. Perfect for Kreyòl Ayisyen speakers.',
  }
};

import nextDynamic from 'next/dynamic';
const CreoleToEnglishClient = nextDynamic(() => import('./client'), { ssr: false });

export default function CreoleToEnglishPage() {
  return <CreoleToEnglishClient />;
} 