import React from 'react'
import { Metadata } from 'next'
import { CheckCircle, Globe, Zap, Shield, Heart, Users, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { APP_CONFIG } from '../../../config/app.config'

export const metadata: Metadata = {
  title: 'About Transly - Professional Translation for Low-Resource Languages',
  description: 'Learn about Transly, the leading translation platform for small languages to English. Powered by Meta NLLB model with 20+ supported languages.',
  keywords: 'about transly, translation platform, low-resource languages, small languages, Meta NLLB',
  openGraph: {
    title: 'About Transly - Professional Translation Platform',
    description: 'Professional translation for low-resource languages to English. Discover our mission, technology, and supported languages.',
    type: 'website',
  },
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          About Transly
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Professional translation platform dedicated to connecting low-resource languages with the world through accurate English translation.
        </p>
      </div>

      {/* Mission Section */}
      <div className="mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-muted-foreground mb-6">
              We believe every language deserves to be heard. Transly bridges the communication gap for speakers of low-resource languages, 
              providing accurate and accessible translation services to English.
            </p>
            <p className="text-lg text-muted-foreground mb-8">
              Powered by Meta's state-of-the-art NLLB (No Language Left Behind) model, we support over 20 languages that are often 
              overlooked by mainstream translation services.
            </p>
            <Link href="/document-translate">
              <Button size="lg">
                Try Document Translation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <Globe className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Global Accessibility</h3>
                <p className="text-muted-foreground">
                  Making translation accessible for speakers of languages with limited digital resources.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Zap className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Fast & Accurate</h3>
                <p className="text-muted-foreground">
                  Advanced AI technology delivers high-quality translations in seconds.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Shield className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Privacy First</h3>
                <p className="text-muted-foreground">
                  Your translations are not stored. We respect your privacy and data security.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Supported Languages */}
      <div className="mb-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Supported Languages</h2>
          <p className="text-lg text-muted-foreground">
            We support {APP_CONFIG.languages.supported.length} low-resource languages with more being added regularly.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {APP_CONFIG.languages.supported.map((language) => (
            <div key={language.code} className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="font-medium">{language.name}</div>
                <div className="text-sm text-muted-foreground">{language.nativeName}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <p className="text-muted-foreground mb-4">
            Don't see your language? We're constantly expanding our language support.
          </p>
          <Button variant="outline">
            Request a Language
          </Button>
        </div>
      </div>

      {/* Technology Section */}
      <div className="mb-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Powered by Advanced AI</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Transly uses Meta's NLLB (No Language Left Behind) model, specifically designed to provide 
            high-quality translation for low-resource languages that traditional systems struggle with.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Cultural Preservation</h3>
            <p className="text-muted-foreground">
              Supporting linguistic diversity and helping preserve cultural heritage through technology.
            </p>
          </div>
          
          <div className="text-center">
            <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Community Driven</h3>
            <p className="text-muted-foreground">
              Built with feedback from native speakers and language communities worldwide.
            </p>
          </div>
          
          <div className="text-center">
            <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Continuous Improvement</h3>
            <p className="text-muted-foreground">
              Regular model updates and improvements to provide better translation quality.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
        </div>
        
        <div className="space-y-6">
          <div className="border rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-3">What makes Transly different from other translation services?</h3>
            <p className="text-muted-foreground">
              Transly specializes in low-resource languages that are often poorly supported by mainstream translation services. 
              We use Meta's NLLB model, which is specifically designed for these languages, ensuring better accuracy and cultural context.
            </p>
          </div>
          
          <div className="border rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-3">Is my data safe and private?</h3>
            <p className="text-muted-foreground">
              Yes, we prioritize your privacy. We don't store your translations or personal data. All translations are processed 
              securely and deleted immediately after delivery. For document translations, files are automatically removed after download.
            </p>
          </div>
          
          <div className="border rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-3">What file formats do you support for document translation?</h3>
            <p className="text-muted-foreground">
              We currently support PDF, Microsoft Word (.doc, .docx), PowerPoint (.ppt, .pptx), and plain text (.txt) files. 
              We're working on adding support for more formats based on user feedback.
            </p>
          </div>
          
          <div className="border rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-3">How accurate are the translations?</h3>
            <p className="text-muted-foreground">
              Our translations are powered by Meta's state-of-the-art NLLB model, which has been trained specifically on low-resource languages. 
              While no automated translation is perfect, our system provides significantly better results for small languages compared to traditional services.
            </p>
          </div>
          
          <div className="border rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-3">Can I translate from English to my language?</h3>
            <p className="text-muted-foreground">
              Yes! While our primary focus is translating from low-resource languages to English, we also support reverse translation 
              from English to supported languages. Just use the language selector to choose your desired translation direction.
            </p>
          </div>
          
          <div className="border rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-3">Do you offer API access for developers?</h3>
            <p className="text-muted-foreground">
              We're currently developing API access for developers and businesses. If you're interested in integrating our translation 
              capabilities into your application, please contact us for early access information.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center bg-muted/50 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Experience accurate translation for your language today. Whether it's a quick text or a full document, 
          Transly is here to help you communicate with the world.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button size="lg">
              Try Text Translation
            </Button>
          </Link>
          <Link href="/document-translate">
            <Button variant="outline" size="lg">
              Upload Document
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 