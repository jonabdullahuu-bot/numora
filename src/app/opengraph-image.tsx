import { ImageResponse } from "next/og";

export const alt = "NumoraLookup - Reverse Phone Lookup, VoIP & Carrier Scam Checker";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #020617 0%, #0f172a 58%, #064e3b 100%)",
          padding: "52px 60px",
          color: "#f8fafc",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "#10b981",
                color: "#020617",
                fontSize: 24,
                fontWeight: 900,
              }}
            >
              N
            </div>
            <span style={{ fontSize: 30, fontWeight: 800, color: "#ffffff" }}>
              NumoraLookup
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              borderRadius: 999,
              border: "1px solid rgba(16, 185, 129, 0.5)",
              background: "rgba(16, 185, 129, 0.14)",
              padding: "8px 18px",
              fontSize: 16,
              fontWeight: 700,
              color: "#34d399",
              letterSpacing: 0.6,
            }}
          >
            NO SUBSCRIPTIONS | 100% PRIVATE
          </div>
        </div>

        {/* Center split: Headline + Product Preview Card */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            gap: 36,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "55%",
              gap: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 50,
                fontWeight: 800,
                lineHeight: 1.1,
                color: "#ffffff",
              }}
            >
              Spot VoIP Burners & Unknown Callers in Seconds
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 22,
                lineHeight: 1.45,
                color: "#cbd5e1",
              }}
            >
              Instant carrier routing, Google Voice / TextNow detection, and scam risk checks. Owner is never notified.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "42%",
              background: "rgba(15, 23, 42, 0.94)",
              border: "2px solid rgba(16, 185, 129, 0.45)",
              borderRadius: 24,
              padding: 28,
              gap: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 700, color: "#94a3b8", letterSpacing: 1 }}>
                TELECOM SCAN PREVIEW
              </span>
              <span
                style={{
                  borderRadius: 999,
                  background: "rgba(245, 158, 11, 0.18)",
                  border: "1px solid rgba(245, 158, 11, 0.5)",
                  color: "#fbbf24",
                  padding: "4px 12px",
                  fontSize: 14,
                  fontWeight: 800,
                }}
              >
                VOIP RISK
              </span>
            </div>

            <div style={{ display: "flex", fontSize: 28, fontWeight: 800, color: "#ffffff" }}>
              +1 (555) 019-2834
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                borderTop: "1px solid rgba(148, 163, 184, 0.2)",
                paddingTop: 14,
                fontSize: 18,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#94a3b8" }}>Line Type</span>
                <span style={{ color: "#fbbf24", fontWeight: 700 }}>Non-Fixed VoIP</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#94a3b8" }}>Carrier</span>
                <span style={{ color: "#f8fafc", fontWeight: 700 }}>TextNow / Bandwidth</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#94a3b8" }}>Privacy</span>
                <span style={{ color: "#34d399", fontWeight: 700 }}>Owner Never Notified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(148, 163, 184, 0.2)",
            paddingTop: 18,
            width: "100%",
          }}
        >
          <span style={{ fontSize: 22, fontWeight: 800, color: "#34d399" }}>
            numoralookup.com
          </span>
          <div style={{ display: "flex", gap: 24, fontSize: 18, color: "#94a3b8" }}>
            <span>190+ Countries</span>
            <span>Instant Results</span>
            <span>One-Time Passes</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
