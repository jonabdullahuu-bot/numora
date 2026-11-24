import { NextRequest, NextResponse } from 'next/server';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { supabaseAdmin } from '@/lib/supabase';
import { buildDemoReport, fetchGlobalPhoneData, PhoneReport } from '@/lib/phoneLookup';

const CACHE_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days
const rateBucket = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateBucket.get(ip);
  if (!entry || now > entry.resetAt) {
    rateBucket.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  entry.count += 1;
  return entry.count > 25; // max 25 lookups/minute per IP
}

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
  e164: string,
  onlyIfAlreadyUnlocked = false
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

  const baseWallet = {
    accessToken: data.token,
    transactionId: data.paddle_transaction_id,
    planId: (data.plan_id === 'pro' ? 'pro' : 'single') as 'single' | 'pro',
    planLabel: data.plan_label,
    creditsRemaining: data.credits_remaining ?? 0,
    unlockedNumbers: existingUnlocked,
    expiresAt: data.expires_at,
  };

  if (existingUnlocked.includes(e164)) {
    return { unlocked: true, walletState: baseWallet };
  }

  if (onlyIfAlreadyUnlocked) {
    return { unlocked: false, walletState: baseWallet };
  }

  if ((data.credits_remaining ?? 0) <= 0) {
    return { unlocked: false, walletState: { ...baseWallet, creditsRemaining: 0 } };
  }

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
    const forwardedFor = req.headers.get('x-forwarded-for') || 'unknown';
    const clientIp = forwardedFor.split(',')[0].trim();
    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { error: 'Too many lookup requests. Please wait a minute and try again.' },
        { status: 429 }
      );
    }

    const { rawNumber, transactionId, accessToken, onlyIfAlreadyUnlocked } = await req.json();

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
        { error: "This number has been restricted from public lookup per the owner's privacy request." },
        { status: 403 }
      );
    }

    // Check fresh 14-day cache before spending a Trestle query
    let report: PhoneReport | null = null;
    try {
      const { data: cached } = await supabaseAdmin
        .from('phone_cache')
        .select('*')
        .eq('e164_number', e164)
        .maybeSingle();

      if (cached?.raw_report && cached?.updated_at) {
        const ageMs = Date.now() - new Date(cached.updated_at).getTime();
        if (ageMs >= 0 && ageMs < CACHE_TTL_MS && cached.raw_report.dataSource === 'trestle') {
          report = cached.raw_report as PhoneReport;
        }
      }
    } catch {
      // Cache miss or raw_report column not yet created — fall through to live fetch
    }

    if (!report) {
      try {
        report = await fetchGlobalPhoneData(e164, countryFallback);
      } catch (lookupErr: any) {
        if (lookupErr?.message === 'Phone number is not valid according to carrier numbering rules.') {
          return NextResponse.json({ error: lookupErr.message }, { status: 400 });
        }
        report = buildDemoReport(e164, countryFallback);
      }

      // Persist both summary columns and full raw_report JSON when available
      try {
        await supabaseAdmin.from('phone_cache').upsert({
          e164_number: report.e164,
          country_code: report.country,
          carrier: report.carrier,
          line_type: report.lineType,
          city: report.location,
          owner_name: report.ownerName,
          owner_email: report.ownerEmail,
          owner_address: report.ownerAddress,
          raw_report: report,
          updated_at: new Date().toISOString(),
        });
      } catch {
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
    }

    let isUnlocked = false;
    let walletState: TokenSpendOutcome['walletState'] = undefined;

    if (accessToken) {
      const outcome = await authorizeWithAccessToken(
        accessToken,
        e164,
        Boolean(onlyIfAlreadyUnlocked)
      );
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
        ...report,
        isPrepaid: null,
        activityScore: null,
        activityStatus: 'Locked — Unlock full dossier to view 0–100 activity telemetry',
        riskSummary: 'Unlock full forensic dossier to inspect burner VoIP classification & activity score.',
        redFlags: [
          'Burner / Non-Fixed VoIP classification locked in preview',
          'Live telecom activity score (0–100) & prepaid billing status locked in preview',
        ],
        safetyGuidance: ['Unlock report to view tailored telecom safety & verification guidance.'],
        warnings: [],
        ownerName: '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022\u2022\u2022',
        ownerEmail: '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022',
        ownerAddress: '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022',
      },
    });
  } catch (err: any) {
    const msg = String(err?.message || '');
    return NextResponse.json({ error: sanitizeText(msg, 'Lookup failed') }, { status: 500 });
  }
}
