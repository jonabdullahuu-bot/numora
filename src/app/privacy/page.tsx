import React from 'react';
import { SiteHeader, SiteFooter } from '../../components/SiteChrome';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-numora-grid text-slate-200">
      <SiteHeader />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-14 space-y-8 text-sm leading-relaxed text-zinc-300 animate-fade-up">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#8aa5d6] font-semibold">Data Protection</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">Privacy Policy</h1>
          <p className="text-xs text-zinc-500 mt-2">Last Updated: November 2026</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">1. Information We Process</h2>
          <p>
            When you perform a lookup on NumoraLookup, we normalize the entered phone number into international E.164 format
            and query telecom carrier registries to retrieve carrier operator, line classification, and country/region metadata.
            We never notify the owner of a searched phone number.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">2. Payment & Access Token Data</h2>
          <p>
            Payment card details are processed exclusively by <strong>Paddle.com</strong> (our Merchant of Record) and
            never touch NumoraLookup servers. We store only your Paddle transaction identifier (e.g.,{' '}
            <code className="text-blue-300">txn_...</code>) and generated Access Token (e.g.,{' '}
            <code className="text-blue-300">NMR-...</code>) to verify report unlocks and manage pass credits across
            your sessions.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">3. Opt-Out & Suppression Rights</h2>
          <p>
            Any individual may request that their phone number be suppressed from NumoraLookup lookups at any time via our{' '}
            <a href="/opt-out" className="text-[#8aa5d6] underline hover:text-blue-300">
              Opt-Out / Remove My Info
            </a>{' '}
            registry. Once added, lookups for that E.164 number are immediately blocked.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">4. Privacy Inquiries</h2>
          <p className="text-zinc-400">
            For data protection questions or deletion requests, email{' '}
            <a href="mailto:support@numoralookup.com" className="text-[#8aa5d6] hover:underline">
              support@numoralookup.com
            </a>
            .
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}