import { ArrowRight, Clock, Mail, Bell } from 'lucide-react'
import { useTranslations } from 'next-intl';
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ComingSoonTemplateProps {
  language: string
  nativeName?: string
  estimatedLaunch?: string
  description?: string
}

export function ComingSoonTemplate({
  language,
  nativeName,
  estimatedLaunch = "2024 Q2",
  description = "We're working hard to bring you accurate translation support for this language."
}: ComingSoonTemplateProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative py-20 sm:py-24 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            {/* Coming Soon Badge */}
            <div className="inline-flex items-center rounded-full bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-800 mb-6">
              <Clock className="mr-2 h-4 w-4" />
              Coming Soon
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              {language} to English Translator
            </h1>
            
            {nativeName && (
              <p className="mt-4 text-xl text-gray-600 sm:text-2xl">
                {nativeName} Translation Tool
              </p>
            )}
            
            <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl max-w-2xl mx-auto">
              {description} Our AI-powered translation tool for {language} will be available soon with the same high-quality translation you expect from LoReTrans.
            </p>
            
            <div className="mt-8 flex items-center justify-center gap-x-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex h-2 w-2 rounded-full bg-yellow-500"></div>
                <span>In Development</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex h-2 w-2 rounded-full bg-blue-500"></div>
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex h-2 w-2 rounded-full bg-green-500"></div>
                <span>Will Be Free</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Notification Section */}
      <section className="relative py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl">
            <div className="rounded-lg border bg-white p-8 shadow-sm">
              <div className="text-center">
                <Bell className="mx-auto h-12 w-12 text-primary mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Get Notified When Available
                </h2>
                <p className="text-gray-600 mb-6">
                  Be the first to know when {language} translation goes live. We'll send you a single notification when it's ready.
                </p>
                
                <div className="flex gap-2 max-w-md mx-auto">
                  <Input
                    type="email"
                    placeholder="t('Common.email_placeholder')"
                    className="flex-1"
                  />
                  <Button>
                    <Mail className="mr-2 h-4 w-4" />
                    Notify Me
                  </Button>
                </div>
                
                <p className="text-xs text-gray-500 mt-3">
                  Estimated launch: {estimatedLaunch}. No spam, just one notification.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Available Now Section */}
      <section className="relative py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Available Now - Try These Languages
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/creole-to-english" className="group">
                <div className="p-6 bg-white rounded-lg shadow-sm border transition-all hover:shadow-md hover:border-primary/50">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary mb-2">
                    Haitian Creole
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Kreyòl Ayisyen to English
                  </p>
                  <div className="flex items-center text-primary text-sm font-medium">
                    Try Now <ArrowRight className="ml-1 h-3 w-3" />
                  </div>
                </div>
              </Link>
              
              <Link href="/lao-to-english" className="group">
                <div className="p-6 bg-white rounded-lg shadow-sm border transition-all hover:shadow-md hover:border-primary/50">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary mb-2">
                    Lao
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    ພາສາລາວ to English
                  </p>
                  <div className="flex items-center text-primary text-sm font-medium">
                    Try Now <ArrowRight className="ml-1 h-3 w-3" />
                  </div>
                </div>
              </Link>
              
              <Link href="/swahili-to-english" className="group">
                <div className="p-6 bg-white rounded-lg shadow-sm border transition-all hover:shadow-md hover:border-primary/50">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary mb-2">
                    Swahili
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Kiswahili to English
                  </p>
                  <div className="flex items-center text-primary text-sm font-medium">
                    Try Now <ArrowRight className="ml-1 h-3 w-3" />
                  </div>
                </div>
              </Link>
            </div>
            
            <div className="mt-8">
              <Link href="/text-translate">
                <Button variant="outline" size="lg">
                  View All Available Languages
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Wait Section */}
      <section className="relative py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Why {language} Translation Is Coming
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">High Demand</h3>
                <p className="text-gray-600">
                  We've received many requests for {language} translation support from our community.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Quality Focus</h3>
                <p className="text-gray-600">
                  We're taking time to ensure the highest translation quality for {language} speakers.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">AI Training</h3>
                <p className="text-gray-600">
                  Our AI models are being specially trained to understand {language} nuances and context.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Need Translation Now?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Try our available languages or use our general text translator
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <Link href="/text-translate">
              <Button variant="secondary" size="lg">
                Try Text Translator
              </Button>
            </Link>
            <Link href="/document-translate">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
                Translate Documents
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
} 