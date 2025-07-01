'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { PRICING_PLANS } from '@/config/pricing.config';
import { 
  TestTube, 
  Play, 
  CheckCircle, 
  XCircle, 
  Loader2,
  AlertTriangle,
  Info
} from 'lucide-react';

export function PaymentTestTools() {
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [testResult, setTestResult] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    details?: any;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTestCheckout = async () => {
    if (!selectedPlan) {
      setTestResult({
        type: 'error',
        message: 'Please select a plan to test'
      });
      return;
    }

    setIsLoading(true);
    setTestResult(null);

    try {
      console.log(`Testing checkout for plan: ${selectedPlan}`);
      
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId: selectedPlan }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      setTestResult({
        type: 'success',
        message: 'Checkout session created successfully!',
        details: {
          url: data.url,
          checkout_id: data.checkout_id,
          plan: selectedPlan
        }
      });

    } catch (error: any) {
      console.error('Test checkout error:', error);
      setTestResult({
        type: 'error',
        message: error.message || 'Failed to create checkout session',
        details: error
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestReturnUrl = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      // 模拟Return URL参数
      const mockParams = new URLSearchParams({
        checkout_id: 'cs_test_mock_' + Date.now(),
        order_id: 'ord_test_mock_' + Date.now(),
        customer_id: 'cust_test_mock',
        product_id: selectedPlan ? PRICING_PLANS.find(p => p.id === selectedPlan)?.creemPriceId || 'prod_test' : 'prod_test',
        signature: 'mock_signature_for_testing',
        plan: selectedPlan || 'starter'
      });

      const response = await fetch(`/api/payment/success?${mockParams.toString()}`);
      
      if (response.redirected) {
        setTestResult({
          type: 'success',
          message: 'Return URL processing successful!',
          details: {
            redirected_to: response.url,
            status: response.status
          }
        });
      } else {
        const data = await response.json();
        if (response.ok) {
          setTestResult({
            type: 'success',
            message: 'Return URL processed successfully',
            details: data
          });
        } else {
          throw new Error(data.error || 'Return URL processing failed');
        }
      }

    } catch (error: any) {
      console.error('Test return URL error:', error);
      setTestResult({
        type: 'error',
        message: error.message || 'Failed to process return URL',
        details: error
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestPaymentHistory = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/payments/history');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      setTestResult({
        type: 'success',
        message: `Payment history retrieved successfully! Found ${data.payments?.length || 0} payments.`,
        details: data
      });

    } catch (error: any) {
      console.error('Test payment history error:', error);
      setTestResult({
        type: 'error',
        message: error.message || 'Failed to fetch payment history',
        details: error
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 只在开发环境显示
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="border-dashed border-2 border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
          <TestTube className="h-5 w-5" />
          Payment Testing Tools
          <Badge variant="outline" className="text-xs">
            DEV ONLY
          </Badge>
        </CardTitle>
        <CardDescription className="text-yellow-700 dark:text-yellow-300">
          Test payment functionality in development environment
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Plan Selection */}
        <div className="space-y-2">
          <Label htmlFor="test-plan">Select Plan for Testing</Label>
          <Select value={selectedPlan} onValueChange={setSelectedPlan}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a pricing plan" />
            </SelectTrigger>
            <SelectContent>
              {PRICING_PLANS.map((plan) => (
                <SelectItem key={plan.id} value={plan.id}>
                  {plan.name} - ${plan.priceUSD} ({plan.credits} credits)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Test Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={handleTestCheckout}
            disabled={isLoading || !selectedPlan}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Test Checkout
          </Button>

          <Button
            onClick={handleTestReturnUrl}
            disabled={isLoading}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Test Return URL
          </Button>

          <Button
            onClick={handleTestPaymentHistory}
            disabled={isLoading}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Info className="h-4 w-4" />
            )}
            Test History API
          </Button>
        </div>

        {/* Test Results */}
        {testResult && (
          <Alert variant={testResult.type === 'error' ? 'destructive' : 'default'}>
            <div className="flex items-center gap-2">
              {testResult.type === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
              {testResult.type === 'error' && <XCircle className="h-4 w-4 text-red-600" />}
              {testResult.type === 'info' && <Info className="h-4 w-4 text-blue-600" />}
              <AlertDescription>
                <div className="font-medium mb-2">{testResult.message}</div>
                {testResult.details && (
                  <details className="text-xs">
                    <summary className="cursor-pointer">View Details</summary>
                    <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
                      {JSON.stringify(testResult.details, null, 2)}
                    </pre>
                  </details>
                )}
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Instructions */}
        <div className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
          <p><strong>Test Checkout:</strong> Creates a checkout session and returns the payment URL</p>
          <p><strong>Test Return URL:</strong> Simulates a successful payment return from Creem</p>
          <p><strong>Test History API:</strong> Fetches payment history for the current user</p>
        </div>
      </CardContent>
    </Card>
  );
}
