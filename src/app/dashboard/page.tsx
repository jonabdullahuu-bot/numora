'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { SiteHeader, SiteFooter } from '@/components/SiteChrome';
import {
  KeyRound,
  Copy,
  Check,
  RefreshCw,
  Coins,
  Search,
  PhoneCall,
  ArrowUpRight,
  Clock,
  Sparkles,
} from 'lucide-react';

interface StoredWallet {
  accessToken?: string;
  transactionId?: string;
  planId?: 'single' | 'pro';
  planLabel?: string;
  creditsRemaining: number;
  unlockedNumbers: string[];
  expiresAt?: string;
}

export default function DashboardPage() {
  const [wallet, setWallet] = useState<StoredWallet | null>(null);
  const [tokenInput, setTokenInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const syncToken = async (rawToken: string, showFeedback = false) => {
    const cleaned = rawToken.trim().toUpperCase();
    if (!cleaned) return;

    setLoading(true);
    setErrorMsg('');
    if (showFeedback) setStatusMsg('');

    try {
      const res = await fetch(`/api/tokens?token=${encodeURIComponent(cleaned)}`);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMsg(data?.error || 'Could not find that access token.');
      } else {
        const nextWallet: StoredWallet = {
          accessToken: data.accessToken || cleaned,
          transactionId: data.transactionId,
          planId: data.planId === 'pro' ? 'pro' : 'single',
          planLabel:
            data.planLabel ||
            (data.planId === 'pro'
              ? 'Premium Pass (12 Credits)'
              : 'Standard Pass (4 Credits)'),
          creditsRemaining: Number(data.creditsRemaining ?? 0),
          unlockedNumbers: Array.isArray(data.unlockedNumbers)
            ? data.unlockedNumbers
            : [],
          expiresAt: data.expiresAt,
        };

        setWallet(nextWallet);
        window.localStorage.setItem(
          'numora_pass_wallet_v1',
          JSON.stringify(nextWallet)
        );
        if (showFeedback) {
          setStatusMsg(
            `Synced token ${nextWallet.accessToken} — ${nextWallet.creditsRemaining} credit${
              nextWallet.creditsRemaining === 1 ? '' : 's'
            } available.`
          );
        }
      }
    } catch {
      setErrorMsg('Network error while syncing your token.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('numora_pass_wallet_v1');
      if (!raw) return;
      const parsed: StoredWallet = JSON.parse(raw);
      setWallet(parsed);
      if (parsed?.accessToken) {
        syncToken(parsed.accessToken, false);
      }
    } catch {
      // ignore storage read errors
    }
  }, []);

  const handleRestoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await syncToken(tokenInput, true);
    setTokenInput('');
  };

  const handleCopyToken = () => {
    if (!wallet?.accessToken) return;
    navigator.clipboard.writeText(wallet.accessToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedExpiry = wallet?.expiresAt
    ? new Date(wallet.expiresAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '30 Days (Extends on Use)';

  return (
    <div className="min-h-screen w-full flex flex-col bg-numora-grid text-slate-100">
      <SiteHeader />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-14 space-y-10 animate-fade-up">
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/25 text-emerald-300 text-xs font-semibold">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Token Wallet & Lookup History</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Numora Dashboard
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-xl">
              Check your remaining lookup credits, back up or restore your Private Access
              Token, and reopen previously unlocked phone dossiers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/pricing"
              className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-xs sm:text-sm font-semibold text-white inline-flex items-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>Get More Credits</span>
            </Link>
            <Link
              href="/"
              className="px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition"
            >
              <Search className="w-4 h-4" />
              <span>New Lookup</span>
            </Link>
          </div>
        </div>

        {(statusMsg || errorMsg) && (
          <div
            className={`p-4 rounded-2xl border text-sm ${
              errorMsg
                ? 'bg-rose-500/10 border-rose-400/30 text-rose-200'
                : 'bg-emerald-500/10 border-emerald-400/30 text-emerald-200'
            }`}
          >
            {errorMsg || statusMsg}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Credits Remaining */}
          <div className="rounded-3xl bg-[#0c1120] border border-white/[0.09] p-6 shadow-xl numora-card">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
              <span>Credits Remaining</span>
              <Coins className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-3 text-4xl font-extrabold text-white tabular-nums">
              {wallet ? wallet.creditsRemaining : 0}
            </div>
            <p className="mt-2 text-xs text-slate-400">
              {wallet?.planLabel || 'No active pass linked yet'}
            </p>
          </div>

          {/* Unlocked Dossiers */}
          <div className="rounded-3xl bg-[#0c1120] border border-white/[0.09] p-6 shadow-xl numora-card">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
              <span>Unlocked Numbers</span>
              <PhoneCall className="w-4 h-4 text-sky-400" />
            </div>
            <div className="mt-3 text-4xl font-extrabold text-white tabular-nums">
              {wallet?.unlockedNumbers?.length ?? 0}
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Re-opening unlocked numbers costs 0 extra credits
            </p>
          </div>

          {/* Token Validity */}
          <div className="rounded-3xl bg-[#0c1120] border border-white/[0.09] p-6 shadow-xl numora-card">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
              <span>Token Status</span>
              <Clock className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="mt-3 text-xl font-bold text-white truncate">
              {wallet?.accessToken ? 'Active' : 'Not Connected'}
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Validity: {formattedExpiry}
            </p>
          </div>
        </div>

        {/* Active Token & Restore Card */}
        <div className="rounded-3xl bg-[#0c1120] border border-white/[0.09] p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/[0.07]">
            <div className="space-y-1.5">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Active Private Access Token
              </div>
              {wallet?.accessToken ? (
                <div className="font-mono text-xl sm:text-2xl font-extrabold tracking-wider text-white">
                  {wallet.accessToken}
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  No token found in this browser yet. Purchase a pass on{' '}
                  <Link href="/pricing" className="text-sky-400 underline">
                    Pricing
                  </Link>{' '}
                  or enter an existing <span className="font-mono text-slate-200">NMR-</span> token below.
                </p>
              )}
            </div>

            {wallet?.accessToken && (
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleCopyToken}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer transition"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  <span>{copied ? 'Copied Token' : 'Copy Token'}</span>
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => syncToken(wallet.accessToken!, true)}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-200 font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh Balance</span>
                </button>
              </div>
            )}
          </div>

          <form
            onSubmit={handleRestoreSubmit}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <h2 className="text-base font-bold text-white">
                Switch Device or Restore Token
              </h2>
              <p className="text-xs text-slate-400">
                Paste a saved <span className="font-mono text-slate-300">NMR-XXXXXXXX</span> code to load your balance on this device.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="NMR-XXXXXXXX"
                className="w-full sm:w-52 px-4 py-2.5 rounded-xl bg-slate-950/90 border border-white/15 text-sm font-mono uppercase text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400"
              />
              <button
                type="submit"
                disabled={loading || !tokenInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Syncing...' : 'Load Token'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Unlocked Numbers History */}
        <div className="rounded-3xl bg-[#0c1120] border border-white/[0.09] p-6 sm:p-8 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Unlocked Lookup History</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Click any number to view its dossier again without spending another credit.
              </p>
            </div>
          </div>

          {wallet?.unlockedNumbers && wallet.unlockedNumbers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {wallet.unlockedNumbers.map((num) => (
                <Link
                  key={num}
                  href={`/?number=${encodeURIComponent(num)}`}
                  className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] flex items-center justify-between transition group"
                >
                  <span className="font-mono text-sm font-bold text-white">
                    {num}
                  </span>
                  <span className="text-xs font-semibold text-emerald-400 inline-flex items-center gap-1">
                    <span>Open</span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-center space-y-3">
              <p className="text-sm text-slate-400">
                No unlocked phone dossiers yet.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Go to Reverse Lookup</span>
              </Link>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
