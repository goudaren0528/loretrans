import { Metadata } from 'next'
import { Mail, MessageCircle, Clock, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export const metadata: Metadata = {
  title: 'Contact Support - Get Help with Transly',
  description: 'Need help with translation? Contact our support team for assistance with Transly translation services, technical issues, or general inquiries.',
  keywords: 'contact support, help, translation support, customer service, technical support',
  openGraph: {
    title: 'Contact Support - Get Help with Transly',
    description: 'Need help with translation? Contact our support team for assistance.',
    type: 'website',
    locale: 'en_US',
  },
  alternates: {
    canonical: '/contact',
  },
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Contact Support
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl">
              Have questions about our translation services? Need technical support? 
              We're here to help you get the most out of Transly.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Send us a message
                </h2>
                
                <form className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        className="mt-1"
                        placeholder="Your first name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        className="mt-1"
                        placeholder="Your last name"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="mt-1"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Select name="subject">
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="translation-issue">Translation Issue</SelectItem>
                        <SelectItem value="technical-support">Technical Support</SelectItem>
                        <SelectItem value="feature-request">Feature Request</SelectItem>
                        <SelectItem value="language-request">New Language Request</SelectItem>
                        <SelectItem value="business-inquiry">Business Inquiry</SelectItem>
                        <SelectItem value="feedback">General Feedback</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="language">Related Language (if applicable)</Label>
                    <Input
                      id="language"
                      name="language"
                      type="text"
                      className="mt-1"
                      placeholder="e.g., Swahili, Lao, Creole"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      className="mt-1"
                      placeholder="Please describe your issue or question in detail..."
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full sm:w-auto">
                    <Mail className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </form>
              </div>
            </div>

            {/* Contact Information & FAQ */}
            <div className="space-y-8">
              {/* Quick Contact */}
              <div className="bg-white rounded-lg border shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Contact
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Email Support</p>
                      <p className="text-sm text-gray-600">support@transly.app</p>
                      <p className="text-xs text-gray-500 mt-1">Response within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MessageCircle className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Live Chat</p>
                      <p className="text-sm text-gray-600">Available soon</p>
                      <p className="text-xs text-gray-500 mt-1">Coming in Q2 2024</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Support Hours</p>
                      <p className="text-sm text-gray-600">Monday - Friday</p>
                      <p className="text-xs text-gray-500 mt-1">9:00 AM - 6:00 PM UTC</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Common Issues */}
              <div className="bg-white rounded-lg border shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  <HelpCircle className="inline h-5 w-5 mr-2" />
                  Common Issues
                </h3>
                
                <div className="space-y-3">
                  <details className="group">
                    <summary className="cursor-pointer text-sm font-medium text-gray-900 hover:text-primary">
                      Translation not working
                    </summary>
                    <p className="mt-2 text-xs text-gray-600 pl-4">
                      Try refreshing the page or check your internet connection. For persistent issues, contact support.
                    </p>
                  </details>

                  <details className="group">
                    <summary className="cursor-pointer text-sm font-medium text-gray-900 hover:text-primary">
                      Language not supported
                    </summary>
                    <p className="mt-2 text-xs text-gray-600 pl-4">
                      We're constantly adding new languages. Submit a request and we'll consider it for future updates.
                    </p>
                  </details>

                  <details className="group">
                    <summary className="cursor-pointer text-sm font-medium text-gray-900 hover:text-primary">
                      File upload issues
                    </summary>
                    <p className="mt-2 text-xs text-gray-600 pl-4">
                      Ensure your file is under 50MB and in supported format (PDF, DOCX, PPTX).
                    </p>
                  </details>

                  <details className="group">
                    <summary className="cursor-pointer text-sm font-medium text-gray-900 hover:text-primary">
                      Audio playback not working
                    </summary>
                    <p className="mt-2 text-xs text-gray-600 pl-4">
                      Check your browser's audio settings and ensure you have a stable internet connection.
                    </p>
                  </details>
                </div>
              </div>

              {/* Self-Help */}
              <div className="bg-white rounded-lg border shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Self-Help Resources
                </h3>
                
                <div className="space-y-3">
                  <a href="/about" className="block text-sm text-primary hover:underline">
                    → How Transly works
                  </a>
                  <a href="/text-translate" className="block text-sm text-primary hover:underline">
                    → Try text translation
                  </a>
                  <a href="/document-translate" className="block text-sm text-primary hover:underline">
                    → Document translation guide
                  </a>
                  <a href="/privacy" className="block text-sm text-primary hover:underline">
                    → Privacy policy
                  </a>
                  <a href="/terms" className="block text-sm text-primary hover:underline">
                    → Terms of service
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Response Time Section */}
      <section className="relative py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              What to Expect
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Quick Response</h3>
                <p className="text-gray-600">
                  We typically respond to all inquiries within 24 hours during business days.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Personal Support</h3>
                <p className="text-gray-600">
                  Every message is read by our team. No bots, just real people who care about helping you.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                  <HelpCircle className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Follow-up</h3>
                <p className="text-gray-600">
                  We'll keep working with you until your issue is completely resolved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 