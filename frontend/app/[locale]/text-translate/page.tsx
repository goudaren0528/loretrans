'use client';

import { TranslatorWidget } from '@/components/translator-widget';
import { BidirectionalNavigation } from '@/components/bidirectional-navigation';
import { LanguageGrid } from '@/components/language-grid';

export default function TextTranslatePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <TranslatorWidget />
        </div>
        <div className="space-y-6">
          <BidirectionalNavigation
            currentSourceLang="ht"
            currentTargetLang="en"
            showRelatedLanguages={false}
          />
        </div>
      </div>
      <div className="mt-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">Try another language</h2>
          <p className="text-lg text-muted-foreground">
            Translate from these low-resource languages to English
          </p>
        </div>
        <LanguageGrid />
      </div>
    </div>
  );
} 