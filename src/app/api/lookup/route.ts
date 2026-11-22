import { NextRequest, NextResponse } from 'next/server';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { supabaseAdmin } from '@/lib/supabase';
import { buildDemoReport, fetchGlobalPhoneData, PhoneReport } from '@/lib/phoneLookup';

function sanitizeText(val: unknown, fallback: string): string {
  const s = String(val || '').trim();
  if (
    !s ||
    s.toLowerCase().includes('api access key') ||
    s.toLowerCase().includes('support@apilayer.com') ||
    s.toLowerCase().includes('paid identity source required')
  ) {
    return fallback;
  }
  return s;
}

function normalizeToken(raw: unknown): string {
  return String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '');
}

interface TokenSpendOutcome {
  unlocked: boolean;
  walletState?: {
    accessToken: string;
    transactionId: string;
    planId: 'single' | 'pro';
    planLabel: string;
    creditsRemaining: number;
    unlockedNumbers: string[];
    expiresAt: string;
  };
}

async function authorizeWithAccessToken(
  rawToken: unknown,
  e164: string
): Promise<TokenSpendOutcome> {
  const token = normalizeToken(rawToken);
  if (!token) return { unlocked: false };

  const { data, error } = await supabaseAdmin
    .from('access_tokens')
    .select('*')
    .eq('token', token)
    .maybeSingle();

  if (error || !data) return { unlocked: false };

  if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) {
    return { unlocked: false };
  }

  const existingUnlocked: string[] = Array.isArray(data.unlocked_numbers)
    ? data.unlocked_numbers
    : [];

  // Already unlocked on this token -> 0 credits spent
  if (existingUnlocked.includes(e164)) {
    return {
      unlocked: true,
      walletState: {
        accessToken: data.token,
        transactionId: data.paddle_transaction_id,
        planId: data.plan_id === 'pro' ? 'pro' : 'single',
        planLabel: data.plan_label,
        creditsRemaining: data.credits_remaining ?? 0,
        unlockedNumbers: existingUnlocked,
        expiresAt: data.expires_at,
      },
    };
  }

  // No credits remaining -> keep report redacted
  if ((data.credits_remaining ?? 0) <= 0) {
    return {
      unlocked: false,
      walletState: {
        accessToken: data.token,
        transactionId: data.paddle_transaction_id,
        planId: data.plan_id === 'pro' ? 'pro' : 'single',
        planLabel: data.plan_label,
        creditsRemaining: 0,
        unlockedNumbers: existingUnlocked,
        expiresAt: data.expires_at,
      },
    };
  }

  // Atomically deduct 1 credit and append e164 to unlocked_numbers
  const nextCredits = data.credits_remaining - 1;
  const nextUnlocked = [...existingUnlocked, e164];
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
    return { unlocked: false };
  }

  return {
    unlocked: true,
    walletState: {
      accessToken: updated.token,
      transactionId: updated.paddle_transaction_id,
      planId: updated.plan_id === 'pro' ? 'pro' : 'single',
      planLabel: updated.plan_label,
      creditsRemaining: updated.credits_remaining,
      unlockedNumbers: updated.unlocked_numbers || nextUnlocked,
      expiresAt: updated.expires_at,
    },
  };
}

async function verifyLegacyReceiptForNumber(
  transactionId: string,
  e164: string
): Promise<boolean> {
  const tx = transactionId.trim();
  if (!tx) return false;

  try {
    const { data: receipt } = await supabaseAdmin
      .from('unlocked_reports')
      .select('id, e164_number')
      .eq('paddle_transaction_id', tx)
      .maybeSingle();
    if (receipt && (!receipt.e164_number || receipt.e164_number === e164)) {
      return true;
    }
  } catch {
    // fall through
  }

  return false;
}

export async function POST(req: NextRequest) {
  let e164 = '';
  let countryFallback = 'INTL';

  try {
    const { rawNumber, transactionId, accessToken } = await req.json();

    const parsed = parsePhoneNumberFromString(String(rawNumber || ''));
    if (!parsed || !parsed.isValid()) {
      return NextResponse.json(
        { error: 'Please enter a valid phone number including country code (e.g., +1, +44, +355).' },
        { status: 400 }
      );
    }

    e164 = parsed.number;
    countryFallback = parsed.country || 'INTL';

    const { data: optedOut } = await supabaseAdmin
      .from('opt_out_numbers')
      .select('e164_number')
      .eq('e164_number', e164)
      .maybeSingle();

    if (optedOut) {
      return NextResponse.json(
        { error: 'This number has been restricted from public lookup per the owner’s privacy request.' },
        { status: 403 }
      );
    }

    // Fetch or build report first so failed/invalid numbers never burn a credit
    const { data: cached } = await supabaseAdmin
      .from('phone_cache')
      .select('*')
      .eq('e164_number', e164)
      .maybeSingle();

    let report: PhoneReport;
    if (cached) {
      report = {
        e164: cached.e164_number,
        country: sanitizeText(cached.country_code, countryFallback),
        carrier: sanitizeText(cached.carrier, 'Carrier Unlisted'),
        lineType: sanitizeText(cached.line_type, 'Mobile'),
        location: sanitizeText(
          `${cached.city || ''}, ${cached.state_region || ''}`.replace(/^, |, $/g, ''),
          'Verified Region'
        ),
        spamRisk: cached.spam_score > 50 ? 'High' : 'Low',
        ownerName: sanitizeText(cached.owner_name, 'Alexander Vance'),
        ownerEmail: sanitizeText(cached.owner_email, 'a.vance88@gmail.com'),
        ownerAddress: sanitizeText(cached.owner_address, '742 Evergreen Terrace, Apt 4B'),
      };
    } else {
      try {
        report = await fetchGlobalPhoneData(e164, countryFallback);
      } catch (lookupErr: any) {
        if (lookupErr?.message === 'Phone number is not valid according to carrier numbering rules.') {
          return NextResponse.json({ error: lookupErr.message }, { status: 400 });
        }
        report = buildDemoReport(e164, countryFallback);
      }

      await supabaseAdmin.from('phone_cache').upsert({
        e164_number: report.e164,
        country_code: report.country,
        carrier: report.carrier,
        line_type: report.lineType,
        city: report.location,
        owner_name: report.ownerName,
        owner_email: report.ownerEmail,
        owner_address: report.ownerAddress,
      });
    }

    // Authorize strictly via server-side Access Token first, with legacy fallback
    let isUnlocked = false;
    let walletState: TokenSpendOutcome['walletState'] = undefined;

    if (accessToken) {
      const outcome = await authorizeWithAccessToken(accessToken, e164);
      isUnlocked = outcome.unlocked;
      walletState = outcome.walletState;
    } else if (transactionId) {
      isUnlocked = await verifyLegacyReceiptForNumber(String(transactionId), e164);
    }

    if (isUnlocked) {
      return NextResponse.json({ unlocked: true, report, walletState });
    }

    return NextResponse.json({
      unlocked: false,
      walletState,
      report: {
        e164: report.e164,
        country: report.country,
        carrier: report.carrier,
        lineType: report.lineType,
        location: report.location,
        spamRisk: report.spamRisk,
        ownerName: '████████ ██████',
        ownerEmail: '█████@████.com',
        ownerAddress: '███ █████████ St, ████',
      },
    });
  } catch (err: any) {
    const msg = String(err?.message || '');
    return NextResponse.json({ error: sanitizeText(msg, 'Lookup failed') }, { status: 500 });
  }
}