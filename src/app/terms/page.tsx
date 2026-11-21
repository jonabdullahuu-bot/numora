import React from 'react';
import { ArrowLeft, Scale } from 'lucide-react';

export default function TermsPage() {
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
          <p className="text-xs uppercase tracking-widest text-indigo-400 font-semibold">Legal & Billing</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">Terms of Service & Refund Policy</h1>
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
            Merchant of Record for all our orders, provides all customer service inquiries related to payment processing,
            and handles returns and tax/VAT collection.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">4. Refund Policy</h2>
          <p>
            Because Numora delivers instant digital telecom intelligence upon unlocking a dossier:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
            <li>
              <strong>Unused Passes:</strong> If you purchased a Standard or Premium Pass and have used zero (0) report
              credits, you may request a full refund within 14 days of purchase.
            </li>
            <li>
              <strong>Technical Failures:</strong> If a technical error prevents a verified pass from unlocking a valid
              report and our support team cannot resolve it, you are eligible for a full refund.
            </li>
            <li>
              <strong>Data Availability:</strong> Telecommunications carriers restrict private subscriber names and emails
              in many jurisdictions. Unlisted subscriber status on an unlocked carrier report does not constitute a service defect.
            </li>
          </ul>
          <p className="text-slate-400">
            To request billing assistance or a refund, contact <span className="text-indigo-300">support@numora.app</span> or
            use the receipt link provided in your Paddle confirmation email.
          </p>
        </section>
      </main>
    </div>
  );
}
