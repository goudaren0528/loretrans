'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from 'next-intl';
import { 
  CreditCard, 
  Download, 
  Calendar, 
  DollarSign, 
  Package,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

interface PaymentRecord {
  id: string;
  amount: number;
  credits: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  created_at: string;
  completed_at?: string;
  plan_name?: string;
  creem_order_id?: string;
}

export function PaymentHistory() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('PaymentHistory');

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/payments/history');
      if (!response.ok) {
        throw new Error('Failed to fetch payment history');
      }

      const data = await response.json();
      setPayments(data.payments || []);
    } catch (err: any) {
      console.error('Error fetching payment history:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: PaymentRecord['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'refunded':
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: PaymentRecord['status']) => {
    const variants = {
      completed: 'default',
      pending: 'secondary',
      failed: 'destructive',
      refunded: 'outline'
    } as const;

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {t(`status.${status}`, { defaultValue: status })}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {t('title', { defaultValue: 'Payment History' })}
          </CardTitle>
          <CardDescription>
            {t('description', { defaultValue: 'View your recent purchases and transactions' })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {t('title', { defaultValue: 'Payment History' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchPaymentHistory} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('retry', { defaultValue: 'Try Again' })}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          {t('title', { defaultValue: 'Payment History' })}
        </CardTitle>
        <CardDescription>
          {t('description', { defaultValue: 'View your recent purchases and transactions' })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              {t('noPayments', { defaultValue: 'No payments found' })}
            </p>
            <p className="text-sm text-gray-500">
              {t('noPaymentsDescription', { defaultValue: 'Your purchase history will appear here' })}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {getStatusIcon(payment.status)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">
                        {payment.plan_name || `${payment.credits} Credits`}
                      </p>
                      {getStatusBadge(payment.status)}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(payment.created_at), 'MMM dd, yyyy')}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        ${payment.amount.toFixed(2)}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {payment.credits} credits
                      </div>
                    </div>
                  </div>
                </div>

                {payment.status === 'completed' && payment.creem_order_id && (
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    {t('receipt', { defaultValue: 'Receipt' })}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
