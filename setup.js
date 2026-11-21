const fs = require('fs');
const path = require('path');

const files = {
  'src/lib/supabase.ts': `import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);`,

  'src/lib/phoneLookup.ts': `export interface PhoneReport {
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

export async function fetchGlobalPhoneData(e164: string, country: string): Promise<PhoneReport> {
  const apiKey = process.env.TRESTLE_API_KEY;

  if (!apiKey || apiKey === 'demo') {
    return {
      e164,
      country: country || 'International',
      carrier: 'Vodafone / Global Carrier',
      lineType: 'Mobile',
      location: 'Metro Area Registered',
      spamRisk: 'Low',
      ownerName: 'Alexander Vance',
      ownerEmail: 'a.vance88@gmail.com',
      ownerAddress: '742 Evergreen Terrace, Apt 4B',
    };
  }

  const response = await fetch(
    \`https://api.trestleiq.com/3.2/phone?phone=\${encodeURIComponent(e164)}\`,
    {
      headers: {
        'x-api-key': apiKey,
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch phone intelligence');
  }

  const data = await response.json();
  const primaryOwner = data.owners?.[0] || {};
  const primaryAddress = primaryOwner.current_addresses?.[0] || {};

  return {
    e164,
    country: data.country_calling_code || country,
    carrier: data.carrier || 'Unknown Carrier',
    lineType: data.line_type || 'Unknown',
    location: [primaryAddress.city, primaryAddress.state_code, primaryAddress.country_code]
      .filter(Boolean)
      .join(', ') || 'Location Verified',
    spamRisk: data.is_commercial ? 'Medium' : 'Low',
    ownerName: primaryOwner.name || 'Private / Unlisted Subscriber',
    ownerEmail: primaryOwner.emails?.[0]?.email_address || 'No public email linked',
    ownerAddress: primaryAddress.street_line_1
      ? \`\${primaryAddress.street_line_1}, \${primaryAddress.city || ''}\`
      : 'Address unlisted',
  };
}`,

  'src/app/api/lookup/route.ts': `import { NextRequest, NextResponse } from 'next/server';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { supabaseAdmin } from '@/lib/supabase';
import { fetchGlobalPhoneData } from '@/lib/phoneLookup';

export async function POST(req: NextRequest) {
  try {
    const { rawNumber, transactionId } = await req.json();

    const parsed = parsePhoneNumberFromString(rawNumber);
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

    let report;
    if (cached) {
      report = {
        e164: cached.e164_number,
        country: cached.country_code,
        carrier: cached.carrier,
        lineType: cached.line_type,
        location: \`\${cached.city || ''}, \${cached.state_region || ''}\`.replace(/^, |, $/g, '') || 'Verified Region',
        spamRisk: cached.spam_score > 50 ? 'High' : 'Low',
        ownerName: cached.owner_name,
        ownerEmail: cached.owner_email,
        ownerAddress: cached.owner_address,
      };
    } else {
      report = await fetchGlobalPhoneData(e164, parsed.country || 'INTL');
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
    return NextResponse.json({ error: err.message || 'Lookup failed' }, { status: 500 });
  }
}`,

  'src/app/api/webhooks/paddle/route.ts': `import { NextRequest, NextResponse } from 'next/server';
import { Environment, Paddle } from '@paddle/paddle-node-sdk';
import { supabaseAdmin } from '@/lib/supabase';

const paddle = new Paddle(process.env.PADDLE_API_KEY!, {
  environment:
    process.env.NEXT_PUBLIC_PADDLE_ENV === 'production'
      ? Environment.production
      : Environment.sandbox,
});

export async function POST(req: NextRequest) {
  const signature = req.headers.get('paddle-signature') || '';
  const rawBody = await req.text();
  const secretKey = process.env.PADDLE_NOTIFICATION_WEBHOOK_SECRET!;

  try {
    const eventData = await paddle.webhooks.unmarshal(rawBody, secretKey, signature);

    if (eventData.eventType === 'transaction.completed') {
      const tx = eventData.data;
      const customData = (tx.customData as Record<string, string>) || {};

      await supabaseAdmin.from('unlocked_reports').upsert({
        paddle_transaction_id: tx.id,
        customer_email: tx.customerId || 'customer@numora.io',
        e164_number: customData.searchedNumber || 'ALL',
        plan_type: customData.planType || 'single_report',
      });
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid Paddle webhook signature' }, { status: 400 });
  }
}`,

  'src/app/api/opt-out/route.ts': `import { NextRequest, NextResponse } from 'next/server';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { rawNumber, email, reason } = await req.json();

    const parsed = parsePhoneNumberFromString(rawNumber);
    if (!parsed || !parsed.isValid()) {
      return NextResponse.json(
        { error: 'Please enter a valid international phone number (e.g., +1 212 555 0199).' },
        { status: 400 }
      );
    }

    const e164 = parsed.number;

    await supabaseAdmin.from('opt_out_numbers').upsert({
      e164_number: e164,
      requester_email: email || null,
      reason: reason || 'User Privacy Opt-Out',
    });

    await supabaseAdmin.from('phone_cache').delete().eq('e164_number', e164);

    return NextResponse.json({
      success: true,
      message: \`\${e164} has been permanently suppressed from Numora search results.\`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Unable to process opt-out request.' }, { status: 500 });
  }
}`,

  'src/app/page.tsx': `'use client';

import React, { useEffect, useState } from 'react';
import { initializePaddle, Paddle } from '@paddle/paddle-js';
import { Search, ShieldCheck, Lock, Globe, PhoneCall, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function NumoraHome() {
  const [paddle, setPaddle] = useState<Paddle>();
  const [phoneInput, setPhoneInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN) {
      initializePaddle({
        environment:
          process.env.NEXT_PUBLIC_PADDLE_ENV === 'production' ? 'production' : 'sandbox',
        token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
        eventCallback: async (data) => {
          if (data.name === 'checkout.completed' && data.data?.transaction_id) {
            await handleSearch(undefined, data.data.transaction_id);
          }
        },
      }).then((paddleInstance) => {
        if (paddleInstance) setPaddle(paddleInstance);
      });
    }
  }, [phoneInput]);

  const handleSearch = async (e?: React.FormEvent, txId?: string) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawNumber: phoneInput, transactionId: txId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setResult(null);
      } else {
        setResult(data.report);
        setUnlocked(data.unlocked);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openPaddleCheckout = (priceId: string, planType: string) => {
    if (!paddle) {
      alert('Paddle is in setup mode. Add your NEXT_PUBLIC_PADDLE_CLIENT_TOKEN in .env.local');
      return;
    }

    paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customData: {
        searchedNumber: result?.e164 || phoneInput,
        planType,
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800/80 bg-slate-950/90 sticky top-0 z-30 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white">
              N
            </div>
            <span className="text-xl font-bold tracking-tight">Numora</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-400">
            <span className="hidden sm:inline-flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-indigo-400" /> 200+ Countries Covered
            </span>
            <a href="/pricing" className="hover:text-white transition">Pricing</a>
            <a href="/opt-out" className="hover:text-white transition">Opt-Out</a>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-16">
        <div className="text-center space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
            <ShieldCheck className="w-4 h-4" /> Global Caller Intelligence & Identity Lookup
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Find out who owns any phone number.
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-base sm:text-lg">
            Enter any mobile or landline number with its country code to uncover owner identity, carrier details, and spam risk worldwide.
          </p>
        </div>

        <form onSubmit={(e) => handleSearch(e)} className="max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3 p-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
            <div className="flex items-center flex-1 px-3">
              <PhoneCall className="w-5 h-5 text-slate-500 mr-3 shrink-0" />
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="+1 212 555 0199 or +44 7911 123456"
                className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none text-lg py-2"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold px-7 py-3.5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Search className="w-4 h-4" />
              {loading ? 'Scanning...' : 'Search Number'}
            </button>
          </div>
          {error && (
            <p className="mt-3 text-sm text-rose-400 flex items-center gap-1.5 justify-center">
              <AlertTriangle className="w-4 h-4" /> {error}
            </p>
          )}
        </form>

        {result && (
          <div className="mt-12 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-900/60">
              <div>
                <span className="text-xs uppercase tracking-wider text-indigo-400 font-semibold">
                  Record Located
                </span>
                <h2 className="text-2xl font-bold text-white mt-0.5">{result.e164}</h2>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active Line ({result.lineType})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 border-b border-slate-800">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <p className="text-xs text-slate-400">Carrier / Network</p>
                <p className="font-semibold text-white mt-1">{result.carrier}</p>
              </div>
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <p className="text-xs text-slate-400">Region / Country</p>
                <p className="font-semibold text-white mt-1">{result.location}</p>
              </div>
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <p className="text-xs text-slate-400">Spam / Fraud Risk</p>
                <p className="font-semibold text-emerald-400 mt-1">{result.spamRisk}</p>
              </div>
            </div>

            <div className="p-6 relative">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
                Registered Owner Intelligence
              </h3>

              <div className={\`space-y-4 \${!unlocked ? 'select-none blur-sm opacity-60' : ''}\`}>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Full Legal Name</span>
                  <span className="font-semibold text-white">{result.ownerName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Associated Email</span>
                  <span className="font-semibold text-white">{result.ownerEmail}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Registered Address</span>
                  <span className="font-semibold text-white">{result.ownerAddress}</span>
                </div>
              </div>

              {!unlocked && (
                <div className="mt-6 p-6 rounded-xl bg-gradient-to-b from-slate-900 to-slate-950 border border-indigo-500/30 text-center space-y-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Unlock Full Owner Report</h4>
                    <p className="text-sm text-slate-400 mt-1">
                      Reveal the owner’s full name, email address, and location history instantly.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 max-w-lg mx-auto pt-2">
                    <button
                      onClick={() =>
                        openPaddleCheckout(
                          process.env.NEXT_PUBLIC_PADDLE_SINGLE_PRICE_ID!,
                          'single_report'
                        )
                      }
                      className="p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition cursor-pointer"
                    >
                      <div className="text-xs text-slate-400">One-Time Report</div>
                      <div className="text-lg font-bold text-white">$4.99</div>
                    </button>

                    <button
                      onClick={() =>
                        openPaddleCheckout(
                          process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID!,
                          'pro_subscription'
                        )
                      }
                      className="p-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-left transition cursor-pointer"
                    >
                      <div className="text-xs text-indigo-200">Unlimited Lookups</div>
                      <div className="text-lg font-bold text-white">$29.99 / mo</div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer id="compliance" className="border-t border-slate-900 py-8 px-6 text-center text-xs text-slate-500 space-y-3">
        <div className="flex justify-center gap-6 text-slate-400">
          <a href="/pricing" className="hover:text-white">Pricing</a>
          <a href="/terms" className="hover:text-white">Terms & Refund Policy</a>
          <a href="/privacy" className="hover:text-white">Privacy Policy</a>
          <a href="/opt-out" className="hover:text-white">Do Not Sell / Remove My Info</a>
        </div>
        <p>© {new Date().getFullYear()} Numora Intelligence. All rights reserved.</p>
        <p className="max-w-2xl mx-auto">
          Disclaimer: Numora is not a Consumer Reporting Agency under the Fair Credit Reporting Act (FCRA) and may not be used for employment, tenant screening, or credit decisions.
        </p>
      </footer>
    </div>
  );
}`,

  'src/app/pricing/page.tsx': `'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { initializePaddle, Paddle } from '@paddle/paddle-js';
import { Check, ArrowLeft } from 'lucide-react';

export default function PricingPage() {
  const [paddle, setPaddle] = useState<Paddle>();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN) {
      initializePaddle({
        environment:
          process.env.NEXT_PUBLIC_PADDLE_ENV === 'production' ? 'production' : 'sandbox',
        token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
      }).then((instance) => {
        if (instance) setPaddle(instance);
      });
    }
  }, []);

  const handleCheckout = (priceId: string, planType: string) => {
    if (!paddle) {
      alert('Configure NEXT_PUBLIC_PADDLE_CLIENT_TOKEN to test live checkout.');
      return;
    }
    paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customData: { planType },
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Search
        </Link>

        <div className="text-center mb-14">
          <h1 className="text-4xl font-extrabold text-white">Simple, Transparent Pricing</h1>
          <p className="text-slate-400 mt-3 max-w-xl mx-auto">
            Pay only for a single phone intelligence report or unlock unlimited global lookups with Numora Pro.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Single Lookup Report</h2>
              <p className="text-sm text-slate-400 mt-1">One-time payment, no recurring fees.</p>
              <div className="my-6">
                <span className="text-4xl font-extrabold text-white">$4.99</span>
                <span className="text-slate-400 text-sm"> / report</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Full Registered Owner Name</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Associated Email & Location</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Carrier, Line Type & Fraud Risk Score</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Instant Digital Delivery</li>
              </ul>
            </div>
            <button
              onClick={() => handleCheckout(process.env.NEXT_PUBLIC_PADDLE_SINGLE_PRICE_ID!, 'single_report')}
              className="mt-8 w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-white transition cursor-pointer"
            >
              Buy Single Report
            </button>
          </div>

          <div className="bg-slate-900 border-2 border-indigo-500 rounded-2xl p-8 flex flex-col justify-between relative">
            <span className="absolute -top-3 right-6 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              MOST POPULAR
            </span>
            <div>
              <h2 className="text-xl font-bold text-white">Numora Pro Unlimited</h2>
              <p className="text-sm text-slate-400 mt-1">For investigators, businesses & frequent checks.</p>
              <div className="my-6">
                <span className="text-4xl font-extrabold text-white">$29.99</span>
                <span className="text-slate-400 text-sm"> / month</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Unlimited Global Phone Lookups</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Full Owner Name, Email & Address Data</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> 200+ Countries & VoIP Detection</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Cancel Anytime in 1 Click</li>
              </ul>
            </div>
            <button
              onClick={() => handleCheckout(process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID!, 'pro_subscription')}
              className="mt-8 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-white transition cursor-pointer"
            >
              Subscribe to Pro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}`,

  'src/app/terms/page.tsx': `import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 py-16 px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back to Numora
        </Link>
        <h1 className="text-3xl font-bold text-white">Terms of Service & Refund Policy</h1>
        <p className="text-xs text-slate-500">Last Updated: {new Date().toLocaleDateString()}</p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">1. Acceptance of Terms</h2>
          <p className="text-sm leading-relaxed">
            By accessing or using Numora ("Service"), you agree to be bound by these Terms of Service. Numora provides reverse phone number intelligence, carrier metadata, and publicly aggregated subscriber insights.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">2. Permitted Use & FCRA Disclaimer</h2>
          <p className="text-sm leading-relaxed">
            Numora is <strong>not</strong> a Consumer Reporting Agency as defined by the Fair Credit Reporting Act (FCRA). You strictly agree NOT to use Numora reports for employment screening, tenant or housing evaluation, credit decisions, insurance underwriting, stalking, harassment, or any unlawful purpose.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">3. Billing & Merchant of Record</h2>
          <p className="text-sm leading-relaxed">
            Our order process is conducted by our online reseller <strong>Paddle.com</strong>. Paddle.com is the Merchant of Record for all our orders, handles all customer service inquiries related to billing, and manages global sales tax/VAT compliance.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">4. Refund Policy</h2>
          <p className="text-sm leading-relaxed">
            Because Numora delivers instant digital intelligence reports upon purchase, single-report purchases are generally non-refundable once the unmasked report has been displayed. However, if a paid report fails to load due to a technical error or returns zero carrier/subscriber data, you may request a full refund within <strong>14 days</strong> of purchase by contacting support@numora.io or Paddle Buyer Support. Monthly subscriptions may be canceled at any time prior to the next billing cycle to prevent future charges.
          </p>
        </section>
      </div>
    </div>
  );
}`,

  'src/app/privacy/page.tsx': `import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 py-16 px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back to Numora
        </Link>
        <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
        <p className="text-xs text-slate-500">Last Updated: {new Date().toLocaleDateString()}</p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">1. Information We Collect</h2>
          <p className="text-sm leading-relaxed">
            When you use Numora, we process the phone numbers you query, basic technical logs (IP address, browser type) to prevent abuse, and transaction identifiers provided by our payment processor.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">2. Payment Processing (Paddle)</h2>
          <p className="text-sm leading-relaxed">
            We use <strong>Paddle.com</strong> as our Merchant of Record for payment processing. Numora does not store your credit card or banking details on our servers. Paddle’s collection and use of your payment data are governed by Paddle’s Privacy Policy.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">3. Your Privacy Rights & Data Opt-Out (GDPR / CCPA)</h2>
          <p className="text-sm leading-relaxed">
            Depending on your jurisdiction (including the EEA, UK, and California), you have the right to request access to, correction of, or deletion/suppression of your phone number from our lookup index. You can suppress your phone number immediately and free of charge using our{' '}
            <Link href="/opt-out" className="text-indigo-400 underline hover:text-indigo-300">
              Data Opt-Out & Number Removal Tool
            </Link>.
          </p>
        </section>
      </div>
    </div>
  );
}`,

  'src/app/opt-out/page.tsx': `'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldOff, CheckCircle2 } from 'lucide-react';

export default function OptOutPage() {
  const [rawNumber, setRawNumber] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch('/api/opt-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawNumber, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ type: 'error', msg: data.error });
      } else {
        setStatus({ type: 'success', msg: data.message });
        setRawNumber('');
      }
    } catch {
      setStatus({ type: 'error', msg: 'Submission failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-16 px-6">
      <div className="max-w-xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Numora
        </Link>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <ShieldOff className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Do Not Sell / Remove My Info</h1>
              <p className="text-xs text-slate-400">Instant Phone Number Suppression (GDPR & CCPA)</p>
            </div>
          </div>

          <p className="text-sm text-slate-400 leading-relaxed">
            Enter your phone number in international format below to permanently suppress it from appearing in Numora reverse phone lookup results. Requests are processed immediately at no cost.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Phone Number (with country code) *
              </label>
              <input
                type="tel"
                required
                value={rawNumber}
                onChange={(e) => setRawNumber(e.target.value)}
                placeholder="+1 212 555 0199"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Confirmation Email (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-white transition cursor-pointer"
            >
              {loading ? 'Processing Removal...' : 'Remove My Number Now'}
            </button>
          </form>

          {status && (
            <div
              className={\`p-4 rounded-xl text-sm flex items-start gap-2.5 \${
                status.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
              }\`}
            >
              {status.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />}
              <span>{status.msg}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}`,

  '.env.local': `NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
TRESTLE_API_KEY=demo
NEXT_PUBLIC_PADDLE_ENV=sandbox
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=
PADDLE_API_KEY=
PADDLE_NOTIFICATION_WEBHOOK_SECRET=
NEXT_PUBLIC_PADDLE_SINGLE_PRICE_ID=
NEXT_PUBLIC_PADDLE_PRO_PRICE_ID=`
};

for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join(process.cwd(), filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('Created:', filePath);
}

console.log('\\nAll Numora files created successfully!');