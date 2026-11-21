import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

function verifyPaddleSignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader || !secret) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(';').map((part) => {
      const [k, v] = part.trim().split('=');
      return [k, v];
    })
  );

  const ts = parts.ts;
  const h1 = parts.h1;
  if (!ts || !h1) return false;

  const signedPayload = `${ts}:${rawBody}`;
  const expected = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(h1, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET?.trim();
    const signatureHeader = req.headers.get('paddle-signature');

    if (webhookSecret && !verifyPaddleSignature(rawBody, signatureHeader, webhookSecret)) {
      return NextResponse.json({ error: 'Invalid Paddle signature' }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    if (event?.event_type === 'transaction.completed' && event?.data?.id) {
      const transactionId = String(event.data.id);
      const searchedNumber =
        event.data?.custom_data?.searchedNumber ||
        event.data?.custom_data?.e164_number ||
        null;

      await supabaseAdmin.from('unlocked_reports').upsert(
        {
          paddle_transaction_id: transactionId,
          e164_number: searchedNumber,
        },
        { onConflict: 'paddle_transaction_id' }
      );
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Webhook processing error' },
      { status: 500 }
    );
  }
}
