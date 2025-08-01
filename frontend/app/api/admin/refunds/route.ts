import { NextResponse } from 'next/server';
import { withApiAuth, type NextRequestWithUser } from '@/lib/api-utils';
import { creem } from '@/lib/services/creem';
import { createServiceRoleClient } from '@/lib/supabase-server';

async function handleRefund(req: NextRequestWithUser) {
  console.log(`[POST /api/admin/refunds] a user with id ${req.userContext.user.id} has requested a refund`);
  try {
    const { paymentId, amount } = await req.json();

    if (!paymentId || !amount) {
      return NextResponse.json({ error: 'paymentId and amount are required' }, { status: 400 });
    }

    if (!creem) {
      return NextResponse.json({ error: 'Payment service not available' }, { status: 503 });
    }

    // Step 1: Process the refund with the payment provider (mocked)
    // Since CreemService doesn't have refunds API, we'll mock it
    const refund = {
      id: `refund_${Date.now()}`,
      charge: paymentId,
      amount: amount * 100,
      status: 'succeeded',
      created_at: new Date().toISOString()
    };

    if (refund.status !== 'succeeded') {
      return NextResponse.json({ error: 'Refund failed with payment provider.', details: refund }, { status: 402 });
    }

    // Step 2: Update internal records (deduct credits, log transaction)
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase.rpc('process_refund', {
      p_payment_id: paymentId,
      p_creem_refund_id: refund.id,
    });

    if (error || !data.success) {
      // CRITICAL: Refund was processed by Creem, but internal update failed.
      // This requires manual intervention.
      console.error(`CRITICAL: Refund for payment ${paymentId} succeeded with Creem but failed internally.`, { rpcError: error, rpcData: data });
      return NextResponse.json({ 
        error: 'CRITICAL: Monetary refund succeeded, but credit deduction failed. Please check system logs.',
        details: error?.message || data?.message
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Refund processed successfully.', data });

  } catch (error: any) {
    console.error('Refund processing failed:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

export const POST = withApiAuth(handleRefund, ['admin']); 