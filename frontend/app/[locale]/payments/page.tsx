import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PaymentHistory } from '@/components/billing/payment-history';
import { PricingTable } from '@/components/billing/pricing-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, History, ShoppingCart } from 'lucide-react';

interface PaymentsPageProps {
  params: { locale: string };
}

export async function generateMetadata({ params }: PaymentsPageProps): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'PaymentsPage' });
  
  return {
    title: t('title', { defaultValue: 'Payments & Billing' }),
    description: t('description', { defaultValue: 'Manage your payments, view purchase history, and buy more credits' }),
  };
}

export default async function PaymentsPage({ params }: PaymentsPageProps) {
  const t = await getTranslations({ locale: params.locale, namespace: 'PaymentsPage' });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {t('title', { defaultValue: 'Payments & Billing' })}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {t('subtitle', { defaultValue: 'Manage your credits, view purchase history, and upgrade your plan' })}
        </p>
      </div>

      <Tabs defaultValue="purchase" className="space-y-8">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="purchase" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            {t('buyCredits', { defaultValue: 'Buy Credits' })}
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            {t('paymentHistory', { defaultValue: 'Payment History' })}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="purchase" className="space-y-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {t('purchaseTitle', { defaultValue: 'Purchase Translation Credits' })}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('purchaseDescription', { defaultValue: 'Choose the perfect credit package for your translation needs' })}
            </p>
          </div>
          
          <PricingTable />
        </TabsContent>

        <TabsContent value="history" className="space-y-8">
          <PaymentHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
