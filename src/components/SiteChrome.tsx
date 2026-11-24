import Link from "next/link";

export function SiteHeader() {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-slate-800/80 bg-[#050811]/85 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
          <a href="/" className="flex items-center gap-2 sm:gap-3 group min-w-0">
            <img
              src="/logo.jpg"
              alt="NumoraLookup Logo"
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl object-cover border border-emerald-500/40 shadow-sm shrink-0 numora-card"
            />
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="text-base sm:text-xl font-bold tracking-tight text-white truncate">
                NumoraLookup
              </span>
            </div>
          </a>

          <nav className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm shrink-0">
            <a
              href="/pricing"
              className="text-slate-300 hover:text-white transition font-medium whitespace-nowrap"
            >
              Pricing
            </a>
            <Link
              href="/blog"
              className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors whitespace-nowrap"
            >
              Blog
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.1] text-white text-xs font-semibold transition whitespace-nowrap"
            >
              Dashboard
            </Link>
          </nav>
        </div>
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
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.jpg"
              alt="NumoraLookup Logo"
              className="h-7 w-7 rounded-lg object-cover border border-emerald-500/40 shrink-0"
            />
            <span className="font-semibold text-white">NumoraLookup</span>
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
