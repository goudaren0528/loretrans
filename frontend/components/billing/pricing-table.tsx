'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PRICING_PLANS } from '@/config/pricing.config';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTranslations } from 'next-intl';
import { Check, Star, Zap, Shield, Clock } from 'lucide-react';

export function PricingTable() {
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const t = useTranslations('PricingPage');

  const handleCheckout = async (planId: string) => {
    setLoadingPlanId(planId);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error || 'Failed to create checkout session.');
      }

      const { url } = await response.json();
      if (url) {
        router.push(url);
      } else {
        throw new Error('No checkout URL returned.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingPlanId(null);
    }
  };

  // 显示前3个主要套餐
  const mainPlans = PRICING_PLANS.slice(0, 3);

  return (
    <div className="space-y-16">
      {error && (
        <Alert variant="destructive" className="max-w-4xl mx-auto">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* 积分计费说明 */}
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100">
          <h3 className="text-xl font-semibold text-blue-900 mb-4">How Credits Work</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-blue-900">Free Translation</div>
                <div className="text-blue-700">Up to 500 characters - completely free</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-blue-900">Credit Billing</div>
                <div className="text-blue-700">0.1 credits per character over 500</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-blue-900">Never Expire</div>
                <div className="text-blue-700">Your credits never expire</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主要定价卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {mainPlans.map((plan, index) => {
          const isPopular = plan.popular;
          return (
            <div 
              key={plan.id} 
              className={`relative rounded-2xl border bg-white shadow-sm transition-all hover:shadow-lg flex flex-col ${
                isPopular 
                  ? 'border-primary ring-2 ring-primary ring-opacity-20 scale-105' 
                  : 'border-gray-200'
              }`}
            >
              {isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center gap-1 bg-primary text-white px-4 py-2 rounded-full text-sm font-medium">
                    <Star className="h-4 w-4" />
                    Most Popular
                  </div>
                </div>
              )}
              
              {/* 卡片内容 */}
              <div className="p-8 flex-1 flex flex-col">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {plan.name}
                  </h3>
                  <p className="mt-2 text-gray-600">
                    {plan.description}
                  </p>
                  
                  <div className="mt-6">
                    <div className="flex items-baseline justify-center">
                      <span className="text-5xl font-extrabold text-gray-900">
                        ${plan.priceUSD}
                      </span>
                    </div>
                    <p className="mt-2 text-lg text-gray-600">
                      {plan.credits.toLocaleString()} credits
                    </p>
                    <p className="text-sm text-gray-500">
                      ${(plan.priceUSD / plan.credits * 1000).toFixed(2)} per 1K credits
                    </p>
                  </div>
                  
                  {(plan.discount ?? 0) > 0 && (
                    <div className="mt-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        Save {plan.discount ?? 0}%
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        Regular price: ${plan.originalValue?.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>

                {/* 功能列表 */}
                <div className="mt-8 flex-1">
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Unlimited text translations</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Document translation support</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Text-to-speech functionality</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Credits never expire</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Priority support</span>
                    </li>
                  </ul>
                </div>

                {/* 按钮 - 固定在底部 */}
                <div className="mt-8">
                  <Button
                    onClick={() => handleCheckout(plan.id)}
                    disabled={loadingPlanId === plan.id}
                    className={`w-full py-3 ${
                      isPopular 
                        ? 'bg-primary hover:bg-primary/90' 
                        : 'bg-gray-900 hover:bg-gray-800'
                    }`}
                    size="lg"
                  >
                    {loadingPlanId === plan.id 
                      ? t('buttons.processing') 
                      : t('buttons.purchase')
                    }
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 更多套餐选项 */}
      {PRICING_PLANS.length > 3 && (
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Need More Credits?
            </h3>
            <p className="text-gray-600">
              Higher volume packages for professionals and businesses
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PRICING_PLANS.slice(3).map((plan) => (
              <div 
                key={plan.id} 
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">{plan.name}</h4>
                    <p className="text-gray-600 text-sm mt-1">{plan.description}</p>
                    <div className="mt-3">
                      <span className="text-2xl font-bold text-gray-900">${plan.priceUSD}</span>
                      <span className="text-gray-600 ml-2">/ {plan.credits.toLocaleString()} credits</span>
                      {(plan.discount ?? 0) > 0 && (
                        <span className="ml-2 text-sm text-green-600 font-medium">
                          Save {plan.discount ?? 0}%
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleCheckout(plan.id)}
                    disabled={loadingPlanId === plan.id}
                    variant="outline"
                  >
                    {loadingPlanId === plan.id ? 'Processing...' : 'Purchase'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="text-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-2xl p-8 max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          {t('cta.title')}
        </h3>
        <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
          {t('cta.description')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => router.push('/text-translate')}
          >
            {t('cta.free_trial')}
          </Button>
          <Button 
            size="lg"
            onClick={() => router.push('/contact')}
          >
            {t('cta.contact_sales')}
          </Button>
        </div>
      </div>
    </div>
  );
} 