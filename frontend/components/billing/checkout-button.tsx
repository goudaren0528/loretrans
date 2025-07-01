'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useToastMessages } from '@/lib/hooks/use-toast-messages';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CheckoutButtonProps {
  planId: string;
  planName: string;
  price: number;
  credits: number;
  disabled?: boolean;
  className?: string;
}

export function CheckoutButton({ 
  planId, 
  planName, 
  price, 
  credits, 
  disabled = false,
  className = '' 
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const t = useTranslations('Checkout');
  const { showGenericError } = useToastMessages();

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`Starting checkout for plan: ${planId}`);
      
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (!data.url) {
        throw new Error('No checkout URL returned from server');
      }

      console.log(`Redirecting to checkout URL: ${data.url}`);
      
      // 重定向到Creem支付页面
      window.location.href = data.url;
      
    } catch (err: any) {
      console.error('Checkout error:', err);
      const errorMessage = err.message || 'Failed to start checkout process';
      setError(errorMessage);
      showGenericError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      <Button
        onClick={handleCheckout}
        disabled={disabled || isLoading}
        className={`w-full ${className}`}
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('processing', { defaultValue: 'Processing...' })}
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            {t('buyNow', { 
              defaultValue: 'Buy Now - ${price}',
              price: price.toFixed(2)
            })}
          </>
        )}
      </Button>
      
      <div className="text-xs text-center text-gray-500 dark:text-gray-400">
        {t('securePayment', { defaultValue: 'Secure payment powered by Creem' })}
      </div>
    </div>
  );
}
