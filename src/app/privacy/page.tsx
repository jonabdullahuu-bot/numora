import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
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

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-14 space-y-8 text-sm leading-relaxed text-slate-300">
        <div>
          <p className="text-xs uppercase tracking-widest text-sky-400 font-semibold">Data Protection</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">Privacy Policy</h1>
          <p className="text-xs text-slate-500 mt-2">Last Updated: November 2026</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">1. Information We Process</h2>
          <p>
            When you perform a lookup on Numora, we normalize the entered phone number into international E.164 format
            and query telecom carrier registries to retrieve carrier operator, line classification, and country/region metadata.
            We never notify the owner of a searched phone number.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">2. Payment & Session Data</h2>
          <p>
            Payment card details are processed exclusively by Paddle.com and never touch Numora servers. We store only
            your Paddle transaction identifier (e.g., <code className="text-indigo-300">txn_...</code>) to verify report unlocks
            and manage pass credits in your browser session.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">3. Opt-Out & Suppression Rights</h2>
          <p>
            Any individual may request that their phone number be suppressed from Numora lookups at any time via our{' '}
            <a href="/opt-out" className="text-indigo-300 underline hover:text-indigo-200">
              Do Not Sell / Remove My Info
            </a>{' '}
            registry. Once added, lookups for that E.164 number are immediately blocked.
          </p>
        </section>
      </main>
    </div>
  );
}
