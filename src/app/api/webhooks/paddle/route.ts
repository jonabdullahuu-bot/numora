import { NextRequest, NextResponse } from 'next/server';
import { Environment, Paddle } from '@paddle/paddle-node-sdk';
import { supabaseAdmin } from '@/lib/supabase';

const paddle = new Paddle(process.env.PADDLE_API_KEY!, {
  environment:
    process.env.NEXT_PUBLIC_PADDLE_ENV === 'production'
      ? Environment.production
      : Environment.sandbox,
});

export async function POST(req: NextRequest) {
  const signature = req.headers.get('paddle-signature') || '';
  const rawBody = await req.text();
  const secretKey = process.env.PADDLE_NOTIFICATION_WEBHOOK_SECRET!;

  try {
    const eventData = await paddle.webhooks.unmarshal(rawBody, secretKey, signature);

    if (eventData.eventType === 'transaction.completed') {
      const tx = eventData.data;
      const customData = (tx.customData as Record<string, string>) || {};

      await supabaseAdmin.from('unlocked_reports').upsert({
        paddle_transaction_id: tx.id,
        customer_email: tx.customerId || 'customer@numora.io',
        e164_number: customData.searchedNumber || 'ALL',
        plan_type: customData.planType || 'single_report',
      });
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid Paddle webhook signature' }, { status: 400 });
  }
}