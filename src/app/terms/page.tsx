import React from 'react';
import { Scale } from 'lucide-react';
import { SiteHeader, SiteFooter } from '../../components/SiteChrome';

export default function TermsPage() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-numora-grid text-slate-200">
      <SiteHeader />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-14 space-y-8 text-sm leading-relaxed text-slate-300 animate-fade-up">
        <div>
          <p className="text-xs uppercase tracking-widest text-emerald-400 font-semibold">Legal & Billing</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">Terms of Service</h1>
          <p className="text-xs text-slate-500 mt-2">Last Updated: November 2026</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">1. Overview of Service</h2>
          <p>
            Numora (“we,” “our,” or “us”) provides browser-based telephone number
            formatting, carrier routing telemetry, line-type classification (mobile, landline, or VoIP),
            regional origin metadata, and available public directory status across international numbering plans.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">2. Permissible Use & FCRA Disclaimer</h2>
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/25 text-xs text-amber-100 flex items-start gap-3">
            <Scale className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
            <p>
              Numora is NOT a Consumer Reporting Agency as defined by the Fair Credit Reporting Act (15 U.S.C. § 1681 et seq.).
              You may not use Numora or any report obtained through Numora to evaluate eligibility for credit, employment,
              tenant housing, insurance, or any other FCRA-regulated purpose.
            </p>
          </div>
          <p>
            You agree not to use Numora for harassment, stalking, unlawful surveillance, or automated scraping.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">3. One-Time Passes & Billing (Paddle Merchant of Record)</h2>
          <p>
            Numora offers one-time digital report passes (Standard Pass: $7.95 USD for 4 report credits;
            Premium Pass: $15.95 USD for 12 report credits). Passes are single one-time purchases and do not
            auto-renew into recurring subscriptions.
          </p>
          <p>
            Our order process is conducted by our online reseller <strong>Paddle.com</strong>. Paddle.com is the
            Merchant of Record for all our orders. Paddle provides all customer service inquiries and handles returns.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">4. Refunds & Buyer Support</h2>
          <p>
            Refund eligibility and procedures are governed by our{' '}
            <a href="/refund" className="text-emerald-400 underline hover:text-emerald-300">
              Refund Policy
            </a>
            . Unused passes may be refunded within 14 calendar days of purchase.
          </p>
          <p className="text-slate-400">
            For customer support or billing assistance, contact{' '}
            <a href="mailto:support@numoralookup.com" className="text-emerald-400 hover:underline">
              support@numoralookup.com
            </a>{' '}
            or use the receipt link provided in your Paddle confirmation email.
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}