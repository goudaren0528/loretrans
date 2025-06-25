'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PRICING_PLANS } from '@/config/pricing.config';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function PricingTable() {
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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

  return (
    <div className="space-y-8">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PRICING_PLANS.map((plan) => (
          <div key={plan.id} className="border rounded-lg p-6 flex flex-col">
            <h3 className="text-2xl font-bold">{plan.name}</h3>
            <p className="text-muted-foreground mt-2">{plan.description}</p>
            <div className="mt-6">
              <span className="text-4xl font-extrabold">${plan.priceUSD}</span>
              <span className="text-lg text-muted-foreground"> / {plan.credits.toLocaleString()} credits</span>
            </div>
            {plan.discount && (
              <p className="mt-2 text-sm font-semibold text-green-600">{plan.discount}</p>
            )}
            <Button
              onClick={() => handleCheckout(plan.id)}
              disabled={loadingPlanId === plan.id}
              className="mt-8 w-full"
            >
              {loadingPlanId === plan.id ? 'Processing...' : 'Purchase'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
} 