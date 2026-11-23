'use client';

import { SiteHeader, SiteFooter } from "../../components/SiteChrome";
import React, { useEffect, useState } from 'react';
import { initializePaddle, Paddle } from '@paddle/paddle-js';
import {
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Lock,
  CreditCard,
  Scale,
  KeyRound,
  Copy,
  Check,
  RefreshCw,
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
  const [restoreInput, setRestoreInput] = useState<string>('');
  const [restoring, setRestoring] = useState<boolean>(false);
  const [restoreError, setRestoreError] = useState<string>('');
  const [copiedToken, setCopiedToken] = useState<boolean>(false);

  // Sync existing token from localStorage and refresh live balance from Supabase
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
              const credits = verifyData?.creditsRemaining ?? verifyData?.creditsGranted ?? fallbackCredits;
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
                `Payment verified! ${credits} lookup credits are active. Save your Private Access Token below to use your credits on any PC or browser.`
              );
            } catch {
              setOpeningTier(null);
              setMessage(
                `Payment completed! Return to the search page to unlock any dossier.`
              );
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
      setMessage('Checkout is still initializingâ€”please wait a moment and try again.');
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

  const handleRestoreToken = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = restoreInput.trim().toUpperCase();
    if (!cleaned) return;

    setRestoring(true);
    setRestoreError('');
    try {
      const res = await fetch(`/api/tokens?token=${encodeURIComponent(cleaned)}`);
      const data = await res.json();
      if (!res.ok) {
        setRestoreError(data?.error || 'Could not find that access token.');
      } else {
        const restored: StoredWallet = {
          accessToken: data.accessToken,
          transactionId: data.transactionId,
          planId: data.planId === 'pro' ? 'pro' : 'single',
          planLabel: data.planLabel,
          creditsRemaining: data.creditsRemaining,
          unlockedNumbers: data.unlockedNumbers || [],
          expiresAt: data.expiresAt,
        };
        window.localStorage.setItem('numora_pass_wallet_v1', JSON.stringify(restored));
        setActiveWallet(restored);
        setRestoreInput('');
        setMessage(
          `Access Token restored! You have ${data.creditsRemaining} lookup credit${data.creditsRemaining === 1 ? '' : 's'} ready on this device.`
        );
      }
    } catch {
      setRestoreError('Network error while verifying token. Please try again.');
    } finally {
      setRestoring(false);
    }
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

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-16 space-y-14 animate-fade-up">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-semibold">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Simple One-Time Passes Â· No Subscriptions</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Pay Once. Unlock Dossiers Anytime.
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            Every NumoraLookup Pass is a single one-time purchase with zero recurring monthly fees.
            Inspect carrier routing, virtual/VoIP line classification, regional telemetry, and
            available directory status across 200+ countries.
          </p>
        </div>

        {/* Active Token & Balance Banner */}
        {(message || activeWallet?.accessToken) && (
          <div className="max-w-3xl mx-auto p-5 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 text-sm text-emerald-100 space-y-3 numora-card">
            {message && <p className="font-medium text-emerald-200">{message}</p>}
            {activeWallet?.accessToken && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="space-y-1">
                  <div className="text-[11px] uppercase tracking-wider text-emerald-300/80 font-semibold">
                    Your Private Access Token Â· {activeWallet.creditsRemaining} Credit{activeWallet.creditsRemaining === 1 ? '' : 's'} Remaining
                  </div>
                  <div className="font-mono text-base sm:text-lg font-bold tracking-wider text-white">
                    {activeWallet.accessToken}
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleCopyToken}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedToken ? 'Copied' : 'Copy Token'}</span>
                  </button>
                  <a
                    href="/"
                    className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs shrink-0"
                  >
                    Search Now
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pricing Cards */}
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
                  one-time Â· 4 credits
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
                  <span>Private Access Token for multi-device use</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>One-time charge Â· No auto-renewal</span>
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
                {openingTier === 'single' ? 'Opening Checkout...' : 'Get Standard Pass â€” $7.95'}
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
                  Best Value Â· $1.33 / lookup
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-2.5">
                <span className="text-4xl sm:text-5xl font-extrabold text-white tabular-nums">
                  $15.95
                </span>
                <span className="text-xs font-semibold text-sky-300">
                  one-time Â· 12 credits
                </span>
              </div>

              <p className="text-sm text-slate-300 mt-3 leading-relaxed">
                Save 33% per report vs. Standard Passâ€”ideal for ongoing call screening, dating
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
                  <span>Private Access Token for multi-device use</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Single one-time payment Â· Never auto-renews</span>
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
                {openingTier === 'pro' ? 'Opening Checkout...' : 'Get Premium Pass â€” $15.95'}
              </span>
            </button>
          </div>
        </div>

        {/* How Search Credits & Access Tokens Work */}
        <section className="max-w-4xl mx-auto pt-4 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/25 text-emerald-300 text-[11px] font-bold uppercase tracking-wider">
              <span>Seamless Workflow</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              How Search Credits & Access Tokens Work
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              We use private Access Tokens so you can manage searches securely and switch devices
              without needing to create a permanent password-protected account.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 01 */}
            <div className="rounded-3xl bg-[#0c1120] border border-white/[0.09] p-7 flex flex-col justify-between shadow-xl numora-card">
              <div>
                <div className="text-2xl font-extrabold text-emerald-400 tabular-nums">01</div>
                <h3 className="mt-3 text-lg font-bold text-white">Select a Credit Pass</h3>
                <p className="mt-2.5 text-sm text-slate-400 leading-relaxed">
                  Choose either the 4-credit ($7.95) or 12-credit ($15.95) package. Complete a
                  secure encrypted checkout with zero recurring commitments.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.07] space-y-2 text-xs">
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500 font-semibold uppercase">Payment Type</span>
                  <span className="text-slate-300 text-right">One-Time Checkout</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500 font-semibold uppercase">Activation</span>
                  <span className="text-slate-300 text-right">Instant Token Issued</span>
                </div>
              </div>
            </div>

            {/* Step 02 */}
            <div className="rounded-3xl bg-[#0c1120] border border-white/[0.09] p-7 flex flex-col justify-between shadow-xl numora-card">
              <div>
                <div className="text-2xl font-extrabold text-emerald-400 tabular-nums">02</div>
                <h3 className="mt-3 text-lg font-bold text-white">Receive Your Private Token</h3>
                <p className="mt-2.5 text-sm text-slate-400 leading-relaxed">
                  Upon checkout, you receive a private Access Token (e.g., <span className="font-mono text-slate-200">NMR-8K4P2M9Q</span>). It is saved to your browser automatically and ready to copy for backup.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.07] space-y-2 text-xs">
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500 font-semibold uppercase">Token Format</span>
                  <span className="text-slate-300 text-right">Alphanumeric Key</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500 font-semibold uppercase">Validity</span>
                  <span className="text-slate-300 text-right">30 Days (Extends on Use)</span>
                </div>
              </div>
            </div>

            {/* Step 03 */}
            <div className="rounded-3xl bg-[#0c1120] border border-white/[0.09] p-7 flex flex-col justify-between shadow-xl numora-card">
              <div>
                <div className="text-2xl font-extrabold text-emerald-400 tabular-nums">03</div>
                <h3 className="mt-3 text-lg font-bold text-white">Investigate & Sync Anywhere</h3>
                <p className="mt-2.5 text-sm text-slate-400 leading-relaxed">
                  Each new intelligence unlock spends 1 credit. Re-opening an already-unlocked
                  number costs 0 extra credits, and you can enter your token on any PC.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.07] space-y-2 text-xs">
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500 font-semibold uppercase">Repeat Views</span>
                  <span className="text-slate-300 text-right">0 Credits (Saved History)</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500 font-semibold uppercase">Multi-Device</span>
                  <span className="text-slate-300 text-right">Restore on Any PC</span>
                </div>
              </div>
            </div>
          </div>

          {/* Restore Token Box for Different PCs / Browsers */}
          <div className="rounded-3xl bg-[#0c1120] border border-white/[0.09] p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-md">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Already Have a Token?</span>
              </div>
              <h3 className="text-lg font-bold text-white">Restore Credits on This PC</h3>
              <p className="text-xs sm:text-sm text-slate-400">
                Bought credits on another computer or cleared your browser? Enter your{' '}
                <span className="font-mono text-slate-300">NMR-XXXXXXXX</span> token to sync your
                remaining balance.
              </p>
            </div>

            <form onSubmit={handleRestoreToken} className="w-full md:w-auto flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={restoreInput}
                  onChange={(e) => setRestoreInput(e.target.value)}
                  placeholder="NMR-XXXXXXXX"
                  className="w-full sm:w-52 px-4 py-2.5 rounded-xl bg-slate-950/90 border border-white/15 text-sm font-mono uppercase text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400"
                />
                <button
                  type="submit"
                  disabled={restoring || !restoreInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${restoring ? 'animate-spin' : ''}`} />
                  <span>{restoring ? 'Syncing...' : 'Restore'}</span>
                </button>
              </div>
              {restoreError && <p className="text-xs text-rose-400">{restoreError}</p>}
            </form>
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