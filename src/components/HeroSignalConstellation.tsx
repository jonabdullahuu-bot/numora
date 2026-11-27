"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ShieldAlert,
  CheckCircle2,
  Radio,
  Wifi,
  Globe2,
  SimCard,
  SignalTower,
  CloudVoip,
  PortSwitch,
  MessageRelay,
  ShieldCheck,
  Smartphone,
} from "@/components/NumoraIcons";

type IconKey = "sim" | "tower" | "voip" | "port" | "relay" | "shield" | "phone" | "globe";

type SignalNode = {
  name: string;
  status: string;
  tone: "voip" | "mobile" | "neutral";
  icon: IconKey;
  color: string;
};

type BaseAnchor = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isLeft: boolean;
};

const SLOT_POOLS: SignalNode[][] = [
  [
    { name: "Verizon Wireless", status: "SIM Verified", tone: "mobile", icon: "sim", color: "#4d6fa9" },
    { name: "T-Mobile US", status: "Mobile Active", tone: "mobile", icon: "tower", color: "#5e7fb5" },
  ],
  [
    { name: "TextNow VoIP", status: "Burner Flagged", tone: "voip", icon: "voip", color: "#b89b6a" },
    { name: "Bandwidth CLEC", status: "Non-Fixed VoIP", tone: "voip", icon: "voip", color: "#7085a3" },
  ],
  [
    { name: "AT&T Mobility", status: "Carrier Valid", tone: "mobile", icon: "phone", color: "#5c7cb0" },
    { name: "Vodafone UK", status: "E.164 Valid", tone: "mobile", icon: "globe", color: "#6c88b8" },
  ],
  [
    { name: "Google Voice", status: "Virtual Line", tone: "voip", icon: "voip", color: "#b89b6a" },
    { name: "Sinch Gateway", status: "Cloud VoIP", tone: "voip", icon: "tower", color: "#788596" },
  ],
  [
    { name: "Messaging Relay", status: "VoIP Risk Check", tone: "neutral", icon: "relay", color: "#808996" },
    { name: "Telegram VoIP", status: "Relay Checked", tone: "neutral", icon: "relay", color: "#6b82a3" },
  ],
  [
    { name: "Spam Registry", status: "0 Reports", tone: "mobile", icon: "shield", color: "#4d6fa9" },
    { name: "Porting Check", status: "Recently Ported", tone: "voip", icon: "port", color: "#b89b6a" },
  ],
];

const TRACE_META = [
  { delay: "0s", stroke: "#5c7cb0" },
  { delay: "1.1s", stroke: "#7a95c4" },
  { delay: "2.2s", stroke: "#5c7cb0" },
  { delay: "0.55s", stroke: "#5c7cb0" },
  { delay: "1.65s", stroke: "#7a95c4" },
  { delay: "2.75s", stroke: "#5c7cb0" },
];

// Gentle, independent orbital panning parameters for each card
const PAN_MOTION = [
  { ax: 9, ay: 7, sx: 0.52, sy: 0.41, px: 0.0, py: 0.6 },
  { ax: 10, ay: 6, sx: 0.44, sy: 0.56, px: 1.9, py: 2.4 },
  { ax: 8, ay: 7, sx: 0.58, sy: 0.46, px: 3.7, py: 1.1 },
  { ax: 9, ay: 7, sx: 0.48, sy: 0.53, px: 1.2, py: 3.5 },
  { ax: 10, ay: 6, sx: 0.55, sy: 0.43, px: 4.4, py: 0.8 },
  { ax: 8, ay: 7, sx: 0.46, sy: 0.51, px: 2.6, py: 4.2 },
];

const NODE_STYLES: React.CSSProperties[] = [
  { position: "absolute", left: "1.5%", top: "18%", transform: "translate3d(0px, -50%, 0)", width: "196px" },
  { position: "absolute", left: "0.5%", top: "51%", transform: "translate3d(0px, -50%, 0)", width: "196px" },
  { position: "absolute", left: "1.5%", top: "84%", transform: "translate3d(0px, -50%, 0)", width: "196px" },
  { position: "absolute", right: "1.5%", top: "18%", transform: "translate3d(0px, -50%, 0)", width: "196px" },
  { position: "absolute", right: "0.5%", top: "51%", transform: "translate3d(0px, -50%, 0)", width: "196px" },
  { position: "absolute", right: "1.5%", top: "84%", transform: "translate3d(0px, -50%, 0)", width: "196px" },
];

function renderNodeIcon(key: IconKey) {
  const cls = "w-4 h-4 text-white";
  switch (key) {
    case "sim": return <SimCard className={cls} />;
    case "tower": return <SignalTower className={cls} />;
    case "voip": return <CloudVoip className={cls} />;
    case "port": return <PortSwitch className={cls} />;
    case "relay": return <MessageRelay className={cls} />;
    case "shield": return <ShieldCheck className={cls} />;
    case "phone": return <Smartphone className={cls} />;
    case "globe": return <Globe2 className={cls} />;
  }
}

export default function HeroSignalConstellation({ children }: { children: React.ReactNode }) {
  const [slotIndex, setSlotIndex] = useState<number[]>([0, 0, 0, 0, 0, 0]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const bgPathRefs = useRef<(SVGPathElement | null)[]>([]);
  const pulsePathRefs = useRef<(SVGPathElement | null)[]>([]);
  const startDotRefs = useRef<(SVGCircleElement | null)[]>([]);
  const endDotRefs = useRef<(SVGCircleElement | null)[]>([]);

  const baseAnchorsRef = useRef<(BaseAnchor | null)[]>([null, null, null, null, null, null]);
  const liveOffsetRef = useRef<{ dx: number; dy: number }[]>(
    Array.from({ length: 6 }, () => ({ dx: 0, dy: 0 }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const target = Math.floor(Math.random() * 6);
      setSlotIndex((prev) => prev.map((val, idx) => (idx === target ? (val + 1) % 2 : val)));
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const measureBase = () => {
      const cRect = container.getBoundingClientRect();
      if (cRect.width < 100 || cRect.height < 100) return;

      if (svgRef.current) {
        svgRef.current.setAttribute("viewBox", `0 0 ${cRect.width.toFixed(1)} ${cRect.height.toFixed(1)}`);
      }

      // Target the exact visual search bar box (never the helper links below it or dropdown input)
      const submitBtn = container.querySelector('button[type="submit"]') as HTMLElement | null;
      const telInput = container.querySelector('input[type="tel"]') as HTMLElement | null;
      const anchorEl = submitBtn || telInput;
      const searchBox =
        (anchorEl?.closest(".backdrop-blur-md") as HTMLElement | null) ||
        (anchorEl?.closest(".rounded-2xl") as HTMLElement | null) ||
        (container.querySelector("form") as HTMLElement | null);

      const sRect = searchBox?.getBoundingClientRect();
      const btnRect = submitBtn?.getBoundingClientRect();

      const targetLeft = sRect ? sRect.left - cRect.left : cRect.width * 0.32;
      const targetRight = sRect ? sRect.right - cRect.left : cRect.width * 0.68;

      // Always align vertically to the true center of the input/button row
      const targetMidY =
        sRect && sRect.height <= 110
          ? sRect.top - cRect.top + sRect.height / 2
          : btnRect
            ? btnRect.top - cRect.top + btnRect.height / 2
            : sRect
              ? sRect.top - cRect.top + 34
              : cRect.height * 0.62;

      const spread = sRect && sRect.height <= 110 ? Math.min(13, Math.max(9, (sRect.height - 28) / 3)) : 11;

      for (let i = 0; i < 6; i++) {
        const el = nodeRefs.current[i];
        if (!el) {
          baseAnchorsRef.current[i] = null;
          continue;
        }
        const nRect = el.getBoundingClientRect();
        if (nRect.width === 0 || nRect.height === 0) {
          baseAnchorsRef.current[i] = null;
          continue;
        }

        const isLeft = i < 3;
        const rowSlot = isLeft ? i - 1 : i - 4;
        const off = liveOffsetRef.current[i];

        const baseX1 = (isLeft ? nRect.right - cRect.left : nRect.left - cRect.left) - off.dx;
        const baseY1 = nRect.top - cRect.top + nRect.height / 2 - off.dy;

        baseAnchorsRef.current[i] = {
          x1: baseX1,
          y1: baseY1,
          x2: isLeft ? targetLeft : targetRight,
          y2: targetMidY + rowSlot * spread,
          isLeft,
        };
      }
    };

    const drawFrame = (nowMs: number) => {
      const t = reducedMotion ? 0 : nowMs / 1000;

      for (let i = 0; i < 6; i++) {
        const base = baseAnchorsRef.current[i];
        const nodeEl = nodeRefs.current[i];
        if (!base || !nodeEl) continue;

        const cfg = PAN_MOTION[i];
        const dx = reducedMotion ? 0 : Math.sin(t * cfg.sx + cfg.px) * cfg.ax;
        const dy = reducedMotion ? 0 : Math.cos(t * cfg.sy + cfg.py) * cfg.ay;

        liveOffsetRef.current[i] = { dx, dy };
        nodeEl.style.transform = `translate3d(${dx.toFixed(2)}px, calc(-50% + ${dy.toFixed(2)}px), 0)`;

        const x1 = base.x1 + dx;
        const y1 = base.y1 + dy;
        const x2 = base.x2;
        const y2 = base.y2;

        const curve = Math.max(46, Math.abs(x2 - x1) * 0.52);
        const cx1 = base.isLeft ? x1 + curve : x1 - curve;
        const cx2 = base.isLeft ? x2 - curve : x2 + curve;

        const d = `M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${cx1.toFixed(1)} ${y1.toFixed(1)}, ${cx2.toFixed(1)} ${y2.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`;

        bgPathRefs.current[i]?.setAttribute("d", d);
        pulsePathRefs.current[i]?.setAttribute("d", d);

        const sDot = startDotRefs.current[i];
        if (sDot) {
          sDot.setAttribute("cx", x1.toFixed(1));
          sDot.setAttribute("cy", y1.toFixed(1));
          sDot.setAttribute("opacity", "0.9");
        }

        const eDot = endDotRefs.current[i];
        if (eDot) {
          eDot.setAttribute("cx", x2.toFixed(1));
          eDot.setAttribute("cy", y2.toFixed(1));
          eDot.setAttribute("opacity", "0.75");
        }
      }
    };

    let rafId = 0;
    const tick = (now: number) => {
      drawFrame(now);
      if (!reducedMotion) {
        rafId = requestAnimationFrame(tick);
      }
    };

    measureBase();
    rafId = requestAnimationFrame(tick);

    const onResize = () => {
      measureBase();
      if (reducedMotion) drawFrame(0);
    };

    const ro = new ResizeObserver(onResize);
    ro.observe(container);
    window.addEventListener("resize", onResize);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(onResize).catch(() => {});
    }

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full xl:-mx-16 xl:w-[calc(100%+8rem)] pt-10 pb-10 sm:pt-12 sm:pb-12 z-40"
      style={{ position: "relative", minHeight: "430px" }}
    >
      <svg
        ref={svgRef}
        fill="none"
        className="pointer-events-none hidden xl:block absolute inset-0 w-full h-full z-0"
      >
        {TRACE_META.map((trace, idx) => (
          <g key={idx}>
            <path
              ref={(el) => {
                bgPathRefs.current[idx] = el;
              }}
              stroke="rgba(255,255,255,0.09)"
              strokeWidth="1.1"
            />
            <path
              ref={(el) => {
                pulsePathRefs.current[idx] = el;
              }}
              pathLength={320}
              stroke={trace.stroke}
              strokeWidth="1.6"
              strokeLinecap="round"
              className="animate-trace-pulse"
              style={{ animationDelay: trace.delay }}
            />
            <circle
              ref={(el) => {
                startDotRefs.current[idx] = el;
              }}
              r="2.6"
              fill={trace.stroke}
              opacity="0"
            />
            <circle
              ref={(el) => {
                endDotRefs.current[idx] = el;
              }}
              r="2.3"
              fill={trace.stroke}
              opacity="0"
            />
          </g>
        ))}
      </svg>

      {SLOT_POOLS.map((pool, i) => {
        const node = pool[slotIndex[i]];
        return (
          <div
            key={i}
            ref={(el) => {
              nodeRefs.current[i] = el;
            }}
            style={{ ...NODE_STYLES[i], zIndex: 15, willChange: "transform" }}
            className="hidden xl:flex items-center px-3.5 py-2.5 rounded-2xl apple-card"
          >
            <div key={node.name} className="flex items-center gap-2.5 w-full min-w-0 animate-node-pop">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-white/15"
                style={{ backgroundColor: node.color }}
              >
                {renderNodeIcon(node.icon)}
              </div>
              <div className="leading-tight min-w-0">
                <div className="text-xs font-semibold text-white truncate">{node.name}</div>
                <div className="flex items-center gap-1 text-[10px] mt-0.5 whitespace-nowrap">
                  {node.tone === "voip" ? (
                    <ShieldAlert className="w-3 h-3 text-[#d5be96] shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3 text-[#8aa5d6] shrink-0" />
                  )}
                  <span className={node.tone === "voip" ? "text-[#d5be96] truncate" : "text-zinc-400 truncate"}>
                    {node.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <div className="relative z-40 max-w-3xl mx-auto text-center px-2 sm:px-4">
        <div className="liquid-glass-pill inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs text-zinc-300 mb-6">
          <span className="flex -space-x-1">
            <span className="w-4 h-4 rounded-full bg-[#4d6fa9]/30 border border-[#8aa5d6]/35 flex items-center justify-center">
              <Radio className="w-2.5 h-2.5 text-[#9cb6e0]" />
            </span>
            <span className="w-4 h-4 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
              <Wifi className="w-2.5 h-2.5 text-zinc-200" />
            </span>
            <span className="w-4 h-4 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
              <Globe2 className="w-2.5 h-2.5 text-zinc-200" />
            </span>
          </span>
          <span className="font-medium text-white">190+ countries</span>
          <span className="text-zinc-400">· Live carrier & VoIP routing</span>
        </div>

        {children}
      </div>
    </div>
  );
}
