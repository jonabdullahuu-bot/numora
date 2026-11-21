const fs = require('fs');
const path = require('path');

const scriptBody = `const fs = require('fs');
const path = require('path');

const lookupTs = \`export interface PhoneReport {
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
  const url = \\\`https://api.apilayer.net/numverify/api/validate?access_key=\\\${encodeURIComponent(
    apiKey
  )}&number=\\\${encodeURIComponent(digits)}\\\`;

  const response = await fetch(url, { cache: 'no-store' });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data?.success === false) {
    const errMsg =
      data?.error?.info || data?.message || 'Numverify lookup failed on APILayer.';
    throw new Error(errMsg);
  }

  if (data?.valid === false) {
    throw new Error('Phone number is not valid according to carrier numbering rules.');
  }

  const rawLineType = String(data?.line_type || 'mobile').trim();
  const formattedLineType = rawLineType
    ? rawLineType
        .replace(/_/g, ' ')
        .replace(/\\b\\w/g, (ch) => ch.toUpperCase())
    : 'Mobile';

  const resolvedCountry = data?.country_code || country || 'INTL';
  const location =
    [data?.location, data?.country_name].filter(Boolean).join(', ') ||
    data?.country_name ||
    resolvedCountry;

  return {
    e164: data?.international_format || e164,
    country: resolvedCountry,
    carrier: data?.carrier || 'Carrier Unlisted',
    lineType: formattedLineType,
    location,
    spamRisk: inferRisk(formattedLineType),
    ownerName: 'Subscriber Record (Paid Identity Source Required)',
    ownerEmail: 'Email Record (Paid Identity Source Required)',
    ownerAddress: data?.location
      ? \\\`\\\${data.location}\\\${data?.country_name ? \\\", \\\${data.country_name}\\\" : \\\"\\\"}\\\`
      : 'Location Only',
  };
}
\`;

const libDir = path.join(process.cwd(), 'src', 'lib');
fs.mkdirSync(libDir, { recursive: true });
fs.writeFileSync(path.join(libDir, 'phoneLookup.ts'), lookupTs, 'utf8');
console.log('Updated src/lib/phoneLookup.ts with https://api.apilayer.net/numverify/api/validate!');
`;

fs.writeFileSync(path.join(process.cwd(), 'run-numverify-endpoint.js'), scriptBody, 'utf8');
console.log('Created run-numverify-endpoint.js');
`;

fs.writeFileSync(path.join(process.cwd(), 'update-apilayer-numverify.js'), `const fs = require('fs');
const path = require('path');

const lookupTs = \`export interface PhoneReport {
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
  const url = \\\`https://api.apilayer.net/numverify/api/validate?access_key=\\\${encodeURIComponent(
    apiKey
  )}&number=\\\${encodeURIComponent(digits)}\\\`;

  const response = await fetch(url, { cache: 'no-store' });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data?.success === false) {
    const errMsg =
      data?.error?.info || data?.message || 'Numverify lookup failed on APILayer.';
    throw new Error(errMsg);
  }

  if (data?.valid === false) {
    throw new Error('Phone number is not valid according to carrier numbering rules.');
  }

  const rawLineType = String(data?.line_type || 'mobile').trim();
  const formattedLineType = rawLineType
    ? rawLineType
        .replace(/_/g, ' ')
        .replace(/\\b\\w/g, (ch) => ch.toUpperCase())
    : 'Mobile';

  const resolvedCountry = data?.country_code || country || 'INTL';
  const location =
    [data?.location, data?.country_name].filter(Boolean).join(', ') ||
    data?.country_name ||
    resolvedCountry;

  return {
    e164: data?.international_format || e164,
    country: resolvedCountry,
    carrier: data?.carrier || 'Carrier Unlisted',
    lineType: formattedLineType,
    location,
    spamRisk: inferRisk(formattedLineType),
    ownerName: 'Subscriber Record (Paid Identity Source Required)',
    ownerEmail: 'Email Record (Paid Identity Source Required)',
    ownerAddress: data?.location
      ? \\\`\\\${data.location}\\\${data?.country_name ? \\\", \\\${data.country_name}\\\" : \\\"\\\"}\\\`
      : 'Location Only',
  };
}
\`;

const libDir = path.join(process.cwd(), 'src', 'lib');
fs.mkdirSync(libDir, { recursive: true });
fs.writeFileSync(path.join(libDir, 'phoneLookup.ts'), lookupTs, 'utf8');
console.log('Updated src/lib/phoneLookup.ts with https://api.apilayer.net/numverify/api/validate!');
`, 'utf8');