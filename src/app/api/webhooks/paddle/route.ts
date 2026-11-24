import { NextRequest, NextResponse } from 'next/server';
import { Environment, Paddle } from '@paddle/paddle-node-sdk';
import { supabaseAdmin } from '@/lib/supabase';
import { deliverAccessTokenEmail } from '@/lib/sendTokenEmail';

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

  let eventData;
  try {
    eventData = await paddle.webhooks.unmarshal(rawBody, secretKey, signature);
  } catch (e) {
    console.error('Paddle webhook verification failed:', e);
    return NextResponse.json({ error: 'Invalid Paddle webhook signature' }, { status: 400 });
  }

  try {
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

      const { error: reportErr } = await supabaseAdmin
        .from('unlocked_reports')
        .upsert(
          {
            paddle_transaction_id: tx.id,
            e164_number: customData.searchedNumber || null,
          },
          { onConflict: 'paddle_transaction_id' }
        );

      if (reportErr) {
        console.error('unlocked_reports upsert error:', reportErr);
        return NextResponse.json({ error: 'Failed to record report', details: reportErr.message }, { status: 500 });
      }

      const { data: existingTx, error: existingTxErr } = await supabaseAdmin
        .from('access_tokens')
        .select('token, credits_remaining')
        .eq('paddle_transaction_id', tx.id)
        .maybeSingle();

      if (existingTxErr) {
        console.error('access_tokens lookup by tx error:', existingTxErr);
        return NextResponse.json({ error: 'Database lookup failed', details: existingTxErr.message }, { status: 500 });
      }

      if (!existingTx) {
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        const accessToken = customData.accessToken || generateAccessToken();

        const { data: existingTokenRow, error: existingTokenErr } = await supabaseAdmin
          .from('access_tokens')
          .select('credits_remaining')
          .eq('token', accessToken)
          .maybeSingle();

        if (existingTokenErr) {
          console.error('access_tokens lookup by token error:', existingTokenErr);
          return NextResponse.json({ error: 'Token lookup failed', details: existingTokenErr.message }, { status: 500 });
        }

        if (existingTokenRow) {
          const { error: updateErr } = await supabaseAdmin
            .from('access_tokens')
            .update({
              credits_remaining: (existingTokenRow.credits_remaining || 0) + creditsToGrant,
              plan_id: planId,
              plan_label: planLabel,
              paddle_transaction_id: tx.id,
              expires_at: expiresAt,
            })
            .eq('token', accessToken);

          if (updateErr) {
            console.error('access_tokens update error:', updateErr);
            return NextResponse.json({ error: 'Token update failed', details: updateErr.message }, { status: 500 });
          }
        } else {
          const { error: insertErr } = await supabaseAdmin.from('access_tokens').insert({
            token: accessToken,
            paddle_transaction_id: tx.id,
            plan_id: planId,
            plan_label: planLabel,
            credits_remaining: creditsToGrant,
            unlocked_numbers: [],
            expires_at: expiresAt,
          });

          if (insertErr) {
            console.error('access_tokens insert error:', insertErr);
            return NextResponse.json({ error: 'Token insert failed', details: insertErr.message }, { status: 500 });
          }
        }
      }
    }

      const finalTokenRow = await supabaseAdmin
        .from('access_tokens')
        .select('token, plan_label')
        .eq('paddle_transaction_id', tx.id)
        .maybeSingle();

      if (finalTokenRow?.data?.token) {
        await deliverAccessTokenEmail({
          transactionId: tx.id,
          accessToken: finalTokenRow.data.token,
          planLabel: finalTokenRow.data.plan_label || planLabel,
          creditsGranted: creditsToGrant,
          customerId: (tx as any).customerId || (tx as any).customer_id || null,
        }).catch(() => {});
    return NextResponse.json({ received: true });
  } catch (e) {
    console.error('Paddle webhook processing error:', e);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}


