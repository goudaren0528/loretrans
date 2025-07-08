import type { Metadata } from 'next'
import { StructuredData } from '@/components/structured-data'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Loretrans Privacy Policy - How we collect, use, and protect your data when using our AI translation services.',
  openGraph: {
    title: 'Privacy Policy | Loretrans',
    description: 'Learn about our data practices and privacy commitments.',
  },
}

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Privacy Policy",
  "description": "Loretrans Privacy Policy and data protection practices",
  "url": "https://loretrans.app/privacy",
  "mainEntity": {
    "@type": "PrivacyPolicy",
    "name": "Loretrans Privacy Policy",
    "provider": {
      "@type": "Organization",
      "name": "Loretrans",
      "url": "https://loretrans.app"
    }
  }
}

export default function PrivacyPage() {
  return (
    <>
      <StructuredData type="WebPage" data={structuredData} />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
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
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="mb-4">
                At Loretrans, we are committed to protecting your privacy and ensuring the 
                security of your personal information. This Privacy Policy explains how we 
                collect, use, disclose, and safeguard your information when you use our 
                AI-powered translation platform.
              </p>
              <p>
                By using our service, you agree to the collection and use of information 
                in accordance with this policy. We will not use or share your information 
                except as described in this Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-medium mb-3">2.1 Information You Provide</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Translation Content:</strong> Text you input for translation and documents you upload</li>
                <li><strong>Email Address:</strong> When provided for document translation result delivery</li>
                <li><strong>Feedback:</strong> Comments, suggestions, or support requests you submit</li>
                <li><strong>Usage Preferences:</strong> Language selections and service preferences</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">2.2 Automatically Collected Information</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Usage Analytics:</strong> Pages visited, features used, time spent on platform</li>
                <li><strong>Technical Data:</strong> IP address, browser type, device information, operating system</li>
                <li><strong>Performance Metrics:</strong> Translation response times, error rates, service availability</li>
                <li><strong>Cookies:</strong> Small data files to improve user experience and service functionality</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">2.3 Third-Party Service Data</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>AI Processing:</strong> Data sent to Hugging Face and other AI service providers for translation</li>
                <li><strong>Text-to-Speech:</strong> Audio generation through third-party TTS services</li>
                <li><strong>Analytics:</strong> Aggregated usage data for service improvement</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              
              <p className="mb-4">We use the collected information for the following purposes:</p>
              
              <h3 className="text-xl font-medium mb-3">3.1 Service Provision</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Process translation requests and deliver results</li>
                <li>Detect source languages automatically</li>
                <li>Generate audio for text-to-speech functionality</li>
                <li>Deliver document translation results via email</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">3.2 Service Improvement</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Analyze usage patterns to enhance user experience</li>
                <li>Optimize translation accuracy and speed</li>
                <li>Develop new features and capabilities</li>
                <li>Monitor and improve service reliability</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">3.3 Security and Compliance</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Detect and prevent fraud or abuse</li>
                <li>Ensure service security and stability</li>
                <li>Comply with legal and regulatory requirements</li>
                <li>Protect our rights and the rights of other users</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Data Storage and Retention</h2>
              
              <h3 className="text-xl font-medium mb-3">4.1 Translation Content</h3>
              <p className="mb-4">
                <strong>We do not permanently store your translation content.</strong> 
                Here's our data handling process:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Text translations are processed in real-time and not stored</li>
                <li>Uploaded documents are temporarily stored during processing</li>
                <li>Files are automatically deleted within 24 hours of upload</li>
                <li>Translation results may be cached briefly to improve performance</li>
                <li>Cache data is automatically purged within 7 days</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">4.2 Analytics and Logs</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Usage analytics are retained for 12 months</li>
                <li>Technical logs are kept for 30 days for troubleshooting</li>
                <li>Error logs are retained for 90 days for service improvement</li>
                <li>All analytics data is anonymized and aggregated</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Data Sharing and Third Parties</h2>
              
              <h3 className="text-xl font-medium mb-3">5.1 AI Service Providers</h3>
              <p className="mb-4">
                We share translation content with trusted third-party AI providers:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Hugging Face:</strong> For NLLB model translation processing</li>
                <li><strong>TTS Providers:</strong> For text-to-speech audio generation</li>
                <li>All providers are bound by strict data processing agreements</li>
                <li>Data is processed securely and not stored by providers</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">5.2 Infrastructure Partners</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Vercel:</strong> Hosting and content delivery</li>
                <li><strong>Upstash:</strong> Redis caching services</li>
                <li><strong>Email Services:</strong> For document translation delivery</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">5.3 Legal Requirements</h3>
              <p className="mb-4">
                We may disclose information if required by law, legal process, or 
                to protect our rights, safety, or the rights of others.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Data Security</h2>
              
              <p className="mb-4">We implement comprehensive security measures:</p>
              
              <h3 className="text-xl font-medium mb-3">6.1 Technical Safeguards</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>SSL/TLS encryption for all data transmission</li>
                <li>Secure API connections to third-party services</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Automated threat detection and response systems</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">6.2 Operational Security</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Access controls and authentication mechanisms</li>
                <li>Regular security training for team members</li>
                <li>Incident response procedures and monitoring</li>
                <li>Secure development and deployment practices</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">6.3 Data Protection</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Encryption of data at rest and in transit</li>
                <li>Regular backups with secure storage</li>
                <li>Data minimization and purpose limitation</li>
                <li>Secure data disposal and deletion procedures</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Your Rights and Choices</h2>
              
              <h3 className="text-xl font-medium mb-3">7.1 Privacy Rights</h3>
              <p className="mb-4">You have the following rights regarding your data:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Access:</strong> Request information about data we have about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                <li><strong>Portability:</strong> Request export of your data in standard formats</li>
                <li><strong>Objection:</strong> Object to certain types of data processing</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">7.2 Cookie Controls</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Most browsers allow you to control cookie settings</li>
                <li>You can disable cookies, though this may affect functionality</li>
                <li>We use essential cookies for service operation</li>
                <li>Analytics cookies help us improve our services</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">7.3 Communication Preferences</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Choose whether to receive service notifications</li>
                <li>Opt out of non-essential communications</li>
                <li>Control how we contact you for support</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. International Data Transfers</h2>
              <p className="mb-4">
                Our services may involve international data transfers to provide 
                optimal translation services. We ensure appropriate safeguards 
                are in place for cross-border data transfers, including:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Standard contractual clauses with service providers</li>
                <li>Adequacy decisions for certain jurisdictions</li>
                <li>Data processing agreements with strong privacy protections</li>
                <li>Compliance with applicable data protection laws</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
              <p className="mb-4">
                Our service is not intended for children under 13 years of age. 
                We do not knowingly collect personal information from children under 13. 
                If you are a parent or guardian and believe your child has provided 
                us with personal information, please contact us to have it removed.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Changes to This Policy</h2>
              <p className="mb-4">
                We may update this Privacy Policy from time to time. When we make changes:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>We will update the "Last updated" date at the top</li>
                <li>Significant changes will be highlighted on our platform</li>
                <li>We may notify users via email for material changes</li>
                <li>Continued use constitutes acceptance of updated terms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
              <p className="mb-4">
                If you have questions about this Privacy Policy or our data practices, 
                please contact us:
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-medium">Privacy Officer</p>
                <p>Email: privacy@loretrans.app</p>
                <p>Website: https://loretrans.app</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  We will respond to privacy inquiries within 30 days.
                </p>
              </div>
            </section>

            <section className="border-t pt-8">
              <div className="bg-blue-50 dark:bg-blue-950/20 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 text-blue-900 dark:text-blue-100">
                  Your Privacy Matters
                </h3>
                <p className="text-blue-800 dark:text-blue-200">
                  We are committed to maintaining your trust by protecting your privacy 
                  and being transparent about our data practices. If you have any concerns 
                  or questions about how we handle your information, please don't hesitate 
                  to reach out to us.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  )
} 