'use client';

import React from 'react';
import {
  ShieldCheck,
  Radio,
  EyeOff,
  CreditCard,
  Globe2,
  AlertTriangle,
  Smartphone,
} from "@/components/NumoraIcons";

interface DetectionCard {
  id: string;
  badge: string;
  badgeStyle: string;
  sampleTag: string;
  title: string;
  detail: string;
  statusDot: string;
  footer: string;
  icon: 'voip' | 'mobile' | 'privacy' | 'billing' | 'scam' | 'global';
}

const DETECTION_CARDS: DetectionCard[] = [
  {
    id: 'voip-burner',
    badge: 'Non-Fixed VoIP Detected',
    badgeStyle: 'text-[#dfc087] bg-[#cfa058]/10 border-[#cfa058]/30',
    sampleTag: 'Sample: +1 (415) •••-8412',
    title: 'Burner App / Virtual Line Flagged',
    detail:
      'Identifies cloud texting apps like TextNow, Google Voice, and temporary SIP numbers before you reply.',
    statusDot: 'bg-[#cfa058]',
    footer: 'Line Type: Non-Fixed VoIP • Elevated Risk',
    icon: 'voip',
  },
  {
    id: 'carrier-verified',
    badge: 'Carrier Verified',
    badgeStyle: 'text-blue-300 bg-[#4d6fa9]/10 border-[#8aa5d6]/30',
    sampleTag: 'Sample: +1 (312) •••-2904',
    title: 'Standard Mobile Network Confirmed',
    detail:
      'Separates real cellular carriers like Verizon, AT&T, and T-Mobile from disposable virtual gateways.',
    statusDot: 'bg-blue-400',
    footer: 'Line Type: Mobile • Live Telecom Routing',
    icon: 'mobile',
  },
  {
    id: 'anonymous',
    badge: '100% Anonymous',
    badgeStyle: 'text-blue-200 bg-[#4d6fa9]/10 border-[#8aa5d6]/25',
    sampleTag: 'Zero Alerts Sent',
    title: 'The Caller Is Never Notified',
    detail:
      'Every search runs passively against carrier routing tables in the background, with no pings, texts, or alerts.',
    statusDot: 'bg-[#6c92e6]',
    footer: 'Private Passive Lookup • No Login Required',
    icon: 'privacy',
  },
  {
    id: 'wrong-number',
    badge: 'Scam Risk Signal',
    badgeStyle: 'text-rose-300 bg-rose-500/10 border-rose-400/30',
    sampleTag: 'Sample: +1 (646) •••-5178',
    title: 'Built for Wrong-Number & Dating Texts',
    detail:
      'Verify suspicious "Hey, long time no talk" texts, marketplace buyers, and dating app numbers in seconds.',
    statusDot: 'bg-rose-400',
    footer: 'Instant VoIP & Carrier Mismatch Check',
    icon: 'scam',
  },
  {
    id: 'no-subscription',
    badge: 'No Subscription Traps',
    badgeStyle: 'text-[#8aa5d6] bg-[#4d6fa9]/10 border-[#8aa5d6]/30',
    sampleTag: 'One-Time Credit Passes',
    title: 'Pay Once, Reopen Unlocked Numbers Free',
    detail:
      'No fake 5-minute progress bars or sneaky $29/month renewals. Your private NMR- token saves unlocked dossiers.',
    statusDot: 'bg-[#5a86cc]',
    footer: 'Secured Checkout • 0 Recurring Charges',
    icon: 'billing',
  },
  {
    id: 'global',
    badge: '190+ Countries',
    badgeStyle: 'text-blue-300 bg-[#4d6fa9]/10 border-[#8aa5d6]/30',
    sampleTag: 'Sample: +44 7700 •••419',
    title: 'International Carrier & Format Checks',
    detail:
      'Check US, UK, Canadian, European, and global numbers from one search bar with automatic E.164 parsing.',
    statusDot: 'bg-blue-400',
    footer: 'Global Number Validation & Routing',
    icon: 'global',
  },
];

function CardIcon({ type }: { type: DetectionCard['icon'] }) {
  switch (type) {
    case 'voip':
      return <Radio className="w-4 h-4 text-[#d8ae68] shrink-0" />;
    case 'mobile':
      return <Smartphone className="w-4 h-4 text-[#8aa5d6] shrink-0" />;
    case 'privacy':
      return <EyeOff className="w-4 h-4 text-[#8aa5d6] shrink-0" />;
    case 'scam':
      return <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />;
    case 'billing':
      return <CreditCard className="w-4 h-4 text-[#8aa5d6] shrink-0" />;
    case 'global':
      return <Globe2 className="w-4 h-4 text-[#8aa5d6] shrink-0" />;
  }
}

function CardRow({ hidden = false }: { hidden?: boolean }) {
  return (
    <div
      aria-hidden={hidden}
      className="flex shrink-0 items-stretch gap-4 sm:gap-5 pr-4 sm:pr-5"
    >
      {DETECTION_CARDS.map((card) => (
        <div
          key={`${hidden ? 'dup-' : ''}${card.id}`}
          className="w-[300px] sm:w-[345px] shrink-0 rounded-2xl bg-[#1b1d23] border border-white/[0.09] apple-card p-5 shadow-xl flex flex-col justify-between gap-4 hover:border-[#8aa5d6]/30 transition-colors"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${card.badgeStyle}`}
              >
                {card.badge}
              </span>
              <CardIcon type={card.icon} />
            </div>

            <div className="font-mono text-[11px] font-semibold text-zinc-400 tracking-wide">
              {card.sampleTag}
            </div>

            <h3 className="text-base font-bold text-white leading-snug">
              {card.title}
            </h3>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              {card.detail}
            </p>
          </div>

          <div className="pt-3 border-t border-white/[0.07] text-[11px] font-semibold text-zinc-300 flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${card.statusDot}`} />
            <span className="truncate">{card.footer}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function DetectionMarquee() {
  return (
    <section
      aria-label="What NumoraLookup Detects"
      className="w-full py-10 sm:py-14 overflow-hidden relative z-10"
    >
      <style>{`
        @keyframes numora-detect-marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .numora-detect-track {
          display: flex;
          width: max-content;
          will-change: transform;
          animation: numora-detect-marquee 42s linear infinite;
        }
        .numora-detect-track:hover {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .numora-detect-track {
            animation: none;
          }
          .numora-detect-container {
            overflow-x: auto;
          }
        }
      `}</style>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-7 text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4d6fa9]/10 border border-[#8aa5d6]/25 text-blue-300 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>What NumoraLookup Detects</span>
        </div>
        <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white">
          Real Carrier Signals. Zero Subscription Tricks.
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
          Sample line-type signals and privacy checks from a standard scan (hover any card to pause).
        </p>
      </div>

      <div className="numora-detect-container relative w-full overflow-hidden" style={{ WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)", maskImage: "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)" }}>
        <div className="numora-detect-track">
          <CardRow />
          <CardRow hidden />
        </div>
      </div>
    </section>
  );
}
