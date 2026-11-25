'use client';

import { SiteHeader, SiteFooter } from "../../components/SiteChrome";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { initializePaddle, Paddle } from '@paddle/paddle-js';
import {
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Lock,
  CreditCard,
  Scale,
  Copy,
  Check,
  ArrowRight,
} from 'lucide-react';

interface StoredWallet {
  accessToken?: string;
  transactionId: string;
  planId: 'single' | 'pro';
  planLabel: string;
  creditsRemaining: number;
  unlockedNumbers: string[];
  expiresAt?: string;
}

export default function PricingPage() {
  const [paddle, setPaddle] = useState<Paddle>();
  const [openingTier, setOpeningTier] = useState<'single' | 'pro' | null>(null);
  const [message, setMessage] = useState<string>('');
  const [activeWallet, setActiveWallet] = useState<StoredWallet | null>(null);
  const [copiedToken, setCopiedToken] = useState<boolean>(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('numora_pass_wallet_v1');
      if (!raw) return;
      const parsed: StoredWallet = JSON.parse(raw);
      setActiveWallet(parsed);

      if (parsed?.accessToken) {
        fetch(`/api/tokens?token=${encodeURIComponent(parsed.accessToken)}`)
          .then((r) => (r.ok ? r.json() : null))
          .then((fresh) => {
            if (!fresh?.accessToken) return;
            const synced: StoredWallet = {
              accessToken: fresh.accessToken,
              transactionId: fresh.transactionId || parsed.transactionId,
              planId: fresh.planId === 'pro' ? 'pro' : 'single',
              planLabel: fresh.planLabel || parsed.planLabel,
              creditsRemaining: fresh.creditsRemaining,
              unlockedNumbers: fresh.unlockedNumbers || [],
              expiresAt: fresh.expiresAt,
            };
            setActiveWallet(synced);
            window.localStorage.setItem('numora_pass_wallet_v1', JSON.stringify(synced));
          })
          .catch(() => {});
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN) {
      initializePaddle({
        environment:
          process.env.NEXT_PUBLIC_PADDLE_ENV === 'production' ? 'production' : 'sandbox',
        token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
        eventCallback: async (event) => {
          const payload = (event as any)?.data;
          if (event?.name === 'checkout.completed' && payload?.transaction_id) {
            const planId =
              payload?.custom_data?.planId === 'single' ? 'single' : 'pro';
            const fallbackCredits = planId === 'pro' ? 12 : 4;

            try {
              const verifyRes = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  transactionId: String(payload.transaction_id),
                  planHint: planId,
                }),
              });
              const verifyData = await verifyRes.json().catch(() => ({}));
              const credits =
                verifyData?.creditsRemaining ?? verifyData?.creditsGranted ?? fallbackCredits;
              const nextWallet: StoredWallet = {
                accessToken: verifyData?.accessToken,
                transactionId: String(payload.transaction_id),
                planId,
                planLabel:
                  verifyData?.planLabel ||
                  (planId === 'pro'
                    ? 'Premium Pass (12 Credits)'
                    : 'Standard Pass (4 Credits)'),
                creditsRemaining: credits,
                unlockedNumbers: verifyData?.unlockedNumbers || [],
                expiresAt: verifyData?.expiresAt,
              };

              window.localStorage.setItem('numora_pass_wallet_v1', JSON.stringify(nextWallet));
              setActiveWallet(nextWallet);
              setOpeningTier(null);
              setMessage(
                `Payment verified! ${credits} lookup credit${credits === 1 ? '' : 's'} active. We also emailed your backup pass key.`
              );
            } catch {
              setOpeningTier(null);
              setMessage('Payment completed! Return to the search page to unlock any report.');
            }
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
      setMessage('Checkout is still initializing - please wait a moment and try again.');
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

  const handleCopyToken = () => {
    if (!activeWallet?.accessToken) return;
    navigator.clipboard.writeText(activeWallet.accessToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-numora-grid text-slate-100">
      <SiteHeader />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 sm:space-y-14 animate-fade-up">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-semibold">
            <CreditCard className="w-3.5 h-3.5" />
            <span>One-Time Passes · No Subscriptions</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.12]">
            Pay Once. Unlock Reports Anytime.
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            Every NumoraLookup Pass is a one-time payment with no monthly subscription. Check
            carrier routing, VoIP vs. mobile line type, prepaid status, and activity scores across
            200+ countries.
          </p>
        </div>

        {/* Active Pass & Credit Balance Banner */}
        {(message || activeWallet?.accessToken) && (
          <div className="max-w-3xl mx-auto p-5 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 text-sm text-emerald-100 space-y-3 numora-card">
            {message && <p className="font-medium text-emerald-200">{message}</p>}
            {activeWallet?.accessToken && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="space-y-1">
                  <div className="text-[11px] uppercase tracking-wider text-emerald-300/80 font-semibold">
                    Active Pass · {activeWallet.creditsRemaining} Credit{activeWallet.creditsRemaining === 1 ? '' : 's'} Remaining
                  </div>
                  <div className="font-mono text-sm sm:text-lg font-bold tracking-wider text-white break-all">
                    {activeWallet.accessToken}
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleCopyToken}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedToken ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedToken ? 'Copied' : 'Copy Key'}</span>
                  </button>
                  <Link
                    href="/"
                    className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs shrink-0"
                  >
                    Search Now
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Standard Pass */}
          <div className="rounded-2xl sm:rounded-3xl bg-[#0c1120] border border-white/[0.09] p-5 sm:p-8 flex flex-col justify-between shadow-xl">
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
                <span className="text-3xl sm:text-5xl font-extrabold text-white tabular-nums">
                  $7.95
                </span>
                <span className="text-xs font-semibold text-indigo-300">
                  one-time · 4 credits
                </span>
              </div>

              <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                Great for checking a few unknown callers, suspicious texts, or online profiles
                without a subscription.
              </p>

              <ul className="mt-6 space-y-3 text-sm text-slate-300 border-t border-white/[0.07] pt-6">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>4 full report unlocks</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Carrier, VoIP/burner & prepaid telemetry</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>No account signup required · Multi-device ready</span>
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
          <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-b from-indigo-950/70 via-[#0d152c] to-[#080d1b] border border-sky-400/50 p-5 sm:p-8 flex flex-col justify-between shadow-2xl">
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
                <span className="text-3xl sm:text-5xl font-extrabold text-white tabular-nums">
                  $15.95
                </span>
                <span className="text-xs font-semibold text-sky-300">
                  one-time · 12 credits
                </span>
              </div>

              <p className="text-sm text-slate-300 mt-3 leading-relaxed">
                Save 33% per report vs. Standard Pass - ideal for dating safety, marketplace
                checks, and frequent number screening.
              </p>

              <ul className="mt-6 space-y-3 text-sm text-slate-200 border-t border-white/[0.09] pt-6">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>12 full report unlocks (3x credits)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Carrier, VoIP/burner & prepaid telemetry</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>No account signup required · Multi-device ready</span>
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

        {/* Quick Pre-Purchase Questions */}
        <section className="max-w-4xl mx-auto pt-2 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-[#0c1120] border border-white/[0.08] p-5 space-y-2">
              <h2 className="text-sm font-bold text-white">Do I need an account?</h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                No. Credits activate right away in your browser, and we email a backup pass key so
                you can switch devices anytime.
              </p>
            </div>
            <div className="rounded-2xl bg-[#0c1120] border border-white/[0.08] p-5 space-y-2">
              <h2 className="text-sm font-bold text-white">Does re-checking cost a credit?</h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                No. Each new number unlock uses 1 credit, and reopening an already-unlocked
                report uses 0 extra credits.
              </p>
            </div>
            <div className="rounded-2xl bg-[#0c1120] border border-white/[0.08] p-5 space-y-2">
              <h2 className="text-sm font-bold text-white">Is there any subscription?</h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Never. Both passes are one-time purchases with zero recurring billing or hidden
                renewals.
              </p>
            </div>
          </div>

          <div className="text-center pt-1">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-emerald-400 hover:text-emerald-300 font-medium transition"
            >
              <span>Already purchased a pass? View balance or restore on another device</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

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
              <strong className="text-slate-200">Informational Use Only:</strong> NumoraLookup is not a
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
