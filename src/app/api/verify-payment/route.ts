import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';

function generateAccessToken(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.randomBytes(8);
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += alphabet[bytes[i] % alphabet.length];
  }
  return `NMR-${code}`;
}

export async function POST(req: NextRequest) {
  try {
    const { transactionId, e164Number, planHint } = await req.json();

    if (!transactionId || typeof transactionId !== 'string') {
      return NextResponse.json({ error: 'Missing transactionId' }, { status: 400 });
    }

    const cleanTxId = transactionId.trim();
    const cleanNumber =
      typeof e164Number === 'string' && e164Number.trim() ? e164Number.trim() : null;

    // Fast path: if the signed webhook (or a prior verify call) already created the token,
    // still unlock cleanNumber and deduct 1 credit if it hasn't been unlocked yet.
    const { data: existing } = await supabaseAdmin
      .from('access_tokens')
      .select('*')
      .eq('paddle_transaction_id', cleanTxId)
      .maybeSingle();

    if (existing) {
      let creditsRemaining = Number(existing.credits_remaining ?? 0);
      let unlockedNumbers: string[] = Array.isArray(existing.unlocked_numbers)
        ? existing.unlocked_numbers
        : [];

      if (cleanNumber && !unlockedNumbers.includes(cleanNumber)) {
        if (creditsRemaining <= 0) {
          return NextResponse.json(
            { error: 'No credits remaining on this access token.' },
            { status: 402 }
          );
        }

        unlockedNumbers = [...unlockedNumbers, cleanNumber];
        creditsRemaining = Math.max(0, creditsRemaining - 1);

        const { error: updateErr } = await supabaseAdmin
          .from('access_tokens')
          .update({
            credits_remaining: creditsRemaining,
            unlocked_numbers: unlockedNumbers,
            updated_at: new Date().toISOString(),
          })
          .eq('token', existing.token);

        if (updateErr) {
          console.error('[Numora] Failed to deduct credit on existing token:', updateErr.message);
          return NextResponse.json(
            { error: 'Could not update token balance. Please try again.' },
            { status: 500 }
          );
        }
      }

      return NextResponse.json({
        verified: true,
        transactionId: cleanTxId,
        status: 'completed',
        accessToken: existing.token,
        planId: existing.plan_id,
        planLabel: existing.plan_label,
        creditsGranted: existing.plan_id === 'pro' ? 12 : 4,
        creditsRemaining,
        unlockedNumbers,
        expiresAt: existing.expires_at,
      });
    }

    const paddleApiKey = process.env.PADDLE_API_KEY?.trim();
    const isSandbox = (process.env.NEXT_PUBLIC_PADDLE_ENV || 'sandbox') === 'sandbox';
    const baseUrl = isSandbox
      ? 'https://sandbox-api.paddle.com'
      : 'https://api.paddle.com';

    const singlePriceId = process.env.NEXT_PUBLIC_PADDLE_SINGLE_PRICE_ID?.trim();
    const proPriceId = process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID?.trim();

    let verifiedStatus = 'completed';
    let resolvedPlan: 'single' | 'pro' = planHint === 'pro' ? 'pro' : 'single';
    let creditsGranted = resolvedPlan === 'pro' ? 12 : 4;

    if (paddleApiKey) {
      const paddleRes = await fetch(
        `${baseUrl}/transactions/${encodeURIComponent(cleanTxId)}`,
        {
          headers: {
            Authorization: `Bearer ${paddleApiKey}`,
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        }
      );

      const paddleJson = await paddleRes.json().catch(() => ({}));

      if (!paddleRes.ok || !paddleJson?.data) {
        const detail = paddleJson?.error?.detail || `HTTP ${paddleRes.status}`;
        console.warn('[Numora] Paddle verify warning:', detail);
        if (!isSandbox || !cleanTxId.startsWith('txn_')) {
          return NextResponse.json(
            { error: `Could not verify Paddle transaction (${detail}).` },
            { status: 402 }
          );
        }
      } else {
        verifiedStatus = String(paddleJson.data.status || '').toLowerCase();
        if (!['completed', 'paid', 'billed'].includes(verifiedStatus)) {
          return NextResponse.json(
            { error: `Transaction status is ${verifiedStatus}, not completed.` },
            { status: 402 }
          );
        }

        const items = Array.isArray(paddleJson.data.items) ? paddleJson.data.items : [];
        const matchedPriceId = items[0]?.price?.id || items[0]?.price_id || '';
        if (proPriceId && matchedPriceId === proPriceId) {
          resolvedPlan = 'pro';
          creditsGranted = 12;
        } else if (singlePriceId && matchedPriceId === singlePriceId) {
          resolvedPlan = 'single';
          creditsGranted = 4;
        }
      }
    }

    await supabaseAdmin.from('unlocked_reports').upsert(
      {
        paddle_transaction_id: cleanTxId,
        e164_number: cleanNumber,
      },
      { onConflict: 'paddle_transaction_id' }
    );

    const planLabel =
      resolvedPlan === 'pro' ? 'Premium Pass (12 Credits)' : 'Standard Pass (4 Credits)';

    const accessToken = generateAccessToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const initialUnlocked = cleanNumber ? [cleanNumber] : [];
    const initialRemaining = cleanNumber ? Math.max(0, creditsGranted - 1) : creditsGranted;

    const { error: insertErr } = await supabaseAdmin.from('access_tokens').insert({
      token: accessToken,
      paddle_transaction_id: cleanTxId,
      plan_id: resolvedPlan,
      plan_label: planLabel,
      credits_remaining: initialRemaining,
      unlocked_numbers: initialUnlocked,
      expires_at: expiresAt,
    });

    if (insertErr) {
      console.error('[Numora] Failed to save access token:', insertErr.message);
      return NextResponse.json(
        { error: 'Payment verified, but token storage failed. Please contact support with your transaction ID.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      verified: true,
      transactionId: cleanTxId,
      status: verifiedStatus,
      accessToken,
      planId: resolvedPlan,
      planLabel,
      creditsGranted,
      creditsRemaining: initialRemaining,
      unlockedNumbers: initialUnlocked,
      expiresAt,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
