import { NextRequest, NextResponse } from 'next/server';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { rawNumber, reason } = await req.json();
    const parsed = parsePhoneNumberFromString(String(rawNumber || ''));

    if (!parsed || !parsed.isValid()) {
      return NextResponse.json(
        { error: 'Please enter a valid phone number with country code (e.g., +1 212 555 0199).' },
        { status: 400 }
      );
    }

    const e164 = parsed.number;

    await supabaseAdmin.from('opt_out_numbers').upsert(
      {
        e164_number: e164,
        reason: String(reason || 'User opt-out request').slice(0, 200),
      },
      { onConflict: 'e164_number' }
    );

    await supabaseAdmin.from('phone_cache').delete().eq('e164_number', e164);

    return NextResponse.json({
      optedOut: true,
      e164,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Could not process opt-out request.' },
      { status: 500 }
    );
  }
}
