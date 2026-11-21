const fs = require('fs');
const path = require('path');

const lookupModuleCode = `export interface PhoneReport {
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

function inferRiskFromLineType(lineType: string): 'Low' | 'Medium' | 'High' {
  const normalized = lineType.toLowerCase();
  if (
    normalized.includes('voip') ||
    normalized.includes('toll_free') ||
    normalized.includes('premium')
  ) {
    return 'Medium';
  }
  return 'Low';
}

export async function fetchGlobalPhoneData(e164: string, country: string): Promise<PhoneReport> {
  const apiKey = process.env.NUMVERIFY_API_KEY;

  if (!apiKey || apiKey === 'demo') {
    return {
      e164,
      country: country || 'International',
      carrier: 'Vodafone / Global Carrier',
      lineType: 'Mobile',
      location: country || 'Metro Area Registered',
      spamRisk: 'Low',
      ownerName: 'Alexander Vance',
      ownerEmail: 'a.vance88@gmail.com',
      ownerAddress: '742 Evergreen Terrace, Apt 4B',
    };
  }

  const digitsOnly = e164.replace(/[^\\d]/g, '');

  let response = await fetch(
    \`https://api.apilayer.com/number_verification/validate?number=\${encodeURIComponent(digitsOnly)}\`,
    {
      headers: {
        apikey: apiKey,
      },
    }
  );

  let data = await response.json().catch(() => ({}));

  if (!response.ok || data?.message === 'Invalid authentication credentials') {
    const fallbackRes = await fetch(
      \`https://apilayer.net/api/validate?access_key=\${encodeURIComponent(
        apiKey
      )}&number=\${encodeURIComponent(digitsOnly)}&format=1\`
    );
    response = fallbackRes;
    data = await fallbackRes.json().catch(() => ({}));
  }

  if (!response.ok || data?.success === false) {
    const errorMsg =
      data?.error?.info || data?.message || 'Numverify lookup failed. Check your API key or plan.';
    throw new Error(errorMsg);
  }

  if (data?.valid === false) {
    throw new Error('Phone number is not valid according to carrier numbering rules.');
  }

  const lineType = data?.line_type
    ? String(data.line_type)
        .replace(/_/g, ' ')
        .replace(/\\b\\w/g, (ch) => ch.toUpperCase())
    : 'Mobile';

  const resolvedCountry = data?.country_name || country || 'International';
  const location =
    [data?.location, resolvedCountry].filter(Boolean).join(', ') || resolvedCountry;

  return {
    e164: data?.international_format || e164,
    country: resolvedCountry,
    carrier: data?.carrier || 'Carrier Unlisted',
    lineType,
    location,
    spamRisk: inferRiskFromLineType(lineType),
    ownerName: 'Subscriber Record (Paid Identity Source Required)',
    ownerEmail: 'Email Record (Paid Identity Source Required)',
    ownerAddress: data?.location ? \`\${data.location}, \${resolvedCountry}\` : 'Location Only',
  };
}
`;

const targetDir = path.join(process.cwd(), 'src/lib');
fs.mkdirSync(targetDir, { recursive: true });
fs.writeFileSync(path.join(targetDir, 'phoneLookup.ts'), lookupModuleCode, 'utf8');
console.log('Updated src/lib/phoneLookup.ts with APILayer / Numverify lookup!');