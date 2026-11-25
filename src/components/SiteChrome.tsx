"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const SOCIAL_LINKS = [
  {
    name: "X (Twitter)",
    href: "https://x.com/NumoraLookup",
    svg: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@NumoraLookup",
    svg: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    name: "Reddit",
    href: "https://www.reddit.com/user/NumoraLookup/",
    svg: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@numoralookup",
    svg: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/numoralookup/",
    svg: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61596552735679",
    svg: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: "Medium",
    href: "https://medium.com/@numoralookup",
    svg: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M13.54 12a6.8 6.8 0 0 1-6.77 6.82A6.8 6.8 0 0 1 0 12a6.8 6.8 0 0 1 6.77-6.82A6.8 6.8 0 0 1 13.54 12zm7.42 0c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
      </svg>
    ),
  },
];

export function SiteHeader() {
  const [credits, setCredits] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const readWallet = () => {
      try {
        const raw = window.localStorage.getItem("numora_pass_wallet_v1");
        if (!raw) {
          setCredits(0);
          return null;
        }
        const parsed = JSON.parse(raw);
        const count =
          typeof parsed?.creditsRemaining === "number" ? parsed.creditsRemaining : 0;
        setCredits(count);
        return parsed;
      } catch {
        setCredits(0);
        return null;
      }
    };

    const initial = readWallet();

    if (initial?.accessToken) {
      fetch(`/api/tokens?token=${encodeURIComponent(initial.accessToken)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((fresh) => {
          if (typeof fresh?.creditsRemaining === "number") {
            setCredits(fresh.creditsRemaining);
            window.localStorage.setItem(
              "numora_pass_wallet_v1",
              JSON.stringify({
                ...initial,
                creditsRemaining: fresh.creditsRemaining,
                unlockedNumbers: fresh.unlockedNumbers || initial.unlockedNumbers || [],
                expiresAt: fresh.expiresAt || initial.expiresAt,
              })
            );
          }
        })
        .catch(() => {});
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === "numora_pass_wallet_v1") {
        readWallet();
      }
    };

    const interval = window.setInterval(readWallet, 2000);
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", readWallet);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", readWallet);
    };
  }, []);

  const creditsCount = credits ?? 0;
  const hasCredits = creditsCount > 0;

  const navLinkClass =
    "text-slate-300 hover:text-white transition font-medium whitespace-nowrap";
  const mobileNavLinkClass =
    "block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/[0.06] hover:text-white transition";

  const creditBadge = (
    <span
      aria-label={`${creditsCount} ${creditsCount === 1 ? "credit" : "credits"} remaining`}
      className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border text-[11px] sm:text-xs font-semibold whitespace-nowrap tabular-nums select-none ${
        hasCredits
          ? "bg-emerald-500/15 border-emerald-400/35 text-emerald-300"
          : "bg-slate-900/80 border-slate-700/80 text-slate-300"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full shrink-0 ${
          hasCredits ? "bg-emerald-400" : "bg-slate-500"
        }`}
      />
      <span>
        {creditsCount} {creditsCount === 1 ? "Credit" : "Credits"}
      </span>
    </span>
  );

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-slate-800/80 bg-[#050811]/85 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
          <a
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 sm:gap-3 group min-w-0"
          >
            <img
              src="/logo.jpg"
              alt="NumoraLookup Logo"
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl object-cover border border-emerald-500/40 shadow-sm shrink-0 numora-card"
            />
            <span className="text-sm sm:text-xl font-bold tracking-tight text-white truncate">
              NumoraLookup
            </span>
          </a>

          {/* Desktop & Tablet: Pricing, Blog, Dashboard, then Credits */}
          <nav className="hidden sm:flex items-center gap-5 md:gap-6 text-xs sm:text-sm shrink-0">
            <a href="/pricing" className={navLinkClass}>
              Pricing
            </a>
            <Link href="/blog" className={navLinkClass}>
              Blog
            </Link>
            <Link href="/dashboard" className={navLinkClass}>
              Dashboard
            </Link>
            {creditBadge}
          </nav>

          {/* Phone: Credits outside menu + Dropdown button */}
          <div className="flex sm:hidden items-center gap-2 shrink-0">
            {creditBadge}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.12] text-white transition cursor-pointer"
            >
              {mobileMenuOpen ? (
                <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-current" fill="none" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-current" fill="none" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Phone Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-800/80 bg-[#070b16]/95 backdrop-blur-md px-4 py-3 space-y-1">
            <a
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileNavLinkClass}
            >
              Pricing
            </a>
            <Link
              href="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileNavLinkClass}
            >
              Blog
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileNavLinkClass}
            >
              Dashboard
            </Link>
          </div>
        )}
      </header>
      <div className="h-14 sm:h-16 w-full shrink-0" aria-hidden="true" />
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative w-full border-t border-slate-800/80 bg-[#050811]/85 backdrop-blur-md text-slate-400 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div className="rounded-xl border border-slate-800/90 bg-slate-900/50 p-4 sm:p-5 text-xs sm:text-sm leading-relaxed text-slate-300 numora-card">
          <strong className="text-white">Important Boundary:</strong> NumoraLookup provides informational phone lookup and risk context only. It is not a consumer reporting agency under the Fair Credit Reporting Act (FCRA) and must not be used for credit, employment, insurance, or tenant screening decisions.
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 text-xs sm:text-sm">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.jpg"
                alt="NumoraLookup Logo"
                className="h-7 w-7 rounded-lg object-cover border border-emerald-500/40 shrink-0"
              />
              <span className="font-semibold text-white">NumoraLookup</span>
            </div>

            <div className="flex items-center gap-2" aria-label="Official social media profiles">
              {SOCIAL_LINKS.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.name}
                  title={item.name}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/70 text-slate-400 hover:border-emerald-500/40 hover:text-emerald-300 transition"
                >
                  {item.svg}
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-slate-400">
            <Link href="/terms" className="hover:text-white numora-link">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-white numora-link">
              Privacy Policy
            </Link>
            <Link href="/refund" className="hover:text-white numora-link">
              Refund Policy
            </Link>
            <Link href="/opt-out" className="hover:text-white numora-link">
              Opt-Out
            </Link>
            <a href="mailto:support@numoralookup.com" className="hover:text-white numora-link">
              support@numoralookup.com
            </a>
          </div>
        </div>

        <div className="border-t border-slate-800/70 pt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-500">
          <p>© 2026 NumoraLookup. All rights reserved.</p>
          <p>
            Disclaimer: NumoraLookup is not a Consumer Reporting Agency under the Fair Credit Reporting Act (FCRA) and may not be used for employment, tenant screening, or credit decisions.
          </p>
        </div>
      </div>
    </footer>
  );
}
