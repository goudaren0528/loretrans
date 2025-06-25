import React from 'react'
import { Zap, Shield, Globe, Volume2, FileText, Sparkles } from 'lucide-react'

type FeatureName =
  | 'ai_powered'
  | 'fast'
  | 'privacy'
  | 'languages'
  | 'tts'
  | 'documents'

const featureDetails: Record<
  FeatureName,
  { icon: React.ElementType; name: string; description: string }
> = {
  ai_powered: {
    icon: Sparkles,
    name: 'AI-Powered Translation',
    description:
      "Powered by Meta's NLLB model for accurate low-resource language translation.",
  },
  fast: {
    icon: Zap,
    name: 'Lightning Fast',
    description: 'Get instant translations with our optimized AI infrastructure.',
  },
  privacy: {
    icon: Shield,
    name: 'Privacy First',
    description:
      'Your text is processed securely and never stored on our servers.',
  },
  languages: {
    icon: Globe,
    name: '20+ Languages',
    description:
      'Support for Creole, Lao, Swahili, Burmese, and many more low-resource languages.',
  },
  tts: {
    icon: Volume2,
    name: 'Text-to-Speech',
    description:
      'Listen to translations with our high-quality text-to-speech feature.',
  },
  documents: {
    icon: FileText,
    name: 'Document Translation',
    description:
      'Upload and translate PDF, Word, and PowerPoint files seamlessly.',
  },
}

export function FeatureSection() {
  const features: FeatureName[] = [
    'ai_powered',
    'fast',
    'privacy',
    'languages',
    'tts',
    'documents',
  ]

  return (
    <section className="relative py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Why Choose Transly?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Professional-grade translation tools designed for low-resource
              languages
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const details = featureDetails[feature]
              const Icon = details.icon
              return (
                <div
                  key={feature}
                  className="relative group bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon
                        className="h-6 w-6 text-primary"
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className="ml-3 text-lg font-semibold text-gray-900">
                      {details.name}
                    </h3>
                  </div>
                  <p className="text-gray-600">{details.description}</p>

                  {/* Decorative element */}
                  <div className="absolute top-0 right-0 h-2 w-16 bg-gradient-to-r from-primary/20 to-transparent rounded-bl-lg"></div>
                </div>
              )
            })}
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">20+</div>
              <div className="text-sm text-gray-600 mt-1">
                Languages Supported
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">100%</div>
              <div className="text-sm text-gray-600 mt-1">Free to Use</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">1000+</div>
              <div className="text-sm text-gray-600 mt-1">
                Characters per Translation
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">24/7</div>
              <div className="text-sm text-gray-600 mt-1">Available</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 