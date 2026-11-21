const fs = require('fs');
const path = require('path');

const pricingPageContent = `'use client';

import React, { useEffect, useState } from 'react';
import { initializePaddle, Paddle } from '@paddle/paddle-js';
import {
  ShieldCheck,
  Sparkles,
  Check,
  X,
  ArrowRight,
  ChevronDown,
  Wallet,
  Lock,
  Zap,
  Globe,
} from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'How do credits work on one-time passes?',
    answer:
      'Your pass gives you a set credit balance for one-time lookups without automatic monthly renewals. Standard lookups use fewer credits for core carrier, line-type, and risk signals, while full dossier unlocks use more credits when available.',
  },
  {
    question: 'Will the person I search know they were looked up?',
    answer:
      'No. Lookups are queried through Numora’s backend and never send a notification, SMS, or alert to the target phone number.',
  },
  {
    question: 'Is this a recurring monthly subscription?',
    answer:
      'One-time passes on this page are single payments with no automatic monthly renewal. If you ever want a recurring plan later, it would be clearly labeled as a subscription.',
  },
  {
    question: 'How long do purchased pass credits stay active?',
    answer:
      'One-time pass credits remain valid for 30 days from purchase so you can run your initial lookup right away and use any remaining balance over the next month.',
  },
  {
    question: 'Can I request opt-out or removal for my own number?',
    answer:
      'Yes. Visit the Opt-Out page in the header or footer to submit a suppression request for your phone number.',
  },
];

const COMPARISON_ROWS = [
  {
    feature: 'Billing Model',
    standard: 'One-Time Payment',
    premium: 'One-Time Payment',
  },
  {
    feature: 'Credit Allocation',
    standard: '4 Credits Included',
    premium: '12 Credits (3x Value)',
  },
  {
    feature: 'Effective Cost per 4-Credit Pack',
    standard: '$7.95',
    premium: '$5.32 per 4 credits (Save 33%)',
  },
  {
    feature: 'Carrier, Line Type & Risk Check',
    standard: 'Included',
    premium: 'Included',
  },
  {
    feature: 'Subscriber Name, Email & Address (When Available)',
    standard: 'Included',
    premium: 'Expanded Dossier Access',
  },
  {
    feature: '30-Day Credit Validity',
    standard: '30 Days',
    premium: '30 Days',
  },
  {
    feature: 'Opt-Out & Privacy Protection',
    standard: 'Supported',
    premium: 'Supported',
  },
];

const TYPICAL_SITE_CONS = [
  'Lures visitors with a low-cost trial that converts into recurring monthly charges',
  'Makes cancellation harder than signing up',
  'Relies on dated directory snapshots with unclear risk context',
  'Pushes aggressive upsells at every step',
];

const NUMORA_GUARANTEES = [
  'Transparent one-time pass pricing with zero surprise recurring renewals',
  'Clear upfront breakdown of what is free vs. what is unlocked',
  '200+ country code support and fast browser-based lookup experience',
  'Built-in opt-out / suppression workflow and clear non-FCRA terms',
];

export default function PricingPage() {
  const [paddle, setPaddle] = useState<Paddle>();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

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

  const handleCheckout = (priceId: string | undefined, planType: string) => {
    if (!paddle || !priceId) {
      alert(
        'Paddle checkout is not configured yet. Add NEXT_PUBLIC_PADDLE_CLIENT_TOKEN and your price IDs to .env.local to test checkout.'
      );
      return;
    }

    paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customData: {
        planType,
      },
    });
  };

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

      <header className="border-b border-white/[0.07] bg-[#060913]/75 sticky top-0 z-30 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-sky-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/25 group-hover:scale-[1.03] transition">
              N
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Numora</span>
          </a>

          <nav className="flex items-center gap-6 text-sm">
            <a href="/" className="text-slate-300 hover:text-white transition font-medium">
              Lookup
            </a>
            <a href="#comparison" className="hidden sm:inline text-slate-400 hover:text-white transition">
              Compare
            </a>
            <a href="#faq" className="hidden sm:inline text-slate-400 hover:text-white transition">
              FAQ
            </a>
            <a href="/opt-out" className="text-slate-400 hover:text-white transition">
              Opt-Out
            </a>
          </nav>
        </div>
      </header>

      <main className="relative z-10 flex-1 max-w-6xl mx-auto w-full px-6 pt-14 pb-24">
        <div className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Transparent One-Time Passes · Zero Hidden Subscriptions</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.08]">
            Simple, Honest Pricing.{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-300 bg-clip-text text-transparent">
              Pay Once When You Need It.
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Investigate a suspicious call, text, or profile without signing up for an unwanted
            monthly renewal. Choose a single one-time pass or a multi-credit pack valid for 30
            days.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-1 text-xs text-slate-300">
            <span className="px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" /> No Auto-Renewals
            </span>
            <span className="px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-sky-400" /> Instant Digital Access
            </span>
            <span className="px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-400" /> 30-Day Pass Window
            </span>
          </div>
        </div>

        <div className="mt-10 max-w-3xl mx-auto rounded-2xl bg-[#0c1120]/85 border border-white/[0.08] p-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5 text-slate-300">
            <Wallet className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="font-semibold text-white">How Credit Packs Work:</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400 tabular-nums">
            <span>
              <strong className="text-slate-200">1 Full Dossier Unlock</strong> = 4 Credits
            </span>
            <span className="hidden sm:inline text-white/15">|</span>
            <span>
              <strong className="text-slate-200">Standard Check</strong> = 1 Credit
            </span>
          </div>
        </div>

        <section className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-7 max-w-5xl mx-auto">
          <div className="rounded-3xl bg-[#0c1120]/85 border border-white/[0.09] p-7 sm:p-8 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Single Investigation
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-white/[0.05] text-slate-300 border border-white/[0.08]">
                  1-Time Pass
                </span>
              </div>

              <h2 className="text-2xl font-bold text-white mt-3">Standard Package</h2>
              <p className="text-sm text-slate-400 mt-1.5">
                Ideal for checking a single suspicious phone number or running a few quick lookups.
              </p>

              <div className="mt-6 pb-6 border-b border-white/[0.08] flex items-baseline gap-2">
                <span className="text-5xl font-extrabold text-white tabular-nums">$7.95</span>
                <span className="text-sm text-slate-400">/ one-time pass</span>
              </div>

              <div className="mt-5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-between text-xs">
                <span className="text-slate-400">Included Balance</span>
                <span className="font-bold text-indigo-300 tabular-nums">
                  4 Credits · 1 Full Unlock (or 4 Standard)
                </span>
              </div>

              <ul className="mt-6 space-y-3 text-sm text-slate-300">
                {[
                  '1 Full Subscriber Dossier unlock (or up to 4 standard checks)',
                  'Carrier, line type & spam/fraud risk breakdown',
                  'Registered name, linked email & address fields when available',
                  'Confidential lookup (searched number is never alerted)',
                  'Valid for 30 days from purchase',
                ].map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-4">
              <button
                type="button"
                onClick={() =>
                  handleCheckout(
                    process.env.NEXT_PUBLIC_PADDLE_SINGLE_PRICE_ID,
                    'standard_pass'
                  )
                }
                className="w-full py-3.5 px-5 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.12] text-white font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <span>Get Standard Package — $7.95</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-slate-500 text-center mt-2.5">
                Single payment · No recurring charges
              </p>
            </div>
          </div>

          <div className="rounded-3xl bg-gradient-to-b from-indigo-950/45 via-[#0c1120] to-[#090e1c] border border-indigo-400/35 p-7 sm:p-8 flex flex-col justify-between shadow-2xl shadow-indigo-950/40 relative">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                  Multi-Search Intelligence Pack
                </span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
                  Best Value · Save 33%
                </span>
              </div>

              <h2 className="text-2xl font-bold text-white mt-3">Premium Package</h2>
              <p className="text-sm text-slate-400 mt-1.5">
                Best when investigating multiple numbers or wanting lower per-lookup cost over 30
                days.
              </p>

              <div className="mt-6 pb-6 border-b border-white/[0.08] flex flex-wrap items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold text-white tabular-nums">$15.95</span>
                  <span className="text-sm text-slate-400">/ one-time pass</span>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 tabular-nums">
                  Save $7.90 vs. 3x Standard ($23.85)
                </span>
              </div>

              <div className="mt-5 p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-between text-xs">
                <span className="text-indigo-200">Included Balance</span>
                <span className="font-bold text-white tabular-nums">
                  12 Credits · 3 Full Unlocks (or 12 Standard)
                </span>
              </div>

              <ul className="mt-6 space-y-3 text-sm text-slate-200">
                {[
                  '3 Full Subscriber Dossier unlocks (or up to 12 standard checks)',
                  '33% lower unit cost ($5.32 per 4-credit block vs. $7.95)',
                  'Full carrier, line-type, VoIP & spam/fraud risk signals',
                  '100% confidential lookup (target is never notified)',
                  'Valid for 30 days from purchase · No auto-renewal',
                ].map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-4">
              <button
                type="button"
                onClick={() =>
                  handleCheckout(
                    process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID,
                    'premium_pass'
                  )
                }
                className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-sky-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/25 cursor-pointer"
              >
                <span>Get Premium Package — $15.95</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-indigo-200/75 text-center mt-2.5">
                One-time payment · Instant access · 30-day validity
              </p>
            </div>
          </div>
        </section>

        <section id="comparison" className="mt-24 max-w-5xl mx-auto space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
              Package Comparison Matrix
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-white mt-1.5">
              Compare Passes Side-by-Side
            </h2>
          </div>

          <div className="rounded-3xl bg-[#0c1120]/85 border border-white/[0.08] overflow-x-auto shadow-xl">
            <table className="w-full text-left border-collapse min-w-[540px]">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02] text-xs uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6 font-semibold">Feature</th>
                  <th className="py-4 px-6 font-semibold">Standard ($7.95)</th>
                  <th className="py-4 px-6 font-semibold text-indigo-300">Premium ($15.95)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-sm">
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.feature} className="hover:bg-white/[0.02] transition">
                    <td className="py-3.5 px-6 text-slate-300 font-medium">{row.feature}</td>
                    <td className="py-3.5 px-6 text-slate-400 tabular-nums">{row.standard}</td>
                    <td className="py-3.5 px-6 text-white font-semibold tabular-nums">
                      {row.premium}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-24 max-w-5xl mx-auto space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
              No Subscription Traps
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-white mt-1.5">
              Why Numora Uses One-Time Passes
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Most people only need to check a number once or twice—there’s no reason to force a
              hidden monthly charge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-3xl bg-[#0c1120]/70 border border-rose-500/20 p-6 sm:p-7 space-y-4">
              <h3 className="text-lg font-bold text-rose-300">Typical Lookup Sites</h3>
              <ul className="space-y-3 text-sm text-slate-400">
                {TYPICAL_SITE_CONS.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl bg-[#0c1120]/90 border border-emerald-500/25 p-6 sm:p-7 space-y-4">
              <h3 className="text-lg font-bold text-emerald-300">Numora Guarantee</h3>
              <ul className="space-y-3 text-sm text-slate-200">
                {NUMORA_GUARANTEES.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="faq" className="mt-24 max-w-3xl mx-auto space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
              Frequently Asked Questions
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-white mt-1.5">
              Clear Answers Before You Buy
            </h2>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={faq.question}
                  className="rounded-2xl bg-[#0c1120]/85 border border-white/[0.08] overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 text-sm font-semibold text-white hover:bg-white/[0.02] transition cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={\`w-4 h-4 text-slate-400 shrink-0 transition-transform \${
                        isOpen ? 'rotate-180 text-indigo-300' : ''
                      }\`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-white/[0.06] pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-24 max-w-4xl mx-auto rounded-3xl bg-gradient-to-r from-indigo-950/60 via-[#0c1120] to-sky-950/50 border border-indigo-400/25 p-8 sm:p-10 text-center space-y-5 shadow-2xl">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 border border-indigo-400/25 text-indigo-300 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Ready to Check a Number With Confidence?
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            Start with a free number search on the home page or choose a one-time pass above with
            zero recurring billing.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-1">
            <button
              type="button"
              onClick={() =>
                handleCheckout(
                  process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID,
                  'premium_pass'
                )
              }
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-sky-500 text-white font-semibold text-sm transition shadow-lg shadow-indigo-600/25 cursor-pointer"
            >
              Get Premium Pack — $15.95
            </button>
            <button
              type="button"
              onClick={() =>
                handleCheckout(
                  process.env.NEXT_PUBLIC_PADDLE_SINGLE_PRICE_ID,
                  'standard_pass'
                )
              }
              className="px-6 py-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.11] border border-white/[0.1] text-white font-semibold text-sm transition cursor-pointer"
            >
              Get Standard — $7.95
            </button>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/[0.07] bg-[#050811]/90 py-10 px-6 text-center text-xs text-slate-500 space-y-3.5">
        <div className="flex flex-wrap justify-center gap-6 text-slate-400 font-medium">
          <a href="/" className="hover:text-white transition">
            Lookup
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

const targetDir = path.join(process.cwd(), 'src/app/pricing');
fs.mkdirSync(targetDir, { recursive: true });
fs.writeFileSync(path.join(targetDir, 'page.tsx'), pricingPageContent, 'utf8');
console.log('Upgraded src/app/pricing/page.tsx successfully!');