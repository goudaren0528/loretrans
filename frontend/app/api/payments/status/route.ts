import { NextRequest, NextResponse } from 'next/server';
import { withApiAuth, type NextRequestWithUser } from '@/lib/api-utils';
import { creem } from '@/lib/services/creem';
import { createServerSupabaseClient } from '@/lib/supabase-server';

async function checkPaymentStatus(req: NextRequestWithUser) {
  console.log(`[GET /api/payments/status] User ${req.userContext.user.id} checking payment status`);
  
  try {
    const { searchParams } = new URL(req.url);
    const checkoutId = searchParams.get('checkout_id');
    const orderId = searchParams.get('order_id');

    if (!checkoutId && !orderId) {
      return NextResponse.json(
        { error: 'checkout_id or order_id is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    const userId = req.userContext.user.id;

    // 查询数据库中的支付记录
    let query = supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId);

    if (checkoutId) {
      query = query.eq('creem_session_id', checkoutId);
    } else if (orderId) {
      query = query.eq('creem_payment_id', orderId);
    }

    const { data: payment, error } = await query.single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error querying payment:', error);
      return NextResponse.json(
        { error: 'Failed to query payment status' },
        { status: 500 }
      );
    }

    if (!payment) {
      return NextResponse.json({
        success: true,
        status: 'not_found',
        message: 'Payment record not found'
      });
    }

    // 如果支付已完成，直接返回状态
    if (payment.status === 'completed') {
      return NextResponse.json({
        success: true,
        status: 'completed',
        payment: {
          id: payment.id,
          amount: payment.amount,
          credits: payment.credits,
          status: payment.status,
          created_at: payment.created_at,
          completed_at: payment.completed_at
        }
      });
    }

    // 如果支付状态为pending，可以尝试从Creem查询最新状态
    // 注意：这需要Creem提供查询API，当前先返回数据库状态
    return NextResponse.json({
      success: true,
      status: payment.status,
      payment: {
        id: payment.id,
        amount: payment.amount,
        credits: payment.credits,
        status: payment.status,
        created_at: payment.created_at,
        completed_at: payment.completed_at
      }
    });

  } catch (error) {
    console.error('Error checking payment status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withApiAuth(checkPaymentStatus, ['free_user', 'pro_user', 'admin']);
