'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, CreditCard, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export function PaymentSuccess() {
  const searchParams = useSearchParams();
  const t = useTranslations('PaymentSuccess');
  const [paymentDetails, setPaymentDetails] = useState<{
    plan?: string;
    credits?: string;
    amount?: string;
  }>({});

  useEffect(() => {
    const plan = searchParams.get('plan');
    const credits = searchParams.get('credits');
    const amount = searchParams.get('amount');

    setPaymentDetails({
      plan: plan || undefined,
      credits: credits || undefined,
      amount: amount || undefined
    });
  }, [searchParams]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card className="text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600 dark:text-green-400">
            {t('title', { defaultValue: 'Payment Successful!' })}
          </CardTitle>
          <CardDescription className="text-lg">
            {t('subtitle', { defaultValue: 'Thank you for your purchase. Your credits have been added to your account.' })}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Payment Details */}
          {paymentDetails.credits && (
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Gift className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-lg">
                  {paymentDetails.credits} {t('creditsAdded', { defaultValue: 'Credits Added' })}
                </span>
              </div>
              {paymentDetails.plan && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('planPurchased', { defaultValue: 'Plan' })}: {paymentDetails.plan}
                </p>
              )}
            </div>
          )}

          {/* What's Next */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              {t('whatsNext', { defaultValue: "What's Next?" })}
            </h3>
            <div className="grid gap-3 text-sm">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold text-xs">1</span>
                </div>
                <p className="text-left">
                  {t('step1', { defaultValue: 'Start translating text and documents with your new credits' })}
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold text-xs">2</span>
                </div>
                <p className="text-left">
                  {t('step2', { defaultValue: 'Check your credit balance and usage history in your dashboard' })}
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold text-xs">3</span>
                </div>
                <p className="text-left">
                  {t('step3', { defaultValue: 'Explore advanced features like document translation and TTS' })}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button asChild className="flex-1">
              <Link href="/text-translate">
                <CreditCard className="mr-2 h-4 w-4" />
                {t('startTranslating', { defaultValue: 'Start Translating' })}
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/dashboard">
                {t('viewDashboard', { defaultValue: 'View Dashboard' })}
              </Link>
            </Button>
          </div>

          {/* Support */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('needHelp', { defaultValue: 'Need help?' })}{' '}
              <Link href="/support" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
                {t('contactSupport', { defaultValue: 'Contact our support team' })}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
