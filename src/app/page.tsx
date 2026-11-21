'use client';

import React, { useEffect, useRef, useState } from 'react';
import { initializePaddle, Paddle } from '@paddle/paddle-js';
import {
  Search,
  ShieldCheck,
  Lock,
  Globe,
  PhoneCall,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Radar,
  Fingerprint,
  Zap,
  ArrowRight,
  ChevronDown,
  Radio,
  ShieldAlert,
  Cpu,
  UserSearch,
  PhoneForwarded,
  Share2,
  HeartHandshake,
  Users,
  Scale,
  MessageSquareWarning,
  ShoppingBag,
  Coins,
  BadgeCheck,
  CreditCard,
} from 'lucide-react';

interface CountryOption {
  iso: string;
  name: string;
  dialCode: string;
}

interface PassWallet {
  transactionId: string;
  planId: 'single' | 'pro';
  planLabel: string;
  creditsRemaining: number;
  unlockedNumbers: string[];
}

const WALLET_STORAGE_KEY = 'numora_pass_wallet_v1';

const COUNTRY_CODES: CountryOption[] = [
  { iso: 'AL', name: 'Albania', dialCode: '+355' },
  { iso: 'US', name: 'United States', dialCode: '+1' },
  { iso: 'GB', name: 'United Kingdom', dialCode: '+44' },
  { iso: 'DE', name: 'Germany', dialCode: '+49' },
  { iso: 'IT', name: 'Italy', dialCode: '+39' },
  { iso: 'FR', name: 'France', dialCode: '+33' },
  { iso: 'ES', name: 'Spain', dialCode: '+34' },
  { iso: 'CA', name: 'Canada', dialCode: '+1' },
  { iso: 'AF', name: 'Afghanistan', dialCode: '+93' },
  { iso: 'AX', name: 'Aland Islands', dialCode: '+358' },
  { iso: 'DZ', name: 'Algeria', dialCode: '+213' },
  { iso: 'AS', name: 'American Samoa', dialCode: '+1-684' },
  { iso: 'AD', name: 'Andorra', dialCode: '+376' },
  { iso: 'AO', name: 'Angola', dialCode: '+244' },
  { iso: 'AI', name: 'Anguilla', dialCode: '+1-264' },
  { iso: 'AG', name: 'Antigua & Barbuda', dialCode: '+1-268' },
  { iso: 'AR', name: 'Argentina', dialCode: '+54' },
  { iso: 'AM', name: 'Armenia', dialCode: '+374' },
  { iso: 'AW', name: 'Aruba', dialCode: '+297' },
  { iso: 'AU', name: 'Australia', dialCode: '+61' },
  { iso: 'AT', name: 'Austria', dialCode: '+43' },
  { iso: 'AZ', name: 'Azerbaijan', dialCode: '+994' },
  { iso: 'BS', name: 'Bahamas', dialCode: '+1-242' },
  { iso: 'BH', name: 'Bahrain', dialCode: '+973' },
  { iso: 'BD', name: 'Bangladesh', dialCode: '+880' },
  { iso: 'BB', name: 'Barbados', dialCode: '+1-246' },
  { iso: 'BY', name: 'Belarus', dialCode: '+375' },
  { iso: 'BE', name: 'Belgium', dialCode: '+32' },
  { iso: 'BZ', name: 'Belize', dialCode: '+501' },
  { iso: 'BJ', name: 'Benin', dialCode: '+229' },
  { iso: 'BM', name: 'Bermuda', dialCode: '+1-441' },
  { iso: 'BT', name: 'Bhutan', dialCode: '+975' },
  { iso: 'BO', name: 'Bolivia', dialCode: '+591' },
  { iso: 'BA', name: 'Bosnia & Herzegovina', dialCode: '+387' },
  { iso: 'BW', name: 'Botswana', dialCode: '+267' },
  { iso: 'BR', name: 'Brazil', dialCode: '+55' },
  { iso: 'IO', name: 'British Indian Ocean Territory', dialCode: '+246' },
  { iso: 'VG', name: 'British Virgin Islands', dialCode: '+1-284' },
  { iso: 'BN', name: 'Brunei', dialCode: '+673' },
  { iso: 'BG', name: 'Bulgaria', dialCode: '+359' },
  { iso: 'BF', name: 'Burkina Faso', dialCode: '+226' },
  { iso: 'BI', name: 'Burundi', dialCode: '+257' },
  { iso: 'KH', name: 'Cambodia', dialCode: '+855' },
  { iso: 'CM', name: 'Cameroon', dialCode: '+237' },
  { iso: 'CV', name: 'Cape Verde', dialCode: '+238' },
  { iso: 'BQ', name: 'Caribbean Netherlands', dialCode: '+599' },
  { iso: 'KY', name: 'Cayman Islands', dialCode: '+1-345' },
  { iso: 'CF', name: 'Central African Republic', dialCode: '+236' },
  { iso: 'TD', name: 'Chad', dialCode: '+235' },
  { iso: 'CL', name: 'Chile', dialCode: '+56' },
  { iso: 'CN', name: 'China', dialCode: '+86' },
  { iso: 'CX', name: 'Christmas Island', dialCode: '+61' },
  { iso: 'CC', name: 'Cocos (Keeling) Islands', dialCode: '+61' },
  { iso: 'CO', name: 'Colombia', dialCode: '+57' },
  { iso: 'KM', name: 'Comoros', dialCode: '+269' },
  { iso: 'CG', name: 'Congo - Brazzaville', dialCode: '+242' },
  { iso: 'CD', name: 'Congo - Kinshasa', dialCode: '+243' },
  { iso: 'CK', name: 'Cook Islands', dialCode: '+682' },
  { iso: 'CR', name: 'Costa Rica', dialCode: '+506' },
  { iso: 'CI', name: 'Cote d Ivoire', dialCode: '+225' },
  { iso: 'HR', name: 'Croatia', dialCode: '+385' },
  { iso: 'CU', name: 'Cuba', dialCode: '+53' },
  { iso: 'CW', name: 'Curacao', dialCode: '+599' },
  { iso: 'CY', name: 'Cyprus', dialCode: '+357' },
  { iso: 'CZ', name: 'Czechia', dialCode: '+420' },
  { iso: 'DK', name: 'Denmark', dialCode: '+45' },
  { iso: 'DJ', name: 'Djibouti', dialCode: '+253' },
  { iso: 'DM', name: 'Dominica', dialCode: '+1-767' },
  { iso: 'DO', name: 'Dominican Republic', dialCode: '+1-809' },
  { iso: 'EC', name: 'Ecuador', dialCode: '+593' },
  { iso: 'EG', name: 'Egypt', dialCode: '+20' },
  { iso: 'SV', name: 'El Salvador', dialCode: '+503' },
  { iso: 'GQ', name: 'Equatorial Guinea', dialCode: '+240' },
  { iso: 'ER', name: 'Eritrea', dialCode: '+291' },
  { iso: 'EE', name: 'Estonia', dialCode: '+372' },
  { iso: 'SZ', name: 'Eswatini', dialCode: '+268' },
  { iso: 'ET', name: 'Ethiopia', dialCode: '+251' },
  { iso: 'FK', name: 'Falkland Islands', dialCode: '+500' },
  { iso: 'FO', name: 'Faroe Islands', dialCode: '+298' },
  { iso: 'FJ', name: 'Fiji', dialCode: '+679' },
  { iso: 'FI', name: 'Finland', dialCode: '+358' },
  { iso: 'GF', name: 'French Guiana', dialCode: '+594' },
  { iso: 'PF', name: 'French Polynesia', dialCode: '+689' },
  { iso: 'GA', name: 'Gabon', dialCode: '+241' },
  { iso: 'GM', name: 'Gambia', dialCode: '+220' },
  { iso: 'GE', name: 'Georgia', dialCode: '+995' },
  { iso: 'GH', name: 'Ghana', dialCode: '+233' },
  { iso: 'GI', name: 'Gibraltar', dialCode: '+350' },
  { iso: 'GR', name: 'Greece', dialCode: '+30' },
  { iso: 'GL', name: 'Greenland', dialCode: '+299' },
  { iso: 'GD', name: 'Grenada', dialCode: '+1-473' },
  { iso: 'GP', name: 'Guadeloupe', dialCode: '+590' },
  { iso: 'GU', name: 'Guam', dialCode: '+1-671' },
  { iso: 'GT', name: 'Guatemala', dialCode: '+502' },
  { iso: 'GG', name: 'Guernsey', dialCode: '+44-1481' },
  { iso: 'GN', name: 'Guinea', dialCode: '+224' },
  { iso: 'GW', name: 'Guinea-Bissau', dialCode: '+245' },
  { iso: 'GY', name: 'Guyana', dialCode: '+592' },
  { iso: 'HT', name: 'Haiti', dialCode: '+509' },
  { iso: 'HN', name: 'Honduras', dialCode: '+504' },
  { iso: 'HK', name: 'Hong Kong', dialCode: '+852' },
  { iso: 'HU', name: 'Hungary', dialCode: '+36' },
  { iso: 'IS', name: 'Iceland', dialCode: '+354' },
  { iso: 'IN', name: 'India', dialCode: '+91' },
  { iso: 'ID', name: 'Indonesia', dialCode: '+62' },
  { iso: 'IR', name: 'Iran', dialCode: '+98' },
  { iso: 'IQ', name: 'Iraq', dialCode: '+964' },
  { iso: 'IE', name: 'Ireland', dialCode: '+353' },
  { iso: 'IM', name: 'Isle of Man', dialCode: '+44-1624' },
  { iso: 'IL', name: 'Israel', dialCode: '+972' },
  { iso: 'JM', name: 'Jamaica', dialCode: '+1-876' },
  { iso: 'JP', name: 'Japan', dialCode: '+81' },
  { iso: 'JE', name: 'Jersey', dialCode: '+44-1534' },
  { iso: 'JO', name: 'Jordan', dialCode: '+962' },
  { iso: 'KZ', name: 'Kazakhstan', dialCode: '+7' },
  { iso: 'KE', name: 'Kenya', dialCode: '+254' },
  { iso: 'KI', name: 'Kiribati', dialCode: '+686' },
  { iso: 'XK', name: 'Kosovo', dialCode: '+383' },
  { iso: 'KW', name: 'Kuwait', dialCode: '+965' },
  { iso: 'KG', name: 'Kyrgyzstan', dialCode: '+996' },
  { iso: 'LA', name: 'Laos', dialCode: '+856' },
  { iso: 'LV', name: 'Latvia', dialCode: '+371' },
  { iso: 'LB', name: 'Lebanon', dialCode: '+961' },
  { iso: 'LS', name: 'Lesotho', dialCode: '+266' },
  { iso: 'LR', name: 'Liberia', dialCode: '+231' },
  { iso: 'LY', name: 'Libya', dialCode: '+218' },
  { iso: 'LI', name: 'Liechtenstein', dialCode: '+423' },
  { iso: 'LT', name: 'Lithuania', dialCode: '+370' },
  { iso: 'LU', name: 'Luxembourg', dialCode: '+352' },
  { iso: 'MO', name: 'Macao', dialCode: '+853' },
  { iso: 'MG', name: 'Madagascar', dialCode: '+261' },
  { iso: 'MW', name: 'Malawi', dialCode: '+265' },
  { iso: 'MY', name: 'Malaysia', dialCode: '+60' },
  { iso: 'MV', name: 'Maldives', dialCode: '+960' },
  { iso: 'ML', name: 'Mali', dialCode: '+223' },
  { iso: 'MT', name: 'Malta', dialCode: '+356' },
  { iso: 'MH', name: 'Marshall Islands', dialCode: '+692' },
  { iso: 'MQ', name: 'Martinique', dialCode: '+596' },
  { iso: 'MR', name: 'Mauritania', dialCode: '+222' },
  { iso: 'MU', name: 'Mauritius', dialCode: '+230' },
  { iso: 'YT', name: 'Mayotte', dialCode: '+262' },
  { iso: 'MX', name: 'Mexico', dialCode: '+52' },
  { iso: 'FM', name: 'Micronesia', dialCode: '+691' },
  { iso: 'MD', name: 'Moldova', dialCode: '+373' },
  { iso: 'MC', name: 'Monaco', dialCode: '+377' },
  { iso: 'MN', name: 'Mongolia', dialCode: '+976' },
  { iso: 'ME', name: 'Montenegro', dialCode: '+382' },
  { iso: 'MS', name: 'Montserrat', dialCode: '+1-664' },
  { iso: 'MA', name: 'Morocco', dialCode: '+212' },
  { iso: 'MZ', name: 'Mozambique', dialCode: '+258' },
  { iso: 'MM', name: 'Myanmar (Burma)', dialCode: '+95' },
  { iso: 'NA', name: 'Namibia', dialCode: '+264' },
  { iso: 'NR', name: 'Nauru', dialCode: '+674' },
  { iso: 'NP', name: 'Nepal', dialCode: '+977' },
  { iso: 'NL', name: 'Netherlands', dialCode: '+31' },
  { iso: 'NC', name: 'New Caledonia', dialCode: '+687' },
  { iso: 'NZ', name: 'New Zealand', dialCode: '+64' },
  { iso: 'NI', name: 'Nicaragua', dialCode: '+505' },
  { iso: 'NE', name: 'Niger', dialCode: '+227' },
  { iso: 'NG', name: 'Nigeria', dialCode: '+234' },
  { iso: 'NU', name: 'Niue', dialCode: '+683' },
  { iso: 'NF', name: 'Norfolk Island', dialCode: '+672' },
  { iso: 'KP', name: 'North Korea', dialCode: '+850' },
  { iso: 'MK', name: 'North Macedonia', dialCode: '+389' },
  { iso: 'MP', name: 'Northern Mariana Islands', dialCode: '+1-670' },
  { iso: 'NO', name: 'Norway', dialCode: '+47' },
  { iso: 'OM', name: 'Oman', dialCode: '+968' },
  { iso: 'PK', name: 'Pakistan', dialCode: '+92' },
  { iso: 'PW', name: 'Palau', dialCode: '+680' },
  { iso: 'PS', name: 'Palestinian Territories', dialCode: '+970' },
  { iso: 'PA', name: 'Panama', dialCode: '+507' },
  { iso: 'PG', name: 'Papua New Guinea', dialCode: '+675' },
  { iso: 'PY', name: 'Paraguay', dialCode: '+595' },
  { iso: 'PE', name: 'Peru', dialCode: '+51' },
  { iso: 'PH', name: 'Philippines', dialCode: '+63' },
  { iso: 'PN', name: 'Pitcairn Islands', dialCode: '+64' },
  { iso: 'PL', name: 'Poland', dialCode: '+48' },
  { iso: 'PT', name: 'Portugal', dialCode: '+351' },
  { iso: 'PR', name: 'Puerto Rico', dialCode: '+1-787' },
  { iso: 'QA', name: 'Qatar', dialCode: '+974' },
  { iso: 'RE', name: 'Reunion', dialCode: '+262' },
  { iso: 'RO', name: 'Romania', dialCode: '+40' },
  { iso: 'RU', name: 'Russia', dialCode: '+7' },
  { iso: 'RW', name: 'Rwanda', dialCode: '+250' },
  { iso: 'WS', name: 'Samoa', dialCode: '+685' },
  { iso: 'SM', name: 'San Marino', dialCode: '+378' },
  { iso: 'ST', name: 'Sao Tome & Principe', dialCode: '+239' },
  { iso: 'SA', name: 'Saudi Arabia', dialCode: '+966' },
  { iso: 'SN', name: 'Senegal', dialCode: '+221' },
  { iso: 'RS', name: 'Serbia', dialCode: '+381' },
  { iso: 'SC', name: 'Seychelles', dialCode: '+248' },
  { iso: 'SL', name: 'Sierra Leone', dialCode: '+232' },
  { iso: 'SG', name: 'Singapore', dialCode: '+65' },
  { iso: 'SX', name: 'Sint Maarten', dialCode: '+1-721' },
  { iso: 'SK', name: 'Slovakia', dialCode: '+421' },
  { iso: 'SI', name: 'Slovenia', dialCode: '+386' },
  { iso: 'SB', name: 'Solomon Islands', dialCode: '+677' },
  { iso: 'SO', name: 'Somalia', dialCode: '+252' },
  { iso: 'ZA', name: 'South Africa', dialCode: '+27' },
  { iso: 'KR', name: 'South Korea', dialCode: '+82' },
  { iso: 'SS', name: 'South Sudan', dialCode: '+211' },
  { iso: 'LK', name: 'Sri Lanka', dialCode: '+94' },
  { iso: 'BL', name: 'St. Barthelemy', dialCode: '+590' },
  { iso: 'SH', name: 'St. Helena', dialCode: '+290' },
  { iso: 'KN', name: 'St. Kitts & Nevis', dialCode: '+1-869' },
  { iso: 'LC', name: 'St. Lucia', dialCode: '+1-758' },
  { iso: 'MF', name: 'St. Martin', dialCode: '+590' },
  { iso: 'PM', name: 'St. Pierre & Miquelon', dialCode: '+508' },
  { iso: 'VC', name: 'St. Vincent & Grenadines', dialCode: '+1-784' },
  { iso: 'SD', name: 'Sudan', dialCode: '+249' },
  { iso: 'SR', name: 'Suriname', dialCode: '+597' },
  { iso: 'SJ', name: 'Svalbard & Jan Mayen', dialCode: '+47' },
  { iso: 'SE', name: 'Sweden', dialCode: '+46' },
  { iso: 'CH', name: 'Switzerland', dialCode: '+41' },
  { iso: 'SY', name: 'Syria', dialCode: '+963' },
  { iso: 'TW', name: 'Taiwan', dialCode: '+886' },
  { iso: 'TJ', name: 'Tajikistan', dialCode: '+992' },
  { iso: 'TZ', name: 'Tanzania', dialCode: '+255' },
  { iso: 'TH', name: 'Thailand', dialCode: '+66' },
  { iso: 'TL', name: 'Timor-Leste', dialCode: '+670' },
  { iso: 'TG', name: 'Togo', dialCode: '+228' },
  { iso: 'TK', name: 'Tokelau', dialCode: '+690' },
  { iso: 'TO', name: 'Tonga', dialCode: '+676' },
  { iso: 'TT', name: 'Trinidad & Tobago', dialCode: '+1-868' },
  { iso: 'TN', name: 'Tunisia', dialCode: '+216' },
  { iso: 'TR', name: 'Turkey', dialCode: '+90' },
  { iso: 'TM', name: 'Turkmenistan', dialCode: '+993' },
  { iso: 'TC', name: 'Turks & Caicos Islands', dialCode: '+1-649' },
  { iso: 'TV', name: 'Tuvalu', dialCode: '+688' },
  { iso: 'VI', name: 'U.S. Virgin Islands', dialCode: '+1-340' },
  { iso: 'UG', name: 'Uganda', dialCode: '+256' },
  { iso: 'UA', name: 'Ukraine', dialCode: '+380' },
  { iso: 'AE', name: 'United Arab Emirates', dialCode: '+971' },
  { iso: 'UY', name: 'Uruguay', dialCode: '+598' },
  { iso: 'UZ', name: 'Uzbekistan', dialCode: '+998' },
  { iso: 'VU', name: 'Vanuatu', dialCode: '+678' },
  { iso: 'VA', name: 'Vatican City', dialCode: '+39' },
  { iso: 'VE', name: 'Venezuela', dialCode: '+58' },
  { iso: 'VN', name: 'Vietnam', dialCode: '+84' },
  { iso: 'WF', name: 'Wallis & Futuna', dialCode: '+681' },
  { iso: 'EH', name: 'Western Sahara', dialCode: '+212' },
  { iso: 'YE', name: 'Yemen', dialCode: '+967' },
  { iso: 'ZM', name: 'Zambia', dialCode: '+260' },
  { iso: 'ZW', name: 'Zimbabwe', dialCode: '+263' },
];

const SAMPLE_NUMBERS = [
  { label: 'US Line', iso: 'US', dialCode: '+1', localNumber: '212 555 0199' },
  { label: 'UK Mobile', iso: 'GB', dialCode: '+44', localNumber: '7911 123456' },
];

const SCAN_STAGES = [
  'Validating international numbering plan...',
  'Querying carrier registry & line routing...',
  'Evaluating fraud & VoIP risk signals...',
];

const WORKFLOW_STEPS = [
  {
    step: 'Step 01',
    badge: 'E.164 Global Input',
    title: 'Enter the Number You Want to Check',
    description:
      'Select a country flag or paste any international number from an unknown text, missed call, or profile.',
    bullets: [
      { label: 'Query Sources', value: 'SMS, Missed Calls, Profiles' },
      { label: 'Coverage', value: '200+ Countries & Regions' },
      { label: 'Opt-Out Respect', value: 'Suppressed Numbers Blocked' },
    ],
    icon: PhoneCall,
  },
  {
    step: 'Step 02',
    badge: 'Carrier & Line Audit',
    title: 'Numora Inspects Line & Risk Signals',
    description:
      'Evaluates carrier routing, mobile vs. VoIP line type, geographic origin, and spam/fraud indicators.',
    bullets: [
      { label: 'Line Classification', value: 'Mobile, Landline & VoIP' },
      { label: 'Network Lookup', value: 'Carrier & Regional Routing' },
      { label: 'Risk Scoring', value: 'Low, Medium & High Signals' },
    ],
    icon: Radar,
  },
  {
    step: 'Step 03',
    badge: 'Structured Dossier',
    title: 'Review the Number Risk Report',
    description:
      'See free line telemetry upfront and unlock full subscriber details when available so you can decide safely.',
    bullets: [
      { label: 'Core Telemetry', value: 'Carrier, Origin & Risk Level' },
      { label: 'Full Dossier', value: 'Name, Email & Address' },
      { label: 'Decision Support', value: 'Verify, Ignore, or Block' },
    ],
    icon: ShieldCheck,
  },
];

const FORENSICS_MODULES = [
  {
    id: 'carrier',
    category: 'carrier',
    tag: 'CARRIER TELEMETRY',
    title: 'Line Routing & Carrier Registry',
    subtitle: 'Identify the network operator and line classification behind a number',
    description:
      'Inspects international numbering metadata to determine whether a number belongs to a traditional mobile operator, landline, or virtual/VoIP provider.',
    specs: [
      ['Line Type', 'Mobile, Landline, or VoIP'],
      ['Geographic Scope', 'Country & Regional Area'],
      ['Cache Layer', 'Supabase Instant Retrieval'],
    ],
    icon: Radio,
  },
  {
    id: 'abuse',
    category: 'risk',
    tag: 'ABUSE INTELLIGENCE',
    title: 'Spam & Fraud Risk Signals',
    subtitle: 'Spot high-risk patterns across unexpected calls and messages',
    description:
      'Highlights elevated fraud or spam risk indicators so you can think twice before sharing personal details or sending money.',
    pills: ['Fake Delivery Texts', 'Impersonation', 'Robocall Risk', 'High-Risk Lines'],
    specs: [
      ['Risk Tiers', 'Low / Medium / High'],
      ['Pre-Check Speed', 'Under 2 Seconds'],
    ],
    icon: ShieldAlert,
  },
  {
    id: 'voip',
    category: 'risk',
    tag: 'LINE FINGERPRINT',
    title: 'VoIP & Virtual Line Detection',
    subtitle: 'Distinguish app-based or virtual lines from standard carrier lines',
    description:
      'Helps identify when a number is flagged as VoIP or non-standard rather than a direct physical carrier line.',
    specs: [
      ['Detection Focus', 'VoIP & Virtual Gateways'],
      ['Verification', 'E.164 Numbering Validation'],
    ],
    icon: Cpu,
  },
  {
    id: 'identity',
    category: 'identity',
    tag: 'SUBSCRIBER PROFILE',
    title: 'Subscriber & Contact Clues',
    subtitle: 'Corroborate name, email, and address records when available',
    description:
      'Surfaces available subscriber attributes—such as registered name, linked email, and location—behind a clean unlock flow.',
    specs: [
      ['Report Fields', 'Name, Email & Address'],
      ['Privacy Controls', 'Self-Serve Opt-Out Registry'],
    ],
    icon: UserSearch,
  },
  {
    id: 'spoof',
    category: 'carrier',
    tag: 'NUMBER HYGIENE',
    title: 'Format & Reachability Check',
    subtitle: 'Catch malformed, unroutable, or invalid numbers immediately',
    description:
      'Validates E.164 formatting before querying upstream data, preventing wasted lookups on mistyped or invalid numbers.',
    specs: [
      ['Parser Engine', 'libphonenumber-js'],
      ['Error Feedback', 'Clear Invalid-Format Alerts'],
    ],
    icon: PhoneForwarded,
  },
  {
    id: 'context',
    category: 'identity',
    tag: 'INVESTIGATION CONTEXT',
    title: 'Faster Triage Before Replying',
    subtitle: 'Turn raw phone digits into structured context in one place',
    description:
      'Brings carrier, line type, risk level, and subscriber fields into one clean dossier view instead of guessing.',
    specs: [
      ['Access Mode', 'Browser-Based · No App'],
      ['Compliance', 'Non-FCRA Informational Use'],
    ],
    icon: Share2,
  },
];

const USE_CASES = [
  {
    id: 'dating',
    label: 'Online Dating',
    badge: 'Safety Check',
    title: 'Checking Numbers Before Moving Off-App',
    description:
      'Verify an unfamiliar number before taking a conversation from a dating app to SMS or messaging apps.',
    points: [
      ['Primary Focus', 'Catfish & Scam Awareness'],
      ['Line Signal', 'Carrier vs. VoIP Check'],
      ['Target Alert', 'Never Notifies Number'],
    ],
    icon: HeartHandshake,
  },
  {
    id: 'calls',
    label: 'Unknown Calls & Texts',
    badge: 'Spam Triage',
    title: 'Screening Unexpected Calls & Texts',
    description:
      'Check unfamiliar numbers claiming to be deliveries, support desks, or urgent alerts before calling back or clicking links.',
    points: [
      ['Primary Focus', 'Phishing & Spam Screening'],
      ['Speed', 'Instant Browser Lookup'],
      ['Action', 'Answer, Ignore, or Block'],
    ],
    icon: MessageSquareWarning,
  },
  {
    id: 'marketplace',
    label: 'Buying & Selling',
    badge: 'Deal Context',
    title: 'Verifying Buyers, Sellers & Contacts',
    description:
      'Add an extra layer of due diligence when coordinating meetups, remote deals, or freelance inquiries.',
    points: [
      ['Primary Focus', 'Contact Verification'],
      ['Line Signal', 'Carrier & Region Match'],
      ['Privacy', 'Opt-Out Registry Supported'],
    ],
    icon: ShoppingBag,
  },
  {
    id: 'family',
    label: 'Family & General',
    badge: 'Everyday Use',
    title: 'Quick Context for Everyday Numbers',
    description:
      'Look up unfamiliar numbers across countries cleanly on desktop or mobile with clear legal and privacy boundaries.',
    points: [
      ['Primary Focus', 'General Lookup Context'],
      ['Coverage', '200+ Country Codes'],
      ['Compliance', 'Not for FCRA Screening'],
    ],
    icon: Users,
  },
];

function CountryFlag({ iso, name }: { iso: string; name: string }) {
  return (
    <img
      src={`https://flagcdn.com/w40/${iso.toLowerCase()}.png`}
      alt={`${name} flag`}
      className="w-5 h-3.5 rounded-[2px] object-cover shrink-0 border border-white/15"
      loading="lazy"
    />
  );
}

function buildInternationalNumber(dialCode: string, rawInput: string): string {
  const trimmed = rawInput.trim();
  if (trimmed.startsWith('+')) {
    return trimmed;
  }
  const primaryPrefix = dialCode.split('-')[0];
  const cleanedLocal = trimmed.replace(/^0+/, '');
  return `${primaryPrefix} ${cleanedLocal}`.trim();
}

export default function NumoraHome() {
  const [paddle, setPaddle] = useState<Paddle>();
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(COUNTRY_CODES[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanStageIndex, setScanStageIndex] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [forensicsFilter, setForensicsFilter] = useState<'all' | 'carrier' | 'risk' | 'identity'>('all');
  const [activeUseCase, setActiveUseCase] = useState<string>('dating');

  // Upgraded payment & pass-selection states
  const [selectedPlan, setSelectedPlan] = useState<'single' | 'pro'>('pro');
  const [checkoutOpening, setCheckoutOpening] = useState<'single' | 'pro' | null>(null);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [paymentStatusMessage, setPaymentStatusMessage] = useState<string>('');
  const [wallet, setWallet] = useState<PassWallet | null>(null);

  const pickerRef = useRef<HTMLDivElement>(null);
  const activeTargetNumberRef = useRef<string>('');
  const activePlanRef = useRef<'single' | 'pro'>('pro');

  useEffect(() => {
    activePlanRef.current = selectedPlan;
  }, [selectedPlan]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(WALLET_STORAGE_KEY);
      if (saved) {
        const parsed: PassWallet = JSON.parse(saved);
        if (parsed?.transactionId) {
          setWallet(parsed);
        }
      }
    } catch {
      // ignore storage access issues
    }
  }, []);

  const persistWallet = (next: PassWallet) => {
    setWallet(next);
    try {
      window.localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage access issues
    }
  };

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN) {
      initializePaddle({
        environment:
          process.env.NEXT_PUBLIC_PADDLE_ENV === 'production' ? 'production' : 'sandbox',
        token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
        eventCallback: async (event) => {
          const payload = (event as any)?.data as
            | { transaction_id?: string; custom_data?: Record<string, unknown> }
            | undefined;

          if (event?.name === 'checkout.completed' && payload?.transaction_id) {
            const txId = String(payload.transaction_id);
            const customData = payload.custom_data || {};
            const planHint: 'single' | 'pro' =
              customData.planType === 'single_report' ||
              customData.planId === 'single'
                ? 'single'
                : customData.planType === 'pro_pass' ||
                  customData.planId === 'pro'
                ? 'pro'
                : activePlanRef.current;

            const targetNum =
              activeTargetNumberRef.current ||
              buildInternationalNumber(selectedCountry.dialCode, phoneInput);

            setCheckoutOpening(null);
            setVerifyingPayment(true);
            setPaymentStatusMessage('Verifying your Paddle receipt and unlocking full dossier...');

            try {
              const verifyRes = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  transactionId: txId,
                  e164Number: targetNum,
                  planHint,
                }),
              });
              const verifyData = await verifyRes.json().catch(() => ({}));

              const granted = Number(
                verifyData?.creditsGranted || (planHint === 'pro' ? 12 : 4)
              );

              const nextWallet: PassWallet = {
                transactionId: txId,
                planId: planHint,
                planLabel:
                  planHint === 'pro' ? 'Premium Pass (12 Credits)' : 'Standard Pass (4 Credits)',
                creditsRemaining: Math.max(0, granted - 1),
                unlockedNumbers: [targetNum],
              };
              persistWallet(nextWallet);

              await runLookup(targetNum, txId);
              setPaymentStatusMessage(
                `Pass verified! ${Math.max(0, granted - 1)} bonus ${
                  Math.max(0, granted - 1) === 1 ? 'credit' : 'credits'
                } added to your session.`
              );
            } catch {
              await runLookup(targetNum, txId);
            } finally {
              setVerifyingPayment(false);
            }
          } else if (event?.name === 'checkout.closed') {
            setCheckoutOpening(null);
          }
        },
      }).then((paddleInstance) => {
        if (paddleInstance) setPaddle(paddleInstance);
      });
    }
  }, [selectedCountry.dialCode, phoneInput]);

  useEffect(() => {
    if (!loading) {
      setScanStageIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setScanStageIndex((prev) => (prev + 1) % SCAN_STAGES.length);
    }, 650);
    return () => clearInterval(interval);
  }, [loading]);

  const filteredCountries = COUNTRY_CODES.filter((c) => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.dialCode.toLowerCase().includes(q) ||
      c.iso.toLowerCase().includes(q)
    );
  });

  const visibleModules =
    forensicsFilter === 'all'
      ? FORENSICS_MODULES
      : FORENSICS_MODULES.filter((m) => m.category === forensicsFilter);

  const currentUseCase = USE_CASES.find((u) => u.id === activeUseCase) || USE_CASES[0];

  const runLookup = async (targetNumber: string, txId?: string) => {
    setError('');
    setPaymentStatusMessage('');
    setLoading(true);
    activeTargetNumberRef.current = targetNumber;

    try {
      const res = await fetch('/api/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawNumber: targetNumber, transactionId: txId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setResult(null);
      } else {
        setResult(data.report);
        setUnlocked(Boolean(data.unlocked));
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent, txId?: string) => {
    if (e) e.preventDefault();
    const fullNumber = buildInternationalNumber(selectedCountry.dialCode, phoneInput);
    const activeTx =
      txId ||
      (wallet && wallet.unlockedNumbers.includes(fullNumber) ? wallet.transactionId : undefined);
    await runLookup(fullNumber, activeTx);
  };

  const handleSampleClick = async (sample: (typeof SAMPLE_NUMBERS)[number]) => {
    const matchedCountry =
      COUNTRY_CODES.find((c) => c.iso === sample.iso) || selectedCountry;
    setSelectedCountry(matchedCountry);
    setPhoneInput(sample.localNumber);
    const fullNum = `${sample.dialCode} ${sample.localNumber}`;
    const existingTx =
      wallet && wallet.unlockedNumbers.includes(fullNum) ? wallet.transactionId : undefined;
    await runLookup(fullNum, existingTx);
  };

  const handleUseCreditUnlock = async () => {
    if (!wallet || !result?.e164) return;
    setVerifyingPayment(true);
    setPaymentStatusMessage('');
    try {
      const verifyRes = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: wallet.transactionId,
          e164Number: result.e164,
          planHint: wallet.planId,
        }),
      });

      if (!verifyRes.ok) {
        const errData = await verifyRes.json().catch(() => ({}));
        setError(errData?.error || 'Could not verify your pass credit.');
        return;
      }

      const alreadyUnlocked = wallet.unlockedNumbers.includes(result.e164);
      const nextCredits = alreadyUnlocked
        ? wallet.creditsRemaining
        : Math.max(0, wallet.creditsRemaining - 1);
      const nextNumbers = alreadyUnlocked
        ? wallet.unlockedNumbers
        : [...wallet.unlockedNumbers, result.e164];

      persistWallet({
        ...wallet,
        creditsRemaining: nextCredits,
        unlockedNumbers: nextNumbers,
      });

      const lookupRes = await fetch('/api/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawNumber: result.e164,
          transactionId: wallet.transactionId,
        }),
      });
      const lookupData = await lookupRes.json();

      if (lookupRes.ok && lookupData?.report) {
        setResult(lookupData.report);
        setUnlocked(Boolean(lookupData.unlocked));
      }

      setPaymentStatusMessage(
        `Unlocked ${result.e164} using 1 pass credit (${nextCredits} remaining).`
      );
    } catch {
      setError('Network error while unlocking with credit.');
    } finally {
      setVerifyingPayment(false);
    }
  };

  const openPaddleCheckout = (plan: 'single' | 'pro') => {
    setSelectedPlan(plan);
    activePlanRef.current = plan;

    const priceId =
      plan === 'pro'
        ? process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID
        : process.env.NEXT_PUBLIC_PADDLE_SINGLE_PRICE_ID;

    if (!priceId) {
      setError(
        `Missing ${
          plan === 'pro'
            ? 'NEXT_PUBLIC_PADDLE_PRO_PRICE_ID'
            : 'NEXT_PUBLIC_PADDLE_SINGLE_PRICE_ID'
        } in .env.local.`
      );
      return;
    }

    if (!paddle) {
      setError('Paddle checkout is still initializing. Please try again in a moment.');
      return;
    }

    setError('');
    setCheckoutOpening(plan);

    const fullNumber =
      result?.e164 || buildInternationalNumber(selectedCountry.dialCode, phoneInput);
    activeTargetNumberRef.current = fullNumber;

    try {
      paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customData: {
          searchedNumber: fullNumber,
          planId: plan,
          planType: plan === 'pro' ? 'pro_pass' : 'single_report',
        },
        settings: {
          displayMode: 'overlay',
          theme: 'dark',
          locale: 'en',
        },
      });
    } catch (err: any) {
      setCheckoutOpening(null);
      setError(err?.message || 'Unable to launch Paddle checkout.');
    }
  };

  const hasCreditForCurrentNumber =
    Boolean(wallet) &&
    (((wallet?.creditsRemaining ?? 0) > 0) ||
      (result?.e164 && (wallet?.unlockedNumbers ?? []).includes(result.e164)));

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col relative overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 80% 45% at 50% -10%, rgba(99, 102, 241, 0.22), transparent), radial-gradient(circle at 85% 30%, rgba(14, 165, 233, 0.08), transparent)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #94a3b8 1px, transparent 1px), linear-gradient(to bottom, #94a3b8 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <header className="border-b border-white/[0.07] bg-[#060913]/75 sticky top-0 z-30 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-sky-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/25 group-hover:scale-[1.03] transition">
              N
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold tracking-tight text-white">Numora</span>
              <span className="hidden md:inline-block text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-400 border border-white/[0.08]">
                Global Intel
              </span>
            </div>
          </a>

          <nav className="flex items-center gap-6 text-sm">
            <a href="#workflow" className="hidden md:inline text-slate-400 hover:text-white transition">
              How It Works
            </a>
            <a href="#forensics" className="hidden md:inline text-slate-400 hover:text-white transition">
              Signals
            </a>
            <a href="/pricing" className="text-slate-300 hover:text-white transition font-medium">
              Pricing
            </a>
            <a href="/opt-out" className="text-slate-400 hover:text-white transition">
              Opt-Out
            </a>
            {wallet && wallet.creditsRemaining > 0 ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-semibold tabular-nums">
                <Coins className="w-3.5 h-3.5" />
                {wallet.creditsRemaining} Credits Left
              </span>
            ) : (
              <a
                href="/pricing"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.1] text-white text-xs font-semibold transition"
              >
                Get Pass <ArrowRight className="w-3.5 h-3.5" />
              </a>
            )}
          </nav>
        </div>
      </header>

      <main className="relative z-10 flex-1 max-w-6xl mx-auto w-full px-6 pt-14 pb-24">
        <div className="text-center space-y-5 max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-medium shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Global Number Intelligence, Carrier & Risk Lookup</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.08]">
            Know who’s behind{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-300 bg-clip-text text-transparent">
              any phone number.
            </span>
          </h1>

          <p className="text-slate-400 max-w-xl mx-auto text-base sm:text-lg leading-relaxed">
            Pick a country flag & dial code or enter a full international number to inspect
            carrier routing, line type, spam risk, and registered subscriber records in seconds.
          </p>
        </div>

        <form onSubmit={(e) => handleSearch(e)} className="max-w-2xl mx-auto">
          <div className="p-1.5 rounded-2xl bg-gradient-to-r from-indigo-500/30 via-sky-500/20 to-indigo-500/30 shadow-2xl shadow-indigo-950/50">
            <div className="flex flex-col sm:flex-row gap-2.5 p-1.5 bg-[#0c1120]/95 backdrop-blur-xl rounded-[13px]">
              <div className="flex items-center flex-1 min-w-0">
                <div ref={pickerRef} className="relative shrink-0">
                  <button
                    type="button"
                    aria-label="Select country code"
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-2 bg-white/[0.05] hover:bg-white/[0.09] text-white text-sm font-medium px-3 py-2.5 rounded-xl border border-white/[0.08] focus:outline-none focus:border-indigo-400 cursor-pointer tabular-nums transition"
                  >
                    <CountryFlag iso={selectedCountry.iso} name={selectedCountry.name} />
                    <span>{selectedCountry.dialCode}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute left-0 mt-2 w-72 max-h-80 rounded-2xl bg-[#0b101f] border border-white/[0.12] shadow-2xl z-40 flex flex-col overflow-hidden">
                      <div className="p-2 border-b border-white/[0.08]">
                        <input
                          type="text"
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          placeholder="Search all countries or +code..."
                          className="w-full px-3 py-2 rounded-lg bg-white/[0.05] text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        />
                      </div>
                      <div className="overflow-y-auto divide-y divide-white/[0.04]">
                        {filteredCountries.length > 0 ? (
                          filteredCountries.map((c) => (
                            <button
                              key={`${c.iso}-${c.name}`}
                              type="button"
                              onClick={() => {
                                setSelectedCountry(c);
                                setDropdownOpen(false);
                                setCountrySearch('');
                              }}
                              className="w-full px-3.5 py-2.5 flex items-center justify-between text-left text-xs hover:bg-white/[0.07] transition cursor-pointer"
                            >
                              <span className="flex items-center gap-2.5 text-slate-200 truncate">
                                <CountryFlag iso={c.iso} name={c.name} />
                                <span className="truncate">{c.name}</span>
                              </span>
                              <span className="font-semibold text-indigo-300 tabular-nums ml-2 shrink-0">
                                {c.dialCode}
                              </span>
                            </button>
                          ))
                        ) : (
                          <div className="p-4 text-center text-xs text-slate-500">
                            No matching country found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center flex-1 px-3 min-w-0">
                  <PhoneCall className="w-4 h-4 text-indigo-400 mr-2.5 shrink-0" />
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder={
                      selectedCountry.dialCode === '+355' ? '69 200 1234' : '212 555 0199'
                    }
                    className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none text-base sm:text-lg py-2 tabular-nums min-w-0"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-sky-500 disabled:opacity-50 text-white font-semibold px-7 py-3.5 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/25 cursor-pointer shrink-0"
              >
                {loading ? (
                  <>
                    <Radar className="w-4 h-4 animate-spin" />
                    <span>Scanning...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Search Number</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span>Try sample:</span>
            {SAMPLE_NUMBERS.map((sample) => (
              <button
                key={`${sample.iso}-${sample.localNumber}`}
                type="button"
                onClick={() => handleSampleClick(sample)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.08] text-slate-300 transition cursor-pointer tabular-nums"
              >
                <CountryFlag iso={sample.iso} name={sample.label} />
                <span>{sample.label}:</span>
                <span className="text-indigo-300">
                  {sample.dialCode} {sample.localNumber}
                </span>
              </button>
            ))}
          </div>

          {loading && (
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-full py-2 px-4 max-w-md mx-auto">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              <span>{SCAN_STAGES[scanStageIndex]}</span>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-sm text-rose-300 flex items-center gap-2 justify-center max-w-xl mx-auto">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </form>

        {result && (
          <div className="mt-12 bg-[#0c1120]/90 backdrop-blur-xl border border-white/[0.09] rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 sm:px-8 border-b border-white/[0.07] flex flex-wrap items-center justify-between gap-4 bg-white/[0.02]">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 border border-indigo-400/25 flex items-center justify-center text-indigo-300">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-widest text-indigo-400 font-semibold">
                    Intelligence Dossier
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white tabular-nums tracking-tight">
                    {result.e164}
                  </h2>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {wallet && wallet.creditsRemaining > 0 && (
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-300 border border-sky-400/25 flex items-center gap-1.5 tabular-nums">
                    <Coins className="w-3.5 h-3.5 text-sky-400" />
                    {wallet.creditsRemaining} Credits Available
                  </span>
                )}
                <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Verified Line · {result.lineType}
                </span>
              </div>
            </div>

            {paymentStatusMessage && (
              <div className="mx-6 sm:mx-8 mt-6 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-400/25 text-xs sm:text-sm text-emerald-200 flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{paymentStatusMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 sm:px-8 border-b border-white/[0.07]">
              <div className="bg-[#060913]/80 p-4 rounded-2xl border border-white/[0.06]">
                <p className="text-xs uppercase tracking-wider text-slate-500 font-medium">
                  Carrier / Network
                </p>
                <p className="font-semibold text-white mt-1.5 text-base">{result.carrier}</p>
              </div>

              <div className="bg-[#060913]/80 p-4 rounded-2xl border border-white/[0.06]">
                <p className="text-xs uppercase tracking-wider text-slate-500 font-medium">
                  Region / Country
                </p>
                <p className="font-semibold text-white mt-1.5 text-base">{result.location}</p>
              </div>

              <div className="bg-[#060913]/80 p-4 rounded-2xl border border-white/[0.06]">
                <p className="text-xs uppercase tracking-wider text-slate-500 font-medium">
                  Spam & Fraud Risk
                </p>
                <p
                  className={`font-semibold mt-1.5 text-base ${
                    result.spamRisk === 'High'
                      ? 'text-rose-400'
                      : result.spamRisk === 'Medium'
                      ? 'text-amber-300'
                      : 'text-emerald-400'
                  }`}
                >
                  {result.spamRisk} Risk
                </p>
              </div>
            </div>

            <div className="p-6 sm:px-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Extended Telecom & Directory Dossier
                </h3>
                <span className="text-xs text-slate-500">
                  {unlocked ? 'Full report unlocked' : 'Protected preview'}
                </span>
              </div>

              <div
                className={`rounded-2xl border border-white/[0.07] bg-[#060913]/70 divide-y divide-white/[0.06] px-5 ${
                  !unlocked ? 'select-none blur-[5px] opacity-55 pointer-events-none' : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-1">
                  <span className="text-sm text-slate-400">Subscriber Directory Status</span>
                  <span className="font-semibold text-white">{result.ownerName}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-1">
                  <span className="text-sm text-slate-400">National Format & Contact Clues</span>
                  <span className="font-semibold text-white">{result.ownerEmail}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-1">
                  <span className="text-sm text-slate-400">Registered Telecom Region</span>
                  <span className="font-semibold text-white">{result.ownerAddress}</span>
                </div>
              </div>

              {!unlocked && (
                <div className="mt-6 p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-indigo-950/45 via-[#090e1c] to-[#060913] border border-indigo-400/25 space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-left border-b border-white/[0.07] pb-5">
                    <div className="flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 border border-indigo-400/25 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-indigo-300">
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>One-Time Pass Selection · No Recurring Billing</span>
                        </div>
                        <h4 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                          Select a Pass to Reveal Dossier for{' '}
                          <span className="text-indigo-300 tabular-nums">{result.e164}</span>
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-400 mt-1">
                          Unlock this subscriber record immediately and keep extra credits for future
                          lookups—pay once, use anytime.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-300 bg-white/[0.04] border border-white/[0.08] px-3 py-2 rounded-xl shrink-0">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Instant Unblur · Paddle Secured</span>
                    </div>
                  </div>

                  {/* If the user already has credits from an earlier checkout in this browser */}
                  {hasCreditForCurrentNumber && wallet && (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="text-left">
                        <p className="text-sm font-bold text-emerald-200">
                          Active Pass Detected: {wallet.planLabel} ({wallet.creditsRemaining}{' '}
                          credits remaining)
                        </p>
                        <p className="text-xs text-emerald-300/80 mt-0.5">
                          Reveal {result.e164} right now with 1 credit—no payment modal needed.
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={verifyingPayment}
                        onClick={handleUseCreditUnlock}
                        className="px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs sm:text-sm transition cursor-pointer shrink-0 disabled:opacity-50"
                      >
                        {verifyingPayment ? 'Unlocking...' : 'Unlock with 1 Credit'}
                      </button>
                    </div>
                  )}

                  {/* Interactive Side-by-Side Pass Cards */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-left">
                    {/* Standard Pass ($7.95 · 4 Credits) */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedPlan('single')}
                      onKeyDown={(e) => e.key === 'Enter' && setSelectedPlan('single')}
                      className={`rounded-2xl p-6 border transition flex flex-col justify-between cursor-pointer ${
                        selectedPlan === 'single'
                          ? 'bg-[#0f172e] border-indigo-400 shadow-lg shadow-indigo-950/60'
                          : 'bg-[#060913]/75 border-white/[0.08] hover:border-white/[0.18]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                            Standard Pass
                          </span>
                          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/[0.08] tabular-nums">
                            ~$1.99 / lookup
                          </span>
                        </div>

                        <div className="mt-3 flex items-baseline gap-2.5">
                          <span className="text-3xl sm:text-4xl font-extrabold text-white tabular-nums">
                            $7.95
                          </span>
                          <span className="text-xs font-semibold text-indigo-300">
                            one-time · 4 full credits
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                          Ideal for checking a couple of unknown callers, texts, or profiles with
                          zero recurring charges.
                        </p>

                        <ul className="mt-4 space-y-2 text-xs text-slate-300 border-t border-white/[0.06] pt-4">
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span>Unlocks {result.e164} + 3 extra report credits</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span>Directory status, national format & regional routing</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span>Never auto-renews into a monthly bill</span>
                          </li>
                        </ul>
                      </div>

                      <button
                        type="button"
                        disabled={checkoutOpening !== null || verifyingPayment}
                        onClick={(e) => {
                          e.stopPropagation();
                          openPaddleCheckout('single');
                        }}
                        className={`mt-6 w-full py-3.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 ${
                          selectedPlan === 'single'
                            ? 'bg-white text-slate-950 hover:bg-slate-200'
                            : 'bg-white/[0.07] text-white hover:bg-white/[0.12] border border-white/[0.1]'
                        }`}
                      >
                        <Lock className="w-4 h-4" />
                        <span>
                          {checkoutOpening === 'single'
                            ? 'Opening Secure Checkout...'
                            : 'Unlock Now — Standard ($7.95)'}
                        </span>
                      </button>
                    </div>

                    {/* Premium Pass ($15.95 · 12 Credits) */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedPlan('pro')}
                      onKeyDown={(e) => e.key === 'Enter' && setSelectedPlan('pro')}
                      className={`relative rounded-2xl p-6 border transition flex flex-col justify-between cursor-pointer ${
                        selectedPlan === 'pro'
                          ? 'bg-gradient-to-b from-indigo-950/75 via-[#0d152c] to-[#080d1b] border-sky-400 shadow-xl shadow-indigo-950/70'
                          : 'bg-[#060913]/75 border-white/[0.08] hover:border-white/[0.18]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-sky-300">
                          Premium Pass
                        </span>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-sky-400/20 to-indigo-400/20 text-sky-200 border border-sky-400/35 tabular-nums">
                          Best Value · $1.33 / lookup
                        </span>
                      </div>

                      <div>
                        <div className="mt-3 flex items-baseline gap-2.5">
                          <span className="text-3xl sm:text-4xl font-extrabold text-white tabular-nums">
                            $15.95
                          </span>
                          <span className="text-xs font-semibold text-sky-300">
                            one-time · 12 full credits
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                          Save 33% per report vs. Standard Pass—built for dating checks, marketplace
                          vetting, and ongoing number screening.
                        </p>

                        <ul className="mt-4 space-y-2 text-xs text-slate-200 border-t border-white/[0.08] pt-4">
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                            <span>Unlocks {result.e164} + 11 extra report credits</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                            <span>3x more lookups for only $8.00 more</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                            <span>One-time payment · Instant dossier reveal</span>
                          </li>
                        </ul>
                      </div>

                      <button
                        type="button"
                        disabled={checkoutOpening !== null || verifyingPayment}
                        onClick={(e) => {
                          e.stopPropagation();
                          openPaddleCheckout('pro');
                        }}
                        className="mt-6 w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 via-sky-500 to-indigo-500 hover:brightness-110 text-white text-sm font-extrabold flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>
                          {checkoutOpening === 'pro'
                            ? 'Opening Secure Checkout...'
                            : verifyingPayment
                            ? 'Verifying Payment...'
                            : 'Unlock Now — Premium ($15.95)'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Comparison Strip */}
                  <div className="rounded-xl bg-white/[0.03] border border-white/[0.07] px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
                      <span>
                        <strong className="text-slate-200">Standard ($7.95):</strong> 4 credits (~$1.99 each)
                      </span>
                      <span>
                        <strong className="text-sky-300">Premium ($15.95):</strong> 12 credits (~$1.33 each · 33% lower cost per lookup)
                      </span>
                    </div>
                    <span className="text-slate-400">Single charge via Paddle · No subscription</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <section id="workflow" className="mt-24 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
                Telecom Verification Workflow
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-2">
                How to Check a Phone Number with Numora
              </h2>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Investigate unknown calls, texts, and profiles in three structured steps—right in your
              browser with no app download required.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {WORKFLOW_STEPS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="rounded-3xl bg-[#0c1120]/85 border border-white/[0.08] hover:border-indigo-400/30 p-6 sm:p-7 flex flex-col justify-between transition shadow-xl"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-5">
                      <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-400/20 tabular-nums">
                        {item.step}
                      </span>
                      <span className="text-xs font-medium text-sky-300">{item.badge}</span>
                    </div>

                    <div className="w-11 h-11 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-indigo-300 mb-4">
                      <Icon className="w-5 h-5" />
                    </div>

                    <h3 className="text-xl font-bold text-white leading-snug">{item.title}</h3>
                    <p className="text-sm text-slate-400 mt-2.5 leading-relaxed">{item.description}</p>
                  </div>

                  <div className="mt-6 pt-5 border-t border-white/[0.07] space-y-2.5">
                    {item.bullets.map((b) => (
                      <div key={b.label} className="flex items-center justify-between text-xs gap-2">
                        <span className="text-slate-500">{b.label}</span>
                        <span className="font-semibold text-slate-200 text-right">{b.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="px-5 py-4 rounded-2xl bg-white/[0.025] border border-white/[0.07] flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="text-xs text-slate-300">
                <strong className="text-white">Privacy First:</strong> Opt-out numbers are respected
                and suppressed.
              </p>
            </div>
            <div className="px-5 py-4 rounded-2xl bg-white/[0.025] border border-white/[0.07] flex items-center gap-3">
              <Zap className="w-4 h-4 text-sky-400 shrink-0" />
              <p className="text-xs text-slate-300">
                <strong className="text-white">Instant Results:</strong> Direct browser lookups with
                Supabase caching.
              </p>
            </div>
            <div className="px-5 py-4 rounded-2xl bg-white/[0.025] border border-white/[0.07] flex items-center gap-3">
              <Globe className="w-4 h-4 text-indigo-400 shrink-0" />
              <p className="text-xs text-slate-300">
                <strong className="text-white">No App Required:</strong> Works smoothly across
                desktop & mobile web.
              </p>
            </div>
          </div>
        </section>

        <section id="forensics" className="mt-24 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
                Telecom Forensics · Signal Breakdown
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-2">
                What Can Numora Reveal About a Phone Number?
              </h2>
              <p className="text-sm sm:text-base text-slate-400 mt-2.5 leading-relaxed">
                Every phone number carries routing, carrier, and reputation signals. Numora organizes
                line metadata and risk indicators into clear fields before you decide to reply or
                trust an unknown caller.
              </p>
            </div>

            <div className="inline-flex flex-wrap gap-1.5 p-1.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] self-start">
              {[
                { key: 'all', label: 'All Signals' },
                { key: 'carrier', label: 'Carrier & Line' },
                { key: 'risk', label: 'Risk & VoIP' },
                { key: 'identity', label: 'Subscriber & Context' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setForensicsFilter(tab.key as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    forensicsFilter === tab.key
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleModules.map((mod) => {
              const Icon = mod.icon;
              return (
                <div
                  key={mod.id}
                  className="rounded-3xl bg-[#0c1120]/80 border border-white/[0.08] hover:border-sky-400/25 p-6 flex flex-col justify-between transition"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="text-[11px] font-bold tracking-wider text-sky-300 uppercase">
                        {mod.tag}
                      </span>
                      <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-sky-300">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-white">{mod.title}</h3>
                    <p className="text-xs font-medium text-indigo-300/90 mt-1">{mod.subtitle}</p>
                    <p className="text-sm text-slate-400 mt-3 leading-relaxed">{mod.description}</p>

                    {mod.pills && (
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {mod.pills.map((pill) => (
                          <span
                            key={pill}
                            className="text-[11px] px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.07] text-slate-300"
                          >
                            {pill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-4 border-t border-white/[0.07] space-y-2">
                    {mod.specs.map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between text-xs gap-2">
                        <span className="text-slate-500">{k}</span>
                        <span className="font-medium text-slate-200 text-right">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-24 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                Everyday Investigations
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-2">
                Who Uses Numora?
              </h2>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Built for people who want fast carrier, line-type, and risk context before calling back,
              messaging, or sharing personal details.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {USE_CASES.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => setActiveUseCase(u.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  activeUseCase === u.id
                    ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-200'
                    : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white'
                }`}
              >
                {u.label}
              </button>
            ))}
          </div>

          <div className="rounded-3xl bg-[#0c1120]/90 border border-white/[0.09] p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center shadow-xl">
            <div className="lg:col-span-7 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-xs font-semibold">
                {React.createElement(currentUseCase.icon, { className: 'w-3.5 h-3.5' })}
                <span>{currentUseCase.badge}</span>
              </div>
              <h3 className="text-2xl font-bold text-white">{currentUseCase.title}</h3>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                {currentUseCase.description}
              </p>
            </div>

            <div className="lg:col-span-5 rounded-2xl bg-[#060913]/80 border border-white/[0.07] p-5 space-y-3">
              {currentUseCase.points.map(([label, val]) => (
                <div
                  key={label}
                  className="flex items-center justify-between text-xs sm:text-sm py-1.5 border-b last:border-b-0 border-white/[0.06]"
                >
                  <span className="text-slate-400">{label}</span>
                  <span className="font-semibold text-white">{val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-amber-500/[0.06] border border-amber-400/20 p-5 flex items-start gap-3.5 text-xs text-slate-300 leading-relaxed">
            <Scale className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
            <p>
              <strong className="text-amber-200">Important Boundary:</strong> Numora provides
              informational phone lookup and risk context only. It is not a consumer reporting
              agency under the Fair Credit Reporting Act (FCRA) and must not be used for credit,
              employment, insurance, or tenant screening decisions.
            </p>
          </div>
        </section>
      </main>

      <footer
        id="compliance"
        className="relative z-10 border-t border-white/[0.07] bg-[#050811]/90 py-10 px-6 text-center text-xs text-slate-500 space-y-3.5"
      >
        <div className="flex flex-wrap justify-center gap-6 text-slate-400 font-medium">
          <a href="/pricing" className="hover:text-white transition">
            Pricing
          </a>
          <a href="/terms" className="hover:text-white transition">
            Terms & Refund Policy
          </a>
          <a href="/privacy" className="hover:text-white transition">
            Privacy Policy
          </a>
          <a href="/opt-out" className="hover:text-white transition">
            Do Not Sell / Remove My Info
          </a>
        </div>
        <p className="text-slate-400">© 2026 Numora Intelligence. All rights reserved.</p>
        <p className="max-w-2xl mx-auto leading-relaxed text-slate-500">
          Disclaimer: Numora is not a Consumer Reporting Agency under the Fair Credit Reporting Act
          (FCRA) and may not be used for employment, tenant screening, or credit decisions.
        </p>
      </footer>
    </div>
  );
}




