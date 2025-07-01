'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, CreditCard, ArrowLeft } from 'lucide-react';

export default function MockPaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const checkoutId = searchParams.get('checkout_id');
  const productId = searchParams.get('product_id');
  const customerEmail = searchParams.get('customer_email');
  const successUrl = searchParams.get('success_url');
  const cancelUrl = searchParams.get('cancel_url');

  const handlePaymentSuccess = async () => {
    setIsProcessing(true);
    
    // 模拟支付处理时间
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (successUrl) {
      window.location.href = successUrl;
    } else {
      router.push('/pricing?payment=success');
    }
  };

  const handlePaymentCancel = () => {
    if (cancelUrl) {
      window.location.href = cancelUrl;
    } else {
      router.push('/pricing?payment=canceled');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
            <CreditCard className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Mock Payment Page</CardTitle>
          <CardDescription>
            This is a test payment page for development
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* 支付信息 */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Checkout ID:</span>
              <span className="font-mono text-xs">{checkoutId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Product ID:</span>
              <span className="font-mono text-xs">{productId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Customer:</span>
              <span className="text-xs">{customerEmail}</span>
            </div>
          </div>

          {/* 模拟支付按钮 */}
          <div className="space-y-3">
            <Button
              onClick={handlePaymentSuccess}
              disabled={isProcessing}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Simulate Successful Payment
                </>
              )}
            </Button>

            <Button
              onClick={handlePaymentCancel}
              disabled={isProcessing}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel Payment
            </Button>

            <Button
              onClick={() => router.push('/pricing')}
              disabled={isProcessing}
              variant="ghost"
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Pricing
            </Button>
          </div>

          {/* 说明文字 */}
          <div className="text-xs text-center text-gray-500 space-y-1">
            <p>🧪 This is a development/test environment</p>
            <p>No real payment will be processed</p>
            <p>Click "Simulate Successful Payment" to test the flow</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
