'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Coins, ArrowRight, Home } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const plan = searchParams.get('plan');
  const credits = searchParams.get('credits');
  const purchase = searchParams.get('purchase');

  useEffect(() => {
    // 支付成功后刷新用户数据
    if (purchase === 'success') {
      setIsRefreshing(true);
      refreshUser().finally(() => {
        setIsRefreshing(false);
      });
    }
  }, [purchase, refreshUser]);

  const handleContinue = () => {
    router.push('/dashboard');
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  if (purchase !== 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-600">Payment Failed</CardTitle>
            <CardDescription>
              There was an issue processing your payment
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Please try again or contact support if the problem persists.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => router.push('/pricing')} variant="outline">
                Try Again
              </Button>
              <Button onClick={handleBackToHome}>
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
          <CardDescription>
            Your credits have been added to your account
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* 购买详情 */}
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Plan Purchased:</span>
              <span className="font-semibold capitalize">{plan || 'Basic'} Pack</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Credits Added:</span>
              <div className="flex items-center gap-1">
                <Coins className="h-4 w-4 text-yellow-500" />
                <span className="font-semibold text-green-600">
                  +{credits || '5,000'} Credits
                </span>
              </div>
            </div>
          </div>

          {/* 刷新状态 */}
          {isRefreshing && (
            <div className="text-center py-2">
              <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
                Updating your account...
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="space-y-3">
            <Button
              onClick={handleContinue}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              Continue to Dashboard
            </Button>

            <Button
              onClick={handleBackToHome}
              variant="outline"
              className="w-full"
            >
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>

          {/* 说明文字 */}
          <div className="text-xs text-center text-gray-500 space-y-1">
            <p>🎉 Thank you for your purchase!</p>
            <p>Your credits are now available for translation services</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
