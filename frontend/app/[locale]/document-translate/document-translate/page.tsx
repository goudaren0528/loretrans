import { Metadata } from 'next'
import { Upload, FileText, CheckCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { SimpleFileSelector } from '@/components/simple-file-selector'

export const metadata: Metadata = {
  title: 'Document Translator - Free AI Document Translation | Loretrans',
  description:
    'Translate PDF, Word, and PowerPoint documents from 20+ low-resource languages to English. Free AI-powered document translation with format preservation.',
  keywords: [
    'document translator',
    'PDF translator',
    'Word translator',
    'document translation',
    'file translator',
    'AI document translation',
  ],
  alternates: {
    canonical: '/document-translate',
  },
}

export default function DocumentTranslatePage() {
  const supportedLanguages = [
    { name: 'Haitian Creole', nativeName: 'Kreyòl Ayisyen', path: '/creole-to-english' },
    { name: 'Lao', nativeName: 'ພາສາລາວ', path: '/lao-to-english' },
    { name: 'Swahili', nativeName: 'Kiswahili', path: '/swahili-to-english' },
    { name: 'Burmese', nativeName: 'မြန်မာဘာသာ', path: '/burmese-to-english' },
    { name: 'Telugu', nativeName: 'తెలుగు', path: '/telugu-to-english' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                AI Document Translator
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl">
                Upload PDF, Word, or PowerPoint documents and get professional translations 
                from low-resource languages to English. Preserves formatting and structure.
              </p>
              <div className="mt-8 flex items-center justify-center gap-x-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex h-2 w-2 rounded-full bg-green-500"></div>
                  <span>Format Preserved</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex h-2 w-2 rounded-full bg-blue-500"></div>
                  <span>AI Powered</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex h-2 w-2 rounded-full bg-purple-500"></div>
                  <span>Multiple Formats</span>
                </div>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="max-w-2xl mx-auto">
              <SimpleFileSelector />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How Document Translation Works</h2>
            <p className="text-lg text-muted-foreground">
              Simple 3-step process to translate your documents
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-3">1. Upload Document</h3>
              <p className="text-muted-foreground">
                Upload your PDF, Word, or PowerPoint document in any supported language.
              </p>
            </div>

            <div className="text-center">
              <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-3">2. AI Processing</h3>
              <p className="text-muted-foreground">
                Our AI extracts text, translates it accurately, and preserves document formatting.
              </p>
            </div>

            <div className="text-center">
              <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-3">3. Download Result</h3>
              <p className="text-muted-foreground">
                Download your translated document with the same formatting as the original.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Formats */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Supported File Formats</h2>
            <p className="text-lg text-muted-foreground">
              We support the most common document formats
            </p>
          </div>

          <div className="flex justify-center gap-8">
            <div className="bg-white border rounded-lg p-6 text-center shadow-sm">
              <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <FileText className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="font-semibold mb-2">PDF</h3>
              <p className="text-sm text-muted-foreground">Portable Document Format</p>
            </div>

            <div className="bg-white border rounded-lg p-6 text-center shadow-sm">
              <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="font-semibold mb-2">DOCX</h3>
              <p className="text-sm text-muted-foreground">Microsoft Word Document</p>
            </div>

            <div className="bg-white border rounded-lg p-6 text-center shadow-sm">
              <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <FileText className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="font-semibold mb-2">PPTX</h3>
              <p className="text-sm text-muted-foreground">PowerPoint Presentation</p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Languages */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Supported Languages</h2>
            <p className="text-lg text-muted-foreground">
              Translate documents from these languages to English
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {supportedLanguages.map((lang) => (
              <Link href={lang.path} key={lang.name} className="group">
                <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors flex justify-between items-center">
                  <div>
                    <div className="font-medium">{lang.name}</div>
                    <div className="text-sm text-muted-foreground">{lang.nativeName}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to Translate Your Documents?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Upload your document and get professional translation in minutes
          </p>
          <div className="mt-8">
            <a
              href="#upload"
              className="inline-flex items-center rounded-md bg-white px-6 py-3 text-base font-medium text-primary hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary"
            >
              Upload Document Now
            </a>
          </div>
        </div>
      </section>
    </div>
  )
} 