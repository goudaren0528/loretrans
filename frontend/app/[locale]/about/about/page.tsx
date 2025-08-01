import { Metadata } from 'next'
import { CheckCircle, Globe, Zap, Shield, Heart, Users, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FAQ } from '@/components/faq'
import { LanguageGrid } from '@/components/language-grid'

export const metadata: Metadata = {
  title: 'About LoReTrans - AI Translation for Low-Resource Languages',
  description:
    'Learn about LoReTrans\'s mission to provide free, accurate AI translation for underserved languages like Creole, Lao, Swahili, Burmese, and Telugu.',
  keywords: [
    'about loretrans',
    'AI translation',
    'low-resource languages',
    'NLLB model',
    'language accessibility',
    'free translation service',
  ],
  alternates: {
    canonical: '/about',
  },
}

export default function AboutPage() {
  const teamMembers = [
    {
      name: 'AI Translation Team',
      role: 'Engineering & Research',
      description: 'Passionate about making language technology accessible to everyone.',
    },
  ]

  const milestones = [
    {
      year: '2024',
      title: 'LoReTrans Launch',
      description: 'Launched with support for 20+ low-resource languages using Meta\'s NLLB model.',
    },
    {
      year: '2024',
      title: 'Document Translation',
      description: 'Added support for PDF, Word, and PowerPoint document translation.',
    },
    {
      year: '2024',
      title: 'Community Growth',
      description: 'Serving thousands of users worldwide with free, accurate translations.',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              About LoReTrans
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl">
              We're on a mission to break down language barriers for underserved communities 
              by providing free, accurate AI translation for low-resource languages.
            </p>
            <div className="mt-10">
              <Link href="/text-translate">
                <Button size="lg">
                  Try Translation Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Making accurate translation accessible for languages that are often overlooked by mainstream services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-3">Language Equality</h3>
              <p className="text-muted-foreground">
                Every language deserves quality translation technology, regardless of the number of speakers.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-3">Community First</h3>
              <p className="text-muted-foreground">
                Built for communities who need reliable translation to connect with the world.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-3">Cutting-Edge AI</h3>
              <p className="text-muted-foreground">
                Powered by Meta's NLLB model, providing state-of-the-art translation quality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Makes LoReTrans Special</h2>
            <p className="text-lg text-muted-foreground">
              Built specifically for languages that need better translation support
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4">
              <div className="rounded-full bg-green-100 p-2 flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">100% Free</h3>
                <p className="text-muted-foreground">
                  No hidden costs, no premium tiers. Quality translation should be accessible to everyone.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="rounded-full bg-blue-100 p-2 flex-shrink-0">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Privacy Focused</h3>
                <p className="text-muted-foreground">
                  Your text is processed securely and not stored. Your privacy is our priority.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="rounded-full bg-purple-100 p-2 flex-shrink-0">
                <Zap className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Instant Results</h3>
                <p className="text-muted-foreground">
                  Get accurate translations in seconds, not minutes. Built for speed and efficiency.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="rounded-full bg-orange-100 p-2 flex-shrink-0">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Community Driven</h3>
                <p className="text-muted-foreground">
                  Built with feedback from native speakers and communities who use these languages daily.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Languages */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Languages We Support
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Providing quality translation for these underserved languages
              </p>
            </div>
            <LanguageGrid />
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Journey</h2>
            <p className="text-lg text-muted-foreground">
              Key milestones in making translation accessible for all
            </p>
          </div>

          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                    {milestone.year}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{milestone.title}</h3>
                  <p className="text-muted-foreground">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQ />

      {/* CTA Section */}
      <section className="relative py-16 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to Break Language Barriers?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Join our mission to make translation accessible for everyone
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <Link href="/text-translate">
              <Button variant="secondary" size="lg">
                Start Translating
              </Button>
            </Link>
            <Link href="/document-translate">
              <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-primary">
                Upload Document
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
} 