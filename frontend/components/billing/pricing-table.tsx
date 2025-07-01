'use client';

import { useState } from 'react';
import { PRICING_PLANS } from '@/config/pricing.config';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTranslations } from 'next-intl';
import { Check, Star, Zap, Shield, Clock } from 'lucide-react';
import { CheckoutButton } from './checkout-button';

export function PricingTable() {
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('PricingPage');

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
        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-2xl p-8 border border-blue-100 dark:border-blue-800">
          <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
            {t('howCreditsWork', { defaultValue: 'How Credits Work' })}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 text-sm">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-blue-900 dark:text-blue-100">
                  {t('freeTranslation', { defaultValue: 'Free Translation' })}
                </div>
                <div className="text-blue-700 dark:text-blue-300">
                  {t('freeDescription', { defaultValue: 'Up to 500 characters - completely free' })}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-blue-900 dark:text-blue-100">
                  {t('creditBilling', { defaultValue: 'Credit Billing' })}
                </div>
                <div className="text-blue-700 dark:text-blue-300">
                  {t('creditDescription', { defaultValue: '0.1 credits per character over 500' })}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-blue-900 dark:text-blue-100">
                  {t('noExpiry', { defaultValue: 'No Expiry' })}
                </div>
                <div className="text-blue-700 dark:text-blue-300">
                  {t('noExpiryDescription', { defaultValue: 'Credits never expire' })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主要定价套餐 */}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t('chooseYourPlan', { defaultValue: 'Choose Your Plan' })}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t('planDescription', { defaultValue: 'Select the perfect credit package for your translation needs' })}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {mainPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 p-8 shadow-lg transition-all hover:shadow-xl ${
                plan.popular
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 scale-105'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {t('mostPopular', { defaultValue: 'Most Popular' })}
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {plan.description}
                </p>
                
                <div className="mb-4">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                      ${plan.priceUSD}
                    </span>
                  </div>
                  
                  {plan.discount && plan.originalValue && (
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <span className="text-sm text-gray-500 line-through">
                        ${plan.originalValue.toFixed(2)}
                      </span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        {plan.discount}% {t('off', { defaultValue: 'off' })}
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-6">
                  {plan.credits.toLocaleString()} {t('credits', { defaultValue: 'Credits' })}
                </div>
              </div>

              <CheckoutButton
                planId={plan.id}
                planName={plan.name}
                price={plan.priceUSD}
                credits={plan.credits}
                className={plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}
              />

              {/* 功能列表 */}
              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t('allLanguages', { defaultValue: 'All supported languages' })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t('documentTranslation', { defaultValue: 'Document translation' })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t('prioritySupport', { defaultValue: 'Priority support' })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t('noExpiry', { defaultValue: 'Credits never expire' })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 更多套餐 */}
      {PRICING_PLANS.length > 3 && (
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t('morePlans', { defaultValue: 'More Plans Available' })}
            </h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {PRICING_PLANS.slice(3).map((plan) => (
              <div
                key={plan.id}
                className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-800"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {plan.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {plan.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      ${plan.priceUSD}
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">
                      {plan.credits.toLocaleString()} credits
                    </div>
                  </div>
                </div>
                
                <CheckoutButton
                  planId={plan.id}
                  planName={plan.name}
                  price={plan.priceUSD}
                  credits={plan.credits}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ或其他信息 */}
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t('needHelp', { defaultValue: 'Need Help Choosing?' })}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('helpDescription', { defaultValue: 'Not sure which plan is right for you? Contact our support team for personalized recommendations.' })}
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {t('securePayment', { defaultValue: 'All payments are processed securely through Creem' })}
          </div>
        </div>
      </div>
    </div>
  );
}

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 text-sm">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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