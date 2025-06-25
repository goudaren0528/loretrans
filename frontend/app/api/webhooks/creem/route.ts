import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { creemServer } from '@/lib/services/creem';
import { APP_CONFIG } from '@/config/app.config';
import { PRICING_PLANS } from '@/config/pricing.config';
import { createServiceRoleClient } from '@/lib/supabase-server';

const secret = process.env.CREEM_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  console.log('[POST /api/webhooks/creem] Received a request to the Creem webhook endpoint.');
  const body = await req.text();
  const signature = headers().get('Creem-Signature') as string;

  let event: any;

  try {
    event = creemServer.webhooks.constructEvent(
      body,
      signature,
      APP_CONFIG.creem.webhookSecret!
    );
  } catch (err: any) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Webhook signature verification failed: ${errorMessage}`);
    return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log(`Processing 'checkout.session.completed' for session ${session.id}`);
      const { userId, planId } = session.metadata;

      if (!userId || !planId) {
        return NextResponse.json({ error: 'Webhook Error: Missing metadata in session.' }, { status: 400 });
      }

      const plan = PRICING_PLANS.find(p => p.id === planId);
      if (!plan) {
        return NextResponse.json({ error: `Webhook Error: Plan with id ${planId} not found.` }, { status: 404 });
      }
      
      const supabase = createServiceRoleClient();
      const { error } = await supabase.rpc('add_credits_on_purchase', {
        p_user_id: userId,
        p_credits_to_add: plan.credits,
        p_amount_paid_usd: plan.priceUSD,
        p_creem_charge_id: session.id, // Using session id as a mock charge id
        p_payment_metadata: session, // Pass the whole session object for encryption
      });

      if (error) {
        console.error('Failed to update user credits:', error);
        return NextResponse.json({ error: 'Database error while updating credits.' }, { status: 500 });
      }
      
      console.log(`Successfully added ${plan.credits} credits to user ${userId}.`);
      break;
    
    case 'charge.dispute.created':
      const dispute = event.data.object;
      // CRITICAL: A chargeback has been filed. Manual investigation is required immediately.
      console.error(
        `CRITICAL: Dispute created for charge: ${dispute.charge}. Amount: ${dispute.amount} ${dispute.currency}. Reason: ${dispute.reason}. Please investigate immediately in the Creem dashboard.`
      );
      // TODO: Implement logic to temporarily lock the user's account or flag for review.
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}. Event ID: ${event.id}`);
  }

  return NextResponse.json({ received: true });
} 