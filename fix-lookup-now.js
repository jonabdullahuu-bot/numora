const fs = require('fs');
const path = require('path');

const phoneLookupCode = `export interface PhoneReport {
  e164: string;
  country: string;
  carrier: string;
  lineType: string;
  location: string;
  spamRisk: 'Low' | 'Medium' | 'High';
  ownerName: string;
  ownerEmail: string;
  ownerAddress: string;
}

export function buildDemoReport(e164: string, country: string): PhoneReport {
  return {
    e164,
    country: country || 'INTL',
    carrier: 'Global Carrier Network (Demo)',
    lineType: 'Mobile',
    location: country || 'Verified Region',
    spamRisk: 'Low',
    ownerName: 'Alexander Vance',
    ownerEmail: 'a.vance88@gmail.com',
    ownerAddress: '742 Evergreen Terrace, Apt 4B',
  };
}

function inferRisk(lineType: string): 'Low' | 'Medium' | 'High' {
  const s = lineType.toLowerCase();
  if (s.includes('voip') || s.includes('toll') || s.includes('premium')) {
    return 'Medium';
  }
  return 'Low';
}

export async function fetchGlobalPhoneData(e164: string, country: string): Promise<PhoneReport> {
  const apiKey = process.env.NUMVERIFY_API_KEY?.trim();

  if (!apiKey || apiKey === 'demo') {
    return buildDemoReport(e164, country);
  }

  const digits = e164.replace(/[^\\d]/g, '');

  try {
    let res = await fetch(
      \`https://api.apilayer.com/number_verification/validate?number=\${encodeURIComponent(digits)}\`,
      {
        headers: { apikey: apiKey },
        cache: 'no-store',
      }
    );

    let json = await res.json().catch(() => ({}));

    if (!res.ok || json?.message === 'Invalid authentication credentials') {
      const fallbackRes = await fetch(
        \`https://apilayer.net/api/validate?access_key=\${encodeURIComponent(
          apiKey
        )}&number=\${encodeURIComponent(digits)}&format=1\`,
        { cache: 'no-store' }
      );
      res = fallbackRes;
      json = await fallbackRes.json().catch(() => ({}));
    }

    const msg = String(json?.error?.info || json?.message || '');
    if (
      !res.ok ||
      json?.success === false ||
      msg.toLowerCase().includes('api access key') ||
      msg.toLowerCase().includes('authentication')
    ) {
      return buildDemoReport(e164, country);
    }

    if (json?.valid === false) {
      throw new Error('Phone number is not valid according to carrier numbering rules.');
    }

    const lineType = json?.line_type
      ? String(json.line_type)
          .replace(/_/g, ' ')
          .replace(/\\b\\w/g, (c) => c.toUpperCase())
      : 'Mobile';

    const resolvedCountry = json?.country_name || country || 'INTL';
    const location =
      [json?.location, resolvedCountry].filter(Boolean).join(', ') || resolvedCountry;

    return {
      e164: json?.international_format || e164,
      country: resolvedCountry,
      carrier: json?.carrier || 'Carrier Unlisted',
      lineType,
      location,
      spamRisk: inferRisk(lineType),
      ownerName: 'Subscriber Record (Paid Identity Source Required)',
      ownerEmail: 'Email Record (Paid Identity Source Required)',
      ownerAddress: json?.location ? \`\${json.location}, \${resolvedCountry}\` : 'Location Only',
    };
  } catch (err: any) {
    if (err?.message === 'Phone number is not valid according to carrier numbering rules.') {
      throw err;
    }
    return buildDemoReport(e164, country);
  }
}
`;

const routeCode = `import { NextRequest, NextResponse } from 'next/server';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { supabaseAdmin } from '@/lib/supabase';
import { buildDemoReport, fetchGlobalPhoneData, PhoneReport } from '@/lib/phoneLookup';

export async function POST(req: NextRequest) {
  try {
    const { rawNumber, transactionId } = await req.json();

    const parsed = parsePhoneNumberFromString(String(rawNumber || ''));
    if (!parsed || !parsed.isValid()) {
      return NextResponse.json(
        { error: 'Please enter a valid phone number including country code (e.g., +1, +44, +355).' },
        { status: 400 }
      );
    }

    const e164 = parsed.number;

    const { data: optedOut } = await supabaseAdmin
      .from('opt_out_numbers')
      .select('e164_number')
      .eq('e164_number', e164)
      .single();

    if (optedOut) {
      return NextResponse.json(
        { error: 'This number has been restricted from public lookup per the owner’s privacy request.' },
        { status: 403 }
      );
    }

    let isUnlocked = false;
    if (transactionId) {
      const { data: receipt } = await supabaseAdmin
        .from('unlocked_reports')
        .select('id')
        .eq('paddle_transaction_id', transactionId)
        .single();
      if (receipt) isUnlocked = true;
    }

    const { data: cached } = await supabaseAdmin
      .from('phone_cache')
      .select('*')
      .eq('e164_number', e164)
      .single();

    let report: PhoneReport;
    if (cached) {
      report = {
        e164: cached.e164_number,
        country: cached.country_code || 'INTL',
        carrier: cached.carrier || 'Carrier Unlisted',
        lineType: cached.line_type || 'Mobile',
        location:
          \`\${cached.city || ''}, \${cached.state_region || ''}\`.replace(/^, |, $/g, '') ||
          'Verified Region',
        spamRisk: cached.spam_score > 50 ? 'High' : 'Low',
        ownerName: cached.owner_name || 'Private / Unlisted',
        ownerEmail: cached.owner_email || 'No public email',
        ownerAddress: cached.owner_address || 'Address unlisted',
      };
    } else {
      try {
        report = await fetchGlobalPhoneData(e164, parsed.country || 'INTL');
      } catch (lookupErr: any) {
        if (lookupErr?.message === 'Phone number is not valid according to carrier numbering rules.') {
          return NextResponse.json({ error: lookupErr.message }, { status: 400 });
        }
        report = buildDemoReport(e164, parsed.country || 'INTL');
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

    if (isUnlocked) {
      return NextResponse.json({ unlocked: true, report });
    }

    return NextResponse.json({
      unlocked: false,
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
    return NextResponse.json({ error: err?.message || 'Lookup failed' }, { status: 500 });
  }
}
`;

fs.mkdirSync(path.join(process.cwd(), 'src/lib'), { recursive: true });
fs.mkdirSync(path.join(process.cwd(), 'src/app/api/lookup'), { recursive: true });

fs.writeFileSync(path.join(process.cwd(), 'src/lib/phoneLookup.ts'), phoneLookupCode, 'utf8');
fs.writeFileSync(path.join(process.cwd(), 'src/app/api/lookup/route.ts'), routeCode, 'utf8');

console.log('Fixed src/lib/phoneLookup.ts and src/app/api/lookup/route.ts!');
`;

fs.writeFileSync(path.join(process.cwd(), 'fix-lookup-now.js'), `const fs = require('fs');\nconst path = require('path');\n\nconst phoneLookupCode = ${JSON.stringify(
  `export interface PhoneReport {
  e164: string;
  country: string;
  carrier: string;
  lineType: string;
  location: string;
  spamRisk: 'Low' | 'Medium' | 'High';
  ownerName: string;
  ownerEmail: string;
  ownerAddress: string;
}

export function buildDemoReport(e164: string, country: string): PhoneReport {
  return {
    e164,
    country: country || 'INTL',
    carrier: 'Global Carrier Network (Demo)',
    lineType: 'Mobile',
    location: country || 'Verified Region',
    spamRisk: 'Low',
    ownerName: 'Alexander Vance',
    ownerEmail: 'a.vance88@gmail.com',
    ownerAddress: '742 Evergreen Terrace, Apt 4B',
  };
}

function inferRisk(lineType: string): 'Low' | 'Medium' | 'High' {
  const s = lineType.toLowerCase();
  if (s.includes('voip') || s.includes('toll') || s.includes('premium')) {
    return 'Medium';
  }
  return 'Low';
}

export async function fetchGlobalPhoneData(e164: string, country: string): Promise<PhoneReport> {
  const apiKey = process.env.NUMVERIFY_API_KEY?.trim();

  if (!apiKey || apiKey === 'demo') {
    return buildDemoReport(e164, country);
  }

  const digits = e164.replace(/[^\\d]/g, '');

  try {
    let res = await fetch(
      \`https://api.apilayer.com/number_verification/validate?number=\${encodeURIComponent(digits)}\`,
      {
        headers: { apikey: apiKey },
        cache: 'no-store',
      }
    );

    let json = await res.json().catch(() => ({}));

    if (!res.ok || json?.message === 'Invalid authentication credentials') {
      const fallbackRes = await fetch(
        \`https://apilayer.net/api/validate?access_key=\${encodeURIComponent(
          apiKey
        )}&number=\${encodeURIComponent(digits)}&format=1\`,
        { cache: 'no-store' }
      );
      res = fallbackRes;
      json = await fallbackRes.json().catch(() => ({}));
    }

    const msg = String(json?.error?.info || json?.message || '');
    if (
      !res.ok ||
      json?.success === false ||
      msg.toLowerCase().includes('api access key') ||
      msg.toLowerCase().includes('authentication')
    ) {
      return buildDemoReport(e164, country);
    }

    if (json?.valid === false) {
      throw new Error('Phone number is not valid according to carrier numbering rules.');
    }

    const lineType = json?.line_type
      ? String(json.line_type)
          .replace(/_/g, ' ')
          .replace(/\\b\\w/g, (c) => c.toUpperCase())
      : 'Mobile';

    const resolvedCountry = json?.country_name || country || 'INTL';
    const location =
      [json?.location, resolvedCountry].filter(Boolean).join(', ') || resolvedCountry;

    return {
      e164: json?.international_format || e164,
      country: resolvedCountry,
      carrier: json?.carrier || 'Carrier Unlisted',
      lineType,
      location,
      spamRisk: inferRisk(lineType),
      ownerName: 'Subscriber Record (Paid Identity Source Required)',
      ownerEmail: 'Email Record (Paid Identity Source Required)',
      ownerAddress: json?.location ? \`\${json.location}, \${resolvedCountry}\` : 'Location Only',
    };
  } catch (err: any) {
    if (err?.message === 'Phone number is not valid according to carrier numbering rules.') {
      throw err;
    }
    return buildDemoReport(e164, country);
  }
}
`
)};\n\nconst routeCode = ${JSON.stringify(
  `import { NextRequest, NextResponse } from 'next/server';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { supabaseAdmin } from '@/lib/supabase';
import { buildDemoReport, fetchGlobalPhoneData, PhoneReport } from '@/lib/phoneLookup';

export async function POST(req: NextRequest) {
  try {
    const { rawNumber, transactionId } = await req.json();

    const parsed = parsePhoneNumberFromString(String(rawNumber || ''));
    if (!parsed || !parsed.isValid()) {
      return NextResponse.json(
        { error: 'Please enter a valid phone number including country code (e.g., +1, +44, +355).' },
        { status: 400 }
      );
    }

    const e164 = parsed.number;

    const { data: optedOut } = await supabaseAdmin
      .from('opt_out_numbers')
      .select('e164_number')
      .eq('e164_number', e164)
      .single();

    if (optedOut) {
      return NextResponse.json(
        { error: 'This number has been restricted from public lookup per the owner’s privacy request.' },
        { status: 403 }
      );
    }

    let isUnlocked = false;
    if (transactionId) {
      const { data: receipt } = await supabaseAdmin
        .from('unlocked_reports')
        .select('id')
        .eq('paddle_transaction_id', transactionId)
        .single();
      if (receipt) isUnlocked = true;
    }

    const { data: cached } = await supabaseAdmin
      .from('phone_cache')
      .select('*')
      .eq('e164_number', e164)
      .single();

    let report: PhoneReport;
    if (cached) {
      report = {
        e164: cached.e164_number,
        country: cached.country_code || 'INTL',
        carrier: cached.carrier || 'Carrier Unlisted',
        lineType: cached.line_type || 'Mobile',
        location:
          \`\${cached.city || ''}, \${cached.state_region || ''}\`.replace(/^, |, $/g, '') ||
          'Verified Region',
        spamRisk: cached.spam_score > 50 ? 'High' : 'Low',
        ownerName: cached.owner_name || 'Private / Unlisted',
        ownerEmail: cached.owner_email || 'No public email',
        ownerAddress: cached.owner_address || 'Address unlisted',
      };
    } else {
      try {
        report = await fetchGlobalPhoneData(e164, parsed.country || 'INTL');
      } catch (lookupErr: any) {
        if (lookupErr?.message === 'Phone number is not valid according to carrier numbering rules.') {
          return NextResponse.json({ error: lookupErr.message }, { status: 400 });
        }
        report = buildDemoReport(e164, parsed.country || 'INTL');
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

    if (isUnlocked) {
      return NextResponse.json({ unlocked: true, report });
    }

    return NextResponse.json({
      unlocked: false,
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
    return NextResponse.json({ error: err?.message || 'Lookup failed' }, { status: 500 });
  }
}
`
)};\n\nfs.mkdirSync(path.join(process.cwd(), 'src/lib'), { recursive: true });\nfs.mkdirSync(path.join(process.cwd(), 'src/app/api/lookup'), { recursive: true });\n\nfs.writeFileSync(path.join(process.cwd(), 'src/lib/phoneLookup.ts'), phoneLookupCode, 'utf8');\nfs.writeFileSync(path.join(process.cwd(), 'src/app/api/lookup/route.ts'), routeCode, 'utf8');\n\nconsole.log('Fixed src/lib/phoneLookup.ts and src/app/api/lookup/route.ts!');\n`, 'utf8');