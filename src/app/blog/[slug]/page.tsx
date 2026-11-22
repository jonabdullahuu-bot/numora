import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_POSTS } from "../../../data/blogPosts";
import { SiteHeader, SiteFooter } from "../../../components/SiteChrome";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) return { title: "Article Not Found | Numora" };

  return {
    title: `${post.title} | Numora`,
    description: post.description,
    keywords: post.keywords,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishedAt,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) notFound();

  const relatedPosts = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    author: { "@type": "Organization", name: "Numora" },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-numora-grid text-slate-100">
      <SiteHeader />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 animate-fade-up">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />

        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 mb-8 pb-4 border-b border-slate-800/80">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-white transition-colors">
            Blog
          </Link>
          <span>/</span>
          <span className="text-emerald-400 truncate max-w-[200px] sm:max-w-xs">
            {post.category}
          </span>
        </div>

        <article className="animate-fade-up">
          <header className="mb-8">
            <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-400 mb-3">
              <span className="rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-emerald-400 font-medium">
                {post.category}
              </span>
              <span>{post.readTime}</span>
              <span>•</span>
              <time dateTime={post.publishedAt}>{post.publishedAt}</time>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight mb-4">
              {post.title}
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              {post.description}
            </p>
          </header>

          <div className="my-8 rounded-2xl border border-emerald-500/30 bg-slate-900/90 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 numora-card">
            <div>
              <p className="text-sm font-bold text-white">
                Want to check a suspicious phone number right now?
              </p>
              <p className="text-xs sm:text-sm text-slate-400">
                100% private carrier, country, and VoIP line check.
              </p>
            </div>
            <Link
              href="/"
              className="w-full sm:w-auto text-center rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-emerald-400 transition-all shrink-0 numora-btn"
            >
              Run Lookup →
            </Link>
          </div>

          <div className="space-y-8 text-slate-300 leading-relaxed text-base sm:text-[17px]">
            {post.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
                  {section.heading}
                </h2>
                <div className="space-y-4">
                  {section.body.map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {post.faqs.length > 0 && (
            <section className="mt-12 pt-8 border-t border-slate-800 animate-fade-up-1">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-5">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {post.faqs.map((faq) => (
                  <div
                    key={faq.question}
                    className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 numora-card"
                  >
                    <h3 className="font-semibold text-white mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-sm sm:text-base text-slate-400">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </article>

        <section className="mt-14 pt-8 border-t border-slate-800 animate-fade-up-1">
          <h2 className="text-lg font-bold text-white mb-4">Related Safety Guides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedPosts.map((rel) => (
              <Link
                key={rel.slug}
                href={`/blog/${rel.slug}`}
                className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 hover:border-emerald-500/40 transition-all numora-card"
              >
                <span className="text-xs text-emerald-400 font-medium">
                  {rel.category}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white mt-1">
                  {rel.title}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}