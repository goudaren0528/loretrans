import { ArrowRight, FileText, Image, Type } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

type TranslationOption = 'text' | 'document' | 'image'

const optionDetails: Record<TranslationOption, { icon: React.ReactNode; href: string; available: boolean }> = {
  text: {
    icon: <Type className="h-8 w-8" />,
    href: '/text-translate',
    available: true,
  },
  document: {
    icon: <FileText className="h-8 w-8" />,
    href: '/document-translate',
    available: true,
  },
  image: {
    icon: <Image className="h-8 w-8" />,
    href: '/image-translate',
    available: false,
  },
}

export function TranslationOptions({ t }: { t: (key: string) => string }) {
  const options: TranslationOption[] = ['text', 'document', 'image']

  return (
    <section className="relative py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {t('title')}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              {t('description')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {options.map((option) => (
              <div
                key={option}
                className={`relative rounded-lg border p-6 shadow-sm transition-all hover:shadow-md ${
                  optionDetails[option].available 
                    ? 'bg-white border-gray-200 hover:border-primary/50' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                {!optionDetails[option].available && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                      {t('coming_soon')}
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${
                    optionDetails[option].available ? 'bg-primary text-white' : 'bg-gray-300 text-gray-500'
                  }`}>
                    {optionDetails[option].icon}
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t(`options.${option}.title`)}
                </h3>

                <p className="text-gray-600 mb-4">
                  {t(`options.${option}.description`)}
                </p>

                <ul className="space-y-2 mb-6">
                  {[0, 1, 2, 3].map((index) => {
                    const feature = t(`options.${option}.features.${index}`)
                    // Don't render if the translation string is empty or missing
                    if (!feature || feature.startsWith(`options.${option}.features`)) return null
                    return (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <div className={`mr-2 h-1.5 w-1.5 rounded-full ${
                          optionDetails[option].available ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                        {feature}
                      </li>
                    )
                  })}
                </ul>

                {optionDetails[option].available ? (
                  <Link href={optionDetails[option].href}>
                    <Button className="w-full group">
                      {t(`options.${option}.button`)}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                ) : (
                  <Button disabled className="w-full">
                    {t('coming_soon')}
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Quick Start Section */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-600 mb-4">
              {t('quick_start.title')}
            </p>
            <Link href="/text-translate">
              <Button variant="outline" size="lg">
                {t('quick_start.button')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
} 