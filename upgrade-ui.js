const fs = require('fs');
const path = require('path');

const pageContent = `'use client';

import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';

const SAMPLE_NUMBERS = [
  { label: 'US Line', value: '+1 212 555 0199' },
  { label: 'UK Mobile', value: '+44 7911 123456' },
  { label: 'AL Mobile', value: '+355 69 200 1234' },
];

const SCAN_STAGES = [
  'Validating international numbering plan...',
  'Querying carrier registry & line routing...',
  'Evaluating fraud & VoIP risk signals...',
];

export default function NumoraHome() {
  const [paddle, setPaddle] = useState<Paddle>();
  const [phoneInput, setPhoneInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanStageIndex, setScanStageIndex] = useState(0);
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
  }, []);

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

  const runLookup = async (targetNumber: string, txId?: string) => {
    setError('');
    setLoading(true);

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
        setUnlocked(data.unlocked);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent, txId?: string) => {
    if (e) e.preventDefault();
    await runLookup(phoneInput, txId);
  };

  const handleSampleClick = async (sampleValue: string) => {
    setPhoneInput(sampleValue);
    await runLookup(sampleValue);
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
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col relative overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Ambient Radial & Grid Backdrop */}
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

      {/* Sticky Glass Header */}
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
            <span className="hidden sm:inline-flex items-center gap-1.5 text-slate-400">
              <Globe className="w-4 h-4 text-sky-400" /> 200+ Countries
            </span>
            <a href="/pricing" className="text-slate-300 hover:text-white transition font-medium">
              Pricing
            </a>
            <a href="/opt-out" className="text-slate-400 hover:text-white transition">
              Opt-Out
            </a>
            <a
              href="/pricing"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.1] text-white text-xs font-semibold transition"
            >
              Get Pro <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-5xl mx-auto w-full px-6 pt-14 pb-20">
        {/* Hero Header */}
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
            Search any international mobile or landline number to inspect carrier routing, line type,
            spam risk, and registered subscriber records in seconds.
          </p>
        </div>

        {/* Elevated Search Box */}
        <form onSubmit={(e) => handleSearch(e)} className="max-w-2xl mx-auto">
          <div className="p-1.5 rounded-2xl bg-gradient-to-r from-indigo-500/30 via-sky-500/20 to-indigo-500/30 shadow-2xl shadow-indigo-950/50">
            <div className="flex flex-col sm:flex-row gap-2.5 p-1.5 bg-[#0c1120]/95 backdrop-blur-xl rounded-[13px]">
              <div className="flex items-center flex-1 px-3.5">
                <PhoneCall className="w-5 h-5 text-indigo-400 mr-3 shrink-0" />
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="+1 212 555 0199 or +44 7911 123456"
                  className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none text-base sm:text-lg py-2.5 tabular-nums"
                  required
                />
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

          {/* Sample Pills */}
          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span>Try sample:</span>
            {SAMPLE_NUMBERS.map((sample) => (
              <button
                key={sample.value}
                type="button"
                onClick={() => handleSampleClick(sample.value)}
                className="px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.08] text-slate-300 transition cursor-pointer tabular-nums"
              >
                {sample.label}: <span className="text-indigo-300">{sample.value}</span>
              </button>
            ))}
          </div>

          {/* Scanning Progress Pill */}
          {loading && (
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-full py-2 px-4 max-w-md mx-auto">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              <span>{SCAN_STAGES[scanStageIndex]}</span>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-sm text-rose-300 flex items-center gap-2 justify-center max-w-xl mx-auto">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </form>

        {/* Lookup Result Card */}
        {result && (
          <div className="mt-12 bg-[#0c1120]/90 backdrop-blur-xl border border-white/[0.09] rounded-3xl overflow-hidden shadow-2xl">
            {/* Result Top Bar */}
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

              <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Verified Line · {result.lineType}
              </span>
            </div>

            {/* Free Metadata Strip */}
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
                  className={\`font-semibold mt-1.5 text-base \${
                    result.spamRisk === 'High'
                      ? 'text-rose-400'
                      : result.spamRisk === 'Medium'
                      ? 'text-amber-300'
                      : 'text-emerald-400'
                  }\`}
                >
                  {result.spamRisk} Risk
                </p>
              </div>
            </div>

            {/* Locked / Unlocked Subscriber Section */}
            <div className="p-6 sm:px-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Registered Subscriber Details
                </h3>
                <span className="text-xs text-slate-500">
                  {unlocked ? 'Full report unlocked' : 'Protected preview'}
                </span>
              </div>

              <div
                className={\`rounded-2xl border border-white/[0.07] bg-[#060913]/70 divide-y divide-white/[0.06] px-5 \${
                  !unlocked ? 'select-none blur-[5px] opacity-55 pointer-events-none' : ''
                }\`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-1">
                  <span className="text-sm text-slate-400">Full Legal Name</span>
                  <span className="font-semibold text-white">{result.ownerName}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-1">
                  <span className="text-sm text-slate-400">Associated Email</span>
                  <span className="font-semibold text-white">{result.ownerEmail}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-1">
                  <span className="text-sm text-slate-400">Registered Address</span>
                  <span className="font-semibold text-white">{result.ownerAddress}</span>
                </div>
              </div>

              {/* Paywall Conversion Card */}
              {!unlocked && (
                <div className="mt-6 p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-indigo-950/40 via-[#090e1c] to-[#060913] border border-indigo-400/25 text-center space-y-5">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 border border-indigo-400/25 text-indigo-300 flex items-center justify-center mx-auto">
                    <Lock className="w-5 h-5" />
                  </div>

                  <div className="max-w-md mx-auto">
                    <h4 className="text-xl font-bold text-white">
                      Unlock Full Subscriber Report
                    </h4>
                    <p className="text-sm text-slate-400 mt-1.5">
                      Reveal the registered name, linked email, and location profile for{' '}
                      <span className="text-slate-200 font-medium tabular-nums">{result.e164}</span>.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3.5 max-w-lg mx-auto pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        openPaddleCheckout(
                          process.env.NEXT_PUBLIC_PADDLE_SINGLE_PRICE_ID!,
                          'single_report'
                        )
                      }
                      className="group p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-left transition cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-400">Single Report</span>
                        <span className="text-[11px] text-slate-500">One-time</span>
                      </div>
                      <div className="text-2xl font-extrabold text-white mt-1 tabular-nums">
                        $4.99
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openPaddleCheckout(
                          process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID!,
                          'pro_subscription'
                        )
                      }
                      className="group p-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-sky-500 text-left transition shadow-lg shadow-indigo-600/25 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-indigo-100">Numora Pro</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/15 text-white font-medium">
                          Unlimited
                        </span>
                      </div>
                      <div className="text-2xl font-extrabold text-white mt-1 tabular-nums">
                        $29.99<span className="text-xs font-normal text-indigo-100"> / mo</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Value Strip Below Search */}
        <section className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bg-white/[0.025] border border-white/[0.07] space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-white">International E.164 Parsing</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Automatically formats and validates global country codes, carriers, and line types before
              running a query.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.025] border border-white/[0.07] space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-400/20 text-sky-300 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-white">Risk & VoIP Signals</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Spot high-risk lines, virtual/VoIP numbers, and suspicious activity before replying or
              transacting.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.025] border border-white/[0.07] space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-white">Instant Cached Results</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Backed by fast caching and one-click privacy suppression for individuals requesting
              opt-out.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
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
`;

fs.writeFileSync(path.join(process.cwd(), 'src/app/page.tsx'), pageContent, 'utf8');
console.log('Upgraded src/app/page.tsx UI successfully!');