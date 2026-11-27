"use client";

import { useState } from "react";
import Link from "next/link";
import { BLOG_POSTS } from "../data/blogPosts";

const HOME_FAQS = [
  {
    q: "How does NumoraLookup check an unknown phone number?",
    a: "NumoraLookup queries international telecommunications routing and carrier intelligence to identify the country prefix, network operator, and line type (mobile, landline, or virtual VoIP).",
  },
  {
    q: "Is my reverse phone lookup 100% anonymous?",
    a: "Yes. Searches are completely confidential, so the phone owner never receives a text, missed call, or alert.",
  },
  {
    q: "Can NumoraLookup detect VoIP burner numbers like Google Voice or TextNow?",
    a: "Yes. Line-type classification helps distinguish between standard wireless carrier lines and non-fixed VoIP numbers commonly used for disposable burner accounts.",
  },
  {
    q: "Which countries are supported?",
    a: "NumoraLookup supports E.164 international phone number lookups across 200+ countries and regions including the US, UK, Canada, Australia, and Europe.",
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
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-14 space-y-16 text-slate-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Interactive FAQ Accordion */}
      <section id="faq" className="relative max-w-3xl mx-auto animate-fade-up animate-fade-up-1 z-0">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-[#4d6fa9]/10 border border-[#8aa5d6]/30 px-3 py-1 text-xs font-medium text-[#8aa5d6] mb-3">
            Answers & Transparency
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {HOME_FAQS.map((item, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={item.q}
                className="rounded-xl border border-white/[0.09] bg-[#1b1d23]/70 overflow-hidden transition-all duration-200 hover:border-white/[0.12] numora-card"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full flex items-center justify-between text-left px-5 py-4 font-semibold text-sm sm:text-base text-white hover:text-[#8aa5d6] transition-colors"
                >
                  <span>{item.q}</span>
                  <span className="ml-4 text-[#8aa5d6] text-lg font-bold">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-sm text-zinc-400 leading-relaxed border-t border-white/[0.09] pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Latest Scam & Caller Safety Guides */}
      <section className="relative animate-fade-up animate-fade-up-1 z-0">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8aa5d6]">
              NumoraLookup Safety Hub
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Latest Scam & Caller Safety Guides
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Learn how to spot fake numbers, VoIP burners, and catfish tactics.
            </p>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#8aa5d6]/40 bg-[#4d6fa9]/10 px-4 py-2 text-sm font-semibold text-[#8aa5d6] hover:bg-[#4d6fa9] hover:text-slate-950 transition-all self-start sm:self-auto numora-btn"
          >
            View all articles →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {BLOG_POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group rounded-2xl border border-white/[0.09] bg-[#1b1d23]/60 p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-[#8aa5d6]/50 hover:shadow-xl hover:shadow-blue-950/30 numora-card"
            >
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8aa5d6]">
                  {post.category}
                </span>
                <h3 className="text-base font-bold text-white mt-2 mb-2 group-hover:text-[#8aa5d6] transition-colors line-clamp-3">
                  {post.title}
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-2">
                  {post.description}
                </p>
              </div>
              <span className="text-xs font-medium text-[#8aa5d6]/90 mt-4 group-hover:translate-x-1 transition-transform inline-block">
                {post.readTime} →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}