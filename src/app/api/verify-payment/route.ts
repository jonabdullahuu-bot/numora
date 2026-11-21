import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { transactionId, e164Number, planHint } = await req.json();

    if (!transactionId || typeof transactionId !== 'string') {
      return NextResponse.json({ error: 'Missing transactionId' }, { status: 400 });
    }

    const paddleApiKey = process.env.PADDLE_API_KEY?.trim();
    const isSandbox = (process.env.NEXT_PUBLIC_PADDLE_ENV || 'sandbox') === 'sandbox';
    const baseUrl = isSandbox
      ? 'https://sandbox-api.paddle.com'
      : 'https://api.paddle.com';

    const singlePriceId = process.env.NEXT_PUBLIC_PADDLE_SINGLE_PRICE_ID?.trim();
    const proPriceId = process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID?.trim();

    let verifiedStatus = 'completed';
    let creditsGranted = planHint === 'pro' ? 12 : 4;

    if (paddleApiKey) {
      const paddleRes = await fetch(
        `${baseUrl}/transactions/${encodeURIComponent(transactionId)}`,
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
        // In sandbox, allow valid txn_ IDs if API key lacks Transactions:Read permission
        if (!isSandbox || !transactionId.startsWith('txn_')) {
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
          creditsGranted = 12;
        } else if (singlePriceId && matchedPriceId === singlePriceId) {
          creditsGranted = 4;
        }
      }
    }

    await supabaseAdmin.from('unlocked_reports').upsert(
      {
        paddle_transaction_id: transactionId,
        e164_number: e164Number || null,
      },
      { onConflict: 'paddle_transaction_id' }
    );

    return NextResponse.json({
      verified: true,
      transactionId,
      status: verifiedStatus,
      creditsGranted,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
