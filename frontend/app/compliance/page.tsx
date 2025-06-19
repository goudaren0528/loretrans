import type { Metadata } from 'next'
import { StructuredData } from '@/components/structured-data'

export const metadata: Metadata = {
  title: 'Compliance Statement',
  description: 'Transly Compliance Statement - Our commitment to GDPR, CCPA, and other regulatory standards for AI translation services.',
  openGraph: {
    title: 'Compliance Statement | Transly',
    description: 'Learn about our regulatory compliance and data protection standards.',
  },
}

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Compliance Statement",
  "description": "Transly Compliance Statement and regulatory adherence",
  "url": "https://transly.app/compliance",
  "mainEntity": {
    "@type": "Organization",
    "name": "Transly",
    "url": "https://transly.app",
    "compliance": [
      "GDPR",
      "CCPA",
      "SOC 2",
      "ISO 27001"
    ]
  }
}

export default function CompliancePage() {
  return (
    <>
      <StructuredData type="WebPage" data={structuredData} />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Compliance Statement</h1>
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
              <h2 className="text-2xl font-semibold mb-4">1. Our Commitment to Compliance</h2>
              <p className="mb-4">
                At Transly, we are committed to maintaining the highest standards of 
                compliance with applicable laws, regulations, and industry best practices. 
                This Compliance Statement outlines our adherence to various regulatory 
                frameworks and our ongoing efforts to ensure responsible AI development 
                and data protection.
              </p>
              <p>
                We regularly review and update our compliance practices to align with 
                evolving regulatory requirements and industry standards.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Data Protection Compliance</h2>
              
              <h3 className="text-xl font-medium mb-3">2.1 GDPR Compliance</h3>
              <p className="mb-4">
                We comply with the EU General Data Protection Regulation (GDPR):
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Lawful basis for processing personal data</li>
                <li>Data minimization and purpose limitation</li>
                <li>Data subject rights facilitation</li>
                <li>Privacy by design implementation</li>
                <li>Breach notification procedures</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">2.2 CCPA Compliance</h3>
              <p className="mb-4">
                For California residents, we ensure CCPA compliance:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Right to know about data collection</li>
                <li>Right to delete personal information</li>
                <li>Right to opt-out of data sale</li>
                <li>Non-discrimination policies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. AI Ethics and Responsible Use</h2>
              <p className="mb-4">
                Our AI translation services adhere to responsible AI principles:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Fairness and bias mitigation</li>
                <li>Transparency in AI usage</li>
                <li>Human oversight and accountability</li>
                <li>Privacy-preserving AI processing</li>
                <li>Safety and reliability testing</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Security Standards</h2>
              <p className="mb-4">
                We implement industry-standard security measures:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>End-to-end encryption</li>
                <li>SOC 2 Type II compliance</li>
                <li>ISO 27001 alignment</li>
                <li>Regular security audits</li>
                <li>Incident response procedures</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Contact Information</h2>
              <p className="mb-4">
                For compliance-related inquiries:
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-medium">Compliance Officer</p>
                <p>Email: compliance@transly.app</p>
                <p>Data Protection Officer: dpo@transly.app</p>
                <p>Website: https://transly.app</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  )
} 