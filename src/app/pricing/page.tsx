'use client';

import { SiteHeader, SiteFooter } from "../../components/SiteChrome";
import React, { useEffect, useState } from 'react';
import { initializePaddle, Paddle } from '@paddle/paddle-js';
import {
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Lock,
  ArrowLeft,
  CreditCard,
  Scale,
} from 'lucide-react';

export default function PricingPage() {
  const [paddle, setPaddle] = useState<Paddle>();
  const [openingTier, setOpeningTier] = useState<'single' | 'pro' | null>(null);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN) {
      initializePaddle({
        environment:
          process.env.NEXT_PUBLIC_PADDLE_ENV === 'production' ? 'production' : 'sandbox',
        token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
        eventCallback: (event) => {
          const payload = (event as any)?.data;
          if (event?.name === 'checkout.completed' && payload?.transaction_id) {
            const planId =
              payload?.custom_data?.planId === 'single' ? 'single' : 'pro';
            const credits = planId === 'pro' ? 12 : 4;
            try {
              window.localStorage.setItem(
                'numora_pass_wallet_v1',
                JSON.stringify({
                  transactionId: String(payload.transaction_id),
                  planId,
                  planLabel:
                    planId === 'pro'
                      ? 'Premium Pass (12 Credits)'
                      : 'Standard Pass (4 Credits)',
                  creditsRemaining: credits,
                  unlockedNumbers: [],
                })
              );
            } catch {
              // ignore storage errors
            }
            setOpeningTier(null);
            setMessage(
              `Payment verified! ${credits} report credits are ready in your browser session. Return to the search page to unlock any dossier.`
            );
          } else if (event?.name === 'checkout.closed') {
            setOpeningTier(null);
          }
        },
      }).then((instance) => {
        if (instance) setPaddle(instance);
      });
    }
  }, []);

  const handleBuyPass = (plan: 'single' | 'pro') => {
    const priceId =
      plan === 'pro'
        ? process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID
        : process.env.NEXT_PUBLIC_PADDLE_SINGLE_PRICE_ID;

    if (!priceId || !paddle) {
      setMessage('Checkout is still initializing—please wait a moment and try again.');
      return;
    }

    setMessage('');
    setOpeningTier(plan);

    paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customData: {
        planId: plan,
        planType: plan === 'pro' ? 'pro_pass' : 'single_report',
      },
      settings: {
        displayMode: 'overlay',
        theme: 'dark',
        locale: 'en',
      },
    });
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-numora-grid text-slate-100">
      <SiteHeader />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-16 space-y-12 animate-fade-up">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-semibold">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Simple One-Time Passes · No Subscriptions</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Pay Once. Unlock Dossiers Anytime.
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            Every Numora Pass is a single one-time purchase with zero recurring monthly fees.
            Inspect carrier routing, virtual/VoIP line classification, regional telemetry, and
            available directory status across 200+ countries.
          </p>
        </div>

        {message && (
          <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 text-sm text-emerald-200 flex items-center justify-between gap-4 numora-card">
            <span>{message}</span>
            <a
              href="/"
              className="px-3.5 py-1.5 rounded-lg bg-emerald-400 text-slate-950 font-bold text-xs shrink-0"
            >
              Search Now
            </a>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Standard Pass */}
          <div className="rounded-3xl bg-[#0c1120] border border-white/[0.09] p-8 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Standard Pass
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/[0.06] text-slate-300 tabular-nums">
                  ~$1.99 / lookup
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-2.5">
                <span className="text-4xl sm:text-5xl font-extrabold text-white tabular-nums">
                  $7.95
                </span>
                <span className="text-xs font-semibold text-indigo-300">
                  one-time · 4 credits
                </span>
              </div>

              <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                Great for screening a handful of unknown texts, missed calls, or online profiles
                without committing to a subscription.
              </p>

              <ul className="mt-6 space-y-3 text-sm text-slate-300 border-t border-white/[0.07] pt-6">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>4 full intelligence dossier unlocks</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Carrier operator, VoIP & line classification</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Directory status, national format & region</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>One-time charge · No auto-renewal</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              disabled={openingTier !== null}
              onClick={() => handleBuyPass('single')}
              className="mt-8 w-full py-3.5 px-5 rounded-xl bg-white text-slate-950 hover:bg-slate-200 font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>
                {openingTier === 'single' ? 'Opening Checkout...' : 'Get Standard Pass — $7.95'}
              </span>
            </button>
          </div>

          {/* Premium Pass */}
          <div className="rounded-3xl bg-gradient-to-b from-indigo-950/70 via-[#0d152c] to-[#080d1b] border border-sky-400/50 p-8 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-300">
                  Premium Pass
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-400/15 border border-sky-400/35 text-sky-200 tabular-nums">
                  Best Value · $1.33 / lookup
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-2.5">
                <span className="text-4xl sm:text-5xl font-extrabold text-white tabular-nums">
                  $15.95
                </span>
                <span className="text-xs font-semibold text-sky-300">
                  one-time · 12 credits
                </span>
              </div>

              <p className="text-sm text-slate-300 mt-3 leading-relaxed">
                Save 33% per report vs. Standard Pass—ideal for ongoing call screening, dating
                safety checks, and marketplace due diligence.
              </p>

              <ul className="mt-6 space-y-3 text-sm text-slate-200 border-t border-white/[0.09] pt-6">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>12 full intelligence dossier unlocks (3x credits)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Carrier operator, VoIP & line classification</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Directory status, national format & region</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Single one-time payment · Never auto-renews</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              disabled={openingTier !== null}
              onClick={() => handleBuyPass('pro')}
              className="mt-8 w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-indigo-500 via-sky-500 to-indigo-500 hover:brightness-110 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {openingTier === 'pro' ? 'Opening Checkout...' : 'Get Premium Pass — $15.95'}
              </span>
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400">
          <div className="p-4 rounded-2xl bg-white/[0.025] border border-white/[0.07] flex items-start gap-3 numora-card">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              <strong className="text-slate-200">Merchant of Record:</strong> All payments,
              invoices, and applicable sales taxes/VAT are securely processed by Paddle.com.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.025] border border-white/[0.07] flex items-start gap-3 numora-card">
            <Scale className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
            <p>
              <strong className="text-slate-200">Informational Use Only:</strong> Numora is not a
              Consumer Reporting Agency under the FCRA and cannot be used for credit, tenant, or
              employment screening.
            </p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
