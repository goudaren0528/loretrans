'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToastMessages } from './use-toast-messages';

export interface PaymentState {
  isLoading: boolean;
  error: string | null;
  checkoutUrl: string | null;
}

export interface PaymentHookReturn {
  paymentState: PaymentState;
  startCheckout: (planId: string) => Promise<void>;
  clearError: () => void;
  resetState: () => void;
}

export function usePayment(): PaymentHookReturn {
  const [paymentState, setPaymentState] = useState<PaymentState>({
    isLoading: false,
    error: null,
    checkoutUrl: null,
  });

  const router = useRouter();
  const { showGenericError } = useToastMessages();

  const startCheckout = useCallback(async (planId: string) => {
    setPaymentState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      console.log(`[usePayment] Starting checkout for plan: ${planId}`);
      
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

      console.log(`[usePayment] Checkout URL received: ${data.url}`);
      
      setPaymentState(prev => ({
        ...prev,
        checkoutUrl: data.url,
        isLoading: false,
      }));

      // 重定向到Creem支付页面
      window.location.href = data.url;
      
    } catch (err: any) {
      console.error('[usePayment] Checkout error:', err);
      const errorMessage = err.message || 'Failed to start checkout process';
      
      setPaymentState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));

      showGenericError(errorMessage);
    }
  }, [showGenericError]);

  const clearError = useCallback(() => {
    setPaymentState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  const resetState = useCallback(() => {
    setPaymentState({
      isLoading: false,
      error: null,
      checkoutUrl: null,
    });
  }, []);

  return {
    paymentState,
    startCheckout,
    clearError,
    resetState,
  };
}
