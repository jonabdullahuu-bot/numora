import React from 'react';
import { SiteHeader, SiteFooter } from '../../components/SiteChrome';
import { RefreshCcw, ShieldCheck } from 'lucide-react';

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-numora-grid text-slate-200">
      <SiteHeader />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-14 space-y-8 text-sm leading-relaxed text-slate-300 animate-fade-up">
        <div>
          <p className="text-xs uppercase tracking-widest text-emerald-400 font-semibold">
            Billing & Buyer Protection
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
            Refund Policy
          </h1>
          <p className="text-xs text-slate-500 mt-2">Last Updated: November 2026</p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-400/25 text-xs text-emerald-100 flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p>
            Our order process is conducted by our online reseller <strong>Paddle.com</strong>.
            Paddle.com is the Merchant of Record for all our orders. Paddle provides all customer
            service inquiries and handles returns.
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">1. One-Time Passes & Digital Delivery</h2>
          <p>
            Numora sells one-time lookup credit passes (Standard Pass: $7.95 USD for 4 credits;
            Premium Pass: $15.95 USD for 12 credits). Passes do not auto-renew into recurring
            subscriptions. Credits are issued immediately upon payment verification via a private
            Access Token.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">2. Eligibility for Refunds</h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-300">
            <li>
              <strong>Unused Passes (14-Day Window):</strong> If you purchased a Standard Pass or
              Premium Pass and have redeemed zero (0) lookup credits, you may request a full refund
              within 14 calendar days of the transaction date.
            </li>
            <li>
              <strong>Technical Delivery Failures:</strong> If a verified payment fails to issue an
              active Access Token or a technical malfunction prevents you from unlocking a valid
              report and our team cannot resolve it, you are eligible for a full refund.
            </li>
            <li>
              <strong>Statutory Consumer Rights:</strong> Nothing in this policy limits mandatory
              statutory withdrawal or consumer protection rights applicable in your jurisdiction
              (including the EU, EEA, UK, or Switzerland).
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">3. Non-Refundable Circumstances</h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-300">
            <li>
              <strong>Redeemed Credits:</strong> Once lookup credits have been spent to generate and
              unlock digital intelligence dossiers, those consumed credits are non-refundable except
              where required by law or in the event of a verified technical defect.
            </li>
            <li>
              <strong>Public Directory Availability:</strong> Telecom carriers and privacy laws
              restrict subscriber names or email addresses on certain mobile/VoIP lines. An
              “Unlisted” subscriber record on a completed carrier report does not
              constitute a defective product.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <RefreshCcw className="w-4 h-4 text-emerald-400" />
            <span>4. How to Request a Refund</span>
          </h2>
          <p>
            To request a refund, please include your <strong>Paddle Order / Transaction ID</strong>{' '}
            and your <strong>Access Token</strong> (if issued) and contact either:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
            <li>
              <strong>Paddle Buyer Support:</strong> Use the receipt link in your Paddle order
              confirmation email or visit{' '}
              <a
                href="https://paddle.net"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:underline"
              >
                paddle.net
              </a>
              .
            </li>
            <li>
              <strong>Numora Support:</strong> Email{' '}
              <a
                href="mailto:support@numoralookup.com"
                className="text-emerald-400 hover:underline"
              >
                support@numoralookup.com
              </a>{' '}
              and we will respond within 1–2 business days.
            </li>
          </ul>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}