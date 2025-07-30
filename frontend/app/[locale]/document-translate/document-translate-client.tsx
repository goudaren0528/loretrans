'use client'

import { Upload, FileText, CheckCircle, ArrowRight } from 'lucide-react'
import { TranslationNavButtons } from '@/components/translation-nav-buttons'
import { Button } from '@/components/ui/button'
import { Language, AVAILABLE_LANGUAGES } from '../../../../config/app.config'
import { DocumentTranslator } from '@/components/document-translator'
import { GuestLimitGuard } from '@/components/guest-limit-guard'
import { EnhancedHistoryTable } from '@/components/translation/enhanced-history-table'
import { GuestLoginPrompt } from '@/components/translation/guest-login-prompt'
import { useAuth } from '@/lib/hooks/useAuth'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface DocumentTranslateClientProps {
  locale: string
}

export function DocumentTranslateClient({ locale }: DocumentTranslateClientProps) {
  const t = useTranslations('DocumentTranslatePage')
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('translate')

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="container mx-auto px-4 mb-8">
        <div className="max-w-6xl mx-auto">
          <TranslationNavButtons currentPage="document" locale={locale} />
        </div>
      </div>

      {/* Main Content with Tabs */}
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
              <TabsTrigger value="translate">
                <Upload className="h-4 w-4 mr-2" />
                Translate Document
              </TabsTrigger>
              <TabsTrigger value="history">
                <FileText className="h-4 w-4 mr-2" />
                Translation History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="translate" className="space-y-8">
              {/* Document Translator */}
              <GuestLimitGuard showStatus={false}>
                <DocumentTranslator />
              </GuestLimitGuard>

              {/* Guest Prompt for History */}
              {!user && (
                <div className="mt-8">
                  <GuestLoginPrompt 
                    variant="inline"
                    context="document-translation"
                    className="max-w-4xl mx-auto"
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-8">
              {user ? (
                <EnhancedHistoryTable 
                  className="max-w-6xl mx-auto"
                  showFilters={true}
                  showSearch={true}
                  showStatistics={true}
                />
              ) : (
                <GuestLoginPrompt 
                  variant="card"
                  context="document-translation"
                  className="max-w-2xl mx-auto"
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple three-step process to translate your documents with AI precision
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{t('steps.step1.title')}</h3>
              <p className="text-muted-foreground">{t('steps.step1.description')}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{t('steps.step2.title')}</h3>
              <p className="text-muted-foreground">{t('steps.step2.description')}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{t('steps.step3.title')}</h3>
              <p className="text-muted-foreground">{t('steps.step3.description')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Supported Languages */}
      <div className="mt-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">{t('languages.title')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {AVAILABLE_LANGUAGES.map((lang: Language) => (
              <div key={lang.code} className="text-center p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="font-medium text-sm">{lang.name}</div>
                <div className="text-xs text-muted-foreground">{lang.nativeName}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-16 mb-16">
        <div className="container mx-auto px-4">
          <div className="text-center bg-primary/5 rounded-lg p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">{t('cta.title')}</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              {t('cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/${locale}/text-translate`}>
                <Button size="lg" className="w-full sm:w-auto">
                  {t('cta.try_text_translation')}
                </Button>
              </Link>
              <Link href={`/${locale}/pricing`}>
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  {t('cta.view_pricing')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
