"use client";

import React, { useEffect, useState } from "react";
import { Activity, ShieldCheck, KeyRound, AlertTriangle, ArrowUpRight } from "@/components/NumoraIcons";

type WaveProfile = {
  id: string;
  label: string;
  badge: string;
  tone: "voip" | "mobile" | "ported";
  badgeTone: string;
  dotColor: string;
  summary: string;
  bars: number[];
  spikeIndices: number[];
  routingLayer: string;
  simBinding: string;
  signalScore: string;
};

const WAVE_PROFILES: WaveProfile[] = [
  {
    id: "voip",
    label: "VoIP Burner Spike",
    badge: "Anomaly Detected · Non-Fixed VoIP",
    tone: "voip",
    badgeTone: "text-[#d5be96] bg-[#b89b6a]/14 border-[#b89b6a]/35",
    dotColor: "#b89b6a",
    summary:
      "Virtual CLEC routing with zero SIM registration, a common signature of wrong-number scam texts.",
    bars: [22, 34, 28, 42, 36, 48, 32, 56, 94, 72, 40, 29, 44, 31, 25, 36],
    spikeIndices: [8, 9],
    routingLayer: "Wholesale SIP / CLEC",
    simBinding: "None (Virtual Cloud)",
    signalScore: "88 / 100 Risk",
  },
  {
    id: "mobile",
    label: "Verified Mobile SIM",
    badge: "Clean Carrier · Tier-1 Wireless",
    tone: "mobile",
    badgeTone: "text-[#9cb6e0] bg-[#4d6fa9]/16 border-[#8aa5d6]/35",
    dotColor: "#8aa5d6",
    summary:
      "Stable hardware SIM or eSIM allocation with native carrier routing and zero abuse flags.",
    bars: [34, 42, 48, 52, 46, 50, 54, 49, 47, 51, 45, 48, 43, 40, 37, 33],
    spikeIndices: [],
    routingLayer: "Native SS7 / Mobile",
    simBinding: "Hardware SIM / eSIM",
    signalScore: "08 / 100 Risk",
  },
  {
    id: "ported",
    label: "Recently Ported",
    badge: "Routing Shift · Carrier Migrated",
    tone: "ported",
    badgeTone: "text-zinc-200 bg-white/[0.07] border-white/15",
    dotColor: "#9cb6e0",
    summary:
      "Number moved between carriers. NumoraLookup resolves the live operating network instead of stale prefix tables.",
    bars: [24, 30, 36, 33, 44, 62, 76, 68, 54, 45, 50, 54, 46, 38, 32, 26],
    spikeIndices: [6, 7],
    routingLayer: "LNP Ported Registry",
    simBinding: "Migrated Subscriber",
    signalScore: "42 / 100 Caution",
  },
];

const CHANNEL_TAGS = [
  "01", "02", "03", "04", "05", "06", "07", "08",
  "09", "10", "11", "12", "13", "14", "15", "16",
];

export default function AppleFeatureShowcase() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setActiveIdx((p) => (p + 1) % WAVE_PROFILES.length), 4600);
    return () => clearInterval(t);
  }, [paused]);

  const profile = WAVE_PROFILES[activeIdx];

  return (
    <section className="relative mt-24 space-y-8 z-10">
      {/* Live Signal Waveform Analyzer */}
      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="rounded-3xl apple-card p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center overflow-hidden"
      >
        <div className="lg:col-span-5 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8aa5d6]">
            <Activity className="w-3.5 h-3.5" />
            <span>Live Signal Profiling</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-[1.1]">
            Built like hardware. Priced without traps.
          </h2>
          <p
            key={profile.id}
            className="text-sm text-zinc-400 leading-relaxed min-h-[3.25rem] animate-node-pop"
          >
            {profile.summary}
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {WAVE_PROFILES.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveIdx(i)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${
                  i === activeIdx
                    ? "liquid-glass-blue text-white"
                    : "liquid-glass-pill text-zinc-300"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Calibrated Hardware Spectrum Monitor */}
        <div className="lg:col-span-7 rounded-2xl bg-[#141519] border border-white/[0.09] p-5 sm:p-6 space-y-4">
          {/* Top Instrument Header */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full transition-colors duration-500"
                style={{ backgroundColor: profile.dotColor }}
              />
              <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-zinc-400">
                Telecom Signature Monitor
              </span>
            </div>
            <span
              className={`text-[11px] font-semibold px-3 py-1 rounded-full border transition-colors duration-500 ${profile.badgeTone}`}
            >
              {profile.badge}
            </span>
          </div>

          {/* Spectrum Plot Area with dB Gridlines & Smooth Liquid Bars */}
          <div className="relative rounded-xl bg-[#181a20] border border-white/[0.06] pt-5 pb-3 px-3 sm:px-4">
            {/* Horizontal Calibrated Gridlines */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-3 sm:inset-x-4 top-5 bottom-8 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between border-b border-dashed border-[#b89b6a]/30 pb-0.5">
                <span className="font-mono text-[9px] uppercase tracking-wider text-[#d5be96]/75">
                  Anomaly Threshold
                </span>
                <span className="font-mono text-[9px] text-zinc-600">-06 dB</span>
              </div>
              <div className="flex items-center justify-end border-b border-white/[0.05] pb-0.5">
                <span className="font-mono text-[9px] text-zinc-600">-18 dB</span>
              </div>
              <div className="flex items-center justify-end border-b border-white/[0.05] pb-0.5">
                <span className="font-mono text-[9px] text-zinc-600">-32 dB</span>
              </div>
              <div className="border-b border-white/[0.1]" />
            </div>

            {/* 16 Persistent Channels — Smoothly Morphing Heights (Zero Remount Snap) */}
            <div className="relative z-10 h-40 sm:h-44 flex items-end justify-between gap-1.5 sm:gap-2">
              {profile.bars.map((height, idx) => {
                const isSpike = profile.spikeIndices.includes(idx);
                const staggerMs = idx * 16;
                const barBg = isSpike
                  ? "#b89b6a"
                  : profile.tone === "mobile"
                    ? "#5476b0"
                    : "#5c7cb0";
                const capBg = isSpike ? "#e6cfa4" : "#9cb6e0";

                return (
                  <div
                    key={idx}
                    className="flex-1 h-full flex flex-col justify-end items-center gap-1.5"
                  >
                    <div className="w-full flex-1 flex items-end rounded-t-md bg-white/[0.02] overflow-hidden">
                      <div
                        className="w-full rounded-t-md relative"
                        style={{
                          height: `${height}%`,
                          backgroundColor: barBg,
                          boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.24)",
                          transitionProperty: "height, background-color",
                          transitionDuration: "720ms, 500ms",
                          transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1), ease",
                          transitionDelay: `${staggerMs}ms, 0ms`,
                        }}
                      >
                        {/* Precision Peak-Hold Cap */}
                        <span
                          className="block w-full h-[2.5px] rounded-t-md"
                          style={{
                            backgroundColor: capBg,
                            transition: "background-color 500ms ease",
                          }}
                        />
                      </div>
                    </div>
                    <span className="font-mono text-[9px] text-zinc-600 tabular-nums select-none">
                      {CHANNEL_TAGS[idx]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Telemetry Readout Strip */}
          <div className="grid grid-cols-3 gap-2.5 pt-0.5 text-xs">
            <div className="rounded-xl bg-[#181a20] border border-white/[0.06] px-3 py-2">
              <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                Routing Layer
              </div>
              <div className="font-medium text-zinc-100 mt-0.5 truncate">
                {profile.routingLayer}
              </div>
            </div>
            <div className="rounded-xl bg-[#181a20] border border-white/[0.06] px-3 py-2">
              <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                SIM Registration
              </div>
              <div className="font-medium text-zinc-100 mt-0.5 truncate">
                {profile.simBinding}
              </div>
            </div>
            <div className="rounded-xl bg-[#181a20] border border-white/[0.06] px-3 py-2">
              <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                Signal Assessment
              </div>
              <div
                className={`font-mono font-semibold mt-0.5 truncate tabular-nums ${
                  profile.tone === "voip" ? "text-[#d5be96]" : "text-[#9cb6e0]"
                }`}
              >
                {profile.signalScore}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Asymmetric 12-Column Proof Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 group rounded-3xl apple-card overflow-hidden flex flex-col justify-between">
          <div>
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#141519]">
              <img
                src="/images/scam-waveform.jpg"
                alt="Smoked glass telecom waveform highlighting a VoIP anomaly spike"
                className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition duration-700 ease-out"
              />
            </div>

            <div className="p-6 sm:p-7 space-y-3">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#d5be96]">
                <AlertTriangle className="w-3.5 h-3.5" />
                Primary Detection · VoIP Burner Patterns
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-white">
                Catch pig-butchering & wrong-number burners before replying
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Most wrong-number and off-app dating scams run through free virtual texting gateways
                such as TextNow, Google Voice, and Bandwidth.com CLEC blocks. NumoraLookup flags
                Non-Fixed VoIP lines on the free upfront check.
              </p>
            </div>
          </div>

          <div className="mx-6 sm:mx-7 mb-6 sm:mb-7 rounded-2xl bg-[#141519] border border-white/[0.08] p-4 flex flex-col sm:flex-row sm:divide-x divide-y sm:divide-y-0 divide-white/[0.08] text-center">
            <div className="flex-1 py-2 sm:py-0">
              <div className="text-base sm:text-lg font-bold text-white tabular-nums">190+</div>
              <div className="text-[11px] text-zinc-500 mt-0.5">Country Prefixes</div>
            </div>
            <div className="flex-1 py-2 sm:py-0">
              <div className="text-base sm:text-lg font-bold text-[#d5be96] tabular-nums">0%</div>
              <div className="text-[11px] text-zinc-500 mt-0.5">Target Alert Rate</div>
            </div>
            <div className="flex-1 py-2 sm:py-0">
              <div className="text-base sm:text-lg font-bold text-[#9cb6e0] tabular-nums">$7.95</div>
              <div className="text-[11px] text-zinc-500 mt-0.5">One-Time Pass</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="group rounded-3xl apple-card overflow-hidden flex-1 flex flex-col justify-between">
            <div className="relative h-40 w-full overflow-hidden bg-[#141519]">
              <img
                src="/images/privacy-shield.jpg"
                alt="Frosted smoked-glass privacy shield monolith"
                className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition duration-700 ease-out"
              />
            </div>
            <div className="p-6">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#8aa5d6]">
                <ShieldCheck className="w-3.5 h-3.5" />
                Zero-Alert Privacy
              </div>
              <h3 className="text-lg font-semibold text-white mt-1.5">
                Self-serve opt-out & non-FCRA boundaries
              </h3>
              <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                Lookups never notify the number owner, and anyone can suppress their own line
                immediately via the self-serve opt-out registry.
              </p>
            </div>
          </div>

          <div className="group rounded-3xl apple-card overflow-hidden flex-1 flex flex-col justify-between">
            <div className="relative h-40 w-full overflow-hidden bg-[#141519]">
              <img
                src="/images/access-token.jpg"
                alt="Matte black anodized aluminum and frosted glass one-time access pass"
                className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition duration-700 ease-out"
              />
            </div>
            <div className="p-6">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#8aa5d6]">
                <KeyRound className="w-3.5 h-3.5" />
                Transparent Access Tokens
              </div>
              <h3 className="text-lg font-semibold text-white mt-1.5">
                One-time passes. Zero monthly subscriptions.
              </h3>
              <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                Free carrier telemetry upfront. Unlock deeper dossiers with one-time passes, never
                $39/mo recurring billing.
              </p>
              <a
                href="/pricing"
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#8aa5d6] hover:text-white transition"
              >
                View one-time passes
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
