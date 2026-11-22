import type { Metadata } from "next";
import Link from "next/link";
import { BLOG_POSTS } from "../../data/blogPosts";
import { SiteHeader, SiteFooter } from "../../components/SiteChrome";

export const metadata: Metadata = {
  title: "Phone Scam & Reverse Lookup Safety Blog | Numora",
  description:
    "Guides on spotting VoIP burner numbers, verifying unknown callers, avoiding dating app catfish, and understanding reverse phone lookup privacy.",
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-numora-grid text-slate-100">
      <SiteHeader />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 animate-fade-up">
        <header className="text-center max-w-2xl mx-auto mb-14 animate-fade-up">
          <span className="inline-block rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-medium text-emerald-400 mb-4">
            Phone Intelligence & Scam Prevention
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Verify Unknown Numbers Before You Trust Them
          </h1>
          <p className="text-base sm:text-lg text-slate-400">
            Actionable guides on carrier forensics, VoIP burner detection, and protecting yourself from phone scams.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 animate-fade-up-1">
          {BLOG_POSTS.map((post) => (
            <article
              key={post.slug}
              className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-7 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-950/30 numora-card"
            >
              <div>
                <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                  <span className="rounded-md bg-slate-800 px-2.5 py-1 font-medium text-emerald-400">
                    {post.category}
                  </span>
                  <span>{post.readTime}</span>
                  <span>•</span>
                  <time dateTime={post.publishedAt}>{post.publishedAt}</time>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                <p className="text-sm sm:text-base text-slate-400 leading-relaxed mb-6">
                  {post.description}
                </p>
              </div>
              <Link
                href={`/blog/${post.slug}`}
                className="inline-flex items-center text-sm font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform"
              >
                Read full guide →
              </Link>
            </article>
          ))}
        </section>

        <section className="mt-16 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 to-emerald-950/30 p-8 sm:p-10 text-center animate-fade-up-1 numora-card">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Have a Suspicious Number Right Now?
          </h2>
          <p className="text-slate-300 max-w-xl mx-auto mb-6 text-sm sm:text-base">
            Run an instant, 100% anonymous carrier and line-type lookup across 200+ countries.
          </p>
          <Link
            href="/"
            className="inline-block rounded-xl bg-emerald-500 px-6 py-3.5 text-sm sm:text-base font-bold text-slate-950 hover:bg-emerald-400 transition-all duration-200 hover:scale-[1.02] numora-btn"
          >
            Start Free Phone Lookup →
          </Link>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}