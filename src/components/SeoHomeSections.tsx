"use client";

import { useState } from "react";
import Link from "next/link";
import { BLOG_POSTS } from "../data/blogPosts";

const HOME_FAQS = [
  {
    q: "How does Numora check an unknown phone number?",
    a: "Numora queries international telecommunications routing and carrier intelligence to identify the country prefix, network operator, and line type (mobile, landline, or virtual VoIP).",
  },
  {
    q: "Is my reverse phone lookup 100% anonymous?",
    a: "Yes. Searches are completely confidential—the owner of the phone number never receives any text, missed call, or notification.",
  },
  {
    q: "Can Numora detect VoIP burner numbers like Google Voice or TextNow?",
    a: "Yes. Line-type classification helps distinguish between standard wireless carrier lines and non-fixed VoIP numbers commonly used for disposable burner accounts.",
  },
  {
    q: "Which countries are supported?",
    a: "Numora supports E.164 international phone number lookups across 190+ countries including the US, UK, Canada, Australia, and Europe.",
  },
];

export function SeoHomeSections() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: HOME_FAQS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-20 text-slate-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <section className="animate-fade-up">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            How to Check a Phone Number in 3 Steps
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Instant telecom verification before you reply to an unfamiliar text, dating match, or missed call.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              title: "Enter Any Number",
              desc: "Paste an unfamiliar local or international number with its country code.",
            },
            {
              step: "02",
              title: "Live Carrier & Line Scan",
              desc: "We inspect telecom routing, network carrier, and VoIP vs. real SIM signals.",
            },
            {
              step: "03",
              title: "Unlock Full Report",
              desc: "Review instant risk signals and unlock deeper intelligence in seconds.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40"
            >
              <span className="inline-block text-xs font-bold tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-md px-2.5 py-1 mb-4">
                STEP {item.step}
              </span>
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {HOME_FAQS.map((item, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={item.q}
                className="rounded-xl border border-slate-800 bg-slate-900/70 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full flex items-center justify-between text-left px-5 py-4 font-semibold text-sm sm:text-base text-white hover:text-emerald-400 transition-colors"
                >
                  <span>{item.q}</span>
                  <span className="ml-4 text-emerald-400 text-lg">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-sm text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Latest Scam & Caller Safety Guides
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Learn how to spot fake numbers, VoIP burners, and catfish tactics.
            </p>
          </div>
          <Link
            href="/blog"
            className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            View all articles →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {BLOG_POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40"
            >
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                  {post.category}
                </span>
                <h3 className="text-base font-bold text-white mt-2 mb-2 group-hover:text-emerald-400 transition-colors line-clamp-3">
                  {post.title}
                </h3>
              </div>
              <span className="text-xs text-slate-400 mt-4">
                {post.readTime} →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}