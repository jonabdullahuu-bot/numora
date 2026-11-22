'use client';

import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';

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
    <div className="min-h-screen bg-[#060913] text-slate-200 flex flex-col">
      <header className="border-b border-white/[0.07] bg-[#060913]/85 sticky top-0 z-20 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="font-bold text-white text-lg">Numora</a>
          <a href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </a>
        </div>
      </header>

      <main className="flex-1 max-w-xl mx-auto w-full px-6 py-16 space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Self-Serve Suppression Registry</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Remove My Phone Number
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Enter your international phone number (including country code such as <code className="text-slate-200">+1</code>,{' '}
            <code className="text-slate-200">+44</code>, or <code className="text-slate-200">+383</code>) to purge any cached
            entry and block future lookups on Numora.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-[#0c1120] border border-white/[0.09] p-6 sm:p-8 space-y-5 shadow-xl"
        >
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Phone Number (with Country Code)
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 212 555 0199"
              className="w-full px-4 py-3 rounded-xl bg-[#060913] border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 tabular-nums"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Optional Note
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Personal privacy preference"
              className="w-full px-4 py-3 rounded-xl bg-[#060913] border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Processing Suppression...' : 'Suppress Number from Numora'}
          </button>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {confirmedNumber && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-400/30 text-xs text-emerald-200 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>{confirmedNumber}</strong> has been added to the suppression registry and
                removed from cache.
              </span>
            </div>
          )}
        </form>
      </main>
    </div>
  );
}
