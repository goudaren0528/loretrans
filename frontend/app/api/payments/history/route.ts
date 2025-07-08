import { NextResponse } from 'next/server';
import { withApiAuth, type NextRequestWithUser } from '@/lib/api-utils';
import { createServerSupabaseClient } from '@/lib/supabase-server';

async function getPaymentHistory(req: NextRequestWithUser) {
  console.log(`[GET /api/payments/history] User ${req.userContext.user.id} requesting payment history`);
  
  try {
    const supabase = createServerSupabaseClient();
    const userId = req.userContext.user.id;

    // 获取用户的支付记录
    const { data: payments, error } = await supabase
      .from('payments')
      .select(`
        id,
        amount,
        credits,
        status,
        created_at,
        completed_at,
        creem_payment_id,
        metadata
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching payment history:', error);
      return NextResponse.json(
        { error: 'Failed to fetch payment history' },
        { status: 500 }
      );
    }

    // 格式化支付记录
    const formattedPayments = payments?.map(payment => ({
      id: payment.id,
      amount: payment.amount,
      credits: payment.credits,
      status: payment.status,
      created_at: payment.created_at,
      completed_at: payment.completed_at,
      creem_order_id: payment.creem_payment_id,
      plan_name: payment.metadata?.plan_name || null,
    })) || [];

    console.log(`Successfully fetched ${formattedPayments.length} payment records for user ${userId}`);

    return NextResponse.json({
      success: true,
      payments: formattedPayments,
      total: formattedPayments.length
    });

  } catch (error) {
    console.error('Error in payment history API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withApiAuth(getPaymentHistory, ['free_user', 'pro_user', 'admin']);
