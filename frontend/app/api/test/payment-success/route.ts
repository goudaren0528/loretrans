import { NextRequest, NextResponse } from 'next/server';
import { PRICING_PLANS } from '@/config/pricing.config';
import { createServiceRoleClient } from '@/lib/supabase-server';

// 仅在开发环境可用的测试API
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  console.log('[POST /api/test/payment-success] Manual payment success test');
  
  try {
    const { userId, planId } = await request.json();
    
    if (!userId || !planId) {
      return NextResponse.json({ error: 'userId and planId are required' }, { status: 400 });
    }

    // 查找对应的定价计划
    const pricingPlan = PRICING_PLANS.find(p => p.id === planId);
    if (!pricingPlan) {
      console.error('Unknown pricing plan:', planId);
      return NextResponse.json({ error: 'Unknown pricing plan' }, { status: 400 });
    }

    console.log(`Manual test: Adding ${pricingPlan.credits} credits to user ${userId} for plan ${planId}`);

    // 使用Supabase服务角色客户端处理积分充值
    const supabase = createServiceRoleClient();
    const { error } = await supabase.rpc('add_credits_on_purchase', {
      p_user_id: userId,
      p_credits_to_add: pricingPlan.credits,
      p_amount_paid_usd: pricingPlan.priceUSD,
      p_creem_charge_id: `test_${Date.now()}`, // 修复：使用正确的参数名
      p_payment_metadata: {
        test_payment: true,
        plan_id: planId,
        plan_name: pricingPlan.name,
        timestamp: new Date().toISOString()
      }
    });

    if (error) {
      console.error('Failed to add credits in test:', error);
      return NextResponse.json({ error: 'Failed to process test payment', details: error }, { status: 500 });
    }

    console.log(`Successfully added ${pricingPlan.credits} credits to user ${userId} (test)`);
    
    return NextResponse.json({ 
      success: true,
      message: `Added ${pricingPlan.credits} credits to user ${userId}`,
      plan: pricingPlan.name,
      credits_added: pricingPlan.credits
    });

  } catch (error) {
    console.error('Error in test payment success:', error);
    return NextResponse.json({ error: 'Test payment processing failed' }, { status: 500 });
  }
}

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  return NextResponse.json({ 
    message: 'Test payment success endpoint',
    usage: 'POST with { userId, planId }',
    example: {
      userId: '5f36d348-7553-4d70-9003-4994c6b23428',
      planId: 'basic'
    }
  });
}
