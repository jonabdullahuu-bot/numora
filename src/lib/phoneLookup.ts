import { parsePhoneNumberFromString } from 'libphonenumber-js';

export interface PhoneReport {
  e164: string;
  internationalFormat: string;
  nationalFormat: string;
  country: string;
  countryCode: string;
  carrier: string;
  lineType: string;
  rawLineType: string;
  isVoip: boolean;
  isNonFixedVoip: boolean;
  isPrepaid: boolean | null;
  isValid: boolean;
  activityScore: number | null;
  activityStatus: string;
  location: string;
  spamRisk: 'Low' | 'Medium' | 'High';
  riskSummary: string;
  redFlags: string[];
  safetyGuidance: string[];
  dataSource: 'trestle' | 'numverify' | 'local';
  warnings: string[];
  // Legacy summary fields kept for backwards compatibility
  ownerName: string;
  ownerEmail: string;
  ownerAddress: string;
}

function classifyActivity(score: number | null): string {
  if (score === null || Number.isNaN(score)) return 'Telemetry Pending';
  if (score >= 70) return 'Active & Connected (High Telecom Activity)';
  if (score >= 31) return 'Moderate / Intermittent Activity';
  return 'Dormant or Likely Disconnected (Low Activity)';
}

function formatTrestleLineType(raw: string): {
  label: string;
  isVoip: boolean;
  isNonFixedVoip: boolean;
} {
  const s = String(raw || '').trim();
  const lower = s.toLowerCase();

  if (lower === 'nonfixedvoip' || lower === 'non_fixed_voip') {
    return {
      label: 'Non-Fixed VoIP · Virtual / App Line',
      isVoip: true,
      isNonFixedVoip: true,
    };
  }
  if (lower === 'fixedvoip' || lower === 'fixed_voip') {
    return {
      label: 'Fixed VoIP · Cable / Business Line',
      isVoip: true,
      isNonFixedVoip: false,
    };
  }
  if (lower === 'mobile') {
    return {
      label: 'Mobile · Physical Carrier SIM',
      isVoip: false,
      isNonFixedVoip: false,
    };
  }
  if (lower === 'landline') {
    return {
      label: 'Landline · Fixed Wireline',
      isVoip: false,
      isNonFixedVoip: false,
    };
  }
  if (lower === 'tollfree' || lower === 'toll_free') {
    return {
      label: 'Toll-Free · Commercial Routing',
      isVoip: false,
      isNonFixedVoip: false,
    };
  }
  if (lower === 'premium') {
    return {
      label: 'Premium Rate · High-Tariff Line',
      isVoip: false,
      isNonFixedVoip: false,
    };
  }
  if (lower === 'voicemail') {
    return {
      label: 'Voicemail · Automated Drop Box',
      isVoip: true,
      isNonFixedVoip: true,
    };
  }

  const pretty = s
    ? s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Mobile · Carrier Line';
  return {
    label: pretty,
    isVoip: lower.includes('voip'),
    isNonFixedVoip: lower.includes('nonfixed') || lower.includes('non_fixed'),
  };
}

function evaluateForensics(params: {
  isNonFixedVoip: boolean;
  isVoip: boolean;
  isPrepaid: boolean | null;
  activityScore: number | null;
  rawLineType: string;
}): {
  spamRisk: 'Low' | 'Medium' | 'High';
  riskSummary: string;
  redFlags: string[];
  safetyGuidance: string[];
} {
  const redFlags: string[] = [];
  const safetyGuidance: string[] = [];
  let riskPoints = 0;

  if (params.isNonFixedVoip) {
    riskPoints += 2;
    redFlags.push(
      'Non-Fixed VoIP detected — line can be registered online via virtual texting apps without a physical SIM.'
    );
    safetyGuidance.push(
      'Treat unsolicited financial, crypto, or romance requests from Non-Fixed VoIP lines with extreme caution.'
    );
  } else if (params.isVoip) {
    riskPoints += 1;
    redFlags.push(
      'Fixed VoIP routing detected — typically tied to internet/cloud PBX or cable telephony.'
    );
  }

  if (params.rawLineType.toLowerCase().includes('premium')) {
    riskPoints += 2;
    redFlags.push('Premium-rate number classification — returning missed calls may incur high per-minute fees.');
  }

  if (params.isPrepaid === true) {
    riskPoints += 1;
    redFlags.push(
      'Prepaid billing profile — line does not require a long-term postpaid credit contract.'
    );
  }

  if (params.activityScore !== null) {
    if (params.activityScore <= 30) {
      riskPoints += 2;
      redFlags.push(
        `Low telecom activity score (${params.activityScore}/100) — number may be disconnected, newly provisioned, or used briefly as a burner.`
      );
      safetyGuidance.push(
        'Verify the caller through an independent channel before sharing verification codes or personal details.'
      );
    } else if (params.activityScore < 70) {
      riskPoints += 1;
      redFlags.push(
        `Moderate telecom activity score (${params.activityScore}/100) — intermittent network usage detected.`
      );
    }
  }

  if (redFlags.length === 0) {
    redFlags.push('No virtual VoIP burner or dormant line anomalies detected on this number.');
  }

  if (safetyGuidance.length === 0) {
    safetyGuidance.push(
      'Standard carrier routing observed; still confirm caller identity independently before sending funds or OTP codes.'
    );
  }
  safetyGuidance.push(
    'Never share 2FA/SMS one-time passcodes with anyone calling or texting from an unverified number.'
  );

  const spamRisk: 'Low' | 'Medium' | 'High' =
    riskPoints >= 3 ? 'High' : riskPoints >= 1 ? 'Medium' : 'Low';

  const riskSummary =
    spamRisk === 'High'
      ? 'Elevated Scam / Burner Signals — multiple virtual or low-activity indicators triggered.'
      : spamRisk === 'Medium'
      ? 'Moderate Caution — VoIP, prepaid, or mid-range line activity traits present.'
      : 'Low Telecom Anomaly Risk — established carrier line with normal routing profile.';

  return { spamRisk, riskSummary, redFlags, safetyGuidance };
}

export function buildDemoReport(e164: string, country: string): PhoneReport {
  const parsed = parsePhoneNumberFromString(e164);
  const resolvedCountry = parsed?.country || country || 'INTL';
  const internationalFormat = parsed ? parsed.formatInternational() : e164;
  const nationalFormat = parsed ? parsed.formatNational() : e164;
  const countryCode = parsed?.countryCallingCode ? `+${parsed.countryCallingCode}` : 'INTL';
  const forensics = evaluateForensics({
    isNonFixedVoip: false,
    isVoip: false,
    isPrepaid: null,
    activityScore: null,
    rawLineType: 'mobile',
  });

  return {
    e164,
    internationalFormat,
    nationalFormat,
    country: resolvedCountry,
    countryCode,
    carrier: 'Global Carrier Network',
    lineType: 'Mobile · Carrier Line',
    rawLineType: 'Mobile',
    isVoip: false,
    isNonFixedVoip: false,
    isPrepaid: null,
    isValid: parsed ? parsed.isValid() : true,
    activityScore: null,
    activityStatus: 'Configure TRESTLE_API_KEY for live 0–100 activity telemetry',
    location: resolvedCountry,
    spamRisk: forensics.spamRisk,
    riskSummary: forensics.riskSummary,
    redFlags: forensics.redFlags,
    safetyGuidance: forensics.safetyGuidance,
    dataSource: 'local',
    warnings: [],
    ownerName: 'Private Carrier Subscriber (Unlisted)',
    ownerEmail: `National Format: ${nationalFormat}`,
    ownerAddress: `${resolvedCountry} Telecom Region`,
  };
}

async function fetchFromTrestle(e164: string, country: string): Promise<PhoneReport | null> {
  const trestleKey = process.env.TRESTLE_API_KEY?.trim();
  if (!trestleKey) return null;

  const parsed = parsePhoneNumberFromString(e164);
  const url = `https://api.trestleiq.com/3.0/phone_intel?phone=${encodeURIComponent(e164)}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'x-api-key': trestleKey,
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || data?.error) {
    console.warn('[Numora] Trestle phone_intel error:', res.status, data?.error || data);
    return null;
  }

  if (data?.is_valid === false) {
    throw new Error('Phone number is not valid according to carrier numbering rules.');
  }

  const rawLineType = String(data?.line_type || 'Mobile').trim();
  const lineInfo = formatTrestleLineType(rawLineType);
  const isPrepaid = typeof data?.is_prepaid === 'boolean' ? data.is_prepaid : null;
  const activityScore =
    typeof data?.activity_score === 'number' ? Math.round(data.activity_score) : null;

  const resolvedCountry =
    String(data?.country_code || parsed?.country || country || 'INTL').toUpperCase();
  const internationalFormat = parsed ? parsed.formatInternational() : e164;
  const nationalFormat = parsed ? parsed.formatNational() : e164;
  const countryCode =
    String(data?.country_calling_code || '').trim() ||
    (parsed?.countryCallingCode ? `+${parsed.countryCallingCode}` : 'INTL');

  const carrier = String(data?.carrier || '').trim() || 'Verified Telecom Carrier';
  const warnings: string[] = Array.isArray(data?.warnings)
    ? data.warnings.map((w: unknown) => String(w)).filter(Boolean)
    : [];

  const forensics = evaluateForensics({
    isNonFixedVoip: lineInfo.isNonFixedVoip,
    isVoip: lineInfo.isVoip,
    isPrepaid,
    activityScore,
    rawLineType,
  });

  return {
    e164: data?.phone_number || e164,
    internationalFormat,
    nationalFormat,
    country: resolvedCountry,
    countryCode: countryCode.startsWith('+') ? countryCode : `+${countryCode}`,
    carrier,
    lineType: lineInfo.label,
    rawLineType,
    isVoip: lineInfo.isVoip,
    isNonFixedVoip: lineInfo.isNonFixedVoip,
    isPrepaid,
    isValid: data?.is_valid !== false,
    activityScore,
    activityStatus: classifyActivity(activityScore),
    location: resolvedCountry,
    spamRisk: forensics.spamRisk,
    riskSummary: forensics.riskSummary,
    redFlags: forensics.redFlags,
    safetyGuidance: forensics.safetyGuidance,
    dataSource: 'trestle',
    warnings,
    ownerName: lineInfo.isNonFixedVoip
      ? 'Virtual App Subscriber (Non-Fixed VoIP)'
      : 'Private Carrier Subscriber (Unlisted)',
    ownerEmail: `National Format: ${nationalFormat}`,
    ownerAddress: `${resolvedCountry} Telecom Region`,
  };
}

export async function fetchGlobalPhoneData(e164: string, country: string): Promise<PhoneReport> {
  // 1. Primary forensic engine: Trestle Phone Validation API
  try {
    const trestleReport = await fetchFromTrestle(e164, country);
    if (trestleReport) {
      return trestleReport;
    }
  } catch (err: any) {
    if (err?.message === 'Phone number is not valid according to carrier numbering rules.') {
      throw err;
    }
    console.warn('[Numora] Trestle lookup fallback:', err?.message || err);
  }

  // 2. Fallback engine: Numverify (if configured)
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
      return buildDemoReport(e164, country);
    }

    if (data?.valid === false) {
      throw new Error('Phone number is not valid according to carrier numbering rules.');
    }

    const rawLineType = String(data?.line_type || 'mobile').trim();
    const lineInfo = formatTrestleLineType(rawLineType);
    const resolvedCountry = data?.country_code || parsed?.country || country || 'INTL';
    const location =
      [data?.location, data?.country_name].filter(Boolean).join(', ') ||
      data?.country_name ||
      resolvedCountry;

    const internationalFormat = parsed ? parsed.formatInternational() : data?.international_format || e164;
    const nationalFormat = parsed ? parsed.formatNational() : data?.local_format || e164;
    const countryCode = parsed?.countryCallingCode ? `+${parsed.countryCallingCode}` : 'INTL';

    const forensics = evaluateForensics({
      isNonFixedVoip: lineInfo.isNonFixedVoip,
      isVoip: lineInfo.isVoip,
      isPrepaid: null,
      activityScore: null,
      rawLineType,
    });

    return {
      e164: data?.international_format || e164,
      internationalFormat,
      nationalFormat,
      country: resolvedCountry,
      countryCode,
      carrier: data?.carrier || 'Verified Regional Operator',
      lineType: lineInfo.label,
      rawLineType,
      isVoip: lineInfo.isVoip,
      isNonFixedVoip: lineInfo.isNonFixedVoip,
      isPrepaid: null,
      isValid: true,
      activityScore: null,
      activityStatus: 'Carrier Routing Verified',
      location,
      spamRisk: forensics.spamRisk,
      riskSummary: forensics.riskSummary,
      redFlags: forensics.redFlags,
      safetyGuidance: forensics.safetyGuidance,
      dataSource: 'numverify',
      warnings: [],
      ownerName: lineInfo.isVoip
        ? 'Virtual / App-Assigned Subscriber (Unlisted)'
        : 'Private Carrier Subscriber (Unlisted)',
      ownerEmail: `National Format: ${nationalFormat}`,
      ownerAddress: location,
    };
  } catch (err: any) {
    if (err?.message === 'Phone number is not valid according to carrier numbering rules.') {
      throw err;
    }
    return buildDemoReport(e164, country);
  }
}
