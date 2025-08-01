import type { Metadata } from 'next'


export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'LoReTrans Terms of Service - Legal agreement governing the use of our AI translation platform for low-resource languages.',
  openGraph: {
    title: 'Terms of Service | LoReTrans',
    description: 'Legal terms and conditions for using LoReTrans translation services.',
  },
}

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Terms of Service",
  "description": "LoReTrans Terms of Service and legal agreement",
  "url": "https://loretrans.com/terms",
  "mainEntity": {
    "@type": "TermsOfService",
    "name": "LoReTrans Terms of Service",
    "provider": {
      "@type": "Organization",
      "name": "LoReTrans",
      "url": "https://loretrans.com"
    }
  }
}

export default function TermsPage() {
  return (
    <>
      {/* 结构化数据 - SSR优化 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Terms of Service",
          "description": "Terms and conditions for using LoReTrans translation services.",
          "url": "https://loretrans.com/en/terms",
          "inLanguage": "en",
          "isPartOf": {
                    "@type": "WebSite",
                    "name": "LoReTrans",
                    "url": "https://loretrans.com"
          },
          "provider": {
                    "@type": "Organization",
                    "name": "LoReTrans",
                    "url": "https://loretrans.com"
          }
}, null, 2)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
                    {
                              "@type": "ListItem",
                              "position": 1,
                              "name": "Home",
                              "item": "https://loretrans.com/en"
                    },
                    {
                              "@type": "ListItem",
                              "position": 2,
                              "name": "Terms of Service",
                              "item": "https://loretrans.com/en/terms"
                    }
          ]
}, null, 2)
        }}
      />
      

          <>
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
            <p className="text-muted-foreground text-lg">
              Last updated: {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
              <p className="mb-4">
                By accessing and using LoReTrans ("Service"), you accept and agree to be bound by 
                the terms and provision of this agreement. If you do not agree to abide by the 
                above, please do not use this service.
              </p>
              <p>
                These Terms of Service ("Terms") govern your use of our translation platform 
                that provides AI-powered translation services for low-resource languages to English.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Service Description</h2>
              <p className="mb-4">
                LoReTrans provides AI-powered translation services including:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Text translation between low-resource languages and English</li>
                <li>Document translation for PDF, Word, and PowerPoint files</li>
                <li>Text-to-speech (TTS) functionality for translated content</li>
                <li>Language detection and automatic translation routing</li>
              </ul>
              <p>
                Our services are powered by Meta's NLLB (No Language Left Behind) AI model 
                and other state-of-the-art language processing technologies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
              <p className="mb-4">By using our service, you agree to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Provide accurate information when required</li>
                <li>Use the service for lawful purposes only</li>
                <li>Not attempt to reverse engineer or compromise our systems</li>
                <li>Not upload malicious files or content that violates our policies</li>
                <li>Respect intellectual property rights of translated content</li>
                <li>Not use the service to translate illegal, harmful, or offensive content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Usage Limits and Fair Use</h2>
              <p className="mb-4">
                To ensure fair access for all users, we implement the following usage limits:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Free tier: Limited text length and document pages</li>
                <li>Rate limiting to prevent abuse and ensure service stability</li>
                <li>File size restrictions for document uploads</li>
                <li>Daily usage quotas may apply to prevent system overload</li>
              </ul>
              <p>
                Excessive use that impacts service availability for other users may result 
                in temporary or permanent account restrictions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Privacy and Data Handling</h2>
              <p className="mb-4">
                Your privacy is important to us. Please review our Privacy Policy for 
                detailed information about how we collect, use, and protect your data.
              </p>
              <p className="mb-4">Key points regarding data handling:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>We do not store your translation content after processing</li>
                <li>Uploaded files are temporarily stored and automatically deleted</li>
                <li>We may cache translation results to improve service performance</li>
                <li>Anonymous usage analytics help us improve our services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Translation Accuracy and Disclaimers</h2>
              <p className="mb-4">
                While we strive to provide accurate translations using advanced AI technology:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Translations are provided "as is" without warranty of accuracy</li>
                <li>AI translations may contain errors, especially for complex or specialized content</li>
                <li>We recommend human review for critical or professional documents</li>
                <li>Cultural nuances and context may not be fully preserved</li>
                <li>Technical or domain-specific terms may not be accurately translated</li>
              </ul>
              <p>
                You are responsible for verifying the accuracy of translations before 
                using them for important purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
              <p className="mb-4">
                The LoReTrans platform, including its design, functionality, and underlying 
                technology, is protected by intellectual property laws. You agree to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Not copy, modify, or redistribute our platform or its components</li>
                <li>Respect our trademarks, logos, and branding</li>
                <li>Not claim ownership of our technology or services</li>
              </ul>
              <p>
                You retain ownership of the content you submit for translation, and we 
                do not claim any rights to your original content.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Service Availability and Maintenance</h2>
              <p className="mb-4">
                We strive to maintain high service availability, but:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Service may be temporarily unavailable due to maintenance or technical issues</li>
                <li>We do not guarantee 100% uptime or uninterrupted service access</li>
                <li>Third-party service dependencies may affect our service availability</li>
                <li>We reserve the right to modify or discontinue features with notice</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
              <p className="mb-4">
                To the fullest extent permitted by law:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>We are not liable for any indirect, incidental, or consequential damages</li>
                <li>Our total liability shall not exceed the amount paid by you for the service</li>
                <li>We are not responsible for damages resulting from translation inaccuracies</li>
                <li>You use our service at your own risk and discretion</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
              <p className="mb-4">
                We reserve the right to modify these Terms at any time. When we make changes:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>We will update the "Last updated" date at the top of this page</li>
                <li>Significant changes will be communicated through our platform</li>
                <li>Continued use of the service constitutes acceptance of modified terms</li>
                <li>You are responsible for reviewing these Terms periodically</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Termination</h2>
              <p className="mb-4">
                We may terminate or suspend your access to our service:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>For violation of these Terms or our policies</li>
                <li>For suspected fraudulent or abusive activity</li>
                <li>If required by law or legal process</li>
                <li>At our discretion to protect our service and other users</li>
              </ul>
              <p>
                You may stop using our service at any time. Upon termination, 
                these Terms will remain in effect for applicable provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Governing Law</h2>
              <p className="mb-4">
                These Terms are governed by and construed in accordance with applicable laws. 
                Any disputes arising from these Terms or your use of our service will be 
                resolved through appropriate legal channels.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
              <p className="mb-4">
                If you have questions about these Terms, please contact us at:
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-medium">LoReTrans Support</p>
                <p>Email: legal@loretrans.com</p>
                <p>Website: https://loretrans.com</p>
              </div>
            </section>

            <section className="border-t pt-8">
              <h2 className="text-2xl font-semibold mb-4">14. Acknowledgment</h2>
              <p className="mb-4">
                By using LoReTrans, you acknowledge that you have read, understood, and 
                agree to be bound by these Terms of Service. If you do not agree to 
                these terms, please discontinue use of our service immediately.
              </p>
              <p className="text-sm text-muted-foreground">
                These Terms constitute the entire agreement between you and LoReTrans 
                regarding your use of the service, superseding any prior agreements.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  )
} 