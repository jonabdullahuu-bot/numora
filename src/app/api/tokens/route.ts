import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

function normalizeToken(raw: unknown): string {
  return String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '');
}

export async function GET(req: NextRequest) {
  const token = normalizeToken(req.nextUrl.searchParams.get('token'));
  if (!token) {
    return NextResponse.json({ error: 'Please enter a valid access token.' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('access_tokens')
    .select('*')
    .eq('token', token)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: 'Access token not found.' }, { status: 404 });
  }

  if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: 'This access token has expired.' }, { status: 410 });
  }

  return NextResponse.json({
    accessToken: data.token,
    transactionId: data.paddle_transaction_id,
    planId: data.plan_id,
    planLabel: data.plan_label,
    creditsRemaining: data.credits_remaining,
    unlockedNumbers: data.unlocked_numbers || [],
    expiresAt: data.expires_at,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = normalizeToken(body?.token);
    const e164Number = String(body?.e164Number || '').trim();

    if (!token || !e164Number) {
      return NextResponse.json({ error: 'Token and phone number are required.' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('access_tokens')
      .select('*')
      .eq('token', token)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ error: 'Invalid access token.' }, { status: 404 });
    }

    if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) {
      return NextResponse.json({ error: 'This access token has expired.' }, { status: 410 });
    }

    const existingUnlocked: string[] = Array.isArray(data.unlocked_numbers)
      ? data.unlocked_numbers
      : [];

    // Re-opening an already unlocked number costs 0 credits
    if (existingUnlocked.includes(e164Number)) {
      return NextResponse.json({
        accessToken: data.token,
        creditsRemaining: data.credits_remaining,
        unlockedNumbers: existingUnlocked,
        alreadyUnlocked: true,
      });
    }

    if ((data.credits_remaining ?? 0) <= 0) {
      return NextResponse.json({ error: 'No lookup credits remaining on this token.' }, { status: 402 });
    }

    const nextCredits = data.credits_remaining - 1;
    const nextUnlocked = [...existingUnlocked, e164Number];
    const nextExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('access_tokens')
      .update({
        credits_remaining: nextCredits,
        unlocked_numbers: nextUnlocked,
        expires_at: nextExpires,
        updated_at: new Date().toISOString(),
      })
      .eq('token', token)
      .eq('credits_remaining', data.credits_remaining)
      .select('*')
      .maybeSingle();

    if (updateErr || !updated) {
      return NextResponse.json({ error: 'Could not redeem credit. Please try again.' }, { status: 409 });
    }

    return NextResponse.json({
      accessToken: updated.token,
      creditsRemaining: updated.credits_remaining,
      unlockedNumbers: updated.unlocked_numbers || nextUnlocked,
      alreadyUnlocked: false,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Token redemption failed' },
      { status: 500 }
    );
  }
}