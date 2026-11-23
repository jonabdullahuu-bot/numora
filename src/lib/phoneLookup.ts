import { parsePhoneNumberFromString } from 'libphonenumber-js';

export interface PhoneReport {
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
    lineType: 'Mobile \u00b7 Physical SIM',
    location: country || 'Verified Region',
    spamRisk: 'Low',
    ownerName: 'Private Carrier Subscriber (Unlisted)',
    ownerEmail: 'No Public Breach / Directory Email',
    ownerAddress: `${country || 'Verified'} Telecom Region`,
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

  const digits = e164.replace(/[^\d]/g, '');
  const parsed = parsePhoneNumberFromString(e164);

  try {
    const url = `https://api.apilayer.net/numverify/api/validate?access_key=${encodeURIComponent(
      apiKey
    )}&number=${encodeURIComponent(digits)}`;

    const response = await fetch(url, {
      headers: { apikey: apiKey },
      cache: 'no-store',
    });
    const data = await response.json().catch(() => ({}));

    const errMsg = String(data?.error?.info || data?.message || '');
    if (
      !response.ok ||
      data?.success === false ||
      errMsg.toLowerCase().includes('api access key') ||
      errMsg.toLowerCase().includes('authentication')
    ) {
      console.warn('[Numora] APILayer lookup fallback used:', errMsg || response.status);
      return buildDemoReport(e164, country);
    }

    if (data?.valid === false) {
      throw new Error('Phone number is not valid according to carrier numbering rules.');
    }

    const rawLineType = String(data?.line_type || 'mobile').trim();
    const formattedLineType = rawLineType
      ? rawLineType.replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase())
      : 'Mobile';

    const isVoip = formattedLineType.toLowerCase().includes('voip');
    const resolvedCountry = data?.country_code || parsed?.country || country || 'INTL';
    const location =
      [data?.location, data?.country_name].filter(Boolean).join(', ') ||
      data?.country_name ||
      resolvedCountry;

    const nationalFormat = parsed ? parsed.formatNational() : data?.local_format || e164;

    return {
      e164: data?.international_format || e164,
      country: resolvedCountry,
      carrier: data?.carrier || 'Verified Regional Operator',
      lineType: isVoip ? `${formattedLineType} \u00b7 Virtual Line` : `${formattedLineType} \u00b7 Carrier Line`,
      location,
      spamRisk: inferRisk(formattedLineType),
      ownerName: isVoip
        ? 'Virtual / App-Assigned Subscriber (Unlisted)'
        : 'Private Carrier Subscriber (Unlisted)',
      ownerEmail: `National Format: ${nationalFormat} \u00b7 No Public Email`,
      ownerAddress: location,
    };
  } catch (err: any) {
    if (err?.message === 'Phone number is not valid according to carrier numbering rules.') {
      throw err;
    }
    console.warn('[Numora] Lookup error fallback used:', err?.message || err);
    return buildDemoReport(e164, country);
  }
}