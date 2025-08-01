import { Metadata } from 'next'
import { Key, Zap, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'API Documentation - LoReTrans Developer Resources',
  description: 'Integrate LoReTrans translation services into your applications. Comprehensive API documentation for developers.',
  keywords: 'API documentation, translation API, developer resources, REST API, integration',
  openGraph: {
    title: 'API Documentation - LoReTrans Developer Resources',
    description: 'Integrate LoReTrans translation services into your applications. Comprehensive API documentation.',
    type: 'website',
    locale: 'en_US',
  },
  alternates: {
    canonical: '/api-docs',
  },
}

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800 mb-6">
              <Zap className="mr-2 h-4 w-4" />
              Coming Soon
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              API Documentation
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl">
              Integrate LoReTrans' powerful translation capabilities into your applications. 
              Our REST API provides programmatic access to all translation features.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-16">
        <div className="mx-auto max-w-6xl">
          {/* Coming Soon Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  API Coming in Q2 2024
                </h3>
                <p className="text-yellow-700 mb-4">
                  We're currently developing a comprehensive REST API that will give developers full access to our translation services. 
                  The API will include authentication, rate limiting, and detailed documentation.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm">
                    <Key className="mr-2 h-4 w-4" />
                    Join Waitlist
                  </Button>
                  <a href="/contact" className="text-yellow-700 hover:text-yellow-800 text-sm font-medium">
                    Contact for Early Access →
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Current Web Interface */}
          <section className="mt-12 pt-12 border-t border-gray-200">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Try Our Web Interface Now
              </h2>
              <p className="text-gray-600 mb-6">
                While we're building the API, you can test our translation capabilities through our web interface.
              </p>
              
              <div className="flex gap-4 justify-center">
                <a href="/text-translate">
                  <Button variant="outline">
                    Try Text Translation
                  </Button>
                </a>
                <a href="/document-translate">
                  <Button variant="outline">
                    Try Document Translation
                  </Button>
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
} 