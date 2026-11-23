import { NextRequest, NextResponse } from 'next/server';
import { Environment, Paddle } from '@paddle/paddle-node-sdk';
import { supabaseAdmin } from '@/lib/supabase';

const paddle = new Paddle(process.env.PADDLE_API_KEY!, {
  environment:
    process.env.NEXT_PUBLIC_PADDLE_ENV === 'production'
      ? Environment.production
      : Environment.sandbox,
});

function generateAccessToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'NMR-';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get('paddle-signature') || '';
  const rawBody = await req.text();
  const secretKey =
    process.env.PADDLE_WEBHOOK_SECRET ||
    process.env.PADDLE_NOTIFICATION_WEBHOOK_SECRET;

  if (!secretKey) {
    console.error('Missing Paddle webhook secret env var');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  try {
    const eventData = await paddle.webhooks.unmarshal(rawBody, secretKey, signature);

    if (eventData.eventType === 'transaction.completed') {
      const tx = eventData.data;
      const customData = (tx.customData as Record<string, string>) || {};
      const firstPriceId = tx.items?.[0]?.price?.id;

      const isPro =
        customData.planId === 'pro' ||
        customData.planType === 'pro_pass' ||
        (!!process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID &&
          firstPriceId === process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID);

      const planId = isPro ? 'pro' : 'single';
      const creditsToGrant = isPro ? 12 : 4;
      const planLabel = isPro
        ? 'Premium Pass (12 Credits)'
        : 'Standard Pass (4 Credits)';

      await supabaseAdmin.from('unlocked_reports').upsert(
        {
          paddle_transaction_id: tx.id,
          customer_email: tx.customerId || 'customer@numora.io',
          e164_number: customData.searchedNumber || 'ALL',
          plan_type: customData.planType || (isPro ? 'pro_pass' : 'single_report'),
        },
        { onConflict: 'paddle_transaction_id' }
      );

      const { data: existingTx } = await supabaseAdmin
        .from('access_tokens')
        .select('access_token, credits_remaining')
        .eq('transaction_id', tx.id)
        .maybeSingle();

      if (!existingTx) {
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        const accessToken = customData.accessToken || generateAccessToken();

        const { data: existingTokenRow } = await supabaseAdmin
          .from('access_tokens')
          .select('credits_remaining')
          .eq('access_token', accessToken)
          .maybeSingle();

        if (existingTokenRow) {
          await supabaseAdmin
            .from('access_tokens')
            .update({
              credits_remaining: (existingTokenRow.credits_remaining || 0) + creditsToGrant,
              plan_id: planId,
              plan_label: planLabel,
              transaction_id: tx.id,
              expires_at: expiresAt,
            })
            .eq('access_token', accessToken);
        } else {
          await supabaseAdmin.from('access_tokens').insert({
            access_token: accessToken,
            transaction_id: tx.id,
            plan_id: planId,
            plan_label: planLabel,
            credits_remaining: creditsToGrant,
            unlocked_numbers: [],
            expires_at: expiresAt,
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error('Paddle webhook verification failed:', e);
    return NextResponse.json({ error: 'Invalid Paddle webhook signature' }, { status: 400 });
  }
}
