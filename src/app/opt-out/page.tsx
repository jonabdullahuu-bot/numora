'use client';
import PageStudioBanner from "@/components/PageStudioBanner";
import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle } from "@/components/NumoraIcons";
import { SiteHeader, SiteFooter } from '../../components/SiteChrome';

export default function OptOutPage() {
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmedNumber, setConfirmedNumber] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setConfirmedNumber('');
    setLoading(true);

    try {
      const res = await fetch('/api/opt-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawNumber: phone, reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Could not suppress this number.');
      } else {
        setConfirmedNumber(data.e164);
        setPhone('');
        setReason('');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-numora-grid text-slate-200">
      <SiteHeader />

      <main className="flex-1 max-w-xl mx-auto w-full px-6 py-16 space-y-8 animate-fade-up">
      <PageStudioBanner
        image="/images/optout-vault.jpg"
        alt="Titanium and frosted glass privacy vault dial"
        eyebrow="Self-Serve Suppression Vault"
        title="Control how your number appears in lookups."
        subtitle="Submit your phone number to immediately suppress it from NumoraLookup results with zero account required."
      />
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4d6fa9]/10 border border-[#8aa5d6]/20 text-blue-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Self-Serve Suppression Registry</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Remove My Phone Number
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Enter your international phone number (including country code such as <code className="text-slate-200">+1</code>,{' '}
            <code className="text-slate-200">+44</code>) to purge any cached
            entry and block future lookups on NumoraLookup.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-[#1b1d23] border border-white/[0.09] apple-card p-6 sm:p-8 space-y-5 shadow-xl numora-card"
        >
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Phone Number (with Country Code)
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 212 555 0199"
              className="w-full px-4 py-3 rounded-xl bg-[#141519] border border-white/[0.09] text-white placeholder-slate-500 focus:outline-none focus:border-[#8aa5d6] tabular-nums"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Optional Note
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Personal privacy preference"
              className="w-full px-4 py-3 rounded-xl bg-[#141519] border border-white/[0.09] text-white placeholder-slate-500 focus:outline-none focus:border-[#8aa5d6]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="numora-action w-full py-3.5 px-5 rounded-xl bg-[#4d6fa9] hover:bg-blue-400 text-slate-950 font-bold text-sm transition cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Processing Suppression...' : 'Suppress Number from NumoraLookup'}
          </button>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {confirmedNumber && (
            <div className="p-4 rounded-xl bg-[#4d6fa9]/10 border border-[#8aa5d6]/30 text-xs text-blue-200 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#8aa5d6] shrink-0" />
              <span>
                <strong>{confirmedNumber}</strong> has been added to the suppression registry and
                removed from cache.
              </span>
            </div>
          )}
        </form>
      </main>

      <SiteFooter />
    </div>
  );
}
