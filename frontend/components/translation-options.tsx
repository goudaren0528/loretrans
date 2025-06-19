import { ArrowRight, FileText, Image, Type } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface TranslationOption {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  href: string
  available: boolean
  features: string[]
}

const translationOptions: TranslationOption[] = [
  {
    id: 'text',
    title: 'Text Translation',
    description: 'Translate text between 20+ low-resource languages and English instantly.',
    icon: <Type className="h-8 w-8" />,
    href: '/text-translate',
    available: true,
    features: ['Up to 1000 characters', 'Instant results', 'Voice playback', 'Copy to clipboard']
  },
  {
    id: 'document',
    title: 'Document Translation',
    description: 'Upload and translate PDF, Word, and PowerPoint documents.',
    icon: <FileText className="h-8 w-8" />,
    href: '/document-translate',
    available: true,
    features: ['PDF, Word, PPT support', 'Preserves formatting', 'Download results', 'Batch processing']
  },
  {
    id: 'image',
    title: 'Image Translation',
    description: 'Extract and translate text from images using OCR technology.',
    icon: <Image className="h-8 w-8" />,
    href: '/image-translate',
    available: false,
    features: ['OCR text extraction', 'Multiple image formats', 'Preserve layout', 'Coming soon']
  }
]

export function TranslationOptions() {
  return (
    <section className="relative py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Choose Your Translation Method
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Select the best option for your translation needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {translationOptions.map((option) => (
              <div
                key={option.id}
                className={`relative rounded-lg border p-6 shadow-sm transition-all hover:shadow-md ${
                  option.available 
                    ? 'bg-white border-gray-200 hover:border-primary/50' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                {!option.available && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                      Coming Soon
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${
                    option.available ? 'bg-primary text-white' : 'bg-gray-300 text-gray-500'
                  }`}>
                    {option.icon}
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {option.title}
                </h3>

                <p className="text-gray-600 mb-4">
                  {option.description}
                </p>

                <ul className="space-y-2 mb-6">
                  {option.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <div className={`mr-2 h-1.5 w-1.5 rounded-full ${
                        option.available ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                      {feature}
                    </li>
                  ))}
                </ul>

                {option.available ? (
                  <Link href={option.href}>
                    <Button className="w-full group">
                      Start Translating
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                ) : (
                  <Button disabled className="w-full">
                    Coming Soon
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Quick Start Section */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-600 mb-4">
              Not sure which option to choose? Start with text translation
            </p>
            <Link href="/text-translate">
              <Button variant="outline" size="lg">
                Try Text Translation Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
} 