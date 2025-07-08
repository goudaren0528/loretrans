import { SignInForm } from '@/components/auth/signin-form'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

type Props = {
  params: { locale: string }
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Auth.SignIn' })
  
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  }
}

export default function SignInPage() {
  return <SignInForm />
}
