import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next'
import { Mail, MessageCircle, Clock, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'ContactPage.meta' });
  return {
    title: t('title'),
    description: t('description'),
    keywords: 'contact support, help, translation support, customer service, technical support',
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website',
      locale: 'en_US',
    },
    alternates: {
      canonical: '/contact',
    },
  };
}

export default async function ContactPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: 'ContactPage' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              {t('hero.title')}
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl">
              {t('hero.description')}
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
                  {t('form.title')}
                </h2>

                <form className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">{t('form.firstName')}</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        className="mt-1"
                        placeholder={t('form.firstNamePlaceholder')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">{t('form.lastName')}</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        className="mt-1"
                        placeholder={t('form.lastNamePlaceholder')}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">{t('form.email')}</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="mt-1"
                      placeholder={t('form.emailPlaceholder')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject">{t('form.subject')}</Label>
                    <Select name="subject">
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder={t('form.subjectPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="translation-issue">{t('form.subjects.translation_issue')}</SelectItem>
                        <SelectItem value="technical-support">{t('form.subjects.technical_support')}</SelectItem>
                        <SelectItem value="feature-request">{t('form.subjects.feature_request')}</SelectItem>
                        <SelectItem value="language-request">{t('form.subjects.language_request')}</SelectItem>
                        <SelectItem value="business-inquiry">{t('form.subjects.business_inquiry')}</SelectItem>
                        <SelectItem value="feedback">{t('form.subjects.feedback')}</SelectItem>
                        <SelectItem value="other">{t('form.subjects.other')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="language">{t('form.relatedLanguage')}</Label>
                    <Input
                      id="language"
                      name="language"
                      type="text"
                      className="mt-1"
                      placeholder={t('form.relatedLanguagePlaceholder')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">{t('form.message')}</Label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      className="mt-1"
                      placeholder={t('form.messagePlaceholder')}
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full sm:w-auto">
                    <Mail className="mr-2 h-4 w-4" />
                    {t('form.submit')}
                  </Button>
                </form>
              </div>
            </div>

            {/* Contact Information & FAQ */}
            <div className="space-y-8">
              {/* Quick Contact */}
              <div className="bg-white rounded-lg border shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('sidebar.quick_contact.title')}
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">{t('sidebar.quick_contact.email_support')}</p>
                      <p className="text-sm text-gray-600">{t('sidebar.quick_contact.email_address')}</p>
                      <p className="text-xs text-gray-500 mt-1">{t('sidebar.quick_contact.response_time')}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MessageCircle className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">{t('sidebar.quick_contact.live_chat')}</p>
                      <p className="text-sm text-gray-600">{t('sidebar.quick_contact.live_chat_status')}</p>
                      <p className="text-xs text-gray-500 mt-1">{t('sidebar.quick_contact.live_chat_eta')}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">{t('sidebar.quick_contact.support_hours_title')}</p>
                      <p className="text-sm text-gray-600">{t('sidebar.quick_contact.support_hours_days')}</p>
                      <p className="text-xs text-gray-500 mt-1">{t('sidebar.quick_contact.support_hours_time')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Common Issues */}
              <div className="bg-white rounded-lg border shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  <HelpCircle className="inline h-5 w-5 mr-2" />
                  {t('sidebar.common_issues.title')}
                </h3>

                <div className="space-y-3">
                  <details className="group">
                    <summary className="cursor-pointer text-sm font-medium text-gray-900 hover:text-primary">
                      {t('sidebar.common_issues.translation_not_working.title')}
                    </summary>
                    <p className="mt-2 text-xs text-gray-600 pl-4">
                      {t('sidebar.common_issues.translation_not_working.description')}
                    </p>
                  </details>

                  <details className="group">
                    <summary className="cursor-pointer text-sm font-medium text-gray-900 hover:text-primary">
                      {t('sidebar.common_issues.language_not_supported.title')}
                    </summary>
                    <p className="mt-2 text-xs text-gray-600 pl-4">
                      {t('sidebar.common_issues.language_not_supported.description')}
                    </p>
                  </details>

                  <details className="group">
                    <summary className="cursor-pointer text-sm font-medium text-gray-900 hover:text-primary">
                      {t('sidebar.common_issues.file_upload_issues.title')}
                    </summary>
                    <p className="mt-2 text-xs text-gray-600 pl-4">
                      {t('sidebar.common_issues.file_upload_issues.description')}
                    </p>
                  </details>

                  <details className="group">
                    <summary className="cursor-pointer text-sm font-medium text-gray-900 hover:text-primary">
                      {t('sidebar.common_issues.audio_playback_not_working.title')}
                    </summary>
                    <p className="mt-2 text-xs text-gray-600 pl-4">
                      {t('sidebar.common_issues.audio_playback_not_working.description')}
                    </p>
                  </details>
                </div>
              </div>

              {/* Self-Help */}
              <div className="bg-white rounded-lg border shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('sidebar.self_help.title')}
                </h3>

                <div className="space-y-3">
                  <a href="/about" className="block text-sm text-primary hover:underline">
                    {t('sidebar.self_help.how_it_works')}
                  </a>
                  <a href="/text-translate" className="block text-sm text-primary hover:underline">
                    {t('sidebar.self_help.try_text')}
                  </a>
                  <a href="/document-translate" className="block text-sm text-primary hover:underline">
                    {t('sidebar.self_help.try_docs')}
                  </a>
                  <a href="/privacy" className="block text-sm text-primary hover:underline">
                    {t('sidebar.self_help.privacy')}
                  </a>
                  <a href="/terms" className="block text-sm text-primary hover:underline">
                    {t('sidebar.self_help.terms')}
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
              {t('what_to_expect.title')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t('what_to_expect.quick_response.title')}</h3>
                <p className="text-gray-600">
                  {t('what_to_expect.quick_response.description')}
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t('what_to_expect.personal_support.title')}</h3>
                <p className="text-gray-600">
                  {t('what_to_expect.personal_support.description')}
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                  <HelpCircle className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t('what_to_expect.follow_up.title')}</h3>
                <p className="text-gray-600">
                  {t('what_to_expect.follow_up.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 