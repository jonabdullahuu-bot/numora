"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Smartphone,
  Globe,
  CloudVoip,
  SimCard,
  SignalTower,
  MessageRelay,
  ShieldCheck,
  ShieldAlert,
  Radio,
} from "@/components/NumoraIcons";

type RadarIconKey = "voip" | "sim" | "relay" | "phone" | "tower";

type RadarTarget = {
  id: string;
  carrier: string;
  status: string;
  bearingLabel: string;
  angle: number;
  radius: number;
  tone: "mobile" | "voip";
  icon: RadarIconKey;
};

type DossierCard = {
  id: string;
  tabLabel: string;
  carrier: string;
  tier: string;
  badge: string;
  tone: "voip" | "mobile" | "moderate";
  icon: RadarIconKey;
  riskScore: number;
  riskLabel: string;
  rows: [string, string][];
  footerRight: string;
};

const RADAR_TARGETS: RadarTarget[] = [
  {
    id: "textnow",
    carrier: "TextNow VoIP",
    status: "Non-Fixed Burner Flagged",
    bearingLabel: "300° WNW",
    angle: -60,
    radius: 124,
    tone: "voip",
    icon: "voip",
  },
  {
    id: "verizon",
    carrier: "Verizon Wireless",
    status: "Hardware SIM Verified",
    bearingLabel: "332° NNW",
    angle: -28,
    radius: 118,
    tone: "mobile",
    icon: "sim",
  },
  {
    id: "gvoice",
    carrier: "Google Voice",
    status: "Virtual Relay Detected",
    bearingLabel: "002° NNE",
    angle: 2,
    radius: 136,
    tone: "voip",
    icon: "relay",
  },
  {
    id: "att",
    carrier: "AT&T Mobility",
    status: "Native E.164 Active",
    bearingLabel: "032° NNE",
    angle: 32,
    radius: 118,
    tone: "mobile",
    icon: "phone",
  },
  {
    id: "bandwidth",
    carrier: "Bandwidth CLEC",
    status: "Wholesale VoIP Block",
    bearingLabel: "062° ENE",
    angle: 62,
    radius: 126,
    tone: "voip",
    icon: "tower",
  },
];

const DOSSIER_CARDS: DossierCard[] = [
  {
    id: "bandwidth",
    tabLabel: "VoIP Burner",
    carrier: "Bandwidth.com CLEC",
    tier: "Wholesale Virtual Gateway",
    badge: "Burner VoIP",
    tone: "voip",
    icon: "voip",
    riskScore: 84,
    riskLabel: "Elevated Scam Risk",
    rows: [
      ["Number", "+1 (646) 555-0194"],
      ["Line Type", "Non-Fixed VoIP (App)"],
      ["SIM Binding", "None (Virtual Cloud Route)"],
      ["Region", "New York, NY · US"],
    ],
    footerRight: "Passive · Unnotified",
  },
  {
    id: "verizon",
    tabLabel: "Mobile SIM",
    carrier: "Verizon Wireless",
    tier: "Tier-1 Mobile Carrier",
    badge: "Verified Mobile",
    tone: "mobile",
    icon: "sim",
    riskScore: 8,
    riskLabel: "Low Risk Profile",
    rows: [
      ["Number", "+1 (312) 555-0148"],
      ["Line Type", "Mobile (Hardware SIM / eSIM)"],
      ["Region", "Chicago, IL · US"],
      ["Port Status", "Active Native Wireless"],
    ],
    footerRight: "Passive · Unnotified",
  },
  {
    id: "gvoice",
    tabLabel: "Virtual Line",
    carrier: "Google Voice",
    tier: "Cloud Forwarding Number",
    badge: "Virtual Line",
    tone: "moderate",
    icon: "tower",
    riskScore: 52,
    riskLabel: "Moderate Caution",
    rows: [
      ["Number", "+1 (415) 555-0172"],
      ["Line Type", "VoIP / Virtual Forwarding"],
      ["Region", "San Francisco, CA · US"],
      ["Carrier Switch", "Ported to Virtual Host"],
    ],
    footerRight: "No Subscription",
  },
];

const DIAL_CX = 210;
const DIAL_CY = 200;
const DIAL_R = 176;

function polarToCartesian(degFromTop: number, radius: number) {
  const rad = ((degFromTop - 90) * Math.PI) / 180;
  return {
    x: DIAL_CX + radius * Math.cos(rad),
    y: DIAL_CY + radius * Math.sin(rad),
  };
}

function renderIcon(key: RadarIconKey, className: string) {
  switch (key) {
    case "voip":
      return <CloudVoip className={className} />;
    case "sim":
      return <SimCard className={className} />;
    case "relay":
      return <MessageRelay className={className} />;
    case "phone":
      return <Smartphone className={className} />;
    case "tower":
      return <SignalTower className={className} />;
  }
}

const COMPASS_TICKS = Array.from({ length: 37 }, (_, i) => {
  const deg = -90 + i * 5;
  const isMajor = deg % 30 === 0;
  const isMedium = !isMajor && deg % 15 === 0;
  const innerR = isMajor ? DIAL_R - 11 : isMedium ? DIAL_R - 7 : DIAL_R - 4;
  const p1 = polarToCartesian(deg, innerR);
  const p2 = polarToCartesian(deg, DIAL_R);
  return { deg, isMajor, isMedium, p1, p2 };
});

const CARDINAL_LABELS = [
  { deg: -60, text: "300°" },
  { deg: -30, text: "330°" },
  { deg: 0, text: "000°" },
  { deg: 30, text: "030°" },
  { deg: 60, text: "060°" },
];

export default function TelemetryRadarBento() {
  const [activeTargetIdx, setActiveTargetIdx] = useState(3);
  const [pauseCompass, setPauseCompass] = useState(false);

  const [activeDossier, setActiveDossier] = useState(1);
  const [pauseDossier, setPauseDossier] = useState(false);

  useEffect(() => {
    if (pauseCompass) return;
    const t = setInterval(() => {
      setActiveTargetIdx((prev) => (prev + 1) % RADAR_TARGETS.length);
    }, 3200);
    return () => clearInterval(t);
  }, [pauseCompass]);

  useEffect(() => {
    if (pauseDossier) return;
    const t = setInterval(() => {
      setActiveDossier((prev) => (prev + 1) % DOSSIER_CARDS.length);
    }, 4400);
    return () => clearInterval(t);
  }, [pauseDossier]);

  const activeTarget = RADAR_TARGETS[activeTargetIdx];
  const currentCard = DOSSIER_CARDS[activeDossier];
  const beamColor = activeTarget.tone === "voip" ? "#cfa86e" : "#8aa5d6";

  const toneBadgeClass =
    currentCard.tone === "mobile"
      ? "bg-[#4d6fa9]/18 text-[#9cb6e0] border-[#8aa5d6]/35"
      : currentCard.tone === "voip"
        ? "bg-[#b89b6a]/18 text-[#dfc598] border-[#b89b6a]/40"
        : "bg-white/[0.06] text-zinc-200 border-white/15";

  const toneIconBg =
    currentCard.tone === "mobile"
      ? "bg-[#4d6fa9]"
      : currentCard.tone === "voip"
        ? "bg-[#b89b6a]"
        : "bg-[#5c7cb0]";

  const riskBarColor =
    currentCard.tone === "mobile"
      ? "#5c7cb0"
      : currentCard.tone === "voip"
        ? "#b89b6a"
        : "#9c8a66";

  return (
    <section className="relative mt-20 space-y-8 z-10">
      {/* Section Header */}
      <div className="max-w-2xl space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8aa5d6]">
          <Radio className="w-3.5 h-3.5" />
          <span>Live Telemetry Architecture</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-[1.12]">
          Precision carrier intelligence, zero guesswork.
        </h2>
        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
          Inspect real-time line routing, burner gateways, and scam indicators in seconds, without
          alerting the caller.
        </p>
      </div>

      {/* Top 2-Card Interactive Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* LEFT CARD: CARRIER TELEMETRY COMPASS */}
        <div
          onMouseEnter={() => setPauseCompass(true)}
          onMouseLeave={() => setPauseCompass(false)}
          className="rounded-3xl apple-card p-6 sm:p-7 flex flex-col justify-between gap-6"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.16em] text-zinc-400">
              <span
                className="w-2 h-2 rounded-full transition-colors duration-300"
                style={{ backgroundColor: beamColor }}
              />
              <span>Carrier Telemetry Compass</span>
            </div>
            <span className="font-mono text-xs font-semibold tabular-nums px-2.5 py-1 rounded-md bg-[#141519] border border-white/[0.08] text-[#9cb6e0]">
              {activeTarget.bearingLabel}
            </span>
          </div>

          {/* Precision Radar Stage */}
          <div className="rounded-2xl bg-[#141519] border border-white/[0.07] pt-4 pb-3.5 px-3 sm:px-5 flex flex-col items-center justify-between gap-3">
            <div className="relative w-full max-w-[420px] aspect-[420/220] select-none">
              <svg viewBox="0 0 420 220" fill="none" className="w-full h-full overflow-visible">
                <defs>
                  <clipPath id="numoraDialClip">
                    <rect x="0" y="0" width="420" height="200" />
                  </clipPath>
                  <linearGradient id="beamConeSteel" x1="210" y1="24" x2="210" y2="200" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#8aa5d6" stopOpacity="0.24" />
                    <stop offset="70%" stopColor="#4d6fa9" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#4d6fa9" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="beamConeBrass" x1="210" y1="24" x2="210" y2="200" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#d5be96" stopOpacity="0.26" />
                    <stop offset="70%" stopColor="#b89b6a" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#b89b6a" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Subtle recessed semicircle plate */}
                <path
                  d="M 34 200 A 176 176 0 0 1 386 200 Z"
                  fill="#181a20"
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="1"
                />

                {/* Concentric range arcs */}
                <path
                  d="M 78 200 A 132 132 0 0 1 342 200"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="1"
                  strokeDasharray="3 4"
                />
                <path
                  d="M 122 200 A 88 88 0 0 1 298 200"
                  stroke="rgba(255,255,255,0.07)"
                  strokeWidth="1"
                />
                <path
                  d="M 166 200 A 44 44 0 0 1 254 200"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="1"
                />

                {/* Radial bearing spokes */}
                {[-60, -30, 0, 30, 60].map((deg) => {
                  const pt = polarToCartesian(deg, DIAL_R - 12);
                  return (
                    <line
                      key={deg}
                      x1={DIAL_CX}
                      y1={DIAL_CY}
                      x2={pt.x.toFixed(1)}
                      y2={pt.y.toFixed(1)}
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Outer precision compass degree ticks */}
                {COMPASS_TICKS.map((tick) => (
                  <line
                    key={tick.deg}
                    x1={tick.p1.x.toFixed(1)}
                    y1={tick.p1.y.toFixed(1)}
                    x2={tick.p2.x.toFixed(1)}
                    y2={tick.p2.y.toFixed(1)}
                    stroke={
                      tick.isMajor
                        ? "rgba(255,255,255,0.34)"
                        : tick.isMedium
                          ? "rgba(255,255,255,0.18)"
                          : "rgba(255,255,255,0.09)"
                    }
                    strokeWidth={tick.isMajor ? "1.3" : "1"}
                  />
                ))}

                {/* Degree markers along inner rim */}
                {CARDINAL_LABELS.map((lbl) => {
                  const pt = polarToCartesian(lbl.deg, DIAL_R - 21);
                  return (
                    <text
                      key={lbl.deg}
                      x={pt.x.toFixed(1)}
                      y={pt.y.toFixed(1)}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="rgba(255,255,255,0.34)"
                      fontSize="8.5"
                      fontFamily="var(--font-mono-custom), monospace"
                    >
                      {lbl.text}
                    </text>
                  );
                })}

                {/* Locked scanner cone + needle */}
                <g clipPath="url(#numoraDialClip)">
                  <g
                    style={{
                      transform: `rotate(${activeTarget.angle}deg)`,
                      transformOrigin: "210px 200px",
                      transition: "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)",
                    }}
                  >
                    <path
                      d="M 210 200 L 156.2 34.5 A 174 174 0 0 1 263.8 34.5 Z"
                      fill={activeTarget.tone === "voip" ? "url(#beamConeBrass)" : "url(#beamConeSteel)"}
                    />
                    <line
                      x1="210"
                      y1="200"
                      x2="210"
                      y2="26"
                      stroke={beamColor}
                      strokeWidth="1.75"
                      strokeLinecap="round"
                    />
                    <circle cx="210" cy="28" r="2.5" fill={beamColor} />
                  </g>
                </g>

                {/* Baseline horizon + hardware pivot pin */}
                <line x1="22" y1="200" x2="398" y2="200" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
                <circle cx="210" cy="200" r="8" fill="#141519" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
                <circle cx="210" cy="200" r="3.5" fill={beamColor} />
              </svg>

              {/* Interactive Telecom Icon Nodes */}
              {RADAR_TARGETS.map((target, idx) => {
                const pos = polarToCartesian(target.angle, target.radius);
                const leftPct = (pos.x / 420) * 100;
                const topPct = (pos.y / 220) * 100;
                const isActive = idx === activeTargetIdx;
                const accent = target.tone === "voip" ? "#b89b6a" : "#4d6fa9";
                const accentSoft = target.tone === "voip" ? "#dfc598" : "#9cb6e0";

                return (
                  <button
                    key={target.id}
                    type="button"
                    onClick={() => setActiveTargetIdx(idx)}
                    aria-label={`Inspect ${target.carrier}`}
                    style={{
                      left: `${leftPct.toFixed(2)}%`,
                      top: `${topPct.toFixed(2)}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                    className="absolute z-10 group cursor-pointer focus:outline-none"
                  >
                    {isActive && (
                      <span
                        className="pointer-events-none absolute -inset-2 rounded-full border animate-sonar-ping"
                        style={{ borderColor: accentSoft }}
                      />
                    )}
                    <span
                      className={`relative flex items-center justify-center rounded-full transition-all duration-300 border ${
                        isActive
                          ? "w-10 h-10 scale-105 shadow-lg"
                          : "w-8 h-8 opacity-75 hover:opacity-100 hover:scale-105"
                      }`}
                      style={{
                        backgroundColor: isActive ? accent : "#1c1f27",
                        borderColor: isActive ? accentSoft : "rgba(255,255,255,0.16)",
                      }}
                    >
                      {renderIcon(
                        target.icon,
                        isActive ? "w-4 h-4 text-white" : "w-3.5 h-3.5 text-zinc-300"
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Cleanly Docked Target Telemetry Readout */}
            <div className="w-full rounded-xl bg-[#1b1d23] border border-white/[0.08] px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: beamColor }}
                />
                <span className="font-semibold text-white truncate">{activeTarget.carrier}</span>
                <span className="hidden sm:inline text-zinc-500">·</span>
                <span
                  className={`hidden sm:inline truncate ${
                    activeTarget.tone === "voip" ? "text-[#d5be96]" : "text-[#9cb6e0]"
                  }`}
                >
                  {activeTarget.status}
                </span>
              </div>
              <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#141519] border border-white/[0.08] text-zinc-400">
                {activeTarget.tone === "voip" ? "VoIP Flag" : "SIM Active"}
              </span>
            </div>
          </div>

          {/* Bottom Copy */}
          <div className="pt-4 border-t border-white/[0.08] space-y-2">
            <h3 className="text-xl font-semibold text-white tracking-tight">
              190+ country networks in one scan
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              NumoraLookup queries carrier line-type registries and VoIP gateway blocks
              simultaneously and flags burner lines the moment routing resolves.
            </p>
          </div>
        </div>

        {/* RIGHT CARD: LIVE DOSSIER PREVIEW */}
        <div
          onMouseEnter={() => setPauseDossier(true)}
          onMouseLeave={() => setPauseDossier(false)}
          className="rounded-3xl apple-card p-6 sm:p-7 flex flex-col justify-between gap-6"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.16em] text-zinc-400">
              <span
                className="w-2 h-2 rounded-full transition-colors duration-300"
                style={{ backgroundColor: riskBarColor }}
              />
              <span>Live Dossier Preview</span>
            </div>
            <span className="font-mono text-xs font-semibold tabular-nums px-2.5 py-1 rounded-md bg-[#141519] border border-white/[0.08] text-zinc-300">
              0{activeDossier + 1} / 0{DOSSIER_CARDS.length}
            </span>
          </div>

          {/* Interactive Switcher + Centered Unclipped Stacked Deck */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {DOSSIER_CARDS.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveDossier(idx)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${
                    idx === activeDossier
                      ? "liquid-glass-blue text-white"
                      : "liquid-glass-pill text-zinc-300"
                  }`}
                >
                  {item.tabLabel}
                </button>
              ))}
            </div>

            {/* Stacked Depth Wrapper (fully centered, zero clipping) */}
            <div className="relative pb-3">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-4 bottom-0 h-8 rounded-2xl bg-[#141519]/75 border border-white/[0.06]"
              />
              <div
                key={currentCard.id}
                className="relative rounded-2xl bg-[#141519] border border-white/[0.11] p-5 shadow-xl space-y-4 animate-node-pop"
              >
                {/* Carrier Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl ${toneIconBg} flex items-center justify-center shrink-0 border border-white/15`}
                    >
                      {renderIcon(currentCard.icon, "w-5 h-5 text-white")}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm sm:text-base font-semibold text-white truncate">
                        {currentCard.carrier}
                      </div>
                      <div className="text-xs text-zinc-400 truncate">{currentCard.tier}</div>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${toneBadgeClass}`}
                  >
                    {currentCard.tone === "mobile" ? (
                      <ShieldCheck className="w-3 h-3" />
                    ) : (
                      <ShieldAlert className="w-3 h-3" />
                    )}
                    <span>{currentCard.badge}</span>
                  </span>
                </div>

                {/* Telemetry Rows */}
                <div className="divide-y divide-white/[0.06] border-y border-white/[0.07]">
                  {currentCard.rows.map(([label, value]) => (
                    <div
                      key={label}
                      className="py-2.5 flex items-center justify-between gap-4 text-xs sm:text-[13px]"
                    >
                      <span className="text-zinc-500 shrink-0">{label}</span>
                      <span className="font-mono font-medium text-zinc-100 text-right truncate">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Risk Meter + Privacy Guarantee */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-zinc-400 tabular-nums">
                        Risk Score: <strong className="text-white">{currentCard.riskScore}/100</strong>
                      </span>
                      <span className="hidden sm:inline text-zinc-600">·</span>
                      <span
                        className={`hidden sm:inline font-medium ${
                          currentCard.tone === "voip" ? "text-[#d5be96]" : "text-[#9cb6e0]"
                        }`}
                      >
                        {currentCard.riskLabel}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-[#8aa5d6]">
                      {currentCard.footerRight}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/[0.07] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${currentCard.riskScore}%`,
                        backgroundColor: riskBarColor,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Copy + Interactive Pager */}
          <div className="pt-4 border-t border-white/[0.08] flex items-end justify-between gap-4">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-white tracking-tight">
                Every lookup, with real routing proof
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                See carrier name, Non-Fixed VoIP classification, region, and scam risk upfront,
                with optional one-time passes and zero recurring subscriptions.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 shrink-0 pb-1">
              {DOSSIER_CARDS.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveDossier(idx)}
                  aria-label={`Show ${item.carrier} preview`}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === activeDossier ? "w-6 bg-[#8aa5d6]" : "w-1.5 bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom 2 Hardware Showcase Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group rounded-3xl apple-card overflow-hidden">
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#141519]">
            <img
              src="/images/sim-vs-voip.jpg"
              alt="Physical hardware SIM card compared against a virtual VoIP glass prism"
              className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition duration-700 ease-out"
            />
          </div>
          <div className="p-6 relative z-10 border-t border-white/[0.06]">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#8aa5d6]">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Line-Type Intelligence</span>
            </div>
            <h3 className="text-xl font-semibold text-white mt-2">
              Hardware SIM vs. Virtual VoIP Gateways
            </h3>
            <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
              Separate verified Tier-1 mobile carriers from disposable app numbers issued through
              TextNow, Google Voice, and wholesale VoIP blocks in one check.
            </p>
          </div>
        </div>

        <div className="group rounded-3xl apple-card overflow-hidden">
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#141519]">
            <img
              src="/images/global-routing.jpg"
              alt="Global smoked glass telecom routing visualization"
              className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition duration-700 ease-out"
            />
          </div>
          <div className="p-6 relative z-10 border-t border-white/[0.06]">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#8aa5d6]">
              <Globe className="w-3.5 h-3.5" />
              <span>Global Passive Routing</span>
            </div>
            <h3 className="text-xl font-semibold text-white mt-2">
              190+ Countries, Zero Target Notifications
            </h3>
            <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
              Every query runs passively against carrier routing and metadata registries, never
              triggering a text, missed call, or alert on the target phone.
            </p>
            <a
              href="/pricing"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#8aa5d6] hover:text-white transition"
            >
              <span>Inspect one-time passes</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
