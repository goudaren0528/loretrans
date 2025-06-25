import { NextResponse } from 'next/server';
import { withApiAuth, type NextRequestWithUser } from '@/lib/api-utils';
import { creemServer } from '@/lib/services/creem';
import { PRICING_PLANS } from '@/config/pricing.config';
import { createServerSupabaseClient } from '@/lib/supabase-server';

async function createCheckoutSession(req: NextRequestWithUser) {
  console.log(`[POST /api/checkout] user ${req.userContext.user.id} is creating a checkout session.`);
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.warn('Checkout attempt by unauthenticated user.');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId } = await req.json();
    const plan = PRICING_PLANS.find(p => p.id === planId);

    if (!plan) {
      console.error(`Checkout attempt for invalid planId: ${planId} by user ${user.id}.`);
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }
    
    console.log(`User ${user.id} is creating a checkout session for plan: ${plan.name} (${planId}).`);

    const origin = req.nextUrl.origin;
    const success_url = `${origin}/dashboard?purchase=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancel_url = `${origin}/pricing?purchase=canceled`;

    const session = await creemServer.checkout.sessions.create({
      customer_email: user.email,
      line_items: [
        {
          price: plan.creemPriceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url,
      cancel_url,
      metadata: {
        userId: user.id,
        planId: plan.id,
      },
    });

    console.log(`Successfully created checkout session ${session.id} for user ${user.id}.`);
    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export const POST = withApiAuth(createCheckoutSession, ['free_user', 'pro_user', 'admin']); 