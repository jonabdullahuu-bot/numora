'use client';

import React, { useEffect, useState } from 'react';

export interface DossierReport {
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

interface UnlockDossierCardProps {
  report: DossierReport;
  unlocked: boolean;
  onUnlockSuccess: (transactionId: string) => Promise<void> | void;
}

interface StoredWallet {
  transactionId: string;
  creditsRemaining: number;
  planName: string;
  unlockedNumbers: string[];
}

const WALLET_KEY = 'numora_pass_wallet_v1';

export default function UnlockDossierCard({
  report,
  unlocked,
  onUnlockSuccess,
}: UnlockDossierCardProps) {
  const [selectedTier, setSelectedTier] = useState<'single' | 'pro'>('pro');
  const [checkoutLoading, setCheckoutLoading] = useState<'single' | 'pro' | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [wallet, setWallet] = useState<StoredWallet | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(WALLET_KEY);
      if (raw) {
        const parsed: StoredWallet = JSON.parse(raw);
        if (parsed && parsed.transactionId) {
          setWallet(parsed);
        }
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const saveWallet = (next: StoredWallet) => {
    setWallet(next);
    try {
      window.localStorage.setItem(WALLET_KEY, JSON.stringify(next));
    } catch {
      // ignore storage errors
    }
  };

  useEffect(() => {
    const handlePaddleComplete = async (event: Event) => {
      const custom = event as CustomEvent<{ transactionId?: string; tier?: 'single' | 'pro' }>;
      const txId = custom?.detail?.transactionId;
      const tier = custom?.detail?.tier || selectedTier;
      if (!txId) return;

      setVerifying(true);
      setCheckoutError(null);
      try {
        const res = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transactionId: txId,
            e164Number: report.e164,
            planHint: tier,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data?.verified) {
          throw new Error(data?.error || 'Could not verify payment.');
        }

        const totalCredits = Number(data.creditsGranted || (tier === 'pro' ? 12 : 4));
        const nextWallet: StoredWallet = {
          transactionId: txId,
          creditsRemaining: Math.max(0, totalCredits - 1),
          planName: tier === 'pro' ? 'Premium Pass (12 Credits)' : 'Standard Pass (4 Credits)',
          unlockedNumbers: [report.e164],
        };
        saveWallet(nextWallet);
        await onUnlockSuccess(txId);
      } catch (err: any) {
        setCheckoutError(err?.message || 'Payment verification failed.');
      } finally {
        setVerifying(false);
        setCheckoutLoading(null);
      }
    };

    window.addEventListener('numora:checkout-completed', handlePaddleComplete);
    return () => window.removeEventListener('numora:checkout-completed', handlePaddleComplete);
  }, [report.e164, selectedTier, onUnlockSuccess]);

  const handleUseExistingCredit = async () => {
    if (!wallet || wallet.creditsRemaining <= 0) return;
    setVerifying(true);
    setCheckoutError(null);
    try {
      const alreadyUnlocked = wallet.unlockedNumbers.includes(report.e164);
      const nextCredits = alreadyUnlocked
        ? wallet.creditsRemaining
        : Math.max(0, wallet.creditsRemaining - 1);
      const nextNumbers = alreadyUnlocked
        ? wallet.unlockedNumbers
        : [...wallet.unlockedNumbers, report.e164];

      saveWallet({
        ...wallet,
        creditsRemaining: nextCredits,
        unlockedNumbers: nextNumbers,
      });

      await onUnlockSuccess(wallet.transactionId);
    } catch (err: any) {
      setCheckoutError(err?.message || 'Unable to apply credit.');
    } finally {
      setVerifying(false);
    }
  };

  const openPaddleCheckout = (tier: 'single' | 'pro') => {
    setSelectedTier(tier);
    setCheckoutError(null);
    setCheckoutLoading(tier);

    const priceId =
      tier === 'pro'
        ? process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID
        : process.env.NEXT_PUBLIC_PADDLE_SINGLE_PRICE_ID;

    if (!priceId) {
      setCheckoutLoading(null);
      setCheckoutError('Price ID is missing in .env.local. Check your Paddle configuration.');
      return;
    }

    const paddle = (window as any).Paddle;
    if (!paddle || !paddle.Checkout) {
      setCheckoutLoading(null);
      setCheckoutError('Paddle checkout script is still loading. Please try again in a second.');
      return;
    }

    try {
      paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customData: {
          e164_number: report.e164,
          tier,
        },
        settings: {
          displayMode: 'overlay',
          theme: 'dark',
          locale: 'en',
        },
      });
    } catch (err: any) {
      setCheckoutError(err?.message || 'Could not launch checkout.');
    } finally {
      setTimeout(() => setCheckoutLoading(null), 800);
    }
  };

  const riskStyles =
    report.spamRisk === 'High'
      ? 'bg-red-500/15 text-red-300 border-red-500/40'
      : report.spamRisk === 'Medium'
      ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
      : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40';

  return (
    <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden text-left">
      {/* Top Dossier Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 bg-slate-950/70 px-6 py-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
              Intelligence Dossier · Verified E.164
            </span>
          </div>
          <h3 className="mt-1 text-2xl font-bold tracking-tight text-white font-mono">
            {report.e164}
          </h3>
        </div>

        <div className="flex items-center gap-3">
          {wallet && wallet.creditsRemaining > 0 && (
            <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-300">
              {wallet.creditsRemaining} {wallet.creditsRemaining === 1 ? 'Credit' : 'Credits'} Left
            </span>
          )}
          <span className={`rounded-full border px-3.5 py-1 text-xs font-semibold ${riskStyles}`}>
            Spam Risk: {report.spamRisk}
          </span>
        </div>
      </div>

      {/* Free Carrier & Network Telemetry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 border-b border-slate-800/80">
        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-400">Carrier Network</p>
          <p className="mt-1.5 text-sm font-semibold text-white">{report.carrier}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-400">Line Classification</p>
          <p className="mt-1.5 text-sm font-semibold text-white">{report.lineType}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-400">Registered Region</p>
          <p className="mt-1.5 text-sm font-semibold text-white">{report.location}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-400">Country Code</p>
          <p className="mt-1.5 text-sm font-semibold text-white">{report.country}</p>
        </div>
      </div>

      {/* Subscriber Identity & Paywall Upgrade Vault */}
      <div className="p-6">
        {unlocked ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Full Subscriber & Identity Record Unlocked
              </span>
              <span className="text-xs text-slate-400">One-Time Pass Verified</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg bg-slate-950/70 p-3.5 border border-slate-800">
                <p className="text-xs text-slate-400">Registered Owner</p>
                <p className="mt-1 text-base font-semibold text-white">{report.ownerName}</p>
              </div>
              <div className="rounded-lg bg-slate-950/70 p-3.5 border border-slate-800">
                <p className="text-xs text-slate-400">Associated Email</p>
                <p className="mt-1 text-base font-semibold text-white">{report.ownerEmail}</p>
              </div>
              <div className="rounded-lg bg-slate-950/70 p-3.5 border border-slate-800">
                <p className="text-xs text-slate-400">Billing / Street Location</p>
                <p className="mt-1 text-base font-semibold text-white">{report.ownerAddress}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Redacted Preview Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 opacity-85">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
                <p className="text-[11px] uppercase tracking-wider text-slate-500">Registered Owner</p>
                <p className="mt-1 font-mono text-sm text-slate-300 select-none blur-[3px]">
                  {report.ownerName}
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
                <p className="text-[11px] uppercase tracking-wider text-slate-500">Associated Email</p>
                <p className="mt-1 font-mono text-sm text-slate-300 select-none blur-[3px]">
                  {report.ownerEmail}
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
                <p className="text-[11px] uppercase tracking-wider text-slate-500">Street Location</p>
                <p className="mt-1 font-mono text-sm text-slate-300 select-none blur-[3px]">
                  {report.ownerAddress}
                </p>
              </div>
            </div>

            {/* Instant Credit Unlock Banner (if buyer already has remaining credits) */}
            {wallet && wallet.creditsRemaining > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-cyan-500/40 bg-cyan-950/30 p-4">
                <div>
                  <p className="text-sm font-semibold text-white">
                    You have {wallet.creditsRemaining} report{' '}
                    {wallet.creditsRemaining === 1 ? 'credit' : 'credits'} available from your{' '}
                    {wallet.planName}
                  </p>
                  <p className="text-xs text-cyan-200/80">
                    Unlock {report.e164} right now with 1 click—no extra payment required.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={verifying}
                  onClick={handleUseExistingCredit}
                  className="w-full sm:w-auto shrink-0 rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-300 transition cursor-pointer disabled:opacity-50"
                >
                  {verifying ? 'Unlocking...' : 'Use 1 Credit to Unlock Now'}
                </button>
              </div>
            )}

            {/* 10x Upgraded Interactive Tier Selector */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
                <div>
                  <h4 className="text-lg font-bold text-white">
                    Choose a One-Time Pass to Reveal Full Dossier
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Instant unblur for <span className="text-slate-200 font-mono">{report.e164}</span>{' '}
                    + extra credits for future searches. Zero recurring subscriptions.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-[11px] font-medium text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  256-Bit Encrypted Checkout
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Option 1: Standard Pass ($7.95) */}
                <div
                  onClick={() => setSelectedTier('single')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedTier('single')}
                  className={`relative rounded-xl border p-5 transition cursor-pointer flex flex-col justify-between ${
                    selectedTier === 'single'
                      ? 'border-cyan-400 bg-slate-900 shadow-lg shadow-cyan-500/10'
                      : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Standard Pass
                      </span>
                      <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-300">
                        $1.99 / lookup
                      </span>
                    </div>

                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-white">$7.95</span>
                      <span className="text-xs text-slate-400">one-time · 4 credits</span>
                    </div>

                    <ul className="mt-4 space-y-2 text-xs text-slate-300">
                      <li className="flex items-center gap-2">
                        <span className="text-cyan-400 font-bold">✓</span>
                        Instant unblur for {report.e164}
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-cyan-400 font-bold">✓</span>
                        3 extra full report credits (never expire)
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-cyan-400 font-bold">✓</span>
                        Owner name, email & registered address
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    disabled={checkoutLoading !== null || verifying}
                    onClick={(e) => {
                      e.stopPropagation();
                      openPaddleCheckout('single');
                    }}
                    className={`mt-5 w-full rounded-xl py-3 px-4 text-sm font-bold transition cursor-pointer disabled:opacity-50 ${
                      selectedTier === 'single'
                        ? 'bg-white text-slate-950 hover:bg-slate-200'
                        : 'bg-slate-800 text-white hover:bg-slate-700'
                    }`}
                  >
                    {checkoutLoading === 'single'
                      ? 'Opening Checkout...'
                      : 'Unlock with Standard — $7.95'}
                  </button>
                </div>

                {/* Option 2: Premium Pass ($15.95) */}
                <div
                  onClick={() => setSelectedTier('pro')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedTier('pro')}
                  className={`relative rounded-xl border p-5 transition cursor-pointer flex flex-col justify-between ${
                    selectedTier === 'pro'
                      ? 'border-cyan-400 bg-gradient-to-b from-cyan-950/40 to-slate-900 shadow-lg shadow-cyan-500/15'
                      : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                  }`}
                >
                  <div className="absolute -top-3 right-4 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-950 shadow">
                    Best Value · Save 33%
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                        Premium Pass
                      </span>
                      <span className="rounded-md bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 text-[11px] font-semibold text-cyan-300">
                        $1.33 / lookup
                      </span>
                    </div>

                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-white">$15.95</span>
                      <span className="text-xs text-slate-400">one-time · 12 credits</span>
                    </div>

                    <ul className="mt-4 space-y-2 text-xs text-slate-200">
                      <li className="flex items-center gap-2">
                        <span className="text-cyan-400 font-bold">✓</span>
                        Instant unblur for {report.e164}
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-cyan-400 font-bold">✓</span>
                        11 extra full report credits (never expire)
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-cyan-400 font-bold">✓</span>
                        Full identity, carrier & fraud risk dossier
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    disabled={checkoutLoading !== null || verifying}
                    onClick={(e) => {
                      e.stopPropagation();
                      openPaddleCheckout('pro');
                    }}
                    className="mt-5 w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 py-3 px-4 text-sm font-extrabold text-slate-950 hover:from-cyan-300 hover:to-blue-400 transition shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
                  >
                    {checkoutLoading === 'pro'
                      ? 'Opening Checkout...'
                      : verifying
                      ? 'Verifying Payment...'
                      : 'Unlock with Premium — $15.95'}
                  </button>
                </div>
              </div>

              {checkoutError && (
                <div className="mt-4 rounded-xl border border-red-500/40 bg-red-950/30 px-4 py-3 text-xs text-red-200">
                  {checkoutError}
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-slate-400">
                <span>• Single one-time charge (no auto-renewal)</span>
                <span>• Instant digital delivery</span>
                <span>• Powered by Paddle Merchant of Record</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
